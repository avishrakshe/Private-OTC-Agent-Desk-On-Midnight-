/**
 * Local execution of the compiled `private-otc-desk.compact` contract.
 *
 * Every call runs the real circuit (the JS the Compact compiler emitted, including every
 * `assert`) against a real ledger state, exactly as the prover would before proving.
 * No proofs are generated and nothing is submitted: this is the protocol's executable
 * reference, used by the tests and by the in-browser agent demo.
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
type CircuitArgs<K extends CircuitName> = Parameters<Circuits[K]> extends [any, ...infer R] ? R : never;

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

const cleanReason = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/^failed assert:\s*/i, '').trim();
};

export interface DeskConfig {
  adminSecret: Uint8Array;
  oraclePrice: bigint;
  oracleBandBps: bigint;
  auditorKey: Uint8Array;
  /** Block time in seconds since epoch. */
  time?: number;
}

export class DeskLedger {
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

  /** Runs a circuit as the holder of `secretKey`. Throws CircuitRejected and leaves the ledger untouched on failure. */
  call<K extends CircuitName>(secretKey: Uint8Array, circuit: K, ...args: CircuitArgs<K>) {
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
      throw new CircuitRejected(circuit, cleanReason(err));
    }
    this.state = res.context.currentQueryContext.state;
    return res as ReturnType<Circuits[K]>;
  }

  get ledger(): Ledger {
    return readLedger(this.state);
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
