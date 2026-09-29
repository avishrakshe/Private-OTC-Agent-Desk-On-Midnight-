import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { IconAgent, IconBlock, IconBot, IconBrain, IconEye, IconLock, IconShield } from '../components/icons';
import { Chip, Enter, Glass, Kinetic, Node, PopIn } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F, appear, easeInOut, pop } from '../theme';

const cue = cueOf('problem');

const NODES = [
  { x: 300, label: 'Your order', icon: <IconAgent size={50} />, tone: 'neutral' as const },
  { x: 760, label: 'Public mempool', icon: <IconEye size={50} />, tone: 'coral' as const },
  { x: 1200, label: 'MEV bots', icon: <IconBot size={50} />, tone: 'coral' as const },
  { x: 1640, label: 'Block', icon: <IconBlock size={50} />, tone: 'neutral' as const },
];
const LANE_Y = 300;

const Packet: React.FC<{ text: string; x: number; tone: 'coral' | 'neutral'; o: number }> = ({ text, x, tone, o }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: LANE_Y - 30,
      transform: 'translateX(-50%)',
      opacity: o,
      padding: '10px 18px',
      borderRadius: 12,
      fontFamily: F.mono,
      fontWeight: 600,
      fontSize: 22,
      whiteSpace: 'nowrap',
      color: tone === 'coral' ? '#1a0006' : C.text,
      background: tone === 'coral' ? C.coral : 'rgba(40,40,46,0.95)',
      border: `1.5px solid ${tone === 'coral' ? C.coral : 'rgba(255,107,129,0.8)'}`,
      boxShadow: `0 0 40px ${tone === 'coral' ? 'rgba(255,107,129,0.55)' : 'rgba(255,107,129,0.3)'}`,
    }}
  >
    {text}
  </div>
);

