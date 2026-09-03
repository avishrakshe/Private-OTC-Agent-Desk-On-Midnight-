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
import { AgentSimulator } from './simulator';

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
  const simulator = new AgentSimulator();

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
      console.log('  1. Register AI Trading Agent (ZK Reputation Proof)');
      console.log('  2. Settle Confidential Sealed-Bid Swap (Zero-Knowledge)');
      console.log('  3. Run Autonomous Agent OTC Trade Simulation');
      console.log('  4. Query Public Ledger OTC State & Settle Counters');
      console.log('  5. Check Wallet Balance (tNight & DUST)');
      console.log('  6. Exit\n');

      const choice = await rl.question('  Your choice (1-6): ');

      switch (choice.trim()) {
        case '1': {
          const scoreInput = await rl.question('  Enter Agent Reputation Score (e.g. 95): ');
          const score = BigInt(scoreInput.trim() || '95');
          console.log('\n  ⚡ Generating client-side ZK proof & submitting on-chain...');
          try {
            const tx = await deployed.callTx.registerAgent(score);
            console.log(`\n  ✅ AI Agent registered successfully!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error('\n  ❌ Registration failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '2': {
          const bidInput = await rl.question('  Buyer Max Bid (DUST, e.g. 5000): ');
          const askInput = await rl.question('  Seller Min Ask (DUST, e.g. 4800): ');
          const repInput = await rl.question('  Agent Reputation (e.g. 90): ');
          const buyerBid = BigInt(bidInput.trim() || '5000');
          const sellerAsk = BigInt(askInput.trim() || '4800');
          const rep = BigInt(repInput.trim() || '90');
          const receiptHash = `0xzk_swap_${Date.now().toString(36)}`;

          console.log('\n  ⚡ Proving sealed-bid matching constraints client-side (buyer >= seller)...');
          try {
            const tx = await deployed.callTx.settleSealedBidSwap(buyerBid, sellerAsk, rep, receiptHash);
            console.log(`\n  ✅ Confidential OTC Swap Settled on Midnight!`);
            console.log(`  Receipt Hash: ${receiptHash}`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error('\n  ❌ Settlement failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '3': {
          console.log('\n  🤖 Running autonomous multi-agent simulation round...');
          const witnessA = simulator.generateConfidentialWitness(
            { agentId: 'bot-1', name: 'AlphaArbitrage', baseReputation: 96, tradeStrategy: 'ARBITRAGE' },
            'DUST/USDC',
            'BUY',
            5200n,
            1000n
          );
          const witnessB = simulator.generateConfidentialWitness(
            { agentId: 'bot-2', name: 'DeepLiquidity', baseReputation: 91, tradeStrategy: 'PASSIVE' },
            'DUST/USDC',
            'SELL',
            5000n,
            1000n
          );

          const simResult = simulator.simulateMatch(witnessA, witnessB, 'DUST/USDC', 80);
          if (simResult.success && simResult.receipt) {
            console.log('  ✅ Simulation Match Validated:');
            console.log(`     Order ID: ${simResult.receipt.orderId}`);
            console.log(`     Pair: ${simResult.receipt.assetPair}`);
            console.log(`     Proof Hash: ${simResult.receipt.proofReceiptHash}`);
            console.log(`     Settled at Block: ${simResult.receipt.settledAtBlock}\n`);
          } else {
            console.log(`  ❌ Simulation failed: ${simResult.reason}\n`);
          }
          break;
        }

        case '4': {
          console.log('\n  Querying on-chain OTC ledger state...');
          try {
            const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
            if (contractState) {
              const ledgerState = PrivateOtcDesk.ledger(contractState.data);
              console.log(`\n  📊 On-Chain OTC Protocol Metrics:`);
              console.log(`     Total Agents Registered: ${ledgerState.totalAgents.toString()}`);
              console.log(`     Total Trades Settled: ${ledgerState.totalTradesSettled.toString()}`);
              console.log(`     Min Reputation Threshold: ${ledgerState.minReputationThreshold.toString()}\n`);
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
