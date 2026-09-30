import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { IconLock } from '../../walkthrough/components/icons';
import { Chip, Kinetic, PopIn } from '../../walkthrough/components/ui';
import { C, F, appear, pop } from '../../walkthrough/theme';
import { CUE } from '../beats';

const ORDER = 'SELL 600,000 DAO @ $0.842';
const GLYPHS = '#%&@$*+=<>/\\01';

/** Act 3: "What if nobody could see it?" The same order is redacted character by character, then locks. */
export const Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const span = CUE.lock - CUE.redact;
  const scan = interpolate(frame, [CUE.redact, CUE.lock], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const locked = pop(frame, CUE.lock, 30, 11);
  const build = interpolate(frame, [CUE.roll, CUE.drop], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const zoom = 1 + 0.16 * build * build;

  return (
    <AbsoluteFill style={{ opacity: appear(frame, CUE.whatIf, 6), transform: `scale(${zoom})` }}>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 200 }}>
        <Kinetic text={'What if *nobody*\ncould see it?'} start={CUE.whatIf} size={112} stagger={2} weight={700} accent={`linear-gradient(90deg, ${C.violet}, ${C.cyan})`} />
      </AbsoluteFill>

      {/* shield rings on lock */}
      {[0, 1, 2].map((i) => {
        const r = appear(frame, CUE.lock + i * 5, 36);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 960 - 800 * r,
              top: 640 - 800 * r,
              width: 1600 * r,
              height: 1600 * r,
              borderRadius: '50%',
              border: `2px solid ${i === 1 ? C.cyan : C.violet}`,
              opacity: frame >= CUE.lock ? (1 - r) * 0.6 : 0,
            }}
          />
        );
      })}

      {/* the order, redacted */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 34,
            padding: '30px 44px',
            borderRadius: 28,
            background: 'linear-gradient(180deg, rgba(28,28,34,0.95), rgba(14,14,18,0.95))',
            border: `2px solid rgba(155,138,255,${0.2 + 0.6 * locked})`,
            boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 ${120 * locked}px rgba(155,138,255,${0.45 * locked})`,
            overflow: 'hidden',
          }}
        >
          <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 64, letterSpacing: '0.02em', whiteSpace: 'pre', color: C.text }}>
            {ORDER.split('').map((ch, i) => {
              if (ch === ' ') return ' ';
              const flip = CUE.redact + (i / ORDER.length) * span;
              const t = frame - flip;
              const shown = t < 0 ? ch : t < 3 ? GLYPHS[Math.floor(random(`g${i}-${frame}`) * GLYPHS.length)] : '●';
              return (
                <span key={i} style={{ color: t >= 0 ? C.violet : C.text, textShadow: t >= 0 && t < 3 ? `0 0 18px ${C.violet}` : undefined }}>
                  {shown}
                </span>
              );
            })}
          </div>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 26,
              display: 'grid',
              placeItems: 'center',
              color: C.violet,
              background: 'rgba(155,138,255,0.14)',
              border: `2px solid rgba(155,138,255,0.55)`,
              opacity: appear(frame, CUE.lock - 2, 4),
              transform: `scale(${0.3 + 0.7 * locked}) rotate(${(1 - locked) * -30}deg)`,
              boxShadow: `0 0 ${60 * locked}px rgba(155,138,255,0.55)`,
            }}
          >
            <IconLock size={52} stroke={2} />
          </div>
          {/* scan bar */}
          {scan > 0 && scan < 1 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${scan * 100}%`,
                width: 6,
                background: C.violet,
                boxShadow: `0 0 40px 12px rgba(155,138,255,0.6)`,
              }}
            />
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 780, display: 'flex', justifyContent: 'center', gap: 18 }}>
        <PopIn start={CUE.lock + 3}>
          <Chip tone="violet" dot size={26} mono>
            SEALED
          </Chip>
        </PopIn>
        <PopIn start={CUE.lock + 6}>
          <Chip tone="cyan" dot size={26} mono>
            ZERO-KNOWLEDGE
          </Chip>
        </PopIn>
      </div>
    </AbsoluteFill>
  );
};
