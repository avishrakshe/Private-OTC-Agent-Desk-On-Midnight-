/**
 * The demo-day hook's music, synthesised from scratch and locked to the cue sheet in
 * src/hook/beats.ts (120 BPM, D minor). Writes public/audio/hook-music.wav (16 s).
 *
 *   npm run hook:music
 *
 *   0–5.5 s   tension: pulse bass, kick from the first leak, dissonant hits on "front-run", "sandwiched"
 *   5.5–6 s   glitch stutter, tape stop, dead silence
 *   6–8 s     heartbeat, a swelling pad and a snare roll into…
 *   8–14 s    the drop: four-on-the-floor, rolling bass, side-chained chord stabs
 *   14–16 s   one last hit and a ringing Dm9 under the title card
 */
import path from 'node:path';
import { BEAT, CUE, FPS, TOTAL_FRAMES } from '../src/hook/beats';
import { SR, TAU, midi, noise, reverb, saw, writeWav } from './synth';

const N = Math.round((TOTAL_FRAMES / FPS) * SR);
const SPB = BEAT / FPS; // seconds per beat
const B = (n: number) => n * SPB; // beat → seconds
const sec = (frame: number) => frame / FPS;

type Bus = [Float32Array, Float32Array];
const bus = (): Bus => [new Float32Array(N), new Float32Array(N)];
const kickBus = bus(); // dry, not ducked
const bassBus = bus(); // dry, ducked
const musicBus = bus(); // ducked, reverb
const percBus = bus(); // light reverb

/** Adds `len` seconds of a mono voice from t0, panned (-1 left … 1 right). */
const voice = (b: Bus, t0: number, len: number, pan: number, fn: (t: number) => number) => {
  const s0 = Math.round(t0 * SR);
  const n = Math.round(len * SR);
  const gl = Math.sqrt((1 - pan) / 2),
    gr = Math.sqrt((1 + pan) / 2);
  for (let j = 0; j < n && s0 + j < N; j++) {
    if (s0 + j < 0) continue;
    const v = fn(j / SR);
    b[0][s0 + j] += v * gl;
    b[1][s0 + j] += v * gr;
  }
};

/* ───────────── instruments ───────────── */

const kicks: number[] = [];
function kick(t0: number, g = 0.9) {
  kicks.push(t0);
  let ph = 0;
  voice(kickBus, t0, 0.45, 0, (t) => {
    ph += (46 + 120 * Math.exp(-t * 30)) / SR;
    return (Math.sin(TAU * ph) * Math.exp(-t * 7) + noise() * Math.exp(-t * 500) * 0.3) * g;
  });
}

/** Low boom with a little drive, so it still reads on small speakers. */
function boom(t0: number, g = 0.7, len = 1.8) {
  let ph = 0;
  voice(kickBus, t0, len, 0, (t) => {
    ph += (40 + 70 * Math.exp(-t * 7)) / SR;
    return Math.tanh(1.8 * Math.sin(TAU * ph)) * Math.exp(-t * 1.7) * g * Math.min(1, (len - t) / 0.05);
  });
}

function snare(t0: number, g = 0.4, pan = 0) {
  let lp = 0,
    lp2 = 0;
  voice(percBus, t0, 0.25, pan, (t) => {
    const x = noise();
    lp += (x - lp) * 0.1;
    lp2 += (x - lp - lp2) * 0.55;
    return (lp2 * Math.exp(-t * 20) * 1.4 + Math.sin(TAU * 190 * t) * Math.exp(-t * 35) * 0.5) * g;
  });
}

function clap(t0: number, g = 0.4) {
  let lp = 0,
    bp = 0;
  voice(percBus, t0, 0.3, 0, (t) => {
    const x = noise();
    lp += (x - lp) * 0.12;
    bp += (x - lp - bp) * 0.5;
    // three quick slaps, then the tail
    const burst = t < 0.033 ? Math.exp(-(t % 0.011) * 250) : Math.exp(-(t - 0.033) * 16);
    return bp * burst * 1.6 * g;
  });
}

function hat(t0: number, g = 0.06, open = false, pan = 0.2) {
  let lp = 0;
  voice(percBus, t0, open ? 0.32 : 0.07, pan, (t) => {
    const x = noise();
    lp += (x - lp) * 0.45;
    return (x - lp) * Math.exp(-t * (open ? 11 : 65)) * g;
  });
}

function crash(t0: number, g = 0.25) {
  for (const pan of [-0.6, 0.6]) {
    let lp = 0;
    voice(percBus, t0, 2.6, pan, (t) => {
      const x = noise();
      lp += (x - lp) * 0.3;
      return (x - lp) * Math.exp(-t * 1.6) * g;
    });
  }
}

