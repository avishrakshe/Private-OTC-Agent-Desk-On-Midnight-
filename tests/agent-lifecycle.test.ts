/**
 * Integration Test: Multi-Agent Sealed-Bid Trade Lifecycle
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AgentSimulator } from '../src/simulator';
import { PriceOracle } from '../src/oracle';
import { CryptoUtils } from '../src/crypto-utils';
import { ReceiptVerifier } from '../src/receipt-verifier';

describe('Multi-Agent Sealed-Bid OTC Trade Lifecycle', () => {
  const simulator = new AgentSimulator();
  const oracle = new PriceOracle();

  it('completes end-to-end sealed trade matching within oracle price bounds', () => {
    const pair = 'DUST/USDC';
    const currentPrice = oracle.getLatestPrice(pair);

    const buyer = simulator.generateConfidentialWitness(
      { agentId: 'agent-institutional-1', name: 'InstDeskA', baseReputation: 96, tradeStrategy: 'ARBITRAGE' },
      pair,
      'BUY',
      BigInt(Math.round(currentPrice * 105)),
      1000n
    );

    const seller = simulator.generateConfidentialWitness(
      { agentId: 'agent-institutional-2', name: 'InstDeskB', baseReputation: 93, tradeStrategy: 'PASSIVE' },
      pair,
      'SELL',
      BigInt(Math.round(currentPrice * 95)),
      1000n
    );

    const match = simulator.simulateMatch(buyer, seller, pair, 85);
    assert.equal(match.success, true);
    assert.ok(match.receipt);

    const verification = ReceiptVerifier.createVerificationResult(match.receipt);
    assert.equal(verification.isVerified, true);
    assert.ok(verification.receiptHash.startsWith('0xzk_'));
  });

  it('guarantees unique cryptographic nonces for distinct order rounds', () => {
    const nonce1 = CryptoUtils.generateOrderNonce('agent-alpha');
    const nonce2 = CryptoUtils.generateOrderNonce('agent-alpha');
    assert.notEqual(nonce1, nonce2);
    assert.equal(CryptoUtils.isNonceUsed(nonce1), true);
    assert.equal(CryptoUtils.isNonceUsed(nonce2), true);
  });

  it('verifies that price oracle calculates valid TWAP', () => {
    const twap = oracle.calculateTWAP('DUST/USDC', 15);
    assert.ok(twap > 0.9 && twap < 1.2);
    assert.equal(oracle.validatePriceDeviation('DUST/USDC', twap * 1.02), true);
    assert.equal(oracle.validatePriceDeviation('DUST/USDC', twap * 1.50), false);
  });
});
