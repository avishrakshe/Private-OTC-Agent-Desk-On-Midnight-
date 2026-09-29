// Encodes a rendered JPEG frame sequence into the web deliverables.
//
// Used when Remotion's bundled ffmpeg can't run (e.g. Windows Smart App Control blocks the
// unsigned binary: "FFmpeg quit with code 3236495362"). Uses a local `ffmpeg` if it works,
// otherwise the `ffmpeg-env` Docker image (see README).
//
//   node scripts/encode.mjs <framesDir> <output.mp4|output.webm> [crf]
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [framesDir, output, crfArg] = process.argv.slice(2);
if (!framesDir || !output) {
  console.error('usage: node scripts/encode.mjs <framesDir> <output.mp4|output.webm> [crf]');
  process.exit(1);
}

const frames = fs.readdirSync(framesDir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
if (!frames.length) throw new Error(`No frames in ${framesDir}`);
// Remotion names frames like element-000.jpeg / element-0899.jpeg; derive the printf pattern.
const m = /^(.*?)(\d+)\.(\w+)$/.exec(frames[0]);
const pattern = `${m[1]}%0${m[2].length}d.${m[3]}`;
const isWebm = output.endsWith('.webm');
const music = path.resolve('public/music.mp3');
const withMusic = !isWebm && fs.existsSync(music);

const localOk = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const absFrames = path.resolve(framesDir);
const absOut = path.resolve(output);
const inFrames = localOk ? path.join(absFrames, pattern) : `/frames/${pattern}`;
const outFile = localOk ? absOut : `/out/${path.basename(absOut)}`;

const args = ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', '30', '-start_number', String(Number(m[2])), '-i', inFrames];
if (withMusic) args.push('-i', localOk ? music : '/music/music.mp3');
if (isWebm) {
  args.push('-c:v', 'libvpx-vp9', '-crf', crfArg ?? '38', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an');
} else {
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', crfArg ?? '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
  args.push(...(withMusic ? ['-c:a', 'aac', '-b:a', '160k', '-shortest'] : ['-an']));
}
args.push(outFile);

fs.mkdirSync(path.dirname(absOut), { recursive: true });
if (localOk) {
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
} else {
  const mounts = ['-v', `${absFrames}:/frames:ro`, '-v', `${path.dirname(absOut)}:/out`];
  if (withMusic) mounts.push('-v', `${path.dirname(music)}:/music:ro`);
  execFileSync('docker', ['run', '--rm', ...mounts, 'ffmpeg-env', ...args], { stdio: 'inherit' });
}
console.log(`${output}  ${(fs.statSync(absOut).size / 1024 / 1024).toFixed(2)} MB${withMusic ? '  (with music)' : ''}`);
