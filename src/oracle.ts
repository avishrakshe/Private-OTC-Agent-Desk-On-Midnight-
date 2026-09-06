/**
 * Confidential Price Feed Oracle & TWAP Calculation Engine
 */

import { AssetPair } from './types/otc';

export interface OraclePriceSample {
  timestamp: number;
  price: number;
  source: string;
}

export class PriceOracle {
  private priceHistory: Map<AssetPair, OraclePriceSample[]> = new Map();

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory() {
    const basePairs: AssetPair[] = ['DUST/USDC', 'ADA/USDC', 'NIGHT/USDC', 'DUST/ADA'];
    const now = Date.now();

    for (const pair of basePairs) {
      const basePrice = pair === 'DUST/USDC' ? 1.03 : pair === 'ADA/USDC' ? 0.45 : pair === 'NIGHT/USDC' ? 2.85 : 2.28;
      const samples: OraclePriceSample[] = [];
      for (let i = 10; i >= 0; i--) {
        const jitter = (Math.random() - 0.5) * 0.02 * basePrice;
        samples.push({
          timestamp: now - i * 60000,
          price: Number((basePrice + jitter).toFixed(4)),
          source: 'Midnight-Preprod-Oracle-Feed',
        });
      }
      this.priceHistory.set(pair, samples);
    }
  }

  public getLatestPrice(pair: AssetPair): number {
    const history = this.priceHistory.get(pair) || [];
    if (history.length === 0) return 1.0;
    return history[history.length - 1].price;
  }

  public calculateTWAP(pair: AssetPair, windowMinutes = 15): number {
    const history = this.priceHistory.get(pair) || [];
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    const validSamples = history.filter(s => s.timestamp >= cutoff);
    if (validSamples.length === 0) return this.getLatestPrice(pair);

    const sum = validSamples.reduce((acc, sample) => acc + sample.price, 0);
    return Number((sum / validSamples.length).toFixed(4));
  }

  public validatePriceDeviation(pair: AssetPair, proposedPrice: number, maxDeviationPercent = 5.0): boolean {
    const twap = this.calculateTWAP(pair);
    const deviation = Math.abs((proposedPrice - twap) / twap) * 100;
    return deviation <= maxDeviationPercent;
  }
}
