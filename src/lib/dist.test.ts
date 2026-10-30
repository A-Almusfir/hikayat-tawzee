import { describe, expect, it } from 'vitest';
import {
  bernoulli, binomial, choose, exponential, fmt, geometric, normal, poisson, sample, sampleStats, seededRng,
} from './dist';
import { distributions } from '../content/distributions';
import { scenarios, choiceLabels } from '../content/chooser';
import { RANGES } from './ranges';
import { journey } from '../content/identity';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

describe('مجموع الاحتمالات = 1', () => {
  it('برنولي', () => {
    for (const p of [0, 0.05, 0.3, 0.5, 0.95, 1]) expect(bernoulli.pmf(0, p) + bernoulli.pmf(1, p)).toBeCloseTo(1, 12);
  });
  it('ذو الحدين لكل n في نطاق الموقع', () => {
    for (let n = 1; n <= 30; n++)
      for (const p of [0.05, 0.25, 0.5, 0.8, 0.95]) expect(sum(range(0, n).map((k) => binomial.pmf(k, n, p)))).toBeCloseTo(1, 10);
  });
  it('الهندسي (مجموع جزئي كبير)', () => {
    for (const p of [0.1, 0.5, 0.9]) expect(sum(range(1, 2000).map((k) => geometric.pmf(k, p)))).toBeCloseTo(1, 10);
  });
  it('بواسون', () => {
    for (const l of [0.5, 3, 6, 15]) expect(sum(range(0, 200).map((k) => poisson.pmf(k, l)))).toBeCloseTo(1, 10);
  });
});

describe('قيم مرجعية', () => {
  it('C(n,k)', () => {
    expect(choose(5, 3)).toBe(10);
    expect(choose(10, 3)).toBe(120);
    expect(choose(30, 15)).toBe(155117520);
    expect(choose(4, 5)).toBe(0);
  });
  it('ذو الحدين n=5, p=0.5, k=3 → 0.3125', () => {
    expect(binomial.pmf(3, 5, 0.5)).toBeCloseTo(0.3125, 12);
  });
  it('الهندسي p=0.5, k=3 → 0.125', () => {
    expect(geometric.pmf(3, 0.5)).toBeCloseTo(0.125, 12);
    expect(geometric.pmf(0, 0.5)).toBe(0); // الاصطلاح: X ≥ 1
    expect(geometric.cdf(3, 0.5)).toBeCloseTo(0.875, 12);
  });
  it('بواسون', () => {
    expect(poisson.pmf(0, 3)).toBeCloseTo(Math.exp(-3), 12);
    expect(poisson.pmf(4, 6)).toBeCloseTo(0.1338526, 6);
  });
  it('الأسي', () => {
    expect(exponential.cdf(1, 2)).toBeCloseTo(1 - Math.exp(-2), 12);
    expect(1 - exponential.cdf(0.5, 3)).toBeCloseTo(0.2231302, 6);
    expect(exponential.interval(1, 2, 1)).toBeCloseTo(Math.exp(-1) - Math.exp(-2), 12);
    expect(exponential.cdf(-1, 2)).toBe(0);
    expect(exponential.quantile(0.5, 2)).toBeCloseTo(Math.log(2) / 2, 12);
  });
  it('الطبيعي (قيم جداول Φ)', () => {
    expect(normal.cdf(0, 0, 1)).toBeCloseTo(0.5, 7);
    expect(normal.cdf(1, 0, 1)).toBeCloseTo(0.8413447, 6);
    expect(normal.cdf(1.96, 0, 1)).toBeCloseTo(0.9750021, 6);
    expect(normal.cdf(-2, 0, 1)).toBeCloseTo(0.0227501, 6);
    expect(normal.cdf(1.25, 0, 1)).toBeCloseTo(0.8943502, 6);
    expect(normal.interval(-1, 1, 0, 1)).toBeCloseTo(0.6826895, 6);
    expect(normal.interval(495, 505, 500, 4)).toBeCloseTo(0.7887005, 6);
    expect(normal.pdf(0, 0, 1)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 12);
  });
});

