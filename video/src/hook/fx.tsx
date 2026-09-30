import React from 'react';
import { AbsoluteFill, random, spring, useCurrentFrame } from 'remotion';
import { C, F, FPS, appear } from '../walkthrough/theme';
import { HITS } from './beats';

/** Camera kick after each hit in HITS: a fast, decaying shake (deterministic per frame). */
export const shake = (frame: number) => {
  let x = 0,
    y = 0,
    r = 0;
  for (const [at, amp] of HITS) {
    const t = frame - at;
    if (t < 0 || t > 14) continue;
    const k = amp * Math.exp(-t / 3.2);
    x += (random(`sx${at}-${frame}`) * 2 - 1) * k;
    y += (random(`sy${at}-${frame}`) * 2 - 1) * k;
    r += (random(`sr${at}-${frame}`) * 2 - 1) * k * 0.04;
  }
  return { x, y, r };
};

/** Full-frame white flash: peaks at `at`, gone after `dur`. */
export const Flash: React.FC<{ at: number; dur?: number; peak?: number; color?: string }> = ({ at, dur = 14, peak = 0.9, color = '#fff' }) => {
  const frame = useCurrentFrame();
  const o = frame < at ? 0 : peak * (1 - appear(frame, at, dur));
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }} />;
};

/**
 * Digital glitch: while `active`, the children are drawn as horizontal slices, each shoved sideways,
 * with a red/cyan channel split. Outside the window it renders the children once, untouched.
 */
export const Glitch: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return <AbsoluteFill>{children}</AbsoluteFill>;
  const k = (frame - from) / (to - from);
  const slices = 7;
  const seed = Math.floor(frame / 2); // re-cut every other frame
  return (
    <AbsoluteFill>
      {[-1, 1].map((side) => (
        <AbsoluteFill
          key={side}
          style={{
            transform: `translateX(${side * (8 + 26 * k)}px)`,
            opacity: 0.55,
            mixBlendMode: 'screen',
            filter: side < 0 ? 'sepia(1) saturate(6) hue-rotate(-50deg)' : 'sepia(1) saturate(6) hue-rotate(150deg)',
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
      {new Array(slices).fill(0).map((_, i) => {
        const top = (i / slices) * 100;
        const h = 100 / slices;
        const dx = (random(`gl${seed}-${i}`) * 2 - 1) * (40 + 220 * k);
        return (
          <AbsoluteFill
            key={i}
            style={{ clipPath: `inset(${top}% 0 ${100 - top - h}% 0)`, transform: `translateX(${dx}px)` }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
      {/* scanlines */}
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 5px)',
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * One word (or a short phrase) slammed onto the screen on a beat: overshoots from big, snaps into
 * place with a chromatic ghost, and holds until the scene cuts.
 */
export const Slam: React.FC<{
  text: string;
  at: number;
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
  ghost?: string;
}> = ({ text, at, size = 220, color = C.text, weight = 800, style, ghost = C.coral }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 14, mass: 0.5, stiffness: 260 } });
  const split = Math.max(0, 1 - (frame - at) / 8);
  return (
    <div
      style={{
        fontFamily: F.display,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.05em',
        lineHeight: 0.92,
        color,
        whiteSpace: 'nowrap',
        transform: `scale(${1.5 - 0.5 * s})`,
        opacity: Math.min(1, (frame - at + 1) / 2),
        filter: s < 0.85 ? `blur(${(1 - s) * 10}px)` : undefined,
        textShadow: split > 0 ? `${-14 * split}px 0 ${ghost}, ${14 * split}px 0 ${C.cyan}` : undefined,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
