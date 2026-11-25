import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { bernoulli, binomial, discreteUpper, exponential, fmt, gammaDist, geometric, hypergeometric, negbin, normal, poisson, sample, studentT, type Rng } from '../lib/dist';
import { CHI1_95, CHI2_95, LAMBDA_HAT, chiFit } from '../content/horsekicks';
import { NeedleField } from './scenes/Art';
import { RANGES, SIM_BATCH, SIM_MAX } from '../lib/ranges';
import { BarChart, CurveChart, Legend, type Bin } from './charts';
import { Rich, Tex } from './Tex';
import { ProbLine, SimNote, Slider, Stats } from './ui';
import type { DistId } from '../content/types';
import { useUiLang } from '../lib/lang';

/** نص بلغتين: العربي ثم الإنجليزي. */
function useT() {
  const en = useUiLang() === 'en';
  return { en, t: (ar: string, enS: string) => (en ? enS : ar) };
}

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
function TrialStrip({ trials, successWord, failWord }: { trials: number[]; successWord?: string; failWord?: string }) {
  const { en, t: tr } = useT();
  successWord ??= tr('نجاح', 'success');
  failWord ??= tr('إخفاق', 'failure');
  const [S, F] = en ? [successWord[0].toUpperCase(), failWord[0].toUpperCase()] : ['ن', 'خ'];
  const s = trials.filter((t) => t === 1).length;
  return (
    <div className="strip-wrap">
      <ol className="strip" aria-label={en ? `${trials.length} trials: ${successWord} ${s}, ${failWord} ${trials.length - s}` : `${trials.length} محاولة: ${s} ${successWord} و${trials.length - s} ${failWord}`}>
        {trials.map((t, i) => (
          <li key={i} className={t ? 'ok' : 'no'} title={`${tr('المحاولة', 'Trial')} ${i + 1}: ${t ? successWord : failWord}`} aria-hidden="true">
            {t ? S : F}
          </li>
        ))}
      </ol>
      <p className="strip-key">
        <span className="mini ok" aria-hidden="true">{S}</span> {successWord} (<Tex tex="1" />) · <span className="mini no" aria-hidden="true">{F}</span> {failWord} (<Tex tex="0" />)
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
  const { t } = useT();
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
        {t('مسح المحاكاة', 'Clear the simulation')}
      </button>
    </div>
  );
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// ———————— برنولي ————————
export function BernoulliLab() {
  const [p, setP] = useState(0.08);
  const { t } = useT();
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
      <Slider label={t('احتمال أن تكون العلبة معيبة', 'Probability that a can is defective')} symbol="p" value={p} onChange={setP} {...RANGES.bernoulliP} />
      <BarChart bars={bars} sim={simBars(sim.stats, [0, 1])} ariaLabel={`${t('توزيع برنولي', 'Bernoulli distribution')}: P(X=0)=${fmt(1 - p)}, P(X=1)=${fmt(p)}`} xLabel={t('قيمة X: ‏0 = سليمة، 1 = معيبة («نجاح»)', 'Value of X: 0 = sound, 1 = defective (the “success”)')} />
      <Legend items={enough(sim.stats) ? ['theory', 'sim'] : ['theory']} />
      <ProbLine tex={`P(X=1) = p`} value={p} />
      <ProbLine tex={`P(X=0) = 1-p`} value={1 - p} />
      <SimButtons onOne={() => run(1)} oneLabel={t('افحص علبة واحدة', 'Inspect one can')} onBatch={() => run(100)} batchLabel={t('افحص 100 علبة', 'Inspect 100 cans')} onClear={() => (sim.clear(), setLast([]))} full={sim.full} hasData={!!sim.stats} />
      {last.length > 0 && <TrialStrip trials={last} successWord={t('معيبة', 'defective')} failWord={t('سليمة', 'sound')} />}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={bernoulli.mean(p)} variance={bernoulli.variance(p)} meanTex="E[X]=p" varTex="\mathrm{Var}(X)=p(1-p)" sim={enough(sim.stats)} />
    </div>
  );
}

