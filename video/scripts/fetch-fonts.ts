/**
 * Downloads the walkthrough's fonts (latin subset) into public/fonts/, so rendering never
 * depends on reaching Google Fonts mid-render. Run once; the files are small.
 *
 *   npm run walkthrough:fonts
 */
import fs from 'node:fs';
import path from 'node:path';
import { getInfo as inter } from '@remotion/google-fonts/Inter';
import { getInfo as interTight } from '@remotion/google-fonts/InterTight';
import { getInfo as mono } from '@remotion/google-fonts/JetBrainsMono';
import { FONT_FILES } from '../src/walkthrough/fonts';

const OUT = path.resolve('public/fonts');
const INFO = { Inter: inter(), 'Inter Tight': interTight(), 'JetBrains Mono': mono() } as const;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of FONT_FILES) {
    const url = (INFO[f.family].fonts.normal as Record<string, Record<string, string>>)[f.probe].latin;
    const dest = path.join(OUT, path.basename(f.file));
    if (fs.existsSync(dest)) {
      console.log(`  = ${f.file}`);
      continue;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`  ✓ ${f.file}  (${f.family}, weights ${f.weights})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
