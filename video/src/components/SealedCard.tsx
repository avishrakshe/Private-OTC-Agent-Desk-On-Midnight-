import React from 'react';
import { interpolate } from 'remotion';
import { LockIcon } from './Icons';
import { scramble } from '../lib/motion';
import { colors, fonts } from '../theme';

/**
 * An order card that encrypts itself: plain text is replaced left-to-right by scrambled mono
 * characters as `seal` goes 0 → 1, then a lock and SEALED tag appear.
 */
export const SealedCard: React.FC<{
  u: number;
  text: string;
  seal: number;
  frame: number;
  seed: number;
  width: number;
  label: string;
  accent?: string;
}> = ({ u, text, seal, frame, seed, width, label, accent = colors.violet }) => {
  const shown = Math.floor(interpolate(seal, [0, 1], [0, text.length], { extrapolateRight: 'clamp' }));
  const noise = scramble(text.length, frame, seed);
  const chars = text.split('').map((c, i) => (i < shown && c !== ' ' ? noise[i] : c)).join('');
  const locked = interpolate(seal, [0.85, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: width * u,
        padding: `${22 * u}px ${26 * u}px`,
        borderRadius: 20 * u,
        background: `linear-gradient(180deg, rgba(124,92,255,${0.1 + 0.12 * seal}), rgba(124,92,255,0.03)), ${colors.bgRaised}`,
        border: `${1.5 * u}px solid ${accent}${seal > 0.5 ? 'aa' : '55'}`,
        boxShadow: `0 0 ${(30 + 40 * seal) * u}px ${accent}${seal > 0.5 ? '66' : '33'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16 * u,
      }}
    >
      <div style={{ opacity: locked, width: 44 * u * locked, overflow: 'hidden', flexShrink: 0 }}>
        <LockIcon size={44 * u} color={accent} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: seal > 0.05 ? fonts.mono : fonts.sans,
            fontWeight: 700,
            fontSize: 32 * u,
            letterSpacing: seal > 0.05 ? '0.03em' : '-0.01em',
            color: seal > 0.5 ? '#CFC4FF' : colors.text,
            whiteSpace: 'nowrap',
          }}
        >
          {chars}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 17 * u, letterSpacing: '0.16em', color: colors.textDim, marginTop: 6 * u }}>
          {locked > 0.5 ? label : 'ENCRYPTING…'}
        </div>
      </div>
    </div>
  );
};
