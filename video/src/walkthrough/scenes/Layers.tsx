import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { IconLock } from '../components/icons';
import { Enter } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F, appear, easeInOut, pop } from '../theme';

const cue = cueOf('layers');
const SIZE = 640;

const Plane: React.FC<{ z: number; color: string; o: number; children?: React.ReactNode; pattern?: string }> = ({ z, color, o, children, pattern }) => (
  <div
    style={{
      position: 'absolute',
      left: -SIZE / 2,
      top: -SIZE / 2,
      width: SIZE,
      height: SIZE,
      borderRadius: 48,
      transform: `translateZ(${z}px)`,
      opacity: o,
      background: `linear-gradient(135deg, ${color}2e, ${color}0d)`,
      border: `2.5px solid ${color}aa`,
      boxShadow: `0 0 80px ${color}33, inset 0 0 60px ${color}1f`,
      backgroundImage: pattern,
    }}
  >
    {children}
  </div>
);

export const Layers: React.FC = () => {
  const frame = useCurrentFrame();
  const tNever = cue('never');
  const tProof = cue('proof');
  const tNothing = cue('nothing');
  const tLedger = cue('ledger');
  const tCommit = cue('commitments');

  const spin = interpolate(frame, [0, 360], [-42, -26]);
  const tilt = interpolate(frame, [0, 360], [62, 56]);
  const dev = pop(frame, 0, 30, 16);
  const prf = pop(frame, tProof - 12, 30, 16);
  const led = pop(frame, tLedger - 12, 30, 16);
  const spread = interpolate(frame, [0, 300], [0.85, 1.1]);

  const privates = ['price $0.8395', 'floor $0.83', 'mandate', 'balance 1.8M'];
  const lockT = appear(frame, tNever, 14);

  // tokens dropping through the stack
  const pi = interpolate(frame, [tProof, tProof + 26], [260, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  const hash = interpolate(frame, [tLedger, tLedger + 24], [0, -260], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });

  const labels = [
    { at: 4, y: 250, color: C.violet, title: 'Your device', body: 'prices · floors · mandates · balances', tag: 'PRIVATE' },
    { at: tProof - 8, y: 470, color: C.cyan, title: 'Zero-knowledge proof', body: '“the rules hold”, nothing more', tag: 'PROOF' },
    { at: tLedger - 8, y: 690, color: C.lime, title: 'Midnight ledger', body: 'commitments only', tag: 'PUBLIC' },
  ];

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 660, top: 540, perspective: 2200 }}>
        <div style={{ transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg) rotateZ(${spin}deg)` }}>
          {/* ledger */}
          <Plane z={-260 * spread} color={C.lime} o={led}>
            <div style={{ position: 'absolute', inset: 60, display: 'grid', gap: 16, alignContent: 'center' }}>
              {['0x41b0…7d02', '0x9f3a…c21e', '0xe27c…118f', '0x18bd…c273'].map((h, i) => (
                <div
                  key={h}
                  style={{
                    fontFamily: F.mono,
                    fontSize: 34,
                    color: C.lime,
                    padding: '12px 20px',
                    borderRadius: 14,
                    background: 'rgba(194,247,58,0.08)',
                    border: '1.5px solid rgba(194,247,58,0.35)',
                    opacity: appear(frame, tCommit - 10 + i * 5, 10),
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
          </Plane>
          {/* proof */}
          <Plane
            z={0}
            color={C.cyan}
            o={prf}
            pattern="linear-gradient(rgba(98,230,255,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(98,230,255,0.12) 2px, transparent 2px)"
          >
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  border: `3px solid ${C.cyan}`,
                  boxShadow: `0 0 ${50 + 30 * appear(frame, tNothing - 6, 12)}px ${C.cyan}88`,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 120,
                  color: C.cyan,
                }}
              >
                ✓
              </div>
            </div>
          </Plane>
          {/* device */}
          <Plane z={260 * spread} color={C.violet} o={dev}>
            <div style={{ position: 'absolute', inset: 50, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignContent: 'center' }}>
              {privates.map((p, i) => (
                <div
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: F.mono,
                    fontSize: 28,
                    color: C.text,
                    padding: '22px 18px',
                    borderRadius: 18,
                    background: 'rgba(155,138,255,0.14)',
                    border: `1.5px solid rgba(155,138,255,${0.35 + 0.5 * lockT})`,
                    opacity: appear(frame, 6 + i * 4, 12),
                    boxShadow: lockT ? `0 0 ${30 * lockT}px rgba(155,138,255,0.4)` : undefined,
                  }}
                >
                  <span style={{ opacity: lockT, color: C.violet, display: 'inline-flex' }}>
                    <IconLock size={26} stroke={2.2} />
                  </span>
                  {p}
                </div>
              ))}
            </div>
          </Plane>
          {/* π travelling device → proof */}
          <div
            style={{
              position: 'absolute',
              left: -60,
              top: -60,
              width: 120,
              height: 120,
              transform: `translateZ(${pi}px)`,
              opacity: appear(frame, tProof - 2, 6) * (1 - appear(frame, tProof + 26, 8)),
              display: 'grid',
              placeItems: 'center',
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 90,
              color: C.cyan,
              textShadow: `0 0 30px ${C.cyan}`,
            }}
          >
            π
          </div>
          {/* hash travelling proof → ledger */}
          <div
            style={{
              position: 'absolute',
              left: -150,
              top: -40,
              width: 300,
              height: 80,
              transform: `translateZ(${hash}px)`,
              opacity: appear(frame, tLedger - 2, 6) * (1 - appear(frame, tLedger + 24, 8)),
              display: 'grid',
              placeItems: 'center',
              fontFamily: F.mono,
              fontSize: 34,
              color: C.lime,
              borderRadius: 16,
              background: 'rgba(194,247,58,0.15)',
              border: `2px solid ${C.lime}`,
            }}
          >
            hash(…)
          </div>
        </div>
      </div>

      {/* labels */}
      {labels.map((l) => (
        <Enter key={l.title} start={l.at} dx={60} dy={0} style={{ position: 'absolute', left: 1180, top: l.y }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <span style={{ width: 90, height: 2, background: `linear-gradient(90deg, transparent, ${l.color})` }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 44, color: C.text }}>{l.title}</span>
                <span style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: '0.2em', color: l.color, padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${l.color}66` }}>
                  {l.tag}
                </span>
              </div>
              <div style={{ fontFamily: F.body, fontSize: 26, color: C.text2, marginTop: 6 }}>{l.body}</div>
            </div>
          </div>
        </Enter>
      ))}

    </AbsoluteFill>
  );
};
