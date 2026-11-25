import {
  bernoulli,
  betaDist,
  binomial,
  chiSquare,
  exponential,
  fisherF,
  gammaDist,
  geometric,
  hypergeometric,
  negbin,
  normal,
  poisson,
  studentT,
  uniform,
  weibull,
} from '../lib/dist';
import type { DistId } from './types';

// ورقة القوانين: كل صفوف جدول المقرر (5 متقطعة و10 مستمرة) + برنولي من الموقع.
// النصوص برموز الورقة نفسها، مكتملة ومصححة: الشروط والمجالات داخل الخانات، والتنبيه داخل بطاقة التوزيع الذي يخصه.
// الدوال العددية هنا للاختبارات: تتحقق أن المتوسط والتباين والدالة المولدة والتراكمي تطابق القانون.

const r = String.raw;

export type SheetId =
  | DistId
  | 'negbin'
  | 'hypergeometric'
  | 'uniform'
  | 'stdnormal'
  | 'gamma'
  | 'chisquare'
  | 'weibull'
  | 't'
  | 'beta'
  | 'f';

type P = Record<string, number>;

/** حقول البطاقة التي يمكن عرضها وحدها في ليلة الاختبار. */
export type SheetField = 'law' | 'moments' | 'mgf';

export type Mgf =
  | { kind: 'closed'; tex: string; /** نص برياضيات بين $...$. */ domain: string; fn: (t: number, p: P) => number }
  /** موجودة لكن بلا صيغة بسيطة. */
  | { kind: 'no-closed-form'; note: string }
  /** غير موجودة (لا تتقارب لأي t > 0). */
  | { kind: 'none'; note: string };

export type Cdf = { kind: 'closed'; tex: string; fn: (x: number, p: P) => number } | { kind: 'table' | 'no-closed-form'; note: string };

export interface SheetRow {
  id: SheetId;
  nameAr: string;
  nameEn: string;
  group: 'discrete' | 'continuous';
  /** صف غير موجود في ورقة المقرر (برنولي). */
  extra?: boolean;
  /** متى نستعمله؟ سطر واحد. */
  when: string;
  /** تنبيه داخل البطاقة نفسها، يظهر مع الحقل الذي يخصه. */
  warn?: { text: string; on: SheetField };
  /** النسخة الإنجليزية: mgf هو المجال أو الملاحظة، وcdf ملاحظة التراكمي غير المغلق. */
  en: { when: string; params: string; mgf: string; cdf?: string; warn?: string };
  /** نص عربي برياضيات بين $...$. */
  params: string;
  f: string;
  support: string;
  mean: string;
  variance: string;
  mgf: Mgf;
  cdf?: Cdf;
  /** معلمات مثال للاختبارات العددية. */
  ex: P;
  pdf: (x: number, p: P) => number;
  E: (p: P) => number;
  V: (p: P) => number;
}

