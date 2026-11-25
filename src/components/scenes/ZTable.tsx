import { useEffect, useRef, useState } from 'react';
import { fmt, normal } from '../../lib/dist';
import { CurveChart, Legend } from '../charts';
import { Rich, Tex } from '../Tex';
import { Slider } from '../ui';
import { useUiLang } from '../../lib/lang';

const PHI = (z: number) => normal.cdf(z, 0, 1);
const COLS = Array.from({ length: 10 }, (_, i) => i / 100);

/** من x إلى z إلى Φ(z): التحويل إلى الطبيعي المعياري، ثم قراءة الجدول كما في الاختبار. */
export function ZTable() {
  const en = useUiLang() === 'en';
  const tr = (ar: string, e: string) => (en ? e : ar);
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [x, setX] = useState(120);
  const lo = mu - 3.4 * sigma, hi = mu + 3.4 * sigma;
  const xx = Math.min(Math.floor(hi), Math.max(Math.ceil(lo), x));
  // الجدول يقرأ z بمنزلتين عشريتين
  const z = Math.round(((xx - mu) / sigma) * 100) / 100;
  const a = Math.abs(z);
  const row = Math.floor(a * 10 + 1e-9) / 10;
  const col = Math.round((a - row) * 100) / 100;
  const wrap = useRef<HTMLDivElement>(null);
  // الخلية المقروءة تبقى ظاهرة في الجدول المقتطع على الشاشات الضيقة
  useEffect(() => {
    const w = wrap.current, cell = w?.querySelector<HTMLElement>('td.on');
    if (w && cell) w.scrollLeft = cell.offsetLeft - w.clientWidth / 2 + cell.clientWidth / 2;
  }, [row, col]);
  const rows = [row - 0.1, row, row + 0.1].filter((r) => r >= -1e-9 && r <= 3.4 + 1e-9).map((r) => Math.round(r * 10) / 10);
  return (
    <div className="lab ztable">
      <div className="slider-grid">
        <Slider label={tr('المتوسط', 'Mean')} symbol="\mu" value={mu} onChange={setMu} min={0} max={200} step={5} digits={0} />
        <Slider label={tr('الانحراف المعياري', 'Standard deviation')} symbol="\sigma" value={sigma} onChange={setSigma} min={1} max={40} step={1} digits={0} />
        <Slider label={tr('القيمة', 'Value')} symbol="x" value={xx} onChange={setX} min={Math.ceil(lo)} max={Math.floor(hi)} step={1} digits={0} />
      </div>
      <p className="prob-line">
        <Tex tex={`z = \\frac{x - \\mu}{\\sigma} = \\frac{${fmt(xx, 0)} - ${mu}}{${sigma}} = ${z.toFixed(2)}`} />
      </p>
      <CurveChart
        f={(t) => normal.pdf(t, 0, 1)}
        xMin={-4}
        xMax={4}
        shade={[-4, z]}
        markers={[{ x: z, label: 'z' }]}
        ariaLabel={tr(`المنحنى الطبيعي المعياري، والمساحة المظللة يسار z = ${z.toFixed(2)} تساوي ${fmt(PHI(z), 4)}`, `The standard normal curve; the shaded area left of z = ${z.toFixed(2)} equals ${fmt(PHI(z), 4)}`)}
        xLabel="z"
        yLabel="φ(z)"
      />
      <Legend items={['curve', 'shade']} />
      <p className="prob-line">
        <Tex tex={`P(X \\le ${fmt(xx, 0)}) = \\Phi(${z.toFixed(2)}) = ${PHI(z).toFixed(4)}`} />
      </p>
      <p className="hint">
        {z < 0 ? (
          <Rich text={`${tr('الجدول للقيم الموجبة', 'The table is for positive values')}: $\\Phi(${z.toFixed(2)}) = 1 - \\Phi(${a.toFixed(2)}) = 1 - ${PHI(a).toFixed(4)}$.`} />
        ) : (
          <Rich text={tr(`اقرأ الصف $${row.toFixed(1)}$ والعمود $${col.toFixed(2)}$.`, `Read row $${row.toFixed(1)}$ and column $${col.toFixed(2)}$.`)} />
        )}
      </p>
      <div className="ztable-wrap" ref={wrap} dir="ltr" tabIndex={0} role="region" aria-label={tr('مقتطف من جدول الطبيعي المعياري حول قيمة z الحالية', 'An excerpt of the standard normal table around the current z')}>
        <table className="ztab">
          <thead>
            <tr>
              <th scope="col">z</th>
              {COLS.map((c) => (
                <th key={c} scope="col" className={Math.abs(c - col) < 1e-9 ? 'hl' : ''}>{c.toFixed(2)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r}>
                <th scope="row" className={Math.abs(r - row) < 1e-9 ? 'hl' : ''}>{r.toFixed(1)}</th>
                {COLS.map((c) => {
                  const on = Math.abs(r - row) < 1e-9 && Math.abs(c - col) < 1e-9;
                  return (
                    <td key={c} className={on ? 'on' : ''} aria-current={on ? 'true' : undefined}>
                      {PHI(r + c).toFixed(4)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="z-rules">
        <Rich as="li" text="$P(X > x) = 1 - \Phi(z)$" />
        <Rich as="li" text={tr('$\\Phi(-z) = 1 - \\Phi(z)$: يكفي جدول القيم الموجبة.', '$\\Phi(-z) = 1 - \\Phi(z)$: a table of positive values is enough.')} />
        <Rich as="li" text="$P(a < X < b) = \Phi(z_b) - \Phi(z_a)$" />
      </ul>
    </div>
  );
}