// ———————— ذو الحدين ————————
export function BinomialLab({ initialN = 10, initialP = 0.25 }: { initialN?: number; initialP?: number }) {
  const [n, setN] = useState(initialN);
  const [p, setP] = useState(initialP);
  const { t } = useT();
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
        <Slider label={t('عدد المحاولات', 'Number of trials')} symbol="n" value={n} onChange={setN} {...RANGES.binomialN} digits={0} />
        <Slider label={t('احتمال النجاح', 'Probability of success')} symbol="p" value={p} onChange={setP} {...RANGES.binomialP} />
        <Slider label={t('عدد النجاحات المطلوب', 'Number of successes')} symbol="k" value={kk} onChange={setK} min={0} max={n} step={1} digits={0} />
      </div>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === kk} ariaLabel={`${t('توزيع ذي الحدين', 'Binomial distribution')} n=${n}, p=${fmt(p)}. P(X=${kk}) = ${fmt(binomial.pmf(kk, n, p))}`} xLabel={t('عدد النجاحات k', 'Number of successes k')} />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      <ProbLine tex={`P(X=${kk}) = \\binom{${n}}{${kk}}(${fmt(p)})^{${kk}}(${fmt(1 - p)})^{${n - kk}}`} value={binomial.pmf(kk, n, p)} />
      <SimButtons onOne={runOne} oneLabel={t(`نفّذ ${n} محاولة مرة واحدة`, `Run ${n} trials once`)} onBatch={batch} batchLabel={t(`كرّر التجربة ${SIM_BATCH} مرة`, `Repeat the experiment ${SIM_BATCH} times`)} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <TrialStrip trials={one} />
          <p className="result-line">
            {t('عدد النجاحات في هذه التجربة: ', 'Successes in this run: ')}<Tex tex={`X = ${one.reduce((a, b) => a + b, 0)}`} />
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
  const { t } = useT();
  const K = Math.max(10, Math.min(40, discreteUpper((k) => geometric.cdf(k, p), 0.99, 1, 40)));
  const [k, setK] = useState(4);
  const kk = Math.min(k, K);
  const sim = useDiscreteSim(String(p));
  const [one, setOne] = useState<number[] | null>(null);
  useEffect(() => setOne(null), [p]);
  const xs = range(1, K);
  const bars = xs.map((x) => ({ x, p: geometric.pmf(x, p) }));
  const runOne = () => {
    const trials = sample.geometricTrials(p);
    setOne(trials);
    sim.add([trials.length]);
  };
  const batch = () => sim.add(Array.from({ length: SIM_BATCH }, () => sample.geometricTrials(p).length));
  const tail = Math.pow(1 - p, K);
  const simBeyond = sim.stats ? sim.values.filter((v) => v > K).length : 0;
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label={t('احتمال النجاح في كل محاولة', 'Probability of success in each trial')} symbol="p" value={p} onChange={setP} {...RANGES.geometricP} />
        <Slider label={t('رقم المحاولة الناجحة الأولى', 'Trial of the first success')} symbol="k" value={kk} onChange={setK} min={1} max={K} step={1} digits={0} />
      </div>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === kk} ariaLabel={`${t('التوزيع الهندسي', 'Geometric distribution')} p=${fmt(p)}. P(X=${kk}) = ${fmt(geometric.pmf(kk, p))}`} xLabel={t('عدد المحاولات حتى أول نجاح k', 'Number of trials until the first success k')} />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      <p className="trunc-note">
        <Rich
          text={t(
            `الرسم يعرض $k$ من 1 إلى ${K} فقط؛ التوزيع يمتد بلا نهاية، والاحتمال غير المعروض $P(X > ${K}) = (1-p)^{${K}} \\approx ${fmt(tail, 4)}$.`,
            `The chart shows $k$ from 1 to ${K} only; the distribution goes on forever, and the probability not shown is $P(X > ${K}) = (1-p)^{${K}} \\approx ${fmt(tail, 4)}$.`,
          )}
        />
      </p>
      <ProbLine tex={`P(X=${kk}) = (${fmt(1 - p)})^{${kk - 1}}(${fmt(p)})`} value={geometric.pmf(kk, p)} />
      <ProbLine tex={`P(X\\le ${kk}) = 1-(${fmt(1 - p)})^{${kk}}`} value={geometric.cdf(kk, p)} />
      <SimButtons onOne={runOne} oneLabel={t('ابدأ سلسلة حتى أول نجاح', 'Run trials until the first success')} onBatch={batch} batchLabel={t(`كرّر ${SIM_BATCH} سلسلة`, `Repeat ${SIM_BATCH} runs`)} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <TrialStrip trials={one} />
          <p className="result-line">
            {t('أول نجاح جاء في المحاولة رقم ', 'The first success came on trial ')}<Tex tex={`X = ${one.length}`} />
          </p>
        </>
      )}
      {simBeyond > 0 && <p className="trunc-note">{t(`سلاسل في المحاكاة تجاوزت ${K} محاولة ولا تظهر في الرسم: ${simBeyond}.`, `Simulated runs longer than ${K} trials, not shown in the chart: ${simBeyond}.`)}</p>}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={geometric.mean(p)} variance={geometric.variance(p)} meanTex="\tfrac{1}{p}" varTex="\tfrac{1-p}{p^2}" sim={enough(sim.stats)} />
    </div>
  );
}

// ———————— بواسون ————————
function Timeline({ times, t, unit, label }: { times: number[]; t: number; unit: string; label: string }) {
  const { en } = useT();
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
      <figcaption>{en ? `Time (${unit}) — each diamond ◆ is one event` : `الزمن (${unit}) — كل معيّن ◆ حدث واحد`}</figcaption>
    </figure>
  );
}

