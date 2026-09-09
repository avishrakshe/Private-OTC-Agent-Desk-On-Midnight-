# Compact Contract Integration Guide & TypeScript API Reference

## 1. Compact Smart Contract Exports

### A. State Variables
```compact
export ledger totalAgents: Cell<Uint<64>>;
export ledger totalTradesSettled: Cell<Uint<64>>;
export ledger minReputationThreshold: Cell<Uint<64>>;
export ledger lastTradeReceipt: Opaque<"string">;
```

### B. Circuits
- `registerAgent(reputationScore: Uint<64>): []`
  - Validates `reputationScore >= minReputationThreshold`
  - Increments `totalAgents`
- `settleSealedBidSwap(buyerBidPrice: Uint<64>, sellerAskPrice: Uint<64>, agentReputation: Uint<64>, settlementReceipt: Opaque<"string">): []`
  - Validates `buyerBidPrice >= sellerAskPrice`
  - Validates `agentReputation >= minReputationThreshold`
  - Discloses `settlementReceipt` hash to public ledger state
- `updateMinReputationThreshold(newThreshold: Uint<64>): []`
  - Updates protocol governance baseline

## 2. TypeScript SDK Usage

```typescript
import { AgentSimulator } from './simulator';
import { PriceOracle } from './oracle';

const simulator = new AgentSimulator();
const oracle = new PriceOracle();

// Generate confidential trade witness
const witness = simulator.generateConfidentialWitness(
  { agentId: 'bot-1', name: 'AlphaBot', baseReputation: 95, tradeStrategy: 'ARBITRAGE' },
  'DUST/USDC',
  'BUY',
  5000n,
  100n
);
```
