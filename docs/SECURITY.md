# Security

This covers the sealed-RFQ desk (`contracts/private-otc-desk.compact`), its TypeScript client (`src/protocol/`) and the web app. **It's a hackathon MVP on test networks. Don't use it with real value** (see [Known limitations](#known-limitations)).

## Trust model

| Party | Trusted for | Not trusted for |
|---|---|---|
| **Contract + ZK proofs** | Enforcing every `assert`: quote opening, floor, mandate, oracle band, funds, ownership, expiry | — |
| **Oracle key** (deployer) | Posting a fair TWAP | Anything else (it can't touch vaults, quotes or mandates) |
| **Maker** | Nothing. Its quote is a commitment; the opening it sends the taker is verified against the chain before use | — |
| **Taker** | Nothing. It can only accept a quote whose opening matches, above its own floor, inside its mandate | — |
| **Mandate owner** | Choosing the agent's limits | Nothing else. The agent must accept a mandate before it binds |
| **Auditor** | Keeping its viewing key private | It can read trades it's given; it can't change anything |
| **Indexer / RPC** | Availability | Integrity: the chain's proof verification protects state |

## What the circuits guarantee

- **No price or size before a trade.** Quotes, RFQ owners, balances and mandates are commitments (`persistentCommit` with a fresh 32-byte salt). A test (`tests/otc-desk.test.ts`, c) records every public transcript and ledger value of a quote and a match and asserts that no secret appears, even as raw bytes, with a positive control proving the detector works.
- **A match needs the taker's proof**, which covers: RFQ ownership, the quote opening, `price ≥ floor`, mandate, oracle band, `baseBalance ≥ size`, and unexpired.
- **Quotes are backed.** `submitQuote` proves `balance ≥ price × size` and moves that amount into escrow; it's released only by `claimFill` (to the buyer side) or `cancelQuote` (after the RFQ closes or expires).
- **Mandates can't be bypassed.** Every order re-opens the mandate commitment in-circuit.

## Findings fixed in this review

| # | Issue | Impact | Fix |
|---|---|---|---|
| 1 | **RFQ ids could be reused.** After an RFQ was filled or closed, anyone could `openRfq` the same id | Overwrite the auditor's receipt for a completed trade; re-freeze losing makers' escrow until a new expiry | `usedRfqIds` set; ids are single-use (test: *RFQ ids are single-use*) |
| 2 | **Mandate squatting.** The first key to register a mandate for an agent became its permanent owner | Anyone who learned an agent's public key could block its real owner forever | Two-step `proposeMandate` / `acceptMandate`. Proposals are keyed by (agent, owner); only the agent binds an owner by proving it holds the opening; once bound, only that owner can replace or revoke (test: *squatter cannot bind or block*) |
| 3 | RFQs could be opened already expired | Wasted state; confusing UX | `openRfq` asserts `expiresAt` is in the future |
| 4 | **Taker trusted quote envelopes.** A maker could send an opening that doesn't match its on-chain commitment | The taker would pick a fake "best" price and fail at accept (griefing) | `readQuotes` drops any opening that isn't for this RFQ, isn't well-formed, or doesn't match `quotes[quoteId].terms` on-chain (test: *ignores quote envelopes…*) |
| 5 | Sealed-box key derivation wasn't bound to the parties | Weak key separation | HKDF `info` now binds protocol label, ephemeral key and recipient key; envelopes are size- and shape-checked; the JSON reviver only accepts the two tagged shapes |
| 6 | **Fake verification code** (`receipt-verifier.ts` accepted any string starting with `0x`; `crypto-utils.ts` "hashed" with a 32-bit string hash) | False sense of security | Removed; all commitments come from the contract's own `persistentCommit` via `pureCircuits` |
| 7 | **`npm run clean` deleted wallet seeds** (`.midnight-state.json`) and the compiled contracts the site imports | Irrecoverable loss of testnet funds and keys | `clean` now removes only `dist/` and the wallet sync cache |
| 8 | No security headers on the site | Clickjacking of a page that drives wallet approvals; no CSP | `vercel.json`: CSP (`frame-ancestors 'none'`, `script-src 'self' 'wasm-unsafe-eval'`, …), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS. Verified in a browser with the production build |
| 9 | Deploy silently encrypted private state with a public placeholder password on public networks | Contract secret keys protected by a known string | Loud warning unless `PRIVATE_STATE_PASSWORD` (≥ 16 chars) is set |
| 10 | Redeploying overwrote the only copy of the oracle and auditor keys | Loss of oracle control / audit capability | `.otc-desk-keys.json` is backed up before being replaced; both are gitignored |
| 11 | Fake health check and "benchmarks" that printed made-up results | Misleading operations data | `health-check` now probes the indexer, node, proof server and ZK keys; `benchmark` times real circuit execution |

The previous Preview deployment (`07f477d1…`) predates fixes 1–3; the current one is `d4ae65cd…`.

## Known limitations

- **Vaults are accounting-only.** `depositBase` / `depositQuote` credit balances without moving real tokens, so anyone can "deposit" any amount. Proof of funds and escrow hold *inside* the desk's accounting. Wiring Midnight shielded tokens (`receiveShielded` / `sendShielded`) is the roadmap fix.
- **Deposit amounts are public**, and settlement links a trade to the parties' pseudonymous keys. Pre-trade privacy is the guarantee; post-trade unlinkability isn't.
- **Single oracle key.** Whoever holds `.otc-desk-keys.json` sets the TWAP band. Roadmap: multiple signers.
- **Reputation can be farmed** by trading with yourself (Sybil). Counters are honest about history, not about identity. Roadmap: bonds, nullifier-based identity.
- **Escrow can be held until expiry.** A taker that never accepts or closes keeps makers' escrow locked until `expiresAt`. Keep RFQ TTLs short.
- **Browser agents' keys live in memory.** In "On Midnight (Lace)" mode, closing the tab loses the agents' keys, and with them access to their desk balances (accounting only; your Lace funds pay only fees).
- **Proof server over plain HTTP** on `127.0.0.1:6300` when Lace's own prover isn't used. Only localhost is in the CSP.

## Handling secrets

| File | Holds | Protection |
|---|---|---|
| `.midnight-state.json` | Wallet seeds per network | gitignored; never deleted by scripts |
| `.otc-desk-keys.json` (+ `.bak`) | Oracle key, auditor private viewing key | gitignored; mode 0600 on POSIX |
| `*-state/` (LevelDB) | Midnight.js private state (agent/admin secret keys) | gitignored; encrypted with `PRIVATE_STATE_PASSWORD` |

Never paste a seed into chat, an issue or a commit. `MIDNIGHT_WALLET_SEED` can supply one through the environment instead.

## Reporting

Please open a private security advisory on the GitHub repository rather than a public issue.
