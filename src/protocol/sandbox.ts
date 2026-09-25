/**
 * One-shot circuit runs for the site's interactive panels. Each call deploys a fresh local
 * desk, so results come from the compiled circuits, not from a re-implementation.
 */
import { MandateOwner, MarketMakerAgent } from './agents';
import { CircuitRejected, DeskLedger, type Mandate, type QuoteTerms } from './desk';
import { randomBytes32, toHex } from './sealed-box';

export interface MandateTrial {
  commitment: string;
  ok: boolean;
  reason?: string;
}

/**
 * Sets `registered` as an agent's mandate, then has the agent quote `order` while claiming
 * `claimed` as its mandate. The oracle is centred on the order price with a ±100% band and
 * the vault is funded, so the only asserts that can fail are the mandate's.
 */
export async function tryMandate(registered: Mandate, claimed: Mandate, order: QuoteTerms): Promise<MandateTrial> {
  const desk = new DeskLedger({
    adminSecret: randomBytes32(),
    oraclePrice: order.price > 0n ? order.price : 1n,
    oracleBandBps: 10_000n,
    auditorKey: randomBytes32(),
  });
  const owner = new MandateOwner('owner', desk);
  const agent = await new MarketMakerAgent('agent', desk, 0n).init();
  await agent.depositQuote(order.price * order.size + 1n);
  await owner.grant(agent, registered);
  const commitment = toHex(desk.ledger.mandates.lookup(agent.publicKey));
  agent.mandate = { ...agent.mandate!, mandate: claimed };

  const taker = new MandateOwner('taker', desk); // any key can open an RFQ
  const rfqId = randomBytes32();
  await desk.call(taker.secretKey, 'openRfq', rfqId, randomBytes32(), BigInt(desk.now() + 300));
  try {
    await agent.quote({ rfqId, size: order.size, expiresAt: 0n, replyTo: agent.box.publicKey }, order);
    return { commitment, ok: true };
  } catch (err) {
    if (err instanceof CircuitRejected) return { commitment, ok: false, reason: err.reason };
    throw err;
  }
}
