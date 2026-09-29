/**
 * The whole soundtrack as data: narration, the ducked music bed and every sound effect, placed on
 * narration cues. The composition plays it (Studio preview), and scripts/render-walkthrough.ts
 * mixes the same plan in Node for the final render. Pure: no React, no fonts.
 */
import type { SceneId } from './script';
import { TIMELINE, TOTAL_FRAMES, cueOf, sceneById } from './timeline';

export type SfxName = 'whoosh' | 'swoosh' | 'impact' | 'riser' | 'chime' | 'denied' | 'click' | 'blip' | 'typing';

export interface Clip {
  /** path under public/ */
  src: string;
  /** absolute start frame */
  from: number;
  /** frames the clip may play for */
  frames: number;
  /** constant gain, or gain per frame relative to `from` */
  volume: number | ((f: number) => number);
  label: string;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

// narration windows, for ducking the music under the voice
const VOICE_WINDOWS = TIMELINE.map((t) => [t.from + t.lead, t.from + t.lead + t.voiceFrames] as const);

export const musicVolume = (f: number) => {
  let duck = 0;
  for (const [a, b] of VOICE_WINDOWS) {
    duck = Math.max(duck, Math.min(ramp(f, a - 10, a), 1 - ramp(f, b, b + 14)));
  }
  const fadeIn = ramp(f, 0, 24);
  const fadeOut = 1 - ramp(f, TOTAL_FRAMES - 70, TOTAL_FRAMES - 4);
  return (0.3 - 0.2 * duck) * fadeIn * fadeOut;
};

/** Effects per scene, in scene-relative frames. */
const SCENE_SFX: Record<SceneId, (cue: ReturnType<typeof cueOf>) => [SfxName, number, number][]> = {
  hook: (c) => [
    ['swoosh', c('announced') - 4, 0.3],
    ['blip', c('size'), 0.35],
    ['blip', c('price'), 0.35],
    ['blip', c('wallet'), 0.35],
    ['denied', c('bots'), 0.25],
  ],
  problem: (c) => [
    ['swoosh', c('ahead') - 2, 0.28],
    ['swoosh', c('sandwich') + 6, 0.28],
    ['denied', c('spread'), 0.22],
    ['whoosh', c('for') - 12, 0.3],
    ['click', c('closed'), 0.7],
    ['chime', c('closed') + 2, 0.3],
  ],
  brand: (c) => [
    ['impact', c('meet') - 2, 0.6],
    ['blip', c('dao') - 3, 0.25],
    ['blip', c('market') - 3, 0.25],
    ['blip', c('ai') - 3, 0.25],
    ['whoosh', c('nobody') - 10, 0.3],
  ],
  how: (c) => [
    ['blip', c('id') - 4, 0.22],
    ['blip', c('hash'), 0.22],
    ['blip', c('hash') + 7, 0.22],
    ['blip', c('hash') + 14, 0.22],
    ['whoosh', c('encrypted') - 6, 0.22],
    ['chime', c('settles') - 2, 0.32],
    ['blip', c('settles') + 6, 0.22],
    ['swoosh', c('auditor') - 4, 0.25],
  ],
  layers: (c) => [
    ['click', c('never'), 0.4],
    ['whoosh', c('proof') - 4, 0.25],
    ['chime', c('nothing') - 4, 0.22],
    ['swoosh', c('ledger') - 4, 0.25],
  ],
  features: (c) => [
    ['whoosh', c('every') - 6, 0.3],
    ...(['pre-trade', 'zero-knowledge', 'proof', 'oracle'].map((w) => ['swoosh', c(w) - 6, 0.18]) as [SfxName, number, number][]),
    ['denied', c('no') - 2, 0.4],
    ['denied', c('transaction') - 2, 0.4],
  ],
  agents: (c) => [
    ['click', c('watch') + 16, 0.7],
    ['typing', c('watch') + 22, 0.18],
    ['swoosh', c('treasury') - 8, 0.18],
    ['swoosh', c('three', 2) - 8, 0.18],
    ['denied', c('fat-finger') - 3, 0.32],
    ['denied', c('mandate') - 3, 0.32],
    ['denied', c('fund') - 3, 0.32],
  ],
  result: (c) => [
    ['blip', c('sold') - 6, 0.3],
    ['blip', c('million') - 8, 0.3],
    ['blip', c('receipts') - 8, 0.3],
    ['impact', c('zero') - 3, 0.38],
    ['chime', c('zero'), 0.35],
  ],
  mandate: (c) => [
    ['whoosh', c('can') - 8, 0.25],
    ['click', c('compromised') + 4, 0.7],
    ['denied', c('refuses') - 2, 0.45],
    ['impact', c('no') - 2, 0.3],
  ],
  guarantees: (c) => [
    ['blip', c('one') - 4, 0.3],
    ['blip', c('twelve') - 4, 0.3],
    ['blip', c('six') - 4, 0.3],
    ['swoosh', c('six') - 6, 0.2],
    ...(['dao', 'unlocks', 'market', 'ai'].map((w) => ['blip', c(w) - 4, 0.18]) as [SfxName, number, number][]),
  ],
  live: (c) => {
    const tDeploy = c('deploy');
    const step = Math.max(3, Math.floor((c('eleven') + 6 - tDeploy) / 11));
    return [
      ['click', c('connect') + 12, 0.7],
      ['typing', c('generate'), 0.14],
      ['chime', c('settle') + 12, 0.3],
      ['swoosh', c('switch') - 6, 0.22],
      ['click', c('switch') + 8, 0.6],
      ...(Array.from({ length: 11 }, (_, i) => ['blip', tDeploy + 4 + i * step, 0.1]) as [SfxName, number, number][]),
    ];
  },
  about: (c) => [
    ['whoosh', c('public') - 8, 0.24],
    ['whoosh', c('match') - 8, 0.24],
    ['whoosh', c('who') - 8, 0.24],
  ],
  outro: (c) => [
    ['impact', c('private') - 6, 0.4],
    ['blip', c('sealed') - 3, 0.22],
    ['blip', c('zero-knowledge') - 3, 0.22],
    ['blip', c('agents') - 3, 0.22],
    ['chime', c('try') - 2, 0.35],
  ],
};

/** Timing helpers the scenes share with the plan, so pictures and sounds land together. */
export const liveTxStep = (i: number) => {
  const c = cueOf('live');
  const tDeploy = c('deploy');
  return tDeploy + 4 + i * Math.max(3, Math.floor((c('eleven') + 6 - tDeploy) / 11));
};

export const AUDIO_PLAN: Clip[] = (() => {
  const clips: Clip[] = [];
  const sfx = (name: SfxName, from: number, volume: number, label: string) =>
    clips.push({ src: `audio/${name}.wav`, from: Math.max(0, Math.round(from)), frames: 90, volume, label });

  // narration
  for (const t of TIMELINE) {
    clips.push({ src: t.voiceFile, from: t.from + t.lead, frames: t.voiceFrames + 10, volume: 1, label: `voice:${t.id}` });
  }
  // music bed
  clips.push({ src: 'audio/music.wav', from: 0, frames: TOTAL_FRAMES, volume: musicVolume, label: 'music' });
  // scene effects
  for (const t of TIMELINE) {
    for (const [name, at, vol] of SCENE_SFX[t.id](cueOf(t.id))) sfx(name, t.from + at, vol, `${t.id}:${name}`);
  }
  // transitions, and the riser into the logo
  TIMELINE.slice(1).forEach((t, i) => sfx(i % 2 ? 'swoosh' : 'whoosh', t.from - 4, 0.16, `transition:${t.id}`));
  sfx('riser', sceneById('brand').from + cueOf('brand')('meet') - 70, 0.3, 'brand:riser');

  return clips.sort((a, b) => a.from - b.from);
})();
