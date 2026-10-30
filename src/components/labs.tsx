import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { bernoulli, binomial, discreteUpper, exponential, fmt, geometric, hypergeometric, normal, poisson, sample } from '../lib/dist';
import { RANGES, SIM_BATCH, SIM_MAX } from '../lib/ranges';
import { BarChart, CurveChart, Legend, type Bin } from './charts';
import { Rich, Tex } from './Tex';
import { ProbLine, SimNote, Slider, Stats } from './ui';
import type { DistId } from '../content/types';

// ———————— أدوات مشتركة للمحاكاة ————————

/** عدّاد لنتائج محاكاة متقطعة. يُصفَّر تلقائيًا عند تغيّر المعلمات. */
function useDiscreteSim(resetKey: string) {
  const [values, setValues] = useState<number[]>([]);
  useEffect(() => setValues([]), [resetKey]);
  const add = (xs: number[]) => setValues((v) => (v.length >= SIM_MAX ? v : v.concat(xs).slice(0, SIM_MAX)));
  const stats = useMemo(() => {
    const n = values.length;
    if (!n) return null;
    const counts = new Map<number, number>();
    let s = 0;
    for (const x of values) {
      counts.set(x, (counts.get(x) ?? 0) + 1);
      s += x;
    }
    const mean = s / n;
    const variance = n > 1 ? values.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1) : 0;
    return { n, counts, mean, variance };
  }, [values]);
  return { values, add, clear: () => setValues([]), stats, full: values.length >= SIM_MAX };
}

/** لا نقارن المحاكاة بالنظرية قبل عدد معقول من العينات (عينة واحدة تشوّه الرسم). */
const MIN_SIM = 20;
const enough = <T extends { n: number }>(s: T | null) => (s && s.n >= MIN_SIM ? s : null);

function simBars(stats: ReturnType<typeof useDiscreteSim>['stats'], xs: number[]) {
  if (!stats || stats.n < MIN_SIM) return null;
  return xs.map((x) => ({ x, p: (stats.counts.get(x) ?? 0) / stats.n }));
}

/** شريط محاولات: «ن» نجاح (مربع ممتلئ) و«خ» إخفاق (مربع مفرغ) — الشكل والحرف لا اللون فقط. */
function TrialStrip({ trials, successWord = 'نجاح', failWord = 'إخفاق' }: { trials: number[]; successWord?: string; failWord?: string }) {
  const s = trials.filter((t) => t === 1).length;
  return (
    <div className="strip-wrap">
      <ol className="strip" aria-label={`${trials.length} محاولة: ${s} ${successWord} و${trials.length - s} ${failWord}`}>
        {trials.map((t, i) => (
          <li key={i} className={t ? 'ok' : 'no'} title={`المحاولة ${i + 1}: ${t ? successWord : failWord}`} aria-hidden="true">
            {t ? 'ن' : 'خ'}
          </li>
        ))}
      </ol>
      <p className="strip-key">
        <span className="mini ok" aria-hidden="true">ن</span> {successWord} (<Tex tex="1" />) · <span className="mini no" aria-hidden="true">خ</span> {failWord} (<Tex tex="0" />)
      </p>
    </div>
  );
}

