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
- Deployed on **Midnight Preview Testnet** ([`7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1`](https://preview.midnightexplorer.com/contracts/7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1)).
- Public state exposes only aggregate counters and blinded receipt hashes.