export function PoissonLab() {
  const [r, setR] = useState(3);
  const [t, setT] = useState(2);
  const { t: tr } = useT();
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
        <Slider label={tr('المعدل', 'Rate')} symbol="r" value={r} onChange={setR} {...RANGES.poissonRate} unit={tr('حدث/ساعة', 'events/hour')} digits={1} />
        <Slider label={tr('طول الفترة', 'Length of the interval')} symbol="t" value={t} onChange={setT} {...RANGES.poissonT} unit={tr('ساعة', 'h')} digits={1} />
        <Slider label={tr('عدد الأحداث', 'Number of events')} symbol="k" value={kk} onChange={setK} min={0} max={K} step={1} digits={0} />
      </div>
      <p className="lambda-line">
        <Tex tex={`\\lambda = r\\,t = ${fmt(r)} \\times ${fmt(t)} = ${fmt(lambda)}`} /> <span>{tr('حدثًا في المتوسط خلال الفترة', 'events on average over the interval')}</span>
      </p>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === kk} ariaLabel={`${tr('توزيع بواسون', 'Poisson distribution')} λ=${fmt(lambda)}. P(X=${kk}) = ${fmt(poisson.pmf(kk, lambda))}`} xLabel={tr('عدد الأحداث في الفترة k', 'Number of events in the interval k')} />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      <p className="trunc-note">
        <Rich
          text={tr(
            `الرسم يعرض $k$ من 0 إلى ${K}؛ التوزيع يمتد بلا نهاية، والاحتمال غير المعروض $P(X > ${K}) \\approx ${fmt(tail, 4)}$.`,
            `The chart shows $k$ from 0 to ${K}; the distribution goes on forever, and the probability not shown is $P(X > ${K}) \\approx ${fmt(tail, 4)}$.`,
          )}
        />
      </p>
      <ProbLine tex={`P(X=${kk}) = \\frac{e^{-${fmt(lambda)}}\\,${fmt(lambda)}^{${kk}}}{${kk}!}`} value={poisson.pmf(kk, lambda)} />
      <SimButtons onOne={runOne} oneLabel={tr('ولّد فترة واحدة', 'Generate one interval')} onBatch={batch} batchLabel={tr(`كرّر ${SIM_BATCH} فترة`, `Repeat ${SIM_BATCH} intervals`)} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <Timeline times={one} t={t} unit={tr('ساعة', 'h')} label={tr(`فترة طولها ${t} ساعة وصل فيها ${one.length} طلبًا`, `An interval of ${t} h with ${one.length} arrivals`)} />
          <p className="result-line">
            {tr('عدد الأحداث في هذه الفترة: ', 'Events in this interval: ')}<Tex tex={`X = ${one.length}`} />
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
  const { en, t: tr } = useT();
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
        <Slider label={tr('المعدل', 'Rate')} symbol="\theta" value={theta} onChange={setTheta} {...RANGES.expTheta} unit={tr('حدث/ساعة', 'events/hour')} digits={1} />
        <Slider label={tr('الزمن', 'Time')} symbol="t" value={t} onChange={setT} min={0.05} max={3} step={0.05} unit={tr('ساعة', 'h')} />
      </div>
      <fieldset className="seg">
        <legend>{tr('الاحتمال المطلوب', 'The probability you want')}</legend>
        <label>
          <input type="radio" name="expmode" checked={mode === 'gt'} onChange={() => setMode('gt')} /> {tr('انتظار أطول من ', 'Waiting longer than ')}<Tex tex="t" />: <Tex tex="P(X>t)" />
        </label>
        <label>
          <input type="radio" name="expmode" checked={mode === 'le'} onChange={() => setMode('le')} /> {tr('خلال ', 'Waiting ')}<Tex tex="t" />{tr(' أو أقل', ' or less')}: <Tex tex="P(X\le t)" />
        </label>
      </fieldset>
      <CurveChart
        f={(x) => exponential.pdf(x, theta)}
        xMin={0}
        xMax={xMax}
        shade={mode === 'le' ? [0, t] : [t, xMax]}
        hist={waits.length >= MIN_SIM ? hist : null}
        markers={[{ x: 1 / theta, label: 'E[X]' }]}
        ariaLabel={
          en
            ? `Exponential density with rate ${fmt(theta)} per hour. ${mode === 'le' ? 'P(X ≤ t)' : 'P(X > t)'} = ${fmt(pr)} at t = ${fmt(t)} h`
            : `كثافة أسية بمعدل ${fmt(theta)} لكل ساعة. ${mode === 'le' ? 'P(X ≤ t)' : 'P(X > t)'} = ${fmt(pr)} عند t = ${fmt(t)} ساعة`
        }
        xLabel={tr('زمن الانتظار x (ساعة)', 'Waiting time x (h)')}
      />
      <Legend items={hist && waits.length >= MIN_SIM ? ['curve', 'shade', 'hist'] : ['curve', 'shade']} />
      <ProbLine
        tex={mode === 'le' ? `P(X\\le ${fmt(t)}) = 1-e^{-${fmt(theta)}\\times ${fmt(t)}}` : `P(X> ${fmt(t)}) = e^{-${fmt(theta)}\\times ${fmt(t)}}`}
        value={pr}
      />
      <p className="hint">
        <Rich text={tr(`$t = ${fmt(t)}$ ساعة = ${fmt(t * 60, 1)} دقيقة. المساحة المظللة هي الاحتمال.`, `$t = ${fmt(t)}$ h = ${fmt(t * 60, 1)} min. The shaded area is the probability.`)} />
      </p>
      <p className="trunc-note">
        <Rich
          text={tr(
            `الرسم يتوقف عند $x \\approx ${fmt(xMax, 2)}$ ساعة؛ المساحة بعدها $\\approx ${fmt(1 - exponential.cdf(xMax, theta), 4)}$ غير معروضة لكنها محسوبة في الاحتمالات. ارتفاع المنحنى كثافة لا احتمال: عند $\\theta > 1$ تتجاوز $f(0) = \\theta$ القيمة 1 دون أي تناقض.`,
            `The chart stops at $x \\approx ${fmt(xMax, 2)}$ h; the area beyond it, $\\approx ${fmt(1 - exponential.cdf(xMax, theta), 4)}$, is not shown but is included in the probabilities. The height of the curve is a density, not a probability: when $\\theta > 1$, $f(0) = \\theta$ exceeds 1 without any contradiction.`,
          )}
        />
      </p>
      <SimButtons onOne={() => add(1)} oneLabel={tr('انتظر الطلب التالي', 'Wait for the next request')} onBatch={() => add(SIM_BATCH)} batchLabel={tr(`ولّد ${SIM_BATCH} زمن انتظار`, `Generate ${SIM_BATCH} waiting times`)} onClear={() => (setWaits([]), setOne(null))} full={full} hasData={waits.length > 0} />
      {one !== null && (
        <>
          <Timeline times={[one]} t={Math.max(xMax, one)} unit={tr('ساعة', 'h')} label={tr(`وصل الطلب التالي بعد ${fmt(one, 3)} ساعة`, `The next request arrived after ${fmt(one, 3)} h`)} />
          <p className="result-line">
            {tr('وصل الطلب التالي بعد ', 'The next request arrived after ')}<Tex tex={`X \\approx ${fmt(one, 3)}`} /> {tr('ساعة', 'h')} (≈ {fmt(one * 60, 1)} {tr('دقيقة', 'min')})
          </p>
        </>
      )}
      {beyond > 0 && <p className="trunc-note">{tr(`أزمنة في المحاكاة تجاوزت نطاق الرسم ولا تظهر في المدرج: ${beyond}.`, `Simulated times beyond the chart, not shown in the histogram: ${beyond}.`)}</p>}
      <SimNote count={waits.length} max={SIM_MAX} />
      <Stats mean={exponential.mean(theta)} variance={exponential.variance(theta)} meanTex="\tfrac{1}{\theta}" varTex="\tfrac{1}{\theta^2}" sim={enough(stats)} unit={tr('ساعة', 'h')} />
    </div>
  );
}

