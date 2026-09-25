/**
 * The demo story, run against the compiled contract:
 *
 *   A DAO treasury agent sells 1.8M DAO in three TWAP slices to three market-maker agents
 *   via sealed RFQ. Every agent runs under a mandate its owner proposed and it accepted.
 *   Along the way the circuits reject a fat-finger quote (oracle band), an over-mandate
 *   quote, and a quote the maker can't fund. Finally the auditor verifies every trade with
 *   its viewing key.
 *
 * Each step yields a DeskEvent with the actor's private view and the ledger diff: exactly
 * what an observer of the chain would see.
 */
import {
  Auditor,
  MandateOwner,
  MarketMakerAgent,
  TreasurySellerAgent,
  fmtPrice,
  fmtQty,
  fmtUsd,
  type Fill,
} from './agents';
import { CircuitRejected, DeskLedger, diff, snapshot, type Desk, type Snapshot } from './desk';
import { randomBytes32, toHex, type SealedEnvelope } from './sealed-box';

export type Role = 'treasury' | 'maker' | 'owner' | 'oracle' | 'auditor';

export interface DeskEvent {
  step: number;
  phase: string;
  actor: string;
  role: Role;
  title: string;
  circuit?: string;
  status: 'ok' | 'rejected' | 'offchain';
  /** What the acting party knows. Never leaves its device. */
  privateView: string[];
  /** Values the transaction discloses on purpose, plus the ledger lines that changed: everything the market can see. */
  publicView: string[];
  /** On-chain transaction ids, when running against a deployed contract. */
  txIds?: string[];
}

export type EventInput = Omit<DeskEvent, 'step' | 'publicView'> & {
  /** Transaction inputs that are public by design (e.g. deposit amounts). */
  disclosed?: string[];
};

/** Turns steps into DeskEvents, diffing the public ledger before and after each one. */
export class EventRecorder {
  private step = 0;
  private before: Snapshot = {};

  constructor(
    private readonly desk: Desk,
    private readonly afterEach?: () => void,
  ) {}

  async start() {
    this.before = snapshot(await this.desk.readLedger());
  }

  async event({ disclosed = [], ...e }: EventInput): Promise<DeskEvent> {
    const after = snapshot(await this.desk.readLedger());
    const publicView = e.status === 'ok' ? [...disclosed.map((d) => `tx ${d}`), ...diff(this.before, after)] : [];
    this.before = after;
    this.afterEach?.();
    return { ...e, step: ++this.step, publicView };
  }
}

/** Runs `fn`; a CircuitRejected is returned instead of thrown. */
export const attempt = (fn: () => unknown): Promise<CircuitRejected | null> =>
  Promise.resolve()
    .then(fn)
    .then(() => null)
    .catch((err) => {
      if (err instanceof CircuitRejected) return err;
      throw err;
    });

export interface ScenarioResult {
  fills: Fill[];
  audits: { price: bigint; size: bigint; maker: string; ok: boolean }[];
  reputation: { name: string; quotes: bigint; fills: bigint }[];
}

export const usd = (dollars: number) => BigInt(Math.round(dollars * 1_000_000));

export const SCENARIO = {
  pair: 'DAO/USDC',
  totalSize: 1_800_000n,
  slices: 3,
  floor: usd(0.83),
  twap: [usd(0.842), usd(0.846), usd(0.846)],
  bandBps: 300n,
  treasuryMandate: { maxNotional: usd(560_000), minPrice: usd(0.8), maxPrice: usd(0.95) },
  makerMandate: { maxNotional: usd(600_000), minPrice: usd(0.78), maxPrice: usd(0.9) },
};

