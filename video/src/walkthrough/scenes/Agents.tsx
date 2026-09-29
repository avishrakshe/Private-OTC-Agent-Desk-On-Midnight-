import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Browser, Cursor, Shot, Spot, use3DEntrance, type Rect } from '../components/Browser';
import { IconX } from '../components/icons';
import { Chip, Enter, Eyebrow, Glass, PopIn } from '../components/ui';
import { cueOf } from '../timeline';
import { C, F } from '../theme';

const cue = cueOf('agents');

const RUN_BTN = { x: 771, y: 876 };
const TREASURY: Rect = [259, 950, 317, 192];
const MAKERS: Rect = [591, 950, 977, 192];
const DETAIL: Rect = [975, 1222, 910, 150];
const NO_FUNDS: Rect = [272, 1252, 655, 70];

export const Agents: React.FC = () => {
  const frame = useCurrentFrame();
  const tWatch = cue('watch');
  const tTreasury = cue('treasury');
  const tSlices = cue('slices');
  const tMakers = cue('three', 2);
  const tAlong = cue('along');
  const tFat = cue('fat-finger');
  const tMandate = cue('mandate');
  const tFund = cue('fund');
  const click = tWatch + 16;

  const enter = use3DEntrance(0, { rx: 18, y: 180, s: 0.88 });
  const W = 1180;
  const H = 770;

  const blocked = [
    { at: tFat, title: 'Fat-finger $0.8842', why: 'outside the ±3% oracle band', agent: 'Arcadia Flow' },
    { at: tMandate, title: 'Bid $0.905', why: 'above its mandate ceiling', agent: 'Arcadia Flow' },
    { at: tFund, title: 'Unfunded quote', why: 'proof of funds fails', agent: 'Northwind MM' },
  ];

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 100, top: 130, perspective: 1800 }}>
        <div style={{ ...enter, transformOrigin: '50% 100%' }}>
          <Browser url="mn-demo.vercel.app/#agents" width={W} height={H} glow="violet">
            <Shot
              width={W}
              height={H}
              layers={[
                { src: 'agents-idle.png', w: 2160, h: 1761 },
                { src: 'agents-running.png', w: 2160, h: 2382, from: click + 3 },
                { src: 'agents-rejected.png', w: 2160, h: 2636, from: tAlong - 6 },
              ]}
              keys={[
                { at: 0, rect: [216, 560, 1728, 1120] },
                { at: tWatch - 6, rect: [300, 700, 1300, 840], dur: 22 },
                { at: tTreasury - 8, rect: [230, 860, 1000, 650], dur: 24 },
                { at: tMakers - 8, rect: [560, 820, 1060, 690], dur: 24 },
                { at: tAlong - 6, rect: [860, 1080, 1100, 720], dur: 26 },
                { at: tFund - 6, rect: [220, 1040, 1720, 1115], dur: 26 },
              ]}
              overlay={(s) => (
                <>
                  <Spot rect={[RUN_BTN.x - 88, RUN_BTN.y - 30, 176, 60]} at={tWatch - 2} until={click + 10} s={s} tone="lime" dim={0.25} radius={30} />
                  <Spot rect={TREASURY} at={tTreasury} until={tMakers - 8} s={s} tone="lime" dim={0.4} />
                  <Spot rect={MAKERS} at={tMakers} until={tAlong - 8} s={s} tone="cyan" dim={0.4} />
                  <Spot rect={DETAIL} at={tFat} until={tFund - 6} s={s} tone="coral" dim={0.4} />
                  <Spot rect={NO_FUNDS} at={tFund + 10} s={s} tone="coral" dim={0.35} radius={14} />
                  <Cursor
                    s={s}
                    appearAt={4}
                    path={[
                      { at: 4, x: 1250, y: 1300 },
                      { at: tWatch + 10, x: RUN_BTN.x + 10, y: RUN_BTN.y + 6 },
                      { at: tWatch + 40, x: 1400, y: 1060 },
                    ]}
                    clicks={[click]}
                  />
                </>
              )}
            />
          </Browser>
        </div>
      </div>

      {/* right column */}
      <div style={{ position: 'absolute', left: 1340, top: 150, width: 480 }}>
        <Enter start={tTreasury - 6} dx={40} dy={0}>
          <Glass style={{ padding: '24px 26px' }} tone="violet" glow={0.3}>
            <Eyebrow color={C.violet}>Treasury Seller</Eyebrow>
            <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 46, color: C.text, marginTop: 8, letterSpacing: '-0.02em' }}>
              Sells 1,800,000 DAO
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {['Slice 1', 'Slice 2', 'Slice 3'].map((sl, i) => (
                <PopIn key={sl} start={tSlices - 4 + i * 4}>
                  <Chip tone="violet" size={20} mono>
                    {sl}
                  </Chip>
                </PopIn>
              ))}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 21, color: C.text2, marginTop: 16, opacity: tMakers <= frame ? 1 : 0.0 }}>
              3 makers answer with <span style={{ color: C.cyan }}>sealed, escrowed</span> quotes
            </div>
          </Glass>
        </Enter>

        <div style={{ marginTop: 26, display: 'grid', gap: 14 }}>
          {blocked.map((b) => (
            <PopIn key={b.title} start={b.at - 3} from={0.85}>
              <Glass style={{ padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'center' }} tone="coral" glow={0.5}>
                <span style={{ width: 48, height: 48, flex: 'none', borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(255,107,129,0.15)' }}>
                  <IconX size={28} color={C.coral} stroke={2.6} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.text }}>{b.title}</span>
                    <span style={{ fontFamily: F.mono, fontSize: 15, color: C.text3 }}>{b.agent}</span>
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: 20, color: C.coral, marginTop: 2 }}>{b.why}</div>
                </div>
              </Glass>
            </PopIn>
          ))}
          <div style={{ opacity: frame > tFund + 12 ? 1 : 0, marginTop: 4 }}>
            <Chip tone="coral" size={20} mono>
              no proof → no transaction
            </Chip>
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};
