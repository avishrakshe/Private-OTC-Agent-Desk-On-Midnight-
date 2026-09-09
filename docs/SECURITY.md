# Security & Threat Model

## 1. Security Objectives

The **Private OTC Agent Desk on Midnight** is designed to satisfy three foundational security goals:
1. **Confidentiality**: Trader order parameters (limit price, quantity, direction, timing) must not be decipherable by block proposers, indexers, or MEV bots.
2. **Integrity & Soundness**: No trade may settle unless the Compact ZK verification predicate (`buyer_bid >= seller_ask` && `reputation >= min_threshold`) evaluates to true.
3. **Replay & Nonce Safety**: Witness commitments cannot be reused across distinct block rounds to prevent duplicate trade settlement.

## 2. Threat Vector Mitigation

| Attack Vector | Vulnerability on Traditional DEX | Mitigation on Midnight Private OTC Desk |
|---|---|---|
| **Mempool Front-Running** | MEV searchers see pending transaction amounts | Order details are private witnesses; only ZK proof touches mempool |
| **Sandwich Attacks** | Adversary forces slippage exploitation | Fixed sealed-bid clearing price with zero public slippage window |
| **Identity Profiling** | Public wallet addresses reveal trading strategies | Agent identities are blinded behind one-time cryptographic ephemeral keys |
| **Default / Counterparty Risk** | Pseudonymous actors default on obligations | ZK reputation score threshold check is enforced before settlement |

## 3. Cryptographic Assumptions

- Soundness and zero-knowledge properties of Midnight Compact SNARK proving system.
- Secure random number generation for ephemeral client-side salts (`crypto.getRandomValues`).
- LevelDB private state encryption utilizing high-entropy master keys.
