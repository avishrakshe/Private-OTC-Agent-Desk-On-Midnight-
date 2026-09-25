import React, { useRef } from 'react';
import type { UseMidnightResult } from '../hooks';
import type { OrbMode } from '../components/three/ZkOrb';
import { WalletConnect, networkLabel } from '../components/WalletConnect';
import { CircuitCall, type CallStatus } from '../components/CircuitCall';
import { SealedBidSimulator } from '../components/SealedBidSimulator';
import { AgentDesk } from '../components/agents/AgentDesk';
import { MandateBuilder } from '../components/agents/MandateBuilder';
import { DeskTerminal } from '../components/terminal/DeskTerminal';
import { AudienceCards, CapabilityExplorer, Faq, FeatureTiles, StackMarquee } from '../components/showcase/Showcase';
import { Reveal, useScrollProgress } from '../components/ui/motion';

interface DeskPageProps {
  midnight: UseMidnightResult;
  orbMode: OrbMode;
  onCallStatus: (s: CallStatus) => void;
}

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const CenterHead: React.FC<{ eyebrow: string; title: React.ReactNode; lead?: React.ReactNode; id?: string }> = ({
  eyebrow,
  title,
  lead,
  id,
}) => (
  <Reveal className="center-head">
    <span className="eyebrow">{eyebrow}</span>
    <h2 id={id} className="h2">
      {title}
    </h2>
    {lead && <p className="lead">{lead}</p>}
  </Reveal>
);

