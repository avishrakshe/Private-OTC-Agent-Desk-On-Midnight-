import React from 'react';
import { colors, fonts } from '../theme';

/** Glassy order card with a coloured glow. */
export const OrderCard: React.FC<{
  u: number;
  title: React.ReactNode;
  sub?: React.ReactNode;
  accent?: string;
  width?: number;
  mono?: boolean;
  icon?: React.ReactNode;
  glow?: number;
  titleSize?: number;
  style?: React.CSSProperties;
}> = ({ u, title, sub, accent = colors.violet, width = 520, mono, icon, glow = 1, titleSize, style }) => (
  <div
    style={{
      width: width * u,
      padding: `${26 * u}px ${32 * u}px`,
      borderRadius: 22 * u,
      background: `linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)), ${colors.bgRaised}`,
      border: `${1.5 * u}px solid ${accent}66`,
      boxShadow: `0 0 ${60 * u * glow}px ${accent}${Math.round(0x55 * Math.min(glow, 1)).toString(16).padStart(2, '0')}, inset 0 1px 0 rgba(255,255,255,0.08)`,
      display: 'flex',
      alignItems: 'center',
      gap: 20 * u,
      ...style,
    }}
  >
    {icon}
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontFamily: mono ? fonts.mono : fonts.sans,
          fontWeight: mono ? 700 : 800,
          fontSize: (titleSize ?? (mono ? 36 : 42)) * u,
          letterSpacing: mono ? '0.04em' : '-0.02em',
          color: colors.text,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>
      {sub && (
        <div style={{ fontFamily: fonts.mono, fontSize: 20 * u, color: colors.textDim, marginTop: 6 * u, whiteSpace: 'nowrap' }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);