// ———————— الطبيعي ————————
export function NormalLab() {
  const { t: tr } = useT();
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
        <Slider label={tr('المتوسط', 'Mean')} symbol="\mu" value={mu} onChange={setMu} {...RANGES.normalMu} unit={tr('مل', 'ml')} digits={0} />
        <Slider label={tr('الانحراف المعياري', 'Standard deviation')} symbol="\sigma" value={sigma} onChange={setSigma} {...RANGES.normalSigma} unit={tr('مل', 'ml')} digits={1} />
        <Slider label={tr('بداية الفترة', 'Start of the interval')} symbol="a" value={a} onChange={setA} min={450} max={550} step={0.5} unit={tr('مل', 'ml')} digits={1} />
        <Slider label={tr('نهاية الفترة', 'End of the interval')} symbol="b" value={b} onChange={setB} min={450} max={550} step={0.5} unit={tr('مل', 'ml')} digits={1} />
      </div>
      <p className="lambda-line">
        <Tex tex={`X \\sim N(\\mu,\\sigma^2) = N(${fmt(mu)},\\ ${fmt(sigma)}^2) = N(${fmt(mu)},\\ ${fmt(sigma * sigma, 2)})`} />
      </p>
      {a > b && <p className="hint">{tr('بدأت الفترة بعد نهايتها، فعكسنا الحدّين تلقائيًا.', 'The interval started after its end, so we swapped the 2 limits automatically.')}</p>}
      <CurveChart
        f={(x) => normal.pdf(x, mu, sigma)}
        xMin={xMin}
        xMax={xMax}
        shade={[lo, hi]}
        markers={[{ x: mu, label: 'μ' }]}
        ariaLabel={tr(
          `كثافة طبيعية بمتوسط ${fmt(mu)} وانحراف معياري ${fmt(sigma)}. P(${fmt(lo)} < X < ${fmt(hi)}) = ${fmt(pr)}`,
          `Normal density with mean ${fmt(mu)} and standard deviation ${fmt(sigma)}. P(${fmt(lo)} < X < ${fmt(hi)}) = ${fmt(pr)}`,
        )}
        xLabel={tr('حجم العبوة x (مل)', 'Bottle volume x (ml)')}
      />
      <Legend items={['curve', 'shade']} />
      <ProbLine tex={`P(${fmt(lo)} < X < ${fmt(hi)}) = \\Phi(${fmt(z2, 2)}) - \\Phi(${fmt(z1, 2)})`} value={pr} />
      <p className="hint">
        <Rich
          text={tr(
            `$z = \\dfrac{x-\\mu}{\\sigma}$: الحد الأدنى يبعد $${fmt(z1, 2)}$ والحد الأعلى $${fmt(z2, 2)}$ انحرافًا معياريًا عن المتوسط. القسمة على $\\sigma = ${fmt(sigma)}$ لا على $\\sigma^2 = ${fmt(sigma * sigma, 2)}$.`,
            `$z = \\dfrac{x-\\mu}{\\sigma}$: the lower limit is $${fmt(z1, 2)}$ and the upper limit $${fmt(z2, 2)}$ standard deviations from the mean. Divide by $\\sigma = ${fmt(sigma)}$, not by $\\sigma^2 = ${fmt(sigma * sigma, 2)}$.`,
          )}
        />
      </p>
      <p className="trunc-note">
        <Rich
          text={tr(
            `الرسم يعرض $\\mu \\pm 4\\sigma$ فقط؛ المساحة خارجه $\\approx ${fmt(outside, 5)}$ غير معروضة. أعلى نقطة في المنحنى $f(\\mu) \\approx ${fmt(peak, 4)}$ كثافة وليست احتمالًا، و$P(X = x) = 0$ لأي قيمة مفردة.`,
            `The chart shows only $\\mu \\pm 4\\sigma$; the area outside it, $\\approx ${fmt(outside, 5)}$, is not shown. The highest point of the curve, $f(\\mu) \\approx ${fmt(peak, 4)}$, is a density, not a probability, and $P(X = x) = 0$ for any single value.`,
          )}
        />
      </p>
      <Stats mean={mu} variance={sigma * sigma} meanTex="\mu" varTex="\sigma^2" unit={tr('مل', 'ml')} />
    </div>
  );
}


// ———————— فوق الهندسي: تخمين الأكواب ————————
/** صف الأكواب: «ح» حليب أولًا (نجاح) و«ش» شاي أولًا، والمختارة محاطة بإطار. */
function CupStrip({ N, k, picked }: { N: number; k: number; picked: number[] }) {
  const hits = picked.filter((i) => i < k).length;
  const { en } = useT();
  return (
    <div className="strip-wrap">
      <ol className="strip cups-strip" role="img" aria-label={en ? `${N} cups; you picked ${picked.length} of them and got ${hits} right` : `${N} كوبًا، اخترت ${picked.length} منها، أصبت ${hits}`}>
        {Array.from({ length: N }, (_, i) => (
          <li key={i} className={`${i < k ? 'ok' : 'no'} ${picked.includes(i) ? 'picked' : ''}`} aria-hidden="true">
            {en ? (i < k ? 'M' : 'T') : i < k ? 'ح' : 'ش'}
          </li>
        ))}
      </ol>
      <p className="strip-key">
        {en ? (
          <>
            <span className="mini ok" aria-hidden="true">M</span> milk first · <span className="mini no" aria-hidden="true">T</span> tea first · framed: your picks
          </>
        ) : (
          <>
            <span className="mini ok" aria-hidden="true">ح</span> حليب أولًا · <span className="mini no" aria-hidden="true">ش</span> شاي أولًا · المحاط بإطار: ما اخترته
          </>
        )}
      </p>
    </div>
  );
}

