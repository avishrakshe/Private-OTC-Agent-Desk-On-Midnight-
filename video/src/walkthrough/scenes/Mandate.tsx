import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Browser, Cursor, Shot, Spot, use3DEntrance } from '../components/Browser';
import { Kinetic, Stamp } from '../components/ui';
import { cueOf } from '../timeline';
import { appear } from '../theme';

const cue = cueOf('mandate');
const CHECKBOX = { x: 662, y: 592 };

export const Mandate: React.FC = () => {
  const frame = useCurrentFrame();
  const tCan = cue('can');
  const tOwner = cue('owner');
  const tFlip = cue('flip');
  const tCompromised = cue('compromised');
  const tRefuses = cue('refuses');
  const tNo = cue('no');
  const tBlocked = cue('blocked');
  const click = tCompromised + 4;

  const enter = use3DEntrance(0);
  const scrim = appear(frame, tCan - 6, 12) * (1 - appear(frame, tOwner - 12, 14));
  const shake = frame >= tRefuses && frame < tRefuses + 12 ? Math.sin(frame * 2.4) * (12 - (frame - tRefuses)) * 0.8 : 0;
  const W = 1400;
  const H = 752;

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 260 + shake, top: 120, perspective: 1800 }}>
        <div style={{ ...enter, transformOrigin: '50% 100%' }}>
          <Browser url="mn-demo.vercel.app/#mandate" width={W} height={H} glow={frame >= tRefuses ? 'coral' : 'violet'}>
            <Shot
              width={W}
              height={H}
              layers={[
                { src: 'mandate-ok.png', w: 1728, h: 929 },
                { src: 'mandate-blocked.png', w: 1728, h: 929, from: click + 2 },
              ]}
              keys={[
                { at: 0, rect: [0, 0, 1728, 929] },
                { at: tOwner - 8, rect: [20, 240, 1120, 660], dur: 26 },
                { at: tFlip - 10, rect: [470, 240, 1120, 660], dur: 26 },
                { at: tRefuses - 12, rect: [820, 240, 900, 660], dur: 22 },
              ]}
              overlay={(s) => (
                <>
                  <Spot rect={[73, 641, 472, 214]} at={tOwner} until={tFlip - 8} s={s} tone="violet" dim={0.35} />
                  <Spot rect={[628, 560, 472, 133]} at={tFlip} until={click + 14} s={s} tone="coral" dim={0.3} />
                  <Spot rect={[1183, 611, 472, 160]} at={tRefuses} s={s} tone="coral" dim={0.4} />
                  <Cursor
                    s={s}
                    appearAt={tFlip - 6}
                    path={[
                      { at: tFlip - 6, x: 980, y: 820 },
                      { at: click - 2, x: CHECKBOX.x, y: CHECKBOX.y },
                      { at: click + 30, x: 900, y: 760 },
                    ]}
                    clicks={[click]}
                  />
                </>
              )}
            />
          </Browser>
        </div>
      </div>

      {/* the question */}
      <AbsoluteFill style={{ background: `rgba(5,5,7,${0.78 * scrim})` }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: scrim }}>
        <Kinetic text={'Can I let an AI trade\nmy *treasury?*'} start={tCan - 4} size={104} accent={`linear-gradient(90deg, #c2f73a, #9b8aff)`} />
      </AbsoluteFill>

      <div style={{ position: 'absolute', left: 330, top: 600 }}>
        <Stamp start={tNo - 2} size={50} rotate={-6}>
          No valid proof
        </Stamp>
      </div>
      <div style={{ position: 'absolute', left: 520, top: 720 }}>
        <Stamp start={tBlocked - 4} size={50} rotate={3}>
          Order blocked
        </Stamp>
      </div>

    </AbsoluteFill>
  );
};
