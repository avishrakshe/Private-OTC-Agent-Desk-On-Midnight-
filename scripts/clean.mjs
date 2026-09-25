// Removes build output and the wallet sync cache (both regenerate automatically).
// Deliberately does NOT touch .midnight-state.json (wallet seeds), .otc-desk-keys.json
// (oracle + auditor keys) or contracts/managed (compiled contracts the site imports).
import { rmSync } from 'node:fs';

for (const p of ['dist', '.midnight-wallet-state']) {
  rmSync(p, { recursive: true, force: true });
  console.log(`removed ${p}`);
}
