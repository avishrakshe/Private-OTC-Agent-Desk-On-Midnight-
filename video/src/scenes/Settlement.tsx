import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { At, Scene } from '../components/Scene';
import { Headline } from '../components/Headline';
import { BlockIcon, CheckIcon } from '../components/Icons';
import { SealedCard } from '../components/SealedCard';
import { springAt } from '../lib/motion';
import { useLayout } from '../lib/layout';
import { useCardDock } from './SealedBids';
import { copy } from '../copy';
import { colors, fonts, timing } from '../theme';

/** 21–25s: the sealed cards merge into one receipt hash that stamps onto a Midnight block. */
export const Settlement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isSquare } = useLayout();
  const dock = useCardDock();

  const merge = springAt(frame, fps, 2, 'snappy');
  const hashIn = springAt(frame, fps, 16, 'bouncy');
  const drop = springAt(frame, fps, 34, 'bouncy');
  const blockIn = springAt(frame, fps, 8, 'soft');
  const impact = frame >= 44 ? springAt(frame, fps, 44, 'soft') : 0;

  const hashStartY = (isSquare ? -240 : -250) * u;
  const blockY = (isSquare ? 130 : 110) * u;
  const hashY = interpolate(drop, [0, 1], [hashStartY, blockY - 230 * u]);
  const cardScale = interpolate(merge, [0, 1], [1, 0.2]);
  const cardOpacity = interpolate(merge, [0, 0.8], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <Scene duration={timing.settle}>
      <AbsoluteFill>
        {/* Cards collapse into the centre */}
        {[
          { x: dock.leftX, y: dock.leftY, text: copy.sealed.leftOrder, seed: 1 },
          { x: dock.rightX, y: dock.rightY, text: copy.sealed.rightOrder, seed: 2 },
        ].map((c) => (
          <At
            key={c.seed}
            x={interpolate(merge, [0, 1], [c.x, 0])}
            y={interpolate(merge, [0, 1], [c.y, hashStartY])}
            style={{ opacity: cardOpacity }} transform={`scale(${cardScale})`}
          >
            <SealedCard u={u} text={c.text} seal={1} frame={frame} seed={c.seed} width={dock.cardW} label={copy.sealed.sealedLabel} />
          </At>
        ))}

        {/* Flash where they merge */}
        <At y={hashStartY} style={{ opacity: interpolate(merge, [0.6, 0.9, 1], [0, 1, 0], { extrapolateLeft: 'clamp' }) }}>
          <div style={{ width: 260 * u, height: 260 * u, borderRadius: '50%', background: `radial-gradient(circle, ${colors.cyan}aa, transparent 65%)` }} />
        </At>

        {/* Midnight block */}
        <At y={blockY} style={{ opacity: blockIn }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * u }}>
            <div style={{ filter: `drop-shadow(0 0 ${(20 + 50 * impact) * u}px ${impact > 0 ? colors.cyan : colors.violet})` }}>
              <BlockIcon size={220 * u} color={impact > 0.1 ? colors.cyan : colors.violet} strokeWidth={2.2} />
            </div>
            <div style={{ fontFamily: fonts.sans, fontWeight: 800, fontSize: 40 * u, letterSpacing: '0.18em', color: colors.text }}>{copy.settle.block}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 20 * u, color: colors.textDim, display: 'flex', alignItems: 'center', gap: 8 * u }}>
              {impact > 0.2 && <CheckIcon size={24 * u} color={colors.cyan} />}
              {copy.settle.blockSub}
            </div>
          </div>
        </At>

        {/* Impact ring */}
        {impact > 0 && (
          <At y={blockY - 20 * u} style={{ opacity: 1 - impact }}>
            <div
              style={{
                width: interpolate(impact, [0, 1], [120, 620]) * u,
                height: interpolate(impact, [0, 1], [60, 310]) * u,
                borderRadius: '50%',
                border: `${3 * u}px solid ${colors.cyan}`,
              }}
            />
          </At>
        )}

        {/* The receipt hash */}
        <At y={hashY} style={{ opacity: hashIn }} transform={`scale(${interpolate(hashIn, [0, 1], [0.4, 1]) * (impact > 0 ? interpolate(impact, [0, 0.3, 1], [1, 0.92, 1]) : 1)})`}>
          <div
            style={{
              padding: `${16 * u}px ${30 * u}px`,
              borderRadius: 999,
              border: `${2 * u}px solid ${colors.cyan}`,
              background: colors.cyanSoft,
              boxShadow: `0 0 ${50 * u}px ${colors.cyan}77`,
              fontFamily: fonts.mono,
              fontWeight: 700,
              fontSize: 40 * u,
              letterSpacing: '0.04em',
              color: colors.text,
              whiteSpace: 'nowrap',
            }}
          >
            {copy.settle.hash}
          </div>
        </At>

        <Headline text={copy.settle.headline} delay={58} y={isSquare ? 0.86 : 0.86} accentWord={{ index: 0, color: colors.cyan }} />
      </AbsoluteFill>
    </Scene>
  );
};
