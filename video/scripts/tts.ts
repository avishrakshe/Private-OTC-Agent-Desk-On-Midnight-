/**
 * AI voice-over for the walkthrough: synthesises every scene of src/walkthrough/script.ts with a
 * Microsoft neural voice and records word timings for the captions and the on-screen cues.
 * Unchanged lines are cached; FORCE=1 regenerates everything.
 *
 *   npm run walkthrough:voice
 *   VOICE=en-US-AvaMultilingualNeural npm run walkthrough:voice
 *
 * Writes public/voice/<scene>.mp3 and src/walkthrough/voice-manifest.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseFile } from 'music-metadata';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { SCRIPT, VOICE } from '../src/walkthrough/script';

const OUT = path.resolve('public/voice');
const MANIFEST = path.resolve('src/walkthrough/voice-manifest.json');
const TICKS = 10_000_000; // metadata offsets are in 100 ns ticks

export interface Word {
  text: string;
  start: number;
  end: number;
}

function collectWords(node: unknown, out: Word[]) {
  if (Array.isArray(node)) {
    node.forEach((n) => collectWords(n, out));
  } else if (node && typeof node === 'object') {
    const o = node as Record<string, any>;
    if (o.Type === 'WordBoundary' && o.Data) {
      const start = o.Data.Offset / TICKS;
      out.push({ text: String(o.Data.text?.Text ?? ''), start, end: start + o.Data.Duration / TICKS });
    } else {
      Object.values(o).forEach((v) => collectWords(v, out));
    }
  }
}

async function synth(id: string, text: string, voice: string) {
  const tmp = path.join(OUT, `.tmp-${id}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
    const { audioFilePath, metadataFilePath } = await tts.toFile(tmp, text, { rate: VOICE.rate, pitch: VOICE.pitch });
    const words: Word[] = [];
    if (metadataFilePath && fs.existsSync(metadataFilePath)) {
      collectWords(JSON.parse(fs.readFileSync(metadataFilePath, 'utf8')), words);
    }
    const file = path.join(OUT, `${id}.mp3`);
    fs.copyFileSync(audioFilePath, file);
    const { format } = await parseFile(file);
    return { duration: format.duration ?? (words.at(-1)?.end ?? 0) + 0.3, words: words.sort((a, b) => a.start - b.start) };
  } finally {
    tts.close();
    // let msedge-tts finish its own close handlers before the folder goes
    await new Promise((r) => setTimeout(r, 300));
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// msedge-tts unlinks a metadata file it never wrote when a response carries no word timings;
// that throws from an event handler. The attempt is retried below, so ignore just that error.
process.on('uncaughtException', (e: NodeJS.ErrnoException) => {
  if (e.code === 'ENOENT' && e.syscall === 'unlink') return;
  console.error(e);
  process.exit(1);
});

type Manifest = { voice: string; scenes: Record<string, { file: string; text: string; duration: number; words: Word[] }> };

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const voice = process.env.VOICE ?? VOICE.name;
  const previous: Manifest | null = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : null;
  const manifest: Manifest['scenes'] = {};
  let total = 0;

  for (const scene of SCRIPT) {
    const cached = previous?.voice === voice ? previous.scenes[scene.id] : undefined;
    if (!process.env.FORCE && cached?.text === scene.text && fs.existsSync(path.resolve('public', cached.file))) {
      manifest[scene.id] = cached;
      total += cached.duration;
      console.log(`  = ${scene.id.padEnd(11)} ${cached.duration.toFixed(2)}s  (cached)`);
      continue;
    }
    let lastErr: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { duration, words } = await synth(scene.id, scene.text, voice);
        if (!words.length) throw new Error('no word timings returned');
        manifest[scene.id] = { file: `voice/${scene.id}.mp3`, text: scene.text, duration: Number(duration.toFixed(3)), words };
        total += duration;
        console.log(`  ✓ ${scene.id.padEnd(11)} ${duration.toFixed(2)}s  ${words.length} words`);
        lastErr = undefined;
        break;
      } catch (e) {
        lastErr = e;
        console.warn(`  … ${scene.id} attempt ${attempt} failed: ${(e as Error).message}`);
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    if (lastErr) throw lastErr;
  }

  fs.writeFileSync(MANIFEST, JSON.stringify({ voice, scenes: manifest }, null, 1));
  console.log(`Voice: ${voice} · total narration ${total.toFixed(1)}s → ${path.relative('.', MANIFEST)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