describe('المتوسط والتباين يطابقان التعريف (مجموع k·P و k²·P)', () => {
  const check = (pmf: (k: number) => number, ks: number[], mean: number, variance: number) => {
    const m = sum(ks.map((k) => k * pmf(k)));
    const v = sum(ks.map((k) => (k - m) ** 2 * pmf(k)));
    expect(m).toBeCloseTo(mean, 8);
    expect(v).toBeCloseTo(variance, 6);
  };
  it('برنولي', () => {
    for (const p of [0.1, 0.5, 0.8]) check((k) => bernoulli.pmf(k, p), [0, 1], bernoulli.mean(p), bernoulli.variance(p));
  });
  it('ذو الحدين', () => {
    for (const [n, p] of [[10, 0.25], [30, 0.7], [5, 0.5]]) check((k) => binomial.pmf(k, n, p), range(0, n), binomial.mean(n, p), binomial.variance(n, p));
  });
  it('الهندسي: 1/p و(1−p)/p²', () => {
    for (const p of [0.2, 0.5, 0.9]) check((k) => geometric.pmf(k, p), range(1, 3000), 1 / p, (1 - p) / p ** 2);
  });
  it('بواسون: λ و λ', () => {
    for (const l of [0.5, 6, 15]) check((k) => poisson.pmf(k, l), range(0, 200), l, l);
  });
  it('الأسي: 1/λ و 1/λ² (تكامل عددي)', () => {
    for (const l of [0.5, 3]) {
      const h = 1e-4 / l, N = Math.ceil(40 / l / h);
      let m = 0, m2 = 0, area = 0;
      for (let i = 0; i < N; i++) {
        const x = (i + 0.5) * h, f = exponential.pdf(x, l) * h;
        area += f; m += x * f; m2 += x * x * f;
      }
      expect(area).toBeCloseTo(1, 6);
      expect(m).toBeCloseTo(exponential.mean(l), 5);
      expect(m2 - m * m).toBeCloseTo(exponential.variance(l), 4);
    }
  });
  it('الطبيعي: μ و σ² (تكامل عددي) — σ انحراف معياري لا تباين', () => {
    const mu = 500, s = 4, h = 0.001;
    let area = 0, m = 0, m2 = 0;
    for (let x = mu - 12 * s; x < mu + 12 * s; x += h) {
      const f = normal.pdf(x + h / 2, mu, s) * h;
      area += f; m += (x + h / 2) * f; m2 += (x + h / 2) ** 2 * f;
    }
    expect(area).toBeCloseTo(1, 6);
    expect(m).toBeCloseTo(normal.mean(mu), 4);
    expect(m2 - m * m).toBeCloseTo(normal.variance(s), 3);
  });
});

describe('لا NaN ولا Infinity في نطاقات المدخلات المسموح بها', () => {
  const finite = (x: number) => expect(Number.isFinite(x)).toBe(true);
  it('كل المنزلقات على حدودها وفي وسطها', () => {
    const vals = (r: { min: number; max: number; step: number }) => {
      const out: number[] = [];
      for (let v = r.min; v <= r.max + 1e-9; v += r.step) out.push(+v.toFixed(6));
      return out;
    };
    for (const p of vals(RANGES.bernoulliP)) { finite(bernoulli.mean(p)); finite(bernoulli.variance(p)); }
    for (const n of vals(RANGES.binomialN)) for (const p of vals(RANGES.binomialP)) {
      finite(binomial.mean(n, p)); finite(binomial.variance(n, p));
      for (let k = 0; k <= n; k++) finite(binomial.pmf(k, n, p));
    }
    for (const p of vals(RANGES.geometricP)) {
      finite(geometric.mean(p)); finite(geometric.variance(p));
      for (let k = 1; k <= 60; k++) finite(geometric.pmf(k, p));
    }
    for (const r of vals(RANGES.poissonRate)) for (const t of vals(RANGES.poissonT)) {
      const l = r * t;
      for (let k = 0; k <= 60; k++) finite(poisson.pmf(k, l));
    }
    for (const l of vals(RANGES.expTheta)) {
      finite(exponential.mean(l)); finite(exponential.variance(l));
      for (const x of [0, 0.1, 1, 10, 50]) { finite(exponential.pdf(x, l)); finite(exponential.cdf(x, l)); }
      finite(exponential.quantile(0.995, l));
    }
    for (const mu of vals(RANGES.normalMu)) for (const s of vals(RANGES.normalSigma)) {
      for (const x of [mu - 10 * s, mu, mu + 10 * s]) { finite(normal.pdf(x, mu, s)); finite(normal.cdf(x, mu, s)); }
    }
  });
  it('fmt لا يُظهر NaN', () => {
    expect(fmt(NaN)).toBe('—');
    expect(fmt(0.25)).toBe('0.25');
    expect(fmt(2)).toBe('2');
  });
});

