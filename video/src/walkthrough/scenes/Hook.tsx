import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { IconBot } from '../components/icons';
import { Chip, Kinetic, Typed } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F, appear, pop } from '../theme';

const cue = cueOf('hook');

const CX = 960;
const CY = 560;

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const tAnnounce = cue('announced');
  const tSize = cue('size');
  const tPrice = cue('price');
  const tWallet = cue('wallet');
  const tBots = cue('bots');

  const card = pop(frame, 8, 30, 14);
  const broadcast = appear(frame, tAnnounce, 20);
  const push = interpolate(frame, [0, 400], [1, 1.12]);
  const bots = appear(frame, tBots - 6, 24);

  const tags = [
    { at: tSize, label: 'SIZE', value: '600,000 DAO', x: -560, y: -170 },
    { at: tPrice, label: 'LIMIT', value: '$0.842', x: 540, y: -150 },
    { at: tWallet, label: 'WALLET', value: '0x9f3a…c21e', x: 20, y: 250 },
  ];

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* radar rings */}
        {[0, 1, 2, 3].map((i) => {
          const period = 60;
          const local = frame - tAnnounce - i * (period / 4);
          if (local < 0) return null;
          const r = (local % period) / period;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: CX - 700 * r,
                top: CY - 700 * r,
                width: 1400 * r,
                height: 1400 * r,
                borderRadius: '50%',
                border: `2px solid ${C.coral}`,
                opacity: (1 - r) * 0.5 * broadcast,
              }}
            />
          );
        })}

        {/* connectors */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {tags.map((t) => {
            const p = appear(frame, t.at, 14);
            return (
              <line
                key={t.label}
                x1={CX}
                y1={CY}
                x2={CX + t.x * p}
                y2={CY + t.y * p}
                stroke={C.coral}
                strokeWidth={2}
                strokeDasharray="6 8"
                strokeDashoffset={-frame * 1.5}
                opacity={0.7 * p}
              />
            );
          })}
        </svg>

        {/* the order */}
        <div
          style={{
            position: 'absolute',
            left: CX - 260,
            top: CY - 110,
            width: 520,
            height: 220,
            borderRadius: 28,
            background: 'linear-gradient(180deg, rgba(30,30,35,0.95), rgba(15,15,18,0.95))',
            border: `2px solid ${broadcast > 0 ? `rgba(255,107,129,${0.25 + 0.5 * broadcast})` : C.line2}`,
            boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 ${120 * broadcast}px rgba(255,107,129,${0.35 * broadcast})`,
            transform: `scale(${0.6 + 0.4 * card})`,
            opacity: appear(frame, 8, 10),
            padding: '30px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: F.mono, fontSize: 20, color: C.text3, letterSpacing: '0.14em' }}>ORDER #4471</span>
            <Chip tone={broadcast > 0.5 ? 'coral' : 'neutral'} dot size={18}>
              {broadcast > 0.5 ? 'BROADCAST' : 'PENDING'}
            </Chip>
          </div>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 64, letterSpacing: '-0.03em', color: C.text }}>
            SELL <span style={{ color: broadcast > 0.5 ? C.coral : C.text }}>600k</span> DAO
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.text2 }}>
            <Typed text="→ public mempool" start={tAnnounce} cps={36} />
          </div>
        </div>

        {/* leaked fields */}
        {tags.map((t) => {
          const p = pop(frame, t.at, 30, 12);
          return (
            <div
              key={t.label}
              style={{
                position: 'absolute',
                left: CX + t.x - 170,
                top: CY + t.y - 50,
                width: 340,
                opacity: appear(frame, t.at, 8),
                transform: `scale(${0.5 + 0.5 * p})`,
                padding: '18px 24px',
                borderRadius: 18,
                background: 'rgba(255,107,129,0.1)',
                border: `2px solid rgba(255,107,129,0.5)`,
                boxShadow: '0 0 50px rgba(255,107,129,0.25)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: '0.2em', color: C.coral }}>{t.label} · VISIBLE</div>
              <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 34, color: C.text, marginTop: 6 }}>{t.value}</div>
            </div>
          );
        })}

        {/* bots closing in */}
        {new Array(10).fill(0).map((_, i) => {
          const ang = (i / 10) * Math.PI * 2 + frame * 0.004;
          const r = interpolate(bots, [0, 1], [900, 520]) + Math.sin(frame / 12 + i) * 12;
          const x = CX + Math.cos(ang) * r * 1.5;
          const y = CY + Math.sin(ang) * r * 0.5;
          const eye = 0.6 + 0.4 * Math.sin(frame / 5 + i * 2);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x - 42,
                top: y - 42,
                width: 84,
                height: 84,
                borderRadius: 24,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(40,12,18,0.9)',
                border: `2px solid rgba(255,107,129,${0.4 + 0.4 * eye})`,
                boxShadow: `0 0 ${40 * eye}px rgba(255,107,129,0.45)`,
                opacity: bots,
                color: C.coral,
              }}
            >
              <IconBot size={44} stroke={1.9} />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* headline */}
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 110 }}>
        <Kinetic text={'Every big order is *announced*\nbefore it fills.'} start={tAnnounce - 22} size={76} accent={C.coral} exit={tBots - 10} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 130 }}>
        <Kinetic text={'And *bots* are watching.'} start={tBots - 4} size={92} accent={C.coral} />
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
