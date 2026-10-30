// الحسابات الرياضية لتوزيعات الموقع وورقة القوانين. لا يعتمد هذا الملف على الواجهة.

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

// ———————— دالتا غاما وبيتا (لتوزيعات ورقة القوانين المستمرة) ————————

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

/** ln Γ(x) بتقريب لانكزوس (g = 7) — دقة نسبية نحو 1e-15 للقيم الموجبة. */
export function lgamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  const y = x - 1;
  let a = LANCZOS[0];
  const t = y + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (y + i);
  return 0.5 * Math.log(2 * Math.PI) + (y + 0.5) * Math.log(t) - t + Math.log(a);
}

export const gammaFn = (x: number) => Math.exp(lgamma(x));
export const betaFn = (a: number, b: number) => Math.exp(lgamma(a) + lgamma(b) - lgamma(a + b));

// القيم غير الموجودة (مثل متوسط t عند v ≤ 1) تُعاد NaN.

// ———————— ذو الحدين السالب: X = عدد المحاولات حتى النجاح رقم r (كما في ورقة المقرر) ————————
export const negbin = {
  pmf: (x: number, r: number, p: number) =>
    Number.isInteger(x) && x >= r ? choose(x - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, x - r) : 0,
  mean: (r: number, p: number) => r / p,
  variance: (r: number, p: number) => (r * (1 - p)) / (p * p),
};

// ———————— فوق الهندسي: N مجتمع فيه k «نجاحات»، نسحب n دون إرجاع ————————
export const hypergeometric = {
  /** مجال X الدقيق: max(0, n − (N − k)) ≤ x ≤ min(n, k). */
  support: (N: number, k: number, n: number): [number, number] => [Math.max(0, n - (N - k)), Math.min(n, k)],
  pmf: (x: number, N: number, k: number, n: number) => {
    const [lo, hi] = hypergeometric.support(N, k, n);
    if (!Number.isInteger(x) || x < lo || x > hi) return 0;
    return (choose(k, x) * choose(N - k, n - x)) / choose(N, n);
  },
  mean: (N: number, k: number, n: number) => (n * k) / N,
  variance: (N: number, k: number, n: number) => n * (k / N) * (1 - k / N) * ((N - n) / (N - 1)),
};

// ———————— المنتظم على (a, b) ————————
export const uniform = {
  pdf: (x: number, a: number, b: number) => (x >= a && x <= b ? 1 / (b - a) : 0),
  cdf: (x: number, a: number, b: number) => (x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a)),
  mean: (a: number, b: number) => (a + b) / 2,
  variance: (a: number, b: number) => (b - a) ** 2 / 12,
};

// ———————— غاما: α شكل، β معدل (كما في ورقة المقرر) ————————
export const gammaDist = {
  pdf: (x: number, alpha: number, beta: number) =>
    x <= 0 ? 0 : Math.exp(alpha * Math.log(beta) - lgamma(alpha) + (alpha - 1) * Math.log(x) - beta * x),
  mean: (alpha: number, beta: number) => alpha / beta,
  variance: (alpha: number, beta: number) => alpha / (beta * beta),
};

// ———————— مربع كاي بدرجات حرية v ————————
export const chiSquare = {
  pdf: (x: number, v: number) =>
    x <= 0 ? 0 : Math.exp(-(v / 2) * Math.LN2 - lgamma(v / 2) + (v / 2 - 1) * Math.log(x) - x / 2),
  mean: (v: number) => v,
  variance: (v: number) => 2 * v,
};

// ———————— ويبل بصيغة الورقة: f(x) = αβ x^{β−1} e^{−α x^β} ————————
export const weibull = {
  pdf: (x: number, alpha: number, beta: number) =>
    x <= 0 ? 0 : alpha * beta * Math.pow(x, beta - 1) * Math.exp(-alpha * Math.pow(x, beta)),
  cdf: (x: number, alpha: number, beta: number) => (x <= 0 ? 0 : 1 - Math.exp(-alpha * Math.pow(x, beta))),
  mean: (alpha: number, beta: number) => Math.pow(alpha, -1 / beta) * gammaFn(1 + 1 / beta),
  variance: (alpha: number, beta: number) =>
    Math.pow(alpha, -2 / beta) * (gammaFn(1 + 2 / beta) - gammaFn(1 + 1 / beta) ** 2),
};

// ———————— t بدرجات حرية v ————————
export const studentT = {
  pdf: (x: number, v: number) =>
    Math.exp(lgamma((v + 1) / 2) - lgamma(v / 2) - 0.5 * Math.log(v * Math.PI) - ((v + 1) / 2) * Math.log1p((x * x) / v)),
  mean: (v: number) => (v > 1 ? 0 : NaN),
  variance: (v: number) => (v > 2 ? v / (v - 2) : NaN),
};

// ———————— بيتا على (0, 1) ————————
export const betaDist = {
  pdf: (x: number, a: number, b: number) =>
    x <= 0 || x >= 1 ? 0 : Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log1p(-x) - lgamma(a) - lgamma(b) + lgamma(a + b)),
  mean: (a: number, b: number) => a / (a + b),
  variance: (a: number, b: number) => (a * b) / ((a + b + 1) * (a + b) ** 2),
  /** العزم E(X^r) = B(a + r, b) / B(a, b) — وهو ما يظهر في عمود M_X(t) في الورقة. */
  moment: (r: number, a: number, b: number) => betaFn(a + r, b) / betaFn(a, b),
};

// ———————— F بدرجتي حرية r (البسط) وv (المقام) ————————
export const fisherF = {
  pdf: (x: number, r: number, v: number) =>
    x <= 0
      ? 0
      : Math.exp(
          (r / 2) * Math.log(r / v) + (r / 2 - 1) * Math.log(x) - ((r + v) / 2) * Math.log1p((r / v) * x) - Math.log(betaFn(r / 2, v / 2)),
        ),
  mean: (_r: number, v: number) => (v > 2 ? v / (v - 2) : NaN),
  variance: (r: number, v: number) => (v > 4 ? (2 * v * v * (r + v - 2)) / (r * (v - 2) ** 2 * (v - 4)) : NaN),
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
  /** n عناصر مختلفة من 0..N−1 دون إرجاع (خلط فيشر–ييتس جزئي). */
  drawWithout: (N: number, n: number, rng: Rng = Math.random) => {
    const a = Array.from({ length: N }, (_, i) => i);
    for (let i = 0; i < n; i++) {
      const j = i + Math.floor(rng() * (N - i));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  },
  /** فوق الهندسي: العناصر 0..k−1 هي «النجاحات». */
  hypergeometric: (N: number, k: number, n: number, rng: Rng = Math.random) => sample.drawWithout(N, n, rng).filter((i) => i < k).length,
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
