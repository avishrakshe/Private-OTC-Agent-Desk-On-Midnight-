# Private OTC Agent Desk on Midnight

![CI Pipeline](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/actions/workflows/ci.yml/badge.svg)

> Tagline: A confidential DeFi settlement marketplace where autonomous AI agents perform sealed-bid token swaps with identities, trade amounts, and reputation scores hidden via zero-knowledge proofs on Midnight's native private state.

## Live Demo & Video Demonstration
- **Live Preprod dApp:** [https://mn-demo.vercel.app](https://mn-demo.vercel.app)
- **MVP Demo Video:** [https://youtu.be/Ysz9uTXDtuY?si=oebajrsBWnGRnupm](https://youtu.be/Ysz9uTXDtuY?si=oebajrsBWnGRnupm)

## Verified Deployed Contract Addresses
| Network  | Contract Address                                                 |
|----------|------------------------------------------------------------------|
| Preprod  | `02005a3059efee9eeedc1f7ca80004e0e5ea4e8bc1bfaad747e92bcbbbb4cb1a` |
| Preview  | `7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1` |

---

## What This Product Does

Every large trade on a public DEX leaks the full order size, target price, and trader identity to MEV searcher bots in the mempool before settlement. Front-runners sandwich transactions, exploit slippage, and extract billions from traders annually. This vulnerability exists because public blockchains enforce transparency across all financial state — order books, liquidity balances, and pending transactions are exposed to everyone watching the chain.

**Private OTC Agent Desk on Midnight** solves this at the protocol layer. Operating on Midnight's native private state, trading agents register with confidential identities and reputation scores. When executing a swap, buyer and seller agents submit sealed bids as local private witnesses. A Midnight Compact zero-knowledge circuit proves client-side that a valid matching condition exists (buyer bid ≥ seller ask) and that both agents meet required reputation thresholds, settling the trade on-chain while keeping order sizes, pricing, and agent identities completely secret from all third parties.

Designed for institutional funds, trading desks, and autonomous AI agent operators, the platform enables high-value over-the-counter (OTC) token swaps without front-running, strategy leakage, or MEV extraction.

---

## Privacy Model

### What is PUBLIC (on-chain, visible to anyone)
- **Total Agents Registered Counter**: Verifiable number of active AI trading agents.
- **Total Trades Settled Counter**: Public count of completed OTC swaps.
- **Minimum Reputation Threshold Setting**: Protocol-wide reputation baseline constraint.
- **Settlement Proof Receipt Hash**: Cryptographic receipt confirming trade validity.

### What is PRIVATE (private witness, never on-chain)
- **Agent Identity Key & Secret Seed**: Local cryptographic key pair of the trading agent.
- **Agent Actual Reputation Score**: Exact reputation metric computed client-side.
- **Buyer Maximum Bid Price & Swap Sizing**: Confidential buyer execution parameters.
- **Seller Minimum Ask Price & Swap Sizing**: Confidential seller execution parameters.

### What the user PROVES without revealing
- **Reputation Threshold Sufficiency**: Proves `Agent Reputation >= Threshold` without revealing the actual reputation score.
- **Sealed-Bid Price Matching Condition**: Proves `Buyer Bid Price >= Seller Ask Price` without revealing either price.
- **Fair Settlement Execution**: Proves that the swap satisfied protocol rules and generated a valid cryptographic receipt.

---

## Tech Stack
- **Smart Contract Language**: Midnight Compact (`0.5.1`)
- **Privacy Core**: Midnight Native ZK Private State & Proof Engine (`@midnight-ntwrk/compact-runtime`)
- **Frontend Framework**: React 19 + TypeScript + Vite 8
- **Wallet Integration**: Midnight Lace Wallet Connector (`@midnight-ntwrk/dapp-connector-api`)
- **Runtime Environment**: Node.js v22+
- **CI/CD**: GitHub Actions

---

## Prerequisites
1. **Node.js**: `v22.0.0` or higher
2. **Lace Wallet**: Midnight Lace extension installed in browser
3. **WSL / Compact Compiler**: Midnight Compact compiler (`compact 0.5.1`) for contract compilation

---

## Setup & Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-.git
   cd Private-OTC-Agent-Desk-On-Midnight-/mn-demo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile the Compact ZK contract**:
   ```bash
   npm run compile
   ```

4. **Launch local development server**:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## Run Tests

To execute the unit test suite covering circuit logic, state transitions, and privacy preservation:

```bash
npm test
```

Expected output:
```text
▶ Midnight Level 4 — Private OTC Agent Desk Test Suite
  ✔ a) Circuit Logic — registers agents, verifies ZK reputation threshold, & settles sealed-bid swaps
  ✔ b) State Transitions — updates agent registration counter and trade settlement receipts correctly
  ✔ c) Privacy Preservation — private witnesses (bids, reputation scores, identities) are never exposed
  ✔ d) Constraint Enforcement — rejects sealed bids when price mismatches or reputation is insufficient
✔ Midnight Level 4 — Private OTC Agent Desk Test Suite (4 tests passed)
```

---

## CI/CD

The project features an automated GitHub Actions pipeline in `.github/workflows/ci.yml`. On every push or pull request to `main`, the workflow:
1. Installs Node.js dependencies
2. Runs the Midnight Compact contract compiler
3. Executes the full unit test suite (`npm test`)
4. Verifies the production web build (`npm run build`)

---

## Usage Guide
See [docs/USAGE.md](file:///c:/Users/Avish%20Rakshe/OneDrive/1st_projects/Full-Moon%20Midnight/mn-demo/docs/USAGE.md) for detailed step-by-step instructions.

---

## Product X Profile
[PLACEHOLDER — I will add after creating the account]
