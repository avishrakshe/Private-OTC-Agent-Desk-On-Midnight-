/**
 * Verifies a list of Midnight wallet addresses: are they real, well-formed addresses for the
 * target network, and has each one actually transacted on-chain?
 *
 *   npm run verify-users                                  # USERS.md, on the app's network (Preprod)
 *   npm run verify-users -- --file some-list.txt          # any text containing mn_addr_… addresses
 *   npm run verify-users -- --sheet                       # the public feedback Google Sheet
 *   npm run verify-users -- --network preview
 *   npm run verify-users -- --out verified-users.md       # Markdown report, incl. rows ready for USERS.md
 *
 * Checks, per address:
 *   1. format    bech32m checksum, `mn_addr` prefix, decodes as an unshielded address
 *   2. network   the address belongs to the target network
 *   3. on-chain  the indexer reports at least one unshielded transaction for it
 *
 * Contract calls can't be attributed this way: they pay fees in DUST and don't touch the caller's
 * unshielded address. So "active" means the wallet has transacted on the network (faucet, DUST
 * registration, transfers), not that it used a particular dApp.
 */
import * as fs from 'node:fs';
import { WebSocket } from 'ws';
import { MidnightBech32m, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { NETWORK_CONFIGS, isNetworkId, type NetworkId } from '../src/network';
import { APP_NETWORK } from '../src/deployments';

const FEEDBACK_SHEET_CSV =
  'https://docs.google.com/spreadsheets/d/1wYLkzEDVUPkoOcz2VbPSJtYDTvIX2PB5fIUKfeUGfZ4/export?format=csv';

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const flag = (name: string) => process.argv.includes(`--${name}`);

const network = (arg('network') ?? APP_NETWORK) as NetworkId;
if (!isNetworkId(network)) throw new Error(`Unknown network ${network}`);
const indexerWs = NETWORK_CONFIGS[network].indexerWS;
const TIMEOUT_MS = Number(arg('timeout') ?? 30_000);
const CONCURRENCY = Number(arg('concurrency') ?? 4);

type Status = 'active' | 'no-activity' | 'wrong-network' | 'invalid' | 'error';

interface Row {
  address: string;
  status: Status;
  detail: string;
  txCount?: number;
  firstTx?: string;
}

async function loadAddresses(): Promise<string[]> {
  let text: string;
  if (flag('sheet')) {
    const res = await fetch(FEEDBACK_SHEET_CSV);
    if (!res.ok) throw new Error(`Could not fetch the feedback sheet (HTTP ${res.status})`);
    text = await res.text();
  } else {
    text = fs.readFileSync(arg('file') ?? 'USERS.md', 'utf8');
  }
  // Grab anything address-shaped and let validation judge it.
  return [...new Set(text.match(/mn_addr_[a-z0-9]+1[a-z0-9]+/gi) ?? [])];
}

function checkFormat(address: string): Row | null {
  try {
    const parsed = MidnightBech32m.parse(address);
    if (parsed.network !== network) {
      return { address, status: 'wrong-network', detail: `address is for "${String(parsed.network)}", not ${network}` };
    }
    UnshieldedAddress.codec.decode(parsed.network as any, parsed);
    return null;
  } catch (err) {
    return { address, status: 'invalid', detail: err instanceof Error ? err.message.split('\n')[0] : String(err) };
  }
}

/**
 * Streams the address's unshielded transactions. The indexer first sends a progress event whose
 * `highestTransactionId` is the address's latest transaction (0/absent if it has none), then the
 * transactions themselves; we stop once the stream reaches that id.
 */
function checkOnChain(address: string): Promise<Row> {
  return new Promise((resolve) => {
    const ws = new WebSocket(indexerWs, 'graphql-transport-ws');
    let txCount = 0;
    let firstTx: string | undefined;
    let target: number | undefined;
    let quiet: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    const finish = (row: Row) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(quiet);
      try {
        ws.close();
      } catch {
        /* already closed */
      }
      resolve(row);
    };
    const result = (): Row =>
      txCount === 0
        ? { address, status: 'no-activity', detail: 'valid address, but no transactions found', txCount }
        : { address, status: 'active', detail: `${txCount} tx`, txCount, firstTx };
    const timer = setTimeout(
      () => finish(txCount > 0 ? result() : { address, status: 'error', detail: 'indexer timed out' }),
      TIMEOUT_MS,
    );

    ws.on('open', () => ws.send(JSON.stringify({ type: 'connection_init' })));
    ws.on('message', (raw) => {
      const msg = JSON.parse(String(raw));
      if (msg.type === 'connection_ack') {
        ws.send(
          JSON.stringify({
            id: '1',
            type: 'subscribe',
            payload: {
              query: `subscription ($address: UnshieldedAddress!) {
                unshieldedTransactions(address: $address) {
                  __typename
                  ... on UnshieldedTransaction { transaction { id hash } }
                  ... on UnshieldedTransactionsProgress { highestTransactionId }
                }
              }`,
              variables: { address },
            },
          }),
        );
      } else if (msg.type === 'next') {
        if (msg.payload?.errors?.length) return finish({ address, status: 'error', detail: msg.payload.errors[0].message });
        const ev = msg.payload?.data?.unshieldedTransactions;
        if (ev?.__typename === 'UnshieldedTransaction') {
          txCount++;
          firstTx ??= ev.transaction?.hash;
          if (target !== undefined && Number(ev.transaction?.id) >= target) finish(result());
        } else if (ev?.__typename === 'UnshieldedTransactionsProgress') {
          const highest = Number(ev.highestTransactionId ?? 0);
          if (!highest) return finish(result()); // the address has no transactions
          target = highest;
          // Safety net: if the stream stalls before reaching the target, report what arrived.
          quiet = setTimeout(() => finish(result()), 8000);
        }
      } else if (msg.type === 'error') {
        finish({ address, status: 'error', detail: JSON.stringify(msg.payload).slice(0, 120) });
      } else if (msg.type === 'complete') {
        finish(result());
      }
    });
    ws.on('error', (err) => finish({ address, status: 'error', detail: err.message }));
  });
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

const ICON: Record<Status, string> = {
  active: '✅',
  'no-activity': '⚠️',
  'wrong-network': '❌',
  invalid: '❌',
  error: '❔',
};

const addresses = await loadAddresses();
console.log(`\nVerifying ${addresses.length} addresses on ${network}\n`);

const rows = await mapLimit(addresses, CONCURRENCY, async (address, i) => {
  const row = checkFormat(address) ?? (await checkOnChain(address));
  console.log(`${String(i + 1).padStart(3)}. ${ICON[row.status]} ${address.slice(0, 26)}…${address.slice(-6)}  ${row.status}  ${row.detail}`);
  return row;
});

const count = (s: Status) => rows.filter((r) => r.status === s).length;
const summary = [
  `Addresses checked:          ${rows.length}`,
  `✅ Active on ${network}:`.padEnd(28) + count('active'),
  `⚠️  Valid, no activity:      ${count('no-activity')}`,
  `❌ Invalid / wrong network:  ${count('invalid') + count('wrong-network')}`,
  `❔ Indexer errors:           ${count('error')}`,
];
console.log(`\n${summary.join('\n')}\n`);

// Explorer pages that list an address's unshielded activity.
const ACCOUNT_URL: Partial<Record<NetworkId, string>> = { preprod: 'https://midnight-preprod.subscan.io/account/' };
const addressCell = (address: string) =>
  ACCOUNT_URL[network] ? `[\`${address}\`](${ACCOUNT_URL[network]}${address})` : `\`${address}\``;

const out = arg('out');
if (out) {
  const active = rows.filter((r) => r.status === 'active');
  const md = [
    `# Wallet address verification (${network})`,
    '',
    `Generated ${new Date().toISOString()} by \`npm run verify-users\`. "Active" means the indexer`,
    'reports at least one transaction for the address on this network.',
    '',
    '```text',
    ...summary,
    '```',
    '',
    '| # | Address | Status | Detail | First transaction |',
    '|---|---|---|---|---|',
    ...rows.map(
      (r, i) =>
        `| ${i + 1} | \`${r.address}\` | ${ICON[r.status]} ${r.status} | ${r.detail.replace(/\|/g, '/')} | ${r.firstTx ? `\`${r.firstTx.slice(0, 16)}…\`` : ''} |`,
    ),
    '',
    `## Rows for USERS.md (${active.length} active)`,
    '',
    'Add each tester\'s name from the feedback form, and only list people who agreed to be named.',
    'The hash is the first unshielded transaction the Midnight indexer reports for the address.',
    '',
    '| # | Name | Wallet address | Transactions | First transaction |',
    '|---|---|---|---|---|',
    ...active.map((r, i) => `| ${i + 1} | | ${addressCell(r.address)} | ${r.txCount} | \`${r.firstTx ?? ''}\` |`),
    '',
  ].join('\n');
  fs.writeFileSync(out, md);
  console.log(`Report written to ${out}\n`);
}

// Exit non-zero if nothing is verifiably active, so a submission check can gate on it.
process.exitCode = count('active') > 0 ? 0 : 1;
