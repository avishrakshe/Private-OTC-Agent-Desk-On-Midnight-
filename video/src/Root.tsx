import React from 'react';
import { Composition } from 'remotion';
import { Intro } from './Intro';
import { timing, video } from './theme';
import { Walkthrough } from './walkthrough/Walkthrough';
import { TOTAL_FRAMES as WALKTHROUGH_FRAMES } from './walkthrough/timeline';

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
    {/* ~3-minute narrated site walkthrough (src/walkthrough) */}
    <Composition
      id="Walkthrough"
      component={Walkthrough}
      durationInFrames={WALKTHROUGH_FRAMES}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ captions: true }}
    />
    <Composition
      id="WalkthroughClean"
      component={Walkthrough}
      durationInFrames={WALKTHROUGH_FRAMES}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ captions: false }}
    />
  </>
);
