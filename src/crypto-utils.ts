/**
 * Cryptographic Utility Helpers & Replay Protection
 */

export class CryptoUtils {
  private static usedNonces: Set<string> = new Set();

  public static generateSecureSalt(): string {
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public static generateOrderNonce(agentId: string): string {
    const salt = this.generateSecureSalt();
    const nonce = `nonce_${agentId}_${Date.now()}_${salt.slice(2, 8)}`;
    this.usedNonces.add(nonce);
    return nonce;
  }

  public static isNonceUsed(nonce: string): boolean {
    return this.usedNonces.has(nonce);
  }

  public static hashWitnessCommitment(agentKey: string, price: bigint, salt: string): string {
    // Simple client-side pseudo-hash representation for order commitments
    let hash = 0;
    const combined = `${agentKey}:${price.toString()}:${salt}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return `0xcomm_${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }
}