describe('المحاكاة', () => {
  it('متوسطات المحاكاة قريبة من النظرية (بذرة ثابتة)', () => {
    const rng = seededRng(42);
    const xs = Array.from({ length: 20000 }, () => sample.binomial(10, 0.25, rng));
    expect(sampleStats(xs).mean).toBeCloseTo(2.5, 1);
    const g = Array.from({ length: 20000 }, () => sample.geometricTrials(0.25, rng).length);
    expect(Math.min(...g)).toBeGreaterThanOrEqual(1);
    expect(sampleStats(g).mean).toBeGreaterThan(3.85);
    expect(sampleStats(g).mean).toBeLessThan(4.15);
    const e = Array.from({ length: 20000 }, () => sample.exponential(2, rng));
    expect(sampleStats(e).mean).toBeCloseTo(0.5, 1);
    const counts = Array.from({ length: 5000 }, () => sample.poissonProcess(3, 2, rng).length);
    expect(sampleStats(counts).mean).toBeGreaterThan(5.8);
    expect(sampleStats(counts).mean).toBeLessThan(6.2);
  });
});

describe('اتساق المحتوى مع الحسابات', () => {
  it('ستة توزيعات بالضبط، لكل منها ثلاثة أسئلة وإجابة صحيحة واحدة', () => {
    expect(distributions.map((d) => d.id)).toEqual(['bernoulli', 'binomial', 'geometric', 'poisson', 'exponential', 'normal']);
    for (const d of distributions) {
      expect(d.quiz).toHaveLength(3);
      expect(new Set(d.quiz.map((q) => q.kind))).toEqual(new Set(['choose', 'compute', 'concept']));
      for (const q of d.quiz) {
        expect(q.options.filter((o) => o.correct)).toHaveLength(1);
        for (const o of q.options) expect(o.why.length).toBeGreaterThan(5);
      }
    }
  });
  it('الأسئلة الحسابية: القيمة المعروضة = الحساب، وتظهر في نص الإجابة الصحيحة', () => {
    const qs = distributions.flatMap((d) => d.quiz).filter((q) => q.check);
    expect(qs.length).toBeGreaterThanOrEqual(6);
    for (const q of qs) {
      const c = q.check!;
      expect(Math.abs(c.compute() - c.shown)).toBeLessThanOrEqual(0.5 * 10 ** -c.digits + 1e-12);
      const correct = q.options.find((o) => o.correct)!;
      expect(correct.text + correct.why).toContain(fmt(c.shown, c.digits));
    }
  });
  it('قيم مذكورة في الشروح', () => {
    expect(binomial.mean(10, 0.25)).toBe(2.5);
    expect(binomial.variance(10, 0.25)).toBeCloseTo(1.875, 12);
    expect(geometric.mean(1 / 6)).toBeCloseTo(6, 12);
    expect(1 - exponential.cdf(4, 0.5)).toBeCloseTo(Math.exp(-2), 12);
    expect(normal.cdf(508, 500, 16)).toBeCloseTo(0.6914625, 6); // المشتت: القسمة على σ²
    expect(1 - normal.cdf(508, 500, 4)).toBeCloseTo(0.0227501, 6);
    expect(normal.interval(-2, 2, 0, 1)).toBeCloseTo(0.9544997, 6);
    expect(binomial.pmf(3, 10, 0.25)).toBeCloseTo(0.2502823, 6);
  });
  it('مواقف «أي توزيع أختار؟»', () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(8);
    expect(scenarios.length).toBeLessThanOrEqual(18);
    expect(scenarios.some((s) => s.answer === 'insufficient')).toBe(true);
    for (const s of scenarios) {
      expect(choiceLabels[s.answer]).toBeDefined();
      expect(s.closest).not.toBe(s.answer);
    }
    const pairs = new Set(scenarios.map((s) => [s.answer, s.closest].sort().join('|')));
    expect(pairs.has('bernoulli|binomial')).toBe(true);
    expect(pairs.has('binomial|geometric')).toBe(true);
    expect(pairs.has('exponential|poisson')).toBe(true);
    for (const p of ['geometric|negbin', 'exponential|gamma', 'normal|t']) expect(pairs.has(p), p).toBe(true);
    // كل توزيع في الرحلة له موقف واحد على الأقل
    for (const d of journey) expect(scenarios.some((s) => s.answer === d), d).toBe(true);
  });
});
