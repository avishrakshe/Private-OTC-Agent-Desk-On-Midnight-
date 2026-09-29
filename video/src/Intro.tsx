import React from 'react';
import { AbsoluteFill, Audio, Series, staticFile } from 'remotion';
import { Background } from './components/Background';
import { Problem } from './scenes/Problem';
import { MevAttack } from './scenes/MevAttack';
import { Darkness } from './scenes/Darkness';
import { SealedBids } from './scenes/SealedBids';
import { ZkProof } from './scenes/ZkProof';
import { Settlement } from './scenes/Settlement';
import { LogoCta } from './scenes/LogoCta';
import { timing, video } from './theme';

/** The whole film. Shared by the landscape and square compositions; scenes adapt to the frame size. */
export const Intro: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Series>
      <Series.Sequence durationInFrames={timing.problem}>
        <Problem />
      </Series.Sequence>
      <Series.Sequence durationInFrames={timing.mev}>
        <MevAttack />
      </Series.Sequence>
      <Series.Sequence durationInFrames={timing.darkness}>
        <Darkness />
      </Series.Sequence>
      <Series.Sequence durationInFrames={timing.sealed}>
        <SealedBids />
      </Series.Sequence>
      <Series.Sequence durationInFrames={timing.proof}>
        <ZkProof />
      </Series.Sequence>
      <Series.Sequence durationInFrames={timing.settle}>
        <Settlement />
      </Series.Sequence>
      <Series.Sequence durationInFrames={timing.logo}>
        <LogoCta />
      </Series.Sequence>
    </Series>
    {/* Audio slot: drop a track at public/music.mp3 and set video.music = true in theme.ts. */}
    {video.music && <Audio src={staticFile('music.mp3')} volume={video.musicVolume} />}
  </AbsoluteFill>
);
