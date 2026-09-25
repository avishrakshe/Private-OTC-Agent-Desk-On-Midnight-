import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = __compactRuntime.CompactTypeBoolean;

class _Quote_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment()))));
  }
  fromValue(value_0) {
    return {
      maker: _descriptor_0.fromValue(value_0),
      rfq: _descriptor_0.fromValue(value_0),
      terms: _descriptor_0.fromValue(value_0),
      expiresAt: _descriptor_1.fromValue(value_0),
      filled: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.maker).concat(_descriptor_0.toValue(value_0.rfq).concat(_descriptor_0.toValue(value_0.terms).concat(_descriptor_1.toValue(value_0.expiresAt).concat(_descriptor_2.toValue(value_0.filled)))));
  }
}

const _descriptor_3 = new _Quote_0();

class _QuoteTerms_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      price: _descriptor_1.fromValue(value_0),
      size: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.price).concat(_descriptor_1.toValue(value_0.size));
  }
}

const _descriptor_4 = new _QuoteTerms_0();

class _Rfq_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      owner: _descriptor_0.fromValue(value_0),
      expiresAt: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.owner).concat(_descriptor_1.toValue(value_0.expiresAt));
  }
}

const _descriptor_5 = new _Rfq_0();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _Mandate_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      maxNotional: _descriptor_1.fromValue(value_0),
      minPrice: _descriptor_1.fromValue(value_0),
      maxPrice: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.maxNotional).concat(_descriptor_1.toValue(value_0.minPrice).concat(_descriptor_1.toValue(value_0.maxPrice)));
  }
}

const _descriptor_7 = new _Mandate_0();

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _Receipt_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()))));
  }
  fromValue(value_0) {
    return {
      rfq: _descriptor_0.fromValue(value_0),
      maker: _descriptor_0.fromValue(value_0),
      taker: _descriptor_0.fromValue(value_0),
      price: _descriptor_1.fromValue(value_0),
      size: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.rfq).concat(_descriptor_0.toValue(value_0.maker).concat(_descriptor_0.toValue(value_0.taker).concat(_descriptor_1.toValue(value_0.price).concat(_descriptor_1.toValue(value_0.size)))));
  }
}

const _descriptor_9 = new _Receipt_0();

const _descriptor_10 = new __compactRuntime.CompactTypeVector(3, _descriptor_0);

