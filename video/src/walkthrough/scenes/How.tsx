import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { IconAgent, IconCheck, IconKey, IconLock, IconReceipt } from '../components/icons';
import { Chip, Eyebrow, Glass, PopIn, Typed } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F, appear, easeInOut, lerp, pop } from '../theme';

const cue = cueOf('how');

const LEDGER_Y = 740;
const entryX = (i: number) => 150 + i * 330;
const ENTRY_W = 310;

/** A small token that flies along an arc between two points. */
const Flyer: React.FC<{
  from: [number, number];
  to: [number, number];
  start: number;
  dur?: number;
  arc?: number;
  children: React.ReactNode;
  keep?: boolean;
}> = ({ from, to, start, dur = 26, arc = -90, children, keep }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  if (frame < start || (!keep && t >= 1 && frame > start + dur + 4)) return null;
  const x = lerp(from[0], to[0], t);
  const y = lerp(from[1], to[1], t) + arc * Math.sin(Math.PI * t);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * Math.sin(Math.PI * t)})`, opacity: keep ? 1 : 1 - appear(frame, start + dur, 5) }}>
      {children}
    </div>
  );
};

const Sealed: React.FC<{ label?: string; tone?: string }> = ({ label = '●●●●●●', tone = C.violet }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 10,
      fontFamily: F.mono,
      fontSize: 20,
      fontWeight: 600,
      color: tone,
      background: 'rgba(20,18,36,0.95)',
      border: `1.5px solid ${tone}`,
      boxShadow: `0 0 30px ${tone}66`,
      whiteSpace: 'nowrap',
    }}
  >
    <IconLock size={18} color={tone} stroke={2.2} />
    {label}
  </div>
);

export const How: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = cue('seller');
  const tId = cue('id');
  const s2 = cue('market');
  const tHash = cue('hash');
  const tEncrypted = cue('encrypted');
  const s3 = cue('proves') - 8;
  const tFloor = cue('floor');
  const tSettles = cue('settles');
  const s4 = cue('auditor') - 4;
  const tKey = cue('key');

  const step = frame >= s4 ? 3 : frame >= s3 ? 2 : frame >= s2 ? 1 : frame >= s1 - 10 ? 0 : -1;
  const STEPS = ['Ask', 'Quote', 'Match', 'Audit'];
  const makers = ['Northwind MM', 'Kestrel Liquidity', 'Arcadia Flow'];
  const makerY = (i: number) => 250 + i * 140;

  const entries = [
    { at: tId - 4, k: 'rfqs', v: '0x9f3a…c21e', sub: 'id + hidden owner', tone: C.text2 },
    { at: tHash, k: 'quotes', v: '0x41b0…7d02', sub: 'hash(price, size)', tone: C.violet },
    { at: tHash + 7, k: 'quotes', v: '0x7c12…a9e4', sub: 'hash(price, size)', tone: C.violet },
    { at: tHash + 14, k: 'quotes', v: '0xd08b…33f1', sub: 'hash(price, size)', tone: C.violet },
    { at: tSettles + 6, k: 'receipts', v: '0xe27c…118f', sub: 'receipt commitment', tone: C.lime },
  ];

  const proofStage = appear(frame, s3, 16) * (1 - appear(frame, s4, 14));
  const auditStage = appear(frame, s4 + 4, 16);

  return (
    <AbsoluteFill>
      {/* stepper */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 112, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {STEPS.map((s, i) => {
          const on = step === i;
          const done = step > i;
          return (
            <PopIn key={s} start={i * 3} y={-10}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 26px 12px 14px',
                  borderRadius: 999,
                  background: on ? 'rgba(194,247,58,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${on ? C.lime : done ? 'rgba(194,247,58,0.35)' : C.line2}`,
                  boxShadow: on ? '0 0 40px rgba(194,247,58,0.25)' : undefined,
                  transform: `scale(${on ? 1.06 : 1})`,
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 99,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: F.mono,
                    fontSize: 18,
                    fontWeight: 600,
                    color: on || done ? '#0b1000' : C.text2,
                    background: on || done ? C.lime : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {done ? <IconCheck size={20} stroke={2.6} color="#0b1000" /> : i + 1}
                </span>
                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 26, color: on ? C.text : C.text2 }}>{s}</span>
              </div>
            </PopIn>
          );
        })}
      </div>

      {/* seller */}
      <PopIn start={s1 - 12} style={{ position: 'absolute', left: 110, top: 270 }}>
        <Glass style={{ width: 380, padding: '26px 28px' }} tone="violet" glow={step === 0 || step === 2 ? 0.8 : 0.2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 64, height: 64, borderRadius: 18, display: 'grid', placeItems: 'center', background: 'rgba(155,138,255,0.15)', color: C.violet }}>
              <IconAgent size={36} />
            </span>
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 32, color: C.text }}>Treasury Seller</div>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.text3 }}>taker · sells 600k DAO</div>
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Chip tone="violet" size={18}>
              <IconLock size={16} /> floor $0.83
            </Chip>
            <Chip tone="violet" size={18}>
              <IconLock size={16} /> mandate
            </Chip>
          </div>
        </Glass>
      </PopIn>

      {/* makers */}
      {makers.map((m, i) => (
        <PopIn key={m} start={s2 - 8 + i * 4} style={{ position: 'absolute', left: 1430, top: makerY(i) }}>
          <Glass style={{ width: 380, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }} tone="cyan" glow={step === 1 ? 0.6 : 0.1}>
            <span style={{ width: 52, height: 52, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(98,230,255,0.12)', color: C.cyan, fontFamily: F.mono, fontSize: 18, fontWeight: 600 }}>
              {m
                .split(' ')
                .map((w) => w[0])
                .join('')}
            </span>
            <div>
              <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.text }}>{m}</div>
              <div style={{ fontFamily: F.mono, fontSize: 17, color: C.text3 }}>market maker</div>
            </div>
          </Glass>
        </PopIn>
      ))}

      {/* makers → ledger (hash) and → seller (encrypted opening) */}
      {makers.map((m, i) => (
        <React.Fragment key={m}>
          <Flyer from={[1500, makerY(i) + 60]} to={[entryX(i + 1) + ENTRY_W / 2, LEDGER_Y + 60]} start={tHash - 22 + i * 7} dur={22} arc={-60}>
            <Sealed />
          </Flyer>
          <Flyer from={[1430, makerY(i) + 55]} to={[500, 360 + i * 22]} start={tEncrypted - 6 + i * 6} dur={30} arc={-40}>
            <Sealed label="price·size → seller" tone={C.cyan} />
          </Flyer>
        </React.Fragment>
      ))}
      <Flyer from={[300, 470]} to={[entryX(0) + ENTRY_W / 2, LEDGER_Y + 60]} start={tId - 24} dur={20} arc={-40}>
        <Sealed label="openRfq" tone={C.text2} />
      </Flyer>

      {/* proof stage */}
      <div style={{ position: 'absolute', left: 560, top: 250, width: 800, height: 420, opacity: proofStage, transform: `scale(${0.92 + 0.08 * proofStage})` }}>
        <Glass style={{ position: 'absolute', inset: 0, padding: '28px 34px' }} tone="lime" glow={0.5}>
          <Eyebrow color={C.lime}>acceptQuote · zero-knowledge proof</Eyebrow>
          <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
            {[
              { at: s3 + 6, text: 'quote opening = on-chain commitment', val: '' },
              { at: tFloor - 4, text: 'price ≥ private floor', val: '$0.8395 ≥ ●●●●●' },
              { at: tFloor + 8, text: 'mandate · oracle band · funds', val: 'all hold' },
            ].map((r) => {
              const o = appear(frame, r.at, 10);
              const ok = pop(frame, r.at + 6, 30, 10);
              return (
                <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: o, transform: `translateX(${(1 - o) * 30}px)` }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(194,247,58,0.15)', transform: `scale(${ok})` }}>
                    <IconCheck size={24} color={C.lime} stroke={2.6} />
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 25, color: C.text }}>{r.text}</span>
                  {r.val && <span style={{ fontFamily: F.mono, fontSize: 22, color: C.text3, marginLeft: 'auto' }}>{r.val}</span>}
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 34, right: 34, bottom: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: 64,
                color: C.lime,
                textShadow: `0 0 ${30 + 20 * Math.sin(frame / 6)}px rgba(194,247,58,0.6)`,
                opacity: appear(frame, tFloor + 14, 10),
              }}
            >
              π
            </div>
            <div style={{ opacity: appear(frame, tSettles - 2, 12) }}>
              <Chip tone="lime" size={24} solid>
                Settled at the maker’s $0.8395
              </Chip>
            </div>
          </div>
        </Glass>
      </div>
      <Flyer from={[640, 620]} to={[entryX(4) + ENTRY_W / 2, LEDGER_Y + 60]} start={tSettles - 16} dur={22} arc={-80}>
        <Sealed label="π proof" tone={C.lime} />
      </Flyer>

      {/* auditor */}
      <div style={{ position: 'absolute', left: 560, top: 250, width: 800, height: 420, opacity: auditStage, transform: `translateY(${(1 - auditStage) * 30}px)` }}>
        <Glass style={{ position: 'absolute', inset: 0, padding: '28px 34px' }} tone="cyan" glow={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Eyebrow color={C.cyan}>Auditor · viewing key</Eyebrow>
            <span style={{ color: C.cyan, transform: `rotate(${(1 - appear(frame, tKey - 6, 20)) * -60}deg)` }}>
              <IconKey size={44} stroke={2} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 20 }}>
            <IconReceipt size={46} color={C.text2} />
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 40, color: C.text }}>
                <Typed text="600,000 DAO → Northwind MM" start={s4 + 10} cps={42} caret={false} style={{ fontFamily: F.display }} />
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 24, color: C.text2, marginTop: 6, opacity: appear(frame, s4 + 30, 10) }}>@ $0.8395 · receipt 0xe27c…118f</div>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 34, bottom: 28, opacity: appear(frame, tKey, 10) }}>
            <Chip tone="lime" size={24} dot>
              Re-hashed · matches the on-chain commitment
            </Chip>
          </div>
        </Glass>
      </div>

      {/* ledger */}
      <div style={{ position: 'absolute', left: 110, right: 110, top: LEDGER_Y - 50, opacity: appear(frame, s1 - 10, 14) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <Eyebrow color={C.lime}>Midnight ledger</Eyebrow>
          <span style={{ fontFamily: F.body, fontSize: 20, color: C.text3 }}>public: what everyone can see</span>
        </div>
        <div style={{ height: 130, borderRadius: 22, border: `1.5px solid ${C.line2}`, background: 'rgba(12,12,15,0.8)' }} />
      </div>
      {entries.map((e, i) => {
        const p = pop(frame, e.at, 30, 12);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: entryX(i),
              top: LEDGER_Y + 14,
              width: ENTRY_W,
              padding: '14px 18px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${e.tone}55`,
              opacity: appear(frame, e.at, 6),
              transform: `scale(${0.7 + 0.3 * p})`,
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.text, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
              <span style={{ color: e.tone }}>{e.k}</span> = {e.v}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 17, color: C.text3, marginTop: 4 }}>{e.sub}</div>
          </div>
        );
      })}

    </AbsoluteFill>
  );
};
