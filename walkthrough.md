# Midnight Builder Challenge — Level 5 & Level 6 Complete Walkthrough

> **Correction (2026-09-28):** an earlier version of this page said all Level 5 and Level 6
> requirements were complete and listed 71 users. That was not true. 73 of the listed wallet
> addresses were not real (see [USERS.md](USERS.md)). Level 5 (50 Preprod users) and Level 6
> (Mainnet deployment, 20 real users) are **not** complete.

---

## 🛠️ Summary of Level 5 & Level 6 Fulfillments

1. **Live dApp and deployed contracts**:
   - **Live dApp URL:** [https://mn-demo.vercel.app](https://mn-demo.vercel.app) (runs on Preview)
   - **Preprod contracts:** not deployed yet. See Deployments in the [README](README.md#-deployments).
   - **Verified Deployed Contract Address (Preview):** [`7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1`](https://preview.midnightexplorer.com/contracts/7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1) (Block: `65647`, Tx: `f149a1ef0aa6ac11d6ba7091cae6a3c4fc659d3b1d136a68162fba54814d0827`)

2. **Google Feedback Form & Public Excel Spreadsheet**:
   - **Google Form URL:** [Private OTC Agent Desk User Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfLwxO_XuvqTr78an-xnS0GPSlay3ZHFDSHeELxKrc5Ncfw5A/viewform?usp=publish-editor)
   - **Exported Excel / Google Sheet URL:** [Public Preprod User Feedback Spreadsheet](https://docs.google.com/spreadsheets/d/1wYLkzEDVUPkoOcz2VbPSJtYDTvIX2PB5fIUKfeUGfZ4/edit?usp=sharing)
   - *Questions included:* Name, Email, Wallet Address, Overall Product Rating, Most Liked Feature, Missing Features, Usability/Bug Reports, Recommendation Rating, Suggested Improvements.

3. **Product changes with commit links**: see the iteration log in [FEEDBACK.md](FEEDBACK.md).
   These were team-driven changes, not responses to user feedback.

4. **Users**: see [USERS.md](USERS.md). Only testers whose wallet passes `npm run verify-users` are listed.

5. **Social Media Handles & Published Update Posts**:
   - Official X Profile ([@DefiAipy](https://x.com/DefiAipy)) & Developer Profile ([@ARakshe34041](https://x.com/ARakshe34041))
   - Discord & Telegram handles
   - 3 Published Product Update Posts on Medium & X

---

## 🧪 Automated Unit Verification Results

```text
▶ Midnight Level 4 — Private OTC Agent Desk Test Suite
  ✔ a) Circuit Logic — registers agents, verifies ZK reputation threshold, & settles sealed-bid swaps
  ✔ b) State Transitions — updates agent registration counter and trade settlement receipts correctly
  ✔ c) Privacy Preservation — private witnesses (bids, reputation scores, identities) are never exposed
  ✔ d) Constraint Enforcement — rejects sealed bids when price mismatches or reputation is insufficient
✔ Midnight Level 4 — Private OTC Agent Desk Test Suite (4 tests passed)
```
