import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../theme';

/**
 * Near-black navy base, a slow-moving perspective grid, animated film grain and a vignette.
 * Rendered once under all scenes so the backdrop is continuous across cuts.
 */
export const Background: React.FC<{ gridIntensity?: number }> = ({ gridIntensity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cell = 80;
  const drift = (frame * 0.6) % cell; // slow forward motion
  const cols = Math.ceil(width / cell) + 8;
  const rows = 22;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: 'hidden' }}>
      {/* Perspective floor grid */}
      <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: '50% 30%', opacity: 0.9 * gridIntensity }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '52%',
            width: cols * cell,
            height: rows * cell,
            marginLeft: (-cols * cell) / 2,
            transform: 'rotateX(72deg)',
            transformOrigin: '50% 0%',
            backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundPosition: `0px ${drift}px`,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 60%, transparent 100%)',
          }}
        />
        {/* Faint ceiling grid for depth */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '52%',
            width: cols * cell,
            height: rows * cell,
            marginLeft: (-cols * cell) / 2,
            transform: 'rotateX(-72deg)',
            transformOrigin: '50% 100%',
            backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundPosition: `0px ${-drift}px`,
            opacity: 0.35,
            maskImage: 'linear-gradient(to top, transparent 0%, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 30%, transparent 100%)',
          }}
        />
      </AbsoluteFill>

      {/* Ambient glow that breathes slowly */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 48%, rgba(124,92,255,${interpolate(Math.sin(frame / 40), [-1, 1], [0.05, 0.1])}), transparent 70%)`,
        }}
      />

      {/* Animated grain: the noise seed changes every frame */}
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay' }}>
        <svg width={width} height={height}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 60} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)' }} />
    </AbsoluteFill>
  );
};