export function HypergeometricLab() {
  const [N, setN] = useState(8);
  const [k, setK] = useState(4);
  const { t } = useT();
  // كما في تجربة الشاي: تعرف عدد أكواب «الحليب أولًا» فتختار العدد نفسه (n = k)
  const kk = Math.min(k, N - 1), nn = kk;
  const sim = useDiscreteSim(`${N}|${kk}|${nn}`);
  const [one, setOne] = useState<number[] | null>(null);
  useEffect(() => setOne(null), [N, kk, nn]);
  const [lo, hi] = hypergeometric.support(N, kk, nn);
  const xs = range(0, hi);
  const bars = xs.map((x) => ({ x, p: hypergeometric.pmf(x, N, kk, nn) }));
  const xm = xs.reduce((m, x) => (hypergeometric.pmf(x, N, kk, nn) > hypergeometric.pmf(m, N, kk, nn) ? x : m), lo);
  const runOne = () => {
    const pick = sample.drawWithout(N, nn);
    setOne(pick);
    sim.add([pick.filter((i) => i < kk).length]);
  };
  const batch = () => sim.add(Array.from({ length: SIM_BATCH }, () => sample.hypergeometric(N, kk, nn)));
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label={t('عدد الأكواب', 'Number of cups')} symbol="N" value={N} onChange={setN} min={4} max={40} step={1} digits={0} />
        <Slider label={t('أكواب «حليب أولًا»، وتختار العدد نفسه', '“Milk first” cups (you pick the same number)')} symbol="k = n" value={kk} onChange={setK} min={1} max={N - 1} step={1} digits={0} />
      </div>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === hi} ariaLabel={t(
          `فوق الهندسي N=${N}, k=${kk}, n=${nn}. احتمال إصابة ${hi} كلها بالتخمين ${fmt(hypergeometric.pmf(hi, N, kk, nn))}`,
          `Hypergeometric N=${N}, k=${kk}, n=${nn}. Probability of getting all ${hi} right by guessing: ${fmt(hypergeometric.pmf(hi, N, kk, nn))}`,
        )}
        xLabel={t('عدد الإصابات بالتخمين x', 'Correct picks by guessing, x')}
      />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      {lo > 0 && <Rich as="p" className="hint" text={t(`لاحظ: $x$ لا يقل عن $${lo}$، لأنك تختار $${nn}$ ولا يوجد إلا $${N - kk}$ من النوع الآخر.`, `Note: $x$ is at least $${lo}$, because you pick $${nn}$ and there are only $${N - kk}$ of the other kind.`)} />}
      <ProbLine tex={`P(X=${hi}) = \\frac{\\binom{${kk}}{${hi}}\\binom{${N - kk}}{${nn - hi}}}{\\binom{${N}}{${nn}}}`} value={hypergeometric.pmf(hi, N, kk, nn)} />
      <ProbLine tex={`P(X=${xm}) = ${fmt(hypergeometric.pmf(xm, N, kk, nn), 4)},\\quad P_{\\mathrm{Bin}}(X=${xm})`} value={binomial.pmf(xm, nn, kk / N)} label={t('عند أرجح قيمة، مقارنة بذي الحدين (لو أُعيد كل كوب):', 'At the most likely value, compared with the binomial (if each cup were put back):')} />
      <SimButtons onOne={runOne} oneLabel={t('خمّن مرة واحدة', 'Guess once')} onBatch={batch} batchLabel={t(`خمّن ${SIM_BATCH} مرة`, `Guess ${SIM_BATCH} times`)} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <CupStrip N={N} k={kk} picked={one} />
          <p className="result-line">
            {t('أصبت في هذه المرة: ', 'Right this time: ')}<Tex tex={`X = ${one.filter((i) => i < kk).length}`} />
          </p>
        </>
      )}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={hypergeometric.mean(N, kk, nn)} variance={hypergeometric.variance(N, kk, nn)} meanTex="n\tfrac{k}{N}" varTex="n\tfrac{k}{N}\big(1-\tfrac{k}{N}\big)\tfrac{N-n}{N-1}" sim={enough(sim.stats)} />
    </div>
  );
}

