import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useEnvelope } from '../lib/motion';

/**
 * Wraps a scene with the shared transition: glow/blur in, slow camera push, blur out.
 * `holdEnd` keeps the final scene fully visible (it ends the film and becomes the poster).
 */
export const Scene: React.FC<{ duration: number; holdEnd?: boolean; children: React.ReactNode }> = ({
  duration,
  holdEnd,
  children,
}) => {
  const { opacity, blur, scale } = useEnvelope(duration, { holdEnd });
  return (
    <AbsoluteFill
      style={{
        opacity,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        transform: `scale(${holdEnd ? 1 : scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Absolutely positioned child, centred on (x, y) offsets from the frame centre.
 * `transform` is applied after the positioning (e.g. "scale(0.8)"), so it never displaces it.
 */
export const At: React.FC<{
  x?: number;
  y?: number;
  transform?: string;
  style?: Omit<React.CSSProperties, 'transform'>;
  children: React.ReactNode;
}> = ({ x = 0, y = 0, transform = '', style, children }) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      ...style,
      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) ${transform}`,
    }}
  >
    {children}
  </div>
);
