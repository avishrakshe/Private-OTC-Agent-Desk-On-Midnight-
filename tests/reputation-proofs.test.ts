/**
 * Unit Test Suite: Reputation Proofs & Zero-Knowledge Verification
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AgentSimulator } from '../src/simulator';
import { AssetPair } from '../src/types/otc';

describe('Zero-Knowledge Reputation & Sealed-Bid Verification', () => {
  const simulator = new AgentSimulator();

  it('verifies that an agent with reputation >= minimum threshold passes witness verification', () => {
    const buyer = simulator.generateConfidentialWitness(
      { agentId: 'bot-high-rep', name: 'HighRepBot', baseReputation: 95, tradeStrategy: 'ARBITRAGE' },
      'DUST/USDC',
      'BUY',
      5000n,
      500n
    );
    const seller = simulator.generateConfidentialWitness(
      { agentId: 'bot-seller', name: 'SellerBot', baseReputation: 90, tradeStrategy: 'PASSIVE' },
      'DUST/USDC',
      'SELL',
      4800n,
      500n
    );

    const result = simulator.simulateMatch(buyer, seller, 'DUST/USDC', 80);
    assert.equal(result.success, true);
    assert.ok(result.receipt);
    assert.equal(result.receipt?.status, 'SETTLED');
    assert.ok(result.receipt?.proofReceiptHash.startsWith('0xzk_'));
  });

  it('rejects trade matching when buyer reputation is below protocol minimum threshold', () => {
    const lowRepBuyer = simulator.generateConfidentialWitness(
      { agentId: 'bot-low-rep', name: 'LowRepBot', baseReputation: 60, tradeStrategy: 'ARBITRAGE' },
      'DUST/USDC',
      'BUY',
      5000n,
      500n
    );
    const seller = simulator.generateConfidentialWitness(
      { agentId: 'bot-seller', name: 'SellerBot', baseReputation: 90, tradeStrategy: 'PASSIVE' },
      'DUST/USDC',
      'SELL',
      4800n,
      500n
    );

    const result = simulator.simulateMatch(lowRepBuyer, seller, 'DUST/USDC', 75);
    assert.equal(result.success, false);
    assert.match(result.reason || '', /reputation/i);
  });

  it('rejects trade matching when buyer max bid is lower than seller minimum ask', () => {
    const cheapBuyer = simulator.generateConfidentialWitness(
      { agentId: 'bot-cheap', name: 'CheapBot', baseReputation: 95, tradeStrategy: 'ARBITRAGE' },
      'DUST/USDC',
      'BUY',
      4000n,
      500n
    );
    const expensiveSeller = simulator.generateConfidentialWitness(
      { agentId: 'bot-expensive', name: 'ExpBot', baseReputation: 95, tradeStrategy: 'PASSIVE' },
      'DUST/USDC',
      'SELL',
      4500n,
      500n
    );

    const result = simulator.simulateMatch(cheapBuyer, expensiveSeller, 'DUST/USDC', 75);
    assert.equal(result.success, false);
    assert.match(result.reason || '', /price/i);
  });

  it('maintains privacy by ensuring private salt and secret keys are excluded from public receipts', () => {
    const buyer = simulator.generateConfidentialWitness(
      { agentId: 'bot-privacy-test', name: 'PrivacyBot', baseReputation: 99, tradeStrategy: 'ARBITRAGE' },
      'DUST/USDC',
      'BUY',
      6000n,
      100n
    );
    const seller = simulator.generateConfidentialWitness(
      { agentId: 'bot-seller-2', name: 'Seller2', baseReputation: 92, tradeStrategy: 'PASSIVE' },
      'DUST/USDC',
      'SELL',
      5500n,
      100n
    );

    const result = simulator.simulateMatch(buyer, seller, 'DUST/USDC', 80);
    assert.equal(result.success, true);
    const receiptStr = JSON.stringify(result.receipt);
    assert.equal(receiptStr.includes(buyer.agentSecretKey), false);
    assert.equal(receiptStr.includes(buyer.salt), false);
    assert.equal(receiptStr.includes(buyer.limitPrice.toString()), false);
  });
});