function SimButtons({
  onOne,
  oneLabel,
  onBatch,
  batchLabel,
  onClear,
  full,
  hasData,
}: {
  onOne?: () => void;
  oneLabel?: string;
  onBatch: () => void;
  batchLabel: string;
  onClear: () => void;
  full: boolean;
  hasData: boolean;
}) {
  return (
    <div className="btn-row">
      {onOne && (
        <button type="button" className="btn" onClick={onOne} disabled={full}>
          ▶ {oneLabel}
        </button>
      )}
      <button type="button" className="btn" onClick={onBatch} disabled={full}>
        ▶▶ {batchLabel}
      </button>
      <button type="button" className="btn btn-quiet" onClick={onClear} disabled={!hasData}>
        مسح المحاكاة
      </button>
    </div>
  );
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// ———————— برنولي ————————
export function BernoulliLab() {
  const [p, setP] = useState(0.08);
  const sim = useDiscreteSim(String(p));
  const [last, setLast] = useState<number[]>([]);
  useEffect(() => setLast([]), [p]);
  const run = (k: number) => {
    const xs = Array.from({ length: k }, () => sample.bernoulli(p));
    sim.add(xs);
    setLast((l) => l.concat(xs).slice(-30));
  };
  const bars = [0, 1].map((x) => ({ x, p: bernoulli.pmf(x, p) }));
  return (
    <div className="lab">
      <Slider label="احتمال أن تكون العلبة معيبة" symbol="p" value={p} onChange={setP} {...RANGES.bernoulliP} />
      <BarChart bars={bars} sim={simBars(sim.stats, [0, 1])} ariaLabel={`توزيع برنولي: P(X=0)=${fmt(1 - p)}, P(X=1)=${fmt(p)}`} xLabel="قيمة X: ‏0 = سليمة، 1 = معيبة («نجاح»)" />
      <Legend items={enough(sim.stats) ? ['theory', 'sim'] : ['theory']} />
      <ProbLine tex={`P(X=1) = p`} value={p} />
      <ProbLine tex={`P(X=0) = 1-p`} value={1 - p} />
      <SimButtons onOne={() => run(1)} oneLabel="افحص علبة واحدة" onBatch={() => run(100)} batchLabel="افحص 100 علبة" onClear={() => (sim.clear(), setLast([]))} full={sim.full} hasData={!!sim.stats} />
      {last.length > 0 && <TrialStrip trials={last} successWord="معيبة" failWord="سليمة" />}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={bernoulli.mean(p)} variance={bernoulli.variance(p)} meanTex="E[X]=p" varTex="\mathrm{Var}(X)=p(1-p)" sim={enough(sim.stats)} />
    </div>
  );
}

// ———————— ذو الحدين ————————
export function BinomialLab({ initialN = 10, initialP = 0.25 }: { initialN?: number; initialP?: number }) {
  const [n, setN] = useState(initialN);
  const [p, setP] = useState(initialP);
  const [k, setK] = useState(3);
  const kk = Math.min(k, n);
  const sim = useDiscreteSim(`${n}|${p}`);
  const [one, setOne] = useState<number[] | null>(null);
  useEffect(() => setOne(null), [n, p]);
  const xs = range(0, n);
  const bars = xs.map((x) => ({ x, p: binomial.pmf(x, n, p) }));
  const runOne = () => {
    const t = sample.binomialTrials(n, p);
    setOne(t);
    sim.add([t.reduce((a, b) => a + b, 0)]);
  };
  const batch = () => sim.add(Array.from({ length: SIM_BATCH }, () => sample.binomial(n, p)));
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label="عدد المحاولات" symbol="n" value={n} onChange={setN} {...RANGES.binomialN} digits={0} />
        <Slider label="احتمال النجاح" symbol="p" value={p} onChange={setP} {...RANGES.binomialP} />
        <Slider label="عدد النجاحات المطلوب" symbol="k" value={kk} onChange={setK} min={0} max={n} step={1} digits={0} />
      </div>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === kk} ariaLabel={`توزيع ذي الحدين n=${n}, p=${fmt(p)}. P(X=${kk}) = ${fmt(binomial.pmf(kk, n, p))}`} xLabel="عدد النجاحات k" />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      <ProbLine tex={`P(X=${kk}) = \\binom{${n}}{${kk}}(${fmt(p)})^{${kk}}(${fmt(1 - p)})^{${n - kk}}`} value={binomial.pmf(kk, n, p)} />
      <SimButtons onOne={runOne} oneLabel={`نفّذ ${n} محاولة مرة واحدة`} onBatch={batch} batchLabel={`كرّر التجربة ${SIM_BATCH} مرة`} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <TrialStrip trials={one} />
          <p className="result-line">
            عدد النجاحات في هذه التجربة: <Tex tex={`X = ${one.reduce((a, b) => a + b, 0)}`} />
          </p>
        </>
      )}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={binomial.mean(n, p)} variance={binomial.variance(n, p)} meanTex="np" varTex="np(1-p)" sim={enough(sim.stats)} />
    </div>
  );
}