export const sheet: SheetRow[] = [
  // ————————————————————— المتقطعة —————————————————————
  {
    id: 'bernoulli',
    nameAr: 'برنولي',
    nameEn: 'Bernoulli',
    group: 'discrete',
    when: 'محاولة واحدة بنتيجتين: نجاح أو فشل.',
    en: { when: 'A single trial with two outcomes: success or failure.', params: '$0 < p < 1$, and $q = 1 - p$', mgf: 'for all $t$' },
    extra: true,
    params: '$0 < p < 1$، و$q = 1 - p$',
    f: r`p^{x} q^{1-x}`,
    support: r`x = 0, 1`,
    mean: r`E(X) = p`,
    variance: r`\mathrm{Var}(X) = pq`,
    mgf: { kind: 'closed', tex: r`q + pe^{t}`, domain: 'لكل $t$', fn: (t, { p }) => 1 - p + p * Math.exp(t) },
    ex: { p: 0.3 },
    pdf: (x, { p }) => bernoulli.pmf(x, p),
    E: ({ p }) => bernoulli.mean(p),
    V: ({ p }) => bernoulli.variance(p),
  },
  {
    id: 'binomial',
    nameAr: 'ذو الحدين',
    nameEn: 'Binomial',
    group: 'discrete',
    when: 'عدد ثابت $n$ من المحاولات المستقلة، ونعدّ النجاحات.',
    en: { when: 'A fixed number $n$ of independent trials; we count the successes.', params: '$n$ trials, $0 < p < 1$, $q = 1 - p$', mgf: 'for all $t$' },
    params: '$n$ عدد المحاولات، $0 < p < 1$، $q = 1 - p$',
    f: r`\binom{n}{x} p^{x} q^{n-x}`,
    support: r`x = 0, 1, 2, \dots, n`,
    mean: r`E(X) = np`,
    variance: r`\mathrm{Var}(X) = npq`,
    mgf: { kind: 'closed', tex: r`(q + pe^{t})^{n}`, domain: 'لكل $t$', fn: (t, { n, p }) => Math.pow(1 - p + p * Math.exp(t), n) },
    ex: { n: 8, p: 0.3 },
    pdf: (x, { n, p }) => binomial.pmf(x, n, p),
    E: ({ n, p }) => binomial.mean(n, p),
    V: ({ n, p }) => binomial.variance(n, p),
  },
  {
    id: 'negbin',
    nameAr: 'ذو الحدين السالب',
    nameEn: 'Negative binomial',
    group: 'discrete',
    when: 'نكرر محاولات مستقلة حتى النجاح رقم $r$، ونعدّ المحاولات.',
    en: { when: 'Repeat independent trials until the $r$-th success; we count the trials.', params: '$r$ = the number of successes needed, $0 < p < 1$', mgf: '$t < -\\ln q$', warn: 'Some books and software count the **failures** before the $r$-th success instead of the trials, which makes the mean $\\frac{rq}{p}$. Check what the problem counts.' },
    warn: { text: 'بعض الكتب والبرامج تعدّ **الإخفاقات** قبل النجاح رقم $r$ بدل المحاولات، فيصير المتوسط $\\frac{rq}{p}$. فتأكّد مما تعدّه المسألة.', on: 'law' },
    params: '$r$ رقم النجاح المطلوب، $0 < p < 1$',
    f: r`\binom{x-1}{r-1} p^{r} q^{x-r}`,
    support: r`x = r, r+1, r+2, \dots`,
    mean: r`E(X) = \dfrac{r}{p}`,
    variance: r`\mathrm{Var}(X) = \dfrac{rq}{p^{2}}`,
    mgf: {
      kind: 'closed',
      tex: r`\left(\dfrac{pe^{t}}{1 - qe^{t}}\right)^{r}`,
      domain: '$t < -\\ln q$',
      fn: (t, { r: k, p }) => Math.pow((p * Math.exp(t)) / (1 - (1 - p) * Math.exp(t)), k),
    },
    ex: { r: 3, p: 0.4 },
    pdf: (x, { r: k, p }) => negbin.pmf(x, k, p),
    E: ({ r: k, p }) => negbin.mean(k, p),
    V: ({ r: k, p }) => negbin.variance(k, p),
  },
  {
    id: 'geometric',
    nameAr: 'الهندسي',
    nameEn: 'Geometric',
    group: 'discrete',
    when: 'نكرر محاولات مستقلة حتى أول نجاح، ونعدّ المحاولات.',
    en: { when: 'Repeat independent trials until the first success; we count the trials.', params: '$0 < p < 1$, and $q = 1 - p$', mgf: '$t < -\\ln q$', warn: 'Some books count the **failures** before the first success ($x = 0, 1, \\dots$), which makes the mean $\\frac{q}{p}$.' },
    warn: { text: 'بعض الكتب تعدّ **الإخفاقات** قبل أول نجاح ($x = 0, 1, \\dots$)، فيصير المتوسط $\\frac{q}{p}$.', on: 'law' },
    params: '$0 < p < 1$، و$q = 1 - p$',
    f: r`p\, q^{x-1}`,
    support: r`x = 1, 2, \dots`,
    mean: r`E(X) = \dfrac{1}{p}`,
    variance: r`\mathrm{Var}(X) = \dfrac{q}{p^{2}}`,
    mgf: {
      kind: 'closed',
      tex: r`\dfrac{pe^{t}}{1 - qe^{t}}`,
      domain: '$t < -\\ln q$',
      fn: (t, { p }) => (p * Math.exp(t)) / (1 - (1 - p) * Math.exp(t)),
    },
    ex: { p: 0.35 },
    pdf: (x, { p }) => geometric.pmf(x, p),
    E: ({ p }) => geometric.mean(p),
    V: ({ p }) => geometric.variance(p),
  },
  {
    id: 'poisson',
    nameAr: 'بواسون',
    nameEn: 'Poisson',
    group: 'discrete',
    when: 'نعدّ أحداثًا في فترة زمن أو مساحة، بمعدل ثابت.',
    en: { when: 'Count events in an interval of time or space, at a constant rate.', params: '$\\lambda > 0$, the mean count in the interval', mgf: 'for all $t$' },
    params: '$\\lambda > 0$ متوسط العدد في الفترة',
    f: r`\dfrac{e^{-\lambda}\lambda^{x}}{x!}`,
    support: r`x = 0, 1, 2, \dots`,
    mean: r`E(X) = \lambda`,
    variance: r`\mathrm{Var}(X) = \lambda`,
    mgf: { kind: 'closed', tex: r`e^{\lambda(e^{t} - 1)}`, domain: 'لكل $t$', fn: (t, { l }) => Math.exp(l * (Math.exp(t) - 1)) },
    ex: { l: 2.4 },
    pdf: (x, { l }) => poisson.pmf(x, l),
    E: ({ l }) => poisson.mean(l),
    V: ({ l }) => poisson.variance(l),
  },
  {
    id: 'hypergeometric',
    nameAr: 'فوق الهندسي',
    nameEn: 'Hypergeometric',
    group: 'discrete',
    when: 'نسحب دون إرجاع من مجتمع محدود، ونعدّ النجاحات.',
    en: { when: 'Draw without replacement from a finite population; we count the successes.', params: 'A population of size $N$ with $k$ “successes”; we draw $n$ without replacement', mgf: 'Exists for all $t$ (the support is finite).', warn: 'The smallest value is not always $0$: if you draw more than the $N - k$ “failures”, some successes are certain.' },
    warn: { text: 'أصغر قيمة ليست $0$ دائمًا: لو سحبت أكثر من عدد «الإخفاقات» $N - k$ فلا بد من بعض النجاحات.', on: 'law' },
    params: 'مجتمع حجمه $N$ فيه $k$ «نجاحًا»، نسحب منه $n$ دون إرجاع',
    f: r`\dfrac{\binom{k}{x}\binom{N-k}{n-x}}{\binom{N}{n}}`,
    support: r`\max(0,\, n-N+k) \le x \le \min(n, k)`,
    mean: r`E(X) = n\left(\dfrac{k}{N}\right)`,
    variance: r`\mathrm{Var}(X) = n\left(\dfrac{k}{N}\right)\!\left(1-\dfrac{k}{N}\right)\!\left(\dfrac{N-n}{N-1}\right)`,
    mgf: { kind: 'no-closed-form', note: 'موجودة لكل $t$ (المجال محدود).' },
    ex: { N: 20, k: 7, n: 15 },
    pdf: (x, { N, k, n }) => hypergeometric.pmf(x, N, k, n),
    E: ({ N, k, n }) => hypergeometric.mean(N, k, n),
    V: ({ N, k, n }) => hypergeometric.variance(N, k, n),
  },

  // ————————————————————— المستمرة —————————————————————
  {
    id: 'uniform',
    nameAr: 'المنتظم',
    nameEn: 'Uniform',
    group: 'continuous',
    when: 'قياس في فترة $(a, b)$، وأجزاؤها المتساوية الطول متساوية الاحتمال.',
    en: { when: 'A measurement on an interval $(a, b)$, where pieces of equal length are equally likely.', params: '$a < b$, the ends of the interval', mgf: '$t \\ne 0$, and $M_X(0) = 1$' },
    params: '$a < b$ طرفا المجال',
    f: r`\dfrac{1}{b-a}`,
    support: r`a < x < b`,
    mean: r`E(X) = \dfrac{a+b}{2}`,
    variance: r`\mathrm{Var}(X) = \dfrac{(b-a)^{2}}{12}`,
    mgf: {
      kind: 'closed',
      tex: r`\dfrac{e^{tb} - e^{ta}}{t(b-a)}`,
      domain: '$t \\ne 0$، و$M_X(0) = 1$',
      fn: (t, { a, b }) => (Math.abs(t) < 1e-12 ? 1 : (Math.exp(t * b) - Math.exp(t * a)) / (t * (b - a))),
    },
    cdf: { kind: 'closed', tex: r`\dfrac{x-a}{b-a},\; a \le x \le b`, fn: (x, { a, b }) => uniform.cdf(x, a, b) },
    ex: { a: 2, b: 5 },
    pdf: (x, { a, b }) => uniform.pdf(x, a, b),
    E: ({ a, b }) => uniform.mean(a, b),
    V: ({ a, b }) => uniform.variance(a, b),
  },
  {
    id: 'normal',
    nameAr: 'الطبيعي',
    nameEn: 'Normal',
    group: 'continuous',
    when: 'قياس جرسي متماثل حول متوسطه.',
    en: { when: 'A bell-shaped measurement, symmetric about its mean.', params: '$\\mu$ any number, $\\sigma > 0$', mgf: 'for all $t$' },
    params: '$\\mu$ أي عدد، $\\sigma > 0$',
    f: r`\dfrac{1}{\sigma\sqrt{2\pi}}\, e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^{2}}`,
    support: r`-\infty < x < \infty`,
    mean: r`E(X) = \mu`,
    variance: r`\mathrm{Var}(X) = \sigma^{2}`,
    mgf: { kind: 'closed', tex: r`e^{\mu t + \frac{\sigma^{2}t^{2}}{2}}`, domain: 'لكل $t$', fn: (t, { mu, s }) => Math.exp(mu * t + (s * s * t * t) / 2) },
    cdf: { kind: 'closed', tex: r`\Phi\!\left(\dfrac{x-\mu}{\sigma}\right)`, fn: (x, { mu, s }) => normal.cdf(x, mu, s) },
    ex: { mu: 2, s: 1.5 },
    pdf: (x, { mu, s }) => normal.pdf(x, mu, s),
    E: ({ mu }) => mu,
    V: ({ s }) => s * s,
  },
  {
    id: 'stdnormal',
    nameAr: 'الطبيعي المعياري',
    nameEn: 'Standard normal',
    group: 'continuous',
    when: 'الطبيعي بعد التحويل $Z = \\frac{X-\\mu}{\\sigma}$، ومنه نقرأ جدول $\\Phi$.',
    en: { when: 'The normal after the transformation $Z = \\frac{X-\\mu}{\\sigma}$; the $\\Phi$ table is read from it.', params: '$Z = \\frac{X-\\mu}{\\sigma}$, no parameters', mgf: 'for all $t$' },
    params: '$Z = \\frac{X-\\mu}{\\sigma}$ بلا معلمات',
    f: r`\varphi(z) = \dfrac{1}{\sqrt{2\pi}}\, e^{-\frac{z^{2}}{2}}`,
    support: r`-\infty < z < \infty`,
    mean: r`E(Z) = 0`,
    variance: r`\mathrm{Var}(Z) = 1`,
    mgf: { kind: 'closed', tex: r`e^{\frac{t^{2}}{2}}`, domain: 'لكل $t$', fn: (t) => Math.exp((t * t) / 2) },
    cdf: { kind: 'closed', tex: r`\Phi(z)`, fn: (x) => normal.cdf(x, 0, 1) },
    ex: {},
    pdf: (x) => normal.pdf(x, 0, 1),
    E: () => 0,
    V: () => 1,
  },
  {
    id: 'exponential',
    nameAr: 'الأسي',
    nameEn: 'Exponential',
    group: 'continuous',
    when: 'زمن الانتظار حتى الحدث التالي، بمعدل ثابت.',
    en: { when: 'The waiting time until the next event, at a constant rate.', params: '$\\theta > 0$, a rate', mgf: '$t < \\theta$', warn: 'Here $\\theta$ is a **rate** and the mean is $\\frac{1}{\\theta}$. Some books write the exponential with its mean instead: $\\frac{1}{\\theta}e^{-x/\\theta}$. Check which form the problem uses.' },
    warn: { text: '$\\theta$ هنا **معدل** والمتوسط $\\frac{1}{\\theta}$. بعض الكتب تكتب الأسي بمتوسطه: $\\frac{1}{\\theta}e^{-x/\\theta}$، فانتبه أي الصيغتين في المسألة.', on: 'law' },
    params: '$\\theta > 0$ معدل',
    f: r`\theta e^{-\theta x}`,
    support: r`x \ge 0`,
    mean: r`E(X) = \dfrac{1}{\theta}`,
    variance: r`\mathrm{Var}(X) = \dfrac{1}{\theta^{2}}`,
    mgf: {
      kind: 'closed',
      tex: r`\dfrac{\theta}{\theta - t} = \left(1 - \dfrac{t}{\theta}\right)^{-1}`,
      domain: '$t < \\theta$',
      fn: (t, { th }) => th / (th - t),
    },
    cdf: { kind: 'closed', tex: r`1 - e^{-\theta x}`, fn: (x, { th }) => exponential.cdf(x, th) },
    ex: { th: 1.5 },
    pdf: (x, { th }) => exponential.pdf(x, th),
    E: ({ th }) => exponential.mean(th),
    V: ({ th }) => exponential.variance(th),
  },
  {
    id: 'gamma',
    nameAr: 'غاما',
    nameEn: 'Gamma',
    group: 'continuous',
    when: 'زمن الانتظار حتى الحدث رقم $\\alpha$، بمعدل ثابت.',
    en: { when: 'The waiting time until the $\\alpha$-th event, at a constant rate.', params: '$\\alpha > 0$ shape, $\\beta > 0$ rate', mgf: '$t < \\beta$', cdf: 'No closed form in general. When $\\alpha$ is a whole number: $1 - \\sum_{k=0}^{\\alpha-1} e^{-\\beta x}\\frac{(\\beta x)^{k}}{k!}$, the probability of at least $\\alpha$ events in a Poisson count with mean $\\beta x$.', warn: 'Here $\\beta$ is a **rate** and the mean is $\\alpha/\\beta$. Many books use $\\beta$ as a scale, which makes the mean $\\alpha\\beta$. The exponential is the special case $\\text{Gamma}(1, \\theta)$.' },
    warn: { text: '$\\beta$ هنا **معدل** والمتوسط $\\frac{\\alpha}{\\beta}$. كتب كثيرة تجعل $\\beta$ مقياسًا فيصير المتوسط $\\alpha\\beta$. والأسي حالة خاصة: $\\text{Gamma}(1, \\theta)$.', on: 'law' },
    params: '$\\alpha > 0$ شكل، $\\beta > 0$ معدل',
    f: r`\dfrac{\beta^{\alpha}}{\Gamma(\alpha)}\, x^{\alpha-1} e^{-\beta x}`,
    support: r`x > 0`,
    mean: r`E(X) = \dfrac{\alpha}{\beta}`,
    variance: r`\mathrm{Var}(X) = \dfrac{\alpha}{\beta^{2}}`,
    mgf: {
      kind: 'closed',
      tex: r`\left(\dfrac{\beta}{\beta - t}\right)^{\alpha} = \left(1 - \dfrac{t}{\beta}\right)^{-\alpha}`,
      domain: '$t < \\beta$',
      fn: (t, { al, be }) => Math.pow(be / (be - t), al),
    },
    cdf: { kind: 'no-closed-form', note: 'بلا صيغة مغلقة عمومًا؛ وحين يكون $\\alpha$ عددًا صحيحًا: $1 - \\sum_{k=0}^{\\alpha-1} e^{-\\beta x}\\frac{(\\beta x)^{k}}{k!}$، أي احتمال $\\alpha$ حدثًا على الأقل في بواسون بمتوسط $\\beta x$.' },
    ex: { al: 2.5, be: 1.5 },
    pdf: (x, { al, be }) => gammaDist.pdf(x, al, be),
    E: ({ al, be }) => gammaDist.mean(al, be),
    V: ({ al, be }) => gammaDist.variance(al, be),
  },
  {
    id: 'chisquare',
    nameAr: 'مربع كاي',
    nameEn: 'Chi-square',
    group: 'continuous',
    when: 'مجموع مربعات $v$ متغيرات طبيعية معيارية مستقلة، ومنه اختبارات التباين ($\\frac{(n-1)S^{2}}{\\sigma^{2}}$) والمطابقة.',
    en: { when: 'The sum of the squares of $v$ independent standard normals; behind tests of variance ($\\frac{(n-1)S^{2}}{\\sigma^{2}}$) and goodness of fit.', params: '$v$ a positive whole number: the degrees of freedom', mgf: '$t < \\frac{1}{2}$', cdf: 'From the chi-square table.' },
    params: '$v$ عدد صحيح موجب: درجات الحرية',
    f: r`\dfrac{1}{2^{v/2}\,\Gamma(v/2)}\, x^{\frac{v}{2}-1} e^{-\frac{x}{2}}`,
    support: r`x > 0`,
    mean: r`E(X) = v`,
    variance: r`\mathrm{Var}(X) = 2v`,
    mgf: {
      kind: 'closed',
      tex: r`\left(\dfrac{1/2}{1/2 - t}\right)^{v/2} = (1 - 2t)^{-v/2}`,
      domain: '$t < \\frac{1}{2}$',
      fn: (t, { v }) => Math.pow(1 - 2 * t, -v / 2),
    },
    cdf: { kind: 'table', note: 'من جدول مربع كاي.' },
    ex: { v: 5 },
    pdf: (x, { v }) => chiSquare.pdf(x, v),
    E: ({ v }) => chiSquare.mean(v),
    V: ({ v }) => chiSquare.variance(v),
  },
  {
    id: 'weibull',
    nameAr: 'ويبل',
    nameEn: 'Weibull',
    group: 'continuous',
    when: 'أعمار القطع والأجهزة حين يتغير معدل العطل مع الزمن.',
    en: { when: 'Lifetimes of parts and devices when the failure rate changes over time.', params: '$\\alpha > 0$ sets the scale $\\alpha^{-1/\\beta}$, and $\\beta > 0$ is the shape', mgf: 'Exists for all $t$ when $\\beta > 1$, for $t < \\alpha$ when $\\beta = 1$ (the exponential), and for no $t > 0$ when $\\beta < 1$.', warn: 'Here $\\beta$ is the **shape**, unlike the gamma, where $\\beta$ is a rate.' },
    warn: { text: '$\\beta$ هنا **شكل**، عكس غاما حيث $\\beta$ معدل.', on: 'law' },
    params: '$\\alpha > 0$ يحدد المقياس $\\alpha^{-1/\\beta}$، و$\\beta > 0$ شكل',
    f: r`\alpha\beta\, x^{\beta-1} e^{-\alpha x^{\beta}}`,
    support: r`x > 0`,
    mean: r`E(X) = \alpha^{-1/\beta}\,\Gamma\!\left(1 + \tfrac{1}{\beta}\right)`,
    variance: r`\mathrm{Var}(X) = \alpha^{-2/\beta}\left[\Gamma\!\left(1 + \tfrac{2}{\beta}\right) - \Gamma^{2}\!\left(1 + \tfrac{1}{\beta}\right)\right]`,
    mgf: { kind: 'no-closed-form', note: 'موجودة لكل $t$ حين $\\beta > 1$، ولـ $t < \\alpha$ حين $\\beta = 1$ (الأسي)، وغير موجودة لأي $t > 0$ إذا $\\beta < 1$.' },
    cdf: { kind: 'closed', tex: r`1 - e^{-\alpha x^{\beta}}`, fn: (x, { al, be }) => weibull.cdf(x, al, be) },
    ex: { al: 0.5, be: 1.8 },
    pdf: (x, { al, be }) => weibull.pdf(x, al, be),
    E: ({ al, be }) => weibull.mean(al, be),
    V: ({ al, be }) => weibull.variance(al, be),
  },
  {
    id: 't',
    nameAr: 't (ستيودنت)',
    nameEn: 'Student t',
    group: 'continuous',
    when: 'المتوسط المعياري لعينة من مجتمع طبيعي، $\\frac{\\bar{X}-\\mu}{S/\\sqrt{n}}$، حين $\\sigma$ مجهول.',
    en: { when: 'The standardized sample mean $\\frac{\\bar{X}-\\mu}{S/\\sqrt{n}}$ from a normal population when $\\sigma$ is unknown.', params: '$v$ a positive whole number: the degrees of freedom', mgf: '$E(e^{tX}) = \\infty$ for every $t \\ne 0$: the tails are heavier than any exponential.', cdf: 'From the t table.', warn: 'At $v = 1$, t is the Cauchy distribution, which has no mean.' },
    warn: { text: 'عند $v = 1$ يصير t توزيع كوشي، وليس له متوسط.', on: 'moments' },
    params: '$v$ عدد صحيح موجب: درجات الحرية',
    f: r`\dfrac{\Gamma\!\left(\frac{v+1}{2}\right)}{\sqrt{v\pi}\,\Gamma\!\left(\frac{v}{2}\right)}\left(1 + \dfrac{x^{2}}{v}\right)^{-\frac{v+1}{2}}`,
    support: r`-\infty < x < \infty`,
    mean: r`E(X) = 0 \quad (v > 1)`,
    variance: r`\mathrm{Var}(X) = \dfrac{v}{v-2} \quad (v > 2)`,
    mgf: { kind: 'none', note: '$E(e^{tX}) = \\infty$ لكل $t \\ne 0$: الذيلان أثقل من أي دالة أسية.' },
    cdf: { kind: 'table', note: 'من جدول t.' },
    ex: { v: 8 },
    pdf: (x, { v }) => studentT.pdf(x, v),
    E: ({ v }) => studentT.mean(v),
    V: ({ v }) => studentT.variance(v),
  },
  {
    id: 'beta',
    nameAr: 'بيتا',
    nameEn: 'Beta',
    group: 'continuous',
    when: 'نسبة أو احتمال مجهول بين $0$ و$1$.',
    en: { when: 'An unknown proportion or probability between $0$ and $1$.', params: '$a > 0$, $b > 0$, two shape parameters', mgf: 'Exists for all $t$. The moments directly: $E(X^{r}) = \\frac{B(a+r,\\,b)}{B(a,b)}$.', cdf: 'No closed form in general.' },
    params: '$a > 0$، $b > 0$ معلمتا شكل',
    f: r`\dfrac{1}{B(a,b)}\, x^{a-1}(1-x)^{b-1}`,
    support: r`0 < x < 1`,
    mean: r`E(X) = \dfrac{a}{a+b}`,
    variance: r`\mathrm{Var}(X) = \dfrac{ab}{(a+b+1)(a+b)^{2}}`,
    mgf: { kind: 'no-closed-form', note: 'موجودة لكل $t$. والعزوم مباشرة: $E(X^{r}) = \\frac{B(a+r,\\,b)}{B(a,b)}$.' },
    cdf: { kind: 'no-closed-form', note: 'بلا صيغة مغلقة عمومًا.' },
    ex: { a: 2.5, b: 4 },
    pdf: (x, { a, b }) => betaDist.pdf(x, a, b),
    E: ({ a, b }) => betaDist.mean(a, b),
    V: ({ a, b }) => betaDist.variance(a, b),
  },
  {
    id: 'f',
    nameAr: 'F (فيشر–سنيدكور)',
    nameEn: 'F',
    group: 'continuous',
    when: 'نسبة تبايني عينتين مستقلتين من مجتمعين طبيعيين، كلٌّ مقسوم على تباين مجتمعه.',
    en: { when: 'The ratio of two sample variances, each divided by its population variance, from independent normal samples.', params: '$r$ numerator degrees of freedom, $v$ denominator degrees of freedom (both positive whole numbers)', mgf: '$E(e^{tX}) = \\infty$ for every $t > 0$.', cdf: 'From the F table.' },
    params: '$r$ درجات حرية البسط، $v$ درجات حرية المقام (عددان صحيحان موجبان)',
    f: r`\dfrac{(r/v)^{r/2}}{B\!\left(\frac{r}{2},\frac{v}{2}\right)}\, x^{\frac{r}{2}-1}\left(1 + \dfrac{r}{v}x\right)^{-\frac{r+v}{2}}`,
    support: r`x > 0`,
    mean: r`E(X) = \dfrac{v}{v-2} \quad (v > 2)`,
    variance: r`\mathrm{Var}(X) = \dfrac{2v^{2}(r+v-2)}{r(v-2)^{2}(v-4)} \quad (v > 4)`,
    mgf: { kind: 'none', note: '$E(e^{tX}) = \\infty$ لكل $t > 0$.' },
    cdf: { kind: 'table', note: 'من جدول F.' },
    ex: { r: 6, v: 12 },
    pdf: (x, { r: a, v }) => fisherF.pdf(x, a, v),
    E: ({ r: a, v }) => fisherF.mean(a, v),
    V: ({ r: a, v }) => fisherF.variance(a, v),
  },
];

