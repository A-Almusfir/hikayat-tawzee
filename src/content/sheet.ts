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
// النصوص برموز الورقة نفسها، مع التصحيحات والشروط الناقصة مكتوبة صراحة في fixes.
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
    nameEn: 'Negative Binomial',
    group: 'discrete',
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
    nameEn: 'Standard Normal',
    group: 'continuous',
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
    cdf: { kind: 'no-closed-form', note: 'بلا صيغة مغلقة عمومًا؛ وحين يكون $\\alpha$ عددًا صحيحًا: $1 - \\sum_{k=0}^{\\alpha-1} e^{-\\beta x}\\frac{(\\beta x)^{k}}{k!}$.' },
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
    params: '$\\alpha > 0$ يحدد المقياس $\\alpha^{-1/\\beta}$، و$\\beta > 0$ شكل',
    f: r`\alpha\beta\, x^{\beta-1} e^{-\alpha x^{\beta}}`,
    support: r`x > 0`,
    mean: r`E(X) = \alpha^{-1/\beta}\,\Gamma\!\left(1 + \tfrac{1}{\beta}\right)`,
    variance: r`\mathrm{Var}(X) = \alpha^{-2/\beta}\left[\Gamma\!\left(1 + \tfrac{2}{\beta}\right) - \Gamma^{2}\!\left(1 + \tfrac{1}{\beta}\right)\right]`,
    mgf: { kind: 'no-closed-form', note: 'موجودة حين $\\beta \\ge 1$، وغير موجودة لأي $t > 0$ إذا $\\beta < 1$.' },
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
    params: '$v$ عدد صحيح موجب: درجات الحرية',
    f: r`\dfrac{\Gamma\!\left(\frac{v+1}{2}\right)}{\sqrt{v\pi}\,\Gamma\!\left(\frac{v}{2}\right)}\left(1 + \dfrac{x^{2}}{v}\right)^{-\frac{v+1}{2}}`,
    support: r`-\infty < x < \infty`,
    mean: r`E(X) = 0 \quad (v > 1)`,
    variance: r`\mathrm{Var}(X) = \dfrac{v}{v-2} \quad (v > 2)`,
    mgf: { kind: 'none', note: '$E(e^{tX}) = \\infty$ لكل $t \\ne 0$: الذيلان أثقل من أي أُسّ.' },
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
    params: '$a > 0$، $b > 0$ معلمتا شكل',
    f: r`\dfrac{1}{B(a,b)}\, x^{a-1}(1-x)^{b-1}`,
    support: r`0 < x < 1`,
    mean: r`E(X) = \dfrac{a}{a+b}`,
    variance: r`\mathrm{Var}(X) = \dfrac{ab}{(a+b+1)(a+b)^{2}}`,
    mgf: { kind: 'no-closed-form', note: 'موجودة لكل $t$. والمكتوب في الورقة هو العزم $E(X^{r}) = \\frac{B(a+r,\\,b)}{B(a,b)}$.' },
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
    params: '$r$ درجات حرية البسط، $v$ درجات حرية المقام',
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

/** تنبيهات على ورقة القوانين: ما ينقصها أو يحتاج تصحيحًا. rows = الصفوف التي يخصها التنبيه (تُعلَّم في الجدول). */
export interface SheetFix {
  id: string;
  rows: SheetId[];
  kind: 'fix' | 'missing' | 'notation';
  text: string;
}

