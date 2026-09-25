import React from 'react';
import { Reveal, TiltCard } from '../components/ui/motion';
import {
  IconAgent,
  IconBlock,
  IconBot,
  IconBrain,
  IconChip,
  IconEye,
  IconFingerprint,
  IconLock,
  IconReceipt,
  IconSandwich,
  IconScale,
  IconShield,
  IconTrend,
  IconZap,
} from '../components/ui/icons';

/* ─── Flow lanes ─── */

interface LaneNode {
  at: number; // % position on the track
  label: string;
  icon: React.ReactNode;
  tone?: 'coral' | 'violet' | 'lime' | 'cyan';
}

const toneColor = (tone?: LaneNode['tone']) =>
  tone === 'coral' ? 'var(--coral)' : tone === 'violet' ? 'var(--violet)' : tone === 'lime' ? 'var(--lime)' : tone === 'cyan' ? 'var(--cyan)' : 'var(--text-2)';

const Lane: React.FC<{
  kind: 'public' | 'private';
  title: string;
  tag: React.ReactNode;
  nodes: LaneNode[];
  packets: { cls: string; text: string; from: string; to: string; delay: string; dur?: string; rest: string }[];
  outcome: React.ReactNode;
}> = ({ kind, title, tag, nodes, packets, outcome }) => (
  <div className={`lane lane-${kind}`}>
    <div className="lane-head">
      <h3 className="h3">{title}</h3>
      {tag}
    </div>
    <div className="track" aria-hidden="true">
      <div className="track-line" />
      {nodes.map((n) => (
        <div key={n.label} className="node" style={{ left: `${n.at}%` }}>
          <div className="node-icon" style={{ color: toneColor(n.tone) }}>
            {n.icon}
          </div>
          <div className="node-label">{n.label}</div>
        </div>
      ))}
      {packets.map((p, i) => (
        <span
          key={i}
          className={`packet ${p.cls}`}
          style={{
            ['--from' as any]: p.from,
            ['--to' as any]: p.to,
            ['--delay' as any]: p.delay,
            ['--dur' as any]: p.dur ?? '7s',
            ['--rest' as any]: p.rest,
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
    <p className="sr-only">
      {nodes.map((n) => n.label).join(' → ')}
    </p>
    <div className="lane-outcome">{outcome}</div>
  </div>
);

/* ─── Compact snippet (from contracts/private-otc-desk.compact) ─── */

type Seg = [string, string?];
// Condensed from acceptQuote; the vault and receipt bookkeeping is elided.
const CODE: { hl?: 'private' | 'assert' | 'public'; segs: Seg[] }[] = [
  { segs: [['export circuit ', 'tok-kw'], ['acceptQuote', 'tok-fn'], ['(']] },
  { hl: 'private', segs: [['    terms: '], ['QuoteTerms', 'tok-ty'], [', termsSalt: '], ['Bytes<32>', 'tok-ty'], [',']] },
  { hl: 'private', segs: [['    floorPrice: '], ['Uint<64>', 'tok-ty'], [', mandate: '], ['Mandate', 'tok-ty'], [', …']] },
  { segs: [['): [] {']] },
  { segs: [['    // the maker sealed its quote; only the taker can open it', 'tok-cm']] },
  { hl: 'assert', segs: [['    assert', 'tok-kw'], ['(q.terms == '], ['quoteCommitment', 'tok-fn'], ['(terms, termsSalt), …);']] },
  { segs: [['    // the match: maker quote clears the taker’s private floor', 'tok-cm']] },
  { hl: 'assert', segs: [['    assert', 'tok-kw'], ['(terms.price >= floorPrice, …);']] },
  { hl: 'assert', segs: [['    ', 'tok-kw'], ['checkMandate', 'tok-fn'], ['(taker, mandate, mandateSalt, …);']] },
  { hl: 'assert', segs: [['    ', 'tok-kw'], ['checkOracleBand', 'tok-fn'], ['(terms.price);']] },
  { hl: 'assert', segs: [['    ', 'tok-kw'], ['openBase', 'tok-fn'], ['(taker, baseBalance, baseSalt);']] },
  { hl: 'assert', segs: [['    assert', 'tok-kw'], ['(baseBalance >= terms.size, …);']] },
  { segs: [['']] },
  { segs: [['    // public: rotated commitments, a receipt commitment, counters', 'tok-cm']] },
  { hl: 'public', segs: [['    receipts.'], ['insert', 'tok-fn'], ['(rfq, '], ['disclose', 'tok-fn'], ['('], ['receiptCommitment', 'tok-fn'], ['(…)));']] },
  { hl: 'public', segs: [['    tradesSettled.'], ['increment', 'tok-fn'], ['(1);']] },
  { segs: [['}']] },
];

/* ─── Page ─── */

export const AboutPage: React.FC = () => (
  <>
    {/* Hero */}
    <section className="hero" aria-labelledby="about-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <Reveal>
            <span className="eyebrow">
              <span className="dot" /> About the protocol
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 id="about-title" className="display">
              Every public order is a <span style={{ color: 'var(--coral)' }}>free signal</span> to a bot.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="lead">
              Private OTC Agent Desk moves block trades off the transparent mempool into a sealed RFQ on Midnight.
              Makers commit to quotes, takers prove the match, and nobody else sees a number before the trade.
            </p>
          </Reveal>
          <Reveal delay={240} className="hero-ctas">
            <a className="btn btn-primary" href="#/">
              Open the desk <span className="arrow">→</span>
            </a>
            <button
              type="button"
              className="btn"
              onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See the problem
            </button>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="stack-stage" role="img" aria-label="Three layers: your device holds private inputs, a zero-knowledge proof proves validity, and the ledger stores only commitments.">
            <div className="stack">
              <div className="layer layer-device">
                <div className="layer-label">
                  <b>Your device</b>
                  quotes · floors · mandates · balances
                </div>
              </div>
              <div className="layer layer-proof">
                <div className="layer-label">
                  <b>ZK proof</b>
                  “the rules hold”, nothing more
                </div>
              </div>
              <div className="layer layer-ledger">
                <div className="layer-label">
                  <b>Midnight ledger</b>
                  commitments and counters
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Problem */}
    <section id="problem" className="section" aria-labelledby="problem-title" style={{ scrollMarginTop: 80 }}>
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow" style={{ color: 'var(--coral)' }}>
            The problem
          </span>
          <h2 id="problem-title" className="h2">
            Mempool exposure turns transparency into a tax.
          </h2>
          <p className="lead">
            On a public AMM or DEX, every large order broadcasts its size, limit price and wallet identity before it
            executes. Searcher bots read that signal and trade against it. For a DAO selling a treasury block or a
            fund selling unlocked tokens, the leak happens before the trade, so that is where it has to be closed.
          </p>
        </Reveal>

        <Reveal className="flow">
          <Lane
            kind="public"
            title="Public DEX trade flow"
            tag={<span className="chip chip-coral">Visible to everyone</span>}
            nodes={[
              { at: 8, label: 'Agent order', icon: <IconAgent /> },
              { at: 36, label: 'Public mempool', icon: <IconEye />, tone: 'coral' },
              { at: 64, label: 'MEV bots', icon: <IconBot />, tone: 'coral' },
              { at: 92, label: 'Block', icon: <IconBlock /> },
            ]}
            packets={[
              { cls: 'packet-plain', text: 'BUY 500k @ 1.042', from: '8%', to: '92%', delay: '0s', rest: '36%' },
              { cls: 'packet-bot', text: 'front-run', from: '64%', to: '92%', delay: '2.3s', dur: '3.2s', rest: '72%' },
              { cls: 'packet-bot', text: 'back-run', from: '64%', to: '92%', delay: '4.4s', dur: '3.2s', rest: '84%' },
            ]}
            outcome={
              <>
                <span className="chip chip-coral">Order size leaked</span>
                <span className="chip chip-coral">Sandwiched</span>
                <span className="chip chip-coral">Worse fill</span>
              </>
            }
          />
          <Lane
            kind="private"
            title="Private OTC desk flow"
            tag={<span className="chip chip-lime">Zero alpha leaked</span>}
            nodes={[
              { at: 8, label: 'Agents', icon: <IconAgent />, tone: 'violet' },
              { at: 36, label: 'Sealed quotes', icon: <IconLock />, tone: 'violet' },
              { at: 64, label: 'Taker’s match proof', icon: <IconChip />, tone: 'cyan' },
              { at: 92, label: 'Escrowed settlement', icon: <IconReceipt />, tone: 'lime' },
            ]}
            packets={[
              { cls: 'packet-sealed', text: '●●●●●●', from: '8%', to: '64%', delay: '0s', dur: '4.4s', rest: '22%' },
              { cls: 'packet-sealed', text: 'π proof', from: '64%', to: '92%', delay: '2.6s', dur: '3.4s', rest: '72%' },
              { cls: 'packet-receipt', text: '0x9f3a…c21e', from: '86%', to: '94%', delay: '4.6s', dur: '2.4s', rest: '90%' },
            ]}
            outcome={
              <>
                <span className="chip chip-lime">No mempool signal</span>
                <span className="chip chip-lime">Nothing to front-run</span>
                <span className="chip chip-lime">Commitments only</span>
              </>
            }
          />
        </Reveal>

        <div className="grid-4" style={{ marginTop: 20 }}>
          {[
            {
              icon: <IconZap />,
              title: 'Front-running',
              body: 'Bots see your pending order and buy ahead of it, pushing the price up before you fill.',
            },
            {
              icon: <IconSandwich />,
              title: 'Sandwich attacks',
              body: 'One trade before yours and one after, so you absorb the slippage and they keep the spread.',
            },
            {
              icon: <IconTrend />,
              title: 'Predatory arbitrage',
              body: 'Visible limit prices tell searchers exactly how far they can move the market against you.',
            },
            {
              icon: <IconBrain />,
              title: 'Leaked agent alpha',
              body: 'An AI agent’s strategy is public the moment it trades, so it can be copied or countered instantly.',
            },
          ].map((t, i) => (
            <Reveal key={t.title} delay={i * 80}>
              <TiltCard className="card threat" style={{ height: '100%' }}>
                <div className="card-icon pop-sm">{t.icon}</div>
                <h3 className="h3">{t.title}</h3>
                <p>{t.body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Solution */}
    <section className="section" aria-labelledby="solution-title">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow" style={{ color: 'var(--lime)' }}>
            The solution
          </span>
          <h2 id="solution-title" className="h2">
            Close the leak at the protocol layer.
          </h2>
          <p className="lead">
            Instead of hiding orders better, the desk never publishes them. A prover must know every private input,
            so the match is proven by the one party who legitimately knows both numbers: the taker.
          </p>
        </Reveal>

        <div className="grid-4">
          {[
            {
              icon: <IconScale />,
              title: 'Sealed RFQ',
              body: 'Makers commit to hash(price, size) and send the opening only to the taker. The taker proves quote ≥ its private floor. Clears at the maker’s quote.',
            },
            {
              icon: <IconFingerprint />,
              title: 'ZK agent mandates',
              body: 'Owners commit to a policy. Every agent order proves it stays inside it, without revealing the strategy.',
            },
            {
              icon: <IconShield />,
              title: 'Funds, escrow, oracle band',
              body: 'Quotes lock escrow when posted, takers prove they hold what they sell, and every price is proven to be within ±3% of the oracle TWAP.',
            },
            {
              icon: <IconReceipt />,
              title: 'Auditable by design',
              body: 'Each fill leaves a receipt commitment. The auditor’s viewing key opens it. Regulators get trades, not strategies.',
            },
          ].map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <TiltCard className="card pillar" style={{ height: '100%' }}>
                <span className="card-num pop-sm">0{i + 1}</span>
                <div className="card-icon pop">{p.icon}</div>
                <h3 className="h3 pop-sm">{p.title}</h3>
                <p>{p.body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Circuit */}
    <section className="section" aria-labelledby="circuit-title">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Under the hood</span>
          <h2 id="circuit-title" className="h2">
            The match proof, in one circuit.
          </h2>
          <p className="lead">
            Written in Compact, Midnight’s smart-contract language. Circuit inputs stay private unless explicitly
            passed through <code>disclose()</code>, and only commitments are ever disclosed here.
          </p>
        </Reveal>

        <div className="grid-code">
          <Reveal>
            <TiltCard max={3} className="code-panel">
              <div className="code-bar">
                <span className="dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span>contracts/private-otc-desk.compact</span>
              </div>
              <pre tabIndex={0} aria-label="Condensed Compact source for acceptQuote">
                <code>
                  {CODE.map((line, i) => (
                    <span key={i} className={`code-line ${line.hl ? `hl-${line.hl}` : ''}`}>
                      {line.segs.map(([text, cls], j) => (
                        <span key={j} className={cls}>
                          {text}
                        </span>
                      ))}
                      {'\n'}
                    </span>
                  ))}
                </code>
              </pre>
            </TiltCard>
          </Reveal>

          <Reveal delay={120} className="legend">
            <div className="legend-item">
              <i style={{ background: 'var(--violet)' }} />
              <div>
                <strong>Private inputs</strong>
                <p>
                  The decrypted quote, the taker’s floor, its mandate and its balances. They exist only on the
                  taker’s machine.
                </p>
              </div>
            </div>
            <div className="legend-item">
              <i style={{ background: 'var(--cyan)' }} />
              <div>
                <strong>Proven constraints</strong>
                <p>
                  If any assertion fails, no valid proof exists, so there’s no transaction and nothing to observe.
                </p>
              </div>
            </div>
            <div className="legend-item">
              <i style={{ background: 'var(--lime)' }} />
              <div>
                <strong>Public output</strong>
                <p>
                  Rotated vault commitments, a receipt commitment and counters. The auditor can open the receipt.
                  Nobody else can.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* Visibility matrix */}
    <section className="section" aria-labelledby="matrix-title" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Side by side</span>
          <h2 id="matrix-title" className="h2">
            Who sees what.
          </h2>
        </Reveal>
        <Reveal style={{ overflowX: 'auto' }}>
          <table className="matrix">
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Public DEX mempool</th>
                <th scope="col">Private OTC desk</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Order size', 'Broadcast before execution', 'Commitment; counterparty and auditor only'],
                ['Quote price', 'Readable by any searcher', 'Commitment; opened only by the taker'],
                ['Taker’s limit', 'Readable by any searcher', 'Proven ≤ quote, revealed to nobody'],
                ['Agent’s mandate', 'n/a', 'Commitment; proven on every order'],
                ['Balances', 'Public', 'Commitments (deposit amounts are public)'],
                ['Who traded', 'Linked before execution', 'Pseudonymous keys, visible at settlement'],
              ].map(([row, pub, priv]) => (
                <tr key={row}>
                  <th scope="row">{row}</th>
                  <td className="cell-exposed">{pub}</td>
                  <td className="cell-private">{priv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>

    {/* Scope & roadmap */}
    <section className="section" aria-labelledby="roadmap-title" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Honest scope</span>
          <h2 id="roadmap-title" className="h2">
            What’s built, and what’s next.
          </h2>
        </Reveal>
        <div className="grid-3">
          {[
            {
              title: 'Built',
              tone: 'var(--lime)',
              items: [
                'Sealed RFQ: commit, encrypted quote, taker’s match proof',
                'Proof of funds with escrow at quote time',
                'ZK agent mandates (notional, price floor and ceiling)',
                'Oracle TWAP price band, checked at quote and at match',
                'Receipt commitments plus auditor viewing key',
                'History-derived reputation counters',
                'Treasury Seller and Market Maker reference agents',
              ],
            },
            {
              title: 'Scope today',
              tone: 'var(--amber)',
              items: [
                'One Midnight-native pair per contract; vault balances are accounted in-contract',
                'Sell-side RFQs (the treasury flow); buy-side is the mirror circuit',
                'Deposit amounts are public; balances after that are not',
                'Oracle is a single posting key; RFQ contract is deployed on Preview, but the site’s agents still run it locally',
              ],
            },
            {
              title: 'Roadmap',
              tone: 'var(--violet)',
              items: [
                'SDK + MCP server so any agent can quote, commit and settle',
                'Real shielded token escrow; cross-chain settlement via HTLCs',
                'Maker bonds with slashing; nullifier-based identity (NightPass)',
                'Sealed batch auctions with a bonded solver; MPC/TEE matching',
                'Iceberg orders, size-bucket IOIs, delayed aggregate reporting',
              ],
            },
          ].map((col, i) => (
            <Reveal key={col.title} delay={i * 80}>
              <div className="card" style={{ height: '100%' }}>
                <h3 className="h3" style={{ fontSize: 17, color: col.tone }}>
                  {col.title}
                </h3>
                <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>
                  {col.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Stack */}
    <section className="section" aria-labelledby="stack-title" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Built with</span>
          <h2 id="stack-title" className="h2">
            The stack.
          </h2>
        </Reveal>
        <div className="grid-4">
          {[
            ['Midnight Network', 'Data-protection blockchain with native shielded state.'],
            ['Compact', 'Circuit language that compiles contract logic to ZK constraints.'],
            ['Client-side proofs', 'Proofs are generated on the user’s side, via Lace or a local proof server.'],
            ['Lace wallet', 'Balances fees in DUST, signs, and relays through the DApp connector.'],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="card" style={{ height: '100%' }}>
                <h3 className="h3" style={{ fontSize: 17 }}>
                  {title}
                </h3>
                <p>{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal className="cta-band">
          <div style={{ display: 'grid', gap: 12 }}>
            <span className="eyebrow">Try it</span>
            <h2 className="h2">Settle a real proof on Midnight.</h2>
            <p className="lead" style={{ margin: 0 }}>
              Run the agents, set a mandate and break it, then connect Lace to send a real proof to Midnight Preview.
            </p>
          </div>
          <a className="btn btn-primary" href="#/">
            Open the desk <span className="arrow">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  </>
);
