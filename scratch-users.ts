import * as fs from 'node:fs';
import { MidnightBech32m, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';

const md = fs.readFileSync(process.argv[2] ?? 'USERS.md', 'utf8');
const addrs = [...new Set(md.match(/mn_addr_[a-z]+1[0-9a-z]+/g) ?? [])];
let valid = 0;
const invalid: string[] = [];
const validList: string[] = [];
for (const a of addrs) {
  try {
    const parsed = MidnightBech32m.parse(a);
    UnshieldedAddress.codec.decode(parsed.network as any, parsed);
    valid++;
    validList.push(a);
  } catch (e: any) {
    invalid.push(`${a.slice(0, 30)}…  ${String(e?.message ?? e).slice(0, 60)}`);
  }
}
console.log(`unique addresses: ${addrs.length}, valid bech32m unshielded: ${valid}, invalid: ${invalid.length}`);
console.log('valid:', validList.join('\n  '));
console.log('first invalid examples:\n  ' + invalid.slice(0, 5).join('\n  '));
