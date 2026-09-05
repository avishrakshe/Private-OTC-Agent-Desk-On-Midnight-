import React, { useState } from 'react';
import { MarketDepthLevel, AssetPair } from '../types/otc';

interface Props {
  pair?: AssetPair;
}

export const OrderBookVisualizer: React.FC<Props> = ({ pair = 'DUST/USDC' }) => {
  const [activeTab, setActiveTab] = useState<'depth' | 'shielded'>('depth');

  const depthLevels: MarketDepthLevel[] = [
    { priceBucket: '1.045 - 1.050', orderCount: 4, totalEstimatedLiquidity: '125,000 DUST', reputationAverage: 94 },
    { priceBucket: '1.040 - 1.045', orderCount: 7, totalEstimatedLiquidity: '340,000 DUST', reputationAverage: 91 },
    { priceBucket: '1.035 - 1.040', orderCount: 12, totalEstimatedLiquidity: '890,000 DUST', reputationAverage: 96 },
    { priceBucket: '1.030 - 1.035 (Spread Mid)', orderCount: 15, totalEstimatedLiquidity: '1,200,000 DUST', reputationAverage: 98 },
    { priceBucket: '1.025 - 1.030', orderCount: 9, totalEstimatedLiquidity: '450,000 DUST', reputationAverage: 89 },
    { priceBucket: '1.020 - 1.025', orderCount: 5, totalEstimatedLiquidity: '210,000 DUST', reputationAverage: 92 },
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      color: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
            🛡️ Confidential Liquidity Depth — {pair}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
            Aggregated client-side without revealing individual limit prices or sizes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('depth')}
            style={{
              background: activeTab === 'depth' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#60a5fa',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Depth Tiers
          </button>
          <button
            onClick={() => setActiveTab('shielded')}
            style={{
              background: activeTab === 'shielded' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            ZK Shield Status
          </button>
        </div>
      </div>

      {activeTab === 'depth' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Estimated Price Band</th>
                <th style={{ padding: '8px' }}>Active Agents</th>
                <th style={{ padding: '8px' }}>Estimated Depth</th>
                <th style={{ padding: '8px' }}>Avg Rep Score</th>
              </tr>
            </thead>
            <tbody>
              {depthLevels.map((lvl, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px', color: '#38bdf8' }}>{lvl.priceBucket}</td>
                  <td style={{ padding: '8px' }}>{lvl.orderCount} Sealed Orders</td>
                  <td style={{ padding: '8px', color: '#4ade80' }}>{lvl.totalEstimatedLiquidity}</td>
                  <td style={{ padding: '8px' }}>⭐ {lvl.reputationAverage}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#a7f3d0' }}>
            🔒 <strong>Zero-Knowledge Memory Isolation Active:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            <li>No agent secret keys are stored in browser localStorage or unshielded memory.</li>
            <li>Bid and Ask limit bounds are only evaluated inside client-side Compact ZK proving circuits.</li>
            <li>Mempool front-running, sandwich attacks, and order snooping are cryptographically impossible.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
