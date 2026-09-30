import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BrandMark } from '../../walkthrough/components/icons';
import { Kinetic } from '../../walkthrough/components/ui';
import { C, F, appear, pop } from '../../walkthrough/theme';
import { CUE } from '../beats';

/** Act 6: the title card the slides pick up from. Settles by ~15 s and holds; the last frame is the poster. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = CUE.end;
  const logo = pop(frame, t0, 30, 13);
  const name = appear(frame, t0 + 2, 16);
  const foot = appear(frame, CUE.tagline + 8, 14);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(155,138,255,${0.18 * logo}) 0%, rgba(194,247,58,${0.07 * logo}) 30%, transparent 60%)`,
        }}
      />
      {[0, 1].map((i) => {
        const r = appear(frame, t0 + i * 6, 40);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 960 - 900 * r,
              top: 330 - 900 * r,
              width: 1800 * r,
              height: 1800 * r,
              borderRadius: '50%',
              border: `2px solid ${i ? C.violet : C.lime}`,
              opacity: (1 - r) * 0.5,
            }}
          />
        );
      })}

      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <div style={{ transform: `scale(${0.4 + 0.6 * logo})`, opacity: appear(frame, t0, 4) }}>
          <BrandMark size={170} glow={28 + 8 * Math.sin(frame / 10)} />
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 124,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            color: C.text,
            opacity: name,
            transform: `translateY(${(1 - name) * 30}px)`,
            filter: name < 1 ? `blur(${(1 - name) * 10}px)` : undefined,
          }}
        >
          Private OTC Agent Desk
        </div>
      </div>

      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 560 }}>
        <Kinetic
          text={'Nobody sees the order *until* *it’s* *filled.*'}
          start={CUE.tagline}
          size={68}
          stagger={2}
          weight={600}
          accent={`linear-gradient(90deg, ${C.lime}, ${C.violet})`}
        />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 740,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 30,
          fontFamily: F.mono,
          fontSize: 28,
          letterSpacing: '0.06em',
          color: C.text2,
          opacity: foot,
          transform: `translateY(${(1 - foot) * 16}px)`,
        }}
      >
        <span>
          Built on <span style={{ color: C.lime }}>Midnight</span>
        </span>
        <span style={{ color: C.text3 }}>·</span>
        <span style={{ color: C.text }}>mn-demo.vercel.app</span>
      </div>
    </AbsoluteFill>
  );
};