export const DeskPage: React.FC<DeskPageProps> = ({ midnight, orbMode, onCallStatus }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  useScrollProgress(stageRef);

  const { isConnected, isConnecting, connect, networkId } = midnight;

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="hero-center" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero-copy" style={{ display: 'grid', gap: 26 }}>
            <Reveal>
              <span className="chip">
                <span className={`status-dot ${isConnected ? 'on' : ''}`} />
                Zero-knowledge OTC · Midnight {networkLabel(networkId)}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 id="hero-title" className="display">
                Nobody sees the order
                <br />
                <span className="grad-text">until it’s filled.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="lead">
                A sealed-RFQ desk for DAO treasuries, market makers and AI agents on Midnight. Quotes are commitments,
                matches are zero-knowledge proofs, and agents trade under mandates they can’t break. MEV bots get
                nothing to front-run.
              </p>
            </Reveal>
            <Reveal delay={240} className="hero-ctas">
              <button type="button" className="btn btn-primary" onClick={() => scrollToId('agents')}>
                Watch the agents trade <span className="arrow">↓</span>
              </button>
              {isConnected ? (
                <button type="button" className="btn" onClick={() => scrollToId('desk')}>
                  Open the live desk
                </button>
              ) : (
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    await connect('preview');
                    scrollToId('desk');
                  }}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <span className="spinner" /> Waiting for Lace…
                    </>
                  ) : (
                    'Connect Lace wallet'
                  )}
                </button>
              )}
            </Reveal>
          </div>

          <div className="terminal-stage" ref={stageRef}>
            <div className="terminal-3d">
              <DeskTerminal orbMode={orbMode} networkLabel={networkLabel(networkId)} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stack marquee ─── */}
      <section className="section-tight" aria-labelledby="stack-title">
        <div className="container">
          <Reveal>
            <h2
              id="stack-title"
              className="h3"
              style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 18, marginBottom: 28 }}
            >
              Built on the Midnight privacy stack
            </h2>
            <StackMarquee />
          </Reveal>
        </div>
      </section>

      {/* ─── Feature tiles ─── */}
      <section className="section" aria-labelledby="features-title">
        <div className="container">
          <CenterHead
            id="features-title"
            eyebrow="Features · protocol guarantees"
            title={
              <>
                The rules every trade is proven against,
                <br />
                whoever is trading.
              </>
            }
            lead="These are properties of the contract, not of any one agent. If an order breaks one, no proof exists, so no transaction exists."
          />
          <FeatureTiles />
        </div>
      </section>

      {/* ─── Agents ─── */}
      <section id="agents" className="section" aria-labelledby="agents-title" style={{ scrollMarginTop: 80 }}>
        <div className="container">
          <CenterHead
            id="agents-title"
            eyebrow="Agents"
            title={
              <>
                Reference agents,
                <br />
                trading under those guarantees.
              </>
            }
            lead="A Treasury Seller slicing a DAO’s block sale, three Market Makers answering with sealed, escrowed quotes, and an auditor checking the result."
          />
          <Reveal>
            <AgentDesk />
          </Reveal>
          <Reveal style={{ marginTop: 20 }}>
            <div className="plug-in">
              <div>
                <span className="eyebrow">Bring your own agent</span>
                <p>
                  These agents are about 250 lines of TypeScript on top of the contract (
                  <code>src/protocol/agents.ts</code>). Any agent that can hold a key and call circuits gets the same
                  guarantees. Next step: package it as an SDK and an MCP server, so any agent framework can request
                  quotes, commit orders and settle.
                </p>
              </div>
              <span className="chip">Roadmap: SDK · MCP server</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Mandate ─── */}
      <section className="section" aria-labelledby="mandate-title" style={{ paddingTop: 24 }}>
        <div className="container">
          <CenterHead
            id="mandate-title"
            eyebrow="Try it"
            title="Set a mandate. Watch the circuit enforce it."
            lead="This is the answer to “I can’t let an AI trade my treasury”: a policy the agent is unable to break, and one nobody else can read."
          />
          <Reveal>
            <MandateBuilder />
          </Reveal>
        </div>
      </section>

      {/* ─── Audience ─── */}
      <section className="section" style={{ paddingTop: 24 }} aria-labelledby="audience-title">
        <div className="container">
          <CenterHead
            id="audience-title"
            eyebrow="Who it’s for"
            title="Built for every desk that moves size."
            lead="If your order is big enough to move the market, it’s big enough to be hunted in a public mempool."
          />
          <AudienceCards />
        </div>
      </section>

      {/* ─── Capability explorer ─── */}
      <section className="section" aria-labelledby="capabilities-title">
        <div className="container">
          <CenterHead
            id="capabilities-title"
            eyebrow="Under the hood"
            title={
              <>
                Six guarantees,
                <br />
                one Compact contract.
              </>
            }
            lead={
              <>
                All in <code>contracts/private-otc-desk.compact</code>: 11 circuits, compiled with Compact 0.31 and
                covered by tests that run the compiled output.
              </>
            }
          />
          <Reveal>
            <CapabilityExplorer />
          </Reveal>
        </div>
      </section>

      {/* ─── Live desk ─── */}
      <section id="desk" className="section" aria-labelledby="desk-title" style={{ scrollMarginTop: 80 }}>
        <div className="container">
          <CenterHead
            id="desk-title"
            eyebrow="Live on Midnight Preview"
            title="Connect, prove, settle."
            lead="This part goes on-chain: your wallet, a deployed Compact contract, a real proof and a real transaction. It uses the storeMessage demo contract. The RFQ contract above is compiled and tested but not yet deployed."
          />
          <div className="desk-grid">
            <Reveal>
              <WalletConnect
                isConnected={midnight.isConnected}
                isConnecting={midnight.isConnecting}
                networkId={midnight.networkId}
                walletAddress={midnight.walletAddress}
                shieldedAddress={midnight.shieldedAddress}
                error={midnight.error}
                connect={midnight.connect}
                disconnect={midnight.disconnect}
              />
            </Reveal>
            <Reveal delay={100}>
              <CircuitCall
                isConnected={midnight.isConnected}
                networkId={midnight.networkId}
                runStoreMessage={midnight.runStoreMessage}
                onStatusChange={onCallStatus}
              />
            </Reveal>
          </div>
          <Reveal style={{ marginTop: 24 }}>
            <SealedBidSimulator />
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="section" aria-labelledby="faq-title">
        <div className="container">
          <CenterHead id="faq-title" eyebrow="FAQ" title="Questions, answered." />
          <Reveal>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="cta-band">
            <div style={{ display: 'grid', gap: 12 }}>
              <span className="eyebrow">Why this exists</span>
              <h2 className="h2">Public order flow is free alpha for MEV bots.</h2>
              <p className="lead" style={{ margin: 0 }}>
                See how sealed bids, client-side proofs and shielded settlement close the mempool leak.
              </p>
            </div>
            <a className="btn btn-primary" href="#/about">
              Read the story <span className="arrow">→</span>
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
};
