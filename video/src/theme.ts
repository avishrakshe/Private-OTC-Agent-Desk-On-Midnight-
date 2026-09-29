/**
 * Colours, fonts and timings. Tweak here; the scenes read everything from this file.
 */
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

const inter = loadInter('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
const mono = loadMono('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });

export const colors = {
  bg: '#07070F',
  bgRaised: '#0E0E1C',
  grid: 'rgba(124, 92, 255, 0.16)',
  text: '#F4F4FA',
  textDim: 'rgba(244, 244, 250, 0.56)',
  violet: '#7C5CFF',
  violetSoft: 'rgba(124, 92, 255, 0.18)',
  cyan: '#22D3EE',
  cyanSoft: 'rgba(34, 211, 238, 0.16)',
  red: '#FF4D6D',
  redSoft: 'rgba(255, 77, 109, 0.16)',
  line: 'rgba(244, 244, 250, 0.10)',
};

export const fonts = {
  sans: inter.fontFamily,
  mono: mono.fontFamily,
};

export const video = {
  fps: 30,
  durationInFrames: 900,
  landscape: { width: 1920, height: 1080 },
  square: { width: 1080, height: 1080 },
  /** Set to true after adding public/music.mp3. */
  music: false,
  musicVolume: 0.6,
};

/** Scene lengths in frames (30 fps). They must add up to video.durationInFrames. */
export const timing = {
  problem: 120, //  0–4s
  mev: 120, //      4–8s
  darkness: 120, // 8–12s
  sealed: 150, //  12–17s
  proof: 120, //   17–21s
  settle: 120, //  21–25s
  logo: 150, //    25–30s (last 60 frames hold still for the poster)
};

/** Frames used to cross-fade (with blur) in and out of every scene. */
export const transitionFrames = 14;

/** Spring presets: every motion in the film uses one of these. */
export const springs = {
  soft: { damping: 200 },
  snappy: { damping: 18, stiffness: 180, mass: 0.7 },
  bouncy: { damping: 11, stiffness: 160, mass: 0.8 },
  slow: { damping: 40, stiffness: 40, mass: 1.2 },
};
