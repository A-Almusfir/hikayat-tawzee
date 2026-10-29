import { useEffect, useRef, useState } from 'react';
import type { TryIt } from '../../content/chapterTypes';
import { fmt } from '../../lib/dist';
import { Rich, Tex } from '../Tex';
import { Scene } from './Scene';

type Fit = Extract<TryIt, { kind: 'fit' }>;

/** المشهد ②: منزلق واحد يطابق القانون على بيانات حقيقية. */
export function FitLab({ t }: { t: Fit }) {
  const [theta, setTheta] = useState(t.param.start);
  const [shown, setShown] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shown) box.current?.focus();
  }, [shown]);

  const obs = t.observed;
  const N = obs.reduce((a, b) => a + b, 0);
  const ks = obs.map((_, k) => k);
  const last = ks.length - 1;
  const exp = ks.map((k) => N * t.pmf(k, theta));
  const expTail = N * (1 - t.cdf(last, theta));
  const diff = ks.reduce((s, k) => s + Math.abs(obs[k] - exp[k]), 0) + expTail;
  const cats = [...ks.map((k) => ({ label: String(k), o: obs[k], e: exp[k] })), { label: `${last + 1}+`, o: 0, e: expTail }];

  const W = 400, H = 230, L = 38, B = 32, T = 10;
  const yMax = Math.ceil((Math.max(...obs) * 1.25) / 20) * 20;
  const Y = (v: number) => T + (H - T - B) * (1 - Math.min(v, yMax) / yMax);
  const slot = (W - L - 8) / cats.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * yMax));
  const id = 'fit-param';

  return (
    <Scene
      n={2}
      title={t.headline}
      art={
        <figure className="hk-chart">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`عند ${t.param.symbol.replace('\\', '')} = ${fmt(theta, 2)}: المتوقع ${cats.map((c) => `${c.label}: ${fmt(c.e, 1)}`).join('، ')}. الواقع: ${cats.map((c) => c.o).join('، ')}`} direction="ltr">
            <defs>
              <pattern id="obsHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#1b2a4a" strokeWidth="1.6" />
              </pattern>
            </defs>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={L} x2={W - 4} y1={Y(v)} y2={Y(v)} className="grid" />
                <text x={L - 6} y={Y(v) + 5} textAnchor="end" className="tick">{v}</text>
              </g>
            ))}
            {cats.map((c, i) => {
              const cx = L + slot * (i + 0.5), bw = slot * 0.36;
              return (
                <g key={c.label}>
                  <rect x={cx - bw - 1} y={Y(c.o)} width={bw} height={Y(0) - Y(c.o)} fill="url(#obsHatch)" stroke="#1b2a4a" strokeWidth="1.5" />
                  <rect x={cx + 1} y={Y(c.e)} width={bw} height={Y(0) - Y(c.e)} fill="var(--c)" />
                  <text x={cx} y={H - B + 20} textAnchor="middle" className="tick">{c.label}</text>
                </g>
              );
            })}
            <line x1={L} x2={W - 4} y1={Y(0)} y2={Y(0)} className="axis" />
          </svg>
          <figcaption>
            <span className="lg"><i className="lg-obs" /> ما وقع (عدد الوحدات)</span>
            <span className="lg"><i className="lg-exp" /> ما يتوقعه القانون</span>
            <span className="lg-x">{t.xLabel}</span>
          </figcaption>
        </figure>
      }
    >
      <Rich as="p" text={t.prompt} />
      <div className="one-control">
        <label htmlFor={id}>
          {t.param.label} <Tex tex={t.param.symbol} />
        </label>
        <div className="slider-row">
          <input id={id} type="range" min={t.param.min} max={t.param.max} step={t.param.step} value={theta} onChange={(e) => setTheta(Number(e.target.value))} dir="ltr" aria-valuetext={fmt(theta, 2)} />
          <output htmlFor={id} className="num big-out" dir="ltr">{fmt(theta, 2)}</output>
        </div>
      </div>
      <p className="fit" aria-live="polite">
        الفرق الكلي بين ما وقع وما يتوقعه القانون: <strong className="num" dir="ltr">{fmt(diff, 1)}</strong> {t.unitLabel}
      </p>
      {!shown ? (
        <button type="button" className="btn btn-c" onClick={() => setShown(true)}>
          {t.revealButton}
        </button>
      ) : (
        <div className="reveal-box" role="status" tabIndex={-1} ref={box}>
          <Rich as="p" text={t.reveal} />
          <button type="button" className="btn btn-quiet" onClick={() => setTheta(t.param.best)}>
            ضع <Tex tex={`${t.param.symbol} = ${t.param.best}`} />
          </button>
        </div>
      )}
      <table className="hk-table">
        <caption className="sr-only">ما وقع مقابل المتوقع</caption>
        <thead>
          <tr>
            <th scope="row">العدد</th>
            {cats.map((c) => <th key={c.label} scope="col" dir="ltr">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">وقع</th>
            {cats.map((c) => <td key={c.label} dir="ltr">{c.o}</td>)}
          </tr>
          <tr>
            <th scope="row">متوقع</th>
            {cats.map((c) => <td key={c.label} dir="ltr">{fmt(c.e, 1)}</td>)}
          </tr>
        </tbody>
      </table>
    </Scene>
  );
}
