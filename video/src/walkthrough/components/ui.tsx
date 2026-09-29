import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { C, F, appear, easeOut, pop } from '../theme';

export type Tone = 'lime' | 'violet' | 'cyan' | 'coral' | 'amber' | 'neutral';
export const toneColor = (t: Tone) => (t === 'neutral' ? C.text2 : C[t]);
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export const tint = (t: Tone, a: number) => (t === 'neutral' ? `rgba(255,255,255,${a})` : rgba(C[t], a));

/* ───────── chips & cards ───────── */

export const Chip: React.FC<{
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  size?: number;
  mono?: boolean;
  style?: React.CSSProperties;
  solid?: boolean;
}> = ({ tone = 'neutral', children, dot, size = 22, mono, style, solid }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.45,
      padding: `${size * 0.42}px ${size * 0.85}px`,
      borderRadius: 999,
      fontFamily: mono ? F.mono : F.body,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      color: solid ? '#0b1000' : toneColor(tone),
      background: solid ? toneColor(tone) : tint(tone, 0.1),
      border: `1.5px solid ${tint(tone, solid ? 0 : 0.38)}`,
      boxShadow: solid ? `0 0 40px ${tint(tone, 0.45)}` : undefined,
      ...style,
    }}
  >
    {dot && (
      <span
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: 99,
          background: solid ? '#0b1000' : toneColor(tone),
          boxShadow: `0 0 ${size * 0.6}px ${toneColor(tone)}`,
        }}
      />
    )}
    {children}
  </span>
);

export const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; tone?: Tone; glow?: number }> = ({
  children,
  style,
  tone,
  glow = 0,
}) => (
  <div
    style={{
      background: 'linear-gradient(180deg, rgba(28,28,32,0.92), rgba(16,16,19,0.92))',
      border: `1.5px solid ${tone ? tint(tone, 0.45) : C.line2}`,
      borderRadius: 26,
      boxShadow: `0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)${
        tone && glow ? `, 0 0 ${60 * glow}px ${tint(tone, 0.35 * glow)}` : ''
      }`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.text2,
  style,
}) => (
  <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: '0.22em', textTransform: 'uppercase', color, ...style }}>
    {children}
  </div>
);

/* ───────── kinetic type ───────── */

/**
 * Word-by-word reveal: each word rises, un-blurs and fades in with a stagger.
 * Wrap words in `*stars*` to paint them with `accent` (a colour or CSS gradient).
 */