function bass(note: number, t0: number, len: number, g = 0.2) {
  const f = midi(note);
  let p1 = 0,
    p2 = 0,
    lp = 0;
  voice(bassBus, t0, len, 0, (t) => {
    p1 += (f * 1.004) / SR;
    p2 += (f * 0.996) / SR;
    const raw = saw(p1) + saw(p2);
    lp += (raw - lp) * (0.03 + 0.14 * Math.exp(-t * 16));
    const env = Math.min(1, t / 0.003) * Math.min(1, (len - t) / 0.02);
    return Math.tanh((lp * 1.4 + Math.sin(TAU * (f / 2) * t) * 0.8) * 1.3) * env * g;
  });
}

function stab(notes: number[], t0: number, g = 0.06, len = 0.26, bright = 0.28) {
  notes.forEach((m, k) => {
    [-0.12, 0, 0.12].forEach((det, d) => {
      const f = midi(m + det);
      let ph = 0,
        lp = 0;
      voice(musicBus, t0, len, (k / (notes.length - 1)) * 1.2 - 0.6 + (d - 1) * 0.2, (t) => {
        ph += f / SR;
        lp += (saw(ph) - lp) * (0.04 + bright * Math.exp(-t * 18));
        return lp * Math.exp(-t * 8) * Math.min(1, (len - t) / 0.015) * g;
      });
    });
  });
}

/** Dissonant brass hit that dives a semitone: the sound of getting front-run. */
function braam(root: number, t0: number, g = 0.08) {
  [root - 12, root, root + 1, root + 7, root + 13].forEach((m, k) => {
    [-0.15, 0.15].forEach((det) => {
      let ph = 0,
        lp = 0;
      voice(musicBus, t0, 0.55, (k % 2 ? 0.4 : -0.4) * Math.sign(det), (t) => {
        ph += midi(m + det - Math.min(1, t * 2.4)) / SR;
        lp += (saw(ph) - lp) * (0.05 + 0.25 * Math.exp(-t * 7));
        return lp * Math.exp(-t * 4.2) * Math.min(1, t / 0.004) * Math.min(1, (0.55 - t) / 0.03) * g;
      });
    });
  });
}

function pad(notes: number[], t0: number, len: number, g = 0.03, attack = 0.6, open = 0.04) {
  notes.forEach((m, k) => {
    [-0.1, 0.1].forEach((det) => {
      const f = midi(m + det);
      let ph = k * 0.13,
        lp = 0;
      voice(musicBus, t0, len, (k / Math.max(1, notes.length - 1)) * 1.4 - 0.7, (t) => {
        ph += f / SR;
        lp += (saw(ph) - lp) * (0.012 + open * Math.min(1, t / len));
        return lp * Math.min(1, t / attack) * Math.min(1, (len - t) / 0.08) * g;
      });
    });
  });
}

/** 5 gated blips falling in pitch, then a tape-stop dive: the glitch before the blackout. */
function glitch(t0: number, t1: number) {
  const step = (t1 - t0) * 0.55 / 5;
  for (let k = 0; k < 5; k++) {
    let ph = 0;
    voice(percBus, t0 + k * step, step * 0.8, k % 2 ? 0.5 : -0.5, (t) => {
      ph += (440 * Math.pow(2, -k / 2.5)) / SR;
      return (Math.sign(Math.sin(TAU * ph)) * 0.5 + noise() * 0.35) * 0.3;
    });
  }
  const dive = t1 - (t0 + 5 * step);
  let ph = 0;
  voice(bassBus, t0 + 5 * step, dive, 0, (t) => {
    ph += (110 * Math.pow(0.12, t / dive)) / SR;
    return saw(ph) * 0.5 * (1 - t / dive);
  });
}

/* ───────────── arrangement ───────────── */

const Dm = [62, 65, 69, 72];
const Bb = [58, 62, 65, 69];
const F = [60, 65, 69, 72];
const Csus = [60, 62, 67, 72];
const Dm9 = [50, 57, 60, 64, 65, 69];

const bDrop = CUE.drop / BEAT;
const bEnd = CUE.end / BEAT;
const tBlack = sec(CUE.blackout);
const tTurn = sec(CUE.whatIf);

// 0 – 1 s: a dark drone under the typing
pad([38, 45, 50], 0, tTurn - 0.3, 0.03, 0.9, 0.02);

// act 1–2: tension, from the first leaked field
for (let n = CUE.size / BEAT; n < CUE.glitch / BEAT; n++) {
  kick(B(n), 0.85);
  bass(38, B(n + 0.5), SPB * 0.45, 0.17);
  if (n >= 4) for (let s = 0; s < 4; s++) hat(B(n + s / 4), s % 2 ? 0.035 : 0.05, false, s % 2 ? 0.3 : -0.3);
  if (n % 2 === 1 && n > 4) clap(B(n), 0.32);
}
kick(sec(CUE.glitch), 0.85);
braam(50, sec(CUE.frontRun), 0.08);
braam(50, sec(CUE.sandwich), 0.08);
braam(50, sec(CUE.announced), 0.07);
braam(49, sec(CUE.before), 0.07);
braam(48, sec(CUE.fills), 0.08);
glitch(sec(CUE.glitch), tBlack);

