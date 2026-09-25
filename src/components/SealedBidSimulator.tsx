import React, { useEffect, useMemo, useState } from 'react';
import { IconLock } from './ui/icons';

/** Public by design: the oracle TWAP and band (`oraclePrice`, `oracleBandBps` on the ledger). */
const TWAP = 0.842;
const BAND = 0.03;
/** The RFQ slice being filled. */
const SIZE = 600_000;

const randomSalt = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

async function sha256Hex(input: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Non-secure context fallback (display only).
  let h = 0x811c9dc5;
  let out = '';
  for (let r = 0; r < 8; r++) {
    for (const ch of input + r) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
    out += h.toString(16).padStart(8, '0');
  }
  return out;
}

const useCommitment = (value: string, salt: string) => {
  const [hash, setHash] = useState('');
  useEffect(() => {
    let alive = true;
    sha256Hex(`${value}:${salt}`).then((h) => alive && setHash(h));
    return () => {
      alive = false;
    };
  }, [value, salt]);
  return hash;
};

interface FlipFieldProps {
  label: string;
  owner: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  flipped: boolean;
  delay: number;
  commitment: string;
  footnote?: React.ReactNode;
}

const FlipField: React.FC<FlipFieldProps> = ({
  label,
  owner,
  value,
  display,
  min,
  max,
  step,
  onChange,
  flipped,
  delay,
  commitment,
  footnote,
}) => {
  const id = `sim-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={`flip ${flipped ? 'flipped' : ''}`} style={{ ['--delay' as any]: `${delay}ms` }}>
      <div className="flip-face flip-front" aria-hidden={flipped}>
        <div className="k">
          <span>{label}</span>
          <span className="chip chip-violet" style={{ padding: '3px 8px', fontSize: 11 }}>
            <IconLock width={11} height={11} /> private
          </span>
        </div>
        <div className="subtle" style={{ fontSize: 13 }}>
          {owner}
        </div>
        <div className="big">{display}</div>
        {footnote}
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          className="range"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ ['--fill' as any]: `${fill}%` }}
          tabIndex={flipped ? -1 : 0}
        />
      </div>
      <div className="flip-face flip-back" aria-hidden={!flipped}>
        <div className="k">
          <span>{label}</span>
          <span className="chip" style={{ padding: '3px 8px', fontSize: 11 }}>
            what the chain sees
          </span>
        </div>
        <div className="big" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>
          ••••••
        </div>
        <div className="sealed">
          <span className="subtle">commitment</span>
          <br />
          0x{commitment.slice(0, 32)}
          <br />
          {commitment.slice(32, 64)}
        </div>
      </div>
    </div>
  );
};

export const SealedBidSimulator: React.FC = () => {
  const [quote, setQuote] = useState(0.8395);
  const [floor, setFloor] = useState(0.83);
  const [vault, setVault] = useState(1_800_000);
  const [chainView, setChainView] = useState(false);
  const salt = useMemo(randomSalt, []);

  const quoteC = useCommitment(`${quote.toFixed(4)}|${SIZE}`, salt);
  const floorC = useCommitment(floor.toFixed(4), salt + 'f');
  const vaultC = useCommitment(String(vault), salt + 'v');
  const receipt = useCommitment(`${quote}|${SIZE}|${floor}|${vault}`, salt + 'receipt');

  const lo = TWAP * (1 - BAND);
  const hi = TWAP * (1 + BAND);
  const floorOk = quote >= floor;
  const bandOk = quote >= lo && quote <= hi;
  const fundsOk = vault >= SIZE;
  const settles = floorOk && bandOk && fundsOk;

  return (
    <div className="panel">
      <div className="panel-head" style={{ flexWrap: 'wrap' }}>
        <div>
          <span className="eyebrow">Match proof preview</span>
          <h3 className="h3" style={{ marginTop: 6 }}>
            Who proves the match? The one party who knows both numbers.
          </h3>
          <p style={{ maxWidth: '66ch' }}>
            The maker commits to its quote on-chain and sends the opening only to you, encrypted. Your agent then
            proves in <code>acceptQuote</code> that the quote clears your private floor. The trade clears at the
            maker’s price. Drag the inputs, then flip to the chain’s view. This preview runs in your browser and
            sends nothing.
          </p>
        </div>
        <div
          className="segmented"
          role="radiogroup"
          aria-label="Perspective"
          style={{ ['--count' as any]: 2, minWidth: 260 }}
        >
          <button type="button" role="radio" aria-checked={!chainView} onClick={() => setChainView(false)}>
            Your view
          </button>
          <button type="button" role="radio" aria-checked={chainView} onClick={() => setChainView(true)}>
            Chain’s view
          </button>
        </div>
      </div>

      <div className="sim-grid">
        <FlipField
          label="Maker quote"
          owner="Market maker · sealed, opened only by you"
          value={quote}
          display={`$${quote.toFixed(4)}`}
          min={0.8}
          max={0.89}
          step={0.0005}
          onChange={setQuote}
          flipped={chainView}
          delay={0}
          commitment={quoteC}
          footnote={
            <div className="subtle" style={{ fontSize: 12.5 }}>
              for <span className="mono" style={{ color: 'var(--text)' }}>{SIZE.toLocaleString('en-US')}</span> DAO
            </div>
          }
        />
        <FlipField
          label="Your floor"
          owner="Treasury agent · never leaves your device"
          value={floor}
          display={`$${floor.toFixed(4)}`}
          min={0.8}
          max={0.89}
          step={0.0005}
          onChange={setFloor}
          flipped={chainView}
          delay={90}
          commitment={floorC}
        />
        <FlipField
          label="Your escrow"
          owner="Treasury agent · DAO in your vault"
          value={vault}
          display={vault.toLocaleString('en-US')}
          min={0}
          max={2_000_000}
          step={50_000}
          onChange={setVault}
          flipped={chainView}
          delay={180}
          commitment={vaultC}
        />
      </div>

      <div className="verdict" aria-live="polite">
        <div className="constraints">
          <div className={`constraint ${floorOk ? 'ok' : 'fail'}`}>
            <span className="mark">{floorOk ? '✓' : '✕'}</span>
            <span>
              assert quote ≥ floor
              {!chainView && <span className="subtle"> (${quote.toFixed(4)} vs ${floor.toFixed(4)})</span>}
            </span>
          </div>
          <div className={`constraint ${bandOk ? 'ok' : 'fail'}`}>
            <span className="mark">{bandOk ? '✓' : '✕'}</span>
            <span>
              assert quote within ±{BAND * 100}% of oracle TWAP{' '}
              <span className="subtle">
                (public: ${TWAP.toFixed(4)}, so ${lo.toFixed(4)}–${hi.toFixed(4)})
              </span>
            </span>
          </div>
          <div className={`constraint ${fundsOk ? 'ok' : 'fail'}`}>
            <span className="mark">{fundsOk ? '✓' : '✕'}</span>
            <span>
              assert escrow ≥ size
              {!chainView && <span className="subtle"> ({vault.toLocaleString('en-US')} vs {SIZE.toLocaleString('en-US')})</span>}
            </span>
          </div>
        </div>
        <div className={`verdict-badge ${settles ? 'ok' : 'fail'}`}>
          <strong>{settles ? `Proof valid: clears at the maker’s $${chainView ? '••••' : quote.toFixed(4)}` : 'No valid proof'}</strong>
          <span className="mono">
            {settles ? `receipt 0x${receipt.slice(0, 10)}…${receipt.slice(-6)}` : 'nothing is published, nothing leaks'}
          </span>
        </div>
      </div>
    </div>
  );
};
