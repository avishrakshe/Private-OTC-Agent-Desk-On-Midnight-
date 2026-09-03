/**
 * Autonomous AI Trading Agent Simulator
 * Simulates confidential OTC order generation and zero-knowledge sealed matching.
 */

import { AssetPair, OrderSide, PublicOrderReceipt, ConfidentialWitness } from './types/otc';

export interface SimulatedAgentConfig {
  agentId: string;
  name: string;
  baseReputation: number;
  tradeStrategy: 'AGGRESSIVE' | 'PASSIVE' | 'ARBITRAGE';
}

export class AgentSimulator {
  private agents: SimulatedAgentConfig[];
  private tradeLog: PublicOrderReceipt[] = [];

  constructor(customAgents?: SimulatedAgentConfig[]) {
    this.agents = customAgents || [
      { agentId: 'agent-alpha-01', name: 'AlphaArbitrageBot', baseReputation: 98, tradeStrategy: 'ARBITRAGE' },
      { agentId: 'agent-beta-02', name: 'DeepLiquidityNode', baseReputation: 92, tradeStrategy: 'PASSIVE' },
      { agentId: 'agent-gamma-03', name: 'MomentumHunter', baseReputation: 85, tradeStrategy: 'AGGRESSIVE' },
    ];
  }

  public generateConfidentialWitness(
    agent: SimulatedAgentConfig,
    pair: AssetPair,
    side: OrderSide,
    targetPrice: bigint,
    amount: bigint
  ): ConfidentialWitness {
    const salt = `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;
    return {
      agentSecretKey: `sec_key_${agent.agentId}_${salt.slice(0, 8)}`,
      reputationScore: agent.baseReputation,
      limitPrice: targetPrice,
      tradeAmount: amount,
      salt,
      timestamp: Date.now(),
    };
  }

  public simulateMatch(
    buyerWitness: ConfidentialWitness,
    sellerWitness: ConfidentialWitness,
    pair: AssetPair,
    minRep: number
  ): { success: boolean; reason?: string; receipt?: PublicOrderReceipt } {
    if (buyerWitness.reputationScore < minRep) {
      return { success: false, reason: 'Buyer reputation does not satisfy minimum threshold' };
    }
    if (sellerWitness.reputationScore < minRep) {
      return { success: false, reason: 'Seller reputation does not satisfy minimum threshold' };
    }
    if (buyerWitness.limitPrice < sellerWitness.limitPrice) {
      return { success: false, reason: 'Buyer max bid price is below seller min ask price' };
    }

    const orderId = `otc_ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const proofReceiptHash = `0xzk_${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;

    const receipt: PublicOrderReceipt = {
      orderId,
      side: 'BUY',
      assetPair: pair,
      minReputationThreshold: minRep,
      proofReceiptHash,
      settledAtBlock: Math.floor(100000 + Math.random() * 50000),
      status: 'SETTLED',
      createdAt: Date.now(),
    };

    this.tradeLog.push(receipt);
    return { success: true, receipt };
  }

  public getSettledTrades(): PublicOrderReceipt[] {
    return [...this.tradeLog];
  }
}