const _descriptor_11 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_2.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_12 = new _Either_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_13 = new _ContractAddress_0();

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

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
    if (typeof(witnesses_0.secretKey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named secretKey');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      publicKey(context, ...args_1) {
        return { result: pureCircuits.publicKey(...args_1), context };
      },
      balanceCommitment(context, ...args_1) {
        return { result: pureCircuits.balanceCommitment(...args_1), context };
      },
      mandateCommitment(context, ...args_1) {
        return { result: pureCircuits.mandateCommitment(...args_1), context };
      },
      quoteCommitment(context, ...args_1) {
        return { result: pureCircuits.quoteCommitment(...args_1), context };
      },
      ownerCommitment(context, ...args_1) {
        return { result: pureCircuits.ownerCommitment(...args_1), context };
      },
      receiptCommitment(context, ...args_1) {
        return { result: pureCircuits.receiptCommitment(...args_1), context };
      },
      quoteId(context, ...args_1) {
        return { result: pureCircuits.quoteId(...args_1), context };
      },
      postOraclePrice: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`postOraclePrice: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const twap_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('postOraclePrice',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 160 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(twap_0) === 'bigint' && twap_0 >= 0n && twap_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('postOraclePrice',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 160 char 1',
                                     'Uint<0..18446744073709551616>',
                                     twap_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(twap_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._postOraclePrice_0(context,
                                                 partialProofData,
                                                 twap_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      depositBase: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`depositBase: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const amount_0 = args_1[1];
        const oldBalance_0 = args_1[2];
        const oldSalt_0 = args_1[3];
        const newSalt_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('depositBase',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 169 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('depositBase',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 169 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        if (!(typeof(oldBalance_0) === 'bigint' && oldBalance_0 >= 0n && oldBalance_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('depositBase',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 169 char 1',
                                     'Uint<0..18446744073709551616>',
                                     oldBalance_0)
        }
        if (!(oldSalt_0.buffer instanceof ArrayBuffer && oldSalt_0.BYTES_PER_ELEMENT === 1 && oldSalt_0.length === 32)) {
          __compactRuntime.typeError('depositBase',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-otc-desk.compact line 169 char 1',
                                     'Bytes<32>',
                                     oldSalt_0)
        }
        if (!(newSalt_0.buffer instanceof ArrayBuffer && newSalt_0.BYTES_PER_ELEMENT === 1 && newSalt_0.length === 32)) {
          __compactRuntime.typeError('depositBase',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-otc-desk.compact line 169 char 1',
                                     'Bytes<32>',
                                     newSalt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(amount_0).concat(_descriptor_1.toValue(oldBalance_0).concat(_descriptor_0.toValue(oldSalt_0).concat(_descriptor_0.toValue(newSalt_0)))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._depositBase_0(context,
                                             partialProofData,
                                             amount_0,
                                             oldBalance_0,
                                             oldSalt_0,
                                             newSalt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      depositQuote: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`depositQuote: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const amount_0 = args_1[1];
        const oldBalance_0 = args_1[2];
        const oldSalt_0 = args_1[3];
        const newSalt_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('depositQuote',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 179 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('depositQuote',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 179 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        if (!(typeof(oldBalance_0) === 'bigint' && oldBalance_0 >= 0n && oldBalance_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('depositQuote',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 179 char 1',
                                     'Uint<0..18446744073709551616>',
                                     oldBalance_0)
        }
        if (!(oldSalt_0.buffer instanceof ArrayBuffer && oldSalt_0.BYTES_PER_ELEMENT === 1 && oldSalt_0.length === 32)) {
          __compactRuntime.typeError('depositQuote',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-otc-desk.compact line 179 char 1',
                                     'Bytes<32>',
                                     oldSalt_0)
        }
        if (!(newSalt_0.buffer instanceof ArrayBuffer && newSalt_0.BYTES_PER_ELEMENT === 1 && newSalt_0.length === 32)) {
          __compactRuntime.typeError('depositQuote',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-otc-desk.compact line 179 char 1',
                                     'Bytes<32>',
                                     newSalt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(amount_0).concat(_descriptor_1.toValue(oldBalance_0).concat(_descriptor_0.toValue(oldSalt_0).concat(_descriptor_0.toValue(newSalt_0)))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._depositQuote_0(context,
                                              partialProofData,
                                              amount_0,
                                              oldBalance_0,
                                              oldSalt_0,
                                              newSalt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      registerMandate: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`registerMandate: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const agent_0 = args_1[1];
        const commitment_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerMandate',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 191 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(agent_0.buffer instanceof ArrayBuffer && agent_0.BYTES_PER_ELEMENT === 1 && agent_0.length === 32)) {
          __compactRuntime.typeError('registerMandate',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 191 char 1',
                                     'Bytes<32>',
                                     agent_0)
        }
        if (!(commitment_0.buffer instanceof ArrayBuffer && commitment_0.BYTES_PER_ELEMENT === 1 && commitment_0.length === 32)) {
          __compactRuntime.typeError('registerMandate',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 191 char 1',
                                     'Bytes<32>',
                                     commitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(agent_0).concat(_descriptor_0.toValue(commitment_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerMandate_0(context,
                                                 partialProofData,
                                                 agent_0,
                                                 commitment_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      revokeMandate: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`revokeMandate: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const agent_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('revokeMandate',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 201 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(agent_0.buffer instanceof ArrayBuffer && agent_0.BYTES_PER_ELEMENT === 1 && agent_0.length === 32)) {
          __compactRuntime.typeError('revokeMandate',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 201 char 1',
                                     'Bytes<32>',
                                     agent_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(agent_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._revokeMandate_0(context,
                                               partialProofData,
                                               agent_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      openRfq: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`openRfq: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const rfqId_0 = args_1[1];
        const ownerSalt_0 = args_1[2];
        const expiresAt_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('openRfq',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 210 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(rfqId_0.buffer instanceof ArrayBuffer && rfqId_0.BYTES_PER_ELEMENT === 1 && rfqId_0.length === 32)) {
          __compactRuntime.typeError('openRfq',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 210 char 1',
                                     'Bytes<32>',
                                     rfqId_0)
        }
        if (!(ownerSalt_0.buffer instanceof ArrayBuffer && ownerSalt_0.BYTES_PER_ELEMENT === 1 && ownerSalt_0.length === 32)) {
          __compactRuntime.typeError('openRfq',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 210 char 1',
                                     'Bytes<32>',
                                     ownerSalt_0)
        }
        if (!(typeof(expiresAt_0) === 'bigint' && expiresAt_0 >= 0n && expiresAt_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('openRfq',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-otc-desk.compact line 210 char 1',
                                     'Uint<0..18446744073709551616>',
                                     expiresAt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(rfqId_0).concat(_descriptor_0.toValue(ownerSalt_0).concat(_descriptor_1.toValue(expiresAt_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._openRfq_0(context,
                                         partialProofData,
                                         rfqId_0,
                                         ownerSalt_0,
                                         expiresAt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      submitQuote: (...args_1) => {
        if (args_1.length !== 9) {
          throw new __compactRuntime.CompactError(`submitQuote: expected 9 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const rfqId_0 = args_1[1];
        const terms_0 = args_1[2];
        const termsSalt_0 = args_1[3];
        const mandate_0 = args_1[4];
        const mandateSalt_0 = args_1[5];
        const vaultBalance_0 = args_1[6];
        const vaultSalt_0 = args_1[7];
        const newVaultSalt_0 = args_1[8];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(rfqId_0.buffer instanceof ArrayBuffer && rfqId_0.BYTES_PER_ELEMENT === 1 && rfqId_0.length === 32)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'Bytes<32>',
                                     rfqId_0)
        }
        if (!(typeof(terms_0) === 'object' && typeof(terms_0.price) === 'bigint' && terms_0.price >= 0n && terms_0.price <= 18446744073709551615n && typeof(terms_0.size) === 'bigint' && terms_0.size >= 0n && terms_0.size <= 18446744073709551615n)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'struct QuoteTerms<price: Uint<0..18446744073709551616>, size: Uint<0..18446744073709551616>>',
                                     terms_0)
        }
        if (!(termsSalt_0.buffer instanceof ArrayBuffer && termsSalt_0.BYTES_PER_ELEMENT === 1 && termsSalt_0.length === 32)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'Bytes<32>',
                                     termsSalt_0)
        }
        if (!(typeof(mandate_0) === 'object' && typeof(mandate_0.maxNotional) === 'bigint' && mandate_0.maxNotional >= 0n && mandate_0.maxNotional <= 18446744073709551615n && typeof(mandate_0.minPrice) === 'bigint' && mandate_0.minPrice >= 0n && mandate_0.minPrice <= 18446744073709551615n && typeof(mandate_0.maxPrice) === 'bigint' && mandate_0.maxPrice >= 0n && mandate_0.maxPrice <= 18446744073709551615n)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'struct Mandate<maxNotional: Uint<0..18446744073709551616>, minPrice: Uint<0..18446744073709551616>, maxPrice: Uint<0..18446744073709551616>>',
                                     mandate_0)
        }
        if (!(mandateSalt_0.buffer instanceof ArrayBuffer && mandateSalt_0.BYTES_PER_ELEMENT === 1 && mandateSalt_0.length === 32)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'Bytes<32>',
                                     mandateSalt_0)
        }
        if (!(typeof(vaultBalance_0) === 'bigint' && vaultBalance_0 >= 0n && vaultBalance_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'Uint<0..18446744073709551616>',
                                     vaultBalance_0)
        }
        if (!(vaultSalt_0.buffer instanceof ArrayBuffer && vaultSalt_0.BYTES_PER_ELEMENT === 1 && vaultSalt_0.length === 32)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'Bytes<32>',
                                     vaultSalt_0)
        }
        if (!(newVaultSalt_0.buffer instanceof ArrayBuffer && newVaultSalt_0.BYTES_PER_ELEMENT === 1 && newVaultSalt_0.length === 32)) {
          __compactRuntime.typeError('submitQuote',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'private-otc-desk.compact line 217 char 1',
                                     'Bytes<32>',
                                     newVaultSalt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(rfqId_0).concat(_descriptor_4.toValue(terms_0).concat(_descriptor_0.toValue(termsSalt_0).concat(_descriptor_7.toValue(mandate_0).concat(_descriptor_0.toValue(mandateSalt_0).concat(_descriptor_1.toValue(vaultBalance_0).concat(_descriptor_0.toValue(vaultSalt_0).concat(_descriptor_0.toValue(newVaultSalt_0)))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_7.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._submitQuote_0(context,
                                             partialProofData,
                                             rfqId_0,
                                             terms_0,
                                             termsSalt_0,
                                             mandate_0,
                                             mandateSalt_0,
                                             vaultBalance_0,
                                             vaultSalt_0,
                                             newVaultSalt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      acceptQuote: (...args_1) => {
        if (args_1.length !== 16) {
          throw new __compactRuntime.CompactError(`acceptQuote: expected 16 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const rfqId_0 = args_1[1];
        const ownerSalt_0 = args_1[2];
        const maker_0 = args_1[3];
        const terms_0 = args_1[4];
        const termsSalt_0 = args_1[5];
        const floorPrice_0 = args_1[6];
        const mandate_0 = args_1[7];
        const mandateSalt_0 = args_1[8];
        const baseBalance_0 = args_1[9];
        const baseSalt_0 = args_1[10];
        const newBaseSalt_0 = args_1[11];
        const quoteBalance_0 = args_1[12];
        const quoteSalt_0 = args_1[13];
        const newQuoteSalt_0 = args_1[14];
        const receiptSalt_0 = args_1[15];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(rfqId_0.buffer instanceof ArrayBuffer && rfqId_0.BYTES_PER_ELEMENT === 1 && rfqId_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     rfqId_0)
        }
        if (!(ownerSalt_0.buffer instanceof ArrayBuffer && ownerSalt_0.BYTES_PER_ELEMENT === 1 && ownerSalt_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     ownerSalt_0)
        }
        if (!(maker_0.buffer instanceof ArrayBuffer && maker_0.BYTES_PER_ELEMENT === 1 && maker_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     maker_0)
        }
        if (!(typeof(terms_0) === 'object' && typeof(terms_0.price) === 'bigint' && terms_0.price >= 0n && terms_0.price <= 18446744073709551615n && typeof(terms_0.size) === 'bigint' && terms_0.size >= 0n && terms_0.size <= 18446744073709551615n)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'struct QuoteTerms<price: Uint<0..18446744073709551616>, size: Uint<0..18446744073709551616>>',
                                     terms_0)
        }
        if (!(termsSalt_0.buffer instanceof ArrayBuffer && termsSalt_0.BYTES_PER_ELEMENT === 1 && termsSalt_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     termsSalt_0)
        }
        if (!(typeof(floorPrice_0) === 'bigint' && floorPrice_0 >= 0n && floorPrice_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Uint<0..18446744073709551616>',
                                     floorPrice_0)
        }
        if (!(typeof(mandate_0) === 'object' && typeof(mandate_0.maxNotional) === 'bigint' && mandate_0.maxNotional >= 0n && mandate_0.maxNotional <= 18446744073709551615n && typeof(mandate_0.minPrice) === 'bigint' && mandate_0.minPrice >= 0n && mandate_0.minPrice <= 18446744073709551615n && typeof(mandate_0.maxPrice) === 'bigint' && mandate_0.maxPrice >= 0n && mandate_0.maxPrice <= 18446744073709551615n)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'struct Mandate<maxNotional: Uint<0..18446744073709551616>, minPrice: Uint<0..18446744073709551616>, maxPrice: Uint<0..18446744073709551616>>',
                                     mandate_0)
        }
        if (!(mandateSalt_0.buffer instanceof ArrayBuffer && mandateSalt_0.BYTES_PER_ELEMENT === 1 && mandateSalt_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     mandateSalt_0)
        }
        if (!(typeof(baseBalance_0) === 'bigint' && baseBalance_0 >= 0n && baseBalance_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 9 (argument 10 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Uint<0..18446744073709551616>',
                                     baseBalance_0)
        }
        if (!(baseSalt_0.buffer instanceof ArrayBuffer && baseSalt_0.BYTES_PER_ELEMENT === 1 && baseSalt_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 10 (argument 11 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     baseSalt_0)
        }
        if (!(newBaseSalt_0.buffer instanceof ArrayBuffer && newBaseSalt_0.BYTES_PER_ELEMENT === 1 && newBaseSalt_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 11 (argument 12 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     newBaseSalt_0)
        }
        if (!(typeof(quoteBalance_0) === 'bigint' && quoteBalance_0 >= 0n && quoteBalance_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 12 (argument 13 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Uint<0..18446744073709551616>',
                                     quoteBalance_0)
        }
        if (!(quoteSalt_0.buffer instanceof ArrayBuffer && quoteSalt_0.BYTES_PER_ELEMENT === 1 && quoteSalt_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 13 (argument 14 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     quoteSalt_0)
        }
        if (!(newQuoteSalt_0.buffer instanceof ArrayBuffer && newQuoteSalt_0.BYTES_PER_ELEMENT === 1 && newQuoteSalt_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 14 (argument 15 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     newQuoteSalt_0)
        }
        if (!(receiptSalt_0.buffer instanceof ArrayBuffer && receiptSalt_0.BYTES_PER_ELEMENT === 1 && receiptSalt_0.length === 32)) {
          __compactRuntime.typeError('acceptQuote',
                                     'argument 15 (argument 16 as invoked from Typescript)',
                                     'private-otc-desk.compact line 256 char 1',
                                     'Bytes<32>',
                                     receiptSalt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(rfqId_0).concat(_descriptor_0.toValue(ownerSalt_0).concat(_descriptor_0.toValue(maker_0).concat(_descriptor_4.toValue(terms_0).concat(_descriptor_0.toValue(termsSalt_0).concat(_descriptor_1.toValue(floorPrice_0).concat(_descriptor_7.toValue(mandate_0).concat(_descriptor_0.toValue(mandateSalt_0).concat(_descriptor_1.toValue(baseBalance_0).concat(_descriptor_0.toValue(baseSalt_0).concat(_descriptor_0.toValue(newBaseSalt_0).concat(_descriptor_1.toValue(quoteBalance_0).concat(_descriptor_0.toValue(quoteSalt_0).concat(_descriptor_0.toValue(newQuoteSalt_0).concat(_descriptor_0.toValue(receiptSalt_0))))))))))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_7.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))))))))))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._acceptQuote_0(context,
                                             partialProofData,
                                             rfqId_0,
                                             ownerSalt_0,
                                             maker_0,
                                             terms_0,
                                             termsSalt_0,
                                             floorPrice_0,
                                             mandate_0,
                                             mandateSalt_0,
                                             baseBalance_0,
                                             baseSalt_0,
                                             newBaseSalt_0,
                                             quoteBalance_0,
                                             quoteSalt_0,
                                             newQuoteSalt_0,
                                             receiptSalt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      closeRfq: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`closeRfq: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const rfqId_0 = args_1[1];
        const ownerSalt_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('closeRfq',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 316 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(rfqId_0.buffer instanceof ArrayBuffer && rfqId_0.BYTES_PER_ELEMENT === 1 && rfqId_0.length === 32)) {
          __compactRuntime.typeError('closeRfq',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 316 char 1',
                                     'Bytes<32>',
                                     rfqId_0)
        }
        if (!(ownerSalt_0.buffer instanceof ArrayBuffer && ownerSalt_0.BYTES_PER_ELEMENT === 1 && ownerSalt_0.length === 32)) {
          __compactRuntime.typeError('closeRfq',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 316 char 1',
                                     'Bytes<32>',
                                     ownerSalt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(rfqId_0).concat(_descriptor_0.toValue(ownerSalt_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._closeRfq_0(context,
                                          partialProofData,
                                          rfqId_0,
                                          ownerSalt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      claimFill: (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`claimFill: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const rfqId_0 = args_1[1];
        const terms_0 = args_1[2];
        const termsSalt_0 = args_1[3];
        const vaultBalance_0 = args_1[4];
        const vaultSalt_0 = args_1[5];
        const newVaultSalt_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('claimFill',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 324 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(rfqId_0.buffer instanceof ArrayBuffer && rfqId_0.BYTES_PER_ELEMENT === 1 && rfqId_0.length === 32)) {
          __compactRuntime.typeError('claimFill',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 324 char 1',
                                     'Bytes<32>',
                                     rfqId_0)
        }
        if (!(typeof(terms_0) === 'object' && typeof(terms_0.price) === 'bigint' && terms_0.price >= 0n && terms_0.price <= 18446744073709551615n && typeof(terms_0.size) === 'bigint' && terms_0.size >= 0n && terms_0.size <= 18446744073709551615n)) {
          __compactRuntime.typeError('claimFill',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 324 char 1',
                                     'struct QuoteTerms<price: Uint<0..18446744073709551616>, size: Uint<0..18446744073709551616>>',
                                     terms_0)
        }
        if (!(termsSalt_0.buffer instanceof ArrayBuffer && termsSalt_0.BYTES_PER_ELEMENT === 1 && termsSalt_0.length === 32)) {
          __compactRuntime.typeError('claimFill',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-otc-desk.compact line 324 char 1',
                                     'Bytes<32>',
                                     termsSalt_0)
        }
        if (!(typeof(vaultBalance_0) === 'bigint' && vaultBalance_0 >= 0n && vaultBalance_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('claimFill',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-otc-desk.compact line 324 char 1',
                                     'Uint<0..18446744073709551616>',
                                     vaultBalance_0)
        }
        if (!(vaultSalt_0.buffer instanceof ArrayBuffer && vaultSalt_0.BYTES_PER_ELEMENT === 1 && vaultSalt_0.length === 32)) {
          __compactRuntime.typeError('claimFill',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-otc-desk.compact line 324 char 1',
                                     'Bytes<32>',
                                     vaultSalt_0)
        }
        if (!(newVaultSalt_0.buffer instanceof ArrayBuffer && newVaultSalt_0.BYTES_PER_ELEMENT === 1 && newVaultSalt_0.length === 32)) {
          __compactRuntime.typeError('claimFill',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'private-otc-desk.compact line 324 char 1',
                                     'Bytes<32>',
                                     newVaultSalt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(rfqId_0).concat(_descriptor_4.toValue(terms_0).concat(_descriptor_0.toValue(termsSalt_0).concat(_descriptor_1.toValue(vaultBalance_0).concat(_descriptor_0.toValue(vaultSalt_0).concat(_descriptor_0.toValue(newVaultSalt_0)))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._claimFill_0(context,
                                           partialProofData,
                                           rfqId_0,
                                           terms_0,
                                           termsSalt_0,
                                           vaultBalance_0,
                                           vaultSalt_0,
                                           newVaultSalt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      cancelQuote: (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`cancelQuote: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const rfqId_0 = args_1[1];
        const terms_0 = args_1[2];
        const termsSalt_0 = args_1[3];
        const vaultBalance_0 = args_1[4];
        const vaultSalt_0 = args_1[5];
        const newVaultSalt_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('cancelQuote',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-otc-desk.compact line 348 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(rfqId_0.buffer instanceof ArrayBuffer && rfqId_0.BYTES_PER_ELEMENT === 1 && rfqId_0.length === 32)) {
          __compactRuntime.typeError('cancelQuote',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-otc-desk.compact line 348 char 1',
                                     'Bytes<32>',
                                     rfqId_0)
        }
        if (!(typeof(terms_0) === 'object' && typeof(terms_0.price) === 'bigint' && terms_0.price >= 0n && terms_0.price <= 18446744073709551615n && typeof(terms_0.size) === 'bigint' && terms_0.size >= 0n && terms_0.size <= 18446744073709551615n)) {
          __compactRuntime.typeError('cancelQuote',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-otc-desk.compact line 348 char 1',
                                     'struct QuoteTerms<price: Uint<0..18446744073709551616>, size: Uint<0..18446744073709551616>>',
                                     terms_0)
        }
        if (!(termsSalt_0.buffer instanceof ArrayBuffer && termsSalt_0.BYTES_PER_ELEMENT === 1 && termsSalt_0.length === 32)) {
          __compactRuntime.typeError('cancelQuote',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-otc-desk.compact line 348 char 1',
                                     'Bytes<32>',
                                     termsSalt_0)
        }
        if (!(typeof(vaultBalance_0) === 'bigint' && vaultBalance_0 >= 0n && vaultBalance_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('cancelQuote',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-otc-desk.compact line 348 char 1',
                                     'Uint<0..18446744073709551616>',
                                     vaultBalance_0)
        }
        if (!(vaultSalt_0.buffer instanceof ArrayBuffer && vaultSalt_0.BYTES_PER_ELEMENT === 1 && vaultSalt_0.length === 32)) {
          __compactRuntime.typeError('cancelQuote',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-otc-desk.compact line 348 char 1',
                                     'Bytes<32>',
                                     vaultSalt_0)
        }
        if (!(newVaultSalt_0.buffer instanceof ArrayBuffer && newVaultSalt_0.BYTES_PER_ELEMENT === 1 && newVaultSalt_0.length === 32)) {
          __compactRuntime.typeError('cancelQuote',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'private-otc-desk.compact line 348 char 1',
                                     'Bytes<32>',
                                     newVaultSalt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(rfqId_0).concat(_descriptor_4.toValue(terms_0).concat(_descriptor_0.toValue(termsSalt_0).concat(_descriptor_1.toValue(vaultBalance_0).concat(_descriptor_0.toValue(vaultSalt_0).concat(_descriptor_0.toValue(newVaultSalt_0)))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._cancelQuote_0(context,
                                             partialProofData,
                                             rfqId_0,
                                             terms_0,
                                             termsSalt_0,
                                             vaultBalance_0,
                                             vaultSalt_0,
                                             newVaultSalt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      postOraclePrice: this.circuits.postOraclePrice,
      depositBase: this.circuits.depositBase,
      depositQuote: this.circuits.depositQuote,
      registerMandate: this.circuits.registerMandate,
      revokeMandate: this.circuits.revokeMandate,
      openRfq: this.circuits.openRfq,
      submitQuote: this.circuits.submitQuote,
      acceptQuote: this.circuits.acceptQuote,
      closeRfq: this.circuits.closeRfq,
      claimFill: this.circuits.claimFill,
      cancelQuote: this.circuits.cancelQuote
    };
    this.provableCircuits = {
      postOraclePrice: this.circuits.postOraclePrice,
      depositBase: this.circuits.depositBase,
      depositQuote: this.circuits.depositQuote,
      registerMandate: this.circuits.registerMandate,
      revokeMandate: this.circuits.revokeMandate,
      openRfq: this.circuits.openRfq,
      submitQuote: this.circuits.submitQuote,
      acceptQuote: this.circuits.acceptQuote,
      closeRfq: this.circuits.closeRfq,
      claimFill: this.circuits.claimFill,
      cancelQuote: this.circuits.cancelQuote
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const initialPrice_0 = args_0[1];
    const bandBps_0 = args_0[2];
    const auditor_0 = args_0[3];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(typeof(initialPrice_0) === 'bigint' && initialPrice_0 >= 0n && initialPrice_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'private-otc-desk.compact line 78 char 1',
                                 'Uint<0..18446744073709551616>',
                                 initialPrice_0)
    }
    if (!(typeof(bandBps_0) === 'bigint' && bandBps_0 >= 0n && bandBps_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 2 (argument 3 as invoked from Typescript)',
                                 'private-otc-desk.compact line 78 char 1',
                                 'Uint<0..18446744073709551616>',
                                 bandBps_0)
    }
    if (!(auditor_0.buffer instanceof ArrayBuffer && auditor_0.BYTES_PER_ELEMENT === 1 && auditor_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 3 (argument 4 as invoked from Typescript)',
                                 'private-otc-desk.compact line 78 char 1',
                                 'Bytes<32>',
                                 auditor_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('postOraclePrice', new __compactRuntime.ContractOperation());
    state_0.setOperation('depositBase', new __compactRuntime.ContractOperation());
    state_0.setOperation('depositQuote', new __compactRuntime.ContractOperation());
    state_0.setOperation('registerMandate', new __compactRuntime.ContractOperation());
    state_0.setOperation('revokeMandate', new __compactRuntime.ContractOperation());
    state_0.setOperation('openRfq', new __compactRuntime.ContractOperation());
    state_0.setOperation('submitQuote', new __compactRuntime.ContractOperation());
    state_0.setOperation('acceptQuote', new __compactRuntime.ContractOperation());
    state_0.setOperation('closeRfq', new __compactRuntime.ContractOperation());
    state_0.setOperation('claimFill', new __compactRuntime.ContractOperation());
    state_0.setOperation('cancelQuote', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(0n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(3n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(4n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(5n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(6n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(7n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(8n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(9n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(10n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(11n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(12n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(13n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.assert(bandBps_0 <= 10000n,
                            'Oracle band must be at most 10000 bps');
    const tmp_0 = this._callerKey_0(context, partialProofData);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(0n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(initialPrice_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(3n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(bandBps_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(auditor_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _blockTimeLt_0(context, partialProofData, time_0) {
    return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 2 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_14.toValue(2n),
                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(time_0),
                                                                                                                             alignment: _descriptor_1.alignment() }).encode() } },
                                                                      'lt',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _blockTimeGte_0(context, partialProofData, time_0) {
    return !this._blockTimeLt_0(context, partialProofData, time_0);
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_11, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_1,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_1(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_7,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_2(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_4,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_3(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_0,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_4(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_9,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _secretKey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.secretKey(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('secretKey',
                                 'return value',
                                 'private-otc-desk.compact line 76 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _publicKey_0(sk_0) {
    return this._persistentHash_0([new Uint8Array([111, 116, 99, 45, 100, 101, 115, 107, 58, 112, 107, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _balanceCommitment_0(balance_0, salt_0) {
    return this._persistentCommit_0(balance_0, salt_0);
  }
  _mandateCommitment_0(m_0, salt_0) {
    return this._persistentCommit_1(m_0, salt_0);
  }
  _quoteCommitment_0(t_0, salt_0) {
    return this._persistentCommit_2(t_0, salt_0);
  }
  _ownerCommitment_0(pk_0, salt_0) {
    return this._persistentCommit_3(pk_0, salt_0);
  }
  _receiptCommitment_0(r_0, salt_0) {
    return this._persistentCommit_4(r_0, salt_0);
  }
  _quoteId_0(rfq_0, maker_0) {
    return this._persistentHash_1([new Uint8Array([111, 116, 99, 45, 100, 101, 115, 107, 58, 113, 117, 111, 116, 101, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   rfq_0,
                                   maker_0]);
  }
  _callerKey_0(context, partialProofData) {
    return this._publicKey_0(this._secretKey_0(context, partialProofData));
  }
  _checkMandate_0(context,
                  partialProofData,
                  agent_0,
                  m_0,
                  salt_0,
                  price_0,
                  notional_0)
  {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(6n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(agent_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Agent has no active mandate');
    __compactRuntime.assert(this._equal_0(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(6n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_0.toValue(agent_0),
                                                                                                                                alignment: _descriptor_0.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._mandateCommitment_0(m_0, salt_0)),
                            'Mandate opening does not match the registered commitment');
    __compactRuntime.assert(price_0 >= m_0.minPrice,
                            'Price is below the mandate floor');
    __compactRuntime.assert(price_0 <= m_0.maxPrice,
                            'Price is above the mandate ceiling');
    __compactRuntime.assert(notional_0 <= m_0.maxNotional,
                            'Order notional exceeds the mandate limit');
    return [];
  }
  _checkOracleBand_0(context, partialProofData, price_0) {
    const scaled_0 = price_0 * 10000n;
    let t_0;
    __compactRuntime.assert(scaled_0
                            >=
                            _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(2n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value)
                            *
                            (t_0 = _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                             partialProofData,
                                                                                             [
                                                                                              { dup: { n: 0 } },
                                                                                              { idx: { cached: false,
                                                                                                       pushPath: false,
                                                                                                       path: [
                                                                                                              { tag: 'value',
                                                                                                                value: { value: _descriptor_14.toValue(3n),
                                                                                                                         alignment: _descriptor_14.alignment() } }] } },
                                                                                              { popeq: { cached: false,
                                                                                                         result: undefined } }]).value),
                             (__compactRuntime.assert(10000n >= t_0,
                                                      'result of subtraction would be negative'),
                              10000n - t_0)),
                            'Price is below the oracle band');
    __compactRuntime.assert(scaled_0
                            <=
                            _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(2n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value)
                            *
                            ((t1) => {
                              if (t1 > 18446744073709551615n) {
                                throw new __compactRuntime.CompactError('private-otc-desk.compact line 135 char 35: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                              }
                              return t1;
                            })(10000n
                               +
                               _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                         partialProofData,
                                                                                         [
                                                                                          { dup: { n: 0 } },
                                                                                          { idx: { cached: false,
                                                                                                   pushPath: false,
                                                                                                   path: [
                                                                                                          { tag: 'value',
                                                                                                            value: { value: _descriptor_14.toValue(3n),
                                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                                          { popeq: { cached: false,
                                                                                                     result: undefined } }]).value)),
                            'Price is above the oracle band');
    return [];
  }
  _openBase_0(context, partialProofData, who_0, balance_0, salt_0) {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(4n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'No BASE vault for this key');
    __compactRuntime.assert(this._equal_1(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(4n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_0.toValue(who_0),
                                                                                                                                alignment: _descriptor_0.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._balanceCommitment_0(balance_0,
                                                                    salt_0)),
                            'BASE vault opening does not match');
    return [];
  }
  _openQuote_0(context, partialProofData, who_0, balance_0, salt_0) {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(5n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'No QUOTE vault for this key');
    __compactRuntime.assert(this._equal_2(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(5n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_0.toValue(who_0),
                                                                                                                                alignment: _descriptor_0.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._balanceCommitment_0(balance_0,
                                                                    salt_0)),
                            'QUOTE vault opening does not match');
    return [];
  }
  _addQuotesPosted_0(context, partialProofData, who_0) {
    const n_0 = _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(11n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { push: { storage: false,
                                                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                                                                  alignment: _descriptor_0.alignment() }).encode() } },
                                                                           'member',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value)
                ?
                _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(11n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(who_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value)
                :
                0n;
    const tmp_0 = ((t1) => {
                    if (t1 > 18446744073709551615n) {
                      throw new __compactRuntime.CompactError('private-otc-desk.compact line 150 char 28: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                    }
                    return t1;
                  })(n_0 + 1n);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(11n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _addFillSettled_0(context, partialProofData, who_0) {
    const n_0 = _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(12n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { push: { storage: false,
                                                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                                                                  alignment: _descriptor_0.alignment() }).encode() } },
                                                                           'member',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value)
                ?
                _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(12n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(who_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value)
                :
                0n;
    const tmp_0 = ((t1) => {
                    if (t1 > 18446744073709551615n) {
                      throw new __compactRuntime.CompactError('private-otc-desk.compact line 155 char 28: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                    }
                    return t1;
                  })(n_0 + 1n);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(12n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _postOraclePrice_0(context, partialProofData, twap_0) {
    __compactRuntime.assert(this._equal_3(this._callerKey_0(context,
                                                            partialProofData),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(0n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Only the oracle key can post prices');
    __compactRuntime.assert(twap_0 > 0n, 'Oracle price must be positive');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(twap_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _depositBase_0(context,
                 partialProofData,
                 amount_0,
                 oldBalance_0,
                 oldSalt_0,
                 newSalt_0)
  {
    const who_0 = this._callerKey_0(context, partialProofData);
    if (_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                  partialProofData,
                                                                  [
                                                                   { dup: { n: 0 } },
                                                                   { idx: { cached: false,
                                                                            pushPath: false,
                                                                            path: [
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_14.toValue(4n),
                                                                                              alignment: _descriptor_14.alignment() } }] } },
                                                                   { push: { storage: false,
                                                                             value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                                                          alignment: _descriptor_0.alignment() }).encode() } },
                                                                   'member',
                                                                   { popeq: { cached: true,
                                                                              result: undefined } }]).value))
    {
      this._openBase_0(context, partialProofData, who_0, oldBalance_0, oldSalt_0);
    } else {
      __compactRuntime.assert(this._equal_4(oldBalance_0, 0n),
                              'New vaults start empty');
    }
    const tmp_0 = this._balanceCommitment_0(((t1) => {
                                              if (t1 > 18446744073709551615n) {
                                                throw new __compactRuntime.CompactError('private-otc-desk.compact line 176 char 53: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                              }
                                              return t1;
                                            })(oldBalance_0 + amount_0),
                                            newSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(4n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _depositQuote_0(context,
                  partialProofData,
                  amount_0,
                  oldBalance_0,
                  oldSalt_0,
                  newSalt_0)
  {
    const who_0 = this._callerKey_0(context, partialProofData);
    if (_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                  partialProofData,
                                                                  [
                                                                   { dup: { n: 0 } },
                                                                   { idx: { cached: false,
                                                                            pushPath: false,
                                                                            path: [
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_14.toValue(5n),
                                                                                              alignment: _descriptor_14.alignment() } }] } },
                                                                   { push: { storage: false,
                                                                             value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                                                          alignment: _descriptor_0.alignment() }).encode() } },
                                                                   'member',
                                                                   { popeq: { cached: true,
                                                                              result: undefined } }]).value))
    {
      this._openQuote_0(context,
                        partialProofData,
                        who_0,
                        oldBalance_0,
                        oldSalt_0);
    } else {
      __compactRuntime.assert(this._equal_5(oldBalance_0, 0n),
                              'New vaults start empty');
    }
    const tmp_0 = this._balanceCommitment_0(((t1) => {
                                              if (t1 > 18446744073709551615n) {
                                                throw new __compactRuntime.CompactError('private-otc-desk.compact line 186 char 54: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                              }
                                              return t1;
                                            })(oldBalance_0 + amount_0),
                                            newSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(5n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(who_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _registerMandate_0(context, partialProofData, agent_0, commitment_0) {
    const owner_0 = this._callerKey_0(context, partialProofData);
    const a_0 = agent_0;
    if (_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                  partialProofData,
                                                                  [
                                                                   { dup: { n: 0 } },
                                                                   { idx: { cached: false,
                                                                            pushPath: false,
                                                                            path: [
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_14.toValue(7n),
                                                                                              alignment: _descriptor_14.alignment() } }] } },
                                                                   { push: { storage: false,
                                                                             value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(a_0),
                                                                                                                          alignment: _descriptor_0.alignment() }).encode() } },
                                                                   'member',
                                                                   { popeq: { cached: true,
                                                                              result: undefined } }]).value))
    {
      __compactRuntime.assert(this._equal_6(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                      partialProofData,
                                                                                                      [
                                                                                                       { dup: { n: 0 } },
                                                                                                       { idx: { cached: false,
                                                                                                                pushPath: false,
                                                                                                                path: [
                                                                                                                       { tag: 'value',
                                                                                                                         value: { value: _descriptor_14.toValue(7n),
                                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                                       { idx: { cached: false,
                                                                                                                pushPath: false,
                                                                                                                path: [
                                                                                                                       { tag: 'value',
                                                                                                                         value: { value: _descriptor_0.toValue(a_0),
                                                                                                                                  alignment: _descriptor_0.alignment() } }] } },
                                                                                                       { popeq: { cached: false,
                                                                                                                  result: undefined } }]).value),
                                            owner_0),
                              'Only the mandate owner can replace it');
    }
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(7n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(a_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(owner_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(6n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(a_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(commitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _revokeMandate_0(context, partialProofData, agent_0) {
    const a_0 = agent_0;
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(7n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(a_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Agent has no mandate');
    __compactRuntime.assert(this._equal_7(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(7n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_0.toValue(a_0),
                                                                                                                                alignment: _descriptor_0.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._callerKey_0(context,
                                                            partialProofData)),
                            'Only the mandate owner can revoke it');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(6n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(a_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _openRfq_0(context, partialProofData, rfqId_0, ownerSalt_0, expiresAt_0) {
    const id_0 = rfqId_0;
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_14.toValue(8n),
                                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'RFQ id already used');
    const tmp_0 = { owner:
                      this._ownerCommitment_0(this._callerKey_0(context,
                                                                partialProofData),
                                              ownerSalt_0),
                    expiresAt: expiresAt_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(8n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(tmp_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _submitQuote_0(context,
                 partialProofData,
                 rfqId_0,
                 terms_0,
                 termsSalt_0,
                 mandate_0,
                 mandateSalt_0,
                 vaultBalance_0,
                 vaultSalt_0,
                 newVaultSalt_0)
  {
    const maker_0 = this._callerKey_0(context, partialProofData);
    const rfq_0 = rfqId_0;
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(8n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(rfq_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'RFQ is not open');
    const expiresAt_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_14.toValue(8n),
                                                                                                              alignment: _descriptor_14.alignment() } }] } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_0.toValue(rfq_0),
                                                                                                              alignment: _descriptor_0.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value).expiresAt;
    __compactRuntime.assert(this._blockTimeLt_0(context,
                                                partialProofData,
                                                expiresAt_0),
                            'RFQ has expired');
    const id_0 = this._quoteId_0(rfq_0, maker_0);
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_14.toValue(9n),
                                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Maker already quoted this RFQ');
    let t_0;
    __compactRuntime.assert((t_0 = terms_0.size, t_0 > 0n),
                            'Quote size must be positive');
    const notional_0 = terms_0.price * terms_0.size;
    this._checkMandate_0(context,
                         partialProofData,
                         maker_0,
                         mandate_0,
                         mandateSalt_0,
                         terms_0.price,
                         notional_0);
    this._checkOracleBand_0(context, partialProofData, terms_0.price);
    this._openQuote_0(context,
                      partialProofData,
                      maker_0,
                      vaultBalance_0,
                      vaultSalt_0);
    __compactRuntime.assert(vaultBalance_0 >= notional_0,
                            'Insufficient QUOTE funds to back this quote');
    const tmp_0 = this._balanceCommitment_0((__compactRuntime.assert(vaultBalance_0
                                                                     >=
                                                                     notional_0,
                                                                     'result of subtraction would be negative'),
                                             vaultBalance_0 - notional_0),
                                            newVaultSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(5n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(maker_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = { maker: maker_0,
                    rfq: rfq_0,
                    terms: this._quoteCommitment_0(terms_0, termsSalt_0),
                    expiresAt: expiresAt_0,
                    filled: false };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(9n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_1),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    this._addQuotesPosted_0(context, partialProofData, maker_0);
    return [];
  }
  _acceptQuote_0(context,
                 partialProofData,
                 rfqId_0,
                 ownerSalt_0,
                 maker_0,
                 terms_0,
                 termsSalt_0,
                 floorPrice_0,
                 mandate_0,
                 mandateSalt_0,
                 baseBalance_0,
                 baseSalt_0,
                 newBaseSalt_0,
                 quoteBalance_0,
                 quoteSalt_0,
                 newQuoteSalt_0,
                 receiptSalt_0)
  {
    const taker_0 = this._callerKey_0(context, partialProofData);
    const rfq_0 = rfqId_0;
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(8n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(rfq_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'RFQ is not open');
    const r_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(8n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(rfq_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_8(r_0.owner,
                                          this._ownerCommitment_0(taker_0,
                                                                  ownerSalt_0)),
                            'Only the RFQ requester can accept a quote');
    __compactRuntime.assert(this._blockTimeLt_0(context,
                                                partialProofData,
                                                r_0.expiresAt),
                            'RFQ has expired');
    const id_0 = this._quoteId_0(rfq_0, maker_0);
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(9n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'No such quote');
    const q_0 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(9n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(id_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_9(q_0.terms,
                                          this._quoteCommitment_0(terms_0,
                                                                  termsSalt_0)),
                            'Quote opening does not match the sealed quote');
    let t_0;
    __compactRuntime.assert((t_0 = terms_0.price, t_0 >= floorPrice_0),
                            "Quote is below the taker's private floor");
    const notional_0 = terms_0.price * terms_0.size;
    this._checkMandate_0(context,
                         partialProofData,
                         taker_0,
                         mandate_0,
                         mandateSalt_0,
                         terms_0.price,
                         notional_0);
    this._checkOracleBand_0(context, partialProofData, terms_0.price);
    this._openBase_0(context,
                     partialProofData,
                     taker_0,
                     baseBalance_0,
                     baseSalt_0);
    __compactRuntime.assert(baseBalance_0 >= terms_0.size,
                            'Insufficient BASE funds to fill this quote');
    let t_1;
    const tmp_0 = this._balanceCommitment_0((t_1 = terms_0.size,
                                             (__compactRuntime.assert(baseBalance_0
                                                                      >=
                                                                      t_1,
                                                                      'result of subtraction would be negative'),
                                              baseBalance_0 - t_1)),
                                            newBaseSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(4n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(taker_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    if (_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                  partialProofData,
                                                                  [
                                                                   { dup: { n: 0 } },
                                                                   { idx: { cached: false,
                                                                            pushPath: false,
                                                                            path: [
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_14.toValue(5n),
                                                                                              alignment: _descriptor_14.alignment() } }] } },
                                                                   { push: { storage: false,
                                                                             value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(taker_0),
                                                                                                                          alignment: _descriptor_0.alignment() }).encode() } },
                                                                   'member',
                                                                   { popeq: { cached: true,
                                                                              result: undefined } }]).value))
    {
      this._openQuote_0(context,
                        partialProofData,
                        taker_0,
                        quoteBalance_0,
                        quoteSalt_0);
    } else {
      __compactRuntime.assert(this._equal_10(quoteBalance_0, 0n),
                              'New vaults start empty');
    }
    const tmp_1 = this._balanceCommitment_0(((t1) => {
                                              if (t1 > 18446744073709551615n) {
                                                throw new __compactRuntime.CompactError('private-otc-desk.compact line 301 char 56: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                              }
                                              return t1;
                                            })(quoteBalance_0 + notional_0),
                                            newQuoteSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(5n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(taker_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_2 = { maker: q_0.maker,
                    rfq: q_0.rfq,
                    terms: q_0.terms,
                    expiresAt: q_0.expiresAt,
                    filled: true };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(9n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_2),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(8n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(rfq_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_3 = this._receiptCommitment_0({ rfq: rfq_0,
                                              maker: q_0.maker,
                                              taker: taker_0,
                                              price: terms_0.price,
                                              size: terms_0.size },
                                            receiptSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(10n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(rfq_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_3),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    this._addFillSettled_0(context, partialProofData, taker_0);
    this._addFillSettled_0(context, partialProofData, q_0.maker);
    const tmp_4 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(13n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_6.toValue(tmp_4),
                                                                alignment: _descriptor_6.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _closeRfq_0(context, partialProofData, rfqId_0, ownerSalt_0) {
    const rfq_0 = rfqId_0;
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(8n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(rfq_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'RFQ is not open');
    __compactRuntime.assert(this._equal_11(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                     partialProofData,
                                                                                                     [
                                                                                                      { dup: { n: 0 } },
                                                                                                      { idx: { cached: false,
                                                                                                               pushPath: false,
                                                                                                               path: [
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_14.toValue(8n),
                                                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                                                      { idx: { cached: false,
                                                                                                               pushPath: false,
                                                                                                               path: [
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_0.toValue(rfq_0),
                                                                                                                                 alignment: _descriptor_0.alignment() } }] } },
                                                                                                      { popeq: { cached: false,
                                                                                                                 result: undefined } }]).value).owner,
                                           this._ownerCommitment_0(this._callerKey_0(context,
                                                                                     partialProofData),
                                                                   ownerSalt_0)),
                            'Only the RFQ requester can close it');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(8n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(rfq_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _claimFill_0(context,
               partialProofData,
               rfqId_0,
               terms_0,
               termsSalt_0,
               vaultBalance_0,
               vaultSalt_0,
               newVaultSalt_0)
  {
    const maker_0 = this._callerKey_0(context, partialProofData);
    const id_0 = this._quoteId_0(rfqId_0, maker_0);
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(9n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'No such quote');
    const q_0 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(9n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(id_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(q_0.filled, 'Quote has not been filled');
    __compactRuntime.assert(this._equal_12(q_0.terms,
                                           this._quoteCommitment_0(terms_0,
                                                                   termsSalt_0)),
                            'Quote opening does not match the sealed quote');
    if (_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                  partialProofData,
                                                                  [
                                                                   { dup: { n: 0 } },
                                                                   { idx: { cached: false,
                                                                            pushPath: false,
                                                                            path: [
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_14.toValue(4n),
                                                                                              alignment: _descriptor_14.alignment() } }] } },
                                                                   { push: { storage: false,
                                                                             value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(maker_0),
                                                                                                                          alignment: _descriptor_0.alignment() }).encode() } },
                                                                   'member',
                                                                   { popeq: { cached: true,
                                                                              result: undefined } }]).value))
    {
      this._openBase_0(context,
                       partialProofData,
                       maker_0,
                       vaultBalance_0,
                       vaultSalt_0);
    } else {
      __compactRuntime.assert(this._equal_13(vaultBalance_0, 0n),
                              'New vaults start empty');
    }
    const tmp_0 = this._balanceCommitment_0(((t1) => {
                                              if (t1 > 18446744073709551615n) {
                                                throw new __compactRuntime.CompactError('private-otc-desk.compact line 343 char 55: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                              }
                                              return t1;
                                            })(vaultBalance_0 + terms_0.size),
                                            newVaultSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(4n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(maker_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(9n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _cancelQuote_0(context,
                 partialProofData,
                 rfqId_0,
                 terms_0,
                 termsSalt_0,
                 vaultBalance_0,
                 vaultSalt_0,
                 newVaultSalt_0)
  {
    const maker_0 = this._callerKey_0(context, partialProofData);
    const rfq_0 = rfqId_0;
    const id_0 = this._quoteId_0(rfq_0, maker_0);
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(9n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'No such quote');
    const q_0 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(9n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(id_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(!q_0.filled, 'Filled quotes cannot be cancelled');
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_14.toValue(8n),
                                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(rfq_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)
                            ||
                            this._blockTimeGte_0(context,
                                                 partialProofData,
                                                 q_0.expiresAt),
                            'Quote is firm while the RFQ is open');
    __compactRuntime.assert(this._equal_14(q_0.terms,
                                           this._quoteCommitment_0(terms_0,
                                                                   termsSalt_0)),
                            'Quote opening does not match the sealed quote');
    this._openQuote_0(context,
                      partialProofData,
                      maker_0,
                      vaultBalance_0,
                      vaultSalt_0);
    const tmp_0 = this._balanceCommitment_0(((t1) => {
                                              if (t1 > 18446744073709551615n) {
                                                throw new __compactRuntime.CompactError('private-otc-desk.compact line 365 char 56: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                              }
                                              return t1;
                                            })(vaultBalance_0
                                               +
                                               terms_0.price * terms_0.size),
                                            newVaultSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(5n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(maker_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(9n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_10(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_11(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_12(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_13(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_14(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get admin() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(0n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get auditorKey() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(1n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get oraclePrice() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(2n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get oracleBandBps() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(3n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    baseVaults: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 63 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 63 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    quoteVaults: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(5n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(5n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 64 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(5n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 64 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(5n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[5];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    mandates: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(6n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(6n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 65 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(6n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 65 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(6n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[6];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    mandateOwners: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(7n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(7n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 66 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(7n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 66 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(7n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[7];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    rfqs: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(8n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(8n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 67 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(8n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 67 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(8n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[8];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_5.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    quotes: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(9n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(9n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 68 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(9n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 68 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(9n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[9];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    receipts: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(10n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(10n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 69 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(10n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 69 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(10n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[10];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    quotesPosted: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(11n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(11n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 72 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(11n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 72 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(11n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[11];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_1.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    fillsSettled: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(12n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(12n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-otc-desk.compact line 73 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(12n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-otc-desk.compact line 73 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(12n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[12];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_1.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get tradesSettled() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(13n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ secretKey: (...args) => undefined });
export const pureCircuits = {
  publicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`publicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('publicKey',
                                 'argument 1',
                                 'private-otc-desk.compact line 88 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._publicKey_0(sk_0);
  },
  balanceCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`balanceCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const balance_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(typeof(balance_0) === 'bigint' && balance_0 >= 0n && balance_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('balanceCommitment',
                                 'argument 1',
                                 'private-otc-desk.compact line 92 char 1',
                                 'Uint<0..18446744073709551616>',
                                 balance_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('balanceCommitment',
                                 'argument 2',
                                 'private-otc-desk.compact line 92 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._balanceCommitment_0(balance_0, salt_0);
  },
  mandateCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`mandateCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const m_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(typeof(m_0) === 'object' && typeof(m_0.maxNotional) === 'bigint' && m_0.maxNotional >= 0n && m_0.maxNotional <= 18446744073709551615n && typeof(m_0.minPrice) === 'bigint' && m_0.minPrice >= 0n && m_0.minPrice <= 18446744073709551615n && typeof(m_0.maxPrice) === 'bigint' && m_0.maxPrice >= 0n && m_0.maxPrice <= 18446744073709551615n)) {
      __compactRuntime.typeError('mandateCommitment',
                                 'argument 1',
                                 'private-otc-desk.compact line 96 char 1',
                                 'struct Mandate<maxNotional: Uint<0..18446744073709551616>, minPrice: Uint<0..18446744073709551616>, maxPrice: Uint<0..18446744073709551616>>',
                                 m_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('mandateCommitment',
                                 'argument 2',
                                 'private-otc-desk.compact line 96 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._mandateCommitment_0(m_0, salt_0);
  },
  quoteCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`quoteCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const t_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(typeof(t_0) === 'object' && typeof(t_0.price) === 'bigint' && t_0.price >= 0n && t_0.price <= 18446744073709551615n && typeof(t_0.size) === 'bigint' && t_0.size >= 0n && t_0.size <= 18446744073709551615n)) {
      __compactRuntime.typeError('quoteCommitment',
                                 'argument 1',
                                 'private-otc-desk.compact line 100 char 1',
                                 'struct QuoteTerms<price: Uint<0..18446744073709551616>, size: Uint<0..18446744073709551616>>',
                                 t_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('quoteCommitment',
                                 'argument 2',
                                 'private-otc-desk.compact line 100 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._quoteCommitment_0(t_0, salt_0);
  },
  ownerCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`ownerCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const pk_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(pk_0.buffer instanceof ArrayBuffer && pk_0.BYTES_PER_ELEMENT === 1 && pk_0.length === 32)) {
      __compactRuntime.typeError('ownerCommitment',
                                 'argument 1',
                                 'private-otc-desk.compact line 104 char 1',
                                 'Bytes<32>',
                                 pk_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('ownerCommitment',
                                 'argument 2',
                                 'private-otc-desk.compact line 104 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._ownerCommitment_0(pk_0, salt_0);
  },
  receiptCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`receiptCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const r_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(typeof(r_0) === 'object' && r_0.rfq.buffer instanceof ArrayBuffer && r_0.rfq.BYTES_PER_ELEMENT === 1 && r_0.rfq.length === 32 && r_0.maker.buffer instanceof ArrayBuffer && r_0.maker.BYTES_PER_ELEMENT === 1 && r_0.maker.length === 32 && r_0.taker.buffer instanceof ArrayBuffer && r_0.taker.BYTES_PER_ELEMENT === 1 && r_0.taker.length === 32 && typeof(r_0.price) === 'bigint' && r_0.price >= 0n && r_0.price <= 18446744073709551615n && typeof(r_0.size) === 'bigint' && r_0.size >= 0n && r_0.size <= 18446744073709551615n)) {
      __compactRuntime.typeError('receiptCommitment',
                                 'argument 1',
                                 'private-otc-desk.compact line 108 char 1',
                                 'struct Receipt<rfq: Bytes<32>, maker: Bytes<32>, taker: Bytes<32>, price: Uint<0..18446744073709551616>, size: Uint<0..18446744073709551616>>',
                                 r_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('receiptCommitment',
                                 'argument 2',
                                 'private-otc-desk.compact line 108 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._receiptCommitment_0(r_0, salt_0);
  },
  quoteId: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`quoteId: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const rfq_0 = args_0[0];
    const maker_0 = args_0[1];
    if (!(rfq_0.buffer instanceof ArrayBuffer && rfq_0.BYTES_PER_ELEMENT === 1 && rfq_0.length === 32)) {
      __compactRuntime.typeError('quoteId',
                                 'argument 1',
                                 'private-otc-desk.compact line 112 char 1',
                                 'Bytes<32>',
                                 rfq_0)
    }
    if (!(maker_0.buffer instanceof ArrayBuffer && maker_0.BYTES_PER_ELEMENT === 1 && maker_0.length === 32)) {
      __compactRuntime.typeError('quoteId',
                                 'argument 2',
                                 'private-otc-desk.compact line 112 char 1',
                                 'Bytes<32>',
                                 maker_0)
    }
    return _dummyContract._quoteId_0(rfq_0, maker_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
