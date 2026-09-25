/**
 * CLI for interacting with Private OTC Agent Desk on Midnight
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

// Midnight SDK imports
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { runScenario } from './protocol/scenario';

// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

// Must match the privateStateId used at deploy time so the CLI reconnects to the same private state.
const PRIVATE_STATE_ID = 'privateOtcDeskPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'private-otc-desk');

// Load compiled contract
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

// Check if contract is compiled
if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const PrivateOtcDesk = await import(pathToFileURL(contractPath).href);

const compiledContract = CompiledContract.make('private-otc-desk', PrivateOtcDesk.Contract).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

// ─── Providers ─────────────────────────────────────────────────────────────────

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    coinPublicKey: walletCtx.wallet.state.coinPublicKey,
    balanceTx: walletCtx.wallet.balanceTx.bind(walletCtx.wallet),
  };

  const publicDataProvider = indexerPublicDataProvider(
    networkConfig.indexer,
    networkConfig.indexerWS,
  );

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const proofProvider = httpClientProofProvider(networkConfig.proverServer);

  const privateStatePath = path.resolve(__dirname, '..', '.private-state');
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: privateStatePath,
    password: privateStatePassword,
  });

  return {
    walletProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    privateStateProvider,
  };
}

// ─── Main Interactive Loop ───────────────────────────────────────────────────────

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    console.log('\n=============================================================');
    console.log('  🔒 Private OTC Agent Desk on Midnight — Interactive CLI');
    console.log(`  Network: ${network}`);
    console.log('=============================================================\n');

    // Get deployment
    const deployment = getDeployment(network);
    if (!deployment) {
      console.error(`\n❌ No deployment found for network "${network}".`);
      console.error('   Please deploy first using: npm run deploy\n');
      process.exit(1);
    }

    console.log(`  Contract Address: ${deployment.address}`);
    console.log(`  Deployed at: ${deployment.deployedAt}\n`);

    // Initialize wallet
    console.log('  Initializing Midnight wallet...');
    const walletCtx = await createWallet(network, SEED);
    console.log(`  Wallet address: ${walletCtx.address}\n`);

    // Setup providers and connect to contract
    console.log('  Connecting to Midnight OTC smart contract...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });

    console.log('  ✅ Connected!\n');

    // Interactive CLI loop
    let running = true;
    while (running) {
      console.log('─── Private OTC Desk Menu ──────────────────────────────────────');
      console.log('  1. Run sealed RFQ agent demo (compiled circuits, local)');
      console.log('  2. (reserved: on-chain RFQ calls need the RFQ contract deployed)');
      console.log('  3. (reserved)');
      console.log('  4. Query public OTC ledger state');
      console.log('  5. Check Wallet Balance (tNight & DUST)');
      console.log('  6. Exit\n');

      const choice = await rl.question('  Your choice (1-6): ');

      switch (choice.trim()) {
        case '1': {
          console.log('\n  🤖 Treasury Seller vs 3 Market Makers, sealed RFQ (see: npm run agents)...');
          const gen = runScenario();
          for (let next = await gen.next(); ; next = await gen.next()) {
            if (next.done) {
              for (const a of next.value.audits) console.log(`     audited ${a.ok ? '✓' : '✕'} ${a.size} DAO → ${a.maker}`);
              break;
            }
            const e = next.value;
            console.log(`  ${e.status === 'rejected' ? '✕' : '✓'} [${e.actor}] ${e.title}`);
          }
          console.log('');
          break;
        }

        case '2':
        case '3':
          console.log('\n  Not available yet: deploy contracts/private-otc-desk.compact first.\n');
          break;

        case '4': {
          console.log('\n  Querying on-chain OTC ledger state...');
          try {
            const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
            if (contractState) {
              const ledgerState = PrivateOtcDesk.ledger(contractState.data);
              console.log(`\n  📊 On-Chain OTC Protocol Metrics:`);
              console.log(`     Trades settled: ${ledgerState.tradesSettled.toString()}`);
              console.log(`     Oracle TWAP (micro-USDC): ${ledgerState.oraclePrice.toString()} ±${ledgerState.oracleBandBps.toString()} bps`);
              console.log(`     Open RFQs: ${ledgerState.rfqs.size().toString()}  Live quotes: ${ledgerState.quotes.size().toString()}\n`);
            } else {
              console.log('\n  📊 No ledger state found (empty).\n');
            }
          } catch (error) {
            console.error('\n  ❌ Query failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '5': {
          console.log('\n  Checking wallet balances...');
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST: ${dustBalance.toLocaleString()}\n`);
          break;
        }

        case '6':
          running = false;
          console.log('\n  👋 Exiting Private OTC Desk CLI.\n');
          break;

        default:
          console.log('\n  ❌ Invalid choice. Please enter 1-6.\n');
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
