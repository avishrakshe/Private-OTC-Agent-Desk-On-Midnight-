import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Browser, Shot, type CamKey } from '../components/Browser';
import { Chip } from '../components/ui';
import { cueOf } from '../timeline';
import { appear } from '../theme';

const cue = cueOf('about');
const W = 1100;
const H = 640;

export const About: React.FC = () => {
  const frame = useCurrentFrame();
  const at = [0, cue('public') - 8, cue('match') - 8, cue('who') - 8];

  const cards: { src: string; w: number; h: number; label: string; keys: CamKey[] }[] = [
    { src: 'about-hero.png', w: 2160, h: 1350, label: 'Every public order is a free signal', keys: [{ at: 0, rect: [0, 0, 2160, 1350] }, { at: 10, rect: [120, 120, 1500, 877], dur: 90 }] },
    { src: 'about-lanes.png', w: 1728, h: 777, label: 'Public mempool vs private desk', keys: [{ at: 0, rect: [0, 0, 1320, 772] }, { at: 40, rect: [408, 0, 1320, 772], dur: 120 }] },
    { src: 'about-circuit.png', w: 2160, h: 1428, label: 'The match proof, in one circuit', keys: [{ at: 0, rect: [150, 80, 1900, 1111] }, { at: 20, rect: [180, 480, 1260, 737], dur: 70 }] },
    { src: 'about-matrix.png', w: 2160, h: 935, label: 'Who sees what', keys: [{ at: 0, rect: [150, 40, 1560, 912] }, { at: 20, rect: [430, 60, 1560, 912], dur: 90 }] },
  ];

  const p = at.slice(1).reduce((acc, t) => acc + appear(frame, t, 26), 0);
  const current = Math.round(p);

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: (1920 - W) / 2, top: 150, perspective: 2000 }}>
        {cards.map((c, i) => {
          const d = i - p;
          if (Math.abs(d) > 1.6) return null;
          const enterO = i === 0 ? appear(frame, 0, 16) : 1;
          return (
            <div
              key={c.src}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                transform: `translateX(${d * 1000}px) translateZ(${-Math.abs(d) * 560}px) rotateY(${-d * 34}deg)`,
                opacity: Math.max(0, 1 - Math.abs(d) * 0.6) * enterO,
                zIndex: 10 - Math.round(Math.abs(d) * 4),
              }}
            >
              {/* each window's camera runs on its own clock, from when it arrives */}
              <Sequence from={at[i]} layout="none">
                <Browser url={`mn-demo.vercel.app/#/about`} width={W} height={H} glow={i === current ? 'violet' : undefined}>
                  <Shot width={W} height={H} layers={[{ src: c.src, w: c.w, h: c.h }]} keys={c.keys} drift={0.006} />
                </Browser>
              </Sequence>
              {frame < at[i] && (
                <Browser url={`mn-demo.vercel.app/#/about`} width={W} height={H}>
                  <Shot width={W} height={H} layers={[{ src: c.src, w: c.w, h: c.h }]} keys={c.keys.slice(0, 1)} drift={0} />
                </Browser>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 872, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {cards.map((c, i) => {
          const on = i === current;
          return (
            <div key={c.label} style={{ opacity: on ? 1 : 0.4, transform: `scale(${on ? 1 : 0.92})` }}>
              <Chip tone={on ? 'lime' : 'neutral'} size={20} dot={on}>
                {c.label}
              </Chip>
            </div>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
