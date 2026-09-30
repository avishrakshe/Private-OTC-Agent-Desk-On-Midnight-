import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { C, F } from '../../walkthrough/theme';
import { CUE } from '../beats';
import { Glitch, Slam } from '../fx';

// A price that bleeds out while the order is still waiting to fill.
const POINTS = (() => {
  const pts: [number, number][] = [];
  let y = 300;
  for (let i = 0; i <= 48; i++) {
    const x = -40 + i * 42;
    y += 8 + random(`pc${i}`) * 14 - (i % 5 === 0 ? 30 : 0);
    pts.push([x, y]);
  }
  return pts;
})();

/** Act 2: "Announced / before it fills." slammed on three beats, over a bleeding chart; then a glitch to black. */
export const Signal: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [CUE.announced, CUE.glitch], [0.15, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const path = useMemo(() => POINTS.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' '), []);
  const n = Math.max(1, Math.floor(draw * (POINTS.length - 1)));
  const [hx, hy] = POINTS[n];

  if (frame >= CUE.blackout) return <AbsoluteFill style={{ background: '#000' }} />;

  return (
    <Glitch from={CUE.glitch} to={CUE.blackout}>
      <AbsoluteFill>
        {/* chart */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
          <defs>
            <linearGradient id="sig-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.coral} stopOpacity={0.28} />
              <stop offset="1" stopColor={C.coral} stopOpacity={0} />
            </linearGradient>
            <clipPath id="sig-clip">
              <rect x={0} y={0} width={hx + 40} height={1080} />
            </clipPath>
          </defs>
          <g clipPath="url(#sig-clip)">
            <path d={`${path} L1980,1080 L-40,1080 Z`} fill="url(#sig-fill)" />
            <path d={path} fill="none" stroke={C.coral} strokeWidth={5} strokeLinejoin="round" />
          </g>
          <circle cx={hx} cy={hy} r={12 + 4 * Math.sin(frame / 2)} fill={C.coral} />
          <circle cx={hx} cy={hy} r={34} fill="none" stroke={C.coral} strokeWidth={2} opacity={0.5} />
        </svg>

        {/* the words, one per beat */}
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 30 }}>
          <Slam text="Announced" at={CUE.announced} size={250} />
          <div style={{ display: 'flex', gap: 48, alignItems: 'baseline' }}>
            <Slam text="before" at={CUE.before} size={190} color={C.coral} ghost={C.amber} style={{ fontStyle: 'italic' }} />
            <Slam text="it fills." at={CUE.fills} size={190} />
          </div>
        </AbsoluteFill>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 90,
            textAlign: 'center',
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: '0.28em',
            color: C.coral,
            opacity: frame >= CUE.fills ? 1 : 0,
          }}
        >
          EVERY BIG ORDER ON A PUBLIC CHAIN
        </div>
      </AbsoluteFill>
    </Glitch>
  );
};
