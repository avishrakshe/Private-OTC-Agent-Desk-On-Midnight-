import React, { useState } from 'react';
import { IconCopy, IconLock, IconEye } from './ui/icons';

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

const NETWORKS = [
  { id: 'preview', label: 'Preview' },
  { id: 'preprod', label: 'Preprod' },
  { id: 'undeployed', label: 'Local' },
];

export const networkLabel = (id?: string) =>
  id === 'preprod' ? 'Preprod' : id === 'undeployed' ? 'Local devnet' : id === 'mainnet' ? 'Mainnet' : 'Preview';

const shortAddr = (addr: string | null, head = 10, tail = 8) =>
  addr ? `${addr.slice(0, head)}…${addr.slice(-tail)}` : '';

/** Deterministic gradient identicon so users can recognise their wallet at a glance. */
const avatarStyle = (seed: string | null): React.CSSProperties => {
  let h = 0;
  for (const ch of seed ?? '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = h % 360;
  const b = (a + 70 + ((h >> 8) % 90)) % 360;
  return { background: `conic-gradient(from ${h % 180}deg, hsl(${a} 85% 62%), hsl(${b} 80% 55%), hsl(${a} 85% 62%))` };
};

const CopyButton: React.FC<{ value: string | null; label: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-sm btn-ghost"
      onClick={async () => {
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // clipboard blocked (e.g. insecure context) – nothing else to do
        }
      }}
      aria-label={`Copy ${label}`}
    >
      <IconCopy width={14} height={14} />
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

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

  const isLaceAvailable =
    typeof window !== 'undefined' && !!window.midnight && Object.keys(window.midnight).length > 0;

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-head">
        <div>
          <span className="eyebrow">Step 1</span>
          <h3 className="h3" style={{ marginTop: 6 }}>
            Wallet
          </h3>
          <p>Authorize Lace to prove, balance and relay transactions.</p>
        </div>
        <span className={`chip ${isConnected ? 'chip-lime' : ''}`}>
          <span className={`status-dot ${isConnected ? 'on' : ''}`} />
          {isConnected ? networkLabel(networkId) : 'Not connected'}
        </span>
      </div>

      {error && (
        <div className="callout callout-error" role="alert" style={{ marginBottom: 20 }}>
          <div>
            <strong>Couldn’t connect.</strong> {error}
          </div>
        </div>
      )}

      {!isConnected ? (
        <>
          <div className="field">
            <span className="label" id="network-label">
              Network
            </span>
            <div
              className="segmented"
              role="radiogroup"
              aria-labelledby="network-label"
              style={{ ['--count' as any]: NETWORKS.length }}
            >
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedNetwork === n.id}
                  onClick={() => setSelectedNetwork(n.id)}
                  disabled={isConnecting}
                >
                  {n.label}
                </button>
              ))}
            </div>
            <span className="hint">The demo contract lives on Preview. Lace must be set to the same network.</span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => connect(selectedNetwork)}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="spinner" /> Waiting for Lace…
              </>
            ) : (
              <>
                Connect Lace wallet <span className="arrow">→</span>
              </>
            )}
          </button>

          {!isLaceAvailable && (
            <div className="callout" style={{ marginTop: 16 }}>
              <div>
                <strong>Lace not detected.</strong>
                <ol>
                  <li>Install the Lace (Midnight) extension in Chrome.</li>
                  <li>In Lace settings, pick the Midnight Preview network.</li>
                  <li>Reload this page and connect.</li>
                </ol>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="identity">
            <div className="avatar" style={avatarStyle(shieldedAddress)} aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>Lace wallet</div>
              <div className="subtle mono" style={{ fontSize: 12.5 }}>
                {shortAddr(shieldedAddress, 14, 6)}
              </div>
            </div>
          </div>

          <div className="addr-row">
            <div style={{ minWidth: 0 }}>
              <div className="k">
                <IconLock width={12} height={12} style={{ color: 'var(--violet)' }} /> Shielded
              </div>
              <code>{shortAddr(shieldedAddress)}</code>
            </div>
            <CopyButton value={shieldedAddress} label="shielded address" />
          </div>

          <div className="addr-row">
            <div style={{ minWidth: 0 }}>
              <div className="k">
                <IconEye width={12} height={12} style={{ color: 'var(--coral)' }} /> Unshielded
              </div>
              <code>{walletAddress ? shortAddr(walletAddress) : '—'}</code>
            </div>
            <CopyButton value={walletAddress} label="unshielded address" />
          </div>

          <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={disconnect}>
            Disconnect
          </button>
        </>
      )}
    </div>
  );
};