// act 3: heartbeat, swell, snare roll
for (const n of [12, 13, 14, 15]) {
  kick(B(n), 0.5);
  kick(B(n + 0.3), 0.32);
}
pad(Dm9, tTurn, B(bDrop) - tTurn - SPB / 8, 0.035, 1.6, 0.09);
const roll: number[] = [];
for (let x = 14; x < 15; x += 0.5) roll.push(x);
for (let x = 15; x < 15.5; x += 0.25) roll.push(x);
for (let x = 15.5; x < bDrop - 0.125; x += 0.125) roll.push(x);
roll.forEach((x, i) => snare(B(x), 0.18 + 0.5 * (i / roll.length), i % 2 ? 0.25 : -0.25));

// act 4–5: the drop
const CHORDS = [Dm, Dm, Dm, Dm, Bb, Bb, Bb, Bb, F, F, Csus, Csus];
const ROOTS = [38, 38, 38, 38, 34, 34, 34, 34, 41, 41, 36, 36];
boom(B(bDrop), 0.75);
crash(B(bDrop), 0.26);
crash(sec(CUE.agents), 0.16);
for (let i = 0; i < bEnd - bDrop; i++) {
  const n = bDrop + i;
  kick(B(n), 0.95);
  if (i % 2 === 1) clap(B(n), 0.38);
  hat(B(n + 0.5), 0.09, true, 0.25);
  for (let s = 0; s < 4; s++) if (s !== 2) hat(B(n + s / 4), s % 2 ? 0.035 : 0.05, false, -0.3);
  // rolling bass: three 16ths per beat, the last one up an octave
  for (let s = 1; s < 4; s++) bass(ROOTS[i] + (s === 3 ? 12 : 0), B(n + s / 4), SPB / 4 * 0.85, 0.2);
  stab(CHORDS[i], B(n + 0.5), 0.05);
  // a soft pad under each chord, for as long as the chord lasts
  if (i === 0 || CHORDS[i] !== CHORDS[i - 1]) {
    let run = 1;
    while (i + run < CHORDS.length && CHORDS[i + run] === CHORDS[i]) run++;
    pad(CHORDS[i].map((m) => m - 12), B(n), SPB * run, 0.018, 0.2, 0.05);
  }
}
// fill into the end card
for (let x = bEnd - 1; x < bEnd; x += 0.25) snare(B(x), 0.2 + 0.25 * (x - bEnd + 1));

// act 6: last hit, then the chord rings under the title
kick(B(bEnd), 1);
boom(B(bEnd), 0.8, 2);
crash(B(bEnd), 0.3);
stab(Dm9.map((m) => m + 12), B(bEnd), 0.05, 1.9, 0.15);
pad(Dm9, B(bEnd), N / SR - B(bEnd), 0.04, 0.05, 0.03);

/* ───────────── mix ───────────── */

// side-chain: duck bass and music under every kick
kicks.sort((a, b) => a - b);
let k = -1;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  while (k + 1 < kicks.length && kicks[k + 1] <= t) k++;
  const d = k < 0 ? 1 : 1 - 0.65 * Math.exp(-(t - kicks[k]) / 0.09);
  for (const c of [0, 1]) {
    bassBus[c][i] *= d;
    musicBus[c][i] *= d;
  }
}
reverb(musicBus[0], musicBus[1], 0.34, 0.86);
reverb(percBus[0], percBus[1], 0.16, 0.7);

/** 1 outside [a, b], 0 inside, with `r`-second ramps at the edges. */
const hole = (t: number, a: number, b: number, r: number) => Math.min(1, Math.max(0, (a - t) / r) + Math.max(0, (t - b) / r));

const L = new Float32Array(N),
  R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  // dead air between the glitch and the turn, and a breath (an 8th of a beat) before the drop
  const gate = hole(t, tBlack, tTurn, 0.005) * hole(t, B(bDrop) - SPB / 8, B(bDrop), 0.001);
  const out = Math.min(1, (N / SR - t) / 0.5); // fade the last half second
  L[i] = (kickBus[0][i] + bassBus[0][i] + musicBus[0][i] + percBus[0][i]) * gate * out;
  R[i] = (kickBus[1][i] + bassBus[1][i] + musicBus[1][i] + percBus[1][i]) * gate * out;
}

writeWav(path.resolve('public/audio/hook-music.wav'), L, R);
