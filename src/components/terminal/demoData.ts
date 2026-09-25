/**
 * Illustrative data for the Desk Terminal preview. Nothing here is read from chain;
 * the UI labels it "Demo data". The live desk further down the page is real.
 */
import type { Column, Point } from '../charts/Charts';

const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

/** Upward-trending noisy series: `growth` is the fractional rise from first to last point. */
const series = (labels: string[], base: number, noise: number, seed: number, growth: number): Point[] => {
  const r = rng(seed);
  const n = labels.length - 1 || 1;
  return labels.map((x, i) => {
    const trend = base * (1 + growth * (i / n));
    return { x, y: Math.round(trend + (r() - 0.5) * noise) };
  });
};

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const month = Array.from({ length: 30 }, (_, i) => `Sep ${i + 1}`);

export type Range = '24h' | '7d' | '30d';

export const VOLUME: Record<Range, { points: Point[]; delta: number; period: string }> = {
  '24h': { points: series(hours, 58_000, 22_000, 7, 0.35), delta: 6.8, period: 'vs previous 24h' },
  '7d': { points: series(days, 1_280_000, 320_000, 21, 0.4), delta: 12.4, period: 'vs previous 7d' },
  '30d': { points: series(month, 1_150_000, 380_000, 42, 0.6), delta: 18.1, period: 'vs previous 30d' },
};

// Pair split of the same 30d volume shown in the area chart, so the totals agree.
const total30d = VOLUME['30d'].points.reduce((s, p) => s + p.y, 0);
export const PAIRS = [
  { label: 'NIGHT/USDC', value: Math.round(total30d * 0.44) },
  { label: 'BTC/USDC', value: Math.round(total30d * 0.27) },
  { label: 'ETH/USDC', value: Math.round(total30d * 0.17) },
  { label: 'Other', value: Math.round(total30d * 0.12) },
];

export const DEPTH: Column[] = [
  { x: '1.015', y: 420_000, series: 0 },
  { x: '1.020', y: 780_000, series: 0 },
  { x: '1.025', y: 1_150_000, series: 0 },
  { x: '1.030', y: 1_620_000, series: 0 },
  { x: '1.035', y: 1_380_000, series: 1 },
  { x: '1.040', y: 990_000, series: 1 },
  { x: '1.045', y: 610_000, series: 1 },
  { x: '1.050', y: 330_000, series: 1 },
];

export const SPARKS = {
  proofs: [12, 14, 13, 17, 16, 19, 18, 22, 21, 24, 23, 27],
  agents: [40, 41, 41, 43, 44, 46, 47, 47, 49, 50, 52, 53],
  proofTime: [21, 20, 22, 19, 18, 19, 17, 18, 16, 17, 15, 16],
};

const PAIR_NAMES = ['NIGHT/USDC', 'BTC/USDC', 'ETH/USDC', 'NIGHT/BTC'];

export interface Settlement {
  id: string;
  receipt: string;
  pair: string;
  status: 'settled' | 'proving';
  ageSec: number;
}

const hex = (r: () => number, n: number) => Array.from({ length: n }, () => Math.floor(r() * 16).toString(16)).join('');

export const makeSettlement = (seed: number, ageSec = 0, status: Settlement['status'] = 'settled'): Settlement => {
  const r = rng(seed * 7919 + 13);
  const receipt = hex(r, 64);
  return { id: `${seed}-${receipt.slice(0, 6)}`, receipt, pair: PAIR_NAMES[Math.floor(r() * PAIR_NAMES.length)], status, ageSec };
};

export const INITIAL_SETTLEMENTS: Settlement[] = [
  makeSettlement(1, 12),
  makeSettlement(2, 48),
  makeSettlement(3, 95),
  makeSettlement(4, 160),
  makeSettlement(5, 244),
];
