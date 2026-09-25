/**
 * One sealed-RFQ round on a real Midnight network, sized for a live demo:
 *
 *   deploy a fresh desk → deposits → mandates → RFQ → a blocked fat-finger quote (no tx)
 *   → sealed quote → match proof → claim → audit
 *
 * That's 11 transactions: deployDesk(1) + deposits(2) + mandates(4) + openRfq + submitQuote
 * + acceptQuote + claimFill. In the browser each one is proved and then approved in Lace.
 */
import { Auditor, MandateOwner, MarketMakerAgent, TreasurySellerAgent, fmtPrice, fmtQty, fmtUsd } from './agents';
import { OnChainDesk, deployDesk, type OtcProviders } from './chain';
import { EventRecorder, SCENARIO, attempt, auditEvent, usd, type DeskEvent, type EventInput } from './scenario';
import { randomBytes32, toHex } from './sealed-box';

export const ROUND = {
  size: 600_000n,
  twap: SCENARIO.twap[0],
  bandBps: SCENARIO.bandBps,
  floor: SCENARIO.floor,
  /** On-chain transactions are slow; give the RFQ an hour. */
  rfqTtlSeconds: 3600,
  transactions: 11,
};

export interface OnChainRoundOptions {
  providers: OtcProviders;
  compiledContract: any;
  /** Progress text while a transaction is being proved / approved / confirmed. */
  onStatus?: (status: string) => void;
}

export interface OnChainRoundResult {
  address: string;
  auditOk: boolean;
}

