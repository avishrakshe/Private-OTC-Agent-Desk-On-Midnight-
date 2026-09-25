import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DeskEvent, Role, ScenarioResult } from '../../protocol/scenario';
import { IconLock } from '../ui/icons';

type Status = 'idle' | 'running' | 'paused' | 'done' | 'error';

const SPEEDS = [
  { label: '1×', ms: 1400 },
  { label: '2×', ms: 700 },
  { label: '4×', ms: 300 },
];

const CAST: { name: string; role: Role; blurb: string }[] = [
  { name: 'Treasury Seller', role: 'treasury', blurb: 'DAO agent selling 1.8M DAO in 3 TWAP slices. Private floor, mandate from the multisig.' },
  { name: 'Northwind MM', role: 'maker', blurb: 'Bids 30 bps under TWAP. Tightest price, smallest balance sheet.' },
  { name: 'Kestrel Liquidity', role: 'maker', blurb: 'Bids 45 bps under TWAP. Deep USDC vault.' },
  { name: 'Arcadia Flow', role: 'maker', blurb: 'Bids 180 bps under TWAP. Its agent has bugs the circuits catch.' },
  { name: 'Auditor', role: 'auditor', blurb: 'Holds the viewing key. Verifies trades after the fact, sees no strategy.' },
];

