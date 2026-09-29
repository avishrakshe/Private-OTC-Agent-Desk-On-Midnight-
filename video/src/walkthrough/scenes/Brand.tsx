import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BrandMark, IconBrain, IconScale, IconShield } from '../components/icons';
import { Chip, Kinetic, PopIn } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F, appear, pop } from '../theme';

const cue = cueOf('brand');
const TITLE = 'Private OTC Agent Desk';

export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const tMeet = cue('meet');
  const tSealed = cue('sealed');
  const tDao = cue('dao');
  const tMarket = cue('market');
  const tAi = cue('ai');
  const tNobody = cue('nobody');

  const flash = appear(frame, tMeet - 2, 6) * (1 - appear(frame, tMeet + 4, 30));
  const logo = pop(frame, tMeet - 2, 30, 12);
  const m = appear(frame, tNobody - 8, 26);
  const rays = appear(frame, tMeet, 60);

  return (
    <AbsoluteFill>
      {/* burst */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 36%, rgba(194,247,58,${0.35 * flash}) 0%, rgba(155,138,255,${0.25 * flash}) 22%, transparent 55%)`,
        }}
      />
      {[0, 1].map((i) => {
        const r = appear(frame, tMeet + i * 8, 50);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 960 - 900 * r,
              top: 390 - 900 * r,
              width: 1800 * r,
              height: 1800 * r,
              borderRadius: '50%',
              border: `2px solid ${i ? C.violet : C.lime}`,
              opacity: (1 - r) * 0.6 * (frame >= tMeet ? 1 : 0),
            }}
          />
        );
      })}
      {/* light rays */}
      <AbsoluteFill style={{ opacity: 0.35 * rays * (1 - m * 0.6), transform: `rotate(${frame * 0.08}deg)`, transformOrigin: '50% 36%' }}>
        <div
          style={{
            position: 'absolute',
            left: 960 - 1100,
            top: 390 - 1100,
            width: 2200,
            height: 2200,
            background: `repeating-conic-gradient(from 0deg at 50% 50%, rgba(194,247,58,0.07) 0deg 4deg, transparent 4deg 18deg)`,
            maskImage: 'radial-gradient(circle, black 0%, transparent 55%)',
            WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 55%)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ transform: `translateY(${-205 * m}px) scale(${1 - 0.3 * m})`, transformOrigin: '50% 30%' }}>
        {/* logo */}
        <div
          style={{
            position: 'absolute',
            left: 960 - 95,
            top: 250,
            transform: `scale(${0.3 + 0.7 * logo}) rotate(${(1 - logo) * -40}deg)`,
            opacity: appear(frame, tMeet - 2, 8),
          }}
        >
          <BrandMark size={190} glow={30 + 10 * Math.sin(frame / 10)} />
        </div>
        {/* wordmark */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center' }}>
          {TITLE.split('').map((ch, i) => {
            const t = appear(frame, tMeet + 6 + i * 1.2, 20);
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 116,
                  letterSpacing: '-0.04em',
                  color: C.text,
                  opacity: t,
                  transform: `translateY(${(1 - t) * 40}px) scale(${0.8 + 0.2 * t})`,
                  filter: t < 1 ? `blur(${(1 - t) * 12}px)` : undefined,
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
            top: 640,
            textAlign: 'center',
            fontFamily: F.mono,
            fontSize: 28,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: C.text2,
            opacity: appear(frame, tSealed - 4, 16) * (1 - m),
          }}
        >
          Sealed-RFQ desk · built on <span style={{ color: C.lime }}>Midnight</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 730, display: 'flex', justifyContent: 'center', gap: 22, opacity: 1 - m }}>
          {[
            { at: tDao, label: 'DAO treasuries', icon: <IconShield size={26} />, tone: 'violet' as const },
            { at: tMarket, label: 'Market makers', icon: <IconScale size={26} />, tone: 'cyan' as const },
            { at: tAi, label: 'AI agents', icon: <IconBrain size={26} />, tone: 'lime' as const },
          ].map((c) => (
            <PopIn key={c.label} start={c.at - 3}>
              <Chip tone={c.tone} size={28}>
                {c.icon}
                {c.label}
              </Chip>
            </PopIn>
          ))}
        </div>
      </AbsoluteFill>

      {/* tagline */}
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 560 }}>
        <Kinetic
          text={'Nobody sees the order\n*until* *it’s* *filled.*'}
          start={tNobody - 2}
          size={112}
          stagger={4}
          accent={`linear-gradient(90deg, ${C.lime}, ${C.violet})`}
        />
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
