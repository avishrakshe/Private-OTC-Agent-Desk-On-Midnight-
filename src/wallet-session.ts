/**
 * Wallet Session Manager & Network Persistence
 */

export interface WalletSession {
  unshieldedAddress: string;
  shieldedAddress?: string;
  connectedNetwork: 'preprod' | 'preview' | 'devnet';
  sessionStartedAt: number;
  lastActiveAt: number;
}

const STORAGE_KEY = 'midnight_otc_wallet_session';

export class WalletSessionManager {
  public static saveSession(session: WalletSession): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to persist wallet session:', e);
    }
  }

  public static loadSession(): WalletSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Expire session after 24h
      if (Date.now() - parsed.lastActiveAt > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  public static clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}
