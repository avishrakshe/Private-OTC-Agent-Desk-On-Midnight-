import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

/* ───────────────────────── helpers ───────────────────────── */

export const compact = (n: number, prefix = '') => {
  const abs = Math.abs(n);
  const s =
    abs >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : abs >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : abs >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${Math.round(n)}`;
  return prefix + s.replace('.0', '');
};

/** Round an axis maximum up to a clean 1 / 2 / 2.5 / 5 × 10^k step. */
const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
};

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    setW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** Smooth path through points (Catmull-Rom → cubic Bézier, clamped to avoid overshoot). */
const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const minY = Math.min(p1[1], p2[1]);
    const maxY = Math.max(p1[1], p2[1]);
    const c1y = Math.min(maxY, Math.max(minY, p1[1] + (p2[1] - p0[1]) * t));
    const c2y = Math.min(maxY, Math.max(minY, p2[1] - (p3[1] - p1[1]) * t));
    d += ` C${p1[0] + (p2[0] - p0[0]) * t},${c1y} ${p2[0] - (p3[0] - p1[0]) * t},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
};

const Tooltip: React.FC<{ x: number; y: number; width: number; children: React.ReactNode }> = ({ x, y, width, children }) => {
  const flip = x > width - 150;
  return (
    <div
      className="chart-tip"
      style={{ left: x, top: y, transform: `translate(${flip ? 'calc(-100% - 14px)' : '14px'}, -50%)` }}
      role="presentation"
    >
      {children}
    </div>
  );
};

const SrTable: React.FC<{ caption: string; head: string[]; rows: (string | number)[][] }> = ({ caption, head, rows }) => (
  <table className="sr-only">
    <caption>{caption}</caption>
    <thead>
      <tr>
        {head.map((h) => (
          <th key={h} scope="col">
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={i}>
          {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
        </tr>
      ))}
    </tbody>
  </table>
);

/* ───────────────────────── Area chart ───────────────────────── */

export interface Point {
  x: string;
  y: number;
}

interface AreaChartProps {
  data: Point[];
  height?: number;
  color?: string;
  label: string;
  format?: (v: number) => string;
}

/** Single-series area/line with crosshair tooltip and keyboard stepping. */
export const AreaChart: React.FC<AreaChartProps> = ({ data, height = 220, color = 'var(--c1)', label, format = (v) => compact(v, '$') }) => {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId().replace(/:/g, '');

  const pad = { l: 44, r: 16, t: 14, b: 28 };
  const plotW = Math.max(0, width - pad.l - pad.r);
  const plotH = height - pad.t - pad.b;
  const max = niceMax(Math.max(...data.map((d) => d.y)) * 1.08);
  const ticks = [0, max / 2, max];

  const pts = useMemo<[number, number][]>(
    () =>
      data.map((d, i) => [
        pad.l + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW),
        pad.t + plotH - (d.y / max) * plotH,
      ]),
    [data, plotW, plotH, max]
  );

  const line = smoothPath(pts);
  const area = pts.length ? `${line} L${pts[pts.length - 1][0]},${pad.t + plotH} L${pts[0][0]},${pad.t + plotH} Z` : '';
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(plotW / 70)));
  const active = hover ?? null;
  const last = pts[pts.length - 1];

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left - pad.l;
    const i = Math.round((x / plotW) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setHover((h) => {
      const cur = h ?? data.length - 1;
      return Math.max(0, Math.min(data.length - 1, cur + (e.key === 'ArrowRight' ? 1 : -1)));
    });
  };

  return (
    <div
      ref={wrapRef}
      className="chart"
      tabIndex={0}
      role="group"
      aria-label={`${label}. Use left and right arrow keys to read values.`}
      onKeyDown={onKey}
      onBlur={() => setHover(null)}
    >
      {width > 0 && (
        <svg width={width} height={height} aria-hidden="true">
          <defs>
            <linearGradient id={`ag-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.22" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => {
            const y = pad.t + plotH - (t / max) * plotH;
            return (
              <g key={t}>
                <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="var(--grid)" strokeWidth="1" />
                <text x={pad.l - 10} y={y} dy="0.32em" textAnchor="end" className="chart-axis">
                  {format(t)}
                </text>
              </g>
            );
          })}
          {data.map((d, i) =>
            i % labelEvery === 0 || i === data.length - 1 ? (
              <text key={d.x} x={pts[i]?.[0]} y={height - 8} textAnchor="middle" className="chart-axis">
                {d.x}
              </text>
            ) : null
          )}
          <path d={area} fill={`url(#ag-${gid})`} className="chart-area" />
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="chart-line" />
          {active !== null && pts[active] && (
            <line x1={pts[active][0]} x2={pts[active][0]} y1={pad.t} y2={pad.t + plotH} stroke="var(--line-strong)" strokeWidth="1" />
          )}
          {last && active === null && (
            <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} stroke="var(--chart-surface)" strokeWidth="2" />
          )}
          {active !== null && pts[active] && (
            <circle cx={pts[active][0]} cy={pts[active][1]} r="5" fill={color} stroke="var(--chart-surface)" strokeWidth="2" />
          )}
          <rect
            x={pad.l}
            y={pad.t}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      )}
      {active !== null && pts[active] && (
        <Tooltip x={pts[active][0]} y={pts[active][1]} width={width}>
          <span className="k">{data[active].x}</span>
          <span className="v">{format(data[active].y)}</span>
        </Tooltip>
      )}
      <SrTable caption={label} head={['Period', 'Value']} rows={data.map((d) => [d.x, format(d.y)])} />
    </div>
  );
};

