import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Browser, Cursor, Shot, Spot, use3DEntrance } from '../components/Browser';
import { IconBlock, IconCheck, IconWallet } from '../components/icons';
import { Counter, Eyebrow, Glass } from '../components/ui';
import { liveTxStep } from '../audio-plan';
import { cueOf } from '../timeline';
import { C, F, appear, pop } from '../theme';

const cue = cueOf('live');
const CONNECT_BTN = { x: 597, y: 1043 };

const TXS = ['deploy', 'depositBase', 'depositQuote', 'proposeMandate', 'acceptMandate', 'proposeMandate', 'acceptMandate', 'openRfq', 'submitQuote', 'acceptQuote', 'claimFill'];

const Status: React.FC<{ start: number; done: number; icon: React.ReactNode; title: string; sub: string }> = ({ start, done, icon, title, sub }) => {
  const frame = useCurrentFrame();
  const o = appear(frame, start, 12);
  const ok = frame >= done;
  const p = pop(frame, done, 30, 10);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: 0.3 + 0.7 * o, transform: `translateX(${(1 - o) * 20}px)` }}>
      <span
        style={{
          width: 56,
          height: 56,
          flex: 'none',
          borderRadius: 16,
          display: 'grid',
          placeItems: 'center',
          color: ok ? C.lime : C.text2,
          background: ok ? 'rgba(194,247,58,0.14)' : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${ok ? 'rgba(194,247,58,0.5)' : C.line2}`,
        }}
      >
        {ok ? (
          <span style={{ transform: `scale(${p})`, display: 'inline-flex' }}>
            <IconCheck size={30} stroke={2.6} />
          </span>
        ) : o > 0.5 ? (
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: `3px solid rgba(255,255,255,0.15)`,
              borderTopColor: C.lime,
              transform: `rotate(${frame * 14}deg)`,
            }}
          />
        ) : (
          icon
        )}
      </span>
      <div>
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 27, color: C.text }}>{title}</div>
        <div style={{ fontFamily: F.mono, fontSize: 18, color: ok ? C.lime : C.text3, marginTop: 2 }}>{ok ? sub : 'working…'}</div>
      </div>
    </div>
  );
};

export const Live: React.FC = () => {
  const frame = useCurrentFrame();
  const tLive = cue('live');
  const tConnect = cue('connect');
  const tGenerate = cue('generate');
  const tSettle = cue('settle');
  const tSwitch = cue('switch');
  const tDeploy = cue('deploy');
  const tEleven = cue('eleven');
  const click = tConnect + 12;
  const toggle = tSwitch + 8;

  const enter = use3DEntrance(0);
  const W = 1120;
  const H = 720;
  const cardA = 1 - appear(frame, tSwitch - 8, 14);
  const cardB = appear(frame, tSwitch - 4, 16);
  const sel = appear(frame, toggle, 12);
  const txStep = liveTxStep; // shared with the audio plan, so each tick lands on its blip

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 100, top: 140, perspective: 1800 }}>
        <div style={{ ...enter, transformOrigin: '50% 100%' }}>
          <Browser url="mn-demo.vercel.app/#desk" width={W} height={H} glow="lime">
            <Shot
              width={W}
              height={H}
              layers={[{ src: 'live.png', w: 2160, h: 2427 }]}
              keys={[
                { at: 0, rect: [120, 40, 1920, 1234] },
                { at: tConnect - 8, rect: [170, 540, 1180, 760], dur: 24 },
                { at: tGenerate - 8, rect: [960, 470, 1040, 670], dur: 24 },
                { at: tSettle - 6, rect: [190, 1320, 1780, 1145], dur: 28 },
              ]}
              overlay={(s) => (
                <>
                  <Spot rect={[260, 1007, 674, 73]} at={tConnect} until={tGenerate - 8} s={s} tone="lime" dim={0.3} radius={40} />
                  <Spot rect={[1014, 582, 929, 389]} at={tGenerate} until={tSettle - 6} s={s} tone="violet" dim={0.35} />
                  <Spot rect={[1272, 2088, 628, 134]} at={tSettle + 8} s={s} tone="lime" dim={0.35} />
                  <Cursor
                    s={s}
                    appearAt={tConnect - 6}
                    path={[
                      { at: tConnect - 6, x: 900, y: 1250 },
                      { at: click - 2, x: CONNECT_BTN.x, y: CONNECT_BTN.y },
                      { at: click + 30, x: 1100, y: 900 },
                    ]}
                    clicks={[click]}
                  />
                </>
              )}
            />
          </Browser>
        </div>
      </div>

      {/* right column: A — connect / prove / settle */}
      <div style={{ position: 'absolute', left: 1290, top: 170, width: 530, opacity: cardA * appear(frame, tLive - 4, 14) }}>
        <Glass style={{ padding: '30px 30px', display: 'grid', gap: 26 }} tone="lime" glow={0.3}>
          <Eyebrow color={C.lime}>Live on Midnight</Eyebrow>
          <Status start={tConnect - 4} done={click + 10} icon={<IconWallet size={28} />} title="Lace wallet connected" sub="DApp connector · authorized" />
          <Status start={tGenerate - 4} done={Math.min(tGenerate + 30, tSettle - 4)} icon={<span style={{ fontFamily: F.display, fontSize: 30 }}>π</span>} title="ZK proof generated" sub="client-side · nothing revealed" />
          <Status start={tSettle - 4} done={tSettle + 14} icon={<IconBlock size={28} />} title="Transaction settled" sub="confirmed on Midnight · fees in DUST" />
        </Glass>
      </div>

      {/* right column: B — agents on-chain */}
      <div style={{ position: 'absolute', left: 1290, top: 170, width: 530, opacity: cardB }}>
        <Glass style={{ padding: '30px 30px' }} tone="violet" glow={0.35}>
          <Eyebrow color={C.violet}>Agents · where they run</Eyebrow>
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              marginTop: 18,
              padding: 6,
              borderRadius: 16,
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${C.line2}`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 6,
                bottom: 6,
                left: `calc(6px + ${sel} * (50% - 6px))`,
                width: 'calc(50% - 6px)',
                borderRadius: 12,
                background: sel > 0.5 ? 'rgba(155,138,255,0.22)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${sel > 0.5 ? C.violet : C.line2}`,
              }}
            />
            {['Instant (local)', 'On Midnight (Lace)'].map((l, i) => (
              <div
                key={l}
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  padding: '14px 8px',
                  fontFamily: F.body,
                  fontWeight: 600,
                  fontSize: 21,
                  color: (i === 1) === sel > 0.5 ? C.text : C.text3,
                }}
              >
                {l}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: F.body, fontSize: 22, color: C.text2, marginTop: 20, opacity: appear(frame, tDeploy - 4, 10) }}>
            Deploys a fresh desk from your wallet, then runs a full RFQ round:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            {TXS.map((t, i) => {
              const at = txStep(i);
              const o = appear(frame, at, 8);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 10px',
                    borderRadius: 10,
                    fontFamily: F.mono,
                    fontSize: 17,
                    color: C.text,
                    background: 'rgba(194,247,58,0.06)',
                    border: '1px solid rgba(194,247,58,0.22)',
                    opacity: o,
                    transform: `scale(${0.85 + 0.15 * o})`,
                  }}
                >
                  <IconCheck size={16} color={C.lime} stroke={2.8} />
                  {t}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 20, opacity: appear(frame, tEleven - 6, 10) }}>
            <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 64, color: C.lime, lineHeight: 1 }}>
              <Counter value={11} start={tEleven - 6} dur={14} />
            </span>
            <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.text }}>proven transactions</span>
          </div>
        </Glass>
      </div>
      {/* pointer flicking the toggle */}
      {frame >= toggle - 18 && frame < toggle + 24 && (
        <svg
          width={40}
          height={40}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            left: 1700 - (1 - appear(frame, toggle - 18, 16)) * 120,
            top: 300 + (1 - appear(frame, toggle - 18, 16)) * 80,
            opacity: 1 - appear(frame, toggle + 14, 10),
            transform: `scale(${frame >= toggle && frame < toggle + 6 ? 0.86 : 1})`,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
          }}
        >
          <path d="M4 2.5l15.5 9-6.8 1.6 3.9 6.9-2.9 1.6-3.9-6.9-5 4.7z" fill="#fff" stroke="#0b0b0e" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      )}

    </AbsoluteFill>
  );
};
