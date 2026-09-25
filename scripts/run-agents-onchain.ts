/**
 * Runs one sealed-RFQ round with real transactions: deploys a fresh desk, then the Treasury
 * Seller and a Market Maker trade on it. Every step is proved by the proof server and
 * submitted from the seed wallet in .midnight-state.json.
 *
 *   npm run agents:onchain                      # local devnet (docker compose up -d)
 *   npm run agents:onchain -- --network preview # needs a funded wallet (see npm run deploy:otc)
 */
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import { resolveNetwork, getOrCreateSeed } from '../src/network';
import { createWallet, persistWalletState } from '../src/wallet';
import { createNodeProviders, ensureFundedWithDust, syncWallet, waitForProofServer } from '../src/node-providers';
import { otcCompiledContract } from '../src/protocol/chain';
import { runOnChainRound } from '../src/protocol/onchain-round';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const { network, config } = resolveNetwork();
const zkConfigPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'contracts', 'managed', 'private-otc-desk');

const walletCtx = await createWallet({ network, networkConfig: config, seed: getOrCreateSeed(network) });
try {
  await syncWallet(walletCtx, network);
  await ensureFundedWithDust(walletCtx, network, config);
  if (!(await waitForProofServer(config.proofServer))) throw new Error('Proof server not responding (npm run proof-server:start)');

  const providers = createNodeProviders(walletCtx, config, network, zkConfigPath, 'otc-agents-state');
  const gen = runOnChainRound({
    providers: providers as any,
    compiledContract: otcCompiledContract(zkConfigPath),
    onStatus: (s) => console.log(`  … ${s}`),
  });
  for (let next = await gen.next(); ; next = await gen.next()) {
    if (next.done) {
      console.log(`\n  Desk ${next.value.address} · audit ${next.value.auditOk ? '✓ verified' : '✕ FAILED'}\n`);
      if (!next.value.auditOk) process.exitCode = 1;
      break;
    }
    const e = next.value;
    const tag = e.status === 'rejected' ? '✕ REJECTED' : e.status === 'offchain' ? '· off-chain' : '✓';
    console.log(`\n${String(e.step).padStart(2)}. [${e.actor}] ${e.title}  ${tag}`);
    for (const l of e.privateView) console.log(`     private │ ${l}`);
    for (const l of e.publicView) console.log(`     chain   │ ${l}`);
    for (const t of e.txIds ?? []) console.log(`     tx      │ ${t}`);
  }
} finally {
  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
}
process.exit(process.exitCode ?? 0);
