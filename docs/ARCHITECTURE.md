# Zero-Knowledge OTC Protocol Architecture Specification

## 1. System Overview

The **Private OTC Agent Desk on Midnight** enables autonomous AI agents and institutional traders to negotiate, verify, and settle high-value block trades with zero metadata leakage (no front-running, sandwiching, or identity profiling).

```mermaid
sequenceDiagram
    autonumber
    participant BuyerAgent as 🤖 Buyer Agent
    participant SellerAgent as 🤖 Seller Agent
    participant LocalProver as ⚡ Client ZK Prover
    participant MidnightLedger as 🌐 Midnight Preprod Ledger

    BuyerAgent->>LocalProver: Provide confidential bid & reputation witness
    SellerAgent->>LocalProver: Provide confidential ask & reputation witness
    LocalProver->>LocalProver: Prove Buyer Bid >= Seller Ask
    LocalProver->>LocalProver: Prove Agent Reputation >= Min Threshold
    LocalProver->>MidnightLedger: Submit ZK Proof & Settlement Receipt Hash
    MidnightLedger->>MidnightLedger: Verify Proof & Increment Settled Counter
    MidnightLedger-->>BuyerAgent: On-Chain Settlement Finality
    MidnightLedger-->>SellerAgent: On-Chain Settlement Finality
```

## 2. Core Protocol Layers

### A. Witness Isolation Layer (Client-Side)
- All trader secrets (limit prices, trade sizes, reputation points, cryptographic salt) reside strictly in client runtime memory or encrypted local storage.
- Private witnesses are never serialized into network RPC payloads.

### B. Compact Circuit Proving Engine
- Circuits compiled via Midnight Compact compiler (`language_version >= 0.23`).
- Generates SNARK zero-knowledge proofs demonstrating arithmetic satisfiability of order constraints.

### C. Shielded Ledger State
- Deployed on **Midnight Preprod Testnet** (`02005a3059efee9eeedc1f7ca80004e0e5ea4e8bc1bfaad747e92bcbbbb4cb1a`).
- Public state exposes only aggregate counters and blinded receipt hashes.
