/**
 * Interactive CLI for the Private OTC Agent Desk.
 *
 *   npm run cli                       # network from .midnight-state.json (default: local devnet)
 *   npm run cli -- --network preview
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import { ledger as decodeLedger } from '../contracts/managed/private-otc-desk/contract/index.js';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken } from './wallet';
import { createNodeProviders, ensureFundedWithDust, syncWallet, waitForProofServer } from './node-providers';
import { otcCompiledContract } from './protocol/chain';
import { runOnChainRound } from './protocol/onchain-round';
import { runScenario, type DeskEvent } from './protocol/scenario';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const { network, config: networkConfig } = resolveNetwork();
const zkConfigPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'contracts', 'managed', 'private-otc-desk');

const printEvent = (e: DeskEvent) => {
  const tag = e.status === 'rejected' ? '✕' : e.status === 'offchain' ? '·' : '✓';
  console.log(`  ${tag} [${e.actor}] ${e.title}${e.txIds?.length ? `  (${e.txIds.length} tx)` : ''}`);
};

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  console.log(`\n══ Private OTC Agent Desk CLI · ${network} ══\n`);

  const walletCtx = await createWallet({ network, networkConfig, seed: getOrCreateSeed(network) });
  try {
    await syncWallet(walletCtx, network);
    const providers = createNodeProviders(walletCtx, networkConfig, network, zkConfigPath, 'otc-cli-state');

    for (;;) {
      console.log('─── Menu ─────────────────────────────────────────────');
      console.log('  1. Run the agent story locally (compiled circuits, instant)');
      console.log('  2. Run one sealed RFQ round on-chain (deploys a fresh desk, 11 transactions)');
      console.log('  3. Query a desk’s public ledger');
      console.log('  4. Wallet balance (tNIGHT & DUST)');
      console.log('  5. Exit\n');
      const choice = (await rl.question('  Choice (1-5): ')).trim();

      try {
        if (choice === '1') {
          const gen = runScenario();
          for (let next = await gen.next(); !next.done; next = await gen.next()) printEvent(next.value);
        } else if (choice === '2') {
          await ensureFundedWithDust(walletCtx, network, networkConfig);
          if (!(await waitForProofServer(networkConfig.proofServer))) throw new Error('Proof server not responding (npm run proof-server:start)');
          const gen = runOnChainRound({
            providers: providers as any,
            compiledContract: otcCompiledContract(zkConfigPath),
            onStatus: (s) => console.log(`    … ${s}`),
          });
          for (let next = await gen.next(); ; next = await gen.next()) {
            if (next.done) {
              console.log(`\n  Desk ${next.value.address} · audit ${next.value.auditOk ? '✓' : '✕'}`);
              break;
            }
            printEvent(next.value);
          }
        } else if (choice === '3') {
          const fallback = getDeployment(network)?.address ?? '';
          const address = (await rl.question(`  Desk address${fallback ? ` [${fallback.slice(0, 12)}…]` : ''}: `)).trim() || fallback;
          if (!/^[0-9a-f]{64}$/i.test(address)) throw new Error('Expected a 64-character hex contract address');
          const state = await providers.publicDataProvider.queryContractState(address);
          if (!state) throw new Error('No contract at that address on this network');
          const l = decodeLedger(state.data);
          console.log(`\n  Trades settled: ${l.tradesSettled}`);
          console.log(`  Oracle TWAP (micro-USDC): ${l.oraclePrice} ±${l.oracleBandBps} bps`);
          console.log(`  Open RFQs: ${l.rfqs.size()} · live quotes: ${l.quotes.size()} · agents with mandates: ${l.mandates.size()}`);
        } else if (choice === '4') {
          const s = await walletCtx.wallet.waitForSyncedState();
          console.log(`\n  tNIGHT: ${(s.unshielded.balances[unshieldedToken().raw] ?? 0n).toLocaleString()}`);
          console.log(`  DUST:   ${s.dust.balance(new Date()).toLocaleString()}`);
        } else if (choice === '5') {
          break;
        } else {
          console.log('  Please enter 1-5.');
        }
      } catch (err) {
        console.error(`\n  ❌ ${err instanceof Error ? err.message : err}`);
      }
      console.log('');
    }
  } finally {
    rl.close();
    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌', err instanceof Error ? err.message : err);
    process.exit(1);
  });
