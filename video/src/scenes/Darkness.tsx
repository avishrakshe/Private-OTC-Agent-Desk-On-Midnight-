import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { At, Scene } from '../components/Scene';
import { Headline } from '../components/Headline';
import { LockIcon, ShieldIcon } from '../components/Icons';
import { rand, springAt } from '../lib/motion';
import { useLayout } from '../lib/layout';
import { copy } from '../copy';
import { colors, timing } from '../theme';

type Pt = { x: number; y: number };

const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const m = 1 - t;
  return {
    x: m * m * m * p0.x + 3 * m * m * t * p1.x + 3 * m * t * t * p2.x + t * t * t * p3.x,
    y: m * m * m * p0.y + 3 * m * m * t * p1.y + 3 * m * t * t * p2.y + t * t * t * p3.y,
  };
};
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** Points spread along the same outline as SHIELD_PATH (100×120 box, centred on 50,60). */
const shieldPoint = (t: number): Pt => {
  // Segments: top-right edge, right side, right curve, left curve, left side, top-left edge.
  const segs: ((s: number) => Pt)[] = [
    (s) => lerp({ x: 50, y: 4 }, { x: 92, y: 20 }, s),
    (s) => lerp({ x: 92, y: 20 }, { x: 92, y: 58 }, s),
    (s) => cubic({ x: 92, y: 58 }, { x: 92, y: 86 }, { x: 72, y: 106 }, { x: 50, y: 116 }, s),
    (s) => cubic({ x: 50, y: 116 }, { x: 28, y: 106 }, { x: 8, y: 86 }, { x: 8, y: 58 }, s),
    (s) => lerp({ x: 8, y: 58 }, { x: 8, y: 20 }, s),
    (s) => lerp({ x: 8, y: 20 }, { x: 50, y: 4 }, s),
  ];
  const weights = [45, 38, 72, 72, 38, 45];
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (acc <= weights[i]) return segs[i](acc / weights[i]);
    acc -= weights[i];
  }
  return { x: 50, y: 4 };
};

const PARTICLES = 140;

/** 8–12s: the lights go out and a violet shield assembles from particles. */
export const Darkness: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, width, height, isSquare } = useLayout();

  const shieldH = (isSquare ? 360 : 400) * u;
  const scale = shieldH / 120;
  const cy = -60 * u;
  const outline = springAt(frame, fps, 52, 'soft');
  const lock = springAt(frame, fps, 66, 'bouncy');
  const dim = interpolate(frame, [0, 18], [0, 0.55], { extrapolateRight: 'clamp' });

  return (
    <Scene duration={timing.darkness}>
      {/* Lights down */}
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${dim})` }} />
      <AbsoluteFill>
        {Array.from({ length: PARTICLES }, (_, i) => {
          const target = shieldPoint(i / PARTICLES);
          const tx = (target.x - 50) * scale;
          const ty = (target.y - 60) * scale + cy;
          const sx = (rand(i * 3.1) - 0.5) * width * 1.1;
          const sy = (rand(i * 7.7) - 0.5) * height * 1.1;
          const p = springAt(frame, fps, 6 + rand(i * 1.3) * 34, 'slow');
          const x = interpolate(p, [0, 1], [sx, tx]);
          const y = interpolate(p, [0, 1], [sy, ty]);
          const size = (2 + rand(i * 5.5) * 3) * u;
          return (
            <At key={i} x={x} y={y}>
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  background: i % 5 === 0 ? colors.cyan : colors.violet,
                  boxShadow: `0 0 ${10 * u}px ${colors.violet}`,
                  opacity: interpolate(p, [0, 0.2, 1], [0, 0.9, 1 - outline * 0.6]),
                }}
              />
            </At>
          );
        })}

        {/* Solid shield + lock once the particles land */}
        <At y={cy} style={{ opacity: outline, filter: `drop-shadow(0 0 ${36 * u * outline}px ${colors.violet})` }}>
          <ShieldIcon size={shieldH / 1.2} color={colors.violet} strokeWidth={3.2} fill={`${colors.violet}1f`} />
        </At>
        <At y={cy - 6 * u} style={{ opacity: lock }} transform={`scale(${lock})`}>
          <LockIcon size={130 * u} color={colors.text} />
        </At>

        <Headline text={copy.darkness.headline} delay={70} y={isSquare ? 0.82 : 0.84} accentWord={{ index: 4, color: colors.violet }} />
      </AbsoluteFill>
    </Scene>
  );
};
