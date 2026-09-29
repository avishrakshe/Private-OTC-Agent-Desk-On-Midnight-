import { noise2D } from '@remotion/noise';
import React, { useMemo } from 'react';
import { AbsoluteFill, interpolateColors, random, useCurrentFrame } from 'remotion';
import { C, H, W } from '../theme';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

/**
 * Persistent backdrop under every scene: drifting colour fields, a slow perspective grid,
 * floating particles, vignette and film grain. `danger` (0–1) tints it coral.
 */
export const Background: React.FC<{ danger: number; energy?: number }> = ({ danger, energy = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const blobs = [
    { c: interpolateColors(danger, [0, 1], [C.violet, C.coral]), x: 0.22, y: 0.3, r: 900, a: 0.2 },
    { c: interpolateColors(danger, [0, 1], [C.lime, '#ff3355']), x: 0.8, y: 0.72, r: 820, a: 0.1 },
    { c: interpolateColors(danger, [0, 1], [C.cyan, C.amber]), x: 0.7, y: 0.18, r: 700, a: 0.09 },
  ];

  const particles = useMemo(
    () =>
      new Array(70).fill(0).map((_, i) => ({
        x: random(`px${i}`) * W,
        y: random(`py${i}`) * H,
        s: 1 + random(`ps${i}`) * 2.4,
        v: 6 + random(`pv${i}`) * 18,
        p: random(`pp${i}`) * 100,
      })),
    [],
  );

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 40%, #101016 0%, #070708 55%, #040405 100%)' }} />

      {blobs.map((b, i) => {
        const nx = noise2D(`bx${i}`, t * 0.05, 0) * 180;
        const ny = noise2D(`by${i}`, 0, t * 0.05) * 140;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x * W - b.r / 2 + nx,
              top: b.y * H - b.r / 2 + ny,
              width: b.r,
              height: b.r,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${b.c} 0%, transparent 65%)`,
              opacity: b.a * (0.8 + 0.2 * Math.sin(t * 0.6 + i)) * energy,
            }}
          />
        );
      })}

      {/* perspective grid floor */}
      <div style={{ position: 'absolute', inset: 0, perspective: 900, perspectiveOrigin: '50% 30%' }}>
        <div
          style={{
            position: 'absolute',
            left: -1200,
            right: -1200,
            top: 560,
            height: 1400,
            transform: 'rotateX(74deg)',
            transformOrigin: '50% 0%',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.07) 1.5px, transparent 1.5px)',
            backgroundSize: '90px 90px',
            backgroundPosition: `0px ${(frame * 0.9) % 90}px`,
            maskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 60%, transparent 100%)',
            opacity: 0.55,
          }}
        />
      </div>

      {/* particles */}
      {particles.map((p, i) => {
        const y = (p.y - t * p.v + H * 10) % H;
        const tw = 0.25 + 0.35 * Math.sin(t * 1.3 + p.p);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: y,
              width: p.s,
              height: p.s,
              borderRadius: 9,
              background: i % 7 === 0 ? interpolateColors(danger, [0, 1], [C.lime, C.coral]) : '#fff',
              opacity: tw * 0.6,
            }}
          />
        );
      })}

      {/* vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)' }} />
      {/* grain: one cached noise tile, jittered every frame (cheap, unlike a full-frame filter) */}
      <AbsoluteFill
        style={{
          opacity: 0.07,
          mixBlendMode: 'overlay',
          backgroundImage: GRAIN,
          backgroundSize: '256px 256px',
          backgroundPosition: `${Math.floor(random(`gx${frame}`) * 256)}px ${Math.floor(random(`gy${frame}`) * 256)}px`,
        }}
      />
    </AbsoluteFill>
  );
};