// ———————— الهندسي ————————
export function GeometricLab() {
  const [p, setP] = useState(0.2);
  const K = Math.max(10, Math.min(40, discreteUpper((k) => geometric.cdf(k, p), 0.99, 1, 40)));
  const [k, setK] = useState(4);
  const kk = Math.min(k, K);
  const sim = useDiscreteSim(String(p));
  const [one, setOne] = useState<number[] | null>(null);
  useEffect(() => setOne(null), [p]);
  const xs = range(1, K);
  const bars = xs.map((x) => ({ x, p: geometric.pmf(x, p) }));
  const runOne = () => {
    const t = sample.geometricTrials(p);
    setOne(t);
    sim.add([t.length]);
  };
  const batch = () => sim.add(Array.from({ length: SIM_BATCH }, () => sample.geometricTrials(p).length));
  const tail = Math.pow(1 - p, K);
  const simBeyond = sim.stats ? sim.values.filter((v) => v > K).length : 0;
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label="احتمال النجاح في كل محاولة" symbol="p" value={p} onChange={setP} {...RANGES.geometricP} />
        <Slider label="رقم المحاولة الناجحة الأولى" symbol="k" value={kk} onChange={setK} min={1} max={K} step={1} digits={0} />
      </div>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === kk} ariaLabel={`التوزيع الهندسي p=${fmt(p)}. P(X=${kk}) = ${fmt(geometric.pmf(kk, p))}`} xLabel="عدد المحاولات حتى أول نجاح k" />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      <p className="trunc-note">
        <Rich text={`الرسم يعرض $k$ من 1 إلى ${K} فقط؛ التوزيع يمتد بلا نهاية، والاحتمال غير المعروض $P(X > ${K}) = (1-p)^{${K}} \\approx ${fmt(tail, 4)}$.`} />
      </p>
      <ProbLine tex={`P(X=${kk}) = (${fmt(1 - p)})^{${kk - 1}}(${fmt(p)})`} value={geometric.pmf(kk, p)} />
      <ProbLine tex={`P(X\\le ${kk}) = 1-(${fmt(1 - p)})^{${kk}}`} value={geometric.cdf(kk, p)} />
      <SimButtons onOne={runOne} oneLabel="ابدأ سلسلة حتى أول نجاح" onBatch={batch} batchLabel={`كرّر ${SIM_BATCH} سلسلة`} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <TrialStrip trials={one} />
          <p className="result-line">
            أول نجاح جاء في المحاولة رقم <Tex tex={`X = ${one.length}`} />
          </p>
        </>
      )}
      {simBeyond > 0 && <p className="trunc-note">سلاسل في المحاكاة تجاوزت {K} محاولة ولا تظهر في الرسم: {simBeyond}.</p>}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={geometric.mean(p)} variance={geometric.variance(p)} meanTex="\tfrac{1}{p}" varTex="\tfrac{1-p}{p^2}" sim={enough(sim.stats)} />
    </div>
  );
}

// ———————— بواسون ————————
function Timeline({ times, t, unit, label }: { times: number[]; t: number; unit: string; label: string }) {
  const W = 560, H = 70, L = 16, R = 16;
  const X = (s: number) => L + (s / t) * (W - L - R);
  const ticks = range(0, Math.floor(t / 0.5)).map((i) => i * 0.5).filter((v) => v <= t + 1e-9);
  return (
    <figure className="timeline">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} direction="ltr">
        <line x1={L} x2={W - R} y1={34} y2={34} className="axis" />
        {ticks.map((s) => (
          <g key={s}>
            <line x1={X(s)} x2={X(s)} y1={30} y2={38} className="axis" />
            <text x={X(s)} y={60} textAnchor="middle" className="tick">{fmt(s, 1)}</text>
          </g>
        ))}
        {times.map((s, i) => (
          <path key={i} d={`M ${X(s)} 12 L ${X(s) + 7} 22 L ${X(s)} 32 L ${X(s) - 7} 22 Z`} className="event" />
        ))}
      </svg>
      <figcaption>الزمن ({unit}) — كل معيّن ◆ حدث واحد</figcaption>
    </figure>
  );
}