const move = (frame: number, start: number, dur: number, a: number, b: number) =>
  interpolate(frame, [start, start + dur], [a, b], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const tAhead = cue('ahead');
  const tSandwich = cue('sandwich');
  const tSpread = cue('spread');
  const tFor = cue('for');
  const tDao = cue('dao');
  const tAgent = cue('agent');
  const tBefore = cue('before');
  const tClosed = cue('closed');

  const phaseA = 1 - appear(frame, tFor - 10, 18);
  const orderX =
    frame < tSandwich ? move(frame, 12, 30, NODES[0].x, NODES[1].x) : move(frame, tSandwich, 22, NODES[1].x, NODES[3].x);
  const frontX = move(frame, tAhead, 22, NODES[2].x, NODES[3].x);
  const backX = move(frame, tSandwich + 8, 22, NODES[2].x, NODES[3].x);
  const inBlock = (t: number) => appear(frame, t, 10);

  // price path: pump before your fill, dump after
  const chartT = appear(frame, tSandwich - 6, 40);
  // SVG y grows downward: the price is pushed down into your sell, then recovers
  const pts = [50, 52, 50, 54, 72, 92, 100, 84, 62, 52, 50];
  const path = pts.map((y, i) => `${i ? 'L' : 'M'}${i * 56},${y * 1.4}`).join(' ');

  // phase B
  const closed = appear(frame, tClosed, 10);
  const leakColor = interpolateColors(closed, [0, 1], [C.coral, C.lime]);
  const stations = [
    { x: 420, label: 'Intent' },
    { x: 960, label: 'Mempool' },
    { x: 1500, label: 'Execution' },
  ];
  const trackT = appear(frame, tFor - 2, 26);

  return (
    <AbsoluteFill>
      {/* ── phase A: the attack ── */}
      <AbsoluteFill style={{ opacity: phaseA, transform: `translateY(${(1 - phaseA) * -60}px)` }}>
        <Enter start={0} dy={-20}>
          <div style={{ position: 'absolute', left: 150, top: 150, display: 'flex', gap: 18, alignItems: 'center' }}>
            <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 40, color: C.text }}>Public DEX trade flow</span>
            <Chip tone="coral" dot size={20}>
              Visible to everyone
            </Chip>
          </div>
        </Enter>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <line x1={NODES[0].x} x2={NODES[3].x} y1={LANE_Y + 60} y2={LANE_Y + 60} stroke="rgba(255,255,255,0.18)" strokeWidth={2} strokeDasharray="8 10" />
        </svg>
        {NODES.map((n, i) => (
          <div key={n.label} style={{ position: 'absolute', left: n.x - 120, top: LANE_Y, opacity: appear(frame, i * 4, 14) }}>
            <Node icon={n.icon} label={n.label} tone={n.tone} active={i === 1 ? appear(frame, 40, 10) : i === 2 ? appear(frame, tAhead - 6, 10) : 0} />
          </div>
        ))}
        <Packet text="front-run" x={frontX} tone="coral" o={appear(frame, tAhead - 4, 6) * (1 - inBlock(tAhead + 22))} />
        <Packet text="back-run" x={backX} tone="coral" o={appear(frame, tSandwich + 4, 6) * (1 - inBlock(tSandwich + 30))} />
        <Packet text="SELL 600k @ 0.842" x={orderX} tone="neutral" o={appear(frame, 10, 8) * (1 - inBlock(tSandwich + 22))} />

        {/* the sandwich, stacked in the block */}
        <div style={{ position: 'absolute', left: NODES[3].x - 150, top: LANE_Y + 190, width: 300, display: 'grid', gap: 8 }}>
          {[
            { t: tAhead + 20, text: 'BOT  sell first', c: C.coral },
            { t: tSandwich + 20, text: 'YOU  sell 600k', c: C.text },
            { t: tSandwich + 28, text: 'BOT  buy back', c: C.coral },
          ].map((r) => (
            <PopIn key={r.text} start={r.t} from={0.8} y={-30}>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  fontFamily: F.mono,
                  fontSize: 22,
                  color: r.c,
                  background: r.c === C.coral ? 'rgba(255,107,129,0.12)' : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${r.c === C.coral ? 'rgba(255,107,129,0.5)' : C.line2}`,
                }}
              >
                {r.text}
              </div>
            </PopIn>
          ))}
        </div>

        {/* price chart */}
        <Enter start={tSandwich - 6} dy={30}>
          <Glass style={{ position: 'absolute', left: 150, top: 560, width: 820, height: 330, padding: '26px 32px' }} tone="coral" glow={0.4}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 18, color: C.text3, letterSpacing: '0.14em' }}>
              <span>DAO / USDC · 1 BLOCK</span>
              <span style={{ color: C.coral }}>PRICE IMPACT</span>
            </div>
            <svg width={760} height={200} viewBox="-10 20 580 153" style={{ marginTop: 16 }}>
              <line x1={0} x2={560} y1={112} y2={112} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 6" />
              <path
                d={path}
                fill="none"
                stroke={C.coral}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - chartT}
              />
              {chartT > 0.56 && <circle cx={6 * 56} cy={pts[6] * 1.4} r={7} fill={C.text} stroke={C.coral} strokeWidth={3} />}
            </svg>
            <div style={{ position: 'absolute', left: 32, bottom: 22, fontFamily: F.body, fontSize: 22, color: C.text2, opacity: appear(frame, tSpread - 6, 12) }}>
              Your fill: <span style={{ color: C.coral, fontWeight: 600 }}>−1.8%</span> · the bots keep the spread
            </div>
          </Glass>
        </Enter>
        <div style={{ position: 'absolute', left: 1040, top: 640, display: 'grid', gap: 18 }}>
          {['Order size leaked', 'Sandwiched', 'Worse fill'].map((t, i) => (
            <PopIn key={t} start={tSpread + i * 5} style={{ transformOrigin: 'left center' }}>
              <Chip tone="coral" size={28}>
                {t}
              </Chip>
            </PopIn>
          ))}
        </div>
      </AbsoluteFill>

      {/* ── phase B: where the leak is ── */}
      <AbsoluteFill style={{ opacity: appear(frame, tFor - 4, 16) }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', gap: 60 }}>
          {[
            { at: tDao, icon: <IconShield size={40} />, title: 'DAO treasury', sub: 'selling its treasury' },
            { at: tAgent, icon: <IconBrain size={40} />, title: 'AI agent', sub: 'trading on its own' },
          ].map((p) => (
            <PopIn key={p.title} start={p.at - 4}>
              <Glass style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '22px 32px' }} tone="violet" glow={0.3}>
                <span style={{ color: C.violet }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 34, color: C.text }}>{p.title}</div>
                  <div style={{ fontFamily: F.body, fontSize: 22, color: C.text2 }}>{p.sub}</div>
                </div>
              </Glass>
            </PopIn>
          ))}
        </div>

        {/* track */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <line x1={stations[0].x} x2={stations[0].x + (stations[2].x - stations[0].x) * trackT} y1={560} y2={560} stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
        </svg>
        {/* leak zone */}
        <div
          style={{
            position: 'absolute',
            left: stations[0].x + 60,
            width: stations[2].x - stations[0].x - 120,
            top: 500,
            height: 120,
            borderRadius: 60,
            background: `linear-gradient(90deg, transparent, ${closed ? 'rgba(194,247,58,0.14)' : 'rgba(255,107,129,0.16)'}, transparent)`,
            border: `2px dashed ${leakColor}`,
            opacity: appear(frame, tBefore - 8, 16) * (0.7 + 0.3 * Math.sin(frame / 6)),
          }}
        />
        {stations.map((s, i) => (
          <div key={s.label} style={{ position: 'absolute', left: s.x - 70, top: 490, width: 140, textAlign: 'center', opacity: appear(frame, tFor + i * 6, 12) }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 40,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(18,18,22,0.96)',
                border: `2px solid ${i === 1 ? leakColor : C.line2}`,
                boxShadow: i === 1 ? `0 0 60px ${closed ? 'rgba(194,247,58,0.45)' : 'rgba(255,107,129,0.4)'}` : undefined,
                marginTop: -40,
                color: i === 1 ? leakColor : C.text2,
                fontFamily: F.mono,
                fontSize: 22,
              }}
            >
              {i === 1 ? (
                <div style={{ transform: `scale(${closed ? 0.6 + 0.4 * pop(frame, tClosed, 30, 9) : 1})` }}>
                  {closed ? <IconLock size={64} stroke={2} /> : <IconEye size={60} stroke={2} />}
                </div>
              ) : (
                `0${i + 1}`
              )}
            </div>
            <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 28, color: C.text, marginTop: 18 }}>{s.label}</div>
          </div>
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center' }}>
          <PopIn start={tBefore - 4}>
            <Chip tone={closed ? 'lime' : 'coral'} size={28} dot>
              {closed ? 'Leak closed at the protocol layer' : 'The leak happens before execution'}
            </Chip>
          </PopIn>
        </div>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 830 }}>
          <Kinetic text="Close it *there*." start={tClosed - 2} size={60} accent={C.lime} />
        </AbsoluteFill>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
