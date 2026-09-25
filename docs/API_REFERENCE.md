# Compact Contract Integration Guide & TypeScript API Reference

Source: [`contracts/private-otc-desk.compact`](../contracts/private-otc-desk.compact). Compile with Compact 0.31.1 (it targets `compact-runtime` 0.16):

```bash
compact update 0.31.1
compact compile contracts/private-otc-desk.compact contracts/managed/private-otc-desk
```

Units: prices are QUOTE micro-units (6 decimals) per whole BASE token; sizes are whole BASE tokens.

## 1. Ledger

| Field | Type | Meaning |
|---|---|---|
| `admin` | `Bytes<32>` | Oracle key (deployer) |
| `auditorKey` | `Bytes<32>` | SHA-256 fingerprint of the auditor's viewing public key |
| `oraclePrice`, `oracleBandBps` | `Uint<64>` | TWAP and allowed band |
| `baseVaults`, `quoteVaults` | `Map<pk, commit(balance)>` | Private balances |
| `pendingMandates` | `Map<hash(agent, owner), commit(Mandate)>` | Proposed, not yet accepted |
| `mandates`, `mandateOwners` | `Map<agentPk, …>` | Active mandate commitment and the owner bound to the agent |
| `rfqs` | `Map<rfqId, Rfq{owner: commit(takerPk), expiresAt}>` | Open RFQs |
| `usedRfqIds` | `Set<rfqId>` | Every id ever opened (ids are single-use) |
| `quotes` | `Map<quoteId, Quote{maker, rfq, terms: commit(price,size), expiresAt, filled}>` | Sealed quotes |
| `receipts` | `Map<rfqId, commit(Receipt)>` | One per fill; opened by the auditor |
| `quotesPosted`, `fillsSettled` | `Map<pk, Uint<64>>` | Reputation counters |
| `tradesSettled` | `Counter` | Total fills |

Identity is `publicKey(sk) = persistentHash("otc-desk:pk:v1", sk)`, with `sk` supplied by the `secretKey()` witness.

## 2. Circuits

| Circuit | Caller | Proves / does |
|---|---|---|
| `postOraclePrice(twap)` | oracle key | Updates the TWAP |
| `depositBase/Quote(amount, oldBalance, oldSalt, newSalt)` | anyone | Opens the old vault commitment and writes `commit(old + amount)`. `amount` is public |
| `proposeMandate(agent, commitment)` | owner | Proposes a mandate. Once an owner is bound to the agent, only that owner can propose |
| `acceptMandate(owner, mandate, salt)` | agent | Proves the opening of that owner's proposal; activates it and binds the owner on first use |
| `revokeMandate(agent)` | bound owner | Removes the active mandate immediately (the owner stays bound) |
| `openRfq(rfqId, ownerSalt, expiresAt)` | taker | Fresh id, expiry in the future; registers the RFQ with a hidden owner |
| `submitQuote(rfqId, terms, termsSalt, mandate, mandateSalt, vaultBalance, vaultSalt, newVaultSalt)` | maker | RFQ open and unexpired; mandate; oracle band; `balance ≥ price×size`; escrows it and posts `commit(terms)` |
| `acceptQuote(rfqId, ownerSalt, maker, terms, termsSalt, floorPrice, mandate, mandateSalt, base…, quote…, receiptSalt)` | taker | Owns the RFQ; opening matches; `price ≥ floor`; mandate; band; `baseBalance ≥ size`; settles at `terms.price`; closes the RFQ; stores the receipt |
| `closeRfq(rfqId, ownerSalt)` | taker | Closes without filling |
| `claimFill(rfqId, terms, termsSalt, vault…)` | winning maker | Credits `size` BASE |
| `cancelQuote(rfqId, terms, termsSalt, vault…)` | losing/expired maker | Refunds escrow once the RFQ is closed or expired |

Pure helpers (same hashing off-chain): `publicKey`, `balanceCommitment`, `mandateCommitment`, `quoteCommitment`, `ownerCommitment`, `receiptCommitment`, `quoteId`, `pendingMandateKey`.

## 3. TypeScript

Agents work against the `Desk` interface, so the same code runs locally or on a network:

```typescript
import { DeskLedger } from './src/protocol/desk';
import { Auditor, MandateOwner, MarketMakerAgent, TreasurySellerAgent } from './src/protocol/agents';

const auditor = await new Auditor('auditor').init();
const desk = new DeskLedger({ adminSecret, oraclePrice: 842_000n, oracleBandBps: 300n, auditorKey: auditor.fingerprint });
// …or on-chain: const desk = new OnChainDesk(providers, otcCompiledContract(zkPath), address)  (src/protocol/chain.ts)

const seller = await new TreasurySellerAgent('treasury', desk, 830_000n /* private floor */).init();
const mm = await new MarketMakerAgent('mm', desk, 30n /* bps under TWAP */).init();
await seller.depositBase(600_000n);
await mm.depositQuote(600_000_000_000n);
await new MandateOwner('dao', desk).grant(seller, { maxNotional: 560_000_000_000n, minPrice: 800_000n, maxPrice: 950_000n }); // propose + accept
await new MandateOwner('mm-desk', desk).grant(mm, { maxNotional: 600_000_000_000n, minPrice: 780_000n, maxPrice: 900_000n });

const rfq = await seller.openRfq(600_000n);
const envelope = await mm.quote(rfq.request);                 // sealed to the seller
const [quote] = await seller.readQuotes(rfq, [envelope]);     // verified against the on-chain commitment
const fill = await seller.accept(rfq, quote, auditor.box.publicKey);
await mm.settle(rfq.rfqId);                                   // claimFill
const audit = await auditor.verify(desk, fill.receiptEnvelope); // audit.matchesLedger === true
```

A failed `assert` rejects with `CircuitRejected` (`err.reason` is the assert message) and leaves the ledger untouched. On-chain, that happens before anything is proved or submitted.

To deploy a fresh desk and run a round on a network: `deployDesk(providers, compiledContract, opts)` and `runOnChainRound({ providers, compiledContract })`. In the browser, `providers` come from `useMidnight().buildProviders('managed/private-otc-desk')`; in Node, from `createNodeProviders(...)` in `src/node-providers.ts`.
