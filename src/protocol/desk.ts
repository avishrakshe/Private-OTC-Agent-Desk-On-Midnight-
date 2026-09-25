/**
 * The desk as seen by agents, plus a local implementation of it.
 *
 * `Desk` is what agents program against. Two implementations exist:
 *  - `DeskLedger` (here): runs the compiled circuits (the JS the Compact compiler emitted,
 *    including every `assert`) against an in-memory ledger. No proofs, no network. Used by
 *    the tests and the instant in-browser demo.
 *  - `OnChainDesk` (./chain.ts): proves and submits the same circuits to a deployed
 *    contract on Midnight through Midnight.js (Lace in the browser, a seed wallet in Node).
 */
import {
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  ledger as readLedger,
  pureCircuits,
  type ImpureCircuits,
  type Ledger,
} from '../../contracts/managed/private-otc-desk/contract/index.js';
import { toHex } from './sealed-box';

export { pureCircuits };
export type { Ledger, Mandate, QuoteTerms, Receipt, Quote, Rfq } from '../../contracts/managed/private-otc-desk/contract/index.js';

export interface PrivateState {
  secretKey: Uint8Array;
}

type Circuits = ImpureCircuits<PrivateState>;
export type CircuitName = keyof Circuits;
export type CircuitArgs<K extends CircuitName> = Parameters<Circuits[K]> extends [any, ...infer R] ? R : never;

/** What a caller learns from a successful circuit call. */
export interface CallReceipt {
  circuit: CircuitName;
  /** Present for on-chain calls. */
  txId?: string;
}

export interface Desk {
  /** Runs `circuit` as the holder of `secretKey`. Rejects with CircuitRejected if an assert fails. */
  call<K extends CircuitName>(secretKey: Uint8Array, circuit: K, ...args: CircuitArgs<K>): Promise<CallReceipt>;
  /** The contract's current public state. */
  readLedger(): Promise<Ledger>;
  /** Block time in seconds since epoch (used for RFQ expiry). */
  now(): number;
}

/** A circuit assertion failed: no proof can exist, so no transaction is ever created. */
export class CircuitRejected extends Error {
  constructor(
    readonly circuit: CircuitName,
    readonly reason: string,
  ) {
    super(`${circuit} rejected: ${reason}`);
    this.name = 'CircuitRejected';
  }
}

const COIN_PUBLIC_KEY = '00'.repeat(32);

/** Extracts the assert message from a runtime error, or undefined if it wasn't an assert. */
export const assertReason = (err: unknown): string | undefined => {
  for (let cur: any = err, depth = 0; cur && depth < 6; cur = cur.cause, depth++) {
    const m = /failed assert:\s*(.+)$/im.exec(String(cur?.message ?? cur));
    if (m) return m[1].trim();
  }
  return undefined;
};

export interface DeskConfig {
  adminSecret: Uint8Array;
  oraclePrice: bigint;
  oracleBandBps: bigint;
  auditorKey: Uint8Array;
  /** Block time in seconds since epoch. */
  time?: number;
}

export class DeskLedger implements Desk {
  readonly address = sampleContractAddress();
  private readonly contract = new Contract<PrivateState>({
    secretKey: ({ privateState }) => [privateState, privateState.secretKey],
  });
  private state: any;
  /** Block time in seconds, advanced explicitly so expiry is deterministic. */
  time: number;

  constructor(cfg: DeskConfig) {
    this.time = cfg.time ?? Math.floor(Date.now() / 1000);
    const init = this.contract.initialState(
      createConstructorContext<PrivateState>({ secretKey: cfg.adminSecret }, COIN_PUBLIC_KEY),
      cfg.oraclePrice,
      cfg.oracleBandBps,
      cfg.auditorKey,
    );
    this.state = init.currentContractState.data;
  }

  async call<K extends CircuitName>(secretKey: Uint8Array, circuit: K, ...args: CircuitArgs<K>): Promise<CallReceipt> {
    this.run(secretKey, circuit, ...args);
    return { circuit };
  }

  /**
   * Synchronous form of `call` that also returns the circuit results (including the public
   * transcript). Throws CircuitRejected and leaves the ledger untouched on failure.
   */
  run<K extends CircuitName>(secretKey: Uint8Array, circuit: K, ...args: CircuitArgs<K>) {
    const ctx = createCircuitContext<PrivateState>(
      this.address,
      COIN_PUBLIC_KEY,
      this.state,
      { secretKey },
      undefined,
      undefined,
      this.time,
    );
    let res;
    try {
      res = (this.contract.impureCircuits[circuit] as any)(ctx, ...args);
    } catch (err) {
      throw new CircuitRejected(circuit, assertReason(err) ?? (err instanceof Error ? err.message : String(err)));
    }
    this.state = res.context.currentQueryContext.state;
    return res as ReturnType<Circuits[K]>;
  }

  get ledger(): Ledger {
    return readLedger(this.state);
  }

  async readLedger(): Promise<Ledger> {
    return this.ledger;
  }

  now(): number {
    return this.time;
  }

  advance(seconds: number) {
    this.time += seconds;
  }
}

/* ───────────── Public-view snapshots (what an observer of the chain sees) ───────────── */

export const short = (b: Uint8Array) => {
  const h = toHex(b);
  return `${h.slice(0, 6)}…${h.slice(-4)}`;
};

const fmt = (v: unknown): string => {
  if (v instanceof Uint8Array) return short(v);
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'boolean') return String(v);
  if (v && typeof v === 'object')
    return `{ ${Object.entries(v)
      .map(([k, x]) => `${k}: ${fmt(x)}`)
      .join(', ')} }`;
  return String(v);
};

const MAPS = [
  'baseVaults',
  'quoteVaults',
  'pendingMandates',
  'mandates',
  'mandateOwners',
  'rfqs',
  'quotes',
  'receipts',
  'quotesPosted',
  'fillsSettled',
] as const;

export type Snapshot = Record<string, string>;

export function snapshot(l: Ledger): Snapshot {
  const out: Snapshot = {
    oraclePrice: fmt(l.oraclePrice),
    oracleBandBps: fmt(l.oracleBandBps),
    tradesSettled: fmt(l.tradesSettled),
  };
  for (const name of MAPS) {
    for (const [k, v] of l[name] as Iterable<[Uint8Array, unknown]>) out[`${name}[${short(k)}]`] = fmt(v);
  }
  for (const id of l.usedRfqIds as Iterable<Uint8Array>) out[`usedRfqIds{${short(id)}}`] = 'used';
  return out;
}

/** Ledger lines an observer would see change between two snapshots. */
export function diff(before: Snapshot, after: Snapshot): string[] {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(after)) {
    if (!(k in before)) lines.push(`+ ${k} = ${v}`);
    else if (before[k] !== v) lines.push(`~ ${k} = ${v}`);
  }
  for (const k of Object.keys(before)) if (!(k in after)) lines.push(`- ${k}`);
  return lines;
}
