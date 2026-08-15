# Private OTC Agent Desk on Midnight — User Onboarding & Usage Guide

Welcome to the **Private OTC Agent Desk on Midnight**. This guide provides step-by-step instructions for setting up your environment, connecting your Lace wallet on the Midnight Preprod network, registering trading agents, and executing sealed-bid OTC swaps using zero-knowledge proofs.

---

## 📋 Prerequisites

Before using the dApp on Preprod, ensure you have:

1. **Midnight Lace Wallet Extension**:
   - Installed in Chrome or Brave browser.
   - Switch wallet network to **Midnight Preprod Testnet**.
2. **tDUST Testnet Tokens**:
   - Obtain tDUST from the official Midnight Preprod Faucet.
3. **Supported Browser**:
   - Chrome v115+, Brave, or Firefox.

---

## 🚀 Quick Start Guide

### Step 1: Access the Live Preprod dApp
Open your browser and navigate to the live deployment:
👉 **[https://mn-demo.vercel.app](https://mn-demo.vercel.app)**

### Step 2: Connect Your Midnight Lace Wallet
1. Click **"Connect Lace Wallet"** in the top navigation header.
2. Approve the connection request in your Lace Wallet popup.
3. Ensure your wallet displays **"Connected to Preprod Network"**.

### Step 3: Register an Autonomous Trading Agent
1. Navigate to the **Agent Registration** panel.
2. Enter your Agent Alias (e.g., `Alpha-MarketMaker-01`).
3. Set your initial Reputation Baseline (e.g., `85`).
4. Click **"Register Agent via ZK Witness"**.
5. Approve the transaction. Your agent identity and exact reputation score remain stored as local private witnesses on your device.

### Step 4: Submit a Sealed-Bid OTC Swap Order
1. Select your order role: **Buyer** or **Seller**.
2. Enter token parameters:
   - Token Pair (e.g., `tDUST / tBTC`)
   - Swap Amount
   - Maximum Bid Price (if Buyer) or Minimum Ask Price (if Seller)
3. Set optional **Minimum Reputation Threshold** (e.g., `>= 75`).
4. Click **"Submit Sealed-Bid Order"**.

### Step 5: Execute Zero-Knowledge Proof Settlement
1. When a matching order is located, click **"Execute ZK Swap"**.
2. Watch the real-time ZK proving progress bar:
   - **Stage 1 (0-25%)**: Loading ZK Proving Key (`22MB`)
   - **Stage 2 (25-50%)**: Compiling Local Private Witness
   - **Stage 3 (50-75%)**: Generating Zero-Knowledge Proof
   - **Stage 4 (75-100%)**: Submitting Proof Receipt On-Chain
3. Once completed, receive your **Cryptographic Settlement Receipt Hash**.

---

## 🔒 Privacy Guarantee Summary

| Parameter | Exposure Level | Storage Location |
|---|---|---|
| **Agent Identity & Secret Key** | 🔒 Confidential | Local Private Witness |
| **Buyer Maximum Bid Price** | 🔒 Confidential | Local Private Witness |
| **Seller Minimum Ask Price** | 🔒 Confidential | Local Private Witness |
| **Agent Reputation Score** | 🔒 Confidential | Local Private Witness |
| **Matching Verification (`Bid >= Ask`)** | 🛡️ ZK Proved | Midnight Compact Circuit |
| **Reputation Check (`Score >= Threshold`)**| 🛡️ ZK Proved | Midnight Compact Circuit |
| **Settlement Counter & Receipt Hash** | 🌐 Public | Midnight On-Chain State |

---

## 🛠️ Running Locally for Developers

```bash
# 1. Clone the repository
git clone https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-.git
cd Private-OTC-Agent-Desk-On-Midnight-

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Launch dev server
npm run dev
```

---

## 💬 Feedback & Support

If you encounter any issues or have feature requests:
- **GitHub Issues:** [Submit an Issue](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/issues)
- **Product X (Twitter):** [@DefiAipy](https://x.com/DefiAipy)
