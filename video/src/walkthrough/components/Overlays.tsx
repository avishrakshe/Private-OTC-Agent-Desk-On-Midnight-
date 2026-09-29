import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { TIMELINE, type Word } from '../timeline';
import { C, F, FPS, W, appear, easeInOut } from '../theme';
import { BrandMark } from './icons';

/* ───────── captions ───────── */

interface Chunk {
  words: Word[];
  start: number; // absolute frames
  end: number;
}

const chunkWords = (words: Word[], offset: number): Chunk[] => {
  const chunks: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    chunks.push({ words: cur, start: offset + cur[0].start * FPS - 3, end: offset + cur[cur.length - 1].end * FPS + 8 });
    cur = [];
  };
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const chars = cur.reduce((a, x) => a + x.text.length + 1, 0);
    if (!next || next.start - w.end > 0.22 || cur.length >= 7 || chars > 40) flush();
  });
  // hold each chunk until the next one starts (unless there's a long pause)
  for (let i = 0; i < chunks.length - 1; i++) {
    if (chunks[i + 1].start - chunks[i].end < 12) chunks[i].end = chunks[i + 1].start;
  }
  return chunks;
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const chunks = useMemo(
    () => TIMELINE.filter((t) => t.captions).flatMap((t) => chunkWords(t.words, t.from + t.lead)),
    [],
  );
  const c = chunks.find((k) => frame >= k.start && frame < k.end);
  if (!c) return null;
  const inT = appear(frame, c.start, 8);
  const outT = appear(frame, c.end - 5, 5);
  const secs = (frame - (c.start + 3)) / FPS;
  const base = c.words[0].start;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 46, pointerEvents: 'none' }}>
      <div
        style={{
          maxWidth: 1400,
          padding: '14px 30px',
          borderRadius: 18,
          background: 'rgba(8,8,10,0.72)',
          border: `1px solid ${C.line}`,
          backdropFilter: 'blur(14px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          fontFamily: F.body,
          fontWeight: 600,
          fontSize: 34,
          letterSpacing: '-0.01em',
          lineHeight: 1.25,
          textAlign: 'center',
          opacity: inT * (1 - outT),
          transform: `translateY(${(1 - inT) * 14}px)`,
        }}
      >
        {c.words.map((w, i) => {
          const t = base + secs;
          const active = t >= w.start && (i === c.words.length - 1 || t < c.words[i + 1].start);
          const past = t >= w.end;
          return (
            <span
              key={i}
              style={{
                color: active ? C.lime : past ? C.text : 'rgba(242,242,240,0.42)',
                textShadow: active ? `0 0 24px rgba(194,247,58,0.45)` : undefined,
              }}
            >
              {w.text}
              {i < c.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ───────── chapter bar ───────── */

const HIDDEN = new Set(['hook', 'brand', 'outro']);
const CHAPTERS: string[] = [];
TIMELINE.forEach((t) => {
  if (!HIDDEN.has(t.id) && !CHAPTERS.includes(t.chapter)) CHAPTERS.push(t.chapter);
});

export const ChapterBar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const idx = TIMELINE.findIndex((t, i) => frame >= t.from && (i === TIMELINE.length - 1 || frame < TIMELINE[i + 1].from + 9));
  const scene = TIMELINE[Math.max(0, idx)];
  const visible = !HIDDEN.has(scene.id);
  // fade the bar in/out around hidden scenes
  const vis = TIMELINE.map((t) => (HIDDEN.has(t.id) ? 0 : 1));
  const fade = interpolate(
    frame,
    TIMELINE.flatMap((t) => [t.from, t.from + 16]),
    TIMELINE.flatMap((_, i) => [vis[Math.max(0, i - 1)], vis[i]]),
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const n = CHAPTERS.indexOf(scene.chapter);
  const changeAt = TIMELINE.find((t) => t.chapter === scene.chapter)!.from;
  const ch = appear(frame, changeAt + 4, 16);
  const progress = frame / total;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: W * progress, background: `linear-gradient(90deg, ${C.violet}, ${C.lime})`, opacity: 0.85 }} />
      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: fade,
        }}
      >
        <span style={{ fontFamily: F.mono, fontSize: 20, color: C.lime, letterSpacing: '0.1em' }}>
          {visible && n >= 0 ? String(n + 1).padStart(2, '0') : ''}
        </span>
        <span style={{ width: 34, height: 1.5, background: C.line2 }} />
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: C.text2,
            opacity: ch,
            transform: `translateX(${(1 - ch) * 16}px)`,
            display: 'inline-block',
          }}
        >
          {scene.chapter}
        </span>
      </div>
      <div style={{ position: 'absolute', right: 64, top: 36, display: 'flex', alignItems: 'center', gap: 12, opacity: fade * 0.9 }}>
        <BrandMark size={34} />
        <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 22, color: C.text, letterSpacing: '-0.02em' }}>Private OTC Agent Desk</span>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── transition ───────── */

const ZoomBlur: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const p = easeInOut(presentationProgress);
  const entering = presentationDirection === 'entering';
  const opacity = entering ? p : 1 - p;
  const scale = entering ? 0.93 + 0.07 * p : 1 + 0.12 * p;
  const blur = entering ? (1 - p) * 16 : p * 16;
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

export const zoomBlur = (): TransitionPresentation<Record<string, never>> => ({ component: ZoomBlur, props: {} });
