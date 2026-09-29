import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { At, Scene } from '../components/Scene';
import { Headline } from '../components/Headline';
import { OrderCard } from '../components/OrderCard';
import { BotIcon } from '../components/Icons';
import { springAt } from '../lib/motion';
import { useLayout } from '../lib/layout';
import { copy } from '../copy';
import { colors, fonts, timing } from '../theme';

/** 4–8s: a sandwich attack squeezes the order while slippage climbs. */
export const MevAttack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isSquare } = useLayout();

  const cardW = (isSquare ? 420 : 540) * u;
  const barIn = springAt(frame, fps, 10, 'snappy');
  const squeeze = springAt(frame, fps, 30, 'bouncy');
  const counter = springAt(frame, fps, 30, 'slow');
  const slippage = interpolate(counter, [0, 1], [copy.mev.slippageFrom, copy.mev.slippageTo]);
  const shake = frame > 30 && frame < 70 ? Math.sin(frame * 2.1) * 4 * u * (1 - (frame - 30) / 40) : 0;

  const gap = interpolate(squeeze, [0, 1], [60, -6]) * u;
  const barW = (isSquare ? 150 : 230) * u;
  const barX = cardW / 2 + gap + barW / 2;

  const Bar: React.FC<{ side: -1 | 1; label: string }> = ({ side, label }) => (
    <At x={side * interpolate(barIn, [0, 1], [1100 * u, barX])} y={0}>
      <div
        style={{
          width: barW,
          height: 190 * u,
          borderRadius: 20 * u,
          background: `linear-gradient(180deg, ${colors.red}, #b8203d)`,
          boxShadow: `0 0 ${60 * u}px ${colors.red}99`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10 * u,
        }}
      >
        <BotIcon size={52 * u} color="#fff" />
        <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 20 * u, letterSpacing: '0.12em', color: '#fff' }}>{label}</div>
      </div>
    </At>
  );

  return (
    <Scene duration={timing.mev}>
      <AbsoluteFill>
        {/* Slippage counter */}
        <At y={-250 * u}>
          <div style={{ textAlign: 'center', opacity: springAt(frame, fps, 24, 'soft') }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 22 * u, letterSpacing: '0.24em', color: colors.textDim }}>
              {copy.mev.slippageLabel}
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontWeight: 700,
                fontSize: 96 * u,
                color: colors.red,
                textShadow: `0 0 ${40 * u}px ${colors.red}88`,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              −{slippage.toFixed(2)}%
            </div>
          </div>
        </At>

        <Bar side={-1} label={copy.mev.frontRun} />
        <Bar side={1} label={copy.mev.backRun} />

        <At x={shake} y={0}>
          <div style={{ transform: `scaleX(${interpolate(squeeze, [0, 1], [1, 0.9])}) scaleY(${interpolate(squeeze, [0, 1], [1, 1.04])})` }}>
            <OrderCard
              u={u}
              title={copy.problem.order}
              sub={copy.problem.orderSub}
              accent={interpolate(squeeze, [0, 1], [0, 1]) > 0.5 ? colors.red : colors.violet}
              width={isSquare ? 420 : 540}
              titleSize={isSquare ? 32 : undefined}
            />
          </div>
        </At>

        <Headline text={copy.mev.headline} delay={50} y={isSquare ? 0.8 : 0.82} accentWord={{ index: 3, color: colors.red }} />
      </AbsoluteFill>
    </Scene>
  );
};
