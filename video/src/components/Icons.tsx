import React from 'react';

type IconProps = { size: number; color: string; strokeWidth?: number; style?: React.CSSProperties };

/** A small bot face: MEV searcher. */
export const BotIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 2, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <path d="M24 5v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="24" cy="5" r="2.5" fill={color} />
    <rect x="9" y="12" width="30" height="24" rx="8" stroke={color} strokeWidth={strokeWidth} fill={`${color}22`} />
    <circle cx="18" cy="24" r="3.2" fill={color} />
    <circle cx="30" cy="24" r="3.2" fill={color} />
    <path d="M18 31h12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M5 22v6M43 22v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M16 36l-3 7M32 36l3 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/** Treasury agent: a vault with columns. */
export const TreasuryIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 2.2, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <path d="M6 18L24 7l18 11" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M10 20v15M19 20v15M29 20v15M38 20v15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M6 39h36" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="24" cy="15" r="2" fill={color} />
  </svg>
);

/** Market-maker agent: a chart with bid/ask levels. */
export const MakerIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 2.2, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <path d="M7 38l9-11 7 6 9-13 9 8" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M7 10h13M28 10h13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.55" />
    <circle cx="32" cy="20" r="3" fill={color} />
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 2.4, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <rect x="10" y="21" width="28" height="20" rx="5" stroke={color} strokeWidth={strokeWidth} fill={`${color}26`} />
    <path d="M16 21v-5a8 8 0 0 1 16 0v5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="24" cy="30" r="2.6" fill={color} />
    <path d="M24 32v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 3.2, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <circle cx="24" cy="24" r="20" fill={`${color}22`} stroke={color} strokeWidth={2} />
    <path d="M15 24.5l6 6 12-13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Shield outline in a 100×120 box; exported so particles can sample the same shape. */
export const SHIELD_PATH = 'M50 4 L92 20 V58 C92 86 72 106 50 116 C28 106 8 86 8 58 V20 Z';

export const ShieldIcon: React.FC<IconProps & { fill?: string }> = ({ size, color, strokeWidth = 3, fill = 'none', style }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none" style={style}>
    <path d={SHIELD_PATH} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={fill} />
  </svg>
);

/** Isometric block for the ledger. */
export const BlockIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 2.4, style }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style}>
    <path d="M32 6L56 19V45L32 58L8 45V19Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={`${color}14`} />
    <path d="M8 19L32 32L56 19M32 32V58" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);