/* ───────────────────────── Column chart (two series) ───────────────────────── */

export interface Column {
  x: string;
  y: number;
  series: 0 | 1;
}

interface ColumnChartProps {
  data: Column[];
  seriesNames: [string, string];
  colors?: [string, string];
  height?: number;
  label: string;
  format?: (v: number) => string;
}

/** Columns from one baseline, ≤24px wide, 4px rounded data-end, legend for identity. */
export const ColumnChart: React.FC<ColumnChartProps> = ({
  data,
  seriesNames,
  colors = ['var(--c1)', 'var(--c3)'],
  height = 200,
  label,
  format = (v) => compact(v),
}) => {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 40, r: 8, t: 12, b: 28 };
  const plotW = Math.max(0, width - pad.l - pad.r);
  const plotH = height - pad.t - pad.b;
  const max = niceMax(Math.max(...data.map((d) => d.y)) * 1.05);
  const band = plotW / data.length;
  const barW = Math.min(24, band - 2);

  const barPath = (x: number, y: number, w: number, h: number) => {
    const r = Math.min(4, h, w / 2);
    return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
  };

  return (
    <div className="chart" role="group" aria-label={label}>
      <div className="chart-legend" aria-hidden="true">
        {seriesNames.map((n, i) => (
          <span key={n}>
            <i style={{ background: colors[i] }} /> {n}
          </span>
        ))}
      </div>
      <div ref={wrapRef} style={{ position: 'relative' }}>
        {width > 0 && (
          <svg width={width} height={height} aria-hidden="true">
            {[0, max / 2, max].map((t) => {
              const y = pad.t + plotH - (t / max) * plotH;
              return (
                <g key={t}>
                  <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="var(--grid)" strokeWidth="1" />
                  <text x={pad.l - 10} y={y} dy="0.32em" textAnchor="end" className="chart-axis">
                    {format(t)}
                  </text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const h = (d.y / max) * plotH;
              const x = pad.l + band * i + (band - barW) / 2;
              const y = pad.t + plotH - h;
              return (
                <g key={d.x}>
                  <path
                    d={barPath(x, y, barW, h)}
                    fill={colors[d.series]}
                    opacity={hover === null || hover === i ? 1 : 0.4}
                    className="chart-bar"
                    style={{ ['--i' as any]: i }}
                  />
                  {(i % 2 === 0 || data.length < 8) && (
                    <text x={x + barW / 2} y={height - 8} textAnchor="middle" className="chart-axis">
                      {d.x}
                    </text>
                  )}
                  <rect
                    x={pad.l + band * i}
                    y={pad.t}
                    width={band}
                    height={plotH}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`${d.x}: ${format(d.y)} (${seriesNames[d.series]})`}
                    onPointerEnter={() => setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    style={{ outline: 'none' }}
                  />
                </g>
              );
            })}
          </svg>
        )}
        {hover !== null && width > 0 && (
          <Tooltip
            x={pad.l + band * hover + band / 2}
            y={pad.t + plotH - (data[hover].y / max) * plotH}
            width={width}
          >
            <span className="k">
              <i style={{ background: colors[data[hover].series] }} /> {seriesNames[data[hover].series]} · {data[hover].x}
            </span>
            <span className="v">{format(data[hover].y)}</span>
          </Tooltip>
        )}
      </div>
      <SrTable caption={label} head={['Band', 'Side', 'Value']} rows={data.map((d) => [d.x, seriesNames[d.series], format(d.y)])} />
    </div>
  );
};

