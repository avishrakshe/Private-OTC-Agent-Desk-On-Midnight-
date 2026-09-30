import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { IconBrain, IconChip, IconLock } from '../../walkthrough/components/icons';
import { tint, type Tone } from '../../walkthrough/components/ui';
import { C, F, appear, easeInOut, pop } from '../../walkthrough/theme';
import { BEAT, CUE } from '../beats';

const LEN = BEAT * 2;

const PILLARS: { at: number; n: string; tag: string; title: string; sub: string; tone: Tone; icon: React.ReactNode }[] = [
  {
    at: CUE.sealed,
    n: '01',
    tag: 'Sealed RFQ',
    title: 'Sealed quotes.',
    sub: 'The chain stores a hash, not a price.',
    tone: 'violet',
    icon: <IconLock size={110} stroke={1.6} />,
  },
  {
    at: CUE.zk,
    n: '02',
    tag: 'Zero-knowledge',
    title: 'Proven, not revealed.',
    sub: 'The match is proven against a private floor.',
    tone: 'cyan',
    icon: <IconChip size={110} stroke={1.6} />,
  },
  {
    at: CUE.agents,
    n: '03',
    tag: 'AI agents',
    title: 'Agents can’t go rogue.',
    sub: 'Every order is proven against its owner’s mandate.',
    tone: 'lime',
    icon: <IconBrain size={110} stroke={1.6} />,
  },
];

/** One pillar: whips in from the side on its beat, holds, whips out the other way. */
const Pillar: React.FC<(typeof PILLARS)[number] & { dir: 1 | -1 }> = ({ at, n, tag, title, sub, tone, icon, dir }) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame >= at + LEN) return null;
  const inT = appear(frame, at - 2, 8);
  const outT = interpolate(frame, [at + LEN - 5, at + LEN], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  const x = (1 - inT) * 700 * dir - outT * 700 * dir;
  const blur = (1 - inT) * 26 + outT * 26;
  const tile = pop(frame, at, 30, 12);
  const color = C[tone as Exclude<Tone, 'neutral'>];

  return (
    <AbsoluteFill>
      {/* tone wash + giant numeral */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + 12 * dir}% 50%, ${tint(tone, 0.16)} 0%, transparent 55%)`, opacity: inT * (1 - outT) }} />
      <div
        style={{
          position: 'absolute',
          right: dir > 0 ? 60 : undefined,
          left: dir < 0 ? 60 : undefined,
          top: 40,
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 560,
          lineHeight: 1,
          letterSpacing: '-0.06em',
          color: 'transparent',
          WebkitTextStroke: `2px ${tint(tone, 0.22)}`,
          transform: `translateX(${x * 0.35 - (frame - at) * 2 * dir}px)`,
          opacity: inT * (1 - outT),
        }}
      >
        {n}
      </div>

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateX(${x}px)`,
          filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
          opacity: Math.min(inT * 1.4, 1) * (1 - outT),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 64 }}>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 60,
              display: 'grid',
              placeItems: 'center',
              color,
              background: `linear-gradient(180deg, ${tint(tone, 0.2)}, rgba(18,18,22,0.95))`,
              border: `2.5px solid ${tint(tone, 0.6)}`,
              boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 ${90 * tile}px ${tint(tone, 0.5)}`,
              transform: `scale(${0.6 + 0.4 * tile}) rotate(${(1 - tile) * 20 * dir}deg)`,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div style={{ maxWidth: 1180 }}>
            <div style={{ fontFamily: F.mono, fontSize: 28, letterSpacing: '0.24em', textTransform: 'uppercase', color }}>
              {n} · {tag}
            </div>
            <div
              style={{
                fontFamily: F.display,
                fontWeight: 800,
                fontSize: 120,
                letterSpacing: '-0.045em',
                lineHeight: 1,
                color: C.text,
                marginTop: 14,
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </div>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 38, color: C.text2, marginTop: 20 }}>{sub}</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Act 5: three pillars, two beats each, then the number that matters. */
export const Pillars: React.FC = () => {
  const frame = useCurrentFrame();
  const z = pop(frame, CUE.zero, 30, 10);
  const zIn = appear(frame, CUE.zero - 1, 4);
  const count = Math.round(interpolate(frame, [CUE.zero, CUE.zero + 8], [9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const idx = PILLARS.findIndex((p) => frame >= p.at - 2 && frame < p.at + LEN);

  return (
    <AbsoluteFill>
      {PILLARS.map((p, i) => (
        <Pillar key={p.n} {...p} dir={i % 2 ? -1 : 1} />
      ))}

      {/* zero */}
      {frame >= CUE.zero - 1 && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: zIn }}>
          <AbsoluteFill style={{ background: `radial-gradient(circle at 36% 50%, rgba(194,247,58,${0.18 * z}) 0%, transparent 50%)` }} />
          {[0, 1].map((i) => {
            const r = appear(frame, CUE.zero + i * 6, 30);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 700 - 800 * r,
                  top: 540 - 800 * r,
                  width: 1600 * r,
                  height: 1600 * r,
                  borderRadius: '50%',
                  border: `2px solid ${C.lime}`,
                  opacity: (1 - r) * 0.55,
                }}
              />
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
            <div
              style={{
                fontFamily: F.display,
                fontWeight: 800,
                fontSize: 460,
                lineHeight: 0.85,
                color: C.lime,
                fontVariantNumeric: 'tabular-nums',
                transform: `scale(${0.4 + 0.6 * z})`,
                textShadow: `0 0 ${90 + 30 * Math.sin(frame / 4)}px rgba(194,247,58,0.55)`,
              }}
            >
              {count}
            </div>
            <div style={{ maxWidth: 820, opacity: appear(frame, CUE.zero + 2, 8), transform: `translateX(${(1 - appear(frame, CUE.zero + 2, 12)) * 60}px)` }}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 96, lineHeight: 1, letterSpacing: '-0.04em', color: C.text }}>
                prices or sizes <span style={{ whiteSpace: 'nowrap' }}>on-chain.</span>
              </div>
              <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 36, color: C.text2, marginTop: 20 }}>Only commitments, settled on Midnight.</div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* progress pips */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {[...PILLARS.map((p) => p.tone), 'lime' as Tone].map((tone, i) => {
          const on = i === (frame >= CUE.zero - 1 ? 3 : idx);
          return (
            <div
              key={i}
              style={{
                width: on ? 56 : 14,
                height: 14,
                borderRadius: 99,
                background: on ? C[tone as Exclude<Tone, 'neutral'>] : 'rgba(255,255,255,0.18)',
                boxShadow: on ? `0 0 24px ${tint(tone, 0.6)}` : undefined,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
