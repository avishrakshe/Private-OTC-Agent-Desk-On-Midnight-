import { useState, useCallback } from 'react';
import { type InitialAPI, type ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import {
  createProofProvider,
  type MidnightProvider,
  type MidnightProviders,
  type PrivateStateProvider,
  type ProofProvider,
  type UnboundTransaction,
  type WalletProvider
} from '@midnight-ntwrk/midnight-js-types';
import { Transaction, type FinalizedTransaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import * as helloWorld from '../../contracts/managed/hello-world/contract';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { MidnightBech32m, ShieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { setNetworkId as setMidnightNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Browser-safe hex helpers (midnight-js-utils' fromHex relies on Node's Buffer).
const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0 || /[^0-9a-fA-F]/.test(clean)) {
    throw new Error('Wallet returned a malformed (non-hex) transaction.');
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
};

const keyToHex = (key: any): string =>
  typeof key?.toHexString === 'function' ? key.toHexString() : bytesToHex(Uint8Array.from(key.data));

const SDK_WRAPPER_PREFIX = /^Unexpected error (submitting|executing) scoped transaction '[^']*':\s*(Error:\s*)?/;

// Extracts a readable reason from SDK errors (real reason hidden in `cause`) and DApp connector
// APIErrors ({ type, code, reason }), which often arrive from the extension with an empty `message`.
const describeOne = (err: any): string => {
  if (err === null || err === undefined) return '';
  if (typeof err === 'string') return err;
  const bits: string[] = [];
  const message = typeof err.message === 'string' ? err.message.replace(SDK_WRAPPER_PREFIX, '').trim() : '';
  if (message) bits.push(message);
  if (err.reason && err.reason !== message) bits.push(String(err.reason));
  if (err.code !== undefined) bits.push(`[code: ${err.code}]`);
  if (!bits.length && err.name && err.name !== 'Error') bits.push(err.name);
  if (!bits.length) {
    try {
      const own = JSON.stringify(err, Object.getOwnPropertyNames(err));
      if (own && own !== '{}') bits.push(own);
    } catch {
      // not serializable
    }
  }
  return bits.join(' ');
};

const describeError = (err: any): string => {
  const parts: string[] = [];
  let cur = err;
  for (let depth = 0; cur && depth < 6; depth++) {
    const msg = describeOne(cur);
    if (msg && !parts.some((p) => p.includes(msg))) parts.push(msg);
    cur = cur?.cause;
  }
  return parts.join(' -> ') || 'Unknown error (the wallet returned no details - see browser console)';
};

const isUserRejection = (err: any): boolean =>
  err?.code === 'Rejected' ||
  err?.code === 'PermissionRejected' ||
  /reject|denied|cancel/i.test(String(err?.message ?? err?.reason ?? ''));

const DEFAULT_ENDPOINTS: Record<string, { indexer: string; indexerWs: string; proofServer: string }> = {
  undeployed: {
    indexer: 'http://127.0.0.1:8088/api/v4/graphql',
    indexerWs: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    proofServer: 'http://127.0.0.1:6300'
  },
  preview: {
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWs: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    proofServer: 'http://127.0.0.1:6300'
  },
  preprod: {
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWs: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    proofServer: 'http://127.0.0.1:6300'
  }
};

class InMemoryPrivateStateProvider implements PrivateStateProvider {
  private states = new Map<string, any>();
  private signingKeys = new Map<string, any>();
  
  setContractAddress(address: any): void {}
  
  async set(privateStateId: string, state: any): Promise<void> {
    this.states.set(privateStateId, state);
  }
  
  async get(privateStateId: string): Promise<any | null> {
    return this.states.get(privateStateId) ?? null;
  }
  
  async remove(privateStateId: string): Promise<void> {
    this.states.delete(privateStateId);
  }
  
  async clear(): Promise<void> {
    this.states.clear();
  }
  
  async setSigningKey(address: any, signingKey: any): Promise<void> {
    this.signingKeys.set(address.toString(), signingKey);
  }
  
  async getSigningKey(address: any): Promise<any | null> {
    return this.signingKeys.get(address.toString()) ?? null;
  }
  
  async removeSigningKey(address: any): Promise<void> {
    this.signingKeys.delete(address.toString());
  }
  
  async clearSigningKeys(): Promise<void> {
    this.signingKeys.clear();
  }
  
  async exportPrivateStates(): Promise<any> {
    return { format: 'midnight-private-state-export', encryptedPayload: '', salt: '' };
  }
  
  async importPrivateStates(): Promise<any> {
    return { imported: 0, skipped: 0, overwritten: 0 };
  }
  
  async exportSigningKeys(): Promise<any> {
    return { format: 'midnight-signing-key-export', encryptedPayload: '', salt: '' };
  }
  
  async importSigningKeys(): Promise<any> {
    return { imported: 0, skipped: 0, overwritten: 0 };
  }
}

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

export interface UseMidnightResult {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  shieldedAddress: string | null;
  networkId: string;
  error: string | null;
  lastProofDurationMs?: number;
  connect: (network: string) => Promise<void>;
  disconnect: () => void;
  runStoreMessage: (
    contractAddress: string,
    message: string,
    onProgress?: (step: string, percent: number) => void
  ) => Promise<string>;
  /** Midnight.js providers backed by Lace, for any contract whose ZK artifacts are served under zkPath. */
  buildProviders: (
    zkPath: string,
    onProgress?: (step: string, percent: number) => void
  ) => Promise<MidnightProviders<any, any, any>>;
}

export function useMidnight(): UseMidnightResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastProofDurationMs, setLastProofDurationMs] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);
  const [networkId, setNetworkId] = useState<string>('preview');
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (selectedNetwork: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      let wallet = window.midnight?.mnLace;
      if (!wallet && window.midnight) {
        const wallets = Object.values(window.midnight);
        if (wallets.length > 0) {
          wallet = wallets[0];
        }
      }
      if (!wallet) {
        throw new Error('Lace Beta Wallet for Midnight is not installed. Please install it to continue.');
      }

      const api = await wallet.connect(selectedNetwork);

      // Let Lace request permissions for everything the tx flow needs up front, so balancing
      // and submitting are not refused later for lacking a permission grant.
      try {
        await api.hintUsage([
          'getConfiguration',
          'getConnectionStatus',
          'getShieldedAddresses',
          'getUnshieldedAddress',
          'getDustBalance',
          'getProvingProvider',
          'balanceUnsealedTransaction',
          'balanceSealedTransaction',
          'submitTransaction'
        ]);
      } catch (err) {
        console.warn('hintUsage not supported or declined:', err);
      }

      // Trust the network the wallet is actually on, not just the one we hinted.
      let activeNetwork = selectedNetwork;
      try {
        const status = await api.getConnectionStatus();
        if (status.status === 'connected' && status.networkId) activeNetwork = status.networkId;
      } catch {
        // Older wallet builds may not implement getConnectionStatus; keep the requested network.
      }
      if (activeNetwork !== selectedNetwork) {
        throw new Error(
          `Lace is connected to "${activeNetwork}" but the DApp requested "${selectedNetwork}". Switch the Lace network to ${selectedNetwork} and connect again.`
        );
      }

      // Fetch wallet addresses
      const unshieldedData: any = await api.getUnshieldedAddress();
      const shieldedData: any = await api.getShieldedAddresses();

      const unshieldedStr = typeof unshieldedData === 'string' ? unshieldedData : unshieldedData?.unshieldedAddress;
      const shieldedStr = typeof shieldedData === 'string' ? shieldedData : shieldedData?.shieldedAddress;

      if (!shieldedStr) {
        throw new Error('Lace did not return a shielded address. Make sure the wallet is fully synced and try again.');
      }

      setMidnightNetworkId(activeNetwork as any);
      setNetworkId(activeNetwork);
      setConnectedApi(api);
      setWalletAddress(unshieldedStr ?? null);
      setShieldedAddress(shieldedStr);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      let msg = err?.message || err?.toString() || 'Failed to connect to Lace wallet.';
      if (msg.toLowerCase().includes('locked')) {
        msg = 'Lace Wallet is currently locked. Please click the Lace extension icon in your Chrome toolbar and enter your password to unlock it, then click Connect again.';
      }
      setError(msg);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnectedApi(null);
    setWalletAddress(null);
    setShieldedAddress(null);
    setIsConnected(false);
    setError(null);
  }, []);

  /**
   * Midnight.js providers backed by the connected Lace wallet: Lace proves (falling back to a
   * proof server), balances fees in DUST, and submits. `zkPath` is where the contract's ZK
   * artifacts are served from (under /public/managed/<contract>).
   */
  const buildProviders = useCallback(
    async (zkPath: string, onProgress?: (step: string, percent: number) => void): Promise<MidnightProviders<any, any, any>> => {
      if (!connectedApi || !shieldedAddress) {
        throw new Error('Wallet is not connected.');
      }

      // Make sure the wallet session is still alive and on the expected network.
      try {
        const status = await connectedApi.getConnectionStatus();
        if (status.status !== 'connected') {
          throw new Error('Lace wallet connection was lost. Please reconnect your wallet.');
        }
        if (status.networkId && status.networkId !== networkId) {
          throw new Error(
            `Lace switched to "${status.networkId}" but this session is on "${networkId}". Please reconnect.`
          );
        }
      } catch (err: any) {
        if (err instanceof Error && /Lace/.test(err.message)) throw err;
        // getConnectionStatus not supported by this wallet build - continue.
      }

      setMidnightNetworkId(networkId as any);

      // 1. Resolve service endpoints, preferring the ones the user configured in Lace.
      const config = await connectedApi.getConfiguration();
      const defaults = DEFAULT_ENDPOINTS[networkId] ?? DEFAULT_ENDPOINTS.preview;
      const indexerUri = config.indexerUri || defaults.indexer;
      const indexerWsUri = config.indexerWsUri || defaults.indexerWs;
      const proofServerUri = config.proverServerUri || defaults.proofServer;

      // 2. ZK artifacts (prover/verifier keys + zkir) served from this origin.
      const zkConfigProvider = new FetchZkConfigProvider<any>(`${window.location.origin}/${zkPath}`, fetch.bind(window));

      // 3. Wallet keys. The connector returns bech32m; the SDK needs raw hex.
      const decodedShieldedAddr = ShieldedAddress.codec.decode(networkId, MidnightBech32m.parse(shieldedAddress));
      const coinPublicKeyHex = keyToHex(decodedShieldedAddr.coinPublicKey);
      const encryptionPublicKeyHex = keyToHex(decodedShieldedAddr.encryptionPublicKey);

      // 4. Proving: delegate to the wallet's proving provider (v4 connector), fall back to a proof server.
      const httpProofProvider = httpClientProofProvider(proofServerUri, zkConfigProvider);
      let walletProofProvider: ProofProvider | null = null;
      if (typeof connectedApi.getProvingProvider === 'function') {
        try {
          walletProofProvider = createProofProvider((await connectedApi.getProvingProvider(zkConfigProvider)) as any);
        } catch (err) {
          console.warn('Wallet proving provider unavailable, using proof server instead:', err);
        }
      }

      const proofProvider: ProofProvider = {
        proveTx: async (unprovenTx, proveConfig) => {
          onProgress?.('Generating ZK proof (takes ~15-30s)...', 40);
          if (walletProofProvider) {
            try {
              return await walletProofProvider.proveTx(unprovenTx, proveConfig);
            } catch (err) {
              console.warn('Wallet proving failed, retrying with proof server:', err);
            }
          }
          try {
            return await httpProofProvider.proveTx(unprovenTx, proveConfig);
          } catch (err) {
            throw new Error(
              `ZK proof generation failed. Make sure a proof server is running at ${proofServerUri} (npm run proof-server:start). Details: ${describeError(err)}`,
              { cause: err }
            );
          }
        }
      };

      // 5. Balancing: Lace pays fees (DUST) and seals the transaction. Must return a ledger Transaction object.
      const walletProvider: WalletProvider = {
        getCoinPublicKey: () => coinPublicKeyHex,
        getEncryptionPublicKey: () => encryptionPublicKeyHex,
        balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
          // Fees are paid in DUST; a wallet with 0 DUST cannot balance anything.
          try {
            const dust = await connectedApi.getDustBalance();
            if (dust && BigInt(dust.balance) === 0n) {
              throw new Error(
                'Your Lace wallet has 0 DUST, which is needed to pay transaction fees. Get tNIGHT from the Midnight faucet and designate it for DUST generation in Lace, wait a few minutes for DUST to accrue, then retry.'
              );
            }
          } catch (err: any) {
            if (err instanceof Error && err.message.includes('0 DUST')) throw err;
            console.warn('Could not read DUST balance, continuing:', err);
          }

          onProgress?.('Waiting for Lace to balance & sign the transaction (approve it in the Lace popup)...', 70);
          let balanced: { tx: string };
          try {
            balanced = await connectedApi.balanceUnsealedTransaction(bytesToHex(tx.serialize()));
          } catch (unsealedErr) {
            console.error('Lace balanceUnsealedTransaction failed:', unsealedErr);
            if (isUserRejection(unsealedErr)) {
              throw new Error('Transaction was rejected in Lace.', { cause: unsealedErr });
            }
            // Some Lace builds fail on unsealed balancing; bind the tx and let Lace balance it in a
            // separate intent instead (valid here: these contracts' circuits have no fallible section).
            try {
              onProgress?.('Retrying balancing with a sealed transaction...', 72);
              balanced = await connectedApi.balanceSealedTransaction(bytesToHex(tx.bind().serialize()));
            } catch (sealedErr) {
              console.error('Lace balanceSealedTransaction failed:', sealedErr);
              if (isUserRejection(sealedErr)) {
                throw new Error('Transaction was rejected in Lace.', { cause: sealedErr });
              }
              throw new Error(
                `Lace could not balance the transaction. Make sure Lace is unlocked, fully synced, on ${networkId}, and has DUST for fees. Wallet said: ${describeError(unsealedErr)}`,
                { cause: sealedErr }
              );
            }
          }
          return Transaction.deserialize('signature', 'proof', 'binding', hexToBytes(balanced.tx));
        }
      };

      // 6. Submission: relay through Lace and return a REAL transaction identifier so the
      //    indexer can watch for finalization (a placeholder id makes the SDK fail).
      const midnightProvider: MidnightProvider = {
        submitTx: async (tx: FinalizedTransaction) => {
          onProgress?.('Submitting transaction to the Midnight network...', 85);
          try {
            await connectedApi.submitTransaction(bytesToHex(tx.serialize()));
          } catch (err) {
            throw new Error(`Lace failed to submit the transaction. Details: ${describeError(err)}`, { cause: err });
          }
          const [txId] = tx.identifiers();
          if (!txId) throw new Error('Submitted transaction has no identifier to track.');
          onProgress?.('Waiting for the transaction to be included in a block...', 92);
          return txId;
        }
      };

      return {
        privateStateProvider: new InMemoryPrivateStateProvider(),
        publicDataProvider: indexerPublicDataProvider(indexerUri, indexerWsUri, window.WebSocket as any),
        zkConfigProvider,
        proofProvider,
        walletProvider,
        midnightProvider
      };
    },
    [connectedApi, shieldedAddress, networkId]
  );

  const runStoreMessage = useCallback(
    async (
      contractAddress: string,
      message: string,
      onProgress?: (step: string, percent: number) => void
    ): Promise<string> => {
      const normalizedAddress = contractAddress.trim().replace(/^0x/i, '');
      if (!/^[0-9a-fA-F]{64}$/.test(normalizedAddress)) {
        throw new Error('Contract address must be a 32-byte hex string (64 hex characters).');
      }
      if (!message.trim()) {
        throw new Error('Message must not be empty.');
      }

      onProgress?.('Initializing network configuration & ZK artifacts...', 10);
      const providers = await buildProviders('managed/hello-world', onProgress);

      // Load the deployed contract instance
      onProgress?.('Connecting to contract on-chain & verifying state...', 25);
      const compiledContract = CompiledContract.make('hello-world', helloWorld.Contract).pipe(
        CompiledContract.withVacantWitnesses
      );

      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
          () =>
            reject(
              new Error(
                `Contract ${normalizedAddress.slice(0, 16)}... was not found on ${networkId}. Check the address and that Lace is on the network the contract was deployed to.`
              )
            ),
          60000
        );
      });

      let contract: any;
      try {
        contract = await Promise.race([
          findDeployedContract(providers, {
            compiledContract: compiledContract as any,
            contractAddress: normalizedAddress,
            privateStateId: 'helloWorldPrivateState',
            initialPrivateState: {}
          }),
          timeoutPromise
        ]);
      } catch (err) {
        throw new Error(describeError(err), { cause: err });
      } finally {
        clearTimeout(timeoutHandle);
      }

      // Invoke circuit: prove -> balance (Lace) -> submit (Lace) -> watch indexer for finalization
      const startTime = Date.now();
      let result: any;
      try {
        result = await contract.callTx.storeMessage(message);
      } catch (err) {
        console.error('storeMessage failed:', err);
        throw new Error(describeError(err), { cause: err });
      }
      setLastProofDurationMs(Date.now() - startTime);

      onProgress?.('Transaction finalized on-chain!', 100);
      return result?.public?.txHash || result?.public?.txId || 'Transaction Success';
    },
    [buildProviders, networkId]
  );

  return {
    isConnected,
    isConnecting,
    networkId,
    walletAddress,
    shieldedAddress,
    error,
    lastProofDurationMs,
    connect,
    disconnect,
    runStoreMessage,
    buildProviders
  };
}
