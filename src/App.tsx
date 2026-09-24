import React, { useState } from 'react';
import { useMidnight } from './hooks';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import './App.css';

export const App: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    walletAddress,
    shieldedAddress,
    networkId,
    error,
    connect,
    disconnect,
    runStoreMessage,
  } = useMidnight();

  const formatShortAddr = (addr: string | null) => {
    if (!addr) return 'Connect Wallet';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const scrollToExecution = () => {
    const el = document.getElementById('circuit-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '60px' }}>
      {/* ─── Top Floating Header / Navbar (Reference Image Theme) ─── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px 0 20px' }}>
        <header
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '9999px',
            padding: '8px 16px 8px 12px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Left Brand + Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#b5f930',
                  color: '#000000',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                M
              </div>
              <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Private OTC Desk
              </span>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 500, color: '#475569' }}>
              <span style={{ cursor: 'pointer', color: '#0f172a', fontWeight: 600 }}>Dashboard</span>
              <span style={{ cursor: 'pointer' }} onClick={scrollToExecution}>Circuits</span>
              <span style={{ cursor: 'pointer' }}>Network</span>
              <span style={{ cursor: 'pointer' }}>Docs</span>
            </nav>
          </div>

          {/* Center Dark Status Pill */}
          <div
            style={{
              backgroundColor: '#18181b',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
              }}
            />
            <span>Preprod Testnet · Contract 0200...4cb1a · Active</span>
          </div>

          {/* Right Network & Wallet Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontWeight: 600, color: '#059669' }}>RPC Live</span>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
              <div>Wallet Status</div>
              <div style={{ fontWeight: 600, color: isConnected ? '#16a34a' : '#0f172a' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            <button
              onClick={() => {
                if (isConnected) disconnect();
                else connect('preview');
              }}
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{formatShortAddr(walletAddress)}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>
          </div>
        </header>
      </div>

      {/* ─── Hero Section ─── */}
      <main style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px' }}>
        {/* Sub-Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span className="badge-pill">Preview Testnet</span>
          <span className="badge-pill">Lace Beta Wallet</span>
          <span className="badge-pill">Zero-Knowledge Cryptography</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'start' }}>
          {/* Hero Headline & Subtext */}
          <div>
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                margin: '0 0 20px 0',
                color: '#09090b',
              }}
            >
              Midnight Builder Challenge.
              <br />
              <span style={{ color: '#94a3b8' }}>Browser ZK Proving &amp; Wallet Connection.</span>
            </h1>

            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#475569',
                margin: '0 0 32px 0',
                maxWidth: '540px',
              }}
            >
              Level 2 scaffolded application showcasing Lace wallet integration, browser-based zero-knowledge proof generation, and confidential contract interactions on the Midnight Network.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="lime-btn" onClick={scrollToExecution}>
                Execute storeMessage Circuit
              </button>
              <button
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onClick={() => {
                  if (!isConnected) connect('preview');
                }}
              >
                {isConnected ? '✓ Lace Wallet Connected' : 'Connect Lace Wallet'}
              </button>
            </div>
          </div>

          {/* Right Metrics Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 10px 35px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Midnight Network Metrics</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Preview Testnet · ZK Proving Active
                </p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '9999px' }}>
                Online
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '36px' }}>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>1</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', lineHeight: 1.3 }}>Active Compact Circuit</div>
              </div>

              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>100%</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', lineHeight: 1.3 }}>Private Witness Protection</div>
              </div>

              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>v0.16</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', lineHeight: 1.3 }}>Compact SDK Runtime</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Interactive Cards Section ─── */}
        <div style={{ marginTop: '64px' }} id="circuit-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                APPLICATION INTERACTOR
              </div>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                Wallet &amp; Circuit Execution Dashboard
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px', alignItems: 'start' }}>
            {/* Wallet Panel */}
            <section aria-label="Wallet Connection">
              <WalletConnect
                isConnected={isConnected}
                isConnecting={isConnecting}
                networkId={networkId}
                walletAddress={walletAddress}
                shieldedAddress={shieldedAddress}
                error={error}
                connect={connect}
                disconnect={disconnect}
              />
            </section>

            {/* Circuit Panel */}
            <section aria-label="Circuit Execution">
              <CircuitCall isConnected={isConnected} networkId={networkId} runStoreMessage={runStoreMessage} />
            </section>
          </div>
        </div>

        {/* ─── Architectural Privacy Explanation Card ─── */}
        <div style={{ marginTop: '48px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            🔒 Public State vs. Private Witness Breakdown
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '6px' }}>Public State</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>On-Chain Storage</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                Stored transparently on the Midnight ledger. For example, the updated state hash of `hello-world` contract is indexed publicly and queryable by network observers.
              </p>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>Private Witness</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Local Client Security</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                Your secret custom message remains strictly on your local browser. The proof provider generates a Zero-Knowledge proof locally, enabling validators to verify validity without seeing the input.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ maxWidth: '1200px', margin: '60px auto 0 auto', padding: '0 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
        <p>
          Powered by <strong>Midnight Network</strong> &amp; <strong>Lace Beta Wallet</strong>
        </p>
        <p style={{ marginTop: '6px' }}>
          Midnight Builder Challenge · Level 2 Solution · Enabled by Zero-Knowledge Cryptography.
        </p>
      </footer>
    </div>
  );
};

export default App;
