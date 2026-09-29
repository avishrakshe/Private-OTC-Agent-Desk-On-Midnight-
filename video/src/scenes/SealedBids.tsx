import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { At, Scene } from '../components/Scene';
import { Headline } from '../components/Headline';
import { MakerIcon, TreasuryIcon } from '../components/Icons';
import { SealedCard } from '../components/SealedCard';
import { springAt } from '../lib/motion';
import { useLayout } from '../lib/layout';
import { copy } from '../copy';
import { colors, fonts, timing } from '../theme';

/** Where the two sealed cards rest; shared with the proof and settlement scenes for continuity. */
export const useCardDock = () => {
  const { u, isSquare } = useLayout();
  const cardW = isSquare ? 360 : 440;
  return {
    cardW,
    leftX: isSquare ? 0 : -(cardW / 2 + 16) * u,
    rightX: isSquare ? 0 : (cardW / 2 + 16) * u,
    leftY: (isSquare ? -300 : -250) * u,
    rightY: (isSquare ? -180 : -250) * u,
  };
};

const Agent: React.FC<{ u: number; icon: React.ReactNode; name: string; appear: number; nameSize: number }> = ({ u, icon, name, appear, nameSize }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * u, opacity: appear, transform: `scale(${interpolate(appear, [0, 1], [0.8, 1])})` }}>
    <div
      style={{
        width: 150 * u,
        height: 150 * u,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: `radial-gradient(circle at 50% 35%, ${colors.violetSoft}, ${colors.bgRaised})`,
        border: `${2 * u}px solid ${colors.violet}88`,
        boxShadow: `0 0 ${50 * u}px ${colors.violet}55`,
      }}
    >
      {icon}
    </div>
    <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: nameSize * u, color: colors.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{name}</div>
  </div>
);

/** 12–17s: two agents each send an order that encrypts itself; the sealed cards meet in the middle. */
export const SealedBids: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, spread, isSquare } = useLayout();
  const dock = useCardDock();
  const nameSize = isSquare ? 24 : 28;

  const agentX = (isSquare ? 320 : 690 * spread) * u;
  const agentY = (isSquare ? 120 : 40) * u;
  const leftIn = springAt(frame, fps, 4, 'snappy');
  const rightIn = springAt(frame, fps, 10, 'snappy');
  const travel = springAt(frame, fps, 34, 'slow');
  const seal = interpolate(frame, [40, 92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const emerge = springAt(frame, fps, 22, 'snappy');

  const cardPos = (side: -1 | 1) => {
    const startX = side * agentX;
    const startY = agentY - 150 * u;
    const endX = side < 0 ? dock.leftX : dock.rightX;
    const endY = side < 0 ? dock.leftY : dock.rightY;
    return { x: interpolate(travel, [0, 1], [startX, endX]), y: interpolate(travel, [0, 1], [startY, endY]) };
  };
  const l = cardPos(-1);
  const r = cardPos(1);

  return (
    <Scene duration={timing.sealed}>
      <AbsoluteFill>
        <At x={-agentX} y={agentY}>
          <Agent u={u} nameSize={nameSize} appear={leftIn} name={copy.sealed.left} icon={<TreasuryIcon size={78 * u} color={colors.text} />} />
        </At>
        <At x={agentX} y={agentY}>
          <Agent u={u} nameSize={nameSize} appear={rightIn} name={copy.sealed.right} icon={<MakerIcon size={78 * u} color={colors.text} />} />
        </At>

        <At x={l.x} y={l.y} style={{ opacity: emerge }} transform={`scale(${interpolate(emerge, [0, 1], [0.6, 1])})`}>
          <SealedCard u={u} text={copy.sealed.leftOrder} seal={seal} frame={frame} seed={1} width={dock.cardW} label={copy.sealed.sealedLabel} />
        </At>
        <At x={r.x} y={r.y} style={{ opacity: emerge }} transform={`scale(${interpolate(emerge, [0, 1], [0.6, 1])})`}>
          <SealedCard u={u} text={copy.sealed.rightOrder} seal={seal} frame={frame} seed={2} width={dock.cardW} label={copy.sealed.sealedLabel} />
        </At>

        <Headline text={copy.sealed.headline} delay={92} y={isSquare ? 0.86 : 0.84} accentWord={{ index: 2, color: colors.violet }} />
      </AbsoluteFill>
    </Scene>
  );
};
