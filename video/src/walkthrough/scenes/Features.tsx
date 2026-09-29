import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Browser, Shot, Spot, use3DEntrance, type CamKey, type Rect } from '../components/Browser';
import { Eyebrow, Stamp } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F, appear, lerp } from '../theme';

const cue = cueOf('features');

const TILES: { rect: Rect; spot: Rect; title: string; sub: string; word: string }[] = [
  { rect: [170, 620, 930, 980], spot: [216, 667, 845, 660], title: 'Pre-trade privacy', sub: 'RFQs, quotes and fills are commitments', word: 'pre-trade' },
  { rect: [1060, 620, 930, 980], spot: [1097, 667, 847, 660], title: 'ZK agent mandates', sub: 'every order proves it’s inside policy', word: 'zero-knowledge' },
  { rect: [170, 1610, 930, 980], spot: [216, 1655, 845, 660], title: 'Proof of funds + escrow', sub: 'funds lock at quote time', word: 'proof' },
  { rect: [1060, 1610, 930, 980], spot: [1097, 1655, 847, 660], title: 'Oracle price band', sub: 'every price within ±3% of TWAP', word: 'oracle' },
];

export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const tEvery = cue('every');
  const tBreak = cue('break');
  const tNo = cue('no');
  const tTx = cue('transaction');
  const tileAt = TILES.map((t) => cue(t.word));
  const active = tileAt.reduce((a, at, i) => (frame >= at - 4 ? i : a), -1);

  const enter = use3DEntrance(0);
  const m = appear(frame, tEvery - 4, 30);
  // browser layout: centred hero → right-hand tour window
  const bw = lerp(1320, 1130, m);
  const bh = lerp(825, 720, m);
  const bx = lerp((1920 - 1320) / 2, 700, m);
  const by = lerp(100, 140, m);

  const keys: CamKey[] = [
    { at: 0, rect: [0, 0, 2160, 1350] },
    { at: 30, rect: [240, 120, 1680, 1050], dur: 120 },
    { at: tEvery - 4, rect: [300, 40, 1560, 640], dur: 30 },
    ...TILES.map((t, i) => ({ at: tileAt[i] - 6, rect: t.rect, dur: 24 })),
    { at: tBreak - 4, rect: [120, 560, 1920, 2040] as Rect, dur: 26 },
  ];

  return (
    <AbsoluteFill>
      {/* guarantee list */}
      <div style={{ position: 'absolute', left: 110, top: 190, width: 540, opacity: m }}>
        <Eyebrow color={C.lime}>Protocol guarantees</Eyebrow>
        <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.03em', color: C.text, marginTop: 14 }}>
          Every trade is proven against the rules.
        </div>
        <div style={{ display: 'grid', gap: 14, marginTop: 34 }}>
          {TILES.map((t, i) => {
            const on = active === i;
            const seen = appear(frame, tileAt[i] - 8, 14);
            return (
              <div
                key={t.title}
                style={{
                  display: 'flex',
                  gap: 18,
                  alignItems: 'flex-start',
                  padding: '16px 18px',
                  borderRadius: 18,
                  background: on ? 'rgba(194,247,58,0.08)' : 'transparent',
                  border: `1.5px solid ${on ? 'rgba(194,247,58,0.4)' : 'transparent'}`,
                  opacity: 0.35 + 0.65 * seen * (on || frame >= tBreak ? 1 : 0.55),
                  transform: `translateX(${(1 - seen) * -20}px)`,
                }}
              >
                <span style={{ fontFamily: F.mono, fontSize: 22, color: on ? C.lime : C.text3, marginTop: 4 }}>0{i + 1}</span>
                <div>
                  <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 30, color: C.text }}>{t.title}</div>
                  <div style={{ fontFamily: F.body, fontSize: 21, color: C.text2, marginTop: 4 }}>{t.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* browser */}
      <div style={{ position: 'absolute', left: bx, top: by, perspective: 1800 }}>
        <div style={{ ...enter, transformOrigin: '50% 100%' }}>
          <Browser url={frame < tEvery ? 'mn-demo.vercel.app' : 'mn-demo.vercel.app/#features'} width={bw} height={bh} glow="violet">
            <Shot
              width={bw}
              height={bh}
              keys={keys}
              layers={[
                { src: 'hero.png', w: 2160, h: 1350 },
                { src: 'features.png', w: 2160, h: 2666, from: tEvery - 2 },
              ]}
              overlay={(s) => (
                <>
                  {TILES.map((t, i) => (
                    <Spot key={t.title} rect={t.spot} at={tileAt[i] + 8} until={i < 3 ? tileAt[i + 1] - 6 : tBreak - 4} s={s} tone="lime" dim={0.35} />
                  ))}
                </>
              )}
            />
          </Browser>
        </div>
      </div>

      {/* break a rule */}
      <AbsoluteFill style={{ background: `rgba(10,3,6,${0.55 * appear(frame, tBreak, 12)})` }} />
      <div style={{ position: 'absolute', left: 700, width: 1130, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        <Stamp start={tNo - 2} rotate={-5} size={62}>
          No proof
        </Stamp>
        <Stamp start={tTx - 2} rotate={3} size={62}>
          No transaction
        </Stamp>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 700,
          width: 1130,
          top: 210,
          textAlign: 'center',
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: 50,
          color: C.text,
          opacity: appear(frame, tBreak, 12),
          letterSpacing: '-0.02em',
        }}
      >
        Break any rule →
      </div>

    </AbsoluteFill>
  );
};
