import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CircuitRejected, DeskLedger, pureCircuits, type Mandate } from '../src/protocol/desk';
import { Auditor, MandateOwner, MarketMakerAgent, TreasurySellerAgent, type QuoteOpening } from '../src/protocol/agents';
import { open, randomBytes32, seal, toHex } from '../src/protocol/sealed-box';
import { runScenario } from '../src/protocol/scenario';

/**
 * Private OTC Agent Desk: sealed RFQ protocol.
 *
 * These tests execute the circuits emitted by the Compact compiler for
 * contracts/private-otc-desk.compact (every assert is the real one), against real
 * ledger state, via @midnight-ntwrk/compact-runtime.
 *
 *  a) Circuit logic: sealed quote → match proof → settlement at the maker's price
 *  b) State transitions: vault commitments, escrow lock/release, RFQ lifecycle, reputation
 *  c) Privacy: no price, size, floor or balance ever appears in the public ledger/transcript
 *  d) Constraint enforcement: floor, ownership, funds, mandate, oracle band, expiry, replay
 *  e) Selective disclosure: auditor verifies receipts with its viewing key
 *  f) End-to-end: Treasury Seller vs three Market Makers
 *  g) Hardening: untrusted quote envelopes, malformed ciphertexts
 */

const p = (usd: number) => BigInt(Math.round(usd * 1_000_000));
const TWAP = p(0.842);
const MM_MANDATE: Mandate = { maxNotional: p(600_000), minPrice: p(0.78), maxPrice: p(0.9) };
const TREASURY_MANDATE: Mandate = { maxNotional: p(560_000), minPrice: p(0.8), maxPrice: p(0.95) };

async function setup() {
  const auditor = await new Auditor('auditor').init();
  const oracle = randomBytes32();
  const desk = new DeskLedger({
    adminSecret: oracle,
    oraclePrice: TWAP,
    oracleBandBps: 300n,
    auditorKey: auditor.fingerprint,
    time: 1_760_000_000,
  });
  const dao = new MandateOwner('dao', desk);
  const mmOwner = new MandateOwner('mm-owner', desk);
  const treasury = await new TreasurySellerAgent('treasury', desk, p(0.83)).init();
  const mm = await new MarketMakerAgent('mm', desk, 30n).init();
  const mm2 = await new MarketMakerAgent('mm2', desk, 45n).init();
  await treasury.depositBase(1_000_000n);
  await mm.depositQuote(p(1_000_000));
  await mm2.depositQuote(p(1_000_000));
  await dao.grant(treasury, TREASURY_MANDATE);
  await mmOwner.grant(mm, MM_MANDATE);
  await mmOwner.grant(mm2, MM_MANDATE);
  return { desk, auditor, oracle, dao, mmOwner, treasury, mm, mm2 };
}

type Ctx = Awaited<ReturnType<typeof setup>>;

async function quoteRound(ctx: Ctx, size = 500_000n) {
  const rfq = await ctx.treasury.openRfq(size);
  const env = await ctx.mm.quote(rfq.request);
  const [opening] = await ctx.treasury.readQuotes(rfq, [env]);
  return { rfq, opening };
}

