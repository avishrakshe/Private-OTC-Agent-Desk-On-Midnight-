import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses = Record<string, never>;

export type ImpureCircuits = {
  registerAgent: (context: __compactRuntime.CircuitContext, reputationScore: bigint) => __compactRuntime.CircuitResults<void>;
  settleSealedBidSwap: (
    context: __compactRuntime.CircuitContext,
    buyerBidPrice: bigint,
    sellerAskPrice: bigint,
    agentReputation: bigint,
    settlementReceipt: string
  ) => __compactRuntime.CircuitResults<void>;
  updateMinReputationThreshold: (context: __compactRuntime.CircuitContext, newThreshold: bigint) => __compactRuntime.CircuitResults<void>;
};

export type PureCircuits = Record<string, never>;

export type Circuits = ImpureCircuits & PureCircuits;

export type Ledger = {
  totalAgents: bigint;
  totalTradesSettled: bigint;
  minReputationThreshold: bigint;
  lastTradeReceipt: string;
};

export declare class Contract {
  readonly witnesses: Witnesses;
  readonly circuits: Circuits;
  readonly impureCircuits: ImpureCircuits;
  readonly provableCircuits: ImpureCircuits;
  constructor(witnesses: Witnesses);
  initialState(context: __compactRuntime.ConstructorContext): __compactRuntime.ConstructorResults<Ledger>;
}

export declare function ledger(state: __compactRuntime.ContractState<Ledger>): Ledger;
export declare function pureCircuits(self: Contract): PureCircuits;