export async function* runScenario(): AsyncGenerator<DeskEvent, ScenarioResult> {
  const auditor = await new Auditor('Auditor').init();
  const oracleSecret = randomBytes32();
  const desk = new DeskLedger({
    adminSecret: oracleSecret,
    oraclePrice: SCENARIO.twap[0],
    oracleBandBps: SCENARIO.bandBps,
    auditorKey: auditor.fingerprint,
    time: 1_760_000_000,
  });
  const rec = new EventRecorder(desk, () => desk.advance(4));
  await rec.start();

  // ── Cast ──
  const dao = new MandateOwner('DAO multisig', desk);
  const treasury = await new TreasurySellerAgent('Treasury Seller', desk, SCENARIO.floor).init();
  const makers = await Promise.all([
    new MarketMakerAgent('Northwind MM', desk, 30n).init(),
    new MarketMakerAgent('Kestrel Liquidity', desk, 45n).init(),
    new MarketMakerAgent('Arcadia Flow', desk, 180n).init(),
  ]);
  const arcadia = makers[2];
  const nameOf = (pk: Uint8Array) => makers.find((m) => m.id === toHex(pk))?.name ?? 'maker';
  const mmDesks = makers.map((m) => new MandateOwner(`${m.name} desk head`, desk));

  yield await rec.event({
    phase: 'Setup',
    actor: 'Desk',
    role: 'oracle',
    title: 'Desk deployed with oracle TWAP and auditor viewing key',
    status: 'ok',
    privateView: [
      `Oracle TWAP ${fmtPrice(SCENARIO.twap[0])}, band ±${Number(SCENARIO.bandBps) / 100}%`,
      'Auditor registers the fingerprint of its viewing key',
    ],
    disclosed: [
      `oraclePrice = ${SCENARIO.twap[0]}`,
      `oracleBandBps = ${SCENARIO.bandBps}`,
      `auditorKey = ${toHex(auditor.fingerprint).slice(0, 6)}…`,
    ],
  });

  // ── Deposits: public amounts, private balances from here on ──
  await treasury.depositBase(SCENARIO.totalSize);
  yield await rec.event({
    phase: 'Setup',
    actor: treasury.name,
    role: 'treasury',
    title: `Treasury escrows ${fmtQty(SCENARIO.totalSize)} DAO`,
    circuit: 'depositBase',
    status: 'ok',
    privateView: [
      `Vault balance ${fmtQty(treasury.baseVault.balance)} DAO`,
      'Deposits are public (tokens enter in the clear). What’s left and what’s locked is not.',
    ],
    disclosed: [`amount = ${SCENARIO.totalSize} (deposit amounts are public)`],
  });

  const funding = [usd(1_100_000), usd(1_500_000), usd(900_000)];
  for (const [i, m] of makers.entries()) {
    await m.depositQuote(funding[i]);
    yield await rec.event({
      phase: 'Setup',
      actor: m.name,
      role: 'maker',
      title: `${m.name} funds its QUOTE vault`,
      circuit: 'depositQuote',
      status: 'ok',
      privateView: [`Vault balance ${fmtUsd(m.quoteVault.balance)} USDC`],
      disclosed: [`amount = ${funding[i]} (deposit amounts are public)`],
    });
  }

  // ── Mandates: owner proposes, agent accepts ──
  await dao.grant(treasury, SCENARIO.treasuryMandate);
  yield await rec.event({
    phase: 'Mandates',
    actor: dao.name,
    role: 'owner',
    title: 'DAO multisig sets the Treasury agent’s mandate',
    circuit: 'proposeMandate → acceptMandate',
    status: 'ok',
    privateView: [
      'Max notional per order $560,000',
      'Price band $0.80 – $0.95',
      'The owner proposes, the agent accepts by proving it holds the opening',
      'Only the commitment is published; the agent proves every order against it',
    ],
  });
  for (const [i, m] of makers.entries()) {
    await mmDesks[i].grant(m, SCENARIO.makerMandate);
    yield await rec.event({
      phase: 'Mandates',
      actor: mmDesks[i].name,
      role: 'owner',
      title: `Mandate set for ${m.name}`,
      circuit: 'proposeMandate → acceptMandate',
      status: 'ok',
      privateView: ['Max notional per order $600,000', 'Price band $0.78 – $0.90'],
    });
  }

  // ── TWAP slices ──
  const sliceSize = SCENARIO.totalSize / BigInt(SCENARIO.slices);
  const fills: Fill[] = [];

  for (let s = 0; s < SCENARIO.slices; s++) {
    const phase = `Slice ${s + 1} of ${SCENARIO.slices}`;

    if (s > 0 && SCENARIO.twap[s] !== desk.ledger.oraclePrice) {
      await desk.call(oracleSecret, 'postOraclePrice', SCENARIO.twap[s]);
      yield await rec.event({
        phase,
        actor: 'Oracle',
        role: 'oracle',
        title: `Oracle posts new TWAP ${fmtPrice(SCENARIO.twap[s])}`,
        circuit: 'postOraclePrice',
        status: 'ok',
        privateView: ['Public by design: the band every price is proven against'],
      });
    }

    const rfq = await treasury.openRfq(sliceSize);
    yield await rec.event({
      phase,
      actor: treasury.name,
      role: 'treasury',
      title: 'Sealed RFQ opened',
      circuit: 'openRfq',
      status: 'ok',
      privateView: [
        `Selling ${fmtQty(sliceSize)} DAO; private floor ${fmtPrice(treasury.floorPrice)}`,
        `IOI sent point-to-point to ${makers.map((m) => m.name).join(', ')}`,
        'On-chain: an id and a commitment to the requester. No side, size or price.',
      ],
    });

    // Guarantees, each shown once.
    if (s === 0) {
      const err = await attempt(() => arcadia.quote(rfq.request, { price: usd(0.8842) }));
      yield await rec.event({
        phase,
        actor: arcadia.name,
        role: 'maker',
        title: 'Fat-finger quote at $0.8842 blocked by the oracle band',
        circuit: 'submitQuote',
        status: 'rejected',
        privateView: [
          'Agent bug: typed 0.8842 instead of 0.8242, inside its mandate but 5% over the TWAP',
          `Circuit: ${err?.reason ?? 'accepted?!'}`,
          'No proof exists, so no transaction exists. Nothing reaches the chain.',
        ],
      });
    }
    if (s === 1) {
      const err = await attempt(() => arcadia.quote(rfq.request, { price: usd(0.905) }));
      yield await rec.event({
        phase,
        actor: arcadia.name,
        role: 'maker',
        title: 'Aggressive $0.905 bid blocked by its own mandate',
        circuit: 'submitQuote',
        status: 'rejected',
        privateView: [
          'Agent tries to outbid everyone above its owner’s $0.90 ceiling',
          `Circuit: ${err?.reason ?? 'accepted?!'}`,
        ],
      });
    }

    const envelopes: SealedEnvelope[] = [];
    for (const m of makers) {
      const bid = await m.bidPrice();
      let env: SealedEnvelope | undefined;
      const err = await attempt(async () => {
        env = await m.quote(rfq.request);
      });
      if (env) envelopes.push(env);
      yield await rec.event({
        phase,
        actor: m.name,
        role: 'maker',
        title: err ? `${m.name} can’t back a quote: proof of funds fails` : `${m.name} posts a sealed, escrowed quote`,
        circuit: 'submitQuote',
        status: err ? 'rejected' : 'ok',
        privateView: err
          ? [
              `Wanted ${fmtPrice(bid)} × ${fmtQty(sliceSize)} = ${fmtUsd(bid * sliceSize)}`,
              `Vault holds ${fmtUsd(m.quoteVault.balance)}`,
              `Circuit: ${err.reason}`,
            ]
          : [
              `Bid ${fmtPrice(bid)} × ${fmtQty(sliceSize)} DAO`,
              `Escrowed ${fmtUsd(bid * sliceSize)}; vault now ${fmtUsd(m.quoteVault.balance)}`,
              'Quote opening encrypted to the Treasury agent',
            ],
      });
    }

    const opened = await treasury.readQuotes(rfq, envelopes);
    const best = treasury.choose(opened);
    yield await rec.event({
      phase,
      actor: treasury.name,
      role: 'treasury',
      title: 'Treasury decrypts quotes, checks them against the chain, picks the best',
      status: 'offchain',
      privateView: opened.map(
        (q) =>
          `${nameOf(q.maker)}: ${fmtPrice(q.terms.price)}${
            q.terms.price < treasury.floorPrice ? ' (below floor)' : q === best ? ' ← best' : ''
          }`,
      ),
    });

    if (!best) {
      await treasury.closeRfq(rfq);
      yield await rec.event({
        phase,
        actor: treasury.name,
        role: 'treasury',
        title: 'No quote clears the floor; RFQ closed',
        circuit: 'closeRfq',
        status: 'ok',
        privateView: [],
      });
    } else {
      const fill = await treasury.accept(rfq, best, auditor.box.publicKey);
      fills.push(fill);
      yield await rec.event({
        phase,
        actor: treasury.name,
        role: 'treasury',
        title: `Match proven and settled at the maker’s price`,
        circuit: 'acceptQuote',
        status: 'ok',
        privateView: [
          `Sold ${fmtQty(best.terms.size)} DAO to ${nameOf(best.maker)} at ${fmtPrice(best.terms.price)}`,
          `Proven: quote ≥ floor, mandate, oracle band, funds`,
          'Receipt opening sealed to the auditor’s viewing key',
        ],
      });
    }

    for (const m of makers) {
      const outcome = await m.settle(rfq.rfqId);
      if (outcome === 'none') continue;
      yield await rec.event({
        phase,
        actor: m.name,
        role: 'maker',
        title: outcome === 'claimed' ? `${m.name} claims its DAO` : `${m.name} releases its escrow`,
        circuit: outcome === 'claimed' ? 'claimFill' : 'cancelQuote',
        status: 'ok',
        privateView:
          outcome === 'claimed'
            ? [`BASE vault ${fmtQty(m.baseVault.balance)} DAO`]
            : [`QUOTE vault back to ${fmtUsd(m.quoteVault.balance)}`],
      });
    }
  }

  // ── Audit ──
  const audits: ScenarioResult['audits'] = [];
  for (const f of fills) {
    const r = await auditor.verify(desk, f.receiptEnvelope);
    audits.push({ price: r.receipt.price, size: r.receipt.size, maker: nameOf(r.receipt.maker), ok: r.matchesLedger });
  }
  yield await rec.event(auditEvent(auditor.name, audits));

  const l = desk.ledger;
  const reputation = makers.map((m) => ({
    name: m.name,
    quotes: l.quotesPosted.member(m.publicKey) ? l.quotesPosted.lookup(m.publicKey) : 0n,
    fills: l.fillsSettled.member(m.publicKey) ? l.fillsSettled.lookup(m.publicKey) : 0n,
  }));
  return { fills, audits, reputation };
}

export function auditEvent(actor: string, audits: ScenarioResult['audits']): EventInput {
  const sold = audits.reduce((a, x) => a + x.size, 0n);
  const proceeds = audits.reduce((a, x) => a + x.size * x.price, 0n);
  return {
    phase: 'Audit',
    actor,
    role: 'auditor',
    title: 'Auditor verifies every receipt with its viewing key',
    status: 'offchain',
    privateView: [
      ...audits.map((a) => `${a.ok ? '✓' : '✕'} ${fmtQty(a.size)} DAO → ${a.maker} at ${fmtPrice(a.price)}`),
      `Sold ${fmtQty(sold)} DAO for ${fmtUsd(proceeds)} (VWAP ${fmtPrice(sold ? proceeds / sold : 0n)})`,
      'The auditor sees the trades, not the strategy: floors and mandates stay private',
    ],
  };
}