export function PoissonLab() {
  const [r, setR] = useState(3);
  const [t, setT] = useState(2);
  const lambda = r * t;
  const K = Math.max(10, Math.min(40, discreteUpper((k) => poisson.cdf(k, lambda), 0.995, 0, 40)));
  const [k, setK] = useState(4);
  const kk = Math.min(k, K);
  const sim = useDiscreteSim(`${r}|${t}`);
  const [one, setOne] = useState<number[] | null>(null);
  useEffect(() => setOne(null), [r, t]);
  const xs = range(0, K);
  const bars = xs.map((x) => ({ x, p: poisson.pmf(x, lambda) }));
  const runOne = () => {
    const times = sample.poissonProcess(r, t);
    setOne(times);
    sim.add([times.length]);
  };
  const batch = () => sim.add(Array.from({ length: SIM_BATCH }, () => sample.poissonProcess(r, t).length));
  const tail = 1 - poisson.cdf(K, lambda);
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label="المعدل" symbol="r" value={r} onChange={setR} {...RANGES.poissonRate} unit="طلب/ساعة" digits={1} />
        <Slider label="طول الفترة" symbol="t" value={t} onChange={setT} {...RANGES.poissonT} unit="ساعة" digits={1} />
        <Slider label="عدد الأحداث" symbol="k" value={kk} onChange={setK} min={0} max={K} step={1} digits={0} />
      </div>
      <p className="lambda-line">
        <Tex tex={`\\lambda = r\\,t = ${fmt(r)} \\times ${fmt(t)} = ${fmt(lambda)}`} /> <span>طلبًا في المتوسط خلال الفترة</span>
      </p>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === kk} ariaLabel={`توزيع بواسون λ=${fmt(lambda)}. P(X=${kk}) = ${fmt(poisson.pmf(kk, lambda))}`} xLabel="عدد الطلبات في الفترة k" />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      <p className="trunc-note">
        <Rich text={`الرسم يعرض $k$ من 0 إلى ${K}؛ التوزيع يمتد بلا نهاية، والاحتمال غير المعروض $P(X > ${K}) \\approx ${fmt(tail, 4)}$.`} />
      </p>
      <ProbLine tex={`P(X=${kk}) = \\frac{e^{-${fmt(lambda)}}\\,${fmt(lambda)}^{${kk}}}{${kk}!}`} value={poisson.pmf(kk, lambda)} />
      <SimButtons onOne={runOne} oneLabel="ولّد فترة واحدة" onBatch={batch} batchLabel={`كرّر ${SIM_BATCH} فترة`} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <Timeline times={one} t={t} unit="ساعة" label={`فترة طولها ${t} ساعة وصل فيها ${one.length} طلبًا`} />
          <p className="result-line">
            عدد الطلبات في هذه الفترة: <Tex tex={`X = ${one.length}`} />
          </p>
        </>
      )}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={lambda} variance={lambda} meanTex="\lambda" varTex="\lambda" sim={enough(sim.stats)} />
    </div>
  );
}

