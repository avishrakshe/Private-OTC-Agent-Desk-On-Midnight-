import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { At, Scene } from '../components/Scene';
import { Headline } from '../components/Headline';
import { OrderCard } from '../components/OrderCard';
import { BotIcon } from '../components/Icons';
import { rand, springAt } from '../lib/motion';
import { useLayout } from '../lib/layout';
import { copy } from '../copy';
import { colors, fonts, timing } from '../theme';

const BOTS = 7;

/** 0–4s: an order drops into the public mempool and bots swarm it. */
export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, spread, isSquare, width, height } = useLayout();

  const pipeW = 1500 * spread * u;
  const pipeH = 230 * u;
  const pipeIn = springAt(frame, fps, 0, 'soft');
  const drop = springAt(frame, fps, 8, 'bouncy');
  const swarm = springAt(frame, fps, 30, 'slow');
  const cardY = interpolate(drop, [0, 1], [-560 * u, 0]);

  return (
    <Scene duration={timing.problem}>
      <AbsoluteFill>
        {/* Transparent mempool pipe with other transactions streaming through */}
        <At y={0}>
          <div
            style={{
              width: pipeW,
              height: pipeH,
              borderRadius: pipeH / 2,
              border: `${1.5 * u}px solid rgba(244,244,250,${0.22 * pipeIn})`,
              background: `linear-gradient(180deg, rgba(255,255,255,${0.05 * pipeIn}), rgba(255,255,255,0.01))`,
              boxShadow: `inset 0 0 ${60 * u}px rgba(255,255,255,0.04)`,
              position: 'relative',
              overflow: 'hidden',
              opacity: pipeIn,
              transform: `scaleX(${interpolate(pipeIn, [0, 1], [0.6, 1])})`,
            }}
          >
            {Array.from({ length: 16 }, (_, i) => {
              const speed = 4 + rand(i) * 5;
              const x = ((rand(i + 50) * pipeW + frame * speed * u) % (pipeW + 200 * u)) - 100 * u;
              const y = (0.2 + rand(i + 99) * 0.6) * pipeH;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: (40 + rand(i + 7) * 60) * u,
                    height: 6 * u,
                    borderRadius: 3 * u,
                    background: 'rgba(244,244,250,0.18)',
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              position: 'absolute',
              left: pipeH / 2,
              // In the square the bot orbit is taller than the pipe, so the label sits above it.
              top: isSquare ? -150 * u : -44 * u,
              fontFamily: fonts.mono,
              fontSize: 22 * u,
              letterSpacing: '0.2em',
              color: colors.textDim,
              opacity: pipeIn,
            }}
          >
            {copy.problem.pipe} · VISIBLE TO EVERYONE
          </div>
        </At>

        {/* Bots circling the order, reading it */}
        {Array.from({ length: BOTS }, (_, i) => {
          const angle = (i / BOTS) * Math.PI * 2 + frame * 0.025 + rand(i) * 0.4;
          const radius = interpolate(swarm, [0, 1], [900, isSquare ? 260 : 330]) * u;
          const x = Math.cos(angle) * radius * (isSquare ? 1 : 1.25);
          const y = Math.sin(angle) * radius * 0.62;
          const appear = springAt(frame, fps, 26 + i * 3, 'snappy');
          return (
            <React.Fragment key={i}>
              <svg
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0.55 * appear }}
              >
                <line
                  x1={width / 2}
                  y1={height / 2 + cardY}
                  x2={width / 2 + x}
                  y2={height / 2 + y}
                  stroke={colors.red}
                  strokeWidth={1.5 * u}
                  strokeDasharray={`${6 * u} ${8 * u}`}
                  strokeDashoffset={-frame * 2}
                />
              </svg>
              <At x={x} y={y} style={{ opacity: appear, filter: `drop-shadow(0 0 ${14 * u}px ${colors.red})` }}>
                <BotIcon size={62 * u} color={colors.red} />
              </At>
            </React.Fragment>
          );
        })}

        {/* The order */}
        <At y={cardY}>
          <OrderCard
            u={u}
            title={copy.problem.order}
            sub={copy.problem.orderSub}
            accent={colors.violet}
            width={isSquare ? 500 : 540}
            glow={1.2}
          />
        </At>

        <Headline text={copy.problem.headline} delay={46} y={isSquare ? 0.82 : 0.84} accentWord={{ index: 2, color: colors.red }} />
      </AbsoluteFill>
    </Scene>
  );
};
