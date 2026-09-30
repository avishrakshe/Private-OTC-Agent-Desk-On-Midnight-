import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BrandMark } from '../../walkthrough/components/icons';
import { C, F, appear, pop } from '../../walkthrough/theme';
import { CUE } from '../beats';

const TITLE = 'Private OTC Agent Desk';

/** Act 4: the drop. Logo burst and the name. */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = CUE.drop;
  const logo = pop(frame, t0, 30, 11);
  const rays = appear(frame, t0, 40);
  const glow = appear(frame, t0, 3) * (1 - 0.6 * appear(frame, t0 + 3, 30));
  const exit = appear(frame, CUE.sealed - 5, 5);

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 + 0.25 * exit})`, filter: exit ? `blur(${14 * exit}px)` : undefined }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(194,247,58,${0.32 * glow}) 0%, rgba(155,138,255,${0.28 * glow}) 24%, transparent 58%)`,
        }}
      />
      {[0, 1, 2].map((i) => {
        const r = appear(frame, t0 + i * 5, 34);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 960 - 1000 * r,
              top: 400 - 1000 * r,
              width: 2000 * r,
              height: 2000 * r,
              borderRadius: '50%',
              border: `${3 - i}px solid ${[C.lime, C.violet, C.cyan][i]}`,
              opacity: (1 - r) * 0.7,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ opacity: 0.45 * rays, transform: `rotate(${(frame - t0) * 0.25}deg)`, transformOrigin: '50% 37%' }}>
        <div
          style={{
            position: 'absolute',
            left: 960 - 1200,
            top: 400 - 1200,
            width: 2400,
            height: 2400,
            background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(194,247,58,0.08) 0deg 4deg, transparent 4deg 16deg)',
            maskImage: 'radial-gradient(circle, black 0%, transparent 55%)',
            WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 55%)',
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 960 - 110,
          top: 200,
          transform: `scale(${0.2 + 0.8 * logo}) rotate(${(1 - logo) * -60}deg)`,
          opacity: appear(frame, t0, 3),
        }}
      >
        <BrandMark size={220} glow={34 + 10 * Math.sin(frame / 6)} />
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center' }}>
        {TITLE.split('').map((ch, i) => {
          const t = appear(frame, t0 + 3 + i * 0.7, 14);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                fontFamily: F.display,
                fontWeight: 800,
                fontSize: 138,
                letterSpacing: '-0.045em',
                color: C.text,
                opacity: t,
                transform: `translateY(${(1 - t) * 60}px) scale(${0.7 + 0.3 * t})`,
                filter: t < 1 ? `blur(${(1 - t) * 14}px)` : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 680,
          textAlign: 'center',
          fontFamily: F.mono,
          fontSize: 34,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: C.text2,
          opacity: appear(frame, CUE.subtitle - 3, 10),
          transform: `translateY(${(1 - appear(frame, CUE.subtitle - 3, 14)) * 20}px)`,
        }}
      >
        Sealed-RFQ trading desk · built on <span style={{ color: C.lime }}>Midnight</span>
      </div>
    </AbsoluteFill>
  );
};
