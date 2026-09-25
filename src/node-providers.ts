/**
 * Node-side Midnight.js plumbing shared by the deploy script, the CLI and the on-chain agent
 * runner: wallet sync, funding + DUST registration, and provider construction.
 */
import { inspect } from 'node:util';
import * as Rx from 'rxjs';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import type { NetworkConfig, NetworkId } from './network';
import { persistWalletState, unshieldedToken, type WalletContext } from './wallet';

const LOCAL_PLACEHOLDER_PASSWORD = 'Local-Devnet-Development-Placeholder-1';

/**
 * Password for the encrypted private-state store (it holds contract secret keys).
 * The SDK requires at least 16 characters. The placeholder is only acceptable on the local
 * devnet; on public networks we warn loudly so real keys aren't protected by a public string.
 */
export function privateStatePassword(network: NetworkId): string {
  const fromEnv = process.env.PRIVATE_STATE_PASSWORD?.trim();
  if (fromEnv) {
    if (fromEnv.length < 16) throw new Error('PRIVATE_STATE_PASSWORD must be at least 16 characters.');
    return fromEnv;
  }
  if (network !== 'undeployed') {
    process.stderr.write(
      '\n  ⚠ PRIVATE_STATE_PASSWORD is not set: private state (contract secret keys) will be encrypted\n' +
        '    with a public placeholder password. Set PRIVATE_STATE_PASSWORD for anything you care about.\n\n',
    );
  }
  return LOCAL_PLACEHOLDER_PASSWORD;
}

/** The proof-server image is distroless and has no healthcheck; poll it from the host. */
export async function waitForProofServer(url: string, maxAttempts = 60, delayMs = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(url, { method: 'GET', signal: AbortSignal.timeout(3000) });
      return true;
    } catch (err: any) {
      const code = err?.cause?.code || err?.code || '';
      if (code !== 'ECONNREFUSED' && code !== 'UND_ERR_CONNECT_TIMEOUT' && code !== 'UND_ERR_SOCKET') return true;
    }
    if (attempt < maxAttempts) {
      process.stdout.write(`\r  Waiting for proof server... (${attempt}/${maxAttempts})   `);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

/**
 * Public RPC endpoints close websockets mid-submit ("disconnected from wss://…: 1000").
 * Resubmitting the identical signed transaction is safe: if the first attempt landed, the node
 * reports it as already known and we treat that as submitted.
 */
async function submitWithRetry(submit: () => Promise<unknown>, tx: any, attempts = 5): Promise<any> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await submit();
    } catch (err) {
      const msg = inspect(err, { depth: 8 });
      if (attempt > 1 && /already|AlreadyImported|Temporarily banned|duplicate/i.test(msg)) {
        const [txId] = tx.identifiers?.() ?? [];
        if (txId) return txId;
      }
      if (!msg.includes('disconnected from') || attempt >= attempts) throw err;
      process.stdout.write(`\r  RPC connection dropped while submitting; retrying (${attempt}/${attempts - 1})...   \n`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

export function createNodeProviders(
  walletCtx: WalletContext,
  networkConfig: NetworkConfig,
  network: NetworkId,
  zkConfigPath: string,
  privateStateStoreName: string,
) {
  const password = privateStatePassword(network);
  const walletProvider = {
    // In Midnight.js 4.1.x the WalletProvider interface returns the key objects directly.
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      // balanceUnboundTransaction -> finalizeRecipe is the complete balancing path in wallet-sdk 1.x.
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => submitWithRetry(() => walletCtx.wallet.submitTransaction(tx), tx),
  };
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName,
      accountId: walletCtx.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => password,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

/** Waits for the wallet to sync, printing progress, and persists the sync state. */
export async function syncWallet(walletCtx: WalletContext, network: NetworkId) {
  console.log('  Syncing with network (RPC disconnection messages during sync are normal)...');
  const start = Date.now();
  const timer = setInterval(() => {
    process.stdout.write(`\r  ⏳ Still syncing... (${Math.round((Date.now() - start) / 1000)}s elapsed)   `);
  }, 5000);
  const state = await walletCtx.wallet.waitForSyncedState();
  clearInterval(timer);
  process.stdout.write('\r  ✓ Synced with network.                                      \n');
  await persistWalletState(network, walletCtx);
  return state;
}

const syncedState = (walletCtx: WalletContext) =>
  Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));

/**
 * Makes sure the wallet can pay fees: waits for faucet funds on public networks, registers
 * NIGHT UTXOs for DUST generation (retrying while generated DUST accrues or the RPC drops),
 * and waits for a DUST balance.
 */
export async function ensureFundedWithDust(walletCtx: WalletContext, network: NetworkId, networkConfig: NetworkConfig) {
  const address = walletCtx.unshieldedKeystore.getBech32Address();
  const tNight = (s: Awaited<ReturnType<typeof syncedState>>) => s.unshielded.balances[unshieldedToken().raw] ?? 0n;

  let state = await syncedState(walletCtx);
  console.log(`\n  Wallet address: ${address}`);
  console.log(`  Balance: ${tNight(state).toLocaleString()} tNight\n`);

  if (tNight(state) === 0n) {
    if (network === 'undeployed' || !networkConfig.faucet) {
      throw new Error('Wallet has no NIGHT. On the local devnet check `docker compose ps`; then `docker compose down -v` and retry.');
    }
    console.log(`  Fund it from the faucet: ${networkConfig.faucet}\n  Waiting for tNIGHT (poll every 10s)...`);
    const rawTimeout = Number(process.env.MIDNIGHT_FAUCET_TIMEOUT_MS);
    const timeoutMs = Number.isFinite(rawTimeout) && rawTimeout > 0 ? rawTimeout : 600_000;
    const start = Date.now();
    while (tNight(state) === 0n) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Funding not received within ${Math.round(timeoutMs / 60_000)} min. Address: ${address}`);
      }
      await new Promise((r) => setTimeout(r, 10_000));
      state = await syncedState(walletCtx);
    }
    console.log(`  Funded! tNIGHT balance: ${tNight(state).toLocaleString()}\n`);
  }

  const unregistered = state.unshielded.availableCoins.filter((c: any) => !c.meta?.registeredForDustGeneration);
  if (unregistered.length > 0) {
    console.log(`  Registering ${unregistered.length} NIGHT UTXOs for DUST generation...`);
    // The signing callback already produces one signature per input; don't signRecipe again
    // (the chain rejects double signatures with InputsSignaturesLengthMismatch).
    for (let attempt = 1; ; attempt++) {
      try {
        const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
          unregistered,
          walletCtx.unshieldedKeystore.getPublicKey(),
          (payload) => walletCtx.unshieldedKeystore.signData(payload),
        );
        await walletCtx.wallet.submitTransaction(await walletCtx.wallet.finalizeRecipe(recipe));
        break;
      } catch (err) {
        // A freshly funded UTXO must first accrue enough generated DUST to pay the fee, and
        // public RPC endpoints drop websocket connections mid-submit.
        const msg = inspect(err, { depth: 8 });
        const retryable = msg.includes('Insufficient generated dust') || msg.includes('disconnected from');
        if (!retryable || attempt >= 40) throw err;
        process.stdout.write(`\r  DUST registration not accepted yet, retrying... (${attempt})   `);
        await new Promise((r) => setTimeout(r, 15_000));
      }
    }
  }

  if (state.dust.balance(new Date()) === 0n) {
    console.log('  Waiting for DUST tokens...');
    await Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }
  console.log('  DUST tokens ready!\n');
  return address;
}
