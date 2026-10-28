// الحسابات الرياضية للتوزيعات الستة. لا يعتمد هذا الملف على الواجهة.

export type Rng = () => number;

/** معامل ذي الحدين C(n,k) بطريقة ضرب تدريجية تحافظ على الدقة لقيم n الصغيرة والمتوسطة. */
export function choose(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  const m = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= m; i++) r = (r * (n - m + i)) / i;
  return Math.round(r);
}

/** لوغاريتم k! بالجمع المباشر (k في نطاقات الموقع صغيرة). */
export function logFactorial(k: number): number {
  let s = 0;
  for (let i = 2; i <= k; i++) s += Math.log(i);
  return s;
}

// ———————— برنولي ————————
export const bernoulli = {
  pmf: (x: number, p: number) => (x === 1 ? p : x === 0 ? 1 - p : 0),
  mean: (p: number) => p,
  variance: (p: number) => p * (1 - p),
};

// ———————— ذو الحدين ————————
export const binomial = {
  pmf: (k: number, n: number, p: number) => {
    if (!Number.isInteger(k) || k < 0 || k > n) return 0;
    return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  },
  cdf: (k: number, n: number, p: number) => {
    let s = 0;
    for (let i = 0; i <= Math.min(k, n); i++) s += binomial.pmf(i, n, p);
    return Math.min(1, s);
  },
  mean: (n: number, p: number) => n * p,
  variance: (n: number, p: number) => n * p * (1 - p),
};

// ———————— الهندسي: X = عدد المحاولات حتى أول نجاح (يشمل محاولة النجاح) ————————
export const geometric = {
  pmf: (k: number, p: number) => (Number.isInteger(k) && k >= 1 ? Math.pow(1 - p, k - 1) * p : 0),
  /** P(X ≤ k) = 1 − (1−p)^k */
  cdf: (k: number, p: number) => (k < 1 ? 0 : 1 - Math.pow(1 - p, Math.floor(k))),
  mean: (p: number) => 1 / p,
  variance: (p: number) => (1 - p) / (p * p),
};

// ———————— بواسون ————————
export const poisson = {
  pmf: (k: number, lambda: number) => {
    if (!Number.isInteger(k) || k < 0) return 0;
    return Math.exp(k * Math.log(lambda) - lambda - logFactorial(k));
  },
  cdf: (k: number, lambda: number) => {
    let s = 0;
    for (let i = 0; i <= k; i++) s += poisson.pmf(i, lambda);
    return Math.min(1, s);
  },
  mean: (lambda: number) => lambda,
  variance: (lambda: number) => lambda,
};

// ———————— الأسي: λ معدل (أحداث لكل وحدة زمن) ————————
export const exponential = {
  pdf: (x: number, lambda: number) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x)),
  /** P(X ≤ x) = 1 − e^{−λx} */
  cdf: (x: number, lambda: number) => (x <= 0 ? 0 : 1 - Math.exp(-lambda * x)),
  /** P(a < X < b) */
  interval: (a: number, b: number, lambda: number) => exponential.cdf(b, lambda) - exponential.cdf(a, lambda),
  quantile: (q: number, lambda: number) => -Math.log(1 - q) / lambda,
  mean: (lambda: number) => 1 / lambda,
  variance: (lambda: number) => 1 / (lambda * lambda),
};

// ———————— الطبيعي N(μ, σ²): σ انحراف معياري ————————

/**
 * erfc بتقريب تشيبيشيف (Numerical Recipes, erfcc) — خطأ نسبي أقل من 1.2e-7،
 * وهو كافٍ لعرض أربع منازل عشرية.
 */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))
    );
  return x >= 0 ? r : 2 - r;
}

export const normal = {
  pdf: (x: number, mu: number, sigma: number) => {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  },
  /** Φ((x−μ)/σ) */
  cdf: (x: number, mu: number, sigma: number) => 0.5 * erfc(-(x - mu) / (sigma * Math.SQRT2)),
  interval: (a: number, b: number, mu: number, sigma: number) =>
    Math.max(0, normal.cdf(b, mu, sigma) - normal.cdf(a, mu, sigma)),
  mean: (mu: number) => mu,
  variance: (sigma: number) => sigma * sigma,
};

// ———————— محاكاة (تقبل مولّدًا عشوائيًا قابلًا للتمرير لأجل الاختبار) ————————

/** مولّد عشوائي ذو بذرة (mulberry32) — للاختبارات ولإمكانية إعادة النتائج. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const sample = {
  bernoulli: (p: number, rng: Rng = Math.random): number => (rng() < p ? 1 : 0),
  binomialTrials: (n: number, p: number, rng: Rng = Math.random) =>
    Array.from({ length: n }, () => sample.bernoulli(p, rng)),
  binomial: (n: number, p: number, rng: Rng = Math.random) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += sample.bernoulli(p, rng);
    return s;
  },
  /** يعيد تسلسل المحاولات حتى أول نجاح (آخر عنصر = 1). حد أعلى للأمان. */
  geometricTrials: (p: number, rng: Rng = Math.random, cap = 500) => {
    const out: number[] = [];
    while (out.length < cap) {
      const r = sample.bernoulli(p, rng);
      out.push(r);
      if (r === 1) break;
    }
    return out;
  },
  exponential: (lambda: number, rng: Rng = Math.random) => -Math.log(1 - rng()) / lambda,
  /** أزمنة الأحداث في عملية بواسون متجانسة بمعدل rate على الفترة [0, t]. */
  poissonProcess: (rate: number, t: number, rng: Rng = Math.random) => {
    const times: number[] = [];
    let s = sample.exponential(rate, rng);
    while (s <= t && times.length < 10000) {
      times.push(s);
      s += sample.exponential(rate, rng);
    }
    return times;
  },
};

/** متوسط وتباين عيّنة (تباين بقسمة على n−1). */
export function sampleStats(xs: number[]) {
  const n = xs.length;
  if (n === 0) return { mean: 0, variance: 0 };
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const variance = n > 1 ? xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
  return { mean, variance };
}

/** أصغر k يحقق P(X ≤ k) ≥ q — لتحديد نطاق العرض في الرسوم المتقطعة. */
export function discreteUpper(cdf: (k: number) => number, q: number, start: number, cap: number) {
  let k = start;
  while (k < cap && cdf(k) < q) k++;
  return k;
}

/** تنسيق رقم بعدد منازل محدد وإزالة الأصفار الزائدة. */
export function fmt(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return '—';
  const s = x.toFixed(digits);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}
