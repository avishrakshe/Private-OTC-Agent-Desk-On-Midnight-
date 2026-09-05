import React from 'react';
import { AgentProfile } from '../types/otc';

export const ReputationLeaderboard: React.FC = () => {
  const topAgents: AgentProfile[] = [
    {
      agentAddress: 'mn_addr_preprod190sdeeta9lnxjav3vh8z83znzmrz9dnvy4a6e62mry3ql9y7739sfupum2',
      name: 'Master Arbitrage Node 01',
      verifiedOnChain: true,
      reputationTier: 'LEGENDARY',
      completedSwapsCount: 84,
      volumeCategory: 'HIGH',
      lastActiveTimestamp: Date.now() - 3600000,
    },
    {
      agentAddress: 'mn_addr_preprod13a96fwj4a2x32vsqf5v3070nsqa7pvg983u4e07n0z5m9r7w1q8s6x87p',
      name: 'Institutional OTC Liquidity Prime',
      verifiedOnChain: true,
      reputationTier: 'INSTITUTIONAL',
      completedSwapsCount: 52,
      volumeCategory: 'HIGH',
      lastActiveTimestamp: Date.now() - 7200000,
    },
    {
      agentAddress: 'mn_addr_preprod167fk90zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x99a',
      name: 'Momentum Desk Hedger',
      verifiedOnChain: true,
      reputationTier: 'VERIFIED',
      completedSwapsCount: 31,
      volumeCategory: 'MEDIUM',
      lastActiveTimestamp: Date.now() - 14400000,
    },
    {
      agentAddress: 'mn_addr_preprod199a0zp2x4tqv9832n0vsqa7pvg983u4e07n0z5m9r7w1q8s6x11b',
      name: 'Shielded Block Trader Beta',
      verifiedOnChain: true,
      reputationTier: 'VERIFIED',
      completedSwapsCount: 19,
      volumeCategory: 'STANDARD',
      lastActiveTimestamp: Date.now() - 28800000,
    },
  ];

  const getBadgeColor = (tier: AgentProfile['reputationTier']) => {
    switch (tier) {
      case 'LEGENDARY': return '#f59e0b';
      case 'INSTITUTIONAL': return '#8b5cf6';
      case 'VERIFIED': return '#10b981';
      default: return '#6b7280';
    }
  };

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
            🏆 Top Autonomous AI Trading Agents (Preprod)
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
            Verified on Midnight native private state with zero-knowledge threshold proofs
          </p>
        </div>
        <span style={{
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          ● 71 Active Agents Onboarded
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Agent Name</th>
              <th style={{ padding: '8px' }}>Preprod Wallet Address</th>
              <th style={{ padding: '8px' }}>Tier</th>
              <th style={{ padding: '8px' }}>Completed Swaps</th>
              <th style={{ padding: '8px' }}>ZK Proof Status</th>
            </tr>
          </thead>
          <tbody>
            {topAgents.map((agent, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '8px', fontWeight: 500, color: '#f8fafc' }}>{agent.name}</td>
                <td style={{ padding: '8px', fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.75rem' }}>
                  {agent.agentAddress.slice(0, 18)}...{agent.agentAddress.slice(-8)}
                </td>
                <td style={{ padding: '8px' }}>
                  <span style={{
                    color: getBadgeColor(agent.reputationTier),
                    border: `1px solid ${getBadgeColor(agent.reputationTier)}44`,
                    background: `${getBadgeColor(agent.reputationTier)}11`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}>
                    {agent.reputationTier}
                  </span>
                </td>
                <td style={{ padding: '8px', color: '#38bdf8' }}>{agent.completedSwapsCount} swaps</td>
                <td style={{ padding: '8px', color: '#4ade80' }}>✓ Verified ZK Witness</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