// ———————— ذو الحدين السالب: حتى الفوز رقم r ————————
export function NegbinLab() {
  const [r, setR] = useState(3);
  const [p, setP] = useState(0.5);
  const { t: tr } = useT();
  const cdf = (x: number) => { let s = 0; for (let i = r; i <= x; i++) s += negbin.pmf(i, r, p); return s; };
  const K = Math.max(r + 8, Math.min(r + 60, discreteUpper(cdf, 0.99, r, r + 60)));
  const sim = useDiscreteSim(`${r}|${p}`);
  const [one, setOne] = useState<number[] | null>(null);
  useEffect(() => setOne(null), [r, p]);
  const xs = range(r, K);
  const bars = xs.map((x) => ({ x, p: negbin.pmf(x, r, p) }));
  const mode = xs.reduce((m, x) => (negbin.pmf(x, r, p) > negbin.pmf(m, r, p) ? x : m), r);
  const play = () => {
    const t: number[] = [];
    let w = 0;
    while (w < r && t.length < 500) {
      const s1 = sample.bernoulli(p);
      t.push(s1);
      w += s1;
    }
    return t;
  };
  const runOne = () => {
    const t = play();
    setOne(t);
    sim.add([t.length]);
  };
  const batch = () => sim.add(Array.from({ length: SIM_BATCH }, () => play().length));
  const simBeyond = sim.stats ? sim.values.filter((v) => v > K).length : 0;
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label={tr('الفوز المطلوب', 'Wins needed')} symbol="r" value={r} onChange={setR} min={1} max={6} step={1} digits={0} />
        <Slider label={tr('احتمال الفوز في كل جولة', 'Probability of winning each round')} symbol="p" value={p} onChange={setP} min={0.1} max={0.9} step={0.05} />
      </div>
      <BarChart bars={bars} sim={simBars(sim.stats, xs)} highlight={(x) => x === mode} ariaLabel={tr(`ذو الحدين السالب r=${r}, p=${fmt(p)}. أرجح جولة للفوز رقم ${r} هي ${mode}`, `Negative binomial r=${r}, p=${fmt(p)}. The most likely round for win number ${r} is ${mode}`)}
        xLabel={tr(`رقم الجولة التي يأتي فيها الفوز رقم ${r}`, `The round in which win number ${r} comes`)}
      />
      <Legend items={enough(sim.stats) ? ['theory', 'highlight', 'sim'] : ['theory', 'highlight']} />
      <ProbLine tex={`P(X=${mode}) = \\binom{${mode - 1}}{${r - 1}}(${fmt(p)})^{${r}}(${fmt(1 - p)})^{${mode - r}}`} value={negbin.pmf(mode, r, p)} label={Math.abs(negbin.pmf(mode + 1, r, p) - negbin.pmf(mode, r, p)) < 1e-12 ? tr(`أرجح جولة (وتساويها الجولة ${mode + 1}):`, `Most likely round (tied with round ${mode + 1}):`) : tr('أرجح جولة:', 'Most likely round:')} />
      <SimButtons onOne={runOne} oneLabel={tr(`العب حتى الفوز رقم ${r}`, `Play until win number ${r}`)} onBatch={batch} batchLabel={tr(`كرّر ${SIM_BATCH} مرة`, `Repeat ${SIM_BATCH} times`)} onClear={() => (sim.clear(), setOne(null))} full={sim.full} hasData={!!sim.stats} />
      {one && (
        <>
          <TrialStrip trials={one} successWord={tr('فوز', 'win')} failWord={tr('خسارة', 'loss')} />
          <p className="result-line">
            {tr(`الفوز رقم ${r} جاء في الجولة `, `Win number ${r} came in round `)}<Tex tex={`X = ${one.length}`} />
          </p>
        </>
      )}
      {simBeyond > 0 && <p className="trunc-note">{tr(`تكرارات في المحاكاة تجاوزت الجولة ${K} ولا تظهر في الرسم: ${simBeyond}.`, `Simulated runs beyond round ${K}, not shown in the chart: ${simBeyond}.`)}</p>}
      <SimNote count={sim.values.length} max={SIM_MAX} />
      <Stats mean={negbin.mean(r, p)} variance={negbin.variance(r, p)} meanTex="\tfrac{r}{p}" varTex="\tfrac{r(1-p)}{p^2}" sim={enough(sim.stats)} />
    </div>
  );
}

