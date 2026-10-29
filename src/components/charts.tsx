import { useId } from 'react';
import { fmt } from '../lib/dist';

// رسوم SVG مبنية مباشرة من القيم المحسوبة. المحور السيني يسير من اليسار إلى اليمين كما في الرياضيات.
const W = 560;
const H = 300;
const M = { l: 52, r: 14, t: 14, b: 40 };
const PW = W - M.l - M.r;
const PH = H - M.t - M.b;

/** خطوة تدريج «جميلة» (1، 2، 2.5، 5 × 10^k) وحد أعلى من مضاعفاتها. */
function niceScale(v: number) {
  const raw = Math.max(v, 1e-9) / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const max = Math.ceil(v / step - 1e-9) * step;
  return { max, ticks: Array.from({ length: Math.round(max / step) + 1 }, (_, i) => +(i * step).toPrecision(6)) };
}

function tickLabel(v: number) {
  return fmt(v, 4);
}

function Hatch({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="8" height="8" fill={color} opacity="0.35" />
      <line x1="0" y1="0" x2="0" y2="8" stroke={color} strokeWidth="3" />
    </pattern>
  );
}

export interface Bar {
  x: number;
  p: number;
}

export function BarChart({
  bars,
  sim,
  highlight,
  ariaLabel,
  yLabel = 'الاحتمال',
  xLabel,
  curve,
}: {
  bars: Bar[];
  sim?: Bar[] | null;
  highlight?: (x: number) => boolean;
  ariaLabel: string;
  yLabel?: string;
  xLabel: string;
  /** منحنى مستمر يُرسم فوق الأعمدة (مثل تقريب طبيعي)، بالمقياس نفسه. */
  curve?: ((x: number) => number) | null;
}) {
  const uid = useId().replace(/:/g, '');
  const maxP = Math.max(...bars.map((b) => b.p), ...(sim ?? []).map((b) => b.p));
  const { max: yMax, ticks: yt } = niceScale(maxP * 1.05);
  const n = bars.length;
  const slot = PW / n;
  const bw = Math.max(2, Math.min(44, slot * 0.72));
  const y = (p: number) => M.t + PH - (p / yMax) * PH;
  const cx = (i: number) => M.l + slot * (i + 0.5);
  const every = n <= 16 ? 1 : n <= 32 ? 2 : n <= 48 ? 4 : 5;
  const simMap = new Map((sim ?? []).map((b) => [b.x, b.p]));

  return (
    <figure className="chart">
      <div className="chart-ylabel">{yLabel}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} direction="ltr">
        <defs>
          <Hatch id={`h${uid}`} color="var(--accent)" />
        </defs>
        {yt.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={M.l - 6} y={y(t) + 6} textAnchor="end" className="tick">
              {tickLabel(t)}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const hl = highlight?.(b.x);
          return (
            <rect
              key={b.x}
              x={cx(i) - bw / 2}
              y={y(b.p)}
              width={bw}
              height={Math.max(0, M.t + PH - y(b.p))}
              fill={hl ? `url(#h${uid})` : 'var(--theory)'}
              stroke={hl ? 'var(--accent)' : 'none'}
              strokeWidth={hl ? 2 : 0}
              opacity={hl || !highlight ? 1 : 0.55}
            />
          );
        })}
        {bars.map((b, i) => {
          const s = simMap.get(b.x);
          if (s === undefined) return null;
          const yy = y(s);
          return (
            <g key={`s${b.x}`} className="sim-mark">
              <line x1={cx(i) - bw / 2 - 2} x2={cx(i) + bw / 2 + 2} y1={yy} y2={yy} />
              <path d={`M ${cx(i)} ${yy - 6} L ${cx(i) + 6} ${yy} L ${cx(i)} ${yy + 6} L ${cx(i) - 6} ${yy} Z`} />
            </g>
          );
        })}
        {curve && (
          <path
            className="bar-curve"
            d={Array.from({ length: 121 }, (_, j) => {
              const u = -0.5 + (n * j) / 120;
              const xv = bars[0].x + u;
              return `${j ? 'L' : 'M'} ${(M.l + slot * (u + 0.5)).toFixed(2)} ${y(Math.min(curve(xv), yMax)).toFixed(2)}`;
            }).join(' ')}
          />
        )}
        <line x1={M.l} x2={W - M.r} y1={M.t + PH} y2={M.t + PH} className="axis" />
        {bars.map((b, i) =>
          i % every === 0 || i === n - 1 ? (
            <text key={`t${b.x}`} x={cx(i)} y={H - M.b + 24} textAnchor="middle" className="tick">
              {b.x}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="chart-xlabel">{xLabel}</figcaption>
    </figure>
  );
}

export interface Bin {
  x0: number;
  x1: number;
  density: number;
}

export function CurveChart({
  f,
  xMin,
  xMax,
  shade,
  hist,
  markers = [],
  ariaLabel,
  xLabel,
  yLabel = 'الكثافة f(x)',
}: {
  f: (x: number) => number;
  xMin: number;
  xMax: number;
  shade?: [number, number] | null;
  hist?: Bin[] | null;
  markers?: { x: number; label: string }[];
  ariaLabel: string;
  xLabel: string;
  yLabel?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const N = 220;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const x = xMin + ((xMax - xMin) * i) / N;
    return { x, y: f(x) };
  });
  const maxY = Math.max(...pts.map((p) => p.y), ...(hist ?? []).map((b) => b.density));
  const { max: yMax, ticks: yt } = niceScale(maxY * 1.05);
  const X = (x: number) => M.l + ((x - xMin) / (xMax - xMin)) * PW;
  const Y = (v: number) => M.t + PH - (Math.min(v, yMax) / yMax) * PH;
  const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${X(p.x).toFixed(2)} ${Y(p.y).toFixed(2)}`).join(' ');

  let shadePath = '';
  if (shade) {
    const a = Math.max(xMin, Math.min(shade[0], shade[1]));
    const b = Math.min(xMax, Math.max(shade[0], shade[1]));
    if (b > a) {
      const k = 120;
      const sp = Array.from({ length: k + 1 }, (_, i) => a + ((b - a) * i) / k);
      shadePath = `M ${X(a)} ${Y(0)} ` + sp.map((x) => `L ${X(x).toFixed(2)} ${Y(f(x)).toFixed(2)}`).join(' ') + ` L ${X(b)} ${Y(0)} Z`;
    }
  }

  const span = xMax - xMin;
  const raw = span / 6;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let t = Math.ceil(xMin / step) * step; t <= xMax + 1e-9; t += step) ticks.push(+t.toFixed(6));

  return (
    <figure className="chart">
      <div className="chart-ylabel">{yLabel}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} direction="ltr">
        <defs>
          <Hatch id={`c${uid}`} color="var(--accent)" />
        </defs>
        {yt.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={Y(t)} y2={Y(t)} className="grid" />
            <text x={M.l - 6} y={Y(t) + 6} textAnchor="end" className="tick">
              {tickLabel(t)}
            </text>
          </g>
        ))}
        {(hist ?? []).map((b, i) => (
          <rect key={i} x={X(b.x0)} y={Y(b.density)} width={Math.max(0, X(b.x1) - X(b.x0))} height={Math.max(0, Y(0) - Y(b.density))} className="hist" />
        ))}
        {shadePath && <path d={shadePath} fill={`url(#c${uid})`} stroke="var(--accent)" strokeWidth="1.5" />}
        <path d={path} className="curve" />
        {markers.map((m) => (
          <g key={m.label}>
            <line x1={X(m.x)} x2={X(m.x)} y1={M.t} y2={M.t + PH} className="marker" />
            <text x={X(m.x) + 4} y={M.t + 16} className="tick marker-label">
              {m.label}
            </text>
          </g>
        ))}
        <line x1={M.l} x2={W - M.r} y1={M.t + PH} y2={M.t + PH} className="axis" />
        {ticks.map((t) => (
          <text key={t} x={X(t)} y={H - M.b + 24} textAnchor="middle" className="tick">
            {fmt(t, 2)}
          </text>
        ))}
      </svg>
      <figcaption className="chart-xlabel">{xLabel}</figcaption>
    </figure>
  );
}

/** مفتاح الرسم: أشكال مختلفة لا تعتمد على اللون وحده. */
export function Legend({ items }: { items: ('theory' | 'sim' | 'highlight' | 'hist' | 'curve' | 'shade')[] }) {
  const label = {
    theory: 'عمود: الاحتمال النظري',
    sim: 'معيّن ◆: نسبة المحاكاة',
    highlight: 'تظليل مخطط: القيم المختارة',
    hist: 'مستطيلات فاتحة: مدرج المحاكاة',
    curve: 'خط: الكثافة النظرية',
    shade: 'تظليل مخطط: المساحة = الاحتمال',
  } as const;
  return (
    <ul className="legend">
      {items.map((i) => (
        <li key={i}>
          <span className={`key key-${i}`} aria-hidden="true" />
          {label[i]}
        </li>
      ))}
    </ul>
  );
}