export const sheetById = Object.fromEntries(sheet.map((s) => [s.id, s])) as Record<SheetId, SheetRow>;

/** قاموس الرموز: الرمز نفسه قد يعني أشياء مختلفة في توزيعات مختلفة. */
export const symbols: { sym: string; meaning: string; meaningEn: string }[] = [
  { sym: r`q`, meaning: 'دائمًا $1 - p$.', meaningEn: 'Always $1 - p$.' },
  { sym: r`\lambda`, meaning: 'بواسون: متوسط عدد الأحداث في الفترة.', meaningEn: 'Poisson: the mean number of events in the interval.' },
  { sym: r`\theta`, meaning: 'الأسي: المعدل (أحداث لكل وحدة زمن)، والمتوسط $\\frac{1}{\\theta}$. وهو معدل عملية بواسون ($r$ في فصل بواسون)، فمتوسط العدد في فترة طولها $t$ هو $\\lambda = \\theta t$.', meaningEn: 'Exponential: the rate (events per unit time), with mean $\\frac{1}{\\theta}$. It is the rate of the Poisson process ($r$ in the Poisson chapter), so the mean count over an interval of length $t$ is $\\lambda = \\theta t$.' },
  { sym: r`\alpha,\ \beta`, meaning: 'غاما: $\\alpha$ شكل و$\\beta$ **معدل**. ويبل: $\\beta$ **شكل** و$\\alpha$ يحدد المقياس. الرمز نفسه بمعنيين مختلفين.', meaningEn: 'Gamma: $\\alpha$ is the shape and $\\beta$ the **rate**. Weibull: $\\beta$ is the **shape** and $\\alpha$ sets the scale. The same symbols with two different meanings.' },
  { sym: r`a,\ b`, meaning: 'المنتظم: طرفا المجال. بيتا: معلمتا الشكل.', meaningEn: 'Uniform: the ends of the interval. Beta: the two shape parameters.' },
  { sym: r`r`, meaning: 'ذو الحدين السالب: رقم النجاح المطلوب. F: درجات حرية البسط. بيتا: رتبة العزم في $E(X^{r})$. وفي فصل بواسون: المعدل ($\\lambda = rt$).', meaningEn: 'Negative binomial: the number of successes needed. F: the numerator degrees of freedom. Beta: the order of the moment $E(X^{r})$. In the Poisson chapter: the rate ($\\lambda = rt$).' },
  { sym: r`k`, meaning: 'فوق الهندسي: عدد «النجاحات» في المجتمع. واختبار المطابقة بمربع كاي: عدد الفئات.', meaningEn: 'Hypergeometric: the number of “successes” in the population. Chi-square goodness of fit: the number of categories.' },
  { sym: r`v`, meaning: 'درجات الحرية في مربع كاي وt، ودرجات حرية المقام في F.', meaningEn: 'Degrees of freedom in chi-square and t, and the denominator degrees of freedom in F.' },
  { sym: r`N,\ k,\ n`, meaning: 'فوق الهندسي: حجم المجتمع، وعدد «النجاحات» فيه، وعدد السحبات دون إرجاع.', meaningEn: 'Hypergeometric: the population size, the number of “successes” in it, and the number of draws without replacement.' },
  { sym: r`\Gamma,\ B`, meaning: 'دالتا غاما وبيتا: $\\Gamma(n) = (n-1)!$ للأعداد الصحيحة، و$\\Gamma(\\frac{1}{2}) = \\sqrt{\\pi}$، و$B(a,b) = \\frac{\\Gamma(a)\\Gamma(b)}{\\Gamma(a+b)}$.', meaningEn: 'The gamma and beta functions: $\\Gamma(n) = (n-1)!$ for whole numbers, $\\Gamma(\\frac{1}{2}) = \\sqrt{\\pi}$, and $B(a,b) = \\frac{\\Gamma(a)\\Gamma(b)}{\\Gamma(a+b)}$.' },
  { sym: r`\Phi,\ \varphi`, meaning: 'تراكمي الطبيعي المعياري وكثافته.', meaningEn: 'The CDF and density of the standard normal.' },
];
