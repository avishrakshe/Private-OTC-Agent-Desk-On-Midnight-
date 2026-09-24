import React, { useState } from 'react';

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  networkId?: string;
  walletAddress: string | null;
  shieldedAddress: string | null;
  error: string | null;
  connect: (network: string) => Promise<void>;
  disconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  isConnecting,
  networkId,
  walletAddress,
  shieldedAddress,
  error,
  connect,
  disconnect,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState('preview');
  const [copiedUnshielded, setCopiedUnshielded] = useState(false);
  const [copiedShielded, setCopiedShielded] = useState(false);

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const copyToClipboard = (text: string | null, type: 'unshielded' | 'shielded') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'unshielded') {
      setCopiedUnshielded(true);
      setTimeout(() => setCopiedUnshielded(false), 2000);
    } else {
      setCopiedShielded(true);
      setTimeout(() => setCopiedShielded(false), 2000);
    }
  };

  const isLaceAvailable = typeof window !== 'undefined' && !!(window.midnight?.mnLace || (window.midnight && Object.keys(window.midnight).length > 0));

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Lace Wallet Authorization</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Connect your Lace Beta wallet to interact with Midnight zero-knowledge contracts.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            padding: '6px 12px',
            borderRadius: '9999px',
            border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#22c55e' : '#f59e0b',
              boxShadow: isConnected ? '0 0 8px #22c55e' : '0 0 8px #f59e0b',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 600, color: isConnected ? '#15803d' : '#b45309' }}>
            {isConnected ? `Connected (${networkId === 'preprod' ? 'Preprod' : networkId === 'undeployed' ? 'Local' : 'Preview'})` : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#b91c1c',
            fontSize: '13px',
            marginBottom: '20px',
            lineHeight: 1.4,
          }}
        >
          <strong>Connection Error: </strong> {error}
        </div>
      )}

      {!isConnected ? (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Target Midnight Network
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              disabled={isConnecting}
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                color: '#0f172a',
                fontSize: '14px',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="preview">Preview Testnet (Recommended)</option>
              <option value="preprod">Preprod Testnet</option>
              <option value="undeployed">Undeployed (Local Devnet)</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>

          <button
            className="lime-btn"
            onClick={() => connect(selectedNetwork)}
            disabled={isConnecting}
            style={{ width: '100%', padding: '14px 20px', fontSize: '15px' }}
          >
            {isConnecting ? 'Connecting to Lace...' : 'Connect Lace Beta Wallet'}
          </button>

          {!isLaceAvailable && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px 16px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#166534',
                lineHeight: 1.5,
              }}
            >
              <strong>⚡ How to Connect Lace Wallet:</strong>
              <ol style={{ margin: '8px 0 0 0', paddingLeft: '18px' }}>
                <li>Ensure <strong>Lace Beta Wallet</strong> extension is installed in Chrome.</li>
                <li>In Lace extension settings, set Network to <strong>Midnight Preview</strong> (or Preprod).</li>
                <li>Refresh this tab (F5) and click <strong>Connect Lace Beta Wallet</strong>.</li>
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {/* Unshielded Address */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Unshielded Address (Public)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <code
                  style={{
                    fontSize: '13px',
                    color: '#0f172a',
                    fontWeight: 600,
                    wordBreak: 'break-all',
                  }}
                >
                  {formatAddress(walletAddress)}
                </code>
                <button
                  onClick={() => copyToClipboard(walletAddress, 'unshielded')}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {copiedUnshielded ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Shielded Address */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Shielded Address (Private ZK)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <code
                  style={{
                    fontSize: '13px',
                    color: '#0f172a',
                    fontWeight: 600,
                    wordBreak: 'break-all',
                  }}
                >
                  {formatAddress(shieldedAddress)}
                </code>
                <button
                  onClick={() => copyToClipboard(shieldedAddress, 'shielded')}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {copiedShielded ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={disconnect}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: 'transparent',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};
