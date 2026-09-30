import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Background } from '../walkthrough/components/Background';
import { ACTS, BEAT, CUE } from './beats';
import { HOOK_AUDIO_PLAN } from './audio-plan';
import { Flash, shake } from './fx';
import { EndCard } from './scenes/EndCard';
import { Leak } from './scenes/Leak';
import { Pillars } from './scenes/Pillars';
import { Reveal } from './scenes/Reveal';
import { Signal } from './scenes/Signal';
import { Turn } from './scenes/Turn';

const SCENES: [keyof typeof ACTS, React.FC][] = [
  ['leak', Leak],
  ['signal', Signal],
  ['turn', Turn],
  ['reveal', Reveal],
  ['pillars', Pillars],
  ['end', EndCard],
];

/**
 * A 16-second, beat-locked hook to open a demo-day pitch, before the slides. Six acts cut hard on
 * the beat (src/hook/beats.ts): the leak → the signal → the turn → the drop → what it does → title.
 *
 * `audio: false` renders silent frames; scripts/render-walkthrough.ts mixes HOOK_AUDIO_PLAN itself.
 */
export const DemoHook: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const frame = useCurrentFrame();
  const { x, y, r } = shake(frame);
  // coral while the order leaks, back to the brand palette once it's sealed
  const danger = interpolate(frame, [CUE.whatIf, CUE.lock], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // the backdrop pumps on every kick after the drop
  const sinceBeat = (frame - CUE.drop) % BEAT;
  const pump = frame >= CUE.drop && frame < CUE.end ? 1 + 0.5 * Math.exp(-sinceBeat / 4) : 1;
  // cut to black after the glitch, then the room fades back up for the turn
  const bg = frame < CUE.blackout ? 1 : interpolate(frame, [CUE.whatIf, CUE.whatIf + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const preDrop = interpolate(frame, [CUE.drop - 8, CUE.drop], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {bg > 0 && (
        <AbsoluteFill style={{ opacity: bg }}>
          <Background danger={danger} energy={pump} />
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg)` }}>
        {SCENES.map(([id, Scene]) => {
          const [from, to] = ACTS[id];
          return frame >= from && frame < to ? <Scene key={id} /> : null;
        })}
      </AbsoluteFill>

      {/* white-out into the drop, then flashes on the big hits */}
      {preDrop > 0 && frame < CUE.drop && <AbsoluteFill style={{ background: '#fff', opacity: preDrop * preDrop }} />}
      <Flash at={CUE.drop} dur={16} peak={0.95} />
      <Flash at={CUE.frontRun} dur={6} peak={0.25} color={'#ff6b81'} />
      <Flash at={CUE.sandwich} dur={6} peak={0.25} color={'#ff6b81'} />
      <Flash at={CUE.zero} dur={8} peak={0.3} color={'#c2f73a'} />
      <Flash at={CUE.end} dur={12} peak={0.45} />

      {audio &&
        HOOK_AUDIO_PLAN.map((c, i) => (
          <Sequence key={i} from={c.from} durationInFrames={c.frames} name={c.label} layout="none">
            <Audio src={staticFile(c.src)} volume={c.volume} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
