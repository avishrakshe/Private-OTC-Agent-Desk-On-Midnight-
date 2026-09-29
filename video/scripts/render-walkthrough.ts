/**
 * Renders the narrated Walkthrough to MP4 without Remotion's bundled ffmpeg/ffprobe, which Windows
 * Smart App Control blocks ("FFmpeg quit with code 3236495362"):
 *
 *   1. Remotion renders silent JPEG frames (`audio: false`).
 *   2. This script mixes src/walkthrough/audio-plan.ts (the same plan the composition plays in
 *      Studio) sample-accurately in Node: narration, ducked music, effects.
 *   3. A local `ffmpeg`, or the `ffmpeg-env` Docker image (see README), encodes frames + mix.
 *
 *   npm run walkthrough:render
 *   npx tsx scripts/render-walkthrough.ts --id WalkthroughClean --out out/walkthrough-no-captions.mp4
 *   npx tsx scripts/render-walkthrough.ts --range 300-900 --out out/check/test.mp4    # a test clip
 *
 * Frames go to the OS temp dir (≈1.5 GB), not into the synced project folder.
 */
import { bundle } from '@remotion/bundler';
import { renderFrames, selectComposition } from '@remotion/renderer';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AUDIO_PLAN } from '../src/walkthrough/audio-plan';

const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const id = arg('id', 'Walkthrough');
const output = path.resolve(arg('out', 'out/walkthrough.mp4'));
const crf = arg('crf', '20');
// 6 Chrome tabs was both faster and stable on a 16 GB machine; 9 ran out of memory
const concurrency = Number(arg('concurrency', '6'));
const work = path.join(os.tmpdir(), `otc-${id.toLowerCase()}`);
const framesDir = path.join(work, 'frames');
const SR = 44100;

const localFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
/** Runs ffmpeg locally, or in the ffmpeg-env Docker image with host dirs mounted at container paths. */
const ffmpeg = (args: string[], mounts: [host: string, box: string][]) => {
  if (localFfmpeg) {
    const local = args.map((a) => mounts.reduce((s, [host, box]) => s.split(box).join(host), a));
    execFileSync('ffmpeg', local, { stdio: 'inherit' });
  } else {
    const v = mounts.flatMap(([host, box]) => ['-v', `${host}:${box}`]);
    execFileSync('docker', ['run', '--rm', ...v, 'ffmpeg-env', ...args], { stdio: 'inherit' });
  }
};

const readWav = (file: string) => {
  const b = fs.readFileSync(file);
  let off = 12;
  let fmt = { channels: 0, rate: 0, bits: 0 };
  while (b.toString('ascii', off, off + 4) !== 'data') {
    if (b.toString('ascii', off, off + 4) === 'fmt ') {
      fmt = { channels: b.readUInt16LE(off + 10), rate: b.readUInt32LE(off + 12), bits: b.readUInt16LE(off + 22) };
    }
    off += 8 + b.readUInt32LE(off + 4);
  }
  return { b, fmt, data: off + 8, bytes: b.readUInt32LE(off + 4) };
};

