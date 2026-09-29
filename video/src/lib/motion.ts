import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { springs, transitionFrames } from '../theme';

type Preset = keyof typeof springs;

/** 0 → 1 spring that starts `delay` frames into the current sequence. */
export const useSpring = (delay = 0, preset: Preset = 'snappy', durationInFrames?: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: springs[preset], durationInFrames });
};

/** Same, but callable in loops (pass the frame in). */
export const springAt = (frame: number, fps: number, delay = 0, preset: Preset = 'snappy') =>
  spring({ frame: frame - delay, fps, config: springs[preset] });

/**
 * Scene envelope: springs in over the first `transitionFrames` and eases out over the last,
 * returning opacity, blur and a slight camera push for cross-scene glow/blur transitions.
 */
export const useEnvelope = (duration: number, { holdEnd = false } = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: springs.soft, durationInFrames: transitionFrames + 6 });
  const exit = holdEnd
    ? 0
    : spring({ frame: frame - (duration - transitionFrames), fps, config: springs.soft, durationInFrames: transitionFrames });
  const presence = enter * (1 - exit);
  return {
    opacity: presence,
    blur: interpolate(presence, [0, 1], [18, 0]),
    // Slow camera push across the whole scene, plus a small pop on entry.
    scale: interpolate(frame, [0, duration], [1.0, 1.045]) * interpolate(enter, [0, 1], [0.97, 1]) * interpolate(exit, [0, 1], [1, 1.04]),
  };
};

/** Deterministic pseudo-random number in [0, 1) for a seed (stable across renders). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const GLYPHS = 'ABCDEF0123456789#%&*+=<>/\\|$@';
/** Scrambled mono text that changes every `every` frames. */
export const scramble = (length: number, frame: number, seed: number, every = 2) =>
  Array.from({ length }, (_, i) => GLYPHS[Math.floor(rand(seed * 97 + i * 13 + Math.floor(frame / every) * 7) * GLYPHS.length)]).join('');
