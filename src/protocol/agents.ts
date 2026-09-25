/**
 * Reference agents that trade on the desk. Each keeps its own private state (secret key,
 * vault openings, mandate, quote openings) and only ever hands the contract commitments.
 *
 *  - TreasurySellerAgent: a DAO selling a block of BASE via sealed RFQs, TWAP-sliced,
 *    under a mandate, with a private floor price.
 *  - MarketMakerAgent: answers RFQs with sealed, escrowed quotes priced off the oracle.
 *  - Auditor: holds the viewing key; verifies receipts against the ledger after the fact.
 *
 * Agents program against the `Desk` interface, so the same code runs against the local
 * simulator (`DeskLedger`) and a contract deployed on Midnight (`OnChainDesk`).
 */
import { pureCircuits, type Desk, type Mandate, type QuoteTerms, type Receipt } from './desk';
import { generateBoxKeyPair, keyFingerprint, open, randomBytes32, seal, toHex, type BoxKeyPair, type SealedEnvelope } from './sealed-box';

/** Prices are QUOTE micro-units (6 decimals) per whole BASE token. */
export const PRICE_SCALE = 1_000_000n;
export const BPS = 10_000n;
const U64_MAX = (1n << 64n) - 1n;

export const fmtPrice = (p: bigint) => `$${(Number(p) / Number(PRICE_SCALE)).toFixed(4)}`;
export const fmtUsd = (micro: bigint) =>
  `$${(Number(micro) / Number(PRICE_SCALE)).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
export const fmtQty = (n: bigint) => Number(n).toLocaleString('en-US');

const ZERO = new Uint8Array(32);
const sameBytes = (a: Uint8Array, b: Uint8Array) => toHex(a) === toHex(b);
const isU64 = (v: unknown): v is bigint => typeof v === 'bigint' && v >= 0n && v <= U64_MAX;
const isBytes32 = (v: unknown): v is Uint8Array => v instanceof Uint8Array && v.length === 32;

interface Opening {
  balance: bigint;
  salt: Uint8Array;
}

export class Party {
  readonly secretKey = randomBytes32();
  readonly publicKey = pureCircuits.publicKey(this.secretKey);
  /** Private openings of this party's on-chain vault commitments. */
  baseVault: Opening = { balance: 0n, salt: ZERO };
  quoteVault: Opening = { balance: 0n, salt: ZERO };

  constructor(
    readonly name: string,
    protected readonly desk: Desk,
  ) {}

  get id() {
    return toHex(this.publicKey);
  }

  async depositBase(amount: bigint) {
    const salt = randomBytes32();
    await this.desk.call(this.secretKey, 'depositBase', amount, this.baseVault.balance, this.baseVault.salt, salt);
    this.baseVault = { balance: this.baseVault.balance + amount, salt };
  }

  async depositQuote(amount: bigint) {
    const salt = randomBytes32();
    await this.desk.call(this.secretKey, 'depositQuote', amount, this.quoteVault.balance, this.quoteVault.salt, salt);
    this.quoteVault = { balance: this.quoteVault.balance + amount, salt };
  }
}

export interface MandateGrant {
  owner: Uint8Array;
  mandate: Mandate;
  salt: Uint8Array;
}

/** Whoever controls an agent's funds (DAO multisig, MM desk head). */
export class MandateOwner extends Party {
  /** Step 1: propose. Returns the opening, which is handed to the agent privately. */
  async propose(agent: Agent, mandate: Mandate): Promise<MandateGrant> {
    const salt = randomBytes32();
    await this.desk.call(this.secretKey, 'proposeMandate', agent.publicKey, pureCircuits.mandateCommitment(mandate, salt));
    return { owner: this.publicKey, mandate, salt };
  }

  /** Propose and have the agent accept: the usual two-transaction setup. */
  async grant(agent: Agent, mandate: Mandate): Promise<MandateGrant> {
    const g = await this.propose(agent, mandate);
    await agent.acceptMandate(g);
    return g;
  }

  async revoke(agent: Agent) {
    await this.desk.call(this.secretKey, 'revokeMandate', agent.publicKey);
  }
}

export class Agent extends Party {
  mandate?: MandateGrant;
  box!: BoxKeyPair;

  async init() {
    this.box = await generateBoxKeyPair();
    return this;
  }

  /** Step 2: accept a mandate the owner proposed, proving this agent holds its opening. */
  async acceptMandate(g: MandateGrant) {
    await this.desk.call(this.secretKey, 'acceptMandate', g.owner, g.mandate, g.salt);
    this.mandate = g;
  }

  protected requireMandate(): MandateGrant {
    if (!this.mandate) throw new Error(`${this.name} has no mandate`);
    return this.mandate;
  }
}

/* ───────────── RFQ messages (off-chain, point to point) ───────────── */

/** Indication of interest sent privately to the makers the taker chose. */
export interface RfqRequest {
  rfqId: Uint8Array;
  size: bigint;
  expiresAt: bigint;
  replyTo: Uint8Array;
}

export interface QuoteOpening {
  rfqId: Uint8Array;
  maker: Uint8Array;
  terms: QuoteTerms;
  termsSalt: Uint8Array;
}

export interface ReceiptOpening {
  receipt: Receipt;
  salt: Uint8Array;
}

export class MarketMakerAgent extends Agent {
  private openQuotes = new Map<string, QuoteOpening>();

  constructor(
    name: string,
    desk: Desk,
    /** How far under the oracle TWAP this maker bids. */
    readonly spreadBps: bigint,
  ) {
    super(name, desk);
  }

  /** Price this maker would bid right now. */
  async bidPrice(): Promise<bigint> {
    const { oraclePrice } = await this.desk.readLedger();
    return (oraclePrice * (BPS - this.spreadBps)) / BPS;
  }

  /** Posts an escrowed, sealed quote and returns its opening encrypted to the taker. */
  async quote(req: RfqRequest, override?: Partial<QuoteTerms>): Promise<SealedEnvelope> {
    const m = this.requireMandate();
    const terms: QuoteTerms = { price: override?.price ?? (await this.bidPrice()), size: override?.size ?? req.size };
    const termsSalt = randomBytes32();
    const vaultSalt = randomBytes32();
    await this.desk.call(
      this.secretKey,
      'submitQuote',
      req.rfqId,
      terms,
      termsSalt,
      m.mandate,
      m.salt,
      this.quoteVault.balance,
      this.quoteVault.salt,
      vaultSalt,
    );
    this.quoteVault = { balance: this.quoteVault.balance - terms.price * terms.size, salt: vaultSalt };
    const opening: QuoteOpening = { rfqId: req.rfqId, maker: this.publicKey, terms, termsSalt };
    this.openQuotes.set(toHex(req.rfqId), opening);
    return seal(req.replyTo, opening);
  }

  /** After the RFQ closes: claim the BASE if we won, otherwise release the escrow. */
  async settle(rfqId: Uint8Array): Promise<'claimed' | 'cancelled' | 'none'> {
    const o = this.openQuotes.get(toHex(rfqId));
    if (!o) return 'none';
    const q = (await this.desk.readLedger()).quotes.lookup(pureCircuits.quoteId(rfqId, this.publicKey));
    const salt = randomBytes32();
    if (q.filled) {
      await this.desk.call(this.secretKey, 'claimFill', rfqId, o.terms, o.termsSalt, this.baseVault.balance, this.baseVault.salt, salt);
      this.baseVault = { balance: this.baseVault.balance + o.terms.size, salt };
    } else {
      await this.desk.call(this.secretKey, 'cancelQuote', rfqId, o.terms, o.termsSalt, this.quoteVault.balance, this.quoteVault.salt, salt);
      this.quoteVault = { balance: this.quoteVault.balance + o.terms.price * o.terms.size, salt };
    }
    this.openQuotes.delete(toHex(rfqId));
    return q.filled ? 'claimed' : 'cancelled';
  }
}

export interface OpenRfq {
  rfqId: Uint8Array;
  ownerSalt: Uint8Array;
  request: RfqRequest;
}

export interface Fill {
  rfqId: Uint8Array;
  maker: Uint8Array;
  terms: QuoteTerms;
  receiptEnvelope: SealedEnvelope;
}

export class TreasurySellerAgent extends Agent {
  constructor(
    name: string,
    desk: Desk,
    /** Private: never leaves the agent, only proven against. */
    readonly floorPrice: bigint,
  ) {
    super(name, desk);
  }

  async openRfq(size: bigint, ttlSeconds = 300): Promise<OpenRfq> {
    const rfqId = randomBytes32();
    const ownerSalt = randomBytes32();
    const expiresAt = BigInt(this.desk.now() + ttlSeconds);
    await this.desk.call(this.secretKey, 'openRfq', rfqId, ownerSalt, expiresAt);
    return { rfqId, ownerSalt, request: { rfqId, size, expiresAt, replyTo: this.box.publicKey } };
  }

  /**
   * Decrypts sealed quotes for `rfq` and keeps only those whose opening matches the
   * commitment the maker posted on-chain. Envelopes are untrusted input: a maker could
   * send a flattering price it never committed to, which would only fail at accept time.
   */
  async readQuotes(rfq: OpenRfq, envelopes: SealedEnvelope[]): Promise<QuoteOpening[]> {
    const { quotes } = await this.desk.readLedger();
    const out: QuoteOpening[] = [];
    for (const env of envelopes) {
      let o: QuoteOpening;
      try {
        o = await open<QuoteOpening>(this.box, env);
      } catch {
        continue; // not addressed to us or tampered with
      }
      if (!o || !isBytes32(o.rfqId) || !isBytes32(o.maker) || !isBytes32(o.termsSalt)) continue;
      if (!o.terms || !isU64(o.terms.price) || !isU64(o.terms.size) || o.terms.size === 0n) continue;
      if (!sameBytes(o.rfqId, rfq.rfqId)) continue;
      const id = pureCircuits.quoteId(o.rfqId, o.maker);
      if (!quotes.member(id)) continue;
      const posted = quotes.lookup(id);
      if (!sameBytes(posted.terms, pureCircuits.quoteCommitment(o.terms, o.termsSalt))) continue;
      out.push({ rfqId: o.rfqId, maker: o.maker, terms: { price: o.terms.price, size: o.terms.size }, termsSalt: o.termsSalt });
    }
    return out;
  }

  /** Best price that clears the private floor and that this agent can fill, or undefined. */
  choose(quotes: QuoteOpening[]): QuoteOpening | undefined {
    return quotes
      .filter((q) => q.terms.price >= this.floorPrice && q.terms.size <= this.baseVault.balance)
      .sort((a, b) => (b.terms.price > a.terms.price ? 1 : b.terms.price < a.terms.price ? -1 : 0))[0];
  }

  /** The match proof: runs `acceptQuote` and seals the receipt opening to the auditor. */
  async accept(rfq: OpenRfq, q: QuoteOpening, auditorKey: Uint8Array): Promise<Fill> {
    const m = this.requireMandate();
    const ledger = await this.desk.readLedger();
    if (toHex(await keyFingerprint(auditorKey)) !== toHex(ledger.auditorKey)) {
      throw new Error('Viewing key does not match the auditor registered on the desk');
    }
    const baseSalt = randomBytes32();
    const quoteSalt = randomBytes32();
    const receiptSalt = randomBytes32();
    const notional = q.terms.price * q.terms.size;
    await this.desk.call(
      this.secretKey,
      'acceptQuote',
      rfq.rfqId,
      rfq.ownerSalt,
      q.maker,
      q.terms,
      q.termsSalt,
      this.floorPrice,
      m.mandate,
      m.salt,
      this.baseVault.balance,
      this.baseVault.salt,
      baseSalt,
      this.quoteVault.balance,
      this.quoteVault.salt,
      quoteSalt,
      receiptSalt,
    );
    this.baseVault = { balance: this.baseVault.balance - q.terms.size, salt: baseSalt };
    this.quoteVault = { balance: this.quoteVault.balance + notional, salt: quoteSalt };
    const receipt: Receipt = { rfq: rfq.rfqId, maker: q.maker, taker: this.publicKey, price: q.terms.price, size: q.terms.size };
    const receiptEnvelope = await seal<ReceiptOpening>(auditorKey, { receipt, salt: receiptSalt });
    return { rfqId: rfq.rfqId, maker: q.maker, terms: q.terms, receiptEnvelope };
  }

  async closeRfq(rfq: OpenRfq) {
    await this.desk.call(this.secretKey, 'closeRfq', rfq.rfqId, rfq.ownerSalt);
  }
}

export interface AuditResult {
  rfqId: Uint8Array;
  receipt: Receipt;
  matchesLedger: boolean;
}

export class Auditor {
  box!: BoxKeyPair;
  fingerprint!: Uint8Array;

  constructor(readonly name: string) {}

  async init() {
    this.box = await generateBoxKeyPair();
    this.fingerprint = await keyFingerprint(this.box.publicKey);
    return this;
  }

  /** Opens a receipt with the viewing key and checks it against the on-chain commitment. */
  async verify(desk: Desk, envelope: SealedEnvelope): Promise<AuditResult> {
    const { receipt, salt } = await open<ReceiptOpening>(this.box, envelope);
    const { receipts } = await desk.readLedger();
    const onChain = receipts.member(receipt.rfq) ? receipts.lookup(receipt.rfq) : undefined;
    const recomputed = pureCircuits.receiptCommitment(receipt, salt);
    return { rfqId: receipt.rfq, receipt, matchesLedger: !!onChain && sameBytes(onChain, recomputed) };
  }
}
