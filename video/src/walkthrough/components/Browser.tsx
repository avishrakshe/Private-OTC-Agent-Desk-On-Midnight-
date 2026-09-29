import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, F, appear, easeInOut, lerp, pop } from '../theme';
import { tint, toneColor, type Tone } from './ui';

/** [x, y, w, h] in screenshot pixels. */
export type Rect = [number, number, number, number];
/** From `at`, the camera travels to `rect` over `dur` frames, then rests there. The first key is the start. */
export interface CamKey {
  at: number;
  rect: Rect;
  dur?: number;
}

const lerpRect = (a: Rect, b: Rect, t: number): Rect => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];

export const cameraAt = (frame: number, keys: CamKey[]): Rect => {
  let rest = keys[0].rect;
  for (let k = 1; k < keys.length; k++) {
    const key = keys[k];
    if (frame < key.at) return rest;
    // a later key may interrupt this move; it then starts from wherever the camera got to
    const nextAt = k + 1 < keys.length ? keys[k + 1].at : Infinity;
    const t = interpolate(Math.min(frame, nextAt), [key.at, key.at + (key.dur ?? 26)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeInOut,
    });
    const pos = lerpRect(rest, key.rect, t);
    if (frame < nextAt) return pos;
    rest = pos;
  }
  return rest;
};

export interface ShotLayer {
  src: string;
  w: number;
  h: number;
  /** frame the layer fades in (first layer: ignored) */
  from?: number;
}

/**
 * A screenshot viewed through a moving camera. Overlays are drawn in screenshot coordinates,
 * so highlights and the cursor stick to the UI while the camera moves. `s` is the current scale.
 */
export const Shot: React.FC<{
  layers: ShotLayer[];
  width: number;
  height: number;
  keys: CamKey[];
  overlay?: (s: number) => React.ReactNode;
  drift?: number;
}> = ({ layers, width, height, keys, overlay, drift = 0.012 }) => {
  const frame = useCurrentFrame();
  const [rx, ry, rw, rh] = cameraAt(frame, keys);
  const iw = layers[0].w;
  const ih = Math.max(...layers.map((l) => l.h));
  const s = Math.min(width / rw, height / rh) * (1 + drift * Math.sin(frame / 90));
  const clampAxis = (t: number, content: number, view: number) =>
    content <= view ? (view - content) / 2 : Math.min(0, Math.max(view - content, t));
  const tx = clampAxis(width / 2 - (rx + rw / 2) * s, iw * s, width);
  const ty = clampAxis(height / 2 - (ry + rh / 2) * s, ih * s, height);

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', background: '#060608' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: iw,
          height: ih,
          transformOrigin: '0 0',
          transform: `translate(${tx}px, ${ty}px) scale(${s})`,
        }}
      >
        {layers.map((l, i) => (
          <Img
            key={l.src}
            src={staticFile(`shots/${l.src}`)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: l.w,
              height: l.h,
              opacity: i === 0 ? 1 : appear(frame, l.from ?? 0, 12),
            }}
          />
        ))}
        {overlay?.(s)}
      </div>
    </div>
  );
};

/** Spotlight a region: glowing outline, and everything else dimmed. */
export const Spot: React.FC<{ rect: Rect; at: number; until?: number; s: number; tone?: Tone; dim?: number; radius?: number }> = ({
  rect,
  at,
  until,
  s,
  tone = 'lime',
  dim = 0.55,
  radius = 22,
}) => {
  const frame = useCurrentFrame();
  const o = appear(frame, at, 14) * (until !== undefined ? 1 - appear(frame, until, 12) : 1);
  if (o <= 0) return null;
  const pulse = 0.75 + 0.25 * Math.sin((frame - at) / 7);
  const pad = 10 / s;
  return (
    <div
      style={{
        position: 'absolute',
        left: rect[0] - pad,
        top: rect[1] - pad,
        width: rect[2] + pad * 2,
        height: rect[3] + pad * 2,
        borderRadius: radius / s + pad,
        border: `${3 / s}px solid ${toneColor(tone)}`,
        boxShadow: `0 0 0 ${9999}px rgba(3,3,5,${dim * o}), 0 0 ${40 / s}px ${tint(tone, 0.55 * pulse)}, inset 0 0 ${30 / s}px ${tint(tone, 0.2)}`,
        opacity: o,
        transform: `scale(${1.04 - 0.04 * appear(frame, at, 16)})`,
      }}
    />
  );
};

