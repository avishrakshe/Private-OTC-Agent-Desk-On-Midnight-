import React, { useEffect, useState } from 'react';
import type { MandateTrial } from '../../protocol/sandbox';
import { IconLock } from '../ui/icons';

const toMicro = (usd: number) => BigInt(Math.round(usd * 1_000_000));

interface NumFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  prefix?: string;
}

const NumField: React.FC<NumFieldProps> = ({ id, label, value, onChange, step, min, max, prefix }) => (
  <div className="field mb-field">
    <label htmlFor={id}>{label}</label>
    <div className="mb-input">
      {prefix && <span className="subtle">{prefix}</span>}
      <input
        id={id}
        className="input mono"
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ''}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
      />
    </div>
  </div>
);

export const MandateBuilder: React.FC = () => {
  // Owner's policy
  const [maxNotional, setMaxNotional] = useState(560_000);
  const [minPrice, setMinPrice] = useState(0.8);
  const [maxPrice, setMaxPrice] = useState(0.95);
  // Agent's order
  const [price, setPrice] = useState(0.8395);
  const [size, setSize] = useState(600_000);
  const [lying, setLying] = useState(false);

  const [trial, setTrial] = useState<MandateTrial | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notional = price * size;

  useEffect(() => {
    let alive = true;
    setPending(true);
    const t = window.setTimeout(async () => {
      try {
        const { tryMandate } = await import('../../protocol/sandbox');
        const registered = { maxNotional: toMicro(maxNotional), minPrice: toMicro(minPrice), maxPrice: toMicro(maxPrice) };
        // A lying agent claims a 10× looser mandate than the one its owner committed to.
        const claimed = lying ? { ...registered, maxNotional: registered.maxNotional * 10n, maxPrice: registered.maxPrice * 2n } : registered;
        const res = await tryMandate(registered, claimed, { price: toMicro(price), size: BigInt(Math.round(size)) });
        if (alive) {
          setTrial(res);
          setError(null);
        }
      } catch (err: any) {
        if (alive) setError(err?.message ?? String(err));
      } finally {
        if (alive) setPending(false);
      }
    }, 250);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [maxNotional, minPrice, maxPrice, price, size, lying]);

  const checks = [
    { label: `price ≥ mandate floor`, ok: price >= minPrice },
    { label: `price ≤ mandate ceiling`, ok: price <= maxPrice },
    { label: `price × size ≤ max notional`, ok: notional <= maxNotional },
  ];

  return (
    <div className="panel mandate-builder">
      <div className="panel-head" style={{ flexWrap: 'wrap' }}>
        <div>
          <span className="eyebrow">ZK agent mandate</span>
          <h3 className="h3" style={{ marginTop: 6 }}>
            Let an agent trade your treasury without showing anyone its limits
          </h3>
          <p style={{ maxWidth: '68ch' }}>
            The owner commits to a policy on-chain. Every order the agent places carries a proof that it’s inside
            that policy. The chain stores one hash, and the limits stay between the owner and the agent.
          </p>
        </div>
      </div>

      <div className="mb-grid">
        <section className="mb-col" aria-labelledby="mb-owner">
          <h4 id="mb-owner" className="mb-col-title">
            <span className="mb-step">1</span> Owner sets the mandate
          </h4>
          <NumField id="mb-notional" label="Max notional per order" prefix="$" value={maxNotional} onChange={setMaxNotional} step={10_000} min={0} max={50_000_000} />
          <div className="mb-row">
            <NumField id="mb-min" label="Price floor" prefix="$" value={minPrice} onChange={setMinPrice} step={0.01} min={0} max={10} />
            <NumField id="mb-max" label="Price ceiling" prefix="$" value={maxPrice} onChange={setMaxPrice} step={0.01} min={0} max={10} />
          </div>
          <div className="mb-published">
            <div className="k">Published on-chain</div>
            <code className="mono">mandates[agent] = {trial ? `0x${trial.commitment.slice(0, 20)}…` : '…'}</code>
            <div className="subtle" style={{ fontSize: 12.5, marginTop: 6 }}>
              <IconLock width={11} height={11} /> The policy and its salt go to the agent privately.
            </div>
          </div>
        </section>

        <section className="mb-col" aria-labelledby="mb-agent">
          <h4 id="mb-agent" className="mb-col-title">
            <span className="mb-step">2</span> Agent places an order
          </h4>
          <div className="mb-row">
            <NumField id="mb-price" label="Price" prefix="$" value={price} onChange={setPrice} step={0.0005} min={0} max={10} />
            <NumField id="mb-size" label="Size (tokens)" value={size} onChange={setSize} step={10_000} min={1} max={10_000_000} />
          </div>
          <div className="subtle mono" style={{ fontSize: 13, marginBottom: 14 }}>
            notional ${notional.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <label className="mb-toggle">
            <input type="checkbox" checked={lying} onChange={(e) => setLying(e.target.checked)} />
            <span>
              Compromised agent: it claims a mandate <strong>10× looser</strong> than the one the owner committed to
            </span>
          </label>
        </section>

        <section className="mb-col mb-result" aria-labelledby="mb-verdict" aria-live="polite">
          <h4 id="mb-verdict" className="mb-col-title">
            <span className="mb-step">3</span> Circuit verdict
          </h4>
          <div className="constraints">
            <div className={`constraint ${lying ? 'fail' : 'ok'}`}>
              <span className="mark">{lying ? '✕' : '✓'}</span>
              <span>mandate opening matches the owner’s commitment</span>
            </div>
            {checks.map((c) => (
              <div key={c.label} className={`constraint ${c.ok ? 'ok' : 'fail'}`}>
                <span className="mark">{c.ok ? '✓' : '✕'}</span>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
          <div className={`verdict-badge ${trial?.ok ? 'ok' : 'fail'}`} style={{ opacity: pending ? 0.6 : 1 }}>
            <strong>{error ? 'Couldn’t run the circuit' : !trial ? 'Running…' : trial.ok ? 'Proof valid: order accepted' : 'No valid proof: order blocked'}</strong>
            <span className="mono">{error ?? (trial?.ok ? 'submitQuote succeeded' : trial?.reason ?? '')}</span>
          </div>
          <p className="subtle" style={{ fontSize: 12.5, margin: 0 }}>
            The verdict comes from running the compiled <code>submitQuote</code> circuit, not from the checklist above.
          </p>
        </section>
      </div>
    </div>
  );
};
