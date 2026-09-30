/**
 * Sound design, synthesised from scratch (no samples, no licences): an ambient music bed plus
 * UI effects. Writes 16-bit stereo WAVs to public/audio/.
 *
 *   npm run sfx
 */
import fs from 'node:fs';
import path from 'node:path';
import { SR, TAU, midi, noise, reverb, rnd, saw, writeWav as write } from './synth';

const OUT = path.resolve('public/audio');
const writeWav = (name: string, L: Float32Array, R?: Float32Array) => write(path.join(OUT, name), L, R);

/* ───────────── music bed ───────────── */

function music(seconds: number) {
  const n = Math.floor(seconds * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const BPM = 104;
  const beat = 60 / BPM;
  const bar = beat * 4;
  // D minor, cinematic: Dm9 · Bbmaj7 · Fmaj7/A · C(add9)
  const CHORDS = [
    [50, 57, 60, 64, 65],
    [46, 53, 57, 60, 62],
    [45, 53, 57, 60, 64],
    [48, 55, 59, 62, 67],
  ];
  const chordLen = bar * 2;

  // pad: detuned saws through a slowly breathing low-pass
  const phases = new Float64Array(64);
  let lpL = 0,
    lpR = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ci = Math.floor(t / chordLen);
    const local = t - ci * chordLen;
    const xf = Math.min(1, local / 1.6); // crossfade into the new chord
    const cur = CHORDS[ci % CHORDS.length];
    const prev = CHORDS[(ci + CHORDS.length - 1) % CHORDS.length];
    let sL = 0,
      sR = 0;
    const voice = (notes: number[], gain: number, base: number) => {
      notes.forEach((m, k) => {
        [-0.09, 0, 0.1].forEach((det, d) => {
          const idx = base + k * 3 + d;
          phases[idx] += midi(m + det) / SR;
          const v = saw(phases[idx]) * gain;
          if (d === 0) sL += v;
          else if (d === 2) sR += v;
          else {
            sL += v * 0.5;
            sR += v * 0.5;
          }
        });
      });
    };
    voice(cur, xf * 0.06, 0);
    if (xf < 1) voice(prev, (1 - xf) * 0.06, 32);
    const cutoff = 0.035 + 0.025 * (0.5 + 0.5 * Math.sin(TAU * t * 0.05));
    lpL += (sL - lpL) * cutoff;
    lpR += (sR - lpR) * cutoff;
    // gentle sidechain pump on each beat
    const bp = (t % beat) / beat;
    const pump = 0.72 + 0.28 * Math.min(1, bp * 3.2);
    L[i] += lpL * pump;
    R[i] += lpR * pump;
    // sub bass on the chord root
    const root = midi(cur[0] - 12);
    const sub = Math.sin(TAU * root * t) * 0.16 * Math.min(1, local / 0.4) * pump;
    L[i] += sub;
    R[i] += sub;
  }

  // plucked arpeggio, 8ths, enters after the intro
  const eighth = beat / 2;
  const arpStart = bar * 2;
  for (let s = 0, t0 = arpStart; t0 < seconds - 2; s++, t0 += eighth) {
    const ci = Math.floor(t0 / chordLen);
    const notes = CHORDS[ci % CHORDS.length];
    const pattern = [1, 2, 3, 4, 3, 2, 4, 2];
    const m = notes[pattern[s % pattern.length]] + 12;
    const f = midi(m);
    const pan = s % 2 ? 0.3 : 0.7;
    const vel = (s % 4 === 0 ? 0.075 : 0.05) * (0.85 + 0.3 * rnd());
    const start = Math.floor(t0 * SR);
    const len = Math.floor(0.9 * SR);
    for (let j = 0; j < len && start + j < n; j++) {
      const tt = j / SR;
      const env = Math.exp(-tt * 7) * Math.min(1, tt * 400);
      const v = (Math.sin(TAU * f * tt) + 0.25 * Math.sin(TAU * 2 * f * tt) * Math.exp(-tt * 14)) * env * vel;
      L[start + j] += v * (1 - pan);
      R[start + j] += v * pan;
    }
  }

  // soft hats on the off-beats, from bar 4
  for (let t0 = bar * 4 + eighth; t0 < seconds - 2; t0 += beat) {
    const start = Math.floor(t0 * SR);
    let hp = 0,
      prev = 0;
    for (let j = 0; j < SR * 0.06 && start + j < n; j++) {
      const x = noise();
      hp = 0.85 * (hp + x - prev);
      prev = x;
      const v = hp * Math.exp((-j / SR) * 70) * 0.03;
      L[start + j] += v;
      R[start + j] += v;
    }
  }

  reverb(L, R, 0.32, 0.86);
  // fade in / out
  const fin = 3 * SR,
    fout = 5 * SR;
  for (let i = 0; i < n; i++) {
    const g = Math.min(1, i / fin) * Math.min(1, (n - i) / fout);
    L[i] *= g;
    R[i] *= g;
  }
  return [L, R] as const;
}

/* ───────────── effects ───────────── */