export const sheetFixes: SheetFix[] = [
  {
    id: 'weibull-moments',
    rows: ['weibull'],
    kind: 'missing',
    text: 'خانتا المتوسط والتباين لويبل فارغتان في الورقة. بصيغة الورقة: $E(X) = \\alpha^{-1/\\beta}\\Gamma(1+\\frac{1}{\\beta})$ و$\\mathrm{Var}(X) = \\alpha^{-2/\\beta}[\\Gamma(1+\\frac{2}{\\beta}) - \\Gamma^{2}(1+\\frac{1}{\\beta})]$.',
  },
  {
    id: 't-moments',
    rows: ['t'],
    kind: 'missing',
    text: 'خانتا t فارغتان في الورقة: $E(X) = 0$ بشرط $v > 1$، و$\\mathrm{Var}(X) = \\frac{v}{v-2}$ بشرط $v > 2$. وعند $v = 1$ يصبح t توزيع كوشي، ولا متوسط له.',
  },
  {
    id: 'f-conditions',
    rows: ['f'],
    kind: 'missing',
    text: 'متوسط F يحتاج الشرط $v > 2$، وتباينه يحتاج $v > 4$. الورقة لا تذكر الشرطين.',
  },
  {
    id: 'beta-moment',
    rows: ['beta'],
    kind: 'fix',
    text: 'المكتوب في عمود $M_X(t)$ لبيتا، $\\frac{B(a+r,\\,b)}{B(a,b)}$، ليس دالة مولدة بل العزم $E(X^{r})$. الدالة المولدة لبيتا موجودة لكل $t$ لكن بلا صيغة أولية.',
  },
  {
    id: 'hyper-support',
    rows: ['hypergeometric'],
    kind: 'fix',
    text: 'مجال فوق الهندسي الدقيق يبدأ من $\\max(0,\\, n-(N-k))$ لا من $0$: إذا سحبت أكثر من عدد «الإخفاقات» في المجتمع فلا بد من بعض النجاحات.',
  },
  {
    id: 'mgf-domain',
    rows: ['negbin', 'geometric', 'exponential', 'gamma', 'chisquare', 'uniform'],
    kind: 'missing',
    text: 'الدالة المولدة صالحة على مجال من $t$ لا تذكره الورقة: الهندسي وذو الحدين السالب $t < -\\ln q$، والأسي $t < \\theta$، وغاما $t < \\beta$، ومربع كاي $t < \\frac{1}{2}$، والمنتظم صيغته لـ $t \\ne 0$ و$M_X(0) = 1$.',
  },
  {
    id: 'dash-meaning',
    rows: ['hypergeometric', 'weibull', 'beta', 't', 'f'],
    kind: 'fix',
    text: 'الشرطة «-» في عمود $M_X(t)$ تخلط معنيين: **غير موجودة** (t وF) و**موجودة بلا صيغة بسيطة** (فوق الهندسي وبيتا، وويبل حين $\\beta \\ge 1$). لا تكتب في الاختبار أن دالة بيتا المولدة غير موجودة.',
  },
  {
    id: 'normal-cdf',
    rows: ['normal', 'stdnormal'],
    kind: 'fix',
    text: 'عمود $F(x)$ للطبيعي ليس «-»: $F(x) = \\Phi\\left(\\frac{x-\\mu}{\\sigma}\\right)$، وتُقرأ $\\Phi$ من جدول الطبيعي المعياري.',
  },
  {
    id: 'gamma-cdf',
    rows: ['gamma'],
    kind: 'missing',
    text: 'حين يكون $\\alpha$ عددًا صحيحًا فلغاما تراكمي مغلق: $F(x) = 1 - \\sum_{k=0}^{\\alpha-1} e^{-\\beta x}\\frac{(\\beta x)^{k}}{k!}$. وهو نفسه احتمال أن يقع $\\alpha$ حدثًا على الأقل في $[0, x]$ في عملية بواسون بمعدل $\\beta$، أي $N(x) \\sim \\mathrm{Poisson}(\\beta x)$.',
  },
  {
    id: 'uniform-cdf',
    rows: ['uniform'],
    kind: 'missing',
    text: 'تراكمي المنتظم $\\frac{x-a}{b-a}$ صالح لـ $a \\le x \\le b$ فقط؛ وهو $0$ قبل $a$ و$1$ بعد $b$.',
  },
  {
    id: 'negbin-trials',
    rows: ['negbin'],
    kind: 'notation',
    text: 'ذو الحدين السالب في الورقة يعدّ **المحاولات** حتى النجاح رقم $r$ ($x \\ge r$). بعض الكتب وبرامج R وSciPy تعدّ **الإخفاقات** $Y = X - r$، فيصبح متوسطها $\\frac{rq}{p}$. تأكد أي التعريفين في المسألة.',
  },
  {
    id: 'gamma-rate',
    rows: ['gamma', 'exponential'],
    kind: 'notation',
    text: '$\\beta$ في غاما (و$\\theta$ في الأسي) **معدل**: المتوسط $\\frac{\\alpha}{\\beta}$. كتب كثيرة تستعمل $\\beta$ **مقياسًا** فيصبح المتوسط $\\alpha\\beta$. والأسي حالة خاصة: $\\text{Exp}(\\theta) = \\text{Gamma}(1, \\theta)$.',
  },
  {
    id: 'typos',
    rows: ['gamma', 'stdnormal'],
    kind: 'notation',
    text: 'صيغ شكلية: «$X, \\alpha, \\beta > 0$» صوابها $x > 0$ و$\\alpha, \\beta > 0$؛ و$f(X)$ صوابها $f(x)$ (المتغير العشوائي بحرف كبير، وقيمته بحرف صغير). والطبيعي المعياري يُكتب عادة بـ $Z$ و$\\varphi(z)$.',
  },
];