/* ───────────────────────── Donut ───────────────────────── */

interface Slice {
  label: string;
  value: number;
}

interface DonutProps {
  data: Slice[];
  colors?: string[];
  size?: number;
  label: string;
  centerLabel: string;
  format?: (v: number) => string;
}

/** Part-to-whole (≤ 4 slices), 2px surface gap between segments, legend with values. */
export const Donut: React.FC<DonutProps> = ({
  data,
  colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'],
  size = 168,
  label,
  centerLabel,
  format = (v) => compact(v, '$'),
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 10;
  const stroke = 14;
  const c = 2 * Math.PI * r;
  const GAP = 2; // px of surface between segments

  let acc = 0;
  const arcs = data.map((d) => {
    const frac = d.value / total;
    const start = acc;
    acc += frac;
    return { start, len: Math.max(0, frac * c - GAP) };
  });

  return (
    <div className="donut" role="group" aria-label={label}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--grid)" strokeWidth={stroke} />
          {arcs.map((a, i) => (
            <circle
              key={data[i].label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={colors[i]}
              strokeWidth={hover === i ? stroke + 4 : stroke}
              strokeDasharray={`${a.len} ${c}`}
              strokeDashoffset={-(a.start * c + GAP / 2)}
              opacity={hover === null || hover === i ? 1 : 0.35}
              style={{ transition: 'opacity .2s, stroke-width .2s', cursor: 'pointer' }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <div className="donut-center">
          <span className="v">{format(hover === null ? total : data[hover].value)}</span>
          <span className="k">{hover === null ? centerLabel : data[hover].label}</span>
        </div>
      </div>
      <ul className="donut-legend">
        {data.map((d, i) => (
          <li
            key={d.label}
            tabIndex={0}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            data-dim={hover !== null && hover !== i}
          >
            <i style={{ background: colors[i] }} />
            <span className="name">{d.label}</span>
            <span className="pct">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ───────────────────────── Sparkline ───────────────────────── */

export const Sparkline: React.FC<{ data: number[]; width?: number; height?: number }> = ({ data, width = 96, height = 28 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map<[number, number]>((v, i) => [
    2 + (i / (data.length - 1)) * (width - 6),
    2 + (height - 4) - ((v - min) / (max - min || 1)) * (height - 4),
  ]);
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} aria-hidden="true" className="spark">
      <path d={smoothPath(pts)} fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="var(--lime)" stroke="var(--chart-surface)" strokeWidth="2" />
    </svg>
  );
};

/* ───────────────────────── Gauge (meter) ───────────────────────── */

export const Gauge: React.FC<{ value: number; threshold: number; size?: number; label: string }> = ({
  value,
  threshold,
  size = 112,
  label,
}) => {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const ok = value >= threshold;
  const tAngle = (threshold / 100) * 2 * Math.PI - Math.PI / 2;
  return (
    <div className="gauge" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value} of 100, threshold ${threshold}`}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--grid)" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ok ? 'var(--lime)' : 'var(--coral)'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray .6s var(--ease-out)' }}
        />
        <line
          x1={size / 2 + Math.cos(tAngle) * (r - 9)}
          y1={size / 2 + Math.sin(tAngle) * (r - 9)}
          x2={size / 2 + Math.cos(tAngle) * (r + 9)}
          y2={size / 2 + Math.sin(tAngle) * (r + 9)}
          stroke="var(--text)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="gauge-center">
        <span className="v">{value}</span>
        <span className="k">score</span>
      </div>
    </div>
  );
};
