import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { IconBot } from '../../walkthrough/components/icons';
import { Chip, Typed } from '../../walkthrough/components/ui';
import { C, F, appear, pop } from '../../walkthrough/theme';
import { CUE } from '../beats';
import { Slam } from '../fx';

const CX = 960;
const CY = 540;

const TAGS = [
  { at: CUE.size, label: 'SIZE', value: '600,000 DAO', x: -560, y: -230 },
  { at: CUE.price, label: 'LIMIT', value: '$0.842', x: 560, y: -210 },
  { at: CUE.wallet, label: 'WALLET', value: '0x9f3a…c21e', x: 0, y: 270 },
];

/** Act 1: a big order goes out, its size, price and wallet leak, bots close in. */
export const Leak: React.FC = () => {
  const frame = useCurrentFrame();
  const card = pop(frame, 0, 30, 14);
  const live = appear(frame, CUE.size - 2, 8);
  const bots = appear(frame, CUE.bots - 4, 16);
  const push = interpolate(frame, [0, CUE.announced], [1, 1.14]);
  // the order gets squeezed from both sides on "front-run" / "sandwiched"
  const squeeze = appear(frame, CUE.frontRun, 6) * 0.5 + appear(frame, CUE.sandwich, 6) * 0.5;
  const dim = appear(frame, CUE.frontRun - 1, 4);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, opacity: 1 - 0.62 * dim, filter: dim ? `blur(${6 * dim}px)` : undefined }}>
        {/* broadcast rings */}
        {[0, 1, 2].map((i) => {
          const period = 30;
          const local = frame - CUE.size - i * 10;
          if (local < 0) return null;
          const r = (local % period) / period;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: CX - 760 * r,
                top: CY - 760 * r,
                width: 1520 * r,
                height: 1520 * r,
                borderRadius: '50%',
                border: `2px solid ${C.coral}`,
                opacity: (1 - r) * 0.55,
              }}
            />
          );
        })}

        {/* bots closing in (behind the fields, so those stay readable) */}
        {new Array(12).fill(0).map((_, i) => {
          const ang = (i / 12) * Math.PI * 2 + frame * 0.012;
          const r = interpolate(bots, [0, 1], [1000, 470]) + Math.sin(frame / 6 + i) * 14 - 60 * squeeze;
          const x = CX + Math.cos(ang) * r * 1.55;
          const y = CY + Math.sin(ang) * r * 0.62;
          const eye = 0.6 + 0.4 * Math.sin(frame / 3 + i * 2);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x - 46,
                top: y - 46,
                width: 92,
                height: 92,
                borderRadius: 26,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(40,12,18,0.92)',
                border: `2px solid rgba(255,107,129,${0.4 + 0.4 * eye})`,
                boxShadow: `0 0 ${44 * eye}px rgba(255,107,129,0.5)`,
                opacity: bots,
                color: C.coral,
              }}
            >
              <IconBot size={48} stroke={1.9} />
            </div>
          );
        })}

        {/* connectors to the leaked fields */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {TAGS.map((t) => {
            const p = appear(frame, t.at, 8);
            return (
              <line
                key={t.label}
                x1={CX}
                y1={CY}
                x2={CX + t.x * p}
                y2={CY + t.y * p}
                stroke={C.coral}
                strokeWidth={2.5}
                strokeDasharray="6 8"
                strokeDashoffset={-frame * 2}
                opacity={0.75 * p}
              />
            );
          })}
        </svg>

        {/* the order */}
        <div
          style={{
            position: 'absolute',
            left: CX - 300,
            top: CY - 125,
            width: 600,
            height: 250,
            borderRadius: 30,
            background: 'linear-gradient(180deg, rgba(30,30,35,0.97), rgba(15,15,18,0.97))',
            border: `2px solid rgba(255,107,129,${0.18 + 0.6 * live})`,
            boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 ${130 * live}px rgba(255,107,129,${0.4 * live})`,
            transform: `scale(${(0.55 + 0.45 * card) * (1 - 0.08 * squeeze)}, ${0.55 + 0.45 * card})`,
            opacity: appear(frame, 0, 6),
            padding: '32px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: F.mono, fontSize: 22, color: C.text3, letterSpacing: '0.14em' }}>ORDER #4471</span>
            <Chip tone={live > 0.5 ? 'coral' : 'neutral'} dot size={20}>
              {live > 0.5 ? 'BROADCAST' : 'SIGNING'}
            </Chip>
          </div>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 76, letterSpacing: '-0.03em', color: C.text, whiteSpace: 'nowrap' }}>
            <Typed text="SELL 600k DAO" start={CUE.type} cps={40} style={{ fontFamily: F.display }} />
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 22, color: live > 0.5 ? C.coral : C.text2 }}>
            <Typed text="→ public mempool" start={CUE.size - 6} cps={60} caret={false} />
          </div>
        </div>

        {/* the fields everyone can read */}
        {TAGS.map((t) => {
          const p = pop(frame, t.at, 30, 11);
          return (
            <div
              key={t.label}
              style={{
                position: 'absolute',
                left: CX + t.x - 185,
                top: CY + t.y - 58,
                width: 370,
                opacity: appear(frame, t.at, 4),
                transform: `scale(${0.4 + 0.6 * p})`,
                padding: '20px 26px',
                borderRadius: 20,
                background: 'linear-gradient(180deg, rgba(56,20,28,0.96), rgba(36,13,19,0.96))',
                border: `2px solid rgba(255,107,129,0.55)`,
                boxShadow: '0 0 60px rgba(255,107,129,0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.coral }}>{t.label} · VISIBLE</div>
              <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 40, color: C.text, marginTop: 6 }}>{t.value}</div>
            </div>
          );
        })}

      </AbsoluteFill>

      {/* what the bots do to it */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {frame < CUE.sandwich ? (
          <Slam text="FRONT-RUN." at={CUE.frontRun} color={C.coral} ghost={C.amber} />
        ) : (
          <Slam text="SANDWICHED." at={CUE.sandwich} color={C.coral} ghost={C.amber} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
