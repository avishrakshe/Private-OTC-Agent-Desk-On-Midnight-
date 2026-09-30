/**
 * The network the web app runs on, and the contracts it uses there. APP_NETWORK drives the wallet
 * connect buttons, the live transaction panel, the agents' on-chain run and every explorer link.
 *
 * Addresses come from the deploy scripts:
 *   npm run deploy -- --network preprod       # hello-world (storeMessage), used by "Connect, prove, settle"
 *   npm run deploy:otc -- --network preprod   # the sealed RFQ desk
 */
export type AppNetwork = 'preview' | 'preprod';

export const APP_NETWORK: AppNetwork = 'preprod';

interface Deployments {
  /** hello-world.compact, called by the "Connect, prove, settle" panel. */
  storeMessage?: string;
  /** private-otc-desk.compact, the sealed RFQ desk. */
  desk?: string;
}

export const DEPLOYMENTS: Record<AppNetwork, Deployments> = {
  preview: {
    storeMessage: '7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1',
    desk: 'd4ae65cdc6f13c56501334ad07c700be7bdbf5c85baee4b35f380b5a2fbce7cf',
  },
  // Paste the addresses printed by the two deploy commands above.
  preprod: {},
};

/** The storeMessage demo contract on a network, if one is deployed there. */
export const storeMessageContractFor = (network?: string): string | undefined =>
  network ? DEPLOYMENTS[network as AppNetwork]?.storeMessage : undefined;

/** Networks that have the storeMessage demo contract deployed. */
export const STORE_MESSAGE_NETWORKS = (Object.keys(DEPLOYMENTS) as AppNetwork[]).filter(
  (network) => DEPLOYMENTS[network].storeMessage
);

const EXPLORERS: Record<AppNetwork, string> = {
  preview: 'https://preview.midnightexplorer.com',
  preprod: 'https://preprod.midnightexplorer.com',
};

export const explorerFor = (network: string): string | undefined => EXPLORERS[network as AppNetwork];

export const contractExplorerUrl = (address: string, network: string = APP_NETWORK): string | undefined => {
  const base = explorerFor(network);
  return base ? `${base}/contracts/${address}` : undefined;
};

export const networkLabel = (id?: string) =>
  id === 'preprod' ? 'Preprod' : id === 'undeployed' ? 'Local devnet' : id === 'mainnet' ? 'Mainnet' : 'Preview';
