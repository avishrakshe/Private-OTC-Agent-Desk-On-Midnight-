import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { At, Scene } from '../components/Scene';
import { springAt } from '../lib/motion';
import { useLayout } from '../lib/layout';
import { copy } from '../copy';
import { colors, fonts, timing } from '../theme';

/** Crescent mark used on the site favicon. */
const Mark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect x="1" y="1" width="38" height="38" rx="12" fill={colors.bgRaised} stroke={`${colors.violet}88`} />
    <path d="M27 12.5a9 9 0 1 0 0 15 7.2 7.2 0 1 1 0-15z" fill={colors.violet} />
  </svg>
);

/**
 * 25–30s: grid lines sweep into place, the product name resolves, then tagline and CTA.
 * Everything has settled by ~frame 85, so the last 2s+ are a still frame (the poster).
 */
export const LogoCta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, width, height, isSquare } = useLayout();

  const sweep = springAt(frame, fps, 0, 'slow');
  const markIn = springAt(frame, fps, 14, 'bouncy');
  const tagIn = springAt(frame, fps, 48, 'snappy');
  const ctaIn = springAt(frame, fps, 62, 'bouncy');
  const name = copy.logo.name;
  const nameSize = (isSquare ? 76 : 104) * u;

  // Lines converge from the frame edges onto a framing rectangle around the logo.
  const boxW = (isSquare ? 900 : 1320) * u;
  const boxH = (isSquare ? 560 : 520) * u;
  const lines = [
    { x1: 0, y1: height / 2 - boxH / 2, x2: width, y2: height / 2 - boxH / 2 },
    { x1: 0, y1: height / 2 + boxH / 2, x2: width, y2: height / 2 + boxH / 2 },
    { x1: width / 2 - boxW / 2, y1: 0, x2: width / 2 - boxW / 2, y2: height },
    { x1: width / 2 + boxW / 2, y1: 0, x2: width / 2 + boxW / 2, y2: height },
  ];

  return (
    <Scene duration={timing.logo} holdEnd>
      <AbsoluteFill>
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
          {lines.map((l, i) => (
            <line
              key={i}
              {...l}
              pathLength={1}
              stroke={colors.violet}
              strokeOpacity={interpolate(sweep, [0, 1], [0.6, 0.22])}
              strokeWidth={1.2 * u}
              strokeDasharray="1"
              strokeDashoffset={1 - sweep}
            />
          ))}
        </svg>
        {/* Soft glow behind the name */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse ${isSquare ? 60 : 42}% 32% at 50% 47%, rgba(124,92,255,${0.22 * sweep}), transparent 70%)`,
          }}
        />

        <At y={(isSquare ? -215 : -210) * u} style={{ opacity: markIn }} transform={`scale(${interpolate(markIn, [0, 1], [0.6, 1])})`}>
          <Mark size={96 * u} />
        </At>

        <At y={(isSquare ? -50 : -30) * u}>
          <div
            style={{
              fontFamily: fonts.sans,
              fontWeight: 800,
              fontSize: nameSize,
              letterSpacing: '-0.045em',
              color: colors.text,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              lineHeight: 1,
            }}
          >
            {name.split('').map((ch, i) => {
              const p = springAt(frame, fps, 18 + i * 1.2, 'snappy');
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    whiteSpace: 'pre',
                    opacity: p,
                    transform: `translateY(${interpolate(p, [0, 1], [0.35, 0])}em)`,
                    filter: `blur(${interpolate(p, [0, 1], [8, 0])}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
            <div
              style={{
                fontFamily: fonts.mono,
                fontWeight: 500,
                fontSize: 26 * u,
                letterSpacing: '0.3em',
                color: colors.violet,
                marginTop: 18 * u,
                opacity: springAt(frame, fps, 40, 'soft'),
                textTransform: 'uppercase',
              }}
            >
              {copy.logo.network}
            </div>
          </div>
        </At>

        <At y={(isSquare ? 110 : 115) * u} style={{ opacity: tagIn }} transform={`translateY(${interpolate(tagIn, [0, 1], [20 * u, 0])}px)`}>
          <div style={{ fontFamily: fonts.sans, fontWeight: 600, fontSize: (isSquare ? 38 : 44) * u, color: colors.textDim, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            {copy.logo.tagline}
          </div>
        </At>

        <At y={(isSquare ? 220 : 230) * u} style={{ opacity: ctaIn }} transform={`scale(${interpolate(ctaIn, [0, 1], [0.8, 1])})`}>
          <div
            style={{
              padding: `${22 * u}px ${46 * u}px`,
              borderRadius: 999,
              background: `linear-gradient(135deg, ${colors.violet}, #5B3FE0)`,
              boxShadow: `0 0 ${60 * u}px ${colors.violet}88, inset 0 1px 0 rgba(255,255,255,0.25)`,
              fontFamily: fonts.sans,
              fontWeight: 700,
              fontSize: 32 * u,
              color: '#fff',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {copy.logo.cta}
          </div>
        </At>
      </AbsoluteFill>
    </Scene>
  );
};
