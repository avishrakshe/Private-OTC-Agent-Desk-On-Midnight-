/**
 * The desk on a real Midnight network.
 *
 * `OnChainDesk` implements the same `Desk` interface as the local simulator, but every call
 * is proved and submitted as a transaction to a deployed `private-otc-desk` contract through
 * Midnight.js. In the browser the providers come from Lace (see useMidnight.buildProviders);
 * in Node they come from a seed wallet (see src/node-providers.ts).
 *
 * Each agent keeps its own secret key. Midnight.js holds it as that agent's private state and
 * feeds it to the contract's `secretKey()` witness; it never leaves the machine.
 */
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { Contract, ledger as decodeLedger } from '../../contracts/managed/private-otc-desk/contract/index.js';
import { CircuitRejected, assertReason, type CallReceipt, type CircuitArgs, type CircuitName, type Desk, type Ledger } from './desk';
import { toHex } from './sealed-box';

/** Private state Midnight.js stores for each caller. Hex so every private-state store can serialise it. */
export interface OtcPrivateState {
  secretKey: string;
}

const hexToBytes = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (h) => parseInt(h, 16));

export const otcWitnesses = {
  secretKey: ({ privateState }: { privateState: OtcPrivateState }) =>
    [privateState, hexToBytes(privateState.secretKey)] as [OtcPrivateState, Uint8Array],
};

/** The compiled contract with its witnesses. Pass `zkAssetsPath` in Node; the browser fetches ZK assets instead. */
export function otcCompiledContract(zkAssetsPath?: string): any {
  // The compiled contract's generics don't line up with compact-js's; the witnesses are typed above.
  const cc: any = CompiledContract;
  const made = cc.make('private-otc-desk', Contract);
  const withWitnesses = cc.withWitnesses(otcWitnesses);
  return zkAssetsPath
    ? made.pipe(withWitnesses, cc.withCompiledFileAssets(zkAssetsPath))
    : made.pipe(withWitnesses);
}

export type OtcProviders = MidnightProviders<any, string, OtcPrivateState>;

export interface DeployDeskOptions {
  oraclePrice: bigint;
  oracleBandBps: bigint;
  /** SHA-256 fingerprint of the auditor's viewing public key. */
  auditorKey: Uint8Array;
  /** Becomes the desk's oracle/admin key. */
  adminSecret: Uint8Array;
}

/** Deploys a fresh desk. */
export async function deployDesk(
  providers: OtcProviders,
  compiledContract: any,
  opts: DeployDeskOptions,
): Promise<{ address: string; txId?: string }> {
  const deployed: any = await deployContract(providers as any, {
    compiledContract,
    args: [opts.oraclePrice, opts.oracleBandBps, opts.auditorKey] as any,
    privateStateId: privateStateIdFor(opts.adminSecret),
    initialPrivateState: { secretKey: toHex(opts.adminSecret) },
  } as any);
  const pub = deployed.deployTxData.public;
  return { address: pub.contractAddress, txId: pub.txId ?? pub.txHash };
}

const privateStateIdFor = (secretKey: Uint8Array) => `otc-desk:${toHex(secretKey).slice(0, 16)}`;

export class OnChainDesk implements Desk {
  private readonly handles = new Map<string, Promise<any>>();
  private readonly txIds: string[] = [];

  constructor(
    private readonly providers: OtcProviders,
    private readonly compiledContract: any,
    readonly address: string,
  ) {}

  private handle(secretKey: Uint8Array): Promise<any> {
    const key = toHex(secretKey);
    let h = this.handles.get(key);
    if (!h) {
      h = findDeployedContract(this.providers as any, {
        compiledContract: this.compiledContract,
        contractAddress: this.address,
        privateStateId: privateStateIdFor(secretKey),
        initialPrivateState: { secretKey: key },
      } as any);
      // Don't cache failures, so a transient indexer error can be retried.
      h.catch(() => this.handles.delete(key));
      this.handles.set(key, h);
    }
    return h;
  }

  async call<K extends CircuitName>(secretKey: Uint8Array, circuit: K, ...args: CircuitArgs<K>): Promise<CallReceipt> {
    const contract = await this.handle(secretKey);
    try {
      const result = await contract.callTx[circuit](...args);
      const txId: string | undefined = result?.public?.txId ?? result?.public?.txHash;
      if (txId) this.txIds.push(String(txId));
      return { circuit, txId };
    } catch (err) {
      // Asserts fail while the circuit runs locally, before anything is proved or sent.
      const reason = assertReason(err);
      if (reason) throw new CircuitRejected(circuit, reason);
      throw err;
    }
  }

  async readLedger(): Promise<Ledger> {
    const state = await this.providers.publicDataProvider.queryContractState(this.address);
    if (!state) throw new Error(`Contract ${this.address} not found on this network`);
    return decodeLedger(state.data);
  }

  now(): number {
    return Math.floor(Date.now() / 1000);
  }

  /** Transaction ids submitted since the last call to this method. */
  drainTxIds(): string[] {
    return this.txIds.splice(0);
  }
}