/** A pointer that glides between points (screenshot coords) and ripples on clicks. */
export const Cursor: React.FC<{ path: { at: number; x: number; y: number }[]; clicks?: number[]; s: number; appearAt?: number }> = ({
  path,
  clicks = [],
  s,
  appearAt,
}) => {
  const frame = useCurrentFrame();
  const start = appearAt ?? path[0].at;
  // fade in, then out shortly after the last move
  const o = appear(frame, start, 10) * (1 - appear(frame, path[path.length - 1].at + 12, 12));
  if (o <= 0) return null;
  let x = path[0].x,
    y = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const p = path[i],
      q = path[i - 1];
    const t = interpolate(frame, [q.at, p.at], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
    if (frame >= q.at) {
      x = lerp(q.x, p.x, t);
      y = lerp(q.y, p.y, t);
    }
  }
  const k = 1 / s;
  const pressing = clicks.some((c) => frame >= c && frame < c + 6);
  return (
    <>
      {clicks.map((c) => {
        const r = appear(frame, c, 22);
        if (frame < c || r >= 1) return null;
        return (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: x - 40 * k * r,
              top: y - 40 * k * r,
              width: 80 * k * r,
              height: 80 * k * r,
              borderRadius: '50%',
              border: `${3 * k}px solid ${C.lime}`,
              opacity: 1 - r,
            }}
          />
        );
      })}
      <svg
        width={34 * k}
        height={34 * k}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: x - 5 * k,
          top: y - 3 * k,
          opacity: o,
          transform: `scale(${pressing ? 0.86 : 1})`,
          transformOrigin: '20% 10%',
          filter: `drop-shadow(0 ${4 * k}px ${8 * k}px rgba(0,0,0,0.6))`,
        }}
      >
        <path d="M4 2.5l15.5 9-6.8 1.6 3.9 6.9-2.9 1.6-3.9-6.9-5 4.7z" fill="#fff" stroke="#0b0b0e" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** macOS-style browser window around a Shot. */
export const Browser: React.FC<{
  url: string;
  width: number;
  height: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: Tone;
}> = ({ url, width, height, children, style, glow }) => {
  const bar = 54;
  return (
    <div
      style={{
        width,
        height: height + bar,
        borderRadius: 22,
        overflow: 'hidden',
        background: '#0c0c0f',
        border: `1.5px solid ${C.line2}`,
        boxShadow: `0 60px 140px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.6)${glow ? `, 0 0 120px ${tint(glow, 0.18)}` : ''}`,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          height: bar,
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          gap: 10,
          background: 'linear-gradient(180deg, #19191d, #121215)',
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: 9, background: c, opacity: 0.85 }} />
        ))}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 26px',
              minWidth: 460,
              justifyContent: 'center',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.line}`,
              fontFamily: F.body,
              fontSize: 19,
              color: C.text2,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2.2" strokeLinecap="round">
              <rect x="4" y="10" width="16" height="11" rx="3" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            {url}
          </div>
        </div>
        <span style={{ width: 62 }} />
      </div>
      {children}
      {/* glass sheen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(125deg, rgba(255,255,255,0.05) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)',
        }}
      />
    </div>
  );
};

/** Springy 3D entrance for a window: tilts up from the floor and settles. */
export const use3DEntrance = (start: number, from = { rx: 28, y: 260, s: 0.82 }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, start, 30, 16);
  const o = appear(frame, start, 12);
  return {
    opacity: o,
    transform: `translateY(${(1 - p) * from.y}px) rotateX(${(1 - p) * from.rx}deg) scale(${from.s + (1 - from.s) * p})`,
  };
};
