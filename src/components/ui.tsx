import { useId, type ReactNode } from 'react';
import { fmt } from '../lib/dist';
import { Rich, Tex } from './Tex';

export function Slider({
  label,
  symbol,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  digits = 2,
}: {
  label: string;
  symbol: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
}) {
  const id = useId();
  const shown = fmt(value, digits);
  return (
    <div className="slider">
      <label htmlFor={id}>
        <span>{label}</span> <Tex tex={symbol} />
      </label>
      <div className="slider-row">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={`${shown}${unit ? ' ' + unit : ''}`}
          dir="ltr"
        />
        <output htmlFor={id} dir="ltr" className="num">
          {shown}
          {unit && <small> {unit}</small>}
        </output>
      </div>
    </div>
  );
}

export function Stats({
  mean,
  variance,
  meanTex,
  varTex,
  sim,
  unit,
}: {
  mean: number;
  variance: number;
  meanTex: string;
  varTex: string;
  sim?: { mean: number; variance: number; n: number } | null;
  unit?: string;
}) {
  return (
    <table className="stats">
      <caption className="sr-only">المتوسط والتباين</caption>
      <thead>
        <tr>
          <th scope="col"></th>
          <th scope="col">نظريًا (من القانون)</th>
          {sim && <th scope="col">من المحاكاة ({sim.n.toLocaleString('en-US')} عينة)</th>}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">المتوسط</th>
          <td>
            <Tex tex={`${meanTex} = ${fmt(mean, 4)}`} />
            {unit && <small> {unit}</small>}
          </td>
          {sim && <td className="num" dir="ltr">≈ {fmt(sim.mean, 3)}</td>}
        </tr>
        <tr>
          <th scope="row">التباين</th>
          <td>
            <Tex tex={`${varTex} = ${fmt(variance, 4)}`} />
          </td>
          {sim && <td className="num" dir="ltr">≈ {fmt(sim.variance, 3)}</td>}
        </tr>
      </tbody>
    </table>
  );
}

export function SimNote({ count, max }: { count: number; max: number }) {
  return (
    <p className="sim-note" role="note">
      <span aria-hidden="true">◆ </span>
      نتائج المحاكاة عشوائية وتتغير من تشغيل لآخر؛ القيم النظرية لا تتغير. {count > 0 && <>عدد العينات الآن {count.toLocaleString('en-US')} (الحد {max.toLocaleString('en-US')}).</>} {count > 0 && count < 20 && <>تظهر المقارنة مع القيم النظرية في الرسم والجدول بعد 20 عينة على الأقل.</>}
    </p>
  );
}

export function Callout({ kind = 'note', title, children }: { kind?: 'note' | 'warn'; title?: string; children: ReactNode }) {
  return (
    <aside className={`callout callout-${kind}`}>
      {title && <strong className="callout-title">{title}</strong>}
      {children}
    </aside>
  );
}

export function ProbLine({ tex, value, label }: { tex: string; value: number; label?: string }) {
  return (
    <p className="prob-line" aria-live="polite">
      {label && <span>{label} </span>}
      <Tex tex={`${tex} = ${fmt(value, 4)}`} />
    </p>
  );
}

export function RichList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map((t, i) => (
        <Rich key={i} as="li" text={t} />
      ))}
    </ul>
  );
}
