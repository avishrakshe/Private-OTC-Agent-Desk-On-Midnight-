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

---

# Walkthrough video · narrated site tour

A ~3 min 16 s product walkthrough with an AI voice-over, word-timed captions, a music bed and sound design. It explains the problem, the protocol, and then tours the real site (Desk and About pages) using screenshots captured from [mn-demo.vercel.app](https://mn-demo.vercel.app). Source: `src/walkthrough/`. Compositions: `Walkthrough` (with captions) and `WalkthroughClean` (no captions).

| Output | Format |
|---|---|
| `out/walkthrough.mp4` | 1920×1080 · 30 fps · H.264 + AAC, captions burned in |
| `out/walkthrough-no-captions.mp4` | same, without captions (`npm run walkthrough:render:clean`) |

## Storyboard

| # | Scene (`src/walkthrough/scenes/`) | Narration covers | On screen |
|---|---|---|---|
| 1 | `Hook` | Big orders are announced before they fill | An order broadcasts; size, price and wallet leak; bots circle |
| 2 | `Problem` | Front-running, sandwiches, the leak before execution | Public-DEX lane, sandwich stack, price chart, leak timeline gets locked |
| 3 | `Brand` | What the product is and who it's for | Logo burst, wordmark, "Nobody sees the order until it's filled." |
| 4 | `How` | Ask → Quote → Match → Audit | Seller, makers, a live ledger that only receives hashes, the ZK proof, the auditor |
| 5 | `Layers` | What stays private vs what's public | Exploded 3D stack: device → ZK proof → ledger |
| 6 | `Features` | The protocol guarantees | Real hero + features pages; camera zooms tile by tile; "no proof → no tx" |
| 7 | `Agents` | The agents demo | Cursor clicks **Run the desk**; blocked fat-finger, mandate and unfunded orders |
| 8 | `Result` | 1.8M DAO sold, 3/3 receipts, 0 prices on-chain | Stat counters and a big "0" |
| 9 | `Mandate` | "Can I let an AI trade my treasury?" | Mandate builder; compromised agent → "No valid proof" |
| 10 | `Guarantees` | 1 contract · 12 circuits · 6 guarantees, audiences | Counters, guarantee grid, audience cards |
| 11 | `Live` | Lace → proof → transaction; agents on-chain in 11 txs | "Connect, prove, settle" section; transaction checklist |
| 12 | `About` | The About page | 3D carousel through problem, flows, circuit and "who sees what" |
| 13 | `Outro` | Summary and call to action | Logo, pillars, **mn-demo.vercel.app** |

## Commands

```bash
npm run walkthrough:assets   # fonts + site screenshots + voice-over + music/SFX (all regenerable)
npm run studio               # preview (pick "Walkthrough"), with sound
npm run walkthrough:render   # → out/walkthrough.mp4
npm run walkthrough:render:clean
```

`walkthrough:assets` runs four steps you can also run on their own:

| Step | Script | Writes |
|---|---|---|
| `walkthrough:fonts` | `scripts/fetch-fonts.ts` | `public/fonts/` (the site's fonts, so renders don't need the network) |
| `walkthrough:capture` | `scripts/capture.ts` | `public/shots/` (headless Chrome against the live site; `SITE_URL=http://localhost:5173` for a local build) |
| `walkthrough:voice` | `scripts/tts.ts` | `public/voice/*.mp3` + `src/walkthrough/voice-manifest.json` (word timings) |
| `walkthrough:sfx` | `scripts/sfx.ts` | `public/audio/` (music bed and effects, synthesised in code, so there's nothing to license) |

### How rendering works on Windows

Smart App Control blocks Remotion's own `ffmpeg`/`ffprobe` (see above), and Remotion needs `ffprobe` for any composition with audio. So `scripts/render-walkthrough.ts`:

1. renders silent JPEG frames with Remotion (to the OS temp dir, ~1.5 GB);
2. mixes the soundtrack itself from `src/walkthrough/audio-plan.ts` (the same plan Studio plays), then levels it to about −16 dB RMS with a look-ahead limiter at −1 dBFS;
3. encodes frames + mix with a local `ffmpeg` if one runs, otherwise the `ffmpeg-env` Docker image.

It takes about 20 minutes on a 12-thread, 16 GB laptop. Flags: `--range 300-900` renders a test clip, `--keep` keeps the frames, `--reuse-frames` redoes only the audio and encode, `--resume` continues an interrupted render, and `--concurrency` (default 6) sets the number of Chrome tabs; lower it if Chrome crashes with "Target closed" (out of memory).

## Editing

| To change… | Edit, then |
|---|---|
| What the narrator says | `src/walkthrough/script.ts` → `npm run walkthrough:voice` (only changed lines are regenerated; scene lengths follow the audio) |
| The voice | `VOICE` in `script.ts`, or `VOICE=en-US-AvaMultilingualNeural npm run walkthrough:voice` (then `FORCE=1` to redo every line) |
| When something appears | Scenes cue on spoken words: `cue('word')` returns the frame the narrator says it |
| Sound effects and music level | `src/walkthrough/audio-plan.ts` |
| Screenshots | Re-run `walkthrough:capture` after the site changes. Camera moves and highlights use screenshot pixel coordinates, so check them after layout changes |
| Colours and type | `src/walkthrough/theme.ts` (mirrors the site's `src/App.css`) |

The narrator is Microsoft's neural voice `en-US-AndrewMultilingualNeural`, via the free Edge read-aloud service (`msedge-tts`, no API key). That service is unofficial, so if it stops working, point `scripts/tts.ts` at any TTS that returns audio and word timings (Azure Speech, ElevenLabs) and keep writing the same manifest.
