/**
 * Shared DSP helpers for the synthesised soundtracks (scripts/sfx.ts, scripts/hook-music.ts):
 * a 16-bit stereo WAV writer, deterministic noise, a band-limited saw and a small stereo reverb.
 */
import fs from 'node:fs';
import path from 'node:path';

export const SR = 44100;
export const TAU = Math.PI * 2;

/** Writes 16-bit stereo PCM, scaled down if it would clip. */
export function writeWav(file: string, L: Float32Array, R: Float32Array = L) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  let peak = 1e-9;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = peak > 0.95 ? 0.95 / peak : 1;
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
  console.log(`  ✓ ${path.basename(file).padEnd(16)} ${(n / SR).toFixed(1)}s`);
}

export const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// deterministic noise
let seed = 1234567;
export const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
export const noise = () => rnd() * 2 - 1;

// band-limited saw wavetable
const TABLE = 4096;
const SAW = new Float32Array(TABLE);
for (let h = 1; h <= 14; h++) for (let i = 0; i < TABLE; i++) SAW[i] += (Math.sin((TAU * h * i) / TABLE) / h) * 0.55;
export const saw = (phase: number) => SAW[Math.floor((phase - Math.floor(phase)) * TABLE)];

/** Schroeder-style stereo reverb (4 combs + 2 allpasses per side), in place. */
export function reverb(L: Float32Array, R: Float32Array, wet = 0.35, size = 0.84) {
  const make = (combs: number[], aps: number[], x: Float32Array) => {
    const out = new Float32Array(x.length);
    const cb = combs.map((d) => ({ b: new Float32Array(d), i: 0, lp: 0 }));
    const ab = aps.map((d) => ({ b: new Float32Array(d), i: 0 }));
    for (let n = 0; n < x.length; n++) {
      let s = 0;
      for (const c of cb) {
        const y = c.b[c.i];
        c.lp = y * 0.7 + c.lp * 0.3;
        c.b[c.i] = x[n] * 0.5 + c.lp * size;
        c.i = (c.i + 1) % c.b.length;
        s += y;
      }
      for (const a of ab) {
        const y = a.b[a.i];
        const v = s + y * 0.5;
        a.b[a.i] = v;
        a.i = (a.i + 1) % a.b.length;
        s = y - v * 0.5;
      }
      out[n] = s * 0.25;
    }
    return out;
  };
  const wl = make([1557, 1617, 1491, 1422], [556, 441], L);
  const wr = make([1580, 1640, 1514, 1445], [579, 464], R);
  for (let n = 0; n < L.length; n++) {
    L[n] = L[n] * (1 - wet) + wl[n] * wet * 1.6;
    R[n] = R[n] * (1 - wet) + wr[n] * wet * 1.6;
  }
}