export async function* runOnChainRound(opts: OnChainRoundOptions): AsyncGenerator<DeskEvent, OnChainRoundResult> {
  const status = opts.onStatus ?? (() => {});
  const auditor = await new Auditor('Auditor').init();
  const adminSecret = randomBytes32();

  status('Deploying a fresh desk contract (1/11)…');
  const { address, txId: deployTx } = await deployDesk(opts.providers, opts.compiledContract, {
    oraclePrice: ROUND.twap,
    oracleBandBps: ROUND.bandBps,
    auditorKey: auditor.fingerprint,
    adminSecret,
  });

  const desk = new OnChainDesk(opts.providers, opts.compiledContract, address);
  const rec = new EventRecorder(desk);
  await rec.start();
  let n = 1;
  const next = (what: string) => status(`${what} (${++n}/${ROUND.transactions})…`);
  const ev = (e: EventInput) => rec.event({ ...e, txIds: desk.drainTxIds() });

  yield await rec.event({
    phase: 'Deploy',
    actor: 'Desk',
    role: 'oracle',
    title: 'Fresh desk deployed through your wallet',
    circuit: 'deploy',
    status: 'ok',
    privateView: [
      `Contract ${address.slice(0, 12)}…${address.slice(-6)}`,
      `Oracle TWAP ${fmtPrice(ROUND.twap)}, band ±${Number(ROUND.bandBps) / 100}%`,
      'Oracle key and auditor viewing key were generated in this browser and stay in memory',
    ],
    disclosed: [`contract = ${address}`, `auditorKey = ${toHex(auditor.fingerprint).slice(0, 6)}…`],
    txIds: deployTx ? [deployTx] : [],
  });

  const dao = new MandateOwner('DAO multisig', desk);
  const mmDesk = new MandateOwner('Northwind desk head', desk);
  const treasury = await new TreasurySellerAgent('Treasury Seller', desk, ROUND.floor).init();
  const mm = await new MarketMakerAgent('Northwind MM', desk, 30n).init();
  const notionalCap = usd(600_000);

  next('Treasury escrows DAO');
  await treasury.depositBase(ROUND.size);
  yield await ev({
    phase: 'Setup',
    actor: treasury.name,
    role: 'treasury',
    title: `Treasury escrows ${fmtQty(ROUND.size)} DAO`,
    circuit: 'depositBase',
    status: 'ok',
    privateView: [`Vault balance ${fmtQty(treasury.baseVault.balance)} DAO`],
    disclosed: [`amount = ${ROUND.size} (deposit amounts are public)`],
  });

  next('Market maker funds its vault');
  await mm.depositQuote(notionalCap);
  yield await ev({
    phase: 'Setup',
    actor: mm.name,
    role: 'maker',
    title: `${mm.name} funds its QUOTE vault`,
    circuit: 'depositQuote',
    status: 'ok',
    privateView: [`Vault balance ${fmtUsd(mm.quoteVault.balance)} USDC`],
    disclosed: [`amount = ${notionalCap} (deposit amounts are public)`],
  });

  next('DAO proposes the Treasury mandate');
  const treasuryGrant = await dao.propose(treasury, SCENARIO.treasuryMandate);
  next('Treasury agent accepts it');
  await treasury.acceptMandate(treasuryGrant);
  yield await ev({
    phase: 'Mandates',
    actor: dao.name,
    role: 'owner',
    title: 'Mandate proposed by the DAO and accepted by the Treasury agent',
    circuit: 'proposeMandate → acceptMandate',
    status: 'ok',
    privateView: ['Max notional $560,000 per order', 'Price band $0.80 – $0.95'],
  });

  next('Northwind desk proposes its mandate');
  const mmGrant = await mmDesk.propose(mm, SCENARIO.makerMandate);
  next('Northwind agent accepts it');
  await mm.acceptMandate(mmGrant);
  yield await ev({
    phase: 'Mandates',
    actor: mmDesk.name,
    role: 'owner',
    title: `Mandate set for ${mm.name}`,
    circuit: 'proposeMandate → acceptMandate',
    status: 'ok',
    privateView: ['Max notional $600,000 per order', 'Price band $0.78 – $0.90'],
  });

  next('Treasury opens a sealed RFQ');
  const rfq = await treasury.openRfq(ROUND.size, ROUND.rfqTtlSeconds);
  yield await ev({
    phase: 'RFQ',
    actor: treasury.name,
    role: 'treasury',
    title: 'Sealed RFQ opened',
    circuit: 'openRfq',
    status: 'ok',
    privateView: [`Selling ${fmtQty(ROUND.size)} DAO; private floor ${fmtPrice(treasury.floorPrice)}`, 'IOI sent to Northwind MM'],
  });

  status('Market maker tries a fat-finger quote (checked locally, never sent)…');
  const err = await attempt(() => mm.quote(rfq.request, { price: usd(0.8842) }));
  yield await ev({
    phase: 'RFQ',
    actor: mm.name,
    role: 'maker',
    title: 'Fat-finger quote at $0.8842 blocked by the oracle band',
    circuit: 'submitQuote',
    status: 'rejected',
    privateView: [`Circuit: ${err?.reason ?? 'accepted?!'}`, 'The assert failed before proving: no transaction, no wallet prompt'],
  });

  next('Market maker posts a sealed, escrowed quote');
  const bid = await mm.bidPrice();
  const envelope = await mm.quote(rfq.request);
  yield await ev({
    phase: 'RFQ',
    actor: mm.name,
    role: 'maker',
    title: `${mm.name} posts a sealed, escrowed quote`,
    circuit: 'submitQuote',
    status: 'ok',
    privateView: [`Bid ${fmtPrice(bid)} × ${fmtQty(ROUND.size)} DAO`, `Escrowed ${fmtUsd(bid * ROUND.size)}`],
  });

  const [opening] = await treasury.readQuotes(rfq, [envelope]);
  const best = opening && treasury.choose([opening]);
  if (!best) throw new Error('The quote did not verify against the chain or did not clear the floor');

  next('Treasury proves the match');
  const fill = await treasury.accept(rfq, best, auditor.box.publicKey);
  yield await ev({
    phase: 'Match',
    actor: treasury.name,
    role: 'treasury',
    title: 'Match proven and settled at the maker’s price',
    circuit: 'acceptQuote',
    status: 'ok',
    privateView: [`Sold ${fmtQty(best.terms.size)} DAO at ${fmtPrice(best.terms.price)}`, 'Proven: quote ≥ floor, mandate, oracle band, funds'],
  });

  next('Market maker claims its DAO');
  await mm.settle(rfq.rfqId);
  yield await ev({
    phase: 'Match',
    actor: mm.name,
    role: 'maker',
    title: `${mm.name} claims its DAO`,
    circuit: 'claimFill',
    status: 'ok',
    privateView: [`BASE vault ${fmtQty(mm.baseVault.balance)} DAO`],
  });

  status('Auditor verifies the receipt…');
  const audit = await auditor.verify(desk, fill.receiptEnvelope);
  yield await ev(
    auditEvent(auditor.name, [{ price: audit.receipt.price, size: audit.receipt.size, maker: mm.name, ok: audit.matchesLedger }]),
  );

  status('Done');
  return { address, auditOk: audit.matchesLedger };
}
