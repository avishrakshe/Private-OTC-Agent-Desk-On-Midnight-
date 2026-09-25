import React, { useEffect, useRef, useState } from 'react';
import { AreaChart, ColumnChart, Donut, Sparkline, compact } from '../charts/Charts';
import { ZkOrb, type OrbMode } from '../three/ZkOrb';
import { BrandMark, IconBlock, IconChip, IconLock, IconReceipt, IconShield, IconAgent } from '../ui/icons';
import { prefersReducedMotion } from '../ui/motion';
import { DEPTH, INITIAL_SETTLEMENTS, PAIRS, SPARKS, VOLUME, makeSettlement, type Range, type Settlement } from './demoData';

const ago = (s: number) => (s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`);

/** Live-updating settlement feed (demo): new sealed trades prove, then settle. */
function useSettlementFeed() {
  const [rows, setRows] = useState<Settlement[]>(INITIAL_SETTLEMENTS);
  const seed = useRef(100);

  useEffect(() => {
    const tick = setInterval(() => {
      if (document.hidden) return;
      setRows((prev) => prev.map((r) => ({ ...r, ageSec: r.ageSec + 1 })));
    }, 1000);

    if (prefersReducedMotion()) return () => clearInterval(tick);

    const spawn = setInterval(() => {
      if (document.hidden) return;
      const next = makeSettlement(seed.current++, 0, 'proving');
      setRows((prev) => [next, ...prev].slice(0, 5));
      setTimeout(() => setRows((prev) => prev.map((r) => (r.id === next.id ? { ...r, status: 'settled' } : r))), 2600);
    }, 5200);

    return () => {
      clearInterval(tick);
      clearInterval(spawn);
    };
  }, []);

  return rows;
}

const StatTile: React.FC<{ label: string; value: string; delta: string; spark: number[] }> = ({ label, value, delta, spark }) => (
  <div className="t-stat">
    <span className="t-label">{label}</span>
    <div className="t-stat-row">
      <span className="t-stat-v">{value}</span>
      <Sparkline data={spark} />
    </div>
    <span className="t-delta">{delta}</span>
  </div>
);

export const DeskTerminal: React.FC<{ orbMode: OrbMode; networkLabel: string }> = ({ orbMode, networkLabel }) => {
  const [range, setRange] = useState<Range>('7d');
  const rows = useSettlementFeed();
  const vol = VOLUME[range];
  const total = vol.points.reduce((s, p) => s + p.y, 0);

  return (
    <div className="terminal" aria-label="Desk Terminal preview with demo data" role="region">
      {/* Top bar */}
      <div className="t-top">
        <div className="t-brand">
          <BrandMark className="t-brand-mark" /> Desk Terminal
        </div>
        <div className="t-search" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          Search pair, agent or receipt
        </div>
        <div className="t-top-right">
          <span className="chip" style={{ padding: '4px 10px', fontSize: 11 }}>
            Demo data
          </span>
          <span className="chip chip-lime" style={{ padding: '4px 10px', fontSize: 11 }}>
            <span className="status-dot on" /> {networkLabel}
          </span>
        </div>
      </div>

      <div className="t-shell">
        {/* Rail */}
        <nav className="t-rail" aria-hidden="true">
          {[IconBlock, IconReceipt, IconLock, IconAgent, IconChip, IconShield].map((I, i) => (
            <span key={i} className={i === 0 ? 'on' : ''}>
              <I width={16} height={16} />
            </span>
          ))}
        </nav>

        <div className="t-body">
          {/* Row 1: hero figure + shield */}
          <div className="t-row t-row-hero">
            <div className="t-card t-hero">
              <span className="t-label">Shielded volume settled</span>
              <div className="t-hero-v">{compact(total, '$')}</div>
              <div className="t-hero-meta">
                <span className="t-up">▲ {vol.delta}%</span> <span className="subtle">{vol.period}</span>
              </div>
              <div className="t-actions" aria-hidden="true">
                <span className="t-pill t-pill-on">Place sealed bid</span>
                <span className="t-pill">Register agent</span>
                <span className="t-pill">Export receipts</span>
              </div>
            </div>
            <div className="t-card t-shield">
              <div className="t-shield-orb">
                <ZkOrb mode={orbMode} className="orb-canvas" />
              </div>
              <div className="t-shield-copy">
                <span className="t-label">Mempool exposure</span>
                <div className="t-shield-v">0 bytes</div>
                <span className="subtle" style={{ fontSize: 12 }}>
                  order data broadcast publicly
                </span>
              </div>
            </div>
            <div className="t-stats">
              <StatTile label="Proofs verified" value="1,284" delta="+27 today" spark={SPARKS.proofs} />
              <StatTile label="Active agents" value="53" delta="+4 this week" spark={SPARKS.agents} />
              <StatTile label="Median proof time" value="16s" delta="−2s vs last week" spark={SPARKS.proofTime} />
            </div>
          </div>

          {/* Row 2: volume + pairs */}
          <div className="t-row t-row-2">
            <div className="t-card">
              <div className="t-card-head">
                <span className="t-title">Settlement volume</span>
                <div className="t-range" role="radiogroup" aria-label="Time range">
                  {(['24h', '7d', '30d'] as Range[]).map((r) => (
                    <button key={r} type="button" role="radio" aria-checked={range === r} onClick={() => setRange(r)}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <AreaChart key={range} data={vol.points} label={`Settlement volume, ${range}`} height={210} />
            </div>
            <div className="t-card">
              <div className="t-card-head">
                <span className="t-title">Volume by pair</span>
                <span className="subtle" style={{ fontSize: 12 }}>
                  30d
                </span>
              </div>
              <Donut data={PAIRS} label="Settled volume by pair, last 30 days" centerLabel="Total settled" />
            </div>
          </div>

          {/* Row 3: depth + receipts */}
          <div className="t-row t-row-3">
            <div className="t-card">
              <div className="t-card-head">
                <span className="t-title">Sealed liquidity by price band</span>
                <span className="subtle" style={{ fontSize: 12 }}>
                  aggregated, no individual orders
                </span>
              </div>
              <ColumnChart
                data={DEPTH}
                seriesNames={['Bids', 'Asks']}
                label="Aggregated sealed liquidity by price band"
                height={190}
              />
            </div>
            <div className="t-card">
              <div className="t-card-head">
                <span className="t-title">Recent settlements</span>
                <span className="chip" style={{ padding: '3px 9px', fontSize: 11 }}>
                  <span className="status-dot on" /> live
                </span>
              </div>
              <table className="t-table">
                <thead>
                  <tr>
                    <th scope="col">Receipt</th>
                    <th scope="col">Pair</th>
                    <th scope="col">Size</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="t-row-enter">
                      <td className="mono">
                        0x{r.receipt.slice(0, 6)}…{r.receipt.slice(-4)}
                      </td>
                      <td>{r.pair}</td>
                      <td className="mono subtle" aria-label="hidden">
                        ••••••
                      </td>
                      <td>
                        {r.status === 'settled' ? (
                          <span className="t-status ok">✓ Settled</span>
                        ) : (
                          <span className="t-status run">
                            <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Proving
                          </span>
                        )}
                        <span className="t-age">{ago(r.ageSec)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
