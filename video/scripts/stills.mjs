// Renders a set of stills from one bundle, for quick visual checks of each scene.
//   node scripts/stills.mjs Intro 60 200 320 ...
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [id = 'Intro', ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id });
for (const f of frames.map(Number)) {
  const output = path.resolve(`out/check/${id}-${String(f).padStart(3, '0')}.png`);
  await renderStill({ composition, serveUrl, frame: f, output });
  console.log(output);
}
