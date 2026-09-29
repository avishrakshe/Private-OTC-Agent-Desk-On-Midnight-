import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { springAt } from '../lib/motion';
import { useLayout } from '../lib/layout';
import { colors, fonts } from '../theme';

/** Big, bold headline whose words rise in with a staggered spring and de-blur. */
export const Headline: React.FC<{
  text: string;
  delay?: number;
  /** Vertical position as a fraction of the frame height. */
  y?: number;
  color?: string;
  accentWord?: { index: number; color: string };
  size?: number;
}> = ({ text, delay = 0, y = 0.8, color = colors.text, accentWord, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, headline, u } = useLayout();
  const words = text.split(' ');

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width,
        top: height * y,
        transform: 'translateY(-50%)',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: `0 ${(size ?? headline) * 0.26}px`,
        padding: `0 ${60 * u}px`,
        fontFamily: fonts.sans,
        fontWeight: 800,
        fontSize: size ?? headline,
        letterSpacing: '-0.035em',
        lineHeight: 1.05,
        color,
      }}
    >
      {words.map((w, i) => {
        const p = springAt(frame, fps, delay + i * 4, 'snappy');
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [0.45, 0])}em)`,
              filter: `blur(${interpolate(p, [0, 1], [10, 0])}px)`,
              color: accentWord?.index === i ? accentWord.color : undefined,
              textShadow: accentWord?.index === i ? `0 0 ${40 * u}px ${accentWord.color}88` : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
