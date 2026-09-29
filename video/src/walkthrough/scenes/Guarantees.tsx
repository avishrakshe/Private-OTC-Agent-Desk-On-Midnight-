import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { IconBrain, IconFingerprint, IconKey, IconReceipt, IconScale, IconShield, IconTrend } from '../components/icons';
import { Counter, Eyebrow, Glass, PopIn, toneColor, type Tone } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F, appear } from '../theme';

const cue = cueOf('guarantees');

const SIX: { title: string; body: string; icon: React.ReactNode; tone: Tone }[] = [
  { title: 'Sealed RFQ match', body: 'taker proves quote ≥ its private floor', icon: <IconScale size={30} />, tone: 'violet' },
  { title: 'ZK agent mandates', body: 'every order proves it’s inside policy', icon: <IconFingerprint size={30} />, tone: 'lime' },
  { title: 'Proof of funds + escrow', body: 'balance ≥ price × size, locked', icon: <IconShield size={30} />, tone: 'cyan' },
  { title: 'Oracle price band', body: 'within ±3% of the public TWAP', icon: <IconTrend size={30} />, tone: 'amber' },
  { title: 'Selective disclosure', body: 'auditors see trades, not strategies', icon: <IconKey size={30} />, tone: 'violet' },
  { title: 'Reputation from history', body: 'fill rate counted by the contract', icon: <IconReceipt size={30} />, tone: 'lime' },
];

const WHO: { title: string; body: string; icon: React.ReactNode; word: string; tone: Tone }[] = [
  { title: 'DAO treasuries', body: 'Diversify in blocks without crashing the price.', icon: <IconShield size={34} />, word: 'dao', tone: 'violet' },
  { title: 'Token unlocks', body: 'Sell vested tokens to known makers.', icon: <IconTrend size={34} />, word: 'unlocks', tone: 'amber' },
  { title: 'Market makers', body: 'Quote without exposing inventory.', icon: <IconScale size={34} />, word: 'market', tone: 'cyan' },
  { title: 'AI treasury agents', body: 'Trade under a mandate they can’t break.', icon: <IconBrain size={34} />, word: 'ai', tone: 'lime' },
];

/** One continuous build: the numbers, then the six guarantees, then who it's for. */
export const Guarantees: React.FC = () => {
  const frame = useCurrentFrame();
  const tOne = cue('one');
  const tTwelve = cue('twelve');
  const tSix = cue('six');
  const tBuilt = cue('built');
  // the grid dims a little once the audience takes focus
  const focusWho = appear(frame, tBuilt - 6, 18);

  const nums = [
    { at: tOne - 4, n: 1, label: 'Compact contract' },
    { at: tTwelve - 4, n: 12, label: 'circuits' },
    { at: tSix - 4, n: 6, label: 'guarantees' },
  ];

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 108, display: 'flex', justifyContent: 'center', gap: 110 }}>
        {nums.map((x) => (
          <PopIn key={x.label} start={x.at}>
            <div style={{ textAlign: 'center', minWidth: 260 }}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 118, lineHeight: 1, letterSpacing: '-0.05em', color: C.text }}>
                <Counter value={x.n} start={x.at} dur={x.n > 1 ? 18 : 1} />
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 21, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.lime, marginTop: 6 }}>{x.label}</div>
            </div>
          </PopIn>
        ))}
      </div>

      {/* six guarantees */}
      <div
        style={{
          position: 'absolute',
          left: 150,
          right: 150,
          top: 318,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          opacity: 1 - 0.45 * focusWho,
        }}
      >
        {SIX.map((g, i) => (
          <PopIn key={g.title} start={tSix - 6 + i * 3} from={0.8}>
            <Glass style={{ padding: '16px 22px', display: 'flex', gap: 16, alignItems: 'center', height: 100, borderRadius: 20 }} tone={g.tone} glow={0.2}>
              <span style={{ color: toneColor(g.tone), flex: 'none' }}>{g.icon}</span>
              <div>
                <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 25, color: C.text }}>{g.title}</div>
                <div style={{ fontFamily: F.body, fontSize: 19, color: C.text2, marginTop: 2 }}>{g.body}</div>
              </div>
            </Glass>
          </PopIn>
        ))}
      </div>

      {/* who it's for */}
      <div style={{ position: 'absolute', left: 150, right: 150, top: 578 }}>
        <Eyebrow color={C.text2} style={{ textAlign: 'center', marginBottom: 18, opacity: appear(frame, tBuilt - 8, 14) }}>
          Built for every desk that moves size
        </Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {WHO.map((w) => (
            <PopIn key={w.title} start={cue(w.word) - 4} y={40}>
              <Glass style={{ padding: '24px 26px', height: 240 }} tone={w.tone} glow={0.35}>
                <span
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    display: 'grid',
                    placeItems: 'center',
                    color: toneColor(w.tone),
                    background: `${toneColor(w.tone)}1f`,
                  }}
                >
                  {w.icon}
                </span>
                <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 32, color: C.text, marginTop: 18, letterSpacing: '-0.02em' }}>{w.title}</div>
                <div style={{ fontFamily: F.body, fontSize: 20, color: C.text2, marginTop: 6, lineHeight: 1.35 }}>{w.body}</div>
              </Glass>
            </PopIn>
          ))}
        </div>
      </div>

    </AbsoluteFill>
  );
};
