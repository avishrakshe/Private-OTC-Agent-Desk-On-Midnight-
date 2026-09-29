import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BrandMark, IconBrain, IconChip, IconLock } from '../components/icons';
import { Chip, PopIn } from '../components/ui';
import { cueOf, sceneById } from '../timeline';
import { C, F, appear, pop } from '../theme';

const cue = cueOf('outro');

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { duration } = sceneById('outro');
  const tStart = cue('private');
  const tSealed = cue('sealed');
  const tZk = cue('zero-knowledge');
  const tAgents = cue('agents');
  const tTry = cue('try');
  const logo = pop(frame, tStart - 6, 30, 13);
  const url = pop(frame, tTry - 2, 30, 11);
  const out = appear(frame, duration - 36, 30);

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, rgba(155,138,255,${0.16 * logo}) 0%, rgba(194,247,58,${0.06 * logo}) 30%, transparent 60%)`,
        }}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ transform: `scale(${0.4 + 0.6 * logo})`, opacity: appear(frame, tStart - 6, 8) }}>
          <BrandMark size={150} glow={26 + 8 * Math.sin(frame / 10)} />
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 104,
            letterSpacing: '-0.04em',
            color: C.text,
            opacity: appear(frame, tStart, 16),
            transform: `translateY(${(1 - appear(frame, tStart, 20)) * 30}px)`,
          }}
        >
          Private OTC Agent Desk
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', gap: 20 }}>
        {[
          { at: tSealed, icon: <IconLock size={26} />, label: 'Sealed quotes', tone: 'violet' as const },
          { at: tZk, icon: <IconChip size={26} />, label: 'Zero-knowledge matches', tone: 'cyan' as const },
          { at: tAgents, icon: <IconBrain size={26} />, label: 'Agents bound by mandates', tone: 'lime' as const },
        ].map((p) => (
          <PopIn key={p.label} start={p.at - 3}>
            <Chip tone={p.tone} size={28}>
              {p.icon}
              {p.label}
            </Chip>
          </PopIn>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            opacity: appear(frame, tTry - 2, 8),
            transform: `scale(${0.6 + 0.4 * url})`,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '26px 46px',
            borderRadius: 999,
            background: C.lime,
            color: '#0b1000',
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 60,
            letterSpacing: '-0.03em',
            boxShadow: `0 0 ${90 + 30 * Math.sin(frame / 7)}px rgba(194,247,58,0.5)`,
          }}
        >
          mn-demo.vercel.app
          <span style={{ fontSize: 54, transform: `translateX(${Math.sin(frame / 6) * 6}px)` }}>→</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 830,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          fontFamily: F.mono,
          fontSize: 22,
          color: C.text2,
          opacity: appear(frame, tTry + 16, 16),
        }}
      >
        <span>github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-</span>
        <span style={{ color: C.text3 }}>·</span>
        <span>@DefiAipy</span>
        <span style={{ color: C.text3 }}>·</span>
        <span>
          Built on <span style={{ color: C.lime }}>Midnight</span>
        </span>
      </div>

    </AbsoluteFill>
  );
};
