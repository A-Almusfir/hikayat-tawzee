import { useEffect, useMemo, useState } from 'react';
import type { TryIt } from '../../content/chapterTypes';
import { binomial, choose, exponential, fmt, geometric, normal, sample } from '../../lib/dist';
import { BarChart, CurveChart, type Bin } from '../charts';
import { Rich, Tex } from '../Tex';
import { Scene } from './Scene';

type Of<K extends TryIt['kind']> = Extract<TryIt, { kind: K }>;
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
/** «دورة واحدة / دورتين / 3 دورات / 11 دورة» */
const spins = (n: number) => (n === 0 ? 'أي دورة' : n === 1 ? 'دورة واحدة' : n === 2 ? 'دورتين' : n <= 10 ? `${n} دورات` : `${n} دورة`);

function SimNoteLine() {
  return <p className="sim-note">◆ نتائج المحاكاة عشوائية وتتغير من تشغيل لآخر؛ القيم النظرية لا تتغير.</p>;
}

// ———— برنولي: قانون الأعداد الكبيرة ————
export function LlnTry({ t }: { t: Of<'lln'> }) {
  const MAX = 5000;
  const [draws, setDraws] = useState<number[]>([]);
  const add = (k: number) => setDraws((d) => d.concat(Array.from({ length: Math.min(k, MAX - d.length) }, () => sample.bernoulli(t.p))));
  const n = draws.length;
  const path = useMemo(() => {
    let s = 0;
    const pts: [number, number][] = [];
    const step = Math.max(1, Math.floor(n / 300));
    draws.forEach((x, i) => {
      s += x;
      if (i % step === 0 || i === n - 1) pts.push([i + 1, s / (i + 1)]);
    });
    return pts;
  }, [draws, n]);
  const prop = n ? path[path.length - 1][1] : null;
  const W = 400, H = 220, L = 46, B = 30, T = 10;
  const X = (i: number) => L + ((W - L - 8) * (i - 1)) / Math.max(1, Math.max(n, 10) - 1);
  const Y = (v: number) => T + (H - T - B) * (1 - v);
  return (
    <Scene
      n={2}
      title={t.headline}
      art={
        <figure className="hk-chart">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={n ? `بعد ${n} سحبة: نسبة ${t.successLabel} ${fmt(prop!, 3)}، والحقيقية ${t.p}` : 'لم تُسحب أي حصاة بعد'} direction="ltr">
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <g key={v}>
                <line x1={L} x2={W - 4} y1={Y(v)} y2={Y(v)} className="grid" />
                <text x={L - 6} y={Y(v) + 5} textAnchor="end" className="tick">{v}</text>
              </g>
            ))}
            <line x1={L} x2={W - 4} y1={Y(t.p)} y2={Y(t.p)} className="p-line" />
            <text x={W - 6} y={Y(t.p) - 6} textAnchor="end" className="tick p-label">p = {t.p}</text>
            {path.length > 1 && <path d={path.map(([i, v], j) => `${j ? 'L' : 'M'} ${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')} className="run-line" />}
            <line x1={L} x2={W - 4} y1={Y(0)} y2={Y(0)} className="axis" />
            <text x={L} y={H - 8} className="tick">1</text>
            <text x={W - 6} y={H - 8} textAnchor="end" className="tick">{Math.max(n, 10)}</text>
          </svg>
          <figcaption>
            <span className="lg"><i className="lg-run" /> نسبة {t.successLabel} حتى الآن (محاكاة)</span>
            <span className="lg"><i className="lg-p" /> الاحتمال الحقيقي</span>
            <span className="lg-x">عدد السحبات</span>
          </figcaption>
        </figure>
      }
    >
      <Rich as="p" text={t.prompt} />
      <div className="btn-row">
        {[1, 10, 100, 1000].map((k) => (
          <button key={k} type="button" className="btn btn-c" disabled={n >= MAX} onClick={() => add(k)}>
            اسحب {k === 1 ? 'حصاة' : k}
          </button>
        ))}
        <button type="button" className="btn btn-quiet" disabled={!n} onClick={() => setDraws([])}>ابدأ من جديد</button>
      </div>
      <p className="fit" aria-live="polite">
        {n ? (
          <>
            بعد <strong className="num">{n}</strong> سحبة: نسبة {t.successLabel} <strong className="num" dir="ltr">{fmt(prop!, 3)}</strong>، والفرق عن <Tex tex={`p = ${t.p}`} /> هو <strong className="num" dir="ltr">{fmt(Math.abs(prop! - t.p), 3)}</strong>.
          </>
        ) : (
          'ابدأ بالسحب.'
        )}
      </p>
      {n >= 1000 && <Rich as="p" className="reveal-box" text={t.reveal} />}
      <SimNoteLine />
    </Scene>
  );
}

// ———— ذو الحدين: مسألة النقاط ————
export function PointsTry({ t }: { t: Of<'points'> }) {
  const [b, setB] = useState(t.bStart);
  const a = t.aNeeds;
  const n = a + b - 1;
  const bars = range(0, n).map((k) => ({ x: k, p: binomial.pmf(k, n, 0.5) }));
  const ways = range(a, n).reduce((s, k) => s + choose(n, k), 0);
  const share = ways / 2 ** n;
  return (
    <Scene
      n={2}
      title={t.headline}
      art={<BarChart bars={bars} highlight={(k) => k >= a} ariaLabel={`في ${n} جولات: يفوز أ إن ربح ${a} أو أكثر، باحتمال ${fmt(share, 4)}`} xLabel={`عدد الجولات التي يفوز بها أ من ${n}`} />}
    >
      <Rich as="p" text={t.prompt} />
      <div className="one-control">
        <label htmlFor="pts-b">عدد النقاط التي يحتاجها ب</label>
        <div className="slider-row">
          <input id="pts-b" type="range" min={t.bMin} max={t.bMax} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} dir="ltr" />
          <output htmlFor="pts-b" className="num big-out" dir="ltr">{b}</output>
        </div>
      </div>
      <p className="fit" aria-live="polite">
        أ يحتاج {a} وب يحتاج {b}: تنتهي اللعبة خلال <strong className="num">{n}</strong> جولات على الأكثر، ففيها <Tex tex={`2^{${n}} = ${2 ** n}`} /> طريقًا متساوي الاحتمال. يفوز أ في <strong className="num">{ways}</strong> منها، فنصيبه العادل <Tex tex={`\\tfrac{${ways}}{${2 ** n}} \\approx ${fmt(share, 4)}`} /> من الرهان.
      </p>
      <p className="hint">الأعمدة المظللة: الطرق التي يفوز فيها أ. ارتفاع كل عمود = عدد الطرق ÷ <Tex tex={`2^{${n}}`} />.</p>
    </Scene>
  );
}

// ———— الأسي: أزمنة الانتظار بين المكالمات ————
export function WaitsTry({ t }: { t: Of<'waits'> }) {
  const [lambda, setLambda] = useState(t.lambda.start);
  const [waits, setWaits] = useState<number[]>([]);
  useEffect(() => setWaits([]), [lambda]);
  const xMax = exponential.quantile(0.99, lambda);
  const hist: Bin[] | null = useMemo(() => {
    if (waits.length < 20) return null;
    const B = 20, w = xMax / B, c = new Array(B).fill(0);
    for (const x of waits) if (x < xMax) c[Math.floor(x / w)]++;
    return c.map((k, i) => ({ x0: i * w, x1: (i + 1) * w, density: k / (waits.length * w) }));
  }, [waits, xMax]);
  const mean = waits.length ? waits.reduce((a, b) => a + b, 0) / waits.length : null;
  return (
    <Scene
      n={2}
      title={t.headline}
      art={
        <CurveChart
          f={(x) => exponential.pdf(x, lambda)}
          xMin={0}
          xMax={xMax}
          hist={hist}
          markers={[{ x: 1 / lambda, label: '1/θ' }]}
          ariaLabel={`كثافة الانتظار بمعدل ${lambda} ${t.rateUnit}`}
          xLabel={`زمن الانتظار (${t.unit})`}
        />
      }
    >
      <Rich as="p" text={t.prompt} />
      <div className="one-control">
        <label htmlFor="w-l">
          المعدل <Tex tex="\theta" /> ({t.rateUnit})
        </label>
        <div className="slider-row">
          <input id="w-l" type="range" min={t.lambda.min} max={t.lambda.max} step={t.lambda.step} value={lambda} onChange={(e) => setLambda(Number(e.target.value))} dir="ltr" />
          <output htmlFor="w-l" className="num big-out" dir="ltr">{fmt(lambda, 1)}</output>
        </div>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-c" onClick={() => setWaits(Array.from({ length: 500 }, () => sample.exponential(lambda)))}>
          ولّد 500 زمن انتظار
        </button>
      </div>
      <p className="fit" aria-live="polite">
        متوسط الانتظار نظريًا <Tex tex={`\\tfrac{1}{\\theta} = ${fmt(1 / lambda, 3)}`} /> {t.unit}
        {mean !== null && (
          <>
            ، وفي المحاكاة <strong className="num" dir="ltr">≈ {fmt(mean, 3)}</strong>
          </>
        )}
        .
      </p>
      <p className="trunc-note">الرسم يتوقف عند {fmt(xMax, 2)} {t.unit}؛ نحو 1% من الانتظار أطول من ذلك. والمستطيلات الفاتحة مدرّج المحاكاة.</p>
      <SimNoteLine />
    </Scene>
  );
}

// ———— الهندسي: انعدام الذاكرة ————
export function MemoryTry({ t }: { t: Of<'memory'> }) {
  const [s, setS] = useState(0);
  const p = t.p;
  const J = 8;
  // توزيع ما بقي بعد s إخفاقات: P(X = s + j | X > s)
  const cond = range(1, J).map((j) => ({ x: j, p: geometric.pmf(s + j, p) / Math.pow(1 - p, s) }));
  const fresh = range(1, J).map((j) => ({ x: j, p: geometric.pmf(j, p) }));
  const seen = Math.pow(1 - p, s);
  return (
    <Scene
      n={2}
      title={t.headline}
      art={
        <figure className="hk-chart">
          <BarChart bars={cond} sim={fresh} ariaLabel={`بعد ${spins(s)} بلا ${t.successLabel}: احتمال الدورة التالية ${fmt(cond[0].p, 4)}، وهو نفسه في بداية اللعب`} xLabel="عدد الدورات الإضافية حتى أول نجاح" />
          <figcaption>
            <span className="lg"><i className="lg-exp" /> ما بقي بعد {spins(s)} بلا {t.successLabel}</span>
            <span className="lg"><i className="lg-dia" /> التوزيع في بداية اللعب</span>
          </figcaption>
        </figure>
      }
    >
      <Rich as="p" text={t.prompt} />
      <div className="one-control">
        <label htmlFor="mem-s">عدد الدورات التي مضت بلا {t.successLabel}</label>
        <div className="slider-row">
          <input id="mem-s" type="range" min={0} max={t.maxStreak} step={1} value={s} onChange={(e) => setS(Number(e.target.value))} dir="ltr" />
          <output htmlFor="mem-s" className="num big-out" dir="ltr">{s}</output>
        </div>
      </div>
      <p className="fit" aria-live="polite">
        احتمال {t.successLabel} في الدورة التالية: <Tex tex={`${fmt(cond[0].p, 4)}`} />، مهما كان عدد الدورات السابقة. الأعمدة لا تتحرك: العجلة لا تتذكر.
      </p>
      <p className="hint">
        أما احتمال أن ترى {spins(s)} متتالية بلا {t.successLabel} أصلًا فهو <Tex tex={`{(1-p)^{${s}} \\approx ${seen < 1e-4 ? seen.toExponential(1).replace('e', '\\times 10^{') + '}' : fmt(seen, 4)}}`} />. ندرة الماضي لا تغيّر المستقبل.
      </p>
    </Scene>
  );
}

// ———— الطبيعي: لوح غالتون ————
export function GaltonTry({ t }: { t: Of<'galton'> }) {
  const [rows, setRows] = useState(t.rows.start);
  const [sim, setSim] = useState<number[] | null>(null);
  useEffect(() => setSim(null), [rows]);
  const bars = range(0, rows).map((k) => ({ x: k, p: binomial.pmf(k, rows, 0.5) }));
  const simBars = sim ? range(0, rows).map((k) => ({ x: k, p: sim.filter((v) => v === k).length / sim.length })) : null;
  const mu = rows / 2, sigma = Math.sqrt(rows) / 2;
  return (
    <Scene
      n={2}
      title={t.headline}
      art={
        <figure className="hk-chart">
          <BarChart bars={bars} sim={simBars} curve={(x) => normal.pdf(x, mu, sigma)} ariaLabel={`لوح غالتون بـ ${rows} صفًا: ذو الحدين مع منحنى طبيعي متوسطه ${mu} وانحرافه ${fmt(sigma, 2)}`} xLabel="رقم الحجرة (عدد مرات الانحراف يمينًا)" />
          <figcaption>
            <span className="lg"><i className="lg-exp" /> ما يتوقعه ذو الحدين</span>
            <span className="lg"><i className="lg-curve" /> منحنى الجرس</span>
            {simBars && <span className="lg"><i className="lg-dia" /> كرات المحاكاة</span>}
          </figcaption>
        </figure>
      }
    >
      <Rich as="p" text={t.prompt} />
      <div className="one-control">
        <label htmlFor="g-rows">عدد صفوف المسامير</label>
        <div className="slider-row">
          <input id="g-rows" type="range" min={t.rows.min} max={t.rows.max} step={1} value={rows} onChange={(e) => setRows(Number(e.target.value))} dir="ltr" />
          <output htmlFor="g-rows" className="num big-out" dir="ltr">{rows}</output>
        </div>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-c" onClick={() => setSim(Array.from({ length: t.balls }, () => sample.binomial(rows, 0.5)))}>
          أسقط {t.balls} كرة
        </button>
      </div>
      <p className="fit" aria-live="polite">
        المنحنى: <Tex tex={`N\\!\\left(${fmt(mu, 1)},\\ ${fmt(sigma, 2)}^2\\right)`} />. كلما زادت الصفوف اقتربت الأعمدة من الجرس.
      </p>
      {sim && <SimNoteLine />}
    </Scene>
  );
}
