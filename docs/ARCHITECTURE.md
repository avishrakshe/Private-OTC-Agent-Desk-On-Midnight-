# Architecture

## Components

```mermaid
flowchart TB
    subgraph Browser["💻 Web app (React 19 + Vite)"]
        Pages["DeskPage · AboutPage"]
        AD["AgentDesk<br/>Instant (local) · On Midnight (Lace)"]
        MB["MandateBuilder"]
        Hook["useMidnight<br/>connect · buildProviders · runStoreMessage"]
    end

    subgraph Protocol["📦 src/protocol"]
        Desk["desk.ts<br/>Desk interface · DeskLedger (local)"]
        Chain["chain.ts<br/>OnChainDesk · deployDesk"]
        Agents["agents.ts<br/>Treasury Seller · Market Maker · Auditor"]
        Box["sealed-box.ts<br/>ECDH P-256 · HKDF · AES-GCM"]
        Story["scenario.ts (39 steps, local)<br/>onchain-round.ts (11 tx)"]
    end

    subgraph Node["🖥️ Node tooling"]
        NP["node-providers.ts<br/>seed wallet · DUST · retrying submit"]
        Scripts["deploy.ts · cli.ts<br/>run-agents(-onchain) · health-check"]
    end

    Contract["📜 private-otc-desk.compact<br/>12 circuits (Compact 0.31.1)"]
    Lace["🔑 Lace wallet"]
    Net["⛓️ Midnight (Preview / Preprod / local devnet)"]

    AD --> Story --> Agents
    MB --> Desk
    Agents --> Desk
    Agents --> Box
    Desk --> Contract
    Chain --> Contract
    AD -- on-chain mode --> Hook --> Lace --> Net
    Chain --> Net
    Scripts --> NP --> Net
    Scripts --> Chain
```

**One agent codebase, two backends.** Agents program against the `Desk` interface:

| | `DeskLedger` (local) | `OnChainDesk` (network) |
|---|---|---|
| Executes | the compiled circuits' JS, every `assert` included | the same, then proves and submits |
| State | in-memory ledger | the deployed contract, read via the indexer |
| Used by | tests, instant demo, mandate builder, `npm run agents` | Lace mode on the site, `npm run agents:onchain`, the CLI |
| Time | explicit (deterministic tests) | wall clock |

A failed `assert` raises `CircuitRejected` in both. On-chain it happens while the circuit runs locally, **before anything is proved or submitted**, so a bad order costs nothing and reveals nothing.

## Contract state

```mermaid
classDiagram
    class Ledger {
      admin, auditorKey
      oraclePrice, oracleBandBps
      baseVaults / quoteVaults : pk → commit(balance)
      pendingMandates : hash(agent, owner) → commit(Mandate)
      mandates : agent → commit(Mandate)
      mandateOwners : agent → owner
      rfqs : id → Rfq(owner commitment, expiresAt)
      usedRfqIds : Set(id)
      quotes : quoteId → Quote(maker, rfq, commit(terms), expiresAt, filled)
      receipts : rfqId → commit(Receipt)
      quotesPosted / fillsSettled : pk → count
      tradesSettled : Counter
    }
```

Identity is `publicKey(sk) = persistentHash("otc-desk:pk:v1", sk)`. The secret key reaches circuits only through the `secretKey()` witness, from each caller's private state.

## Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Open: openRfq (id single-use, expiry in future)
    Open --> Open: submitQuote (escrow locked)
    Open --> Filled: acceptQuote (taker's proof)
    Open --> Closed: closeRfq / expiry
    Filled --> Claimed: claimFill (winner)
    Filled --> Refunded: cancelQuote (losers)
    Closed --> Refunded: cancelQuote
```

## Off-chain messages

| Message | From → to | Protection |
|---|---|---|
| IOI (RFQ id, size, expiry, reply key) | taker → chosen makers | point-to-point (in-process in the demo) |
| Quote opening (price, size, salt) | maker → taker | sealed box to the taker's key; verified against `quotes[…].terms` before use |
| Mandate opening | owner → agent | point-to-point; the agent proves it in `acceptMandate` |
| Receipt opening | taker → auditor | sealed box to the viewing key whose fingerprint is `auditorKey` |

## Keys

| Key | Where it lives |
|---|---|
| Agent / owner secret keys | Midnight.js private state (LevelDB in Node; memory in the browser tab) |
| Oracle key, auditor viewing key (CLI deploy) | `.otc-desk-keys.json` (gitignored, backed up on redeploy) |
| Oracle key, auditor viewing key (browser deploy) | memory of the tab that deployed |
| Wallet seeds (Node) | `.midnight-state.json` or `MIDNIGHT_WALLET_SEED` |

See [SECURITY.md](SECURITY.md) for the threat model and limitations.