// ———————— الأسي ————————
export function ExponentialLab() {
  const [theta, setTheta] = useState(3);
  const [t, setT] = useState(0.5);
  const [mode, setMode] = useState<'le' | 'gt'>('gt');
  const [waits, setWaits] = useState<number[]>([]);
  const [one, setOne] = useState<number | null>(null);
  useEffect(() => (setWaits([]), setOne(null)), [theta]);
  const xMax = Math.max(exponential.quantile(0.99, theta), t * 1.15);
  const pr = mode === 'le' ? exponential.cdf(t, theta) : 1 - exponential.cdf(t, theta);
  const hist: Bin[] | null = useMemo(() => {
    if (!waits.length) return null;
    const B = 24, w = xMax / B;
    const c = new Array(B).fill(0);
    for (const x of waits) if (x < xMax) c[Math.floor(x / w)]++;
    return c.map((n, i) => ({ x0: i * w, x1: (i + 1) * w, density: n / (waits.length * w) }));
  }, [waits, xMax]);
  const stats = useMemo(() => {
    const n = waits.length;
    if (!n) return null;
    const m = waits.reduce((a, b) => a + b, 0) / n;
    return { n, mean: m, variance: n > 1 ? waits.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1) : 0 };
  }, [waits]);
  const full = waits.length >= SIM_MAX;
  const add = (k: number) => {
    const xs = Array.from({ length: k }, () => sample.exponential(theta));
    setWaits((w) => w.concat(xs).slice(0, SIM_MAX));
    if (k === 1) setOne(xs[0]);
  };
  const beyond = waits.filter((x) => x >= xMax).length;
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label="المعدل" symbol="\theta" value={theta} onChange={setTheta} {...RANGES.expTheta} unit="طلب/ساعة" digits={1} />
        <Slider label="الزمن" symbol="t" value={t} onChange={setT} min={0.05} max={3} step={0.05} unit="ساعة" />
      </div>
      <fieldset className="seg">
        <legend>الاحتمال المطلوب</legend>
        <label>
          <input type="radio" name="expmode" checked={mode === 'gt'} onChange={() => setMode('gt')} /> انتظار أطول من <Tex tex="t" />: <Tex tex="P(X>t)" />
        </label>
        <label>
          <input type="radio" name="expmode" checked={mode === 'le'} onChange={() => setMode('le')} /> خلال <Tex tex="t" /> أو أقل: <Tex tex="P(X\le t)" />
        </label>
      </fieldset>
      <CurveChart
        f={(x) => exponential.pdf(x, theta)}
        xMin={0}
        xMax={xMax}
        shade={mode === 'le' ? [0, t] : [t, xMax]}
        hist={waits.length >= MIN_SIM ? hist : null}
        markers={[{ x: 1 / theta, label: 'E[X]' }]}
        ariaLabel={`كثافة أسية بمعدل ${fmt(theta)} لكل ساعة. ${mode === 'le' ? 'P(X ≤ t)' : 'P(X > t)'} = ${fmt(pr)} عند t = ${fmt(t)} ساعة`}
        xLabel="زمن الانتظار x (ساعة)"
      />
      <Legend items={hist && waits.length >= MIN_SIM ? ['curve', 'shade', 'hist'] : ['curve', 'shade']} />
      <ProbLine
        tex={mode === 'le' ? `P(X\\le ${fmt(t)}) = 1-e^{-${fmt(theta)}\\times ${fmt(t)}}` : `P(X> ${fmt(t)}) = e^{-${fmt(theta)}\\times ${fmt(t)}}`}
        value={pr}
      />
      <p className="hint">
        <Rich text={`$t = ${fmt(t)}$ ساعة = ${fmt(t * 60, 1)} دقيقة. المساحة المظللة هي الاحتمال.`} />
      </p>
      <p className="trunc-note">
        <Rich text={`الرسم يتوقف عند $x \\approx ${fmt(xMax, 2)}$ ساعة؛ المساحة بعدها $\\approx ${fmt(1 - exponential.cdf(xMax, theta), 4)}$ غير معروضة لكنها محسوبة في الاحتمالات. ارتفاع المنحنى كثافة لا احتمال: عند $\\theta > 1$ تتجاوز $f(0) = \\theta$ القيمة 1 دون أي تناقض.`} />
      </p>
      <SimButtons onOne={() => add(1)} oneLabel="انتظر الطلب التالي" onBatch={() => add(SIM_BATCH)} batchLabel={`ولّد ${SIM_BATCH} زمن انتظار`} onClear={() => (setWaits([]), setOne(null))} full={full} hasData={waits.length > 0} />
      {one !== null && (
        <>
          <Timeline times={[one]} t={Math.max(xMax, one)} unit="ساعة" label={`وصل الطلب التالي بعد ${fmt(one, 3)} ساعة`} />
          <p className="result-line">
            وصل الطلب التالي بعد <Tex tex={`X \\approx ${fmt(one, 3)}`} /> ساعة (≈ {fmt(one * 60, 1)} دقيقة)
          </p>
        </>
      )}
      {beyond > 0 && <p className="trunc-note">أزمنة في المحاكاة تجاوزت نطاق الرسم ولا تظهر في المدرج: {beyond}.</p>}
      <SimNote count={waits.length} max={SIM_MAX} />
      <Stats mean={exponential.mean(theta)} variance={exponential.variance(theta)} meanTex="\tfrac{1}{\theta}" varTex="\tfrac{1}{\theta^2}" sim={enough(stats)} unit="ساعة" />
    </div>
  );
}

