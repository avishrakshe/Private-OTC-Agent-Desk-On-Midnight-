import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeskEvent, Role, ScenarioResult } from '../../protocol/scenario';
import type { OnChainRoundResult } from '../../protocol/onchain-round';
import { IconExternal, IconLock } from '../ui/icons';

type Status = 'idle' | 'running' | 'paused' | 'done' | 'error';
type Mode = 'local' | 'chain';

/** What the on-chain mode needs from the wallet hook. */
export interface AgentDeskWallet {
  isConnected: boolean;
  isConnecting: boolean;
  networkId: string;
  connect: (network: string) => Promise<void>;
  buildProviders: (zkPath: string, onProgress?: (step: string, percent: number) => void) => Promise<MidnightProviders<any, any, any>>;
}

const SPEEDS = [
  { label: '1×', ms: 1400 },
  { label: '2×', ms: 700 },
  { label: '4×', ms: 300 },
];

const CAST: { name: string; role: Role; blurb: string; onChain?: boolean }[] = [
  { name: 'Treasury Seller', role: 'treasury', blurb: 'DAO agent selling DAO in TWAP slices. Private floor, mandate from the multisig.', onChain: true },
  { name: 'Northwind MM', role: 'maker', blurb: 'Bids 30 bps under TWAP. Tightest price, smallest balance sheet.', onChain: true },
  { name: 'Kestrel Liquidity', role: 'maker', blurb: 'Bids 45 bps under TWAP. Deep USDC vault.' },
  { name: 'Arcadia Flow', role: 'maker', blurb: 'Bids 180 bps under TWAP. Its agent has bugs the circuits catch.' },
  { name: 'Auditor', role: 'auditor', blurb: 'Holds the viewing key. Verifies trades after the fact, sees no strategy.', onChain: true },
];

const ROLE_TONE: Record<Role, string> = {
  treasury: 'var(--lime)',
  maker: 'var(--violet)',
  owner: 'var(--cyan)',
  oracle: 'var(--amber)',
  auditor: 'var(--cyan)',
};

const EXPLORER: Record<string, string> = { preview: 'https://preview.midnightexplorer.com' };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const errorText = (err: any): string => {
  const parts: string[] = [];
  for (let cur = err, d = 0; cur && d < 5; cur = cur.cause, d++) {
    const m = String(cur?.message ?? cur);
    if (m && !parts.includes(m)) parts.push(m);
  }
  return parts.join(' → ') || 'Unknown error';
};

