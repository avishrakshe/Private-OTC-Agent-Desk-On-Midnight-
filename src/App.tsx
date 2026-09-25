import React, { useCallback, useEffect, useState } from 'react';
import { useMidnight } from './hooks';
import { useHashRoute } from './hooks/useHashRoute';
import { DeskPage } from './pages/DeskPage';
import { AboutPage } from './pages/AboutPage';
import { networkLabel } from './components/WalletConnect';
import type { CallStatus } from './components/CircuitCall';
import type { OrbMode } from './components/three/ZkOrb';
import { BrandMark } from './components/ui/icons';
import './App.css';
import './premium.css';
import './agents.css';

const shortAddr = (addr: string | null) => (addr ? `${addr.slice(0, 8)}…${addr.slice(-4)}` : '');

export const App: React.FC = () => {
  const midnight = useMidnight();
  const route = useHashRoute();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCallStatus = useCallback((s: CallStatus) => setCallStatus(s), []);

  const orbMode: OrbMode =
    callStatus === 'executing' || midnight.isConnecting
      ? 'active'
      : callStatus === 'success'
      ? 'success'
      : callStatus === 'error'
      ? 'error'
      : 'idle';

  const { isConnected, isConnecting, shieldedAddress, networkId, connect, disconnect } = midnight;

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.focus();
      }}>
        Skip to content
      </a>

      <div className="ambient" aria-hidden="true">
        <div className="ambient-grid" />
      </div>

      <header className={`nav-wrap ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav">
          <a className="brand" href="#/" aria-label="Private OTC Agent Desk, home">
            <BrandMark className="brand-mark" />
            <span className="brand-text">Private OTC Desk</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            <a href="#/" aria-current={route === 'desk' ? 'page' : undefined}>
              Desk
            </a>
            <a href="#/about" aria-current={route === 'about' ? 'page' : undefined}>
              About
            </a>
          </nav>

          <div className="nav-right">
            <span className={`chip nav-status ${isConnected ? 'chip-lime' : ''}`}>
              <span className={`status-dot ${isConnected ? 'on' : ''}`} />
              {isConnected ? networkLabel(networkId) : 'Not connected'}
            </span>
            <button
              type="button"
              className={`btn btn-sm wallet-btn ${isConnected ? '' : 'btn-primary'}`}
              onClick={() => (isConnected ? disconnect() : connect('preview'))}
              disabled={isConnecting}
              title={isConnected ? 'Disconnect wallet' : 'Connect Lace wallet'}
            >
              {isConnecting ? (
                <span className="spinner" />
              ) : isConnected ? (
                <>
                  <span className="status-dot on" />
                  <span className="label">{shortAddr(shieldedAddress)}</span>
                </>
              ) : (
                <span>
                  Connect<span className="label"> wallet</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        {route === 'about' ? (
          <AboutPage />
        ) : (
          <DeskPage midnight={midnight} orbMode={orbMode} onCallStatus={handleCallStatus} />
        )}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', fontWeight: 600 }}>
              <BrandMark className="brand-mark" /> Private OTC Agent Desk
            </div>
            <p style={{ margin: '10px 0 0', maxWidth: '44ch' }}>
              Sealed-bid OTC settlement for institutions and autonomous agents, built on Midnight.
            </p>
          </div>
          <div className="footer-links">
            <a href="#/">Desk</a>
            <a href="#/about">About</a>
            <a
              href="https://preview.midnightexplorer.com/contracts/7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1"
              target="_blank"
              rel="noreferrer"
            >
              Contract on explorer ↗
            </a>
            <a href="https://docs.midnight.network" target="_blank" rel="noreferrer">
              Midnight docs ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
