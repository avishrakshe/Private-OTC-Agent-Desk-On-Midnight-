import manifest from './voice-manifest.json';
import { SCRIPT, type SceneId } from './script';
import { FPS } from './constants';

export interface Word {
  text: string;
  start: number;
  end: number;
}

interface VoiceScene {
  file: string;
  duration: number;
  words: Word[];
}

const VOICE = (manifest as { scenes: Record<string, VoiceScene> }).scenes;

/** Frames each scene overlaps the next one during a transition. */
export const TRANSITION = 18;
const LEAD = 14;
const TAIL = 22;
// A little extra air where the picture needs it.
const EXTRA: Partial<Record<SceneId, { lead?: number; tail?: number }>> = {
  hook: { lead: 26 },
  problem: { tail: 20 },
  brand: { tail: 16 },
  guarantees: { tail: 14 },
  result: { tail: 10 },
  mandate: { tail: 12 },
  outro: { tail: 105 },
};

export interface SceneTiming {
  id: SceneId;
  chapter: string;
  captions: boolean;
  /** absolute first frame */
  from: number;
  duration: number;
  /** voice start, relative to the scene */
  lead: number;
  voiceFrames: number;
  voiceFile: string;
  words: Word[];
}

export const TIMELINE: SceneTiming[] = (() => {
  let from = 0;
  return SCRIPT.map((s) => {
    const v = VOICE[s.id];
    if (!v) throw new Error(`No voice for "${s.id}". Run \`npm run voice\`.`);
    const lead = LEAD + (EXTRA[s.id]?.lead ?? 0);
    const voiceFrames = Math.ceil(v.duration * FPS);
    const duration = lead + voiceFrames + TAIL + (EXTRA[s.id]?.tail ?? 0);
    const t: SceneTiming = {
      id: s.id,
      chapter: s.chapter,
      captions: s.captions ?? true,
      from,
      duration,
      lead,
      voiceFrames,
      voiceFile: v.file,
      words: v.words,
    };
    from += duration - TRANSITION;
    return t;
  });
})();

export const TOTAL_FRAMES = (() => {
  const last = TIMELINE[TIMELINE.length - 1];
  return last.from + last.duration;
})();

export const sceneById = (id: SceneId) => TIMELINE.find((t) => t.id === id)!;

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'-]/g, '');

/**
 * Scene-relative frame at which the narrator starts saying `word` (the nth time).
 * Falls back to `fallback` (or the scene start) if the word isn't in the timings.
 */
export const cueOf = (id: SceneId) => {
  const t = sceneById(id);
  return (word: string, nth = 1, offset = 0): number => {
    const target = norm(word);
    let seen = 0;
    for (const w of t.words) {
      if (norm(w.text) === target) {
        seen++;
        if (seen === nth) return t.lead + Math.round(w.start * FPS) + offset;
      }
    }
    console.warn(`cue "${word}"#${nth} not found in ${id}`);
    return t.lead + offset;
  };
};