export const AgentDesk: React.FC<{ wallet?: AgentDeskWallet }> = ({ wallet }) => {
  const [mode, setMode] = useState<Mode>('local');
  const [status, setStatus] = useState<Status>('idle');
  const [events, setEvents] = useState<DeskEvent[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [chainResult, setChainResult] = useState<OnChainRoundResult | null>(null);
  const [chainLine, setChainLine] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const gen = useRef<AsyncGenerator<DeskEvent, ScenarioResult> | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const busy = useRef(false);
  /** Bumped on reset so a run still in flight stops writing into the UI. */
  const runId = useRef(0);
  const listRef = useRef<HTMLOListElement>(null);

  const stopTimer = () => window.clearTimeout(timer.current);
  useEffect(() => stopTimer, []);

  /** Pull exactly one event from the local scenario. Returns false once it has finished. */
  const pull = useCallback(async (): Promise<boolean> => {
    if (busy.current) return true;
    busy.current = true;
    const id = runId.current;
    try {
      if (!gen.current) {
        const { runScenario } = await import('../../protocol/scenario');
        gen.current = runScenario();
      }
      const next = await gen.current.next();
      if (id !== runId.current) return false;
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
      setError(errorText(err));
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
    if (mode === 'local' && status === 'running') setStatus('paused');
  };

  const step = async () => {
    stopTimer();
    setStatus('paused');
    const more = await pull();
    if (!more) setStatus((s) => (s === 'error' ? s : 'done'));
  };

  const reset = () => {
    stopTimer();
    runId.current++;
    gen.current = null;
    setEvents([]);
    setSelected(null);
    setResult(null);
    setChainResult(null);
    setChainLine('');
    setError(null);
    setStatus('idle');
  };

  /** Deploys a fresh desk through Lace and runs one round with real transactions. */
  const runOnChain = async () => {
    if (!wallet?.isConnected) return;
    reset();
    const id = runId.current;
    setStatus('running');
    setChainLine('Loading the contract and ZK artifacts…');
    try {
      const [{ runOnChainRound }, { otcCompiledContract }] = await Promise.all([
        import('../../protocol/onchain-round'),
        import('../../protocol/chain'),
      ]);
      const providers = await wallet.buildProviders('managed/private-otc-desk', (s) => id === runId.current && setChainLine(s));
      const round = runOnChainRound({
        providers: providers as any,
        compiledContract: otcCompiledContract(),
        onStatus: (s) => id === runId.current && setChainLine(s),
      });
      for (let next = await round.next(); ; next = await round.next()) {
        if (id !== runId.current) return;
        if (next.done) {
          setChainResult(next.value);
          break;
        }
        const ev = next.value;
        setEvents((evs) => [...evs, ev]);
        setSelected(ev.step);
      }
      setStatus('done');
    } catch (err: any) {
      if (id !== runId.current) return;
      console.error('On-chain round failed:', err);
      setError(errorText(err));
      setStatus('error');
    }
  };

  const switchMode = (m: Mode) => {
    if (m === mode || status === 'running') return;
    reset();
    setMode(m);
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
  const txCount = events.reduce((n, e) => n + (e.txIds?.length ?? 0), 0);
  const network = wallet?.networkId ?? 'preview';
  const explorer = EXPLORER[network];
  const cast = mode === 'chain' ? CAST.filter((c) => c.onChain) : CAST;

  return (
    <div className="panel agent-desk">
      <div className="panel-head" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="eyebrow">Live agents · compiled Compact circuits</span>
          <h3 className="h3" style={{ marginTop: 6 }}>
            {mode === 'local'
              ? 'A DAO sells 1.8M tokens to three market makers. The market sees commitments.'
              : 'The same agents, trading on Midnight through your wallet.'}
          </h3>
          <p style={{ maxWidth: '70ch' }}>
            {mode === 'local' ? (
              <>
                Each agent calls the real circuits from <code>private-otc-desk.compact</code> in your browser against a
                local ledger. Every <code>assert</code> is the one the prover enforces. Proofs aren’t generated and
                nothing is submitted, so it runs in seconds without a wallet.
              </>
            ) : (
              <>
                Deploys a fresh desk from your Lace wallet on <strong>{network}</strong>, then runs one sealed RFQ:
                deposits, mandates, a blocked fat-finger quote, a sealed quote, the match proof, the claim and the audit.
                That’s <strong>11 transactions</strong>, each proved and approved in Lace, with fees paid in DUST.
                Allow 10–20 minutes. The agents’ keys live only in this tab.
              </>
            )}
          </p>
        </div>
        <div className="ad-controls">
          <div className="segmented" role="radiogroup" aria-label="Where the agents run" style={{ ['--count' as any]: 2, minWidth: 250 }}>
            <button type="button" role="radio" aria-checked={mode === 'local'} onClick={() => switchMode('local')} disabled={running}>
              Instant (local)
            </button>
            <button type="button" role="radio" aria-checked={mode === 'chain'} onClick={() => switchMode('chain')} disabled={running}>
              On Midnight (Lace)
            </button>
          </div>
          {mode === 'local' ? (
            <>
              {running ? (
                <button type="button" className="btn btn-sm" onClick={pause}>
                  Pause
                </button>
              ) : (
                <button type="button" className="btn btn-sm btn-primary" onClick={play} disabled={status === 'done' || status === 'error'}>
                  {status === 'idle' ? 'Run the desk' : 'Resume'}
                </button>
              )}
              <button type="button" className="btn btn-sm" onClick={step} disabled={running || status === 'done' || status === 'error'}>
                Step
              </button>
              <div className="segmented" role="radiogroup" aria-label="Playback speed" style={{ ['--count' as any]: SPEEDS.length }}>
                {SPEEDS.map((s, i) => (
                  <button key={s.label} type="button" role="radio" aria-checked={speed === i} onClick={() => setSpeed(i)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          ) : !wallet?.isConnected ? (
            <button type="button" className="btn btn-sm btn-primary" onClick={() => wallet?.connect(network)} disabled={!wallet || wallet.isConnecting}>
              {wallet?.isConnecting ? 'Waiting for Lace…' : 'Connect Lace first'}
            </button>
          ) : (
            <button type="button" className="btn btn-sm btn-primary" onClick={runOnChain} disabled={running}>
              {running ? 'Running on-chain…' : `Deploy & run on ${network}`}
            </button>
          )}
          <button type="button" className="btn btn-sm btn-ghost" onClick={reset} disabled={status === 'idle' || (mode === 'chain' && running)}>
            Reset
          </button>
        </div>
      </div>

      <ul className="ad-cast" aria-label="Agents">
        {cast.map((c) => {
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

      {mode === 'chain' && running && (
        <div className="callout" role="status" aria-live="polite" style={{ marginBottom: 16 }}>
          <span className="spinner" /> <span>{chainLine || 'Working…'}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="callout callout-error" role="alert" style={{ display: 'block', marginBottom: 16 }}>
          <strong>{mode === 'chain' ? 'The on-chain round stopped.' : 'The demo couldn’t start.'}</strong> {error}
          <div className="subtle" style={{ marginTop: 6 }}>
            {mode === 'chain'
              ? 'Check that Lace is unlocked, synced, on the same network and has DUST. Steps already confirmed stay on-chain.'
              : 'It needs WebCrypto, which browsers only expose on https or localhost.'}
          </div>
        </div>
      )}

      {status === 'idle' ? (
        <div className="ad-empty">
          {mode === 'local' ? (
            <p>
              Press <strong>Run the desk</strong> to watch deposits, mandates, three sealed RFQ slices, three blocked
              orders and the audit. Or use <strong>Step</strong> to go one transaction at a time.
            </p>
          ) : (
            <p>
              {wallet?.isConnected ? (
                <>
                  Press <strong>Deploy &amp; run on {network}</strong>. Lace will ask you to approve each transaction. You
                  need DUST for fees; the tokens traded are accounted inside the new desk contract, not taken from your
                  wallet.
                </>
              ) : (
                <>Connect Lace (with Midnight enabled and some DUST) to run the agents on-chain.</>
              )}
            </p>
          )}
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
            {running && events.length === 0 && (
              <li className="subtle" style={{ padding: 10 }}>
                {mode === 'chain' ? 'Deploying the desk…' : 'Loading the compiled contract…'}
              </li>
            )}
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
                  {!!current.txIds?.length && (
                    <ul className="mono ad-txids" aria-label="Transactions">
                      {current.txIds.map((t) => (
                        <li key={t}>tx {t}</li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      )}

      {result && mode === 'local' && (
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

      {chainResult && mode === 'chain' && (
        <div className="ad-summary">
          <div className="ad-summary-stat">
            <span className="k">Transactions on {network}</span>
            <span className="v">{txCount}</span>
          </div>
          <div className="ad-summary-stat">
            <span className="k">Receipt verified by auditor</span>
            <span className="v" style={{ color: chainResult.auditOk ? 'var(--lime)' : 'var(--coral)' }}>
              {chainResult.auditOk ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="ad-summary-stat">
            <span className="k">Bad orders blocked before proving</span>
            <span className="v">{rejectedCount}</span>
          </div>
          <div className="ad-summary-stat">
            <span className="k">Your desk</span>
            {explorer ? (
              <a className="v mono" style={{ fontSize: 15 }} href={`${explorer}/contracts/${chainResult.address}`} target="_blank" rel="noreferrer">
                {chainResult.address.slice(0, 10)}… <IconExternal width={13} height={13} />
              </a>
            ) : (
              <span className="v mono" style={{ fontSize: 15 }}>
                {chainResult.address.slice(0, 10)}…
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
