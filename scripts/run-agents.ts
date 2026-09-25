/**
 * Runs the Treasury Seller vs Market Maker demo against the compiled contract and prints,
 * for every step, what the acting agent knows and what the chain sees.
 *
 *   npm run agents
 */
import { runScenario } from '../src/protocol/scenario';
import { fmtPrice, fmtQty } from '../src/protocol/agents';

const gen = runScenario();
let phase = '';
for (let next = await gen.next(); ; next = await gen.next()) {
  if (next.done) {
    console.log('\n── Reputation (derived from ledger history) ──');
    for (const r of next.value.reputation) console.log(`  ${r.name.padEnd(18)} quotes ${r.quotes}  fills ${r.fills}`);
    console.log('\n── Audited fills ──');
    for (const a of next.value.audits) console.log(`  ${a.ok ? '✓' : '✕'} ${fmtQty(a.size)} DAO → ${a.maker} @ ${fmtPrice(a.price)}`);
    break;
  }
  const e = next.value;
  if (e.phase !== phase) console.log(`\n══ ${(phase = e.phase)} ══`);
  const tag = e.status === 'rejected' ? '✕ REJECTED' : e.status === 'offchain' ? '· off-chain' : '✓';
  console.log(`\n${String(e.step).padStart(2)}. [${e.actor}] ${e.title}  ${tag}${e.circuit ? `  (${e.circuit})` : ''}`);
  for (const l of e.privateView) console.log(`     private │ ${l}`);
  for (const l of e.publicView) console.log(`     chain   │ ${l}`);
  if (e.status === 'rejected') console.log('     chain   │ (nothing: no proof, no transaction)');
}
