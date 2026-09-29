import React, { useEffect, useState } from 'react';
import { IconExternal } from './ui/icons';
import { APP_NETWORK, DEPLOYMENTS, contractExplorerUrl, networkLabel } from '../deployments';

export type CallStatus = 'idle' | 'executing' | 'success' | 'error';

interface CircuitCallProps {
  isConnected: boolean;
  networkId?: string;
  runStoreMessage: (
    contractAddress: string,
    message: string,
    onProgress?: (step: string, percent: number) => void
  ) => Promise<string>;
  onStatusChange?: (status: CallStatus) => void;
}

export const DEFAULT_CONTRACT = DEPLOYMENTS[APP_NETWORK].storeMessage ?? '';
const APP_NETWORK_LABEL = networkLabel(APP_NETWORK);

// Thresholds match the progress percentages emitted by useMidnight().runStoreMessage.
const STEPS = [
  { at: 25, title: 'Locate contract', desc: 'Read public contract state from the indexer' },
  { at: 40, title: 'Generate ZK proof', desc: 'Circuit executes locally, then a proof is generated' },
  { at: 70, title: 'Balance & sign in Lace', desc: 'Lace adds DUST fees — approve the popup' },
  { at: 85, title: 'Submit', desc: 'Lace relays the sealed transaction' },
  { at: 92, title: 'Finalize', desc: 'Wait for block inclusion via the indexer' },
];

type StepState = 'pending' | 'active' | 'done' | 'error';

export const CircuitCall: React.FC<CircuitCallProps> = ({ isConnected, networkId, runStoreMessage, onStatusChange }) => {
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT);
  const [customMessage, setCustomMessage] = useState('');
  const [status, setStatus] = useState<CallStatus>('idle');
  const [progressStep, setProgressStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const activeIndex = STEPS.reduce((acc, s, i) => (progressPercent >= s.at ? i : acc), -1);

  const stepState = (i: number): StepState => {
    if (status === 'success') return 'done';
    if (status === 'idle') return 'pending';
    const current = Math.max(activeIndex, 0);
    if (i < current) return 'done';
    if (i === current) return status === 'error' ? 'error' : 'active';
    return 'pending';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !contractAddress || !customMessage.trim()) return;

    setStatus('executing');
    setErrorMsg(null);
    setTxHash(null);
    setProgressPercent(5);
    setProgressStep('Preparing circuit…');

    try {
      const hash = await runStoreMessage(contractAddress, customMessage, (step, percent) => {
        setProgressStep(step);
        setProgressPercent(percent);
      });
      setTxHash(hash);
      setProgressPercent(100);
      setStatus('success');
    } catch (err: any) {
      console.error('Circuit call execution failed:', err);
      setErrorMsg(err?.message || String(err) || 'Execution failed during proof generation or submission.');
      setStatus('error');
    }
  };

  const wrongNetwork =
    isConnected && networkId && networkId !== APP_NETWORK && DEFAULT_CONTRACT && contractAddress.trim() === DEFAULT_CONTRACT;
  const busy = status === 'executing';
  const explorerUrl = contractExplorerUrl(contractAddress.trim(), networkId);

  return (
    <div className="panel" style={{ opacity: isConnected ? 1 : 0.72, transition: 'opacity .3s' }}>
      <div className="panel-head">
        <div>
          <span className="eyebrow">Step 2</span>
          <h3 className="h3" style={{ marginTop: 6 }}>
            Run a live circuit
          </h3>
          <p>
            Calls <code>storeMessage</code> on the deployed Compact contract: a real proof, balanced and settled on
            Midnight.
          </p>
        </div>
        <span className="chip chip-violet">ZK circuit</span>
      </div>

      {!isConnected ? (
        <div className="callout">
          <div>
            <strong>Connect a wallet first.</strong> Proving and fee payment happen through Lace, so the circuit
            unlocks once your wallet is authorized.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="contract-address">Contract address</label>
            <input
              id="contract-address"
              className="input mono"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              disabled={busy}
              required
            />
            {wrongNetwork && (
              <div className="callout callout-warn" role="alert">
                <div>
                  You’re on <strong>{networkId}</strong>, but this contract is deployed on{' '}
                  <strong>{APP_NETWORK_LABEL}</strong>. Switch Lace to {APP_NETWORK_LABEL} and reconnect.
                </div>
              </div>
            )}
            {!DEFAULT_CONTRACT && (
              <span className="hint">
                The demo contract isn’t deployed on {APP_NETWORK_LABEL} yet. Paste the address of a deployed{' '}
                <code>storeMessage</code> contract.
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <input
              id="message"
              className="input"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. gm from the private desk"
              maxLength={200}
              disabled={busy}
              required
            />
            <span className="hint">
              This demo circuit <code>disclose()</code>s the message to the public ledger, so don’t enter anything
              secret. The sealed-bid circuit below keeps its inputs private.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy || !customMessage.trim() || !contractAddress.trim()}
          >
            {busy ? (
              <>
                <span className="spinner" /> Proving & settling…
              </>
            ) : (
              <>
                Prove & submit <span className="arrow">→</span>
              </>
            )}
          </button>

          {status !== 'idle' && (
            <>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
                aria-label="Transaction progress"
              >
                <span style={{ width: `${progressPercent}%` }} />
              </div>

              <ol className="pipeline" aria-label="Transaction pipeline">
                {STEPS.map((s, i) => {
                  const state = stepState(i);
                  return (
                    <li key={s.title} data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
                      <span className="step-dot">{state === 'done' ? '✓' : state === 'error' ? '!' : i + 1}</span>
                      <div>
                        <div className="step-title">{s.title}</div>
                        <div className="step-desc">{state === 'active' && progressStep ? progressStep : s.desc}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          <div aria-live="polite">
            {status === 'success' && (
              <div className="callout callout-success" style={{ marginTop: 20, display: 'block' }}>
                <strong>Settled on-chain.</strong> The proof verified and the transaction was finalized.
                <div className="hash-box">
                  <code>{txHash}</code>
                </div>
                {explorerUrl && (
                  <a className="btn btn-sm btn-ghost" style={{ marginTop: 12 }} href={explorerUrl} target="_blank" rel="noreferrer">
                    View contract in explorer <IconExternal width={14} height={14} />
                  </a>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="callout callout-error" role="alert" style={{ marginTop: 20, display: 'block' }}>
                <strong>Transaction didn’t go through.</strong>
                <div style={{ marginTop: 6, wordBreak: 'break-word' }}>{errorMsg}</div>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
