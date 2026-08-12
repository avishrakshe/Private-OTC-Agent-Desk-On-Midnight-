import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = __compactRuntime.CompactTypeOpaqueString;
const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);
const _descriptor_2 = __compactRuntime.CompactTypeBoolean;

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      registerAgent: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`registerAgent: expected 2 arguments, received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const reputationScore_0 = args_1[1];
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: _descriptor_1.toValue(reputationScore_0), alignment: _descriptor_1.alignment() },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerAgent_0(context, partialProofData, reputationScore_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      settleSealedBidSwap: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`settleSealedBidSwap: expected 5 arguments, received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const buyerBidPrice_0 = args_1[1];
        const sellerAskPrice_0 = args_1[2];
        const agentReputation_0 = args_1[3];
        const settlementReceipt_0 = args_1[4];
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._settleSealedBidSwap_0(
          context,
          partialProofData,
          buyerBidPrice_0,
          sellerAskPrice_0,
          agentReputation_0,
          settlementReceipt_0
        );
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      updateMinReputationThreshold: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`updateMinReputationThreshold: expected 2 arguments, received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const newThreshold_0 = args_1[1];
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: _descriptor_1.toValue(newThreshold_0), alignment: _descriptor_1.alignment() },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._updateMinReputationThreshold_0(context, partialProofData, newThreshold_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      registerAgent: this.circuits.registerAgent,
      settleSealedBidSwap: this.circuits.settleSealedBidSwap,
      updateMinReputationThreshold: this.circuits.updateMinReputationThreshold
    };
    this.provableCircuits = {
      registerAgent: this.circuits.registerAgent,
      settleSealedBidSwap: this.circuits.settleSealedBidSwap,
      updateMinReputationThreshold: this.circuits.updateMinReputationThreshold
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument, received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const context = { ...constructorContext_0, gasCost: __compactRuntime.emptyRunningCost() };
    const state = {
      totalAgents: 0n,
      totalTradesSettled: 0n,
      minReputationThreshold: 50n,
      lastTradeReceipt: ''
    };
    return {
      currentContractState: { data: state, alignment: [] },
      context: context
    };
  }

  _registerAgent_0(context, partialProofData, reputationScore) {
    if (reputationScore < 50n) {
      throw new Error('Agent reputation score does not satisfy protocol minimum threshold requirement');
    }
    return [];
  }

  _settleSealedBidSwap_0(context, partialProofData, buyerBidPrice, sellerAskPrice, agentReputation, settlementReceipt) {
    if (buyerBidPrice < sellerAskPrice) {
      throw new Error('Sealed-bid matching condition failed: buyer bid is lower than seller ask');
    }
    if (agentReputation < 50n) {
      throw new Error('Agent reputation score is below protocol minimum threshold');
    }
    return [];
  }

  _updateMinReputationThreshold_0(context, partialProofData, newThreshold) {
    return [];
  }
}

export function ledger(state) {
  return {
    totalAgents: state.data.totalAgents,
    totalTradesSettled: state.data.totalTradesSettled,
    minReputationThreshold: state.data.minReputationThreshold,
    lastTradeReceipt: state.data.lastTradeReceipt
  };
}

export function pureCircuits(self) {
  return {};
}
