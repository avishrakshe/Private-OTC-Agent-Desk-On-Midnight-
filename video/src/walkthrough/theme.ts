import { Easing, continueRender, delayRender, interpolate, spring, staticFile } from 'remotion';
import { FONT_FILES } from './fonts';

// Same palette and type as the site (src/App.css).
export const C = {
  bg: '#070708',
  bg2: '#0d0d0f',
  surface: '#141416',
  surface2: '#1a1a1d',
  text: '#f2f2f0',
  text2: '#a6a6ad',
  text3: '#6e6e76',
  lime: '#c2f73a',
  violet: '#9b8aff',
  cyan: '#62e6ff',
  coral: '#ff6b81',
  amber: '#ffbf5c',
  line: 'rgba(255,255,255,0.09)',
  line2: 'rgba(255,255,255,0.16)',
};

// Self-hosted variable fonts (public/fonts). Prefixed names keep them apart from the intro's
// Google-loaded "Inter".
const FAMILY: Record<(typeof FONT_FILES)[number]['family'], string> = {
  'Inter Tight': 'OTC Inter Tight',
  Inter: 'OTC Inter',
  'JetBrains Mono': 'OTC JetBrains Mono',
};
if (typeof document !== 'undefined') {
  for (const f of FONT_FILES) {
    const handle = delayRender(`Loading ${f.file}`);
    const face = new FontFace(FAMILY[f.family], `url('${staticFile(f.file)}') format('woff2')`, { weight: f.weights });
    face
      .load()
      // FontFaceSet#add is typed in DOM.Iterable, which this tsconfig doesn't include
      .then(() => (document.fonts as unknown as Set<FontFace>).add(face))
      .catch((err) => console.error(`${f.file} failed to load; run \`npm run walkthrough:fonts\``, err))
      .finally(() => continueRender(handle));
  }
}

export const F = {
  display: `'${FAMILY['Inter Tight']}', 'Inter Tight', sans-serif`,
  body: `'${FAMILY.Inter}', Inter, sans-serif`,
  mono: `'${FAMILY['JetBrains Mono']}', 'JetBrains Mono', monospace`,
};

export { FPS, H, W } from './constants';
import { FPS } from './constants';

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 → 1 over `dur` frames starting at `start`, expo-out eased and clamped. */
export const appear = (frame: number, start: number, dur = 18, ease = easeOut) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

/** 1 → 0 over `dur` frames starting at `start`. */
export const vanish = (frame: number, start: number, dur = 14) => 1 - appear(frame, start, dur, easeInOut);

export const pop = (frame: number, start: number, fps = FPS, damping = 13) =>
  spring({ frame: frame - start, fps, config: { damping, mass: 0.7, stiffness: 140 } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
