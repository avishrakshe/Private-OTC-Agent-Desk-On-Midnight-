import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const BrandMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
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

export const IconEye: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconBot: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 4v4M9 13h.01M15 13h.01M9.5 17h5" />
  </svg>
);

export const IconAgent: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const IconBlock: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M12 2l9 5v10l-9 5-9-5V7z" />
    <path d="M3 7l9 5 9-5M12 12v10" />
  </svg>
);

export const IconLock: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconChip: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </svg>
);

export const IconReceipt: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
    <path d="M9 7h6M9 11h6M9 15h3" />
  </svg>
);

export const IconShield: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </svg>
);

export const IconScale: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M12 3v18M5 21h14M7 7h10" />
    <path d="M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z" />
  </svg>
);

export const IconFingerprint: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M12 11v3a8 8 0 0 1-1.5 4.5M8 8.5A5 5 0 0 1 17 11v2M5 11a7 7 0 0 1 12-5M16.5 17c.3-1 .5-2 .5-3M8 14a18 18 0 0 1-1 4" />
  </svg>
);

export const IconZap: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </svg>
);

export const IconSandwich: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M3 7h18M3 17h18" />
    <rect x="6" y="10" width="12" height="4" rx="1" />
  </svg>
);

export const IconTrend: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);

export const IconBrain: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" />
  </svg>
);

export const IconCopy: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </svg>
);

export const IconExternal: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);
