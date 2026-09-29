import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Counter, Glass, PopIn } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F, appear, pop } from '../theme';

const cue = cueOf('result');

export const Result: React.FC = () => {
  const frame = useCurrentFrame();
  const tSold = cue('sold');
  const tMillion = cue('million');
  const tReceipts = cue('receipts');
  const tZero = cue('zero');
  const z = appear(frame, tZero - 6, 22);
  const zp = pop(frame, tZero - 2, 30, 10);

  const stats = [
    { at: tSold - 6, value: <Counter value={1800000} start={tSold - 6} dur={34} />, unit: 'DAO sold', note: 'in three sealed slices', tone: C.violet },
    {
      at: tMillion - 8,
      value: <Counter value={1.515} decimals={3} prefix="$" suffix="M" start={tMillion - 8} dur={30} />,
      unit: 'settled',
      note: 'VWAP $0.8417',
      tone: C.cyan,
    },
    { at: tReceipts - 8, value: <Counter value={3} start={tReceipts - 8} dur={16} suffix=" / 3" />, unit: 'receipts verified', note: 'by the auditor’s viewing key', tone: C.lime },
  ];

  return (
    <AbsoluteFill>
      {/* the real summary, as a backdrop */}
      <AbsoluteFill
        style={{
          opacity: 0.16 * (1 - z * 0.5),
          filter: 'blur(4px)',
          maskImage: 'radial-gradient(ellipse at 50% 55%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 55%, black 20%, transparent 70%)',
        }}
      >
        <Img
          src={staticFile('shots/agents-done.png')}
          style={{ position: 'absolute', width: 2400, left: -240, top: -2080 + frame * 0.4, transform: 'rotate(-4deg)' }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 250,
          display: 'flex',
          justifyContent: 'center',
          gap: 36,
          transform: `translateY(${-110 * z}px) scale(${1 - 0.18 * z})`,
        }}
      >
        {stats.map((s) => (
          <PopIn key={s.unit} start={s.at}>
            <Glass style={{ width: 500, padding: '34px 36px' }} tone="neutral">
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 76, letterSpacing: '-0.04em', color: C.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 30, color: s.tone, marginTop: 14 }}>{s.unit}</div>
              <div style={{ fontFamily: F.body, fontSize: 22, color: C.text2, marginTop: 6 }}>{s.note}</div>
            </Glass>
          </PopIn>
        ))}
      </div>

      {/* zero */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50, opacity: z }}>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 360,
            lineHeight: 0.9,
            color: C.lime,
            transform: `scale(${0.5 + 0.5 * zp})`,
            textShadow: `0 0 ${80 + 30 * Math.sin(frame / 8)}px rgba(194,247,58,0.55)`,
          }}
        >
          0
        </div>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 62, lineHeight: 1.05, letterSpacing: '-0.03em', color: C.text }}>
            prices or sizes ever reached the chain
          </div>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.text2, marginTop: 14 }}>Only commitments, keys and counters.</div>
        </div>
      </div>
      {[0, 1].map((i) => {
        const r = appear(frame, tZero + i * 6, 40);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 640 - 700 * r,
              top: 600 - 700 * r,
              width: 1400 * r,
              height: 1400 * r,
              borderRadius: '50%',
              border: `2px solid ${C.lime}`,
              opacity: frame >= tZero ? (1 - r) * 0.5 : 0,
            }}
          />
        );
      })}

    </AbsoluteFill>
  );
};
