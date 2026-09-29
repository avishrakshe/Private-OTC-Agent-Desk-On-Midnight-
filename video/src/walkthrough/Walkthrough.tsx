import { TransitionSeries, linearTiming } from '@remotion/transitions';
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { AUDIO_PLAN } from './audio-plan';
import { Background } from './components/Background';
import { Captions, ChapterBar, zoomBlur } from './components/Overlays';
import type { SceneId } from './script';
import { About } from './scenes/About';
import { Agents } from './scenes/Agents';
import { Brand } from './scenes/Brand';
import { Features } from './scenes/Features';
import { Guarantees } from './scenes/Guarantees';
import { Hook } from './scenes/Hook';
import { How } from './scenes/How';
import { Layers } from './scenes/Layers';
import { Live } from './scenes/Live';
import { Mandate } from './scenes/Mandate';
import { Outro } from './scenes/Outro';
import { Problem } from './scenes/Problem';
import { Result } from './scenes/Result';
import { TIMELINE, TOTAL_FRAMES, TRANSITION, sceneById } from './timeline';

const SCENES: Record<SceneId, React.FC> = {
  hook: Hook,
  problem: Problem,
  brand: Brand,
  how: How,
  layers: Layers,
  features: Features,
  agents: Agents,
  result: Result,
  mandate: Mandate,
  guarantees: Guarantees,
  live: Live,
  about: About,
  outro: Outro,
};

/**
 * `audio: false` renders silent frames; scripts/render-walkthrough.ts then mixes AUDIO_PLAN itself
 * (Remotion's own mixing needs ffmpeg/ffprobe, which Windows Smart App Control blocks here).
 */
export const Walkthrough: React.FC<{ captions: boolean; audio?: boolean }> = ({ captions, audio = true }) => {
  const frame = useCurrentFrame();
  const problemEnd = sceneById('brand').from;
  const danger = interpolate(frame, [problemEnd - 4, problemEnd + 24], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Background danger={danger} />

      <TransitionSeries>
        {TIMELINE.map((t, i) => {
          const Scene = SCENES[t.id];
          return (
            <React.Fragment key={t.id}>
              <TransitionSeries.Sequence durationInFrames={t.duration} name={t.id}>
                <Scene />
              </TransitionSeries.Sequence>
              {i < TIMELINE.length - 1 && (
                <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({ durationInFrames: TRANSITION })} />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {/* narration, ducked music and effects (src/walkthrough/audio-plan.ts) */}
      {audio &&
        AUDIO_PLAN.map((c, i) => (
          <Sequence key={i} from={c.from} durationInFrames={c.frames} name={c.label} layout="none">
            <Audio src={staticFile(c.src)} volume={c.volume} />
          </Sequence>
        ))}

      <ChapterBar total={TOTAL_FRAMES} />
      {captions && <Captions />}
    </AbsoluteFill>
  );
};