// ———————— غاما: الانتظار حتى الحدث رقم α ————————
export function GammaLab() {
  const [alpha, setAlpha] = useState(3);
  const [beta, setBeta] = useState(2);
  const { t: tr } = useT();
  const [waits, setWaits] = useState<number[]>([]);
  const [one, setOne] = useState<number[] | null>(null);
  useEffect(() => (setWaits([]), setOne(null)), [alpha, beta]);
  // نهاية العرض: المتوسط + 4 انحرافات معيارية
  const xMax = alpha / beta + 4 * Math.sqrt(alpha) / beta;
  const hist: Bin[] | null = useMemo(() => {
    if (waits.length < MIN_SIM) return null;
    const B = 30, w = xMax / B;
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
  const stages = () => Array.from({ length: alpha }, () => sample.exponential(beta));
  const add = (k: number) => {
    const runs = Array.from({ length: k }, stages);
    if (k === 1) setOne(runs[0]);
    setWaits((w) => w.concat(runs.map((r) => r.reduce((a, b) => a + b, 0))).slice(0, SIM_MAX));
  };
  return (
    <div className="lab">
      <div className="slider-grid">
        <Slider label={tr('ننتظر الحدث رقم', 'We wait for event number')} symbol="\alpha" value={alpha} onChange={setAlpha} min={1} max={8} step={1} digits={0} />
        <Slider label={tr('المعدل (أحداث في الدقيقة)', 'Rate (events per minute)')} symbol="\beta" value={beta} onChange={setBeta} min={0.5} max={3} step={0.5} digits={1} />
      </div>
      <CurveChart
        f={(x) => gammaDist.pdf(x, alpha, beta)}
        xMin={0}
        xMax={xMax}
        hist={hist}
        markers={[{ x: alpha / beta, label: 'E[X]' }]}
        ariaLabel={tr(`كثافة غاما α=${alpha}, β=${fmt(beta)}، ومتوسطها ${fmt(alpha / beta)} دقيقة`, `Gamma density α=${alpha}, β=${fmt(beta)}, with mean ${fmt(alpha / beta)} min`)}
        xLabel={tr('زمن الانتظار حتى الحدث رقم α (دقيقة)', 'Waiting time until event number α (min)')}
      />
      <Legend items={hist ? ['curve', 'hist'] : ['curve']} />
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => add(1)} disabled={waits.length >= SIM_MAX}>▶ {tr('انتظر مرة واحدة', 'Wait once')}</button>
        <button type="button" className="btn" onClick={() => add(SIM_BATCH)} disabled={waits.length >= SIM_MAX}>▶▶ {tr(`انتظر ${SIM_BATCH} مرة`, `Wait ${SIM_BATCH} times`)}</button>
        <button type="button" className="btn btn-quiet" onClick={() => (setWaits([]), setOne(null))} disabled={!waits.length}>{tr('مسح المحاكاة', 'Clear the simulation')}</button>
      </div>
      {one && (
        <p className="result-line">
          <Rich text={`${tr('المراحل', 'Stages')}: $${one.map((x) => fmt(x, 2)).join(' + ')} = ${fmt(one.reduce((a, b) => a + b, 0), 2)}$ ${tr('دقيقة', 'min')}.`} />
        </p>
      )}
      <SimNote count={waits.length} max={SIM_MAX} />
      <Stats mean={gammaDist.mean(alpha, beta)} variance={gammaDist.variance(alpha, beta)} meanTex="\tfrac{\alpha}{\beta}" varTex="\tfrac{\alpha}{\beta^2}" sim={enough(stats)} unit={tr('دقيقة', 'min')} />
    </div>
  );
}

// ———————— مربع كاي: مطابقة بواسون لركلات الخيل ————————

export function ChiSquareLab() {
  const { t: tr } = useT();
  const [l, setL] = useState(1.0);
  // λ المقدّرة من البيانات تُنقص درجة حرية؛ λ المفروضة مسبقًا لا تُنقصها
  const est = Math.abs(l - LAMBDA_HAT) < 0.005;
  const df = est ? 1 : 2, crit = est ? CHI1_95 : CHI2_95;
  const f = chiFit(l, df);
  const labels = ['0', '1', tr('2 فأكثر', '2 or more')];
  const reject = f.stat > crit;
  return (
    <div className="lab">
      <Slider label={tr('متوسط الوفيات في الفيلق-السنة', 'Mean deaths per corps-year')} symbol="\lambda" value={l} onChange={setL} min={0.3} max={1.3} step={0.01} />
      <div className="btn-row">
        <button type="button" className="btn btn-quiet" onClick={() => setL(LAMBDA_HAT)} disabled={est}>
          {tr('استعمل المقدَّرة من البيانات ', 'Use the estimate from the data ')}<Tex tex={`\\hat\\lambda = ${LAMBDA_HAT}`} />
        </button>
      </div>
      <table className="obs-exp">
        <caption className="hint"><Rich text={tr('ما وقع ($O$) وما يتوقعه بواسون ($E$) في كل فئة', 'Observed ($O$) and expected under the Poisson ($E$) in each category')} /></caption>
        <thead>
          <tr>
            <th scope="col">{tr('الوفيات', 'Deaths')}</th>
            <th scope="col"><Tex tex="O" /></th>
            <th scope="col"><Tex tex="E" /></th>
            <th scope="col"><Tex tex="\tfrac{(O-E)^2}{E}" /></th>
          </tr>
        </thead>
        <tbody>
          {labels.map((lab, i) => (
            <tr key={lab}>
              <th scope="row">{lab}</th>
              <td>{f.O[i]}</td>
              <td>{fmt(f.E[i], 2)}</td>
              <td>{fmt(f.parts[i], 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ProbLine tex={`\\chi^{2} = \\sum \\tfrac{(O-E)^{2}}{E}`} value={f.stat} />
      <p className={`verdict ${reject ? 'no' : 'ok'}`} aria-live="polite">
        <Rich
          text={
            reject
              ? tr(`$${fmt(f.stat, 3)} > ${crit}$: البعد كبير؛ نرفض أن البيانات من بواسون بهذا المتوسط.`, `$${fmt(f.stat, 3)} > ${crit}$: the distance is large; we reject that the data come from a Poisson with this mean.`)
              : tr(`$${fmt(f.stat, 3)} \\le ${crit}$: البعد صغير؛ لا دليل ضد بواسون بهذا المتوسط.`, `$${fmt(f.stat, 3)} \\le ${crit}$: the distance is small; no evidence against a Poisson with this mean.`)
          }
        />
      </p>
      <Rich
        as="p"
        className="hint"
        text={tr(
          `${est ? `درجات الحرية $3 - 1 - 1 = 1$: ثلاث فئات، ناقص واحد لأن المجموع ثابت (200)، وناقص واحد لأننا قدّرنا $\\lambda$ من البيانات.` : `هنا $\\lambda$ مفروضة مسبقًا لا مقدّرة، فدرجات الحرية $3 - 1 = 2$. وعند $\\hat\\lambda = ${LAMBDA_HAT}$ المقدّرة تصبح 1.`} والقيمة الحرجة عند $0.05$ هي $${crit}$. احتمال بعد كهذا أو أكبر لو صح النموذج: ${f.p < 0.001 ? 'أقل من $0.001$' : `$${fmt(f.p, 3)}$`}.`,
          `${est ? `Degrees of freedom $3 - 1 - 1 = 1$: 3 categories, minus 1 because the total is fixed (200), and minus 1 because we estimated $\\lambda$ from the data.` : `Here $\\lambda$ is set in advance, not estimated, so the degrees of freedom are $3 - 1 = 2$. At the estimate $\\hat\\lambda = ${LAMBDA_HAT}$ they become 1.`} The critical value at $0.05$ is $${crit}$. The probability of a distance this large or larger if the model were right: ${f.p < 0.001 ? 'less than $0.001$' : `$${fmt(f.p, 3)}$`}.`,
        )}
      />
    </div>
  );
}

// ———————— t: عينات صغيرة وσ مجهول ————————
/** طبيعي معياري بطريقة بوكس–مولر. */
const gauss = (rng: Rng = Math.random) => Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());

export function TLab() {
  const { t: tr } = useT();
  const [n, setN] = useState(5);
  const [ts, setTs] = useState<number[]>([]);
  useEffect(() => setTs([]), [n]);
  const v = n - 1, X = 5;
  const tStat = () => {
    const xs = Array.from({ length: n }, () => gauss());
    const m = xs.reduce((a, b) => a + b, 0) / n;
    const s2 = xs.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1);
    return m / Math.sqrt(s2 / n);
  };
  const hist: Bin[] | null = useMemo(() => {
    if (ts.length < MIN_SIM) return null;
    const B = 40, w = (2 * X) / B;
    const c = new Array(B).fill(0);
    for (const t of ts) if (t > -X && t < X) c[Math.floor((t + X) / w)]++;
    return c.map((k, i) => ({ x0: -X + i * w, x1: -X + (i + 1) * w, density: k / (ts.length * w) }));
  }, [ts]);
  const far = ts.length ? ts.filter((t) => Math.abs(t) > 1.96).length / ts.length : null;
  const theory = 2 * (1 - studentT.cdf(1.96, v));
  return (
    <div className="lab">
      <Slider label={tr('حجم العينة', 'Sample size')} symbol="n" value={n} onChange={setN} min={3} max={30} step={1} digits={0} />
      <CurveChart
        f={(x) => studentT.pdf(x, v)}
        xMin={-X}
        xMax={X}
        hist={hist}
        markers={[{ x: -1.96, label: '−1.96' }, { x: 1.96, label: '1.96' }]}
        ariaLabel={tr(`كثافة t بدرجات حرية v = ${v}، ومدرّج قيم T من المحاكاة`, `The t density with v = ${v} degrees of freedom, and a histogram of simulated T values`)}
        xLabel="T = (X̄ − μ) / (S/√n)"
      />
      <Legend items={hist ? ['curve', 'hist'] : ['curve']} />
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => setTs((a) => a.concat(Array.from({ length: SIM_BATCH }, tStat)).slice(0, SIM_MAX))} disabled={ts.length >= SIM_MAX}>
          ▶▶ {tr(`اسحب ${SIM_BATCH} عينة بحجم ${n}`, `Draw ${SIM_BATCH} samples of size ${n}`)}
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => setTs([])} disabled={!ts.length}>{tr('مسح المحاكاة', 'Clear the simulation')}</button>
      </div>
      <Rich
        as="p"
        className="prob-line"
        text={tr(
          `الطبيعي يقول $P(|T| > 1.96) = 0.05$. لكن t بدرجات الحرية $v = ${v}$ يقول $${fmt(theory, 3)}$${far !== null ? `، والمحاكاة $${fmt(far, 3)}$` : ''}.`,
          `The normal says $P(|T| > 1.96) = 0.05$. But t with $v = ${v}$ degrees of freedom says $${fmt(theory, 3)}$${far !== null ? `, and the simulation $${fmt(far, 3)}$` : ''}.`,
        )}
      />
      <SimNote count={ts.length} max={SIM_MAX} />
    </div>
  );
}

// ———————— المنتظم: إبرة بوفون ————————
export function BuffonLab() {
  const { t: tr } = useT();
  const d = 40, W = 300, rows = 4;
  const [ratio, setRatio] = useState(0.8);
  const l = ratio * d;
  const [needles, setNeedles] = useState<[number, number, number][]>([]);
  const [count, setCount] = useState({ n: 0, hits: 0 });
  useEffect(() => (setNeedles([]), setCount({ n: 0, hits: 0 })), [ratio]);
  const drop = (k: number) => {
    // الموضع والزاوية منتظمان مستقلان
    const fresh = Array.from({ length: k }, (): [number, number, number] => [l / 2 + Math.random() * (W - l), Math.random() * rows * d, Math.random() * Math.PI]);
    const hits = fresh.filter(([, y, a]) => Math.floor((y - (l / 2) * Math.sin(a)) / d) !== Math.floor((y + (l / 2) * Math.sin(a)) / d)).length;
    setNeedles((ns) => ns.concat(fresh).slice(-120));
    setCount((c) => ({ n: c.n + k, hits: c.hits + hits }));
  };
  const theory = (2 * ratio) / Math.PI;
  const est = count.n ? count.hits / count.n : null;
  return (
    <div className="lab">
      <Slider label={tr('طول الإبرة نسبة إلى المسافة بين الخطين', 'Needle length relative to the gap between lines')} symbol="l/d" value={ratio} onChange={setRatio} min={0.2} max={1} step={0.05} />
      <div className="needle-box">
        <NeedleField needles={needles} l={l} d={d} W={W} rows={rows} label={tr(`${count.n} إبرة مرمية، قطعت منها ${count.hits} خطًا`, `${count.n} needles thrown, ${count.hits} of them crossing a line`)} />
      </div>
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => drop(10)} disabled={count.n >= SIM_MAX}>▶ {tr('ارمِ 10 إبر', 'Throw 10 needles')}</button>
        <button type="button" className="btn" onClick={() => drop(SIM_BATCH)} disabled={count.n >= SIM_MAX}>▶▶ {tr(`ارمِ ${SIM_BATCH}`, `Throw ${SIM_BATCH}`)}</button>
        <button type="button" className="btn btn-quiet" onClick={() => (setNeedles([]), setCount({ n: 0, hits: 0 }))} disabled={!count.n}>{tr('مسح', 'Clear')}</button>
      </div>
      <ProbLine tex={`\\tfrac{2l}{\\pi d} = \\tfrac{2 \\times ${fmt(ratio)}}{\\pi}`} value={theory} label={tr('النظرية:', 'Theory:')} />
      {est !== null && (
        <p className="prob-line" aria-live="polite">
          <Rich
            text={tr(
              `المحاكاة: $${count.hits} / ${count.n} = ${fmt(est, 3)}$${count.hits ? `، ومنها تقدير $\\pi \\approx \\frac{2l}{d \\cdot ${fmt(est, 3)}} = ${fmt((2 * ratio) / est, 3)}$` : ''}.`,
              `Simulation: $${count.hits} / ${count.n} = ${fmt(est, 3)}$${count.hits ? `, which gives the estimate $\\pi \\approx \\frac{2l}{d \\cdot ${fmt(est, 3)}} = ${fmt((2 * ratio) / est, 3)}$` : ''}.`,
            )}
          />
        </p>
      )}
      <Rich as="p" className="hint" text={tr('الرسم يعرض آخر 120 إبرة. كل رمية: موضع المركز منتظم، والزاوية منتظمة على $(0, \\pi)$، ومستقلان.', 'The drawing shows the last 120 needles. Each throw: the position of the centre is uniform, the angle is uniform on $(0, \\pi)$, and the 2 are independent.')} />
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
  negbin: NegbinLab,
  gamma: GammaLab,
  chisquare: ChiSquareLab,
  t: TLab,
  uniform: BuffonLab,
};