// ———————— الطبيعي ————————
export function NormalLab() {
  const [mu, setMu] = useState(500);
  const [sigma, setSigma] = useState(4);
  const [a, setA] = useState(495);
  const [b, setB] = useState(505);
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const pr = normal.interval(lo, hi, mu, sigma);
  const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma;
  const z1 = (lo - mu) / sigma, z2 = (hi - mu) / sigma;
  const outside = 1 - normal.interval(xMin, xMax, mu, sigma);
  const peak = normal.pdf(mu, mu, sigma);
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label="المتوسط" symbol="\mu" value={mu} onChange={setMu} {...RANGES.normalMu} unit="مل" digits={0} />
        <Slider label="الانحراف المعياري" symbol="\sigma" value={sigma} onChange={setSigma} {...RANGES.normalSigma} unit="مل" digits={1} />
        <Slider label="بداية الفترة" symbol="a" value={a} onChange={setA} min={450} max={550} step={0.5} unit="مل" digits={1} />
        <Slider label="نهاية الفترة" symbol="b" value={b} onChange={setB} min={450} max={550} step={0.5} unit="مل" digits={1} />
      </div>
      <p className="lambda-line">
        <Tex tex={`X \\sim N(\\mu,\\sigma^2) = N(${fmt(mu)},\\ ${fmt(sigma)}^2) = N(${fmt(mu)},\\ ${fmt(sigma * sigma, 2)})`} />
      </p>
      {a > b && <p className="hint">بدأت الفترة بعد نهايتها، فعكسنا الحدّين تلقائيًا.</p>}
      <CurveChart
        f={(x) => normal.pdf(x, mu, sigma)}
        xMin={xMin}
        xMax={xMax}
        shade={[lo, hi]}
        markers={[{ x: mu, label: 'μ' }]}
        ariaLabel={`كثافة طبيعية بمتوسط ${fmt(mu)} وانحراف معياري ${fmt(sigma)}. P(${fmt(lo)} < X < ${fmt(hi)}) = ${fmt(pr)}`}
        xLabel="حجم العبوة x (مل)"
      />
      <Legend items={['curve', 'shade']} />
      <ProbLine tex={`P(${fmt(lo)} < X < ${fmt(hi)}) = \\Phi(${fmt(z2, 2)}) - \\Phi(${fmt(z1, 2)})`} value={pr} />
      <p className="hint">
        <Rich text={`$z = \\dfrac{x-\\mu}{\\sigma}$: الحد الأدنى يبعد $${fmt(z1, 2)}$ والحد الأعلى $${fmt(z2, 2)}$ انحرافًا معياريًا عن المتوسط. القسمة على $\\sigma = ${fmt(sigma)}$ لا على $\\sigma^2 = ${fmt(sigma * sigma, 2)}$.`} />
      </p>
      <p className="trunc-note">
        <Rich text={`الرسم يعرض $\\mu \\pm 4\\sigma$ فقط؛ المساحة خارجه $\\approx ${fmt(outside, 5)}$ غير معروضة. أعلى نقطة في المنحنى $f(\\mu) \\approx ${fmt(peak, 4)}$ كثافة وليست احتمالًا، و$P(X = x) = 0$ لأي قيمة مفردة.`} />
      </p>
      <Stats mean={mu} variance={sigma * sigma} meanTex="\mu" varTex="\sigma^2" unit="مل" />
    </div>
  );
}


