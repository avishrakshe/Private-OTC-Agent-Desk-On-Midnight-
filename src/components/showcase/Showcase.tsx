import React, { useId, useState } from 'react';
import { Gauge } from '../charts/Charts';
import { Reveal, TiltCard } from '../ui/motion';
import {
  IconAgent,
  IconBlock,
  IconBrain,
  IconChip,
  IconLock,
  IconReceipt,
  IconScale,
  IconShield,
  IconTrend,
} from '../ui/icons';

/* ───────────────────── Generated texture art ───────────────────── */

type ArtKind = 'rock' | 'silk' | 'terrain';

/**
 * Procedural backdrops (no image assets): lit fractal noise for rock/terrain,
 * displacement-warped gradients for silk. Purely decorative.
 */
export const TextureArt: React.FC<{ kind: ArtKind; hue?: number; seed?: number; className?: string }> = ({
  kind,
  hue = 255,
  seed = 3,
  className = '',
}) => {
  const id = useId().replace(/:/g, '');

  if (kind === 'silk') {
    return (
      <svg className={`art ${className}`} viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id={`w-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="3" seed={seed} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="140" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
          <linearGradient id={`g1-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={`hsl(${hue} 70% 82%)`} />
            <stop offset="0.45" stopColor={`hsl(${hue} 45% 52%)`} />
            <stop offset="1" stopColor={`hsl(${hue + 30} 50% 18%)`} />
          </linearGradient>
          <linearGradient id={`g2-${id}`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`hsl(${hue - 40} 60% 70%)`} />
            <stop offset="1" stopColor={`hsl(${hue} 40% 12%)`} />
          </linearGradient>
        </defs>
        <g filter={`url(#w-${id})`}>
          <ellipse cx="300" cy="230" rx="250" ry="165" fill={`url(#g1-${id})`} />
          <ellipse cx="390" cy="170" rx="190" ry="95" fill={`url(#g2-${id})`} opacity="0.85" />
          <ellipse cx="210" cy="300" rx="180" ry="80" fill={`url(#g1-${id})`} opacity="0.7" />
          {Array.from({ length: 34 }, (_, i) => (
            <path
              key={i}
              d={`M${90 + i * 13},${80 + (i % 5) * 10} Q300,${230 + (i % 7) * 8} ${520 - i * 7},${380 - (i % 4) * 12}`}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </g>
      </svg>
    );
  }

  const isRock = kind === 'rock';
  return (
    <svg className={`art ${className}`} viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id={`l-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={isRock ? '0.02 0.014' : '0.006 0.02'} numOctaves="7" seed={seed} />
          <feDiffuseLighting lightingColor={isRock ? '#a39a8a' : '#9a9aa6'} surfaceScale={isRock ? 11 : 7} diffuseConstant="1.25">
            <feDistantLight azimuth="235" elevation={isRock ? 24 : 30} />
          </feDiffuseLighting>
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude="0.55" exponent="1.9" />
            <feFuncG type="gamma" amplitude="0.53" exponent="1.9" />
            <feFuncB type="gamma" amplitude="0.5" exponent="1.9" />
          </feComponentTransfer>
        </filter>
        <linearGradient id={`fade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={isRock ? 0 : 1} />
          <stop offset={isRock ? '1' : '0.35'} stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`vig-${id}`} cx="0.42" cy="0.35" r="0.75">
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <clipPath id={`c-${id}`}>
          {isRock ? (
            <path d="M170 60 L430 20 L560 170 L520 380 L330 450 L90 400 L40 210 Z" />
          ) : (
            <path d="M0 460 L0 250 Q90 190 160 215 T300 120 Q360 60 420 130 T600 170 L600 460 Z" />
          )}
        </clipPath>
      </defs>
      <g clipPath={`url(#c-${id})`}>
        <rect width="600" height="460" filter={`url(#l-${id})`} />
        <rect width="600" height="460" fill={`url(#fade-${id})`} />
        {isRock && <rect width="600" height="460" fill={`url(#vig-${id})`} />}
      </g>
    </svg>
  );
};

/* ───────────────────── Glass widgets ───────────────────── */

const WidgetHead: React.FC<{ title: string; live?: boolean; right?: string }> = ({ title, live, right }) => (
  <div className="w-head">
    <span>{title}</span>
    {live ? (
      <span className="w-live">
        <span className="status-dot on" /> LIVE
      </span>
    ) : (
      <span>{right}</span>
    )}
  </div>
);

export const FlowWidget: React.FC = () => (
  <div className="glass">
    <WidgetHead title="WHAT THE MARKET SEES" live />
    {[
      ['RFQ opened', 'id + owner commitment', '0x9f3a…c21e'],
      ['Quote posted', 'terms commitment', '0x41b0…7d02'],
      ['Trade settled', 'receipt commitment', '0xe27c…118f'],
    ].map(([pair, kind, c]) => (
      <div className="w-row" key={pair}>
        <span className="w-tag">
          <IconLock width={12} height={12} />
        </span>
        <div className="w-grow">
          <div>{pair}</div>
          <div className="w-sub">{kind}</div>
        </div>
        <div className="w-right mono">
          <div>{c}</div>
          <div className="w-sub">commitment</div>
        </div>
      </div>
    ))}
    <div className="w-note">
      <span className="w-note-k">SHIELD</span>
      No side, size or price appears before the trade. After it, only commitments.
    </div>
  </div>
);

const CheckRows: React.FC<{ rows: [string, string, boolean][] }> = ({ rows }) => (
  <>
    {rows.map(([a, b, ok]) => (
      <div className="w-check" key={a}>
        <span className={`w-dot ${ok ? 'ok' : 'off'}`}>{ok ? '✓' : '✕'}</span>
        <div>
          <div>{a}</div>
          <div className="w-sub">{b}</div>
        </div>
      </div>
    ))}
  </>
);

export const MandateWidget: React.FC = () => (
  <div className="glass">
    <WidgetHead title="AGENT MANDATE" right="COMMITTED" />
    <div className="w-k">ON-CHAIN</div>
    <div className="mono" style={{ fontSize: 13, margin: '4px 0 12px' }}>
      mandates[agent] = 0x0504…6ef8
    </div>
    <CheckRows
      rows={[
        ['Sell 600k @ $0.8395', 'inside floor, ceiling and notional', true],
        ['Bid $0.905', 'above the owner’s $0.90 ceiling', false],
        ['Claims a looser mandate', 'opening ≠ commitment', false],
      ]}
    />
  </div>
);

export const EscrowWidget: React.FC = () => (
  <div className="glass">
    <WidgetHead title="PROOF OF FUNDS" right="ESCROW AT QUOTE" />
    <div className="w-k">QUOTE BACKED BY</div>
    <div className="w-big">
      commit<span className="subtle">(balance)</span>
    </div>
    <div className="w-delta">balance ≥ price × size, proven</div>
    <CheckRows
      rows={[
        ['Northwind locks $503,684', 'vault commitment rotates', true],
        ['Northwind quotes again with $90k left', 'Insufficient QUOTE funds', false],
        ['Losing makers', 'escrow released after the RFQ closes', true],
      ]}
    />
  </div>
);

export const AuditWidget: React.FC = () => (
  <div className="glass">
    <WidgetHead title="AUDITOR VIEW" right="VIEWING KEY" />
    {[
      ['600,000 DAO → Northwind', '$0.8395'],
      ['600,000 DAO → Northwind', '$0.8435'],
      ['600,000 DAO → Kestrel', '$0.8422'],
    ].map(([a, b], i) => (
      <div className="w-row" key={i}>
        <span className="w-tag">✓</span>
        <div className="w-grow">
          <div>{a}</div>
          <div className="w-sub">receipt matches on-chain commitment</div>
        </div>
        <div className="w-right mono">{b}</div>
      </div>
    ))}
    <div className="w-note">
      <span className="w-note-k">SCOPE</span>
      The auditor sees trades. Floors, mandates and strategy stay with the agents.
    </div>
  </div>
);

export const ReputationWidget: React.FC = () => (
  <div className="glass">
    <WidgetHead title="REPUTATION FROM HISTORY" right="LEDGER COUNTERS" />
    <div className="w-gauge">
      <Gauge value={67} threshold={50} size={96} label="Maker fill rate" />
      <div>
        <div style={{ fontWeight: 500 }}>Fill rate 2 / 3</div>
        <div className="w-sub" style={{ marginTop: 4, lineHeight: 1.5 }}>
          Counted by the contract on every quote and settlement. Nothing is self-reported.
        </div>
      </div>
    </div>
    {[
      ['quotesPosted', 'incremented by submitQuote', true],
      ['fillsSettled', 'incremented by acceptQuote', true],
      ['Self-reported score', 'not accepted', false],
    ].map(([a, b, ok]) => (
      <div className="w-check" key={a as string}>
        <span className={`w-dot ${ok ? 'ok' : 'off'}`}>{ok ? '✓' : '–'}</span>
        <div>
          <div>{a}</div>
          <div className="w-sub">{b}</div>
        </div>
      </div>
    ))}
  </div>
);

export const DiscoveryWidget: React.FC = () => {
  // reference index (public) and a sealed clearing zone (only its existence is known)
  const pts = [60, 58, 61, 57, 52, 54, 49, 47, 50, 46];
  const d = pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${10 + i * 22},${y}`).join(' ');
  return (
    <div className="glass">
      <WidgetHead title="ORACLE BAND · DAO/USDC" right="TWAP ±3%" />
      <svg viewBox="0 0 320 90" className="w-chart" aria-hidden="true">
        <rect x="208" y="14" width="102" height="62" rx="6" fill="var(--c1)" opacity="0.14" />
        <line x1="208" x2="208" y1="10" y2="80" stroke="var(--c1)" strokeWidth="1" />
        <path d={d} fill="none" stroke="#e9e9e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={10 + 9 * 22} cy={46} r="4" fill="#e9e9e6" stroke="#1b1b1d" strokeWidth="2" />
        <text x="216" y="28" className="w-svg-t">
          PROVABLE BAND
        </text>
      </svg>
      <div className="w-legend">
        <span>
          <i style={{ background: '#e9e9e6' }} /> Public oracle TWAP
        </span>
        <span>
          <i style={{ background: 'var(--c1)' }} /> Prices a proof can exist for
        </span>
      </div>
      {[
        ['$0.8395', 'inside band', 'PROVEN', 'ok'],
        ['$0.8422', 'inside band', 'PROVEN', 'ok'],
        ['$0.8842', 'fat finger, +5%', 'NO PROOF', 'off'],
      ].map(([p, s, st, tone]) => (
        <div className="w-row" key={p}>
          <div className="w-grow">{p}</div>
          <div className="w-sub" style={{ width: 90 }}>
            {s}
          </div>
          <span className={`w-badge ${tone}`}>{st}</span>
        </div>
      ))}
    </div>
  );
};

/* ───────────────────── Feature tiles ───────────────────── */

const TILES = [
  {
    art: <TextureArt kind="rock" seed={11} />,
    widget: <FlowWidget />,
    title: 'Pre-trade privacy',
    body: 'MEV happens before execution. Here, intent is never visible in advance: RFQs, quotes and fills go on-chain as commitments, so there’s nothing to front-run.',
  },
  {
    art: <TextureArt kind="silk" hue={262} seed={4} />,
    widget: <MandateWidget />,
    title: 'ZK agent mandates',
    body: 'An owner commits to a private policy: max notional, price floor and ceiling. Every order the agent places proves it’s inside that policy.',
  },
  {
    art: <TextureArt kind="silk" hue={200} seed={9} />,
    widget: <EscrowWidget />,
    title: 'Proof of funds, escrow at quote time',
    body: 'A quote is only valid if the maker proves its vault covers it, and the funds lock when it’s posted. A winning quote can’t fail to settle.',
  },
  {
    art: <TextureArt kind="rock" seed={27} />,
    widget: <DiscoveryWidget />,
    title: 'Oracle price band',
    body: 'Every price is proven to sit within ±3% of the public oracle TWAP. With no visible book, this is what stops manipulation and fat-finger trades.',
  },
];

export const FeatureTiles: React.FC = () => (
  <div className="tiles">
    {TILES.map((t, i) => (
      <Reveal key={t.title} delay={(i % 2) * 90} className="tile">
        <TiltCard max={4} className="tile-media">
          {t.art}
          <div className="tile-widget pop">{t.widget}</div>
        </TiltCard>
        <h3 className="tile-title">{t.title}</h3>
        <p className="tile-body">{t.body}</p>
      </Reveal>
    ))}
  </div>
);

/* ───────────────────── Interactive feature list ───────────────────── */

const CAPABILITIES = [
  {
    title: 'Sealed RFQ match',
    body: 'The maker commits to its quote and sends the opening only to the taker. The taker, the one party that knows both numbers, proves quote ≥ its private floor. The trade clears at the maker’s quote.',
    widget: <FlowWidget />,
  },
  {
    title: 'ZK agent mandates',
    body: 'mandates[agent] holds a commitment to the owner’s policy. submitQuote and acceptQuote both open it inside the circuit and check price and notional against it.',
    widget: <MandateWidget />,
  },
  {
    title: 'Proof of funds and escrow',
    body: 'Vaults are balance commitments. Quoting proves balance ≥ price × size and locks it. Accepting proves the taker holds the size it sells.',
    widget: <EscrowWidget />,
  },
  {
    title: 'Oracle price band',
    body: 'Circuits read the oracle TWAP from the ledger and prove the price sits inside the band, at quote time and again at match time.',
    widget: <DiscoveryWidget />,
  },
  {
    title: 'Selective disclosure',
    body: 'Each fill stores a receipt commitment. Its opening is encrypted to the auditor’s registered viewing key, so trades can be checked without seeing anyone’s strategy.',
    widget: <AuditWidget />,
  },
  {
    title: 'Reputation from history',
    body: 'Fill rate comes from quotesPosted and fillsSettled, which the contract increments itself. There’s no self-reported score to fake.',
    widget: <ReputationWidget />,
  },
];

export const CapabilityExplorer: React.FC = () => {
  const [open, setOpen] = useState(0);
  const baseId = useId();
  return (
    <div className="explorer">
      <div className="explorer-list" role="tablist" aria-orientation="vertical" aria-label="Desk capabilities">
        {CAPABILITIES.map((c, i) => (
          <button
            key={c.title}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={open === i}
            aria-controls={`${baseId}-panel`}
            className="explorer-item"
            onClick={() => setOpen(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const next = (i + (e.key === 'ArrowDown' ? 1 : CAPABILITIES.length - 1)) % CAPABILITIES.length;
                setOpen(next);
                document.getElementById(`${baseId}-tab-${next}`)?.focus();
              }
            }}
          >
            <span className="explorer-title">{c.title}</span>
            <span className="explorer-body">{c.body}</span>
            <span className="explorer-progress" />
          </button>
        ))}
      </div>
      <div
        className="explorer-stage"
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${open}`}
      >
        <TextureArt kind="terrain" seed={5} />
        <div className="explorer-widget" key={open}>
          {CAPABILITIES[open].widget}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────── Stack marquee ───────────────────── */

const STACK = [
  { name: 'Midnight Network', icon: <IconBlock /> },
  { name: 'Compact', icon: <IconChip /> },
  { name: 'Lace Wallet', icon: <IconShield /> },
  { name: 'Midnight.js', icon: <IconReceipt /> },
  { name: 'Zero-knowledge proofs', icon: <IconLock /> },
  { name: 'Shielded state', icon: <IconScale /> },
  { name: 'DApp Connector', icon: <IconAgent /> },
];

export const StackMarquee: React.FC = () => (
  <div className="marquee" aria-label="Built on the Midnight stack">
    <ul className="marquee-track">
      {[...STACK, ...STACK].map((s, i) => (
        <li key={i} aria-hidden={i >= STACK.length}>
          {s.icon}
          {s.name}
        </li>
      ))}
    </ul>
  </div>
);

/* ───────────────────── Audience cards ───────────────────── */

const AUDIENCE = [
  { icon: <IconShield />, title: 'DAO treasuries', body: 'Diversify out of your native token in blocks, without crashing the price or handing searchers a schedule.' },
  { icon: <IconTrend />, title: 'Token unlocks', body: 'Teams and funds sell vested tokens as block trades to known makers instead of into a thin public book.' },
  { icon: <IconScale />, title: 'Market makers', body: 'Quote into sealed flow without exposing inventory, spreads or the limits you’ll accept.' },
  { icon: <IconBrain />, title: 'AI treasury agents', body: 'Let an agent execute under a mandate you committed to. It can prove it stayed inside the mandate, and it can’t move outside it.' },
];

export const AudienceCards: React.FC = () => (
  <div className="grid-4">
    {AUDIENCE.map((a, i) => (
      <Reveal key={a.title} delay={i * 70}>
        <TiltCard max={5} className="aud-card">
          <span className="aud-icon pop-sm">{a.icon}</span>
          <div className="aud-copy">
            <h3 className="h3">{a.title}</h3>
            <p>{a.body}</p>
          </div>
        </TiltCard>
      </Reveal>
    ))}
  </div>
);

/* ───────────────────── FAQ ───────────────────── */

const FAQS = [
  {
    q: 'Who proves the match if the two prices belong to different people?',
    a: 'The taker. A ZK prover has to know every private input, so the desk uses a request-for-quote (RFQ) model. The maker commits to hash(price, size, salt) on-chain and sends the opening to the taker, encrypted to the taker’s key. The taker proves in acceptQuote that the opening matches the commitment and that the quote is at or above its private floor. The counterparty learns the price. The market and the bots don’t.',
  },
  {
    q: 'What price do they trade at?',
    a: 'The maker’s quote, as in any RFQ desk. The taker only proves quote ≥ floor, so its floor is never revealed, not even to the maker.',
  },
  {
    q: 'What does the blockchain actually see?',
    a: 'Before a trade: that an RFQ exists, plus commitments and the pseudonymous keys of makers who quoted. No side, size or price. At settlement: rotated vault commitments, a receipt commitment and counters. Deposit amounts and the oracle TWAP are public by design. Settlement links the trade to the parties’ pseudonymous keys. That is the honest scope: pre-trade privacy is the product.',
  },
  {
    q: 'What stops a party that wins a match from never settling?',
    a: 'Escrow. A maker’s quote is only provable if its vault covers price × size, and those funds lock when the quote is posted. The taker proves it holds the size when it accepts. Settlement is part of the same transaction as the match.',
  },
  {
    q: 'Is the agent demo real?',
    a: 'The agents call the circuits the Compact compiler generated from contracts/private-otc-desk.compact, in your browser, against a local ledger. The asserts are the real ones. Proof generation and submission are skipped. The “Connect, prove, settle” workspace is the part that sends a real transaction on Midnight Preview; it still uses the storeMessage demo contract until the RFQ contract is deployed.',
  },
  {
    q: 'Can my own agent trade on the desk?',
    a: 'That’s the plan. The agents here use a small TypeScript client (src/protocol/agents.ts). Wrapping it as an SDK and an MCP server, so any agent framework can request quotes, commit orders and settle under the same guarantees, is on the roadmap.',
  },
  {
    q: 'Which assets can trade?',
    a: 'For the MVP, one Midnight-native pair per contract, with vault balances accounted inside the contract. Wiring real shielded token transfers, and cross-chain settlement with Midnight as the private matching layer (HTLCs on the origin chain), are roadmap items.',
  },
];

export const Faq: React.FC = () => (
  <div className="faq">
    {FAQS.map((f, i) => (
      <details key={f.q} className="faq-item" open={i === 0}>
        <summary>
          <span>{f.q}</span>
          <span className="faq-plus" aria-hidden="true" />
        </summary>
        <p>{f.a}</p>
      </details>
    ))}
  </div>
);