/** Everything a chain observer could collect: every ledger value plus every public transcript op. */
function collectPublic(value: unknown, out: unknown[] = []): unknown[] {
  if (value instanceof Uint8Array || typeof value === 'bigint' || typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectPublic(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectPublic(v, out));
  return out;
}

const rejectsWith = (p: Promise<unknown>, pattern: RegExp) =>
  assert.rejects(p, (err: unknown) => err instanceof CircuitRejected && pattern.test(err.reason));

describe('Private OTC Agent Desk: sealed RFQ protocol (compiled Compact circuits)', () => {
  test('a) Circuit logic: taker proves quote ≥ private floor and settles at the maker’s quote', async () => {
    const ctx = await setup();
    const { rfq, opening } = await quoteRound(ctx);
    assert.equal(opening.terms.price, (TWAP * 9970n) / 10000n, 'maker bids 30 bps under TWAP');

    const fill = await ctx.treasury.accept(rfq, opening, ctx.auditor.box.publicKey);
    assert.equal(fill.terms.price, opening.terms.price, 'clearing price = maker quote');
    assert.equal(ctx.treasury.baseVault.balance, 500_000n);
    assert.equal(ctx.treasury.quoteVault.balance, opening.terms.price * 500_000n);
    assert.equal(ctx.desk.ledger.tradesSettled, 1n);

    assert.equal(await ctx.mm.settle(rfq.rfqId), 'claimed');
    assert.equal(ctx.mm.baseVault.balance, 500_000n);
  });

  test('b) State transitions: escrow locks at quote time and is released for losing makers', async () => {
    const ctx = await setup();
    const rfq = await ctx.treasury.openRfq(500_000n);
    assert.ok(ctx.desk.ledger.rfqs.member(rfq.rfqId));

    const vaultBefore = ctx.desk.ledger.quoteVaults.lookup(ctx.mm2.publicKey);
    const envs = [await ctx.mm.quote(rfq.request), await ctx.mm2.quote(rfq.request)];
    const mm2Price = (TWAP * 9955n) / 10000n;
    assert.equal(ctx.mm2.quoteVault.balance, p(1_000_000) - mm2Price * 500_000n, 'escrow locked');
    assert.notDeepEqual(ctx.desk.ledger.quoteVaults.lookup(ctx.mm2.publicKey), vaultBefore, 'vault commitment rotated');

    // Quotes are firm while the RFQ is open.
    await rejectsWith(ctx.mm2.settle(rfq.rfqId), /firm while the RFQ is open/);

    const quotes = await ctx.treasury.readQuotes(rfq, envs);
    const best = ctx.treasury.choose(quotes)!;
    assert.equal(toHex(best.maker), ctx.mm.id);
    await ctx.treasury.accept(rfq, best, ctx.auditor.box.publicKey);
    assert.equal(ctx.desk.ledger.rfqs.member(rfq.rfqId), false, 'RFQ closed by the fill');

    assert.equal(await ctx.mm2.settle(rfq.rfqId), 'cancelled');
    assert.equal(ctx.mm2.quoteVault.balance, p(1_000_000), 'escrow released in full');
    assert.equal(await ctx.mm.settle(rfq.rfqId), 'claimed');

    // Reputation comes from protocol history, not from the agent.
    const l = ctx.desk.ledger;
    assert.equal(l.quotesPosted.lookup(ctx.mm.publicKey), 1n);
    assert.equal(l.quotesPosted.lookup(ctx.mm2.publicKey), 1n);
    assert.equal(l.fillsSettled.lookup(ctx.mm.publicKey), 1n);
    assert.equal(l.fillsSettled.member(ctx.mm2.publicKey), false);
  });

  test('c) Privacy: prices, sizes, floors and balances never reach the public ledger or transcript', async () => {
    const ctx = await setup();
    const rfq = await ctx.treasury.openRfq(500_000n);
    const quoteRes = await captureTranscripts(ctx, () => ctx.mm.quote(rfq.request));
    const [opening] = await ctx.treasury.readQuotes(rfq, [quoteRes.result]);
    const acceptRes = await captureTranscripts(ctx, () => ctx.treasury.accept(rfq, opening, ctx.auditor.box.publicKey));
    assert.equal(quoteRes.transcripts.length + acceptRes.transcripts.length, 4, 'one transcript per circuit call');

    const secrets = [
      opening.terms.price,
      opening.terms.size,
      opening.terms.price * opening.terms.size,
      ctx.treasury.floorPrice,
      ctx.treasury.baseVault.balance,
      ctx.mm.quoteVault.balance,
      TREASURY_MANDATE.maxNotional,
      MM_MANDATE.maxPrice,
    ];
    const l = ctx.desk.ledger;
    const ledgerValues = collectPublic(
      ['baseVaults', 'quoteVaults', 'mandates', 'pendingMandates', 'rfqs', 'quotes', 'receipts'].flatMap((m) => [...(l as any)[m]]),
    );
    const transcripts = collectPublic([...quoteRes.transcripts, ...acceptRes.transcripts]);
    // Positive control: the oracle TWAP is read inside both circuits, so it is in the transcript.
    assert.ok(leaks(transcripts, TWAP), 'leak detector finds a value that really is public');
    for (const s of secrets) {
      assert.ok(!leaks(ledgerValues, s), `ledger leaks ${s}`);
      assert.ok(!leaks(transcripts, s), `public transcript leaks ${s}`);
    }
    // The only numbers on the ledger are public-by-design parameters and counters.
    assert.equal(l.oraclePrice, TWAP);
    assert.equal(l.tradesSettled, 1n);
  });

  test('d) Constraint enforcement: no valid proof exists for a bad trade', async () => {
    const ctx = await setup();

    // Quote below the taker's private floor.
    {
      const rfq = await ctx.treasury.openRfq(100_000n);
      const env = await ctx.mm2.quote(rfq.request, { price: p(0.82) });
      const [q] = await ctx.treasury.readQuotes(rfq, [env]);
      await rejectsWith(ctx.treasury.accept(rfq, q, ctx.auditor.box.publicKey), /below the taker's private floor/);
    }
    // Only the RFQ requester can accept; a forged opening doesn't match the sealed quote.
    {
      const { rfq, opening } = await quoteRound(ctx, 100_000n);
      const thief = await new TreasurySellerAgent('thief', ctx.desk, 0n).init();
      await thief.depositBase(100_000n);
      await new MandateOwner('thief-owner', ctx.desk).grant(thief, TREASURY_MANDATE);
      await rejectsWith(thief.accept(rfq, opening, ctx.auditor.box.publicKey), /Only the RFQ requester/);
      const forged: QuoteOpening = { ...opening, terms: { ...opening.terms, price: p(0.9) } };
      await rejectsWith(ctx.treasury.accept(rfq, forged, ctx.auditor.box.publicKey), /does not match the sealed quote/);
      await ctx.treasury.accept(rfq, opening, ctx.auditor.box.publicKey);
      // A second fill of the same RFQ is impossible.
      await rejectsWith(ctx.treasury.accept(rfq, opening, ctx.auditor.box.publicKey), /RFQ is not open/);
    }
    // Proof of funds: a maker can't quote more than its vault holds…
    {
      const rfq = await ctx.treasury.openRfq(950_000n);
      const poor = await new MarketMakerAgent('poor', ctx.desk, 30n).init();
      await poor.depositQuote(p(100_000));
      await ctx.mmOwner.grant(poor, { ...MM_MANDATE, maxNotional: p(10_000_000) });
      await rejectsWith(poor.quote(rfq.request), /Insufficient QUOTE funds/);
      // …and a taker can't sell more than it escrowed (it has 900k DAO left).
      await ctx.mmOwner.grant(ctx.mm2, { ...MM_MANDATE, maxNotional: p(10_000_000) });
      const env = await ctx.mm2.quote(rfq.request, { price: p(0.84) });
      const [q] = await ctx.treasury.readQuotes(rfq, [env]);
      await ctx.dao.grant(ctx.treasury, { ...TREASURY_MANDATE, maxNotional: p(10_000_000) });
      await rejectsWith(ctx.treasury.accept(rfq, q, ctx.auditor.box.publicKey), /Insufficient BASE funds/);
    }
  });

  test('d) Mandates: agents cannot trade outside the policy their owner committed to', async () => {
    const ctx = await setup();
    const rfq = await ctx.treasury.openRfq(800_000n);
    // 800k × ~0.84 ≈ $672k > $600k maker mandate.
    await rejectsWith(ctx.mm.quote(rfq.request), /exceeds the mandate limit/);
    await rejectsWith(ctx.mm.quote(rfq.request, { size: 100_000n, price: p(0.905) }), /above the mandate ceiling/);

    // Revoked mandate: the agent is locked out immediately.
    await ctx.mmOwner.revoke(ctx.mm);
    await rejectsWith(ctx.mm.quote(rfq.request, { size: 100_000n }), /no active mandate/);

    // A tampered mandate opening doesn't match the owner's commitment.
    ctx.mm2.mandate = { ...ctx.mm2.mandate!, mandate: { ...MM_MANDATE, maxNotional: p(10_000_000) } };
    await rejectsWith(ctx.mm2.quote(rfq.request), /Mandate opening does not match/);

    // Only the owner can revoke or replace a mandate.
    await rejectsWith(ctx.dao.revoke(ctx.mm2), /Only the mandate owner/);
    await rejectsWith(ctx.dao.propose(ctx.mm2, MM_MANDATE), /Only the mandate owner can replace it/);
  });

  test('d) Mandates are two-step: a squatter cannot bind or block an agent', async () => {
    const ctx = await setup();
    const agent = await new MarketMakerAgent('fresh', ctx.desk, 30n).init();
    const squatter = new MandateOwner('squatter', ctx.desk);
    const owner = new MandateOwner('real-owner', ctx.desk);

    // The squatter proposes first, but the agent never accepts it, so nothing is bound.
    await squatter.propose(agent, { ...MM_MANDATE, maxNotional: p(1) });
    assert.equal(ctx.desk.ledger.mandateOwners.member(agent.publicKey), false);

    // The real owner's proposal lives beside it and is accepted normally.
    await owner.grant(agent, MM_MANDATE);
    assert.equal(toHex(ctx.desk.ledger.mandateOwners.lookup(agent.publicKey)), owner.id);

    // The agent can't accept a mandate it wasn't given the opening for…
    const forgedGrant = { owner: squatter.publicKey, mandate: MM_MANDATE, salt: randomBytes32() };
    await rejectsWith(agent.acceptMandate(forgedGrant), /does not match the proposal/);
    // …nor switch owners once bound, even if it colludes with the squatter.
    const g = await squatter.propose(agent, MM_MANDATE).catch((e) => e);
    assert.ok(g instanceof CircuitRejected && /Only the mandate owner/.test(g.reason));
  });

  test('d) Oracle band: prices outside ±band of the TWAP are unprovable, and only the oracle key can move it', async () => {
    const ctx = await setup();
    const rfq = await ctx.treasury.openRfq(100_000n);
    await rejectsWith(ctx.mm.quote(rfq.request, { price: p(0.8842) }), /above the oracle band/);
    await rejectsWith(ctx.mm.quote(rfq.request, { price: p(0.8) }), /below the oracle band/);

    await rejectsWith(ctx.desk.call(ctx.mm.secretKey, 'postOraclePrice', p(0.8)), /Only the oracle key/);
    await ctx.desk.call(ctx.oracle, 'postOraclePrice', p(0.82));
    await ctx.mm.quote(rfq.request, { price: p(0.8) }); // now inside the band
  });

  test('d) Expiry: quotes can’t be posted or accepted after the RFQ expires; escrow is then released', async () => {
    const ctx = await setup();
    const { rfq, opening } = await quoteRound(ctx, 100_000n);
    ctx.desk.advance(301);
    await rejectsWith(ctx.mm2.quote(rfq.request), /RFQ has expired/);
    await rejectsWith(ctx.treasury.accept(rfq, opening, ctx.auditor.box.publicKey), /RFQ has expired/);
    assert.equal(await ctx.mm.settle(rfq.rfqId), 'cancelled');
    assert.equal(ctx.mm.quoteVault.balance, p(1_000_000));

    // An RFQ can't be opened already expired.
    await rejectsWith(ctx.desk.call(ctx.treasury.secretKey, 'openRfq', randomBytes32(), randomBytes32(), BigInt(ctx.desk.now() - 1)), /in the future/);
  });

  test('d) RFQ ids are single-use: a filled or closed RFQ cannot be reopened to overwrite its receipt', async () => {
    const ctx = await setup();
    const { rfq, opening } = await quoteRound(ctx, 100_000n);
    await ctx.treasury.accept(rfq, opening, ctx.auditor.box.publicKey);
    const receipt = toHex(ctx.desk.ledger.receipts.lookup(rfq.rfqId));

    const attacker = new MandateOwner('attacker', ctx.desk);
    const expiry = BigInt(ctx.desk.now() + 300);
    await rejectsWith(ctx.desk.call(attacker.secretKey, 'openRfq', rfq.rfqId, randomBytes32(), expiry), /RFQ id already used/);
    assert.equal(toHex(ctx.desk.ledger.receipts.lookup(rfq.rfqId)), receipt, 'receipt untouched');

    const closed = await ctx.treasury.openRfq(100_000n);
    await ctx.treasury.closeRfq(closed);
    await rejectsWith(ctx.desk.call(attacker.secretKey, 'openRfq', closed.rfqId, randomBytes32(), expiry), /RFQ id already used/);
  });

  test('e) Selective disclosure: the auditor opens receipts with its viewing key and matches them on-chain', async () => {
    const ctx = await setup();
    const { rfq, opening } = await quoteRound(ctx);
    const fill = await ctx.treasury.accept(rfq, opening, ctx.auditor.box.publicKey);

    const audit = await ctx.auditor.verify(ctx.desk, fill.receiptEnvelope);
    assert.equal(audit.matchesLedger, true);
    assert.equal(audit.receipt.price, opening.terms.price);
    assert.equal(audit.receipt.size, 500_000n);
    assert.equal(toHex(audit.receipt.maker), ctx.mm.id);

    // Someone else's key can't read it, and a tampered receipt doesn't match the ledger.
    const outsider = await new Auditor('outsider').init();
    await assert.rejects(outsider.verify(ctx.desk, fill.receiptEnvelope));
    const tampered = pureCircuits.receiptCommitment({ ...audit.receipt, price: audit.receipt.price + 1n }, randomBytes32());
    assert.notEqual(toHex(tampered), toHex(ctx.desk.ledger.receipts.lookup(rfq.rfqId)));

    // Sealing to a key that isn't the registered auditor is refused.
    const { rfq: rfq2, opening: o2 } = await quoteRound(ctx, 100_000n);
    await assert.rejects(ctx.treasury.accept(rfq2, o2, outsider.box.publicKey), /does not match the auditor/);
  });

  test('f) End-to-end: Treasury Seller sells 1.8M DAO to three Market Makers via sealed RFQ', async () => {
    const gen = runScenario();
    const events = [];
    let next = await gen.next();
    while (!next.done) {
      events.push(next.value);
      next = await gen.next();
    }
    const result = next.value;

    assert.equal(result.fills.length, 3);
    assert.ok(result.audits.every((a) => a.ok), 'every receipt verifies against the ledger');
    assert.equal(result.audits.reduce((a, x) => a + x.size, 0n), 1_800_000n);

    const rejected = events.filter((e) => e.status === 'rejected').map((e) => e.privateView.join(' '));
    assert.equal(rejected.length, 3);
    assert.match(rejected[0], /oracle band/);
    assert.match(rejected[1], /mandate ceiling/);
    assert.match(rejected[2], /Insufficient QUOTE funds/);
    for (const e of events.filter((x) => x.status === 'rejected')) assert.deepEqual(e.publicView, []);

    const byName = Object.fromEntries(result.reputation.map((r) => [r.name, r]));
    assert.equal(byName['Northwind MM'].fills, 2n);
    assert.equal(byName['Kestrel Liquidity'].fills, 1n);
    assert.equal(byName['Arcadia Flow'].fills, 0n);
  });

  test('g) Hardening: the taker ignores quote envelopes that don’t match what the maker committed on-chain', async () => {
    const ctx = await setup();
    const rfq = await ctx.treasury.openRfq(100_000n);
    const honest = await ctx.mm.quote(rfq.request);

    // A maker who committed to $0.8395 sends the taker a flattering $0.89 opening.
    const env2 = await ctx.mm2.quote(rfq.request);
    const [real] = await ctx.treasury.readQuotes(rfq, [env2]);
    const lie = await seal<QuoteOpening>(ctx.treasury.box.publicKey, { ...real, terms: { ...real.terms, price: p(0.89) } });
    // Garbage, a quote for another RFQ, and an envelope for someone else are dropped too.
    const otherRfq = await ctx.treasury.openRfq(100_000n);
    const wrongRfq = await ctx.mm2.quote(otherRfq.request);
    const notForUs = await seal(ctx.mm.box.publicKey, real);
    const garbage = { ephemeralKey: new Uint8Array(3), iv: new Uint8Array(12), ciphertext: new Uint8Array(4) };

    const accepted = await ctx.treasury.readQuotes(rfq, [honest, lie, wrongRfq, notForUs, garbage as any]);
    assert.equal(accepted.length, 1);
    assert.equal(toHex(accepted[0].maker), ctx.mm.id);
  });

  test('g) Hardening: sealed envelopes reject tampering and wrong recipients', async () => {
    const alice = await new Auditor('alice').init();
    const env = await seal(alice.box.publicKey, { x: 1n, y: new Uint8Array([1, 2]) });
    const back = await open<{ x: bigint; y: Uint8Array }>(alice.box, env);
    assert.equal(back.x, 1n);
    assert.deepEqual([...back.y], [1, 2]);

    const flipped = new Uint8Array(env.ciphertext);
    flipped[0] ^= 1;
    await assert.rejects(open(alice.box, { ...env, ciphertext: flipped }));
    await assert.rejects(open(alice.box, { ...env, iv: new Uint8Array(4) }), /Malformed/);
  });
});

/** Records the public transcript (what the verifier and chain see) of every circuit run inside `fn`. */
async function captureTranscripts<T>(ctx: Ctx, fn: () => Promise<T>) {
  const transcripts: unknown[] = [];
  const original = ctx.desk.run.bind(ctx.desk);
  (ctx.desk as any).run = (...args: any[]) => {
    const res = (original as any)(...args);
    transcripts.push(res.proofData.publicTranscript, res.proofData.output);
    return res;
  };
  try {
    return { result: await fn(), transcripts };
  } finally {
    (ctx.desk as any).run = original;
  }
}

/** Little-endian byte encoding with trailing zeros trimmed, as the runtime encodes Uint values. */
const leBytes = (n: bigint) => {
  const out: number[] = [];
  for (let x = n; x > 0n; x >>= 8n) out.push(Number(x & 0xffn));
  return Uint8Array.from(out);
};

const containsBytes = (hay: Uint8Array, needle: Uint8Array) => {
  outer: for (let i = 0; i + needle.length <= hay.length; i++) {
    for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
};

/** True if `secret` appears anywhere in `values`, as a number or inside any byte string. */
const leaks = (values: unknown[], secret: bigint) => {
  const enc = leBytes(secret);
  return values.some((v) => v === secret || (v instanceof Uint8Array && containsBytes(v, enc)));
};