function whoosh(dur = 1.0, up = true) {
  const n = Math.floor(dur * SR);
  const L = new Float32Array(n),
    R = new Float32Array(n);
  let bp1 = 0,
    bp2 = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const env = Math.sin(Math.PI * Math.pow(p, up ? 0.8 : 0.4)) ** 2;
    const fc = up ? 300 + 5200 * p * p : 4200 - 3800 * p;
    const g = Math.min(0.99, (TAU * fc) / SR);
    const x = noise();
    bp1 += g * (x - bp1);
    bp2 += g * (bp1 - bp2);
    const v = (bp1 - bp2) * env * 1.8;
    const pan = up ? p : 1 - p;
    L[i] = v * (1 - pan * 0.6);
    R[i] = v * (0.4 + pan * 0.6);
  }
  reverb(L, R, 0.3, 0.7);
  return [L, R] as const;
}

function impact() {
  const n = Math.floor(2.2 * SR);
  const L = new Float32Array(n);
  let ph = 0,
    lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 38 + 70 * Math.exp(-t * 9);
    ph += f / SR;
    const boom = Math.sin(TAU * ph) * Math.exp(-t * 2.4) * 0.9;
    lp += (noise() - lp) * 0.12;
    const crack = lp * Math.exp(-t * 18) * 0.6;
    L[i] = boom + crack;
  }
  const R = L.slice();
  reverb(L, R, 0.35, 0.88);
  return [L, R] as const;
}

function riser(dur = 2.4) {
  const n = Math.floor(dur * SR);
  const L = new Float32Array(n),
    R = new Float32Array(n);
  let ph1 = 0,
    ph2 = 0,
    bp = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const env = Math.pow(p, 2.2) * Math.min(1, (n - i) / (SR * 0.03));
    const f = 180 * Math.pow(2, p * 3);
    ph1 += f / SR;
    ph2 += (f * 1.01) / SR;
    bp += (noise() - bp) * (0.02 + p * 0.5);
    const v = (saw(ph1) * 0.25 + saw(ph2) * 0.25 + bp * 0.6) * env;
    L[i] = v;
    R[i] = v * 0.95;
  }
  reverb(L, R, 0.3, 0.8);
  return [L, R] as const;
}

function chime() {
  const n = Math.floor(2.0 * SR);
  const L = new Float32Array(n),
    R = new Float32Array(n);
  const notes = [84, 88, 91, 96];
  notes.forEach((m, k) => {
    const f = midi(m);
    const off = Math.floor(k * 0.055 * SR);
    for (let j = 0; off + j < n; j++) {
      const t = j / SR;
      const mod = Math.sin(TAU * f * 3.5 * t) * 1.2 * Math.exp(-t * 6);
      const v = Math.sin(TAU * f * t + mod) * Math.exp(-t * 3.2) * 0.22 * Math.min(1, t * 800);
      L[off + j] += v * (k % 2 ? 0.6 : 1);
      R[off + j] += v * (k % 2 ? 1 : 0.6);
    }
  });
  reverb(L, R, 0.4, 0.85);
  return [L, R] as const;
}

function denied() {
  const n = Math.floor(0.7 * SR);
  const L = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const pulse = (t < 0.13 || (t > 0.19 && t < 0.34)) ? 1 : 0;
    const sq = Math.sign(Math.sin(TAU * 98 * t)) * 0.5 + Math.sign(Math.sin(TAU * 146.8 * t)) * 0.3;
    lp += (sq * pulse - lp) * 0.08;
    L[i] = lp * 0.9;
  }
  const R = L.slice();
  reverb(L, R, 0.18, 0.6);
  return [L, R] as const;
}

function click() {
  const n = Math.floor(0.12 * SR);
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    L[i] = (Math.sin(TAU * 2600 * t) * 0.5 + noise() * 0.5) * Math.exp(-t * 160) * 0.8;
  }
  return [L, L.slice()] as const;
}

function blip() {
  const n = Math.floor(0.18 * SR);
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 1400 + 900 * Math.min(1, t * 30);
    L[i] = Math.sin(TAU * f * t) * Math.exp(-t * 28) * 0.5;
  }
  const R = L.slice();
  reverb(L, R, 0.25, 0.6);
  return [L, R] as const;
}

function typing(dur = 1.6) {
  const n = Math.floor(dur * SR);
  const L = new Float32Array(n),
    R = new Float32Array(n);
  for (let t0 = 0; t0 < dur - 0.05; t0 += 0.045 + rnd() * 0.07) {
    const s = Math.floor(t0 * SR);
    const pan = rnd();
    const f = 1800 + rnd() * 1600;
    for (let j = 0; j < SR * 0.03 && s + j < n; j++) {
      const t = j / SR;
      const v = (Math.sin(TAU * f * t) * 0.4 + noise() * 0.6) * Math.exp(-t * 220) * 0.35;
      L[s + j] += v * (1 - pan * 0.5);
      R[s + j] += v * (0.5 + pan * 0.5);
    }
  }
  return [L, R] as const;
}

/* ───────────── main ───────────── */

fs.mkdirSync(OUT, { recursive: true });
const secs = Number(process.env.MUSIC_SECONDS ?? 240);
writeWav('music.wav', ...music(secs));
writeWav('whoosh.wav', ...whoosh(0.9, true));
writeWav('swoosh.wav', ...whoosh(0.7, false));
writeWav('impact.wav', ...impact());
writeWav('riser.wav', ...riser());
writeWav('chime.wav', ...chime());
writeWav('denied.wav', ...denied());
writeWav('click.wav', ...click());
writeWav('blip.wav', ...blip());
writeWav('typing.wav', ...typing());
console.log(`Done → ${OUT}`);