// ———————— فوق الهندسي: تخمين الأكواب ————————
/** صف الأكواب: «ح» حليب أولًا (نجاح) و«ش» شاي أولًا، والمختارة محاطة بإطار. */
function CupStrip({ N, k, picked }: { N: number; k: number; picked: number[] }) {
  const hits = picked.filter((i) => i < k).length;
  return (
    <div className="strip-wrap">
      <ol className="strip cups-strip" aria-label={`${N} كوبًا، اخترت ${picked.length} منها، أصبت ${hits}`}>
        {Array.from({ length: N }, (_, i) => (
          <li key={i} className={`${i < k ? 'ok' : 'no'} ${picked.includes(i) ? 'picked' : ''}`} aria-hidden="true">
            {i < k ? 'ح' : 'ش'}
          </li>
        ))}
      </ol>
      <p className="strip-key">
        <span className="mini ok" aria-hidden="true">ح</span> حليب أولًا · <span className="mini no" aria-hidden="true">ش</span> شاي أولًا · المحاط بإطار: ما اخترته
      </p>
    </div>
  );
}

export function HypergeometricLab() {
  const [N, setN] = useState(8);
  const [k, setK] = useState(4);
  // كما في تجربة الشاي: تعرف عدد أكواب «الحليب أولًا» فتختار العدد نفسه (n = k)
  const kk = Math.min(k, N - 1), nn = kk;
  const sim = useDiscreteSim(`${N}|${kk}|${nn}`);
  const [one, setOne] = useState<number[] | null>(null);
  useEffect(() => setOne(null), [N, kk, nn]);
  const [lo, hi] = hypergeometric.support(N, kk, nn);
  const xs = range(0, hi);
  const bars = xs.map((x) => ({ x, p: hypergeometric.pmf(x, N, kk, nn) }));
  const runOne = () => {
    const pick = sample.drawWithout(N, nn);
    setOne(pick);
    sim.add([pick.filter((i) => i < kk).length]);
  };
  const batch = () => sim.add(Array.from({ length: SIM_BATCH }, () => sample.hypergeometric(N, kk, nn)));
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label="عدد الأكواب" symbol="N" value={N} onChange={setN} min={4} max={20} step={1} digits={0} />
        <Slider label="أكواب «حليب أولًا»، وتختار العدد نفسه" symbol="k = n" value={kk} onChange={setK} min={1} max={N - 1} step={1} digits={0} />
      </div>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === hi} ariaLabel={`فوق الهندسي N=${N}, k=${kk}, n=${nn}. احتمال إصابة ${hi} كلها بالتخمين ${fmt(hypergeometric.pmf(hi, N, kk, nn))}`} xLabel="عدد الإصابات بالتخمين x" />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      {lo > 0 && <Rich as="p" className="hint" text={`لاحظ: $x$ لا يقل عن $${lo}$، لأنك تختار $${nn}$ ولا يوجد إلا $${N - kk}$ من النوع الآخر.`} />}
      <ProbLine tex={`P(X=${hi}) = \\frac{\\binom{${kk}}{${hi}}\\binom{${N - kk}}{${nn - hi}}}{\\binom{${N}}{${nn}}}`} value={hypergeometric.pmf(hi, N, kk, nn)} />
      <ProbLine tex={`P_{\\mathrm{Bin}}(X=${hi})`} value={binomial.pmf(hi, nn, kk / N)} label="لو أُعيد كل كوب بعد اختياره (ذو الحدين):" />
      <SimButtons onOne={runOne} oneLabel="خمّن مرة واحدة" onBatch={batch} batchLabel={`خمّن ${SIM_BATCH} مرة`} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <CupStrip N={N} k={kk} picked={one} />
          <p className="result-line">
            أصبت في هذه المرة: <Tex tex={`X = ${one.filter((i) => i < kk).length}`} />
          </p>
        </>
      )}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={hypergeometric.mean(N, kk, nn)} variance={hypergeometric.variance(N, kk, nn)} meanTex="n\tfrac{k}{N}" varTex="n\tfrac{k}{N}\big(1-\tfrac{k}{N}\big)\tfrac{N-n}{N-1}" sim={enough(sim.stats)} />
    </div>
  );
}

/** المختبر المرجعي لكل فصل قديم. الفصول الجديدة تضع تجربتها في المشهد الثاني مباشرة (kind: 'lab'). */
export const labs: Partial<Record<DistId, ComponentType>> = {
  bernoulli: BernoulliLab,
  binomial: BinomialLab,
  geometric: GeometricLab,
  poisson: PoissonLab,
  exponential: ExponentialLab,
  normal: NormalLab,
  hypergeometric: HypergeometricLab,
};