export const Kinetic: React.FC<{
  text: string;
  start: number;
  size?: number;
  weight?: number;
  color?: string;
  accent?: string;
  stagger?: number;
  align?: 'left' | 'center';
  lineHeight?: number;
  style?: React.CSSProperties;
  exit?: number;
}> = ({ text, start, size = 96, weight = 600, color = C.text, accent = C.lime, stagger = 3, align = 'center', lineHeight = 1.04, style, exit }) => {
  const frame = useCurrentFrame();
  const lines = text.split('\n');
  let i = 0;
  const out = exit !== undefined ? appear(frame, exit, 14) : 0;
  return (
    <div
      style={{
        fontFamily: F.display,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.035em',
        lineHeight,
        textAlign: align,
        color,
        opacity: 1 - out,
        transform: `translateY(${-30 * out}px)`,
        filter: out ? `blur(${10 * out}px)` : undefined,
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(' ').map((raw, wi) => {
            const hl = raw.startsWith('*');
            const word = raw.replace(/\*/g, '');
            const t = appear(frame, start + i++ * stagger, 22);
            const gradient = hl && accent.includes('gradient');
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  opacity: t,
                  transform: `translateY(${(1 - t) * 0.45 * size}px) rotate(${(1 - t) * 4}deg)`,
                  filter: t < 1 ? `blur(${(1 - t) * 14}px)` : undefined,
                  color: hl && !gradient ? accent : undefined,
                  backgroundImage: gradient ? accent : undefined,
                  WebkitBackgroundClip: gradient ? 'text' : undefined,
                  WebkitTextFillColor: gradient ? 'transparent' : undefined,
                  paddingBottom: gradient ? size * 0.08 : undefined,
                }}
              >
                {word}
                {wi < line.split(' ').length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Pops a child in with a spring (scale + fade), from `start`. */
export const PopIn: React.FC<{ start: number; children: React.ReactNode; style?: React.CSSProperties; from?: number; y?: number }> = ({
  start,
  children,
  style,
  from = 0.6,
  y = 20,
}) => {
  const frame = useCurrentFrame();
  const s = pop(frame, start);
  const o = appear(frame, start, 10);
  return (
    <div style={{ opacity: o, transform: `translateY(${(1 - s) * y}px) scale(${from + (1 - from) * s})`, ...style }}>{children}</div>
  );
};

/** Slides/fades a child in from a direction. */
export const Enter: React.FC<{
  start: number;
  children: React.ReactNode;
  dx?: number;
  dy?: number;
  dur?: number;
  blur?: number;
  style?: React.CSSProperties;
  exit?: number;
}> = ({ start, children, dx = 0, dy = 30, dur = 20, blur = 8, style, exit }) => {
  const frame = useCurrentFrame();
  const t = appear(frame, start, dur);
  const x = exit !== undefined ? appear(frame, exit, 14) : 0;
  return (
    <div
      style={{
        opacity: t * (1 - x),
        transform: `translate(${(1 - t) * dx}px, ${(1 - t) * dy - x * 20}px)`,
        filter: t < 1 || x > 0 ? `blur(${(1 - t) * blur + x * 8}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Counts up to `value`, formatted, between `start` and `start + dur`. */
export const Counter: React.FC<{
  value: number;
  start: number;
  dur?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ value, start, dur = 36, decimals = 0, prefix = '', suffix = '', style }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, start + dur], [0, value], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}
      {v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

/** Typewriter reveal of a monospace string. */
export const Typed: React.FC<{ text: string; start: number; cps?: number; style?: React.CSSProperties; caret?: boolean }> = ({
  text,
  start,
  cps = 40,
  style,
  caret = true,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - start) / 30) * cps)));
  const showCaret = caret && n < text.length && frame >= start;
  return (
    <span style={{ fontFamily: F.mono, whiteSpace: 'pre', ...style }}>
      {text.slice(0, n)}
      {showCaret ? <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0.2 }}>▍</span> : null}
    </span>
  );
};

/** A coral/lime rubber stamp that slams in. */
export const Stamp: React.FC<{ start: number; tone?: Tone; children: React.ReactNode; rotate?: number; size?: number; style?: React.CSSProperties }> = ({
  start,
  tone = 'coral',
  children,
  rotate = -6,
  size = 44,
  style,
}) => {
  const frame = useCurrentFrame();
  const s = pop(frame, start, 30, 11);
  const o = appear(frame, start, 6);
  return (
    <div
      style={{
        display: 'inline-block',
        opacity: o,
        transform: `rotate(${rotate}deg) scale(${2.2 - 1.2 * s})`,
        padding: `${size * 0.38}px ${size * 0.7}px`,
        border: `4px solid ${toneColor(tone)}`,
        borderRadius: 18,
        color: toneColor(tone),
        background: tint(tone, 0.12),
        fontFamily: F.display,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
        boxShadow: `0 0 80px ${tint(tone, 0.4)}, inset 0 0 40px ${tint(tone, 0.15)}`,
        backdropFilter: 'blur(6px)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Small glowing node used in diagrams. */
export const Node: React.FC<{
  icon: React.ReactNode;
  label: string;
  tone?: Tone;
  size?: number;
  active?: number;
  sub?: string;
}> = ({ icon, label, tone = 'neutral', size = 120, active = 0, sub }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: size * 2 }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        display: 'grid',
        placeItems: 'center',
        color: toneColor(tone),
        background: `linear-gradient(180deg, ${tint(tone, 0.12 + 0.1 * active)}, rgba(18,18,22,0.95))`,
        border: `2px solid ${tint(tone, 0.25 + 0.5 * active)}`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 ${70 * active}px ${tint(tone, 0.45 * active)}`,
      }}
    >
      {icon}
    </div>
    <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.text, textAlign: 'center' }}>{label}</div>
    {sub && <div style={{ fontFamily: F.mono, fontSize: 18, color: C.text3, marginTop: -8, textAlign: 'center' }}>{sub}</div>}
  </div>
);
