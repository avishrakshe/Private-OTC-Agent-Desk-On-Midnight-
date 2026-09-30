// The demo-day hook runs on a 120 BPM grid: at 30 fps one beat is exactly 15 frames, so every cut,
// hit and sound lands on a whole frame. Kept free of imports so Node scripts (the music synth and
// the mixer) can load it.
export const FPS = 30;
export const BPM = 120;
export const BEAT = (FPS * 60) / BPM;
export const BAR = BEAT * 4;
export const BARS = 8;
export const TOTAL_FRAMES = BAR * BARS; // 480 frames = 16 s

/** Frame of beat `n` (0-based; fractions allowed). */
export const b = (n: number) => Math.round(n * BEAT);

/** The cue sheet. Scenes, camera hits and the soundtrack all read from here. */
export const CUE = {
  // act 1 · the leak
  type: 4,
  size: b(2),
  price: b(3),
  wallet: b(4),
  bots: b(5),
  frontRun: b(6),
  sandwich: b(7),
  // act 2 · the signal
  announced: b(8),
  before: b(9),
  fills: b(10),
  glitch: b(11),
  blackout: b(11.6),
  // act 3 · the turn
  whatIf: b(12),
  redact: b(12.5),
  lock: b(13.5),
  roll: b(14),
  // act 4 · the reveal
  drop: b(16),
  subtitle: b(18),
  // act 5 · what it does
  sealed: b(20),
  zk: b(22),
  agents: b(24),
  zero: b(26),
  // act 6 · end card (holds to the last frame, which is the poster)
  end: b(28),
  tagline: b(29),
} as const;

/** Act boundaries (hard cuts on the beat). */
export const ACTS = {
  leak: [0, CUE.announced],
  signal: [CUE.announced, CUE.whatIf],
  turn: [CUE.whatIf, CUE.drop],
  reveal: [CUE.drop, CUE.sealed],
  pillars: [CUE.sealed, CUE.end],
  end: [CUE.end, TOTAL_FRAMES],
} as const satisfies Record<string, readonly [number, number]>;

/** Camera kicks: [frame, strength in px]. */
export const HITS: [number, number][] = [
  [CUE.size, 4],
  [CUE.price, 4],
  [CUE.wallet, 4],
  [CUE.frontRun, 16],
  [CUE.sandwich, 16],
  [CUE.announced, 9],
  [CUE.before, 9],
  [CUE.fills, 12],
  [CUE.lock, 6],
  [CUE.drop, 26],
  [CUE.sealed, 8],
  [CUE.zk, 8],
  [CUE.agents, 8],
  [CUE.zero, 16],
  [CUE.end, 12],
];
