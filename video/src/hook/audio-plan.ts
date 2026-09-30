/**
 * The hook's soundtrack as data: the beat-locked music (scripts/hook-music.ts) plus the walkthrough's
 * effects, placed on the cue sheet. DemoHook plays it in Studio; scripts/render-walkthrough.ts mixes
 * the same plan for the final render. Pure: no React, no fonts.
 */
import type { Clip, SfxName } from '../walkthrough/audio-plan';
import { BEAT, CUE, TOTAL_FRAMES } from './beats';

export const HOOK_AUDIO_PLAN: Clip[] = (() => {
  const clips: Clip[] = [{ src: 'audio/hook-music.wav', from: 0, frames: TOTAL_FRAMES, volume: 0.9, label: 'music' }];
  const sfx = (name: SfxName, from: number, volume: number, label: string) =>
    clips.push({ src: `audio/${name}.wav`, from: Math.max(0, Math.round(from)), frames: 90, volume, label });

  // act 1 · the order leaks
  sfx('typing', CUE.type, 0.35, 'type');
  sfx('blip', CUE.size, 0.4, 'size');
  sfx('blip', CUE.price, 0.4, 'price');
  sfx('blip', CUE.wallet, 0.4, 'wallet');
  sfx('denied', CUE.bots, 0.28, 'bots');
  sfx('swoosh', CUE.frontRun - 4, 0.3, 'front-run');
  sfx('swoosh', CUE.sandwich - 4, 0.3, 'sandwich');
  // act 2
  sfx('whoosh', CUE.announced - 6, 0.22, 'announced');
  // act 3 · the turn
  sfx('riser', CUE.drop - 72, 0.5, 'riser');
  sfx('click', CUE.lock, 0.8, 'lock');
  sfx('chime', CUE.lock + 2, 0.32, 'lock:chime');
  // act 4 · reveal
  sfx('impact', CUE.drop - 1, 0.75, 'drop');
  // act 5 · what it does
  for (const at of [CUE.sealed, CUE.zk, CUE.agents]) sfx('whoosh', at - BEAT / 2, 0.26, `pillar@${at}`);
  sfx('impact', CUE.zero - 1, 0.4, 'zero');
  // act 6 · end card
  sfx('impact', CUE.end - 1, 0.55, 'end');
  sfx('chime', CUE.tagline, 0.3, 'tagline');

  return clips.sort((a, b) => a.from - b.from);
})();