const ROLE_TONE: Record<Role, string> = {
  treasury: 'var(--lime)',
  maker: 'var(--violet)',
  owner: 'var(--cyan)',
  oracle: 'var(--amber)',
  auditor: 'var(--cyan)',
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const AgentDesk: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [events, setEvents] = useState<DeskEvent[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const gen = useRef<AsyncGenerator<DeskEvent, ScenarioResult> | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const busy = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);

  const stopTimer = () => window.clearTimeout(timer.current);
  useEffect(() => stopTimer, []);

  /** Pull exactly one event from the scenario. Returns false once it has finished. */
  const pull = useCallback(async (): Promise<boolean> => {
    if (busy.current) return true;
    busy.current = true;
    try {
      if (!gen.current) {
        const { runScenario } = await import('../../protocol/scenario');
        gen.current = runScenario();
      }
      const next = await gen.current.next();
      if (next.done) {
        setResult(next.value);
        setStatus('done');
        return false;
      }
      setEvents((evs) => [...evs, next.value]);
      setSelected(next.value.step);
      return true;
    } catch (err: any) {
      console.error('Agent demo failed:', err);
      setError(err?.message ?? String(err));
      setStatus('error');
      return false;
    } finally {
      busy.current = false;
    }
  }, []);

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const loop = useCallback(async () => {
    const more = await pull();
    if (more) timer.current = window.setTimeout(loop, SPEEDS[speedRef.current].ms);
  }, [pull]);

  const play = () => {
    stopTimer();
    setStatus('running');
    loop();
  };

  const pause = () => {
    stopTimer();
    setStatus('paused');
  };

  const step = async () => {
    stopTimer();
    setStatus('paused');
    const more = await pull();
    if (!more) setStatus((s) => (s === 'error' ? s : 'done'));
  };

  const reset = () => {
    stopTimer();
    gen.current = null;
    setEvents([]);
    setSelected(null);
    setResult(null);
    setError(null);
    setStatus('idle');
  };

  // Keep the newest event in view while running.
  useEffect(() => {
    if (status !== 'running') return;
    const el = listRef.current?.lastElementChild as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [events.length, status]);

  const current = events.find((e) => e.step === selected) ?? events[events.length - 1];

  // Reputation straight from on-chain effects, the same counters the contract keeps.
  const stats = useMemo(() => {
    const s: Record<string, { quotes: number; fills: number; blocked: number }> = {};
    for (const e of events) {
      const r = (s[e.actor] ??= { quotes: 0, fills: 0, blocked: 0 });
      if (e.circuit === 'submitQuote' && e.status === 'ok') r.quotes++;
      if (e.circuit === 'claimFill') r.fills++;
      if (e.circuit === 'acceptQuote') r.fills++;
      if (e.status === 'rejected') r.blocked++;
    }
    return s;
  }, [events]);

  const phases = useMemo(() => {
    const out: { phase: string; items: DeskEvent[] }[] = [];
    for (const e of events) {
      const last = out[out.length - 1];
      if (last?.phase === e.phase) last.items.push(e);
      else out.push({ phase: e.phase, items: [e] });
    }
    return out;
  }, [events]);

  const running = status === 'running';
  const rejectedCount = events.filter((e) => e.status === 'rejected').length;
  const chainLines = events.reduce((n, e) => n + e.publicView.length, 0);

  return (
    <div className="panel agent-desk">
      <div className="panel-head" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="eyebrow">Live agents · compiled Compact circuits</span>
          <h3 className="h3" style={{ marginTop: 6 }}>
            A DAO sells 1.8M tokens to three market makers. The market sees commitments.
          </h3>
          <p style={{ maxWidth: '70ch' }}>
            Each agent calls the real circuits from <code>private-otc-desk.compact</code> in your browser against a
            local ledger. Every <code>assert</code> is the one the prover enforces. Proofs aren’t generated and nothing
            is submitted, so it runs in seconds without a wallet.
          </p>
        </div>
        <div className="ad-controls">
          {running ? (
            <button type="button" className="btn btn-sm" onClick={pause}>
              Pause
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={play}
              disabled={status === 'done' || status === 'error'}
            >
              {status === 'idle' ? 'Run the desk' : 'Resume'}
            </button>
          )}
          <button type="button" className="btn btn-sm" onClick={step} disabled={running || status === 'done' || status === 'error'}>
            Step
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={reset} disabled={status === 'idle'}>
            Reset
          </button>
          <div className="segmented" role="radiogroup" aria-label="Playback speed" style={{ ['--count' as any]: SPEEDS.length }}>
            {SPEEDS.map((s, i) => (
              <button key={s.label} type="button" role="radio" aria-checked={speed === i} onClick={() => setSpeed(i)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="ad-cast" aria-label="Agents">
        {CAST.map((c) => {
          const st = stats[c.name];
          const acting = current?.actor === c.name && status !== 'idle';
          return (
            <li key={c.name} className={`ad-agent ${acting ? 'acting' : ''}`} style={{ ['--tone' as any]: ROLE_TONE[c.role] }}>
              <span className="ad-avatar" aria-hidden="true">
                {initials(c.name)}
              </span>
              <div className="ad-agent-body">
                <div className="ad-agent-name">{c.name}</div>
                <div className="ad-agent-blurb">{c.blurb}</div>
                {c.role === 'maker' && (
                  <div className="ad-agent-stats mono">
                    quotes {st?.quotes ?? 0} · fills {st?.fills ?? 0}
                    {st?.blocked ? <span className="ad-blocked"> · blocked {st.blocked}</span> : null}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {status === 'error' && (
        <div className="callout callout-error" role="alert" style={{ display: 'block' }}>
          <strong>The demo couldn’t start.</strong> {error}
          <div className="subtle" style={{ marginTop: 6 }}>
            It needs WebCrypto, which browsers only expose on https or localhost.
          </div>
        </div>
      )}

      {status === 'idle' ? (
        <div className="ad-empty">
          <p>
            Press <strong>Run the desk</strong> to watch deposits, mandates, three sealed RFQ slices, three blocked
            orders and the audit. Or use <strong>Step</strong> to go one transaction at a time.
          </p>
        </div>
      ) : (
        <div className="ad-main">
          <ol className="ad-timeline" ref={listRef} aria-label="Desk events" aria-live="polite">
            {phases.map((ph) => (
              <li key={ph.phase} className="ad-phase">
                <div className="ad-phase-name">{ph.phase}</div>
                <ol>
                  {ph.items.map((e) => (
                    <li key={e.step}>
                      <button
                        type="button"
                        className={`ad-event ${e.status} ${current?.step === e.step ? 'active' : ''}`}
                        onClick={() => {
                          pause();
                          setSelected(e.step);
                        }}
                        aria-current={current?.step === e.step ? 'step' : undefined}
                      >
                        <span className="ad-mark" aria-hidden="true">
                          {e.status === 'rejected' ? '✕' : e.status === 'offchain' ? '•' : '✓'}
                        </span>
                        <span className="ad-event-text">
                          <span className="ad-event-actor" style={{ color: ROLE_TONE[e.role] }}>
                            {e.actor}
                          </span>
                          <span>{e.title}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
            {running && events.length === 0 && <li className="subtle">Loading the compiled contract…</li>}
          </ol>

          {current && (
            <div className="ad-detail" key={current.step}>
              <div className="ad-detail-head">
                <span className="mono subtle">#{current.step}</span>
                <strong>{current.title}</strong>
                {current.circuit && <span className="chip chip-violet">{current.circuit}</span>}
                {current.status === 'rejected' && <span className="chip chip-coral">no proof → no tx</span>}
                {current.status === 'offchain' && <span className="chip">off-chain</span>}
              </div>
              <div className="ad-views">
                <section className="ad-view ad-private" aria-label="Agent's private view">
                  <h4>
                    <IconLock width={13} height={13} /> {current.actor} knows
                  </h4>
                  <ul>
                    {current.privateView.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </section>
                <section className="ad-view ad-public" aria-label="Chain's public view">
                  <h4>The chain sees</h4>
                  {current.publicView.length ? (
                    <ul className="mono">
                      {current.publicView.map((l, i) => (
                        <li key={i} className={l.startsWith('tx ') ? 'tx' : l.startsWith('-') ? 'del' : l.startsWith('+') ? 'add' : 'chg'}>
                          {l}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="subtle">
                      {current.status === 'rejected'
                        ? 'Nothing. The circuit’s assert failed, so no proof and no transaction exist.'
                        : 'Nothing. This step happens off-chain between the parties.'}
                    </p>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="ad-summary">
          <div className="ad-summary-stat">
            <span className="k">Sold</span>
            <span className="v">{result.audits.reduce((a, x) => a + Number(x.size), 0).toLocaleString('en-US')} DAO</span>
          </div>
          <div className="ad-summary-stat">
            <span className="k">Receipts verified by auditor</span>
            <span className="v">
              {result.audits.filter((a) => a.ok).length}/{result.audits.length}
            </span>
          </div>
          <div className="ad-summary-stat">
            <span className="k">Bad orders blocked in-circuit</span>
            <span className="v">{rejectedCount}</span>
          </div>
          <div className="ad-summary-stat">
            <span className="k">Prices or sizes the chain saw</span>
            <span className="v" style={{ color: 'var(--lime)' }}>
              0
            </span>
          </div>
          <p className="subtle" style={{ gridColumn: '1 / -1', margin: 0 }}>
            {chainLines} public ledger changes, all of them commitments, keys or counters. Deposit amounts and the oracle
            TWAP are public by design.
          </p>
        </div>
      )}
    </div>
  );
};
