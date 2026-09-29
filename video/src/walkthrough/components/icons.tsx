import React from 'react';

// Same line icons as the site (src/components/ui/icons.tsx).
type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 24, color = 'currentColor', stroke = 1.7, style, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {children}
  </svg>
);

export const IconEye: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
export const IconBot: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 4v4M9 13h.01M15 13h.01M9.5 17h5" />
  </Svg>
);
export const IconAgent: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
);
export const IconBlock: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 2l9 5v10l-9 5-9-5V7z" />
    <path d="M3 7l9 5 9-5M12 12v10" />
  </Svg>
);
export const IconLock: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="10" width="16" height="11" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);
export const IconChip: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </Svg>
);
export const IconReceipt: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
    <path d="M9 7h6M9 11h6M9 15h3" />
  </Svg>
);
export const IconShield: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </Svg>
);
export const IconScale: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3v18M5 21h14M7 7h10" />
    <path d="M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z" />
  </Svg>
);
export const IconFingerprint: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 11v3a8 8 0 0 1-1.5 4.5M8 8.5A5 5 0 0 1 17 11v2M5 11a7 7 0 0 1 12-5M16.5 17c.3-1 .5-2 .5-3M8 14a18 18 0 0 1-1 4" />
  </Svg>
);
export const IconZap: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </Svg>
);
export const IconSandwich: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 7h18M3 17h18" />
    <rect x="6" y="10" width="12" height="4" rx="1" />
  </Svg>
);
export const IconTrend: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </Svg>
);
export const IconBrain: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" />
  </Svg>
);
export const IconKey: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M17 6l3 3M15 8l2 2" />
  </Svg>
);
export const IconCheck: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const IconX: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const IconWallet: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="14" rx="3" />
    <path d="M3 10h18M16 15h2" />
  </Svg>
);
export const IconUnlock: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="10" width="16" height="11" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 7.5-2" />
  </Svg>
);

/** The site's brand mark: a lime→violet crescent in a rounded tile. */
export const BrandMark: React.FC<{ size?: number; glow?: number }> = ({ size = 40, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ filter: glow ? `drop-shadow(0 0 ${glow}px rgba(194,247,58,0.55))` : undefined }}>
    <defs>
      <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c2f73a" />
        <stop offset="1" stopColor="#9b8aff" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="38" height="38" rx="12" fill="#0e1119" stroke="rgba(255,255,255,0.16)" />
    <path d="M27 12.5a9 9 0 1 0 0 15 7.2 7.2 0 1 1 0-15z" fill="url(#bm-g)" />
    <circle cx="27.5" cy="20" r="1.8" fill="#c2f73a" />
  </svg>
);
