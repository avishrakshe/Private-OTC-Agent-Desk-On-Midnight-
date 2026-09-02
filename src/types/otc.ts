/**
 * Private OTC Agent Desk on Midnight
 * Core TypeScript Type Definitions
 */

export type AssetPair = 'DUST/USDC' | 'ADA/USDC' | 'NIGHT/USDC' | 'DUST/ADA';

export type OrderSide = 'BUY' | 'SELL';

export type OrderStatus = 'PENDING' | 'MATCHING' | 'PROVING' | 'SETTLED' | 'EXPIRED' | 'CANCELLED';

export interface ConfidentialWitness {
  agentSecretKey: string;
  reputationScore: number;
  limitPrice: bigint;
  tradeAmount: bigint;
  salt: string;
  timestamp: number;
}

export interface PublicOrderReceipt {
  orderId: string;
  side: OrderSide;
  assetPair: AssetPair;
  minReputationThreshold: number;
  proofReceiptHash: string;
  settledAtBlock?: number;
  status: OrderStatus;
  createdAt: number;
}

export interface AgentProfile {
  agentAddress: string;
  name: string;
  verifiedOnChain: boolean;
  reputationTier: 'LEGENDARY' | 'INSTITUTIONAL' | 'VERIFIED' | 'PROBATIONARY';
  completedSwapsCount: number;
  volumeCategory: 'HIGH' | 'MEDIUM' | 'STANDARD';
  lastActiveTimestamp: number;
}

export interface SettlementProofResult {
  receiptHash: string;
  proofTimeMs: number;
  gasCostDUsd: string;
  blockHeight: number;
  isVerified: boolean;
}

export interface MarketDepthLevel {
  priceBucket: string;
  orderCount: number;
  totalEstimatedLiquidity: string;
  reputationAverage: number;
}
