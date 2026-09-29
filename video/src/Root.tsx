import React from 'react';
import { Composition } from 'remotion';
import { Intro } from './Intro';
import { timing, video } from './theme';

const total = Object.values(timing).reduce((a, b) => a + b, 0);
if (total !== video.durationInFrames) {
  throw new Error(`Scene timings add up to ${total} frames, expected ${video.durationInFrames}. Fix src/theme.ts.`);
}

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Intro"
      component={Intro}
      durationInFrames={video.durationInFrames}
      fps={video.fps}
      width={video.landscape.width}
      height={video.landscape.height}
    />
    <Composition
      id="IntroSquare"
      component={Intro}
      durationInFrames={video.durationInFrames}
      fps={video.fps}
      width={video.square.width}
      height={video.square.height}
    />
  </>
);
