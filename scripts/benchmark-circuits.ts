/**
 * Measures how long each compiled circuit takes to *execute* (the local step before proving),
 * across the full agent story. Proving time is dominated by the proof server; see
 * `npm run agents:onchain`, which proves and submits every transaction.
 *
 *   npm run benchmark
 */
import { DeskLedger } from '../src/protocol/desk';
import { runScenario } from '../src/protocol/scenario';

const timings = new Map<string, number[]>();
const originalRun = DeskLedger.prototype.run;
DeskLedger.prototype.run = function (this: DeskLedger, ...args: Parameters<typeof originalRun>) {
  const start = performance.now();
  try {
    return originalRun.apply(this, args);
  } finally {
    const circuit = String(args[1]);
    timings.set(circuit, [...(timings.get(circuit) ?? []), performance.now() - start]);
  }
} as typeof originalRun;

const RUNS = 5;
for (let i = 0; i < RUNS; i++) {
  const gen = runScenario();
  while (!(await gen.next()).done);
}

console.log(`\nCircuit execution time over ${RUNS} runs of the agent story (includes rejected attempts)\n`);
console.log('  circuit            calls   mean ms   p95 ms');
for (const [circuit, ms] of [...timings].sort()) {
  const sorted = [...ms].sort((a, b) => a - b);
  const mean = ms.reduce((a, b) => a + b, 0) / ms.length;
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
  console.log(`  ${circuit.padEnd(18)} ${String(ms.length).padStart(5)}   ${mean.toFixed(2).padStart(7)}   ${p95.toFixed(2).padStart(6)}`);
}
console.log('');
