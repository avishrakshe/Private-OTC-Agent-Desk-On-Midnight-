import { useState, useEffect, useCallback } from 'react';
import { type InitialAPI, type WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { parseCoinPublicKeyToHex, parseEncPublicKeyToHex } from '@midnight-ntwrk/midnight-js-utils';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { findDeployedContract, type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type MidnightProviders, type PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import * as privateOtcDesk from '../../contracts/managed/private-otc-desk/contract';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { MidnightBech32m, ShieldedAddress, ShieldedCoinPublicKey, ShieldedEncryptionPublicKey } from '@midnight-ntwrk/wallet-sdk-address-format';
import { setNetworkId as setMidnightNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

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
  error: string | null;
  connect: (network: string) => Promise<void>;
  disconnect: () => void;
  runStoreMessage: (
    contractAddress: string,
    message: string,
    onProgress?: (step: string, percent: number) => void
  ) => Promise<string>;
}

export function useMidnight(): UseMidnightResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<WalletConnectedAPI | null>(null);
  const [networkId, setNetworkId] = useState<string>('preview');
  const [error, setError] = useState<string | null>(null);

  // Auto-connect if already authorized
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const wallet = window.midnight?.mnLace;
        if (wallet) {
          // In some connector versions, checking if enabled is supported
          // If the user already authorized the app, we can connect.
          // Otherwise, we wait for explicit user click.
        }
      } catch (err) {
        console.warn('Auto-connect check failed:', err);
      }
    };
    checkConnection();
  }, []);

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
      setConnectedApi(api);
      setNetworkId(selectedNetwork);
      setMidnightNetworkId(selectedNetwork as any);

      // Fetch wallet addresses
      const unshieldedData = await api.getUnshieldedAddress();
      const shieldedData = await api.getShieldedAddresses();

      const unshieldedStr = typeof unshieldedData === 'string' ? unshieldedData : (unshieldedData as any)?.unshieldedAddress;
      const shieldedStr = typeof shieldedData === 'string' ? shieldedData : (shieldedData as any)?.shieldedAddress;

      setWalletAddress(unshieldedStr);
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

  const runStoreMessage = useCallback(
    async (
      contractAddress: string,
      message: string,
      onProgress?: (step: string, percent: number) => void
    ): Promise<string> => {
      if (!connectedApi || !walletAddress || !shieldedAddress) {
        throw new Error('Wallet is not connected.');
      }

      onProgress?.('Initializing network configuration & loading ZK proving keys (22MB)...', 15);

      // Configure global Midnight Network ID for SDK operations
      setMidnightNetworkId(networkId as any);

      // 1. Fetch network configuration from wallet API
      const config = await connectedApi.getConfiguration();
      
      // Fallback to network-appropriate endpoints if not provided by wallet
      const isPreview = networkId === 'preview';
      const isLocal = networkId === 'undeployed';
      const indexerUri = config.indexerUri || (isLocal ? 'http://127.0.0.1:8088/api/v4/graphql' : isPreview ? 'https://indexer.preview.midnight.network/api/v4/graphql' : 'https://indexer.preprod.midnight.network/api/v4/graphql');
      const indexerWsUri = config.indexerWsUri || (isLocal ? 'ws://127.0.0.1:8088/api/v4/graphql/ws' : isPreview ? 'wss://indexer.preview.midnight.network/api/v4/graphql/ws' : 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws');
      const proofServerUri = (config as any).proofServerUri || (isLocal ? 'http://127.0.0.1:6300' : 'http://127.0.0.1:6300');

      // 2. Setup ZK Config Provider pointing to local static assets
      const zkConfigProvider = new FetchZkConfigProvider(
        `${window.location.origin}/managed/hello-world`,
        fetch.bind(window)
      );

      // 3. Setup Wallet & Midnight providers wrapping the DApp connector API
      const addressesData = await connectedApi.getShieldedAddresses();
      const rawAddrStr = typeof addressesData === 'string'
        ? addressesData
        : (addressesData.shieldedAddress || shieldedAddress);

      if (!rawAddrStr || typeof rawAddrStr !== 'string') {
        throw new Error('Shielded address string is unavailable.');
      }

      const decodedShieldedAddr = ShieldedAddress.codec.decode(
        networkId,
        MidnightBech32m.parse(rawAddrStr)
      );

      const walletProvider = {
        getCoinPublicKey: () => {
          return decodedShieldedAddr.coinPublicKey;
        },
        getEncryptionPublicKey: () => {
          return decodedShieldedAddr.encryptionPublicKey;
        },
        balanceTx: async (tx: any, ttl?: Date) => {
          onProgress?.('Balancing & requesting transaction signature from Lace Wallet...', 75);
          const txString = typeof tx === 'string' ? tx : tx.toString();
          const response = await connectedApi.balanceUnsealedTransaction(txString, {
            payFees: true
          });
          return response.tx;
        }
      };

      const midnightProvider = {
        submitTx: async (tx: any) => {
          onProgress?.('Submitting transaction to Midnight Network...', 90);
          const txString = typeof tx === 'string' ? tx : tx.toString();
          await connectedApi.submitTransaction(txString);
          return 'browser-submitted-tx';
        }
      };

      const rawProofProvider = httpClientProofProvider(proofServerUri, zkConfigProvider);
      const proofProvider = {
        prove: async (circuitId: string, witness: any) => {
          onProgress?.('Generating ZK proof via local proof server (takes ~15-30s)...', 35);
          return await rawProofProvider.prove(circuitId, witness);
        }
      };

      // 4. Assemble the MidnightProviders object
      const providers: MidnightProviders<any, any, any> = {
        privateStateProvider: new InMemoryPrivateStateProvider(),
        publicDataProvider: indexerPublicDataProvider(indexerUri, indexerWsUri, window.WebSocket),
        zkConfigProvider,
        proofProvider: proofProvider as any,
        walletProvider: walletProvider as any,
        midnightProvider: midnightProvider as any
      };

      // 5. Load the deployed contract instance
      onProgress?.('Connecting to contract on-chain & verifying state...', 25);
      const compiledContract = CompiledContract.make('private-otc-desk', privateOtcDesk.Contract).pipe(
        CompiledContract.withVacantWitnesses
      );

      const contract = await findDeployedContract(providers, {
        compiledContract: compiledContract as any,
        contractAddress: contractAddress,
        privateStateId: 'privateOtcDeskPrivateState',
        initialPrivateState: {}
      });

      // 6. Invoke circuit
      const result = await contract.callTx.settleSealedBidSwap(100n, 95n, 80n, message || '0xreceipt');
      
      onProgress?.('Transaction complete!', 100);
      return result.public.txId || 'Transaction Success';
    },
    [connectedApi, walletAddress, shieldedAddress, networkId]
  );

  return {
    isConnected,
    isConnecting,
    walletAddress,
    shieldedAddress,
    error,
    connect,
    disconnect,
    runStoreMessage
  };
}
