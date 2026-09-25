import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type QuoteTerms = { price: bigint; size: bigint };

export type Mandate = { maxNotional: bigint; minPrice: bigint; maxPrice: bigint
                      };

export type Quote = { maker: Uint8Array;
                      rfq: Uint8Array;
                      terms: Uint8Array;
                      expiresAt: bigint;
                      filled: boolean
                    };

export type Rfq = { owner: Uint8Array; expiresAt: bigint };

export type Receipt = { rfq: Uint8Array;
                        maker: Uint8Array;
                        taker: Uint8Array;
                        price: bigint;
                        size: bigint
                      };

export type Witnesses<PS> = {
  secretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  postOraclePrice(context: __compactRuntime.CircuitContext<PS>, twap_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  depositBase(context: __compactRuntime.CircuitContext<PS>,
              amount_0: bigint,
              oldBalance_0: bigint,
              oldSalt_0: Uint8Array,
              newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  depositQuote(context: __compactRuntime.CircuitContext<PS>,
               amount_0: bigint,
               oldBalance_0: bigint,
               oldSalt_0: Uint8Array,
               newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerMandate(context: __compactRuntime.CircuitContext<PS>,
                  agent_0: Uint8Array,
                  commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeMandate(context: __compactRuntime.CircuitContext<PS>,
                agent_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  openRfq(context: __compactRuntime.CircuitContext<PS>,
          rfqId_0: Uint8Array,
          ownerSalt_0: Uint8Array,
          expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submitQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              mandate_0: Mandate,
              mandateSalt_0: Uint8Array,
              vaultBalance_0: bigint,
              vaultSalt_0: Uint8Array,
              newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  acceptQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              ownerSalt_0: Uint8Array,
              maker_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              floorPrice_0: bigint,
              mandate_0: Mandate,
              mandateSalt_0: Uint8Array,
              baseBalance_0: bigint,
              baseSalt_0: Uint8Array,
              newBaseSalt_0: Uint8Array,
              quoteBalance_0: bigint,
              quoteSalt_0: Uint8Array,
              newQuoteSalt_0: Uint8Array,
              receiptSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeRfq(context: __compactRuntime.CircuitContext<PS>,
           rfqId_0: Uint8Array,
           ownerSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claimFill(context: __compactRuntime.CircuitContext<PS>,
            rfqId_0: Uint8Array,
            terms_0: QuoteTerms,
            termsSalt_0: Uint8Array,
            vaultBalance_0: bigint,
            vaultSalt_0: Uint8Array,
            newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancelQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              vaultBalance_0: bigint,
              vaultSalt_0: Uint8Array,
              newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  postOraclePrice(context: __compactRuntime.CircuitContext<PS>, twap_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  depositBase(context: __compactRuntime.CircuitContext<PS>,
              amount_0: bigint,
              oldBalance_0: bigint,
              oldSalt_0: Uint8Array,
              newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  depositQuote(context: __compactRuntime.CircuitContext<PS>,
               amount_0: bigint,
               oldBalance_0: bigint,
               oldSalt_0: Uint8Array,
               newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerMandate(context: __compactRuntime.CircuitContext<PS>,
                  agent_0: Uint8Array,
                  commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeMandate(context: __compactRuntime.CircuitContext<PS>,
                agent_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  openRfq(context: __compactRuntime.CircuitContext<PS>,
          rfqId_0: Uint8Array,
          ownerSalt_0: Uint8Array,
          expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submitQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              mandate_0: Mandate,
              mandateSalt_0: Uint8Array,
              vaultBalance_0: bigint,
              vaultSalt_0: Uint8Array,
              newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  acceptQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              ownerSalt_0: Uint8Array,
              maker_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              floorPrice_0: bigint,
              mandate_0: Mandate,
              mandateSalt_0: Uint8Array,
              baseBalance_0: bigint,
              baseSalt_0: Uint8Array,
              newBaseSalt_0: Uint8Array,
              quoteBalance_0: bigint,
              quoteSalt_0: Uint8Array,
              newQuoteSalt_0: Uint8Array,
              receiptSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeRfq(context: __compactRuntime.CircuitContext<PS>,
           rfqId_0: Uint8Array,
           ownerSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claimFill(context: __compactRuntime.CircuitContext<PS>,
            rfqId_0: Uint8Array,
            terms_0: QuoteTerms,
            termsSalt_0: Uint8Array,
            vaultBalance_0: bigint,
            vaultSalt_0: Uint8Array,
            newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancelQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              vaultBalance_0: bigint,
              vaultSalt_0: Uint8Array,
              newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  publicKey(sk_0: Uint8Array): Uint8Array;
  balanceCommitment(balance_0: bigint, salt_0: Uint8Array): Uint8Array;
  mandateCommitment(m_0: Mandate, salt_0: Uint8Array): Uint8Array;
  quoteCommitment(t_0: QuoteTerms, salt_0: Uint8Array): Uint8Array;
  ownerCommitment(pk_0: Uint8Array, salt_0: Uint8Array): Uint8Array;
  receiptCommitment(r_0: Receipt, salt_0: Uint8Array): Uint8Array;
  quoteId(rfq_0: Uint8Array, maker_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  publicKey(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  balanceCommitment(context: __compactRuntime.CircuitContext<PS>,
                    balance_0: bigint,
                    salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  mandateCommitment(context: __compactRuntime.CircuitContext<PS>,
                    m_0: Mandate,
                    salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  quoteCommitment(context: __compactRuntime.CircuitContext<PS>,
                  t_0: QuoteTerms,
                  salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  ownerCommitment(context: __compactRuntime.CircuitContext<PS>,
                  pk_0: Uint8Array,
                  salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  receiptCommitment(context: __compactRuntime.CircuitContext<PS>,
                    r_0: Receipt,
                    salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  quoteId(context: __compactRuntime.CircuitContext<PS>,
          rfq_0: Uint8Array,
          maker_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  postOraclePrice(context: __compactRuntime.CircuitContext<PS>, twap_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  depositBase(context: __compactRuntime.CircuitContext<PS>,
              amount_0: bigint,
              oldBalance_0: bigint,
              oldSalt_0: Uint8Array,
              newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  depositQuote(context: __compactRuntime.CircuitContext<PS>,
               amount_0: bigint,
               oldBalance_0: bigint,
               oldSalt_0: Uint8Array,
               newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerMandate(context: __compactRuntime.CircuitContext<PS>,
                  agent_0: Uint8Array,
                  commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeMandate(context: __compactRuntime.CircuitContext<PS>,
                agent_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  openRfq(context: __compactRuntime.CircuitContext<PS>,
          rfqId_0: Uint8Array,
          ownerSalt_0: Uint8Array,
          expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submitQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              mandate_0: Mandate,
              mandateSalt_0: Uint8Array,
              vaultBalance_0: bigint,
              vaultSalt_0: Uint8Array,
              newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  acceptQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              ownerSalt_0: Uint8Array,
              maker_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              floorPrice_0: bigint,
              mandate_0: Mandate,
              mandateSalt_0: Uint8Array,
              baseBalance_0: bigint,
              baseSalt_0: Uint8Array,
              newBaseSalt_0: Uint8Array,
              quoteBalance_0: bigint,
              quoteSalt_0: Uint8Array,
              newQuoteSalt_0: Uint8Array,
              receiptSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeRfq(context: __compactRuntime.CircuitContext<PS>,
           rfqId_0: Uint8Array,
           ownerSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claimFill(context: __compactRuntime.CircuitContext<PS>,
            rfqId_0: Uint8Array,
            terms_0: QuoteTerms,
            termsSalt_0: Uint8Array,
            vaultBalance_0: bigint,
            vaultSalt_0: Uint8Array,
            newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancelQuote(context: __compactRuntime.CircuitContext<PS>,
              rfqId_0: Uint8Array,
              terms_0: QuoteTerms,
              termsSalt_0: Uint8Array,
              vaultBalance_0: bigint,
              vaultSalt_0: Uint8Array,
              newVaultSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly admin: Uint8Array;
  readonly auditorKey: Uint8Array;
  readonly oraclePrice: bigint;
  readonly oracleBandBps: bigint;
  baseVaults: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  quoteVaults: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  mandates: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  mandateOwners: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  rfqs: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Rfq;
    [Symbol.iterator](): Iterator<[Uint8Array, Rfq]>
  };
  quotes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Quote;
    [Symbol.iterator](): Iterator<[Uint8Array, Quote]>
  };
  receipts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  quotesPosted: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  fillsSettled: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly tradesSettled: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               initialPrice_0: bigint,
               bandBps_0: bigint,
               auditor_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