async function main() {
  /* ───────── 1. frames ───────── */
  // --reuse-frames: keep the frames from a previous --keep run and only redo the soundtrack + encode
  // --resume: continue an interrupted render from the first missing frame
  const reuse = process.argv.includes('--reuse-frames') && fs.existsSync(framesDir);
  const resume = process.argv.includes('--resume') && fs.existsSync(framesDir);
  if (!reuse && !resume) {
    fs.rmSync(work, { recursive: true, force: true });
    fs.mkdirSync(framesDir, { recursive: true });
  }
  console.log('Bundling…');
  const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
  const inputProps = { audio: false };
  const composition = await selectComposition({ serveUrl, id, inputProps });
  const { fps } = composition;
  const range = arg('range', '');
  const [rs, re] = range ? range.split('-').map(Number) : [0, composition.durationInFrames - 1];
  const total = re - rs + 1;
  console.log(`Rendering ${id}: frames ${rs}–${re} (${total}) @ ${fps} fps → ${framesDir}`);
  let from = rs;
  if (resume) {
    const frameNo = (f: string) => Number(/(\d+)\.jpe?g$/i.exec(f)?.[1] ?? NaN);
    const have = new Set(fs.readdirSync(framesDir).map(frameNo));
    while (from <= re && have.has(from)) from++;
    // frames still being written when the last run stopped may be truncated: redo the frontier
    from = Math.max(rs, from - 2 * concurrency);
    for (const f of fs.readdirSync(framesDir)) if (frameNo(f) >= from) fs.rmSync(path.join(framesDir, f));
    console.log(`Resuming at frame ${from}.`);
  }
  const todo = re - from + 1;
  const t0 = Date.now();
  let last = 0;
  if (!reuse && todo > 0) await renderFrames({
    composition,
    serveUrl,
    inputProps: { ...composition.props, ...inputProps },
    outputDir: framesDir,
    imageFormat: 'jpeg',
    jpegQuality: 92,
    frameRange: range || from > rs ? [from, re] : null,
    concurrency,
    onStart: () => {},
    onFrameUpdate: (done) => {
      if (done - last >= 250 || done === todo) {
        last = done;
        const s = (Date.now() - t0) / 1000;
        console.log(`  ${done + (from - rs)}/${total} frames · ${s.toFixed(0)}s · eta ${((s / done) * (todo - done)).toFixed(0)}s`);
      }
    },
  });

  /* ───────── 2. soundtrack ───────── */
  const pcmDir = path.join(work, 'pcm');
  fs.mkdirSync(pcmDir, { recursive: true });
  const decoded = new Map<string, { L: Float32Array; R: Float32Array }>();
  const sources = [...new Set(AUDIO_PLAN.map((c) => c.src))];
  for (const [i, src] of sources.entries()) {
    let file = path.resolve('public', src);
    const ok = file.endsWith('.wav') && (() => {
      const { fmt } = readWav(file);
      return fmt.rate === SR && fmt.channels === 2 && fmt.bits === 16;
    })();
    if (!ok) {
      const out = path.join(pcmDir, `${i}.wav`);
      ffmpeg(['-y', '-hide_banner', '-loglevel', 'error', '-i', `/src/${path.basename(file)}`, '-ar', String(SR), '-ac', '2', '-c:a', 'pcm_s16le', `/pcm/${i}.wav`], [
        [path.dirname(file), '/src'],
        [pcmDir, '/pcm'],
      ]);
      file = out;
    }
    const { b, data, bytes } = readWav(file);
    const n = bytes / 4;
    const L = new Float32Array(n),
      R = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      L[k] = b.readInt16LE(data + k * 4) / 32768;
      R[k] = b.readInt16LE(data + k * 4 + 2) / 32768;
    }
    decoded.set(src, { L, R });
  }
  console.log(`Decoded ${sources.length} sources (${localFfmpeg ? 'local' : 'Docker'} ffmpeg for the mp3 narration).`);

  const length = Math.ceil((total / fps) * SR);
  const mixL = new Float32Array(length),
    mixR = new Float32Array(length);
  for (const clip of AUDIO_PLAN) {
    const { L, R } = decoded.get(clip.src)!;
    const vol = (rel: number) => (typeof clip.volume === 'function' ? clip.volume(rel) : clip.volume);
    for (let rel = 0; rel < clip.frames; rel++) {
      const f = clip.from + rel;
      if (f < rs || f > re) continue;
      const s0 = Math.round((rel * SR) / fps);
      if (s0 >= L.length) break;
      const d0 = Math.round(((f - rs) * SR) / fps);
      const d1 = Math.min(length, Math.round(((f - rs + 1) * SR) / fps));
      const v0 = vol(rel),
        v1 = vol(rel + 1);
      for (let d = d0, s = s0; d < d1 && s < L.length; d++, s++) {
        const g = v0 + ((v1 - v0) * (d - d0)) / (d1 - d0);
        mixL[d] += L[s] * g;
        mixR[d] += R[s] * g;
      }
    }
  }

  // master: bring the programme to about -16 dB RMS, then a 5 ms look-ahead limiter holds peaks
  // under -1 dBFS (so one loud hit doesn't set the level for the whole narration)
  let sum = 0,
    count = 0;
  for (let k = 0; k < length; k++) {
    const e = (mixL[k] * mixL[k] + mixR[k] * mixR[k]) / 2;
    if (e > 1e-6) {
      sum += e;
      count++;
    }
  }
  const rms = Math.sqrt(sum / Math.max(1, count));
  const gain = Math.min(4, 10 ** (-16 / 20) / rms);
  const ceiling = 0.89;
  const look = Math.round(0.005 * SR);
  const release = Math.exp(-1 / (0.12 * SR));
  const p = new Float32Array(length);
  for (let k = 0; k < length; k++) p[k] = Math.max(Math.abs(mixL[k]), Math.abs(mixR[k])) * gain;
  // monotonic deque → max of p over [k, k + look]
  const dq = new Int32Array(length);
  let h = 0,
    t = 0;
  const push = (i: number) => {
    while (t > h && p[dq[t - 1]] <= p[i]) t--;
    dq[t++] = i;
  };
  for (let i = 0; i < Math.min(look, length); i++) push(i);
  let g = 1,
    limited = 0;
  for (let k = 0; k < length; k++) {
    if (k + look < length) push(k + look);
    while (dq[h] < k) h++;
    const want = Math.min(1, ceiling / Math.max(1e-9, p[dq[h]]));
    g = want < g ? want : want + (g - want) * release;
    if (g < 0.995) limited++;
    mixL[k] *= gain * g;
    mixR[k] *= gain * g;
  }
  const soft = (x: number) => (Math.abs(x) < 0.9 ? x : Math.sign(x) * (0.9 + 0.1 * Math.tanh((Math.abs(x) - 0.9) / 0.1)));
  const wav = Buffer.alloc(44 + length * 4);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + length * 4, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(SR, 24);
  wav.writeUInt32LE(SR * 4, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(length * 4, 40);
  for (let k = 0; k < length; k++) {
    wav.writeInt16LE(Math.round(soft(mixL[k]) * 32767), 44 + k * 4);
    wav.writeInt16LE(Math.round(soft(mixR[k]) * 32767), 46 + k * 4);
  }
  fs.writeFileSync(path.join(work, 'mix.wav'), wav);
  console.log(
    `Mixed ${AUDIO_PLAN.length} clips · +${(20 * Math.log10(gain)).toFixed(1)} dB to -16 dB RMS · limiter active ${((100 * limited) / length).toFixed(1)}% of the time`,
  );

  /* ───────── 3. encode ───────── */
  const frames = fs.readdirSync(framesDir).filter((f) => /\.jpe?g$/i.test(f)).sort();
  const m = /^(.*?)(\d+)\.(\w+)$/.exec(frames[0])!;
  const pattern = `${m[1]}%0${m[2].length}d.${m[3]}`;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  console.log(`Encoding ${frames.length} frames → ${output}`);
  ffmpeg(
    [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-framerate', String(fps), '-start_number', String(Number(m[2])), '-i', `/work/frames/${pattern}`,
      '-i', '/work/mix.wav',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-tune', 'animation', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
      `/out/${path.basename(output)}`,
    ],
    [
      [work, '/work'],
      [path.dirname(output), '/out'],
    ],
  );
  const mb = fs.statSync(output).size / 1024 / 1024;
  console.log(`${path.relative(process.cwd(), output)}  ${mb.toFixed(1)} MB · ${((Date.now() - t0) / 60000).toFixed(1)} min`);
  if (!process.argv.includes('--keep')) fs.rmSync(work, { recursive: true, force: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
