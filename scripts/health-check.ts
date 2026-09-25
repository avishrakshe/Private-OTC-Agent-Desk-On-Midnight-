/**
 * Checks the services the desk depends on and exits non-zero if any is down.
 *
 *   npm run health-check                      # network from .midnight-state.json
 *   npm run health-check -- --network preview
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveNetwork } from '../src/network';

const { network, config } = resolveNetwork();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

type Check = { name: string; run: () => Promise<string> };

const timeout = () => AbortSignal.timeout(8000);

const checks: Check[] = [
  {
    name: `Indexer (${config.indexer})`,
    run: async () => {
      const res = await fetch(config.indexer, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
        signal: timeout(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return `HTTP ${res.status}`;
    },
  },
  {
    name: `Node RPC (${config.node})`,
    run: async () => {
      const res = await fetch(config.node.replace(/^ws/, 'http'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'system_health', params: [] }),
        signal: timeout(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body: any = await res.json();
      if (body.error) throw new Error(body.error.message ?? 'RPC error');
      return `peers ${body.result?.peers ?? '?'}, syncing ${body.result?.isSyncing ?? '?'}`;
    },
  },
  {
    name: `Proof server (${config.proofServer})`,
    run: async () => {
      const res = await fetch(config.proofServer, { signal: timeout() });
      return `HTTP ${res.status}`;
    },
  },
  {
    name: 'RFQ desk ZK artifacts',
    run: async () => {
      const dir = path.join(root, 'contracts', 'managed', 'private-otc-desk');
      const circuits = fs.readdirSync(path.join(dir, 'zkir')).filter((f) => f.endsWith('.bzkir')).map((f) => f.replace('.bzkir', ''));
      const missing = circuits.filter((c) => !fs.existsSync(path.join(dir, 'keys', `${c}.prover`)));
      if (missing.length) throw new Error(`prover keys missing for ${missing.join(', ')} (recompile without --skip-zk)`);
      return `${circuits.length} circuits with keys`;
    },
  },
];

console.log(`\nHealth check · ${network}\n`);
let failed = 0;
for (const c of checks) {
  try {
    console.log(`  ✅ ${c.name}: ${await c.run()}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${c.name}: ${err instanceof Error ? (err.cause as any)?.code ?? err.message : err}`);
  }
}
console.log(failed ? `\n${failed} check(s) failed.\n` : '\nAll checks passed.\n');
// exitCode rather than exit(): exiting while fetch sockets close trips a libuv assertion on Windows.
process.exitCode = failed ? 1 : 0;
