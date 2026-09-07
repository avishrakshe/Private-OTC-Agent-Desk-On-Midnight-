/**
 * Telemetry & Performance Benchmarking for Zero-Knowledge Circuits
 */

export interface CircuitProofMetrics {
  circuitName: string;
  zkKeyLoadTimeMs: number;
  witnessCompileTimeMs: number;
  provingTimeMs: number;
  totalLatencyMs: number;
  memoryUsageMb: number;
  timestamp: number;
}

export class CircuitTelemetry {
  private static metricsLog: CircuitProofMetrics[] = [];

  public static recordMetrics(metrics: CircuitProofMetrics): void {
    this.metricsLog.push(metrics);
    if (typeof console !== 'undefined') {
      console.log(`[ZK-Telemetry] ${metrics.circuitName} proved in ${metrics.provingTimeMs}ms (Total: ${metrics.totalLatencyMs}ms)`);
    }
  }

  public static getAverageProvingTime(circuitName: string): number {
    const matching = this.metricsLog.filter(m => m.circuitName === circuitName);
    if (matching.length === 0) return 0;
    const total = matching.reduce((sum, m) => sum + m.provingTimeMs, 0);
    return Math.round(total / matching.length);
  }

  public static getSummaryReport(): Record<string, any> {
    return {
      totalProofsRecorded: this.metricsLog.length,
      averageProvingTimeOverallMs: this.metricsLog.length
        ? Math.round(this.metricsLog.reduce((a, b) => a + b.provingTimeMs, 0) / this.metricsLog.length)
        : 0,
      recentMetrics: this.metricsLog.slice(-5),
    };
  }
}
