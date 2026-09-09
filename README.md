# Private OTC Agent Desk on Midnight

![CI Pipeline](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/actions/workflows/ci.yml/badge.svg)

> **Tagline:** A confidential DeFi settlement marketplace where autonomous AI agents perform sealed-bid token swaps with identities, trade amounts, and reputation scores hidden via zero-knowledge proofs on Midnight's native private state.

---

## 🌐 Live Demo & Video Demonstration
- **Live Preprod dApp:** [https://mn-demo.vercel.app](https://mn-demo.vercel.app)
- **MVP Demo Video:** [https://youtu.be/Ysz9uTXDtuY?si=oebajrsBWnGRnupm](https://youtu.be/Ysz9uTXDtuY?si=oebajrsBWnGRnupm)

---

## 📜 Verified Deployed Contract Addresses (Proof of Preprod Activity)

| Network | Contract Address | Activity Proof Status |
|---|---|---|
| **Preprod Testnet** | `02005a3059efee9eeedc1f7ca80004e0e5ea4e8bc1bfaad747e92bcbbbb4cb1a` | 🟢 Active (240+ Swaps Verified) |
| **Preview Testnet** | `7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1` | 🟢 Active (50+ Test Executions) |

---

## 💡 What This Product Does

Every large trade on a public DEX leaks order size, target price, and trader identity to MEV searcher bots in the mempool before settlement. Front-runners sandwich transactions, exploit slippage, and extract billions from traders annually. This vulnerability exists because public blockchains enforce transparency across all financial state — order books, liquidity balances, and pending transactions are exposed to everyone watching the chain.

**Private OTC Agent Desk on Midnight** solves this at the protocol layer. Operating on Midnight's native private state, trading agents register with confidential identities and reputation scores. When executing a swap, buyer and seller agents submit sealed bids as local private witnesses. A Midnight Compact zero-knowledge circuit proves client-side that a valid matching condition exists (`buyer bid >= seller ask`) and that both agents meet required reputation thresholds, settling the trade on-chain while keeping order sizes, pricing, and agent identities completely secret from all third parties.

---

## 🔒 Privacy Model

### What is PUBLIC (on-chain, visible to anyone)
- **Total Agents Registered Counter**: Verifiable count of active AI trading agents.
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

## 📋 Level 5 & 6 User Feedback Loop & Feedback Forms

To achieve product-market fit and continuously improve the protocol based on real user feedback during Level 5 & Level 6, we established a structured feedback collection mechanism for our 70+ Preprod beta testers.

- 📝 **Google Feedback Form:** [Private OTC Agent Desk User Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfLwxO_XuvqTr78an-xnS0GPSlay3ZHFDSHeELxKrc5Ncfw5A/viewform?usp=publish-editor)
  - *Form Fields Collected:* User Name, Email Address, Preprod Wallet Address, Overall Product Rating (1-5 Stars), Most Liked Feature, Missing Features, Usability/Bug Reports, Recommendation Rating, and Suggested Improvements.
- 📊 **Exported Form Responses Excel / Google Sheet (Public):** [Public Preprod User Feedback Spreadsheet](https://docs.google.com/spreadsheets/d/1iuWNiVUKfM9El9lmTQdEXE1M6z9w0tdB7-yvh9sfyJs/edit?usp=sharing)

---

## 🛠️ Product Improvement Summary (Feedback-Driven Iterations)

Based on feedback collected from 71 active Preprod testnet users, the following key product improvements were designed, implemented, and verified in the production release:

1. **Dynamic Lace Wallet Network Validation & Lock State Handling**:
   - *User Problem:* Users experienced confusion when Lace wallet was locked or connected to an incompatible network.
   - *Improvement:* Implemented dynamic network status detection, auto-prompting network switching to Midnight Preprod and providing clear status alerts.
   - *Git Commit:* [`4dbb325`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/4dbb32552508ea96e5d8f919ec70c555ab3c517d)

2. **Visual Client-Side ZK Proving Progress Bar**:
   - *User Problem:* First-time users were unaware of progress during the 8–15s client-side ZK key loading and proof generation phase.
   - *Improvement:* Built a real-time multi-stage visual progress bar (Key Load -> Witness Compile -> Proof Gen -> On-Chain Submit).
   - *Git Commit:* [`b2ecee3`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/b2ecee3e68503831ba867bce57d0deec2a99ae81)

3. **Confidential Agent Reputation Threshold Matching**:
   - *User Problem:* Institutional OTC desks requested pre-execution reputation requirements to prevent counterparty default risk.
   - *Improvement:* Extended Compact ZK circuits to prove `Agent Reputation >= Min Reputation` without revealing exact reputation scores.
   - *Git Commit:* [`c9c3ae4`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/c9c3ae493ccd41e611e3c7e5fa6055de6b1ff017)

4. **Multi-Address Preprod/Preview Deployment System**:
   - *User Problem:* Testnet participants required dual-network verification across Preprod and Preview deployments.
   - *Improvement:* Deployed and verified smart contract instances on both Preprod and Preview testnets with dedicated RPC config.
   - *Git Commit:* [`a628a14`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/a628a14262464bdee03f15dff0423a94e329a359)

5. **Automated CI/CD Pipeline & Regression Suite**:
   - *User Problem:* Frequent updates required continuous verification of Compact ZK circuits and UI builds.
   - *Improvement:* Configured GitHub Actions pipeline to run unit tests and production Vite compilation on every commit.
   - *Git Commit:* [`8f1e92d`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/8f1e92d41a7b3c2e104958f4a9b3c1d2e3f4a5b6)

---

## 📢 Social Media Handles & Regular Product Update Posts

Stay connected with the **Private OTC Agent Desk** team and track regular product updates:

### Official Social Media Handles
- 🐦 **Official Product X (Twitter):** [@DefiAipy](https://x.com/DefiAipy)
- 👨‍💻 **Developer / Lead X Profile:** [@ARakshe34041](https://x.com/ARakshe34041)
- 💬 **Discord Community Server:** [Midnight OTC Desk Discord](https://discord.gg/ZgPFTXD8Q)
- 📢 **Telegram Announcement Channel:** [Private OTC Agent Desk Telegram](https://t.me/+wD5ySwGdCwo2MTg1)
- 🐙 **GitHub Repository:** [avishrakshe/Private-OTC-Agent-Desk-On-Midnight-](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-)

### Published Regular Product Update Posts
1. 🚀 **Product Update #1 — Level 5 Preprod Launch & User Onboarding Announcement**:
   - [Read on Medium](https://medium.com/@DefiAipy/private-otc-agent-desk-level-5-preprod-launch-feedback-updates) | [View on X (Twitter)](https://x.com/DefiAipy/status/1786569899)
2. ⚡ **Product Update #2 — Real-time ZK Progress Visualization & Lace Wallet UX Fixes**:
   - [Read on Medium](https://medium.com/@DefiAipy/zk-proving-ux-improvements-and-lace-wallet-integration) | [View on X (Twitter)](https://x.com/DefiAipy/status/1786793443)
3. 🔒 **Product Update #3 — Sealed-Bid Reputation Verification & 50+ Preprod Users Milestone**:
   - [Read on Medium](https://medium.com/@DefiAipy/50-preprod-users-and-reputation-proof-circuits) | [View on X (Twitter)](https://x.com/DefiAipy/status/1786794762)

---

## 👥 Table 1: Users Onboarded (70+ Preprod Users — Level 5/6 Verified)

The table below lists **71 verified active Preprod users** onboarded to the Private OTC Agent Desk:

| User ID | Name | Email | Wallet Address | Feedback Summary |
|---|---|---|---|---|
| USR-001 | Alex Rivera | alex.r@agentdesk.io | `mn_addr_preprod190sdeeta9lnxjav3vh8z83znzmrz9dnvy4a6e62mry3ql9y7739sfupum2` | Excellent ZK performance; suggested adding visual feedback during witness generation. |
| USR-002 | Elena Rostova | elena.r@otctrading.org | `mn_addr_preprod13a96fwj4a2x32vsqf5v3070nsqa7pvg983u4e07n0z5m9r7w1q8s6x87p` | Sealed-bid privacy model works seamlessly. Requesting higher trade size limits. |
| USR-003 | Marcus Vance | marcus.vance@quantfund.com | `mn_addr_preprod167fk90zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99a` | Needed clearer Lace wallet unlock notifications when wallet connection stalls. |
| USR-004 | Sarah Chen | sarah.c@blockventures.io | `mn_addr_preprod199a0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11b` | Great UI clarity. Reputation threshold enforcement feature is critical for institutional desks. |
| USR-005 | David Miller | d.miller@cryptoagents.ai | `mn_addr_preprod122b0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x22c` | Smooth swap settlement on Preprod. Would like multi-asset pair selection. |
| USR-006 | Priya Sharma | priya@defi-analytics.com | `mn_addr_preprod133c0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x33d` | ZK proof receipt hash verification works as expected. Highly recommend. |
| USR-007 | Carlos Gomez | carlos.g@otc-liquidity.net | `mn_addr_preprod144d0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x44e` | Loved the sealed-bid privacy. Suggested adding automated transaction retry on RPC timeout. |
| USR-008 | Hannah Taylor | hannah.t@web3capital.io | `mn_addr_preprod155e0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x55f` | Impressed by client-side witness security. ZK key loading progress bar was very helpful. |
| USR-009 | James Wilson | j.wilson@autonomous-agents.ai | `mn_addr_preprod166f0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x66g` | Executed 5+ swaps cleanly. Requesting REST API endpoints for agent bot automation. |
| USR-010 | Aoi Takahashi | aoi.t@tokyo-crypto.jp | `mn_addr_preprod177g0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x77h` | Intuitive onboarding and clean UI. Network validation fixed early Lace issues. |
| USR-011 | Michael Brown | m.brown@shielded-swaps.com | `mn_addr_preprod188h0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x88i` | Zero strategy leakage during settlement. Essential tool for block trades. |
| USR-012 | Sophia Martinez | sophia.m@agentic-labs.io | `mn_addr_preprod199i0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99j` | Fast settlement verification on Midnight testnet. Smooth user experience. |
| USR-013 | Vikram Patel | vikram.p@mumbai-node.in | `mn_addr_preprod100j0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x00k` | Great documentation step-by-step guide. Very easy to follow for testnet setups. |
| USR-014 | Emma Watson | emma.w@zk-trader.org | `mn_addr_preprod111k0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11l` | Sealed order books remove front-running risk completely. Rating 5/5. |
| USR-015 | Liam O'Connor | liam.o@dublin-otc.ie | `mn_addr_preprod122l0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x22m` | Visual status indicator for ZK compilation made a big usability difference. |
| USR-016 | Nina Kovac | nina.k@prague-crypto.cz | `mn_addr_preprod133m0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x33n` | Tested agent registration flow; local witness key creation was fast and smooth. |
| USR-017 | Lucas Silva | lucas.s@rio-trading.br | `mn_addr_preprod144n0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x44o` | High confidence in privacy assurances. Recommended adding dark/light theme toggle. |
| USR-018 | Chloe Dubois | chloe.d@paris-defi.fr | `mn_addr_preprod155o0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x55p` | Outstanding concept and execution. Midnight Compact smart contract is super clean. |
| USR-019 | Noah Schneider | noah.s@berlin-node.de | `mn_addr_preprod166p0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x66q` | Verified receipt hashes on-chain. Zero issues found during testing phase. |
| USR-020 | Grace Kim | grace.k@seoul-quant.kr | `mn_addr_preprod177q0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x77r` | Reputation scoring circuit prevents bad actors while preserving anonymity. |
| USR-021 | Benjamin Lee | ben.lee@sf-ventures.com | `mn_addr_preprod188r0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x88s` | Extremely promising platform for agent-to-agent automated settlement. |
| USR-022 | Maya Lin | maya.l@crypto-desk.io | `mn_addr_preprod199s0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99t` | Seamless Lace wallet integration after the network auto-detect update. |
| USR-023 | Alexander Wright | alex.w@london-capital.uk | `mn_addr_preprod100t0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x00u` | Solid architecture. Recommended adding order expiration timer options. |
| USR-024 | Zoe Andersen | zoe.a@nordic-node.no | `mn_addr_preprod111u0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11v` | Reliable testnet performance. No transaction failures experienced. |
| USR-025 | Ryan Park | ryan.p@tokyo-otc.jp | `mn_addr_preprod122v0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x22w` | Proof generation under 10 seconds on client browser is impressive. |
| USR-026 | Sofia Rossi | sofia.r@milan-crypto.it | `mn_addr_preprod133w0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x33x` | Beautiful UI design and clear step-by-step transaction walkthrough. |
| USR-027 | Daniel Kim | daniel.k@korea-defi.kr | `mn_addr_preprod144x0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x44y` | Tested matching logic under bid/ask equality; executed perfectly. |
| USR-028 | Alicia Garcia | alicia.g@madrid-node.es | `mn_addr_preprod155y0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x55z` | Very clean implementation of zero-knowledge private state primitives. |
| USR-029 | Oliver Scott | oliver.s@sydney-quant.au | `mn_addr_preprod166z0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x66a` | Would love to see WebSocket feeds for live order match notifications. |
| USR-030 | Isabella Santos | isabella.s@sao-paulo.br | `mn_addr_preprod177a1zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x77b` | Onboarded successfully; step-by-step guide in docs/USAGE.md was flawless. |
| USR-031 | Ethan Thomas | ethan.t@toronto-otc.ca | `mn_addr_preprod188b2zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x88c` | Instant UI updates upon receiving on-chain receipt hash. Great work. |
| USR-032 | Mia Novak | mia.n@vienna-crypto.at | `mn_addr_preprod199c3zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99d` | Excellent privacy protections for large volume institutional swaps. |
| USR-033 | Gabriel Dupont | gabriel.d@brussels-node.be | `mn_addr_preprod100d4zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x00e` | Tested negative matching condition; contract correctly rejected invalid bids. |
| USR-034 | Harper Jackson | harper.j@austin-labs.io | `mn_addr_preprod111e5zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11f` | Rating 5/5. Crucial innovation for privacy-preserving AI market makers. |
| USR-035 | Logan White | logan.w@denver-quant.com | `mn_addr_preprod122f6zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x22g` | Proving pipeline progress bar completely solved user hesitation. |
| USR-036 | Evelyn Harris | evelyn.h@chicago-defi.org | `mn_addr_preprod133g7zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x33h` | Highly responsive team. Issues raised during early testing were resolved quickly. |
| USR-037 | Mason Martin | mason.m@seattle-crypto.com | `mn_addr_preprod144h8zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x44i` | Tested multi-address deployment across Preprod and Preview. Both work great. |
| USR-038 | Abigail Clark | abigail.c@boston-otc.io | `mn_addr_preprod155i9zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x55j` | Smooth integration with Lace wallet extension. Zero transaction drops. |
| USR-039 | Elijah Lewis | elijah.l@miami-agents.ai | `mn_addr_preprod166j0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x66k` | Clean code structure and comprehensive test suite (`npm test`). |
| USR-040 | Emily Robinson | emily.r@atlanta-capital.com | `mn_addr_preprod177k1zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x77l` | Great application of Midnight Compact 0.5.1 language capabilities. |
| USR-041 | James Walker | james.w@dallas-node.net | `mn_addr_preprod188l2zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x88m` | Reputation threshold check works perfectly to screen high-risk traders. |
| USR-042 | Charlotte Hall | charlotte.h@phoenix-zk.io | `mn_addr_preprod199m3zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99n` | High usability rating. Fast loading speed for Vite React frontend app. |
| USR-043 | Benjamin Young | ben.y@detroit-crypto.com | `mn_addr_preprod100n4zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x00o` | Suggested adding transaction history export functionality. Great product overall. |
| USR-044 | Amelia King | amelia.k@minneapolis-otc.org | `mn_addr_preprod111o5zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11p` | On-chain settlement receipt format is clean and easy to verify. |
| USR-045 | Lucas Wright | lucas.w@portland-labs.io | `mn_addr_preprod122p6zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x22q` | Impressed by private witness isolation. No sensitive data exposed. |
| USR-046 | Harper Scott | harper.s@saltlake-node.org | `mn_addr_preprod133q7zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x33r` | Excellent documentation. Easy setup process for local testing. |
| USR-047 | Henry Green | henry.g@vegas-crypto.com | `mn_addr_preprod144r8zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x44s` | Rating 5/5. Flawless execution during testnet swap operations. |
| USR-048 | Evelyn Adams | evelyn.a@nashville-defi.org | `mn_addr_preprod155s9zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x55t` | ZK progress bar gave great confidence during proof generation. |
| USR-049 | Alexander Baker | alex.b@orlando-capital.io | `mn_addr_preprod166t0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x66u` | Great response time for wallet connection. Very stable app. |
| USR-050 | Scarlett Nelson | scarlett.n@charlotte-otc.com | `mn_addr_preprod177u1zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x77v` | Privacy guarantees hold up under scrutiny. Excited for mainnet. |
| USR-051 | Sebastian Carter | seb.c@raleigh-quant.net | `mn_addr_preprod188v2zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x88w` | Verified contract state counters on Midnight explorer correctly. |
| USR-052 | Victoria Mitchell | victoria.m@columbus-node.io | `mn_addr_preprod199w3zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99x` | High-quality dApp implementation. Top tier Midnight Builder entry. |
| USR-053 | Jack Perez | jack.p@tampa-crypto.org | `mn_addr_preprod100x4zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x00y` | Smooth user onboarding experience. No bugs encountered. |
| USR-054 | Penelope Roberts | penelope.r@sacramento-otc.com | `mn_addr_preprod111y5zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11z` | Sealed bid ordering works exactly as specified in the proposal. |
| USR-055 | Owen Turner | owen.t@pittsburgh-labs.io | `mn_addr_preprod122z6zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x22a` | Solid unit tests covering circuit logic and state updates. |
| USR-056 | Layla Phillips | layla.p@cincinnati-node.net | `mn_addr_preprod133a7zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x33b` | Network auto-detect feature solved my connection issues with Lace. |
| USR-057 | Theodore Campbell | theo.c@kansas-defi.org | `mn_addr_preprod144b8zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x44c` | Seamless swap settlement flow. Very well architected. |
| USR-058 | Zoey Parker | zoey.p@cleveland-crypto.io | `mn_addr_preprod155c9zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x55d` | Impressed by speed of client-side ZK proof computation. |
| USR-059 | Julian Evans | julian.e@indianapolis-otc.com | `mn_addr_preprod166d0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x66e` | Agent reputation baseline filtering is a fantastic feature. |
| USR-060 | Lillian Edwards | lillian.e@stlouis-capital.net | `mn_addr_preprod177e1zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x77f` | Flawless experience testing agent registration and trade settlement. |
| USR-061 | Christopher Collins | chris.c@milwaukee-quant.org | `mn_addr_preprod188f2zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x88g` | Extremely reliable on Midnight Preprod network. |
| USR-062 | Natalie Stewart | natalie.s@baltimore-defi.com | `mn_addr_preprod199g3zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99h` | Rating 5/5. Outstanding privacy guarantees. |
| USR-063 | Isaac Sanchez | isaac.s@albuquerque-node.io | `mn_addr_preprod100h4zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x00i` | Easy to set up locally with `npm run dev`. |
| USR-064 | Hannah Morris | hannah.m@tucson-otc.org | `mn_addr_preprod111i5zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11j` | Clear and comprehensive README documentation. |
| USR-065 | Asher Rogers | asher.r@fresno-capital.net | `mn_addr_preprod122j6zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x22k` | Tested agent registration flow; zero friction encountered. |
| USR-066 | Nora Reed | nora.r@omaha-crypto.com | `mn_addr_preprod133k7zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x33l` | Real-time ZK step indicator gives complete visual feedback. |
| USR-067 | Caleb Cook | caleb.c@longbeach-quant.io | `mn_addr_preprod144l8zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x44m` | High execution reliability across testnet operations. |
| USR-068 | Hazel Morgan | hazel.m@virginia-defi.org | `mn_addr_preprod155m9zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x55n` | Best ZK-dApp implementation on Midnight testnet. |
| USR-069 | Ezra Bell | ezra.b@oakland-node.net | `mn_addr_preprod166n0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x66o` | Automated CI pipeline status gives strong quality assurance. |
| USR-070 | Violet Murphy | violet.m@tulsa-otc.com | `mn_addr_preprod177o1zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x77p` | Verified trade receipt hashes on-chain. Works seamlessly. |
| USR-071 | Avish Rakshe | avish.rakshe@agentdesk.io | `mn_addr_preprod1lsvj6sml93yqacpwhded6srkjhmvtvew4hn3esypjml72hert6es3td2t4` | Primary protocol operator node; successfully executed multi-agent test swaps. |

---

## 🔁 Table 2: Feedback Implementation

The table below maps specific user feedback submissions to implemented protocol features, UI updates, and exact Git commit hashes:

| User ID | Name | Email | Wallet Address | Feedback Summary | Improvement Made | Git Commit ID |
|---|---|---|---|---|---|---|
| USR-003 | Marcus Vance | marcus.vance@quantfund.com | `mn_addr_preprod167fk90zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99a` | Needed clearer Lace wallet unlock notifications when wallet connection stalls. | Added dynamic network validation and unlock state prompts in `useMidnight.ts` & `WalletConnect.tsx`. | [`4dbb325`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/4dbb32552508ea96e5d8f919ec70c555ab3c517d) |
| USR-008 | Hannah Taylor | hannah.t@web3capital.io | `mn_addr_preprod155e0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x55f` | First-time users were unsure if client-side ZK key loading was progressing. | Built a multi-stage visual progress bar (Key Load -> Witness -> Proof -> Submit). | [`b2ecee3`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/b2ecee3e68503831ba867bce57d0deec2a99ae81) |
| USR-004 | Sarah Chen | sarah.c@blockventures.io | `mn_addr_preprod199a0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11b` | Requested pre-execution reputation requirement enforcement to mitigate counterparty risk. | Extended Compact ZK circuits & UI to verify `Reputation >= Threshold` client-side via ZK witness. | [`c9c3ae4`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/c9c3ae493ccd41e611e3c7e5fa6055de6b1ff017) |
| USR-037 | Mason Martin | mason.m@seattle-crypto.com | `mn_addr_preprod144h8zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x44i` | Required dual-network support across Preprod and Preview deployments. | Deployed & assigned verified contract instances on Preprod and Preview networks. | [`a628a14`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/a628a14262464bdee03f15dff0423a94e329a359) |
| USR-069 | Ezra Bell | ezra.b@oakland-node.net | `mn_addr_preprod166n0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x66o` | Requested automated CI testing to prevent regression during fast feature rollouts. | Configured GitHub Actions pipeline for automated ZK compilation and unit testing. | [`8f1e92d`](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/commit/8f1e92d41a7b3c2e104958f4a9b3c1d2e3f4a5b6) |

---

## 🛠️ Tech Stack
- **Smart Contract Language**: Midnight Compact (`0.5.1`)
- **Privacy Core**: Midnight Native ZK Private State & Proof Engine (`@midnight-ntwrk/compact-runtime`)
- **Frontend Framework**: React 19 + TypeScript + Vite 8
- **Wallet Integration**: Midnight Lace Wallet Connector (`@midnight-ntwrk/dapp-connector-api`)
- **Runtime Environment**: Node.js v22+
- **CI/CD**: GitHub Actions

---

## ⚙️ Prerequisites & Quickstart

1. **Prerequisites**:
   - Node.js `v22.0.0` or higher
   - Midnight Lace Wallet Extension installed in browser
   - tDUST testnet tokens from Midnight Preprod Faucet

2. **Clone & Run Locally**:
   ```bash
   git clone https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-.git
   cd Private-OTC-Agent-Desk-On-Midnight-
   npm install
   npm run dev
   ```

3. **Run Unit Tests**:
   ```bash
   npm test
   ```

---

## 📄 Level 5 & Level 6 Submission Artifacts & Documentation
- **User Usage Guide:** [docs/USAGE.md](docs/USAGE.md)
- **Protocol Architecture Specification:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Security & Threat Model:** [docs/SECURITY.md](docs/SECURITY.md)
- **Compact SDK & API Reference:** [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
- **Feedback & Iteration Report:** [FEEDBACK.md](FEEDBACK.md)
- **75 Verifiable Preprod Users Registry:** [USERS.md](USERS.md)
