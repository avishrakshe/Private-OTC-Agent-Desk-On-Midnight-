# Intro video · Private OTC Agent Desk

A 30-second motion-graphics intro built with [Remotion](https://www.remotion.dev) (React + TypeScript).
*"Trade in the dark. Settle in the light."*

| Output | Format | Size |
|---|---|---|
| `out/intro.mp4` | 1920×1080 · 30 fps · 900 frames · H.264 | ~2.9 MB |
| `out/intro.webm` | 1920×1080 · VP9, no audio (for the site's hero background) | ~1.5 MB |
| `out/intro-square.mp4` | 1080×1080 · H.264 (social) | ~2.2 MB |
| `out/poster.png` | last frame (logo + CTA), for `<video poster>` | — |

## Storyboard

| Time | Scene (`src/scenes/`) | What happens |
|---|---|---|
| 0–4s | `Problem.tsx` | An order card drops into the public mempool; red bots swarm it. *Every trade leaks.* |
| 4–8s | `MevAttack.tsx` | Front-run and back-run bars squeeze the order; slippage ticks up in red. |
| 8–12s | `Darkness.tsx` | Lights go down; particles assemble a violet shield and lock. *Now trade in the dark.* |
| 12–17s | `SealedBids.tsx` | Treasury and Market Maker agents send orders that encrypt in flight and meet in the centre. |
| 17–21s | `ZkProof.tsx` | Circuit traces connect them; four constraints check off in cyan, with values shown as ●●●●. |
| 21–25s | `Settlement.tsx` | Cards merge into a receipt hash that stamps onto a Midnight block. *Zero alpha leaked.* |
| 25–30s | `LogoCta.tsx` | Grid lines frame the name, tagline and **Launch App →**. The last 2s+ are still (the poster). |

## Commands

```bash
npm install
npm run studio            # live preview: Remotion Studio
npm run stills -- Intro 60 450 899   # quick PNG checks of specific frames → out/check/
npm run render            # MP4 + WebM + square + poster, using Remotion's bundled ffmpeg
```

### Windows: "FFmpeg quit with code 3236495362"

Windows 11 **Smart App Control** blocks Remotion's unsigned `ffmpeg.exe`, so `npm run render` fails at the encoding step even though every frame renders. Use the safe path instead. It renders JPEG frames with Remotion, then encodes them with a local `ffmpeg` if one runs, otherwise with Docker:

```bash
# one-time: a small Docker image with a signed-distro ffmpeg
docker build -t ffmpeg-env - <<'EOF'
FROM ubuntu:24.04
RUN apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["ffmpeg"]
EOF

npm run render:safe       # frames → encode (MP4, WebM, square) → poster
```

Size targets: MP4 < 8 MB, WebM < 5 MB. To trade size for quality, change the CRF (the last argument) in the `encode` / `render:*` scripts. Lower means better quality and a bigger file.

## Editing

| To change… | Edit |
|---|---|
| Any on-screen text | `src/copy.ts` (keep lines to about 6 words) |
| Colours, fonts | `src/theme.ts` → `colors`, `fonts` |
| Scene lengths | `src/theme.ts` → `timing` (must total 900 frames; the Root checks) |
| Spring feel | `src/theme.ts` → `springs` |
| Background grid / grain | `src/components/Background.tsx` |

Both formats share the same scenes. `src/lib/layout.ts` switches spacing for the square version, so check both after layout changes (`npm run stills -- IntroSquare 60 450 899`).

### Adding music

Put a track at `public/music.mp3` and set `video.music = true` in `src/theme.ts` (volume: `video.musicVolume`). `npm run render` mixes it into the MP4s. The `encode` path picks up `public/music.mp3` automatically for the MP4s. The WebM stays silent, since it's a hero background.

## Using it on the site

```html
<video autoplay muted loop playsinline poster="/intro/poster.png">
  <source src="/intro/intro.webm" type="video/webm" />
  <source src="/intro/intro.mp4" type="video/mp4" />
</video>
```
