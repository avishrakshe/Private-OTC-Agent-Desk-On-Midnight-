import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { At, Scene } from '../components/Scene';
import { CheckIcon } from '../components/Icons';
import { SealedCard } from '../components/SealedCard';
import { springAt } from '../lib/motion';
import { useLayout } from '../lib/layout';
import { useCardDock } from './SealedBids';
import { copy } from '../copy';
import { colors, fonts, timing } from '../theme';

/** 17–21s: circuit traces connect the sealed orders; each constraint checks off in cyan. */
export const ZkProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, width, height, isSquare } = useLayout();
  const dock = useCardDock();

  const chipY = (isSquare ? -40 : -70) * u;
  const trace = springAt(frame, fps, 4, 'slow');
  const checks = copy.proof.checks;
  // Four checks, then everything turns cyan with ~1.5s of "verified" before the scene exits.
  const checkStart = 20;
  const checkStep = 11;
  const done = springAt(frame, fps, checkStart + checks.length * checkStep, 'soft');

  const cx = width / 2;
  const cy = height / 2;
  // Card bottoms → chip, drawn as right-angled circuit traces.
  const cardBottom = (x: number, y: number) => ({ x: cx + x, y: cy + y + 48 * u });
  const a = cardBottom(dock.leftX, dock.leftY);
  const b = cardBottom(dock.rightX, dock.rightY);
  const chip = { x: cx, y: cy + chipY - 50 * u };
  const midY = (Math.max(a.y, b.y) + chip.y) / 2;
  const paths = isSquare
    ? [
        `M ${a.x - 150 * u} ${a.y - 60 * u} H ${a.x - 230 * u} V ${chip.y + 20 * u} H ${chip.x - 60 * u}`,
        `M ${b.x + 150 * u} ${b.y - 60 * u} H ${b.x + 230 * u} V ${chip.y + 20 * u} H ${chip.x + 60 * u}`,
      ]
    : [`M ${a.x} ${a.y} V ${midY} H ${chip.x - 30 * u} V ${chip.y}`, `M ${b.x} ${b.y} V ${midY} H ${chip.x + 30 * u} V ${chip.y}`];

  const cols = isSquare ? 1 : 2;
  const rowH = (isSquare ? 62 : 74) * u;
  const listTop = chipY + (isSquare ? 120 : 150) * u;

  return (
    <Scene duration={timing.proof}>
      <AbsoluteFill>
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <filter id="traceGlow">
              <feGaussianBlur stdDeviation={4 * u} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {paths.map((d, i) => (
            <g key={i} filter="url(#traceGlow)">
              <path d={d} stroke={colors.violet} strokeOpacity={0.25} strokeWidth={2 * u} fill="none" />
              <path
                d={d}
                pathLength={1}
                stroke={done > 0.5 ? colors.cyan : colors.violet}
                strokeWidth={3 * u}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="1"
                strokeDashoffset={1 - trace}
              />
              {/* Data pulse running along the trace */}
              <path
                d={d}
                pathLength={1}
                stroke={colors.cyan}
                strokeWidth={5 * u}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0.06 0.94"
                strokeDashoffset={-((frame / 40) % 1)}
                opacity={trace > 0.9 ? 0.9 : 0}
              />
            </g>
          ))}
        </svg>

        <At x={dock.leftX} y={dock.leftY}>
          <SealedCard u={u} text={copy.sealed.leftOrder} seal={1} frame={frame} seed={1} width={dock.cardW} label={copy.sealed.sealedLabel} />
        </At>
        <At x={dock.rightX} y={dock.rightY}>
          <SealedCard u={u} text={copy.sealed.rightOrder} seal={1} frame={frame} seed={2} width={dock.cardW} label={copy.sealed.sealedLabel} />
        </At>

        {/* The proof "chip" */}
        <At y={chipY}>
          <div
            style={{
              padding: `${16 * u}px ${30 * u}px`,
              borderRadius: 16 * u,
              border: `${1.5 * u}px solid ${done > 0.5 ? colors.cyan : colors.violet}`,
              background: done > 0.5 ? colors.cyanSoft : colors.violetSoft,
              boxShadow: `0 0 ${(30 + 50 * done) * u}px ${done > 0.5 ? colors.cyan : colors.violet}66`,
              fontFamily: fonts.mono,
              fontWeight: 700,
              fontSize: 24 * u,
              letterSpacing: '0.2em',
              color: colors.text,
              opacity: springAt(frame, fps, 14, 'soft'),
              whiteSpace: 'nowrap',
            }}
          >
            π {copy.proof.title}
          </div>
        </At>

        {checks.map((label, i) => {
          const p = springAt(frame, fps, checkStart + i * checkStep, 'bouncy');
          const col = i % cols;
          const row = Math.floor(i / cols);
          const colW = (isSquare ? 0 : 520) * u;
          const x = cols === 1 ? 0 : (col - 0.5) * colW;
          const y = listTop + row * rowH;
          return (
            <At key={label} x={x} y={y} style={{ opacity: p }} transform={`translateX(${interpolate(p, [0, 1], [-30 * u, 0])}px)`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 * u, width: (isSquare ? 560 : 450) * u }}>
                <CheckIcon size={44 * u} color={colors.cyan} style={{ transform: `scale(${p})`, filter: `drop-shadow(0 0 ${12 * u}px ${colors.cyan})` }} />
                <span style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 32 * u, color: colors.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: fonts.mono, fontSize: 22 * u, color: colors.textDim, letterSpacing: '0.1em' }}>
                  {copy.proof.hidden}
                </span>
              </div>
            </At>
          );
        })}
      </AbsoluteFill>
    </Scene>
  );
};