/** قاموس الرموز: الرمز نفسه قد يعني أشياء مختلفة في صفوف مختلفة من الورقة. */
export const symbols: { sym: string; meaning: string }[] = [
  { sym: r`q`, meaning: 'دائمًا $1 - p$.' },
  { sym: r`\lambda`, meaning: 'بواسون: متوسط عدد الأحداث في الفترة.' },
  { sym: r`\theta`, meaning: 'الأسي: المعدل (أحداث لكل وحدة زمن)، والمتوسط $\\frac{1}{\\theta}$. وهو معدل عملية بواسون ($r$ في فصل بواسون)، فمتوسط العدد في فترة طولها $t$ هو $\\lambda = \\theta t$.' },
  { sym: r`\alpha,\ \beta`, meaning: 'غاما: $\\alpha$ شكل و$\\beta$ **معدل**. ويبل: $\\beta$ **شكل** و$\\alpha$ يحدد المقياس. الرمز نفسه بمعنيين مختلفين.' },
  { sym: r`a,\ b`, meaning: 'المنتظم: طرفا المجال. بيتا: معلمتا الشكل.' },
  { sym: r`r`, meaning: 'ذو الحدين السالب: رقم النجاح المطلوب. F: درجات حرية البسط. بيتا: رتبة العزم في $E(X^{r})$. وفي فصل بواسون: المعدل ($\\lambda = rt$).' },
  { sym: r`k`, meaning: 'فوق الهندسي: عدد «النجاحات» في المجتمع. واختبار المطابقة بمربع كاي: عدد الفئات.' },
  { sym: r`v`, meaning: 'درجات الحرية في مربع كاي وt، ودرجات حرية المقام في F.' },
  { sym: r`N,\ k,\ n`, meaning: 'فوق الهندسي: حجم المجتمع، وعدد «النجاحات» فيه، وعدد السحبات دون إرجاع.' },
  { sym: r`\Gamma,\ B`, meaning: 'دالتا غاما وبيتا: $\\Gamma(n) = (n-1)!$ للأعداد الصحيحة، و$\\Gamma(\\frac{1}{2}) = \\sqrt{\\pi}$، و$B(a,b) = \\frac{\\Gamma(a)\\Gamma(b)}{\\Gamma(a+b)}$.' },
  { sym: r`\Phi,\ \varphi`, meaning: 'تراكمي الطبيعي المعياري وكثافته.' },
];
