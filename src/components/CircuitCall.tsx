import React, { useState } from 'react';

interface CircuitCallProps {
  isConnected: boolean;
  runStoreMessage: (
    contractAddress: string,
    message: string,
    onProgress?: (step: string, percent: number) => void
  ) => Promise<string>;
}

type CallStatus = 'idle' | 'executing' | 'success' | 'error';

export const CircuitCall: React.FC<CircuitCallProps> = ({ isConnected, runStoreMessage }) => {
  const [contractAddress, setContractAddress] = useState(
    '7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1'
  );
  const [customMessage, setCustomMessage] = useState('');
  const [status, setStatus] = useState<CallStatus>('idle');
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !contractAddress || !customMessage) return;

    setStatus('executing');
    setErrorMsg(null);
    setTxHash(null);
    setProgressPercent(10);
    setProgressStep('Starting circuit execution...');

    try {
      const hash = await runStoreMessage(contractAddress, customMessage, (step, percent) => {
        setProgressStep(step);
        setProgressPercent(percent);
      });
      
      setStatus('success');
      setTxHash(hash);
    } catch (err: any) {
      console.error('Circuit call execution failed:', err);
      setStatus('error');
      setErrorMsg(err?.message || err?.toString() || 'Execution failed during proof generation or transaction submit.');
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
        opacity: isConnected ? 1 : 0.7,
        pointerEvents: isConnected ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            Circuit Execution (<code style={{ fontSize: '14px', color: '#64748b' }}>settleSealedBidSwap</code>)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Prove state transitions locally with Zero-Knowledge inputs.
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#16a34a',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          🔒 ZK Shielded
        </span>
      </div>

      {!isConnected && (
        <div
          style={{
            textAlign: 'center',
            padding: '24px',
            backgroundColor: '#f8fafc',
            border: '1px border-dash #cbd5e1',
            borderRadius: '14px',
            color: '#64748b',
            fontSize: '14px',
          }}
        >
          🔒 Please connect your Lace wallet to enable smart contract interactions.
        </div>
      )}

      {isConnected && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Contract Address (Preprod Testnet)
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                color: '#0f172a',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Secret Custom Message (Private Witness Input)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. My confidential bid or private payload"
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                color: '#0f172a',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <div
              style={{
                fontSize: '12px',
                color: '#4f46e5',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 500,
              }}
            >
              🔒 <strong>Proved without revealing your input on-chain</strong>
            </div>
          </div>

          <button
            className="lime-btn"
            type="submit"
            disabled={status === 'executing' || !customMessage}
            style={{ width: '100%', padding: '14px 20px', fontSize: '15px' }}
          >
            {status === 'executing' ? 'Executing ZK Circuit...' : 'Run Encrypted Task (settleSealedBidSwap)'}
          </button>

          {/* Progress Stepper */}
          {status === 'executing' && (
            <div
              style={{
                marginTop: '20px',
                padding: '18px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {progressStep}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', fontFamily: 'monospace' }}>
                  {progressPercent}%
                </div>
              </div>
              <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: '#b5f930',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease-in-out',
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', lineHeight: 1.4 }}>
                ℹ️ <strong>Why does ZK Proving take ~15–30 seconds?</strong> Zero-Knowledge proofs execute intense local curve computations to hide your input while proving state updates to validators.
              </div>
            </div>
          )}

          {/* Success Box */}
          {status === 'success' && (
            <div
              style={{
                marginTop: '20px',
                padding: '18px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '14px',
                color: '#15803d',
              }}
            >
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700 }}>✓ Transaction Verified &amp; Submitted</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#166534' }}>
                The circuit was successfully executed and the proof was verified on Preview testnet!
              </p>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Transaction ID:</div>
              <code
                style={{
                  display: 'block',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  padding: '10px',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  color: '#0f172a',
                  wordBreak: 'break-all',
                }}
              >
                {txHash}
              </code>
            </div>
          )}

          {/* Error Box */}
          {status === 'error' && (
            <div
              style={{
                marginTop: '20px',
                padding: '18px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '14px',
                color: '#b91c1c',
              }}
            >
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700 }}>❌ Circuit Execution Failed</h3>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.4 }}>{errorMsg}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
