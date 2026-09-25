/**
 * Deploy a contract to a Midnight network (undeployed by default; use --network preview|preprod).
 *
 *   npm run deploy                          # hello-world (storeMessage demo)
 *   npm run deploy:otc -- --network preview # the sealed RFQ desk
 *
 * Non-interactive: no readline prompts. The wallet seed lives in .midnight-state.json (gitignored)
 * or MIDNIGHT_WALLET_SEED.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { resolveNetwork, getOrCreateSeed, recordDeployment } from './network';
import { createWallet, persistWalletState } from './wallet';
import { createNodeProviders, ensureFundedWithDust, syncWallet, waitForProofServer } from './node-providers';
import { otcCompiledContract, type OtcPrivateState } from './protocol/chain';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const DEPLOY_OTC =
  process.argv.includes('--contract=otc') || process.argv.some((a, i) => a === '--contract' && process.argv[i + 1] === 'otc');
const contractName = DEPLOY_OTC ? 'private-otc-desk' : 'hello-world';
const PRIVATE_STATE_ID = DEPLOY_OTC ? 'privateOtcDeskPrivateState' : 'helloWorldPrivateState';

const { network, config: networkConfig } = resolveNetwork();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', contractName);
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}
if (DEPLOY_OTC && !fs.existsSync(path.join(zkConfigPath, 'keys', 'acceptQuote.prover'))) {
  console.error('\n❌ Prover keys missing (they are gitignored). Recompile private-otc-desk.compact without --skip-zk.\n');
  process.exit(1);
}

async function loadCompiledContract() {
  if (DEPLOY_OTC) return otcCompiledContract(zkConfigPath);
  const HelloWorld = await import(pathToFileURL(contractPath).href);
  return CompiledContract.make('hello-world', HelloWorld.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );
}

/** Oracle/admin key and auditor viewing key for the RFQ desk, saved locally (gitignored). */
const OTC_KEYS_FILE = path.resolve(__dirname, '..', '.otc-desk-keys.json');
const OTC_INITIAL_TWAP = 842_000n; // $0.842 in QUOTE micro-units
const OTC_BAND_BPS = 300n; // ±3%

async function prepareOtcDeploy(): Promise<{ args: unknown[]; initialPrivateState: OtcPrivateState }> {
  const subtle = globalThis.crypto.subtle;
  const adminSecret = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(32))).toString('hex');
  const auditor = (await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair;
  const auditorPublic = new Uint8Array(await subtle.exportKey('raw', auditor.publicKey));
  const fingerprint = new Uint8Array(await subtle.digest('SHA-256', auditorPublic));
  if (fs.existsSync(OTC_KEYS_FILE)) {
    // Never silently overwrite the only copy of a live desk's oracle key.
    const backup = `${OTC_KEYS_FILE}.${Date.now()}.bak`;
    fs.copyFileSync(OTC_KEYS_FILE, backup);
    console.log(`  Previous keys backed up to ${path.basename(backup)}`);
  }
  fs.writeFileSync(
    OTC_KEYS_FILE,
    JSON.stringify(
      {
        network,
        createdAt: new Date().toISOString(),
        oracleAdminSecretKey: adminSecret,
        auditorViewingKey: {
          publicKeyRaw: Buffer.from(auditorPublic).toString('hex'),
          fingerprint: Buffer.from(fingerprint).toString('hex'),
          privateKeyJwk: await subtle.exportKey('jwk', auditor.privateKey),
        },
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.log(`  Oracle key + auditor viewing key written to ${path.basename(OTC_KEYS_FILE)} (keep it private)`);
  return { args: [OTC_INITIAL_TWAP, OTC_BAND_BPS, fingerprint], initialPrivateState: { secretKey: adminSecret } };
}

async function main() {
  console.log(`\n══ Deploy ${contractName} to ${network} ══\n`);

  const walletCtx = await createWallet({ network, networkConfig, seed: getOrCreateSeed(network) });
  const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
  if (restoredCount > 0) console.log(`  Restored ${restoredCount}/3 child wallets from .midnight-wallet-state.`);

  try {
    await syncWallet(walletCtx, network);
    const address = await ensureFundedWithDust(walletCtx, network, networkConfig);

    console.log('  Checking proof server...');
    if (!(await waitForProofServer(networkConfig.proofServer))) {
      throw new Error('Proof server not responding. Run: npm run proof-server:start');
    }

    const providers = createNodeProviders(
      walletCtx,
      networkConfig,
      network,
      zkConfigPath,
      DEPLOY_OTC ? 'otc-desk-state' : 'hello-world-state',
    );
    const compiledContract = await loadCompiledContract();
    const deployInputs = DEPLOY_OTC ? await prepareOtcDeploy() : { args: [], initialPrivateState: {} };

    // The wallet's DUST balance is a time projection; the tx builder only spends what the next
    // block accounts for. Pause ~1 block before the first attempt, then retry on DUST shortage.
    await new Promise((r) => setTimeout(r, 6000));
    console.log('  Deploying contract...\n');

    const MAX_RETRIES = 20;
    const RETRY_DELAY_MS = 5000;
    let deployed: Awaited<ReturnType<typeof deployContract>> | undefined;
    for (let attempt = 1; attempt <= MAX_RETRIES && !deployed; attempt++) {
      try {
        deployed = await deployContract(providers as any, {
          compiledContract: compiledContract as any,
          args: deployInputs.args as any,
          privateStateId: PRIVATE_STATE_ID,
          initialPrivateState: deployInputs.initialPrivateState as any,
        });
      } catch (err: any) {
        const full = `${err?.message ?? err} ${err?.cause?.message ?? ''}`;
        const dustShortage = /Not enough Dust|Insufficient Funds|could not balance dust/.test(full);
        if (!dustShortage || attempt === MAX_RETRIES) throw err;
        console.log(`  Still generating DUST, retrying in ${RETRY_DELAY_MS / 1000}s (${attempt}/${MAX_RETRIES})...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
    if (!deployed) throw new Error('Deployment failed after all retries');

    const contractAddress = deployed.deployTxData.public.contractAddress;
    console.log(`  ✅ Contract deployed: ${contractAddress}\n`);
    recordDeployment(network, contractAddress, address.toString());
    console.log('  Saved to .midnight-state.json\n');
  } finally {
    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  }
}

main().catch((err) => {
  console.error('\n❌', err instanceof Error ? err.message : err);
  process.exit(1);
});
