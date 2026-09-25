/**
 * Sealed envelopes for the off-chain half of the protocol:
 *  - a maker's quote opening, encrypted to the RFQ taker
 *  - a trade receipt opening, encrypted to the auditor's viewing key
 *
 * ECDH (P-256) + HKDF-SHA-256 + AES-256-GCM with an ephemeral sender key, all via
 * WebCrypto so the same code runs in the browser and in Node 22+.
 */

const subtle = () => {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new Error('WebCrypto is unavailable (a secure context is required)');
  return s;
};

const ECDH = { name: 'ECDH', namedCurve: 'P-256' } as const;
const INFO = new TextEncoder().encode('otc-desk:sealed-box:v1');

export interface BoxKeyPair {
  publicKey: Uint8Array; // raw, 65 bytes
  privateKey: CryptoKey;
}

export interface SealedEnvelope {
  ephemeralKey: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

/** WebCrypto typings want ArrayBuffer-backed views; ours always are. */
const bs = (u: Uint8Array) => u as Uint8Array<ArrayBuffer>;

export const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

export const randomBytes32 = (): Uint8Array => globalThis.crypto.getRandomValues(new Uint8Array(32));

export async function generateBoxKeyPair(): Promise<BoxKeyPair> {
  const kp = (await subtle().generateKey(ECDH, false, ['deriveBits'])) as CryptoKeyPair;
  return { publicKey: new Uint8Array(await subtle().exportKey('raw', kp.publicKey)), privateKey: kp.privateKey };
}

/** 32-byte fingerprint of a viewing public key, as registered on the ledger (`auditorKey`). */
export async function keyFingerprint(publicKey: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await subtle().digest('SHA-256', bs(publicKey)));
}

async function aesKey(privateKey: CryptoKey, peerPublic: Uint8Array, usage: KeyUsage): Promise<CryptoKey> {
  const peer = await subtle().importKey('raw', bs(peerPublic), ECDH, false, []);
  const bits = await subtle().deriveBits({ name: 'ECDH', public: peer }, privateKey, 256);
  const shared = await subtle().importKey('raw', bits, 'HKDF', false, ['deriveKey']);
  return subtle().deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: INFO },
    shared,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  );
}

const replacer = (_: string, v: unknown) =>
  typeof v === 'bigint' ? { $b: v.toString() } : v instanceof Uint8Array ? { $u: toHex(v) } : v;

const reviver = (_: string, v: any) => {
  if (v && typeof v === 'object' && '$b' in v) return BigInt(v.$b);
  if (v && typeof v === 'object' && '$u' in v) return Uint8Array.from(v.$u.match(/../g) ?? [], (h: string) => parseInt(h, 16));
  return v;
};

export async function seal<T>(recipientPublicKey: Uint8Array, payload: T): Promise<SealedEnvelope> {
  const eph = (await subtle().generateKey(ECDH, true, ['deriveBits'])) as CryptoKeyPair;
  const key = await aesKey(eph.privateKey, recipientPublicKey, 'encrypt');
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload, replacer));
  const ciphertext = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv }, key, plaintext));
  return { ephemeralKey: new Uint8Array(await subtle().exportKey('raw', eph.publicKey)), iv, ciphertext };
}

export async function open<T>(recipient: BoxKeyPair, envelope: SealedEnvelope): Promise<T> {
  const key = await aesKey(recipient.privateKey, envelope.ephemeralKey, 'decrypt');
  const plaintext = await subtle().decrypt({ name: 'AES-GCM', iv: bs(envelope.iv) }, key, bs(envelope.ciphertext));
  return JSON.parse(new TextDecoder().decode(plaintext), reviver) as T;
}
