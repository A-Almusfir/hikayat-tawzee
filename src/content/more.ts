import { betaDist, fisherF, quantile, weibull } from '../lib/dist';
import type { ExamProblem } from './chapterTypes';
import type { SheetId } from './sheet';

// «توزيعات أخرى»: بطاقات غنية لما في الورقة بلا فصل (ويبل، بيتا، F).
// لكل بطاقة: متى يظهر، وعلاقة دقيقة بتوزيع آخر، وسطر تاريخي بمصدر، ومثال محلول مفحوص، ومنحنى بمنزلقين.

const r = String.raw;
type P = Record<string, number>;

export interface MoreCard {
  id: SheetId;
  question: string;
  where: string;
  relation: string;
  history: { text: string; src: string[] };
  example: ExamProblem;
  sliders: { key: string; symbol: string; label: string; min: number; max: number; step: number; start: number }[];
  /** المعلمات الفعلية من قيم المنزلقات (مثل بيتا: النجاحات والإخفاقات → a, b). */
  toParams: (s: P) => P;
  pdf: (x: number, p: P) => number;
  xMax: (p: P) => number;
  /** نص برياضيات بين $...$. */
  caption: (p: P) => string;
}

export const moreCards: MoreCard[] = [
  {
    id: 'weibull',
    question: 'كم يعيش جهاز قبل أن يتعطل، حين يتغير خطر العطل مع العمر؟',
    where: 'أعمار المكونات والموثوقية. الشكل $\\beta$ يحكي القصة: $\\beta < 1$ أعطال مبكرة يقل خطرها مع الزمن، و$\\beta = 1$ خطر ثابت (الأسي)، و$\\beta > 1$ تآكل يزيد خطره مع العمر.',
    relation: 'ويبل بـ $\\beta = 1$ هو الأسي بمعدل $\\alpha$. وإذا كان $X$ ويبل فإن $X^{\\beta}$ أسي بمعدل $\\alpha$. وبالرموز الشائعة في كتب أخرى (الشكل $k$ والمقياس $\\lambda$): $\\alpha = \\lambda^{-k}$ و$\\beta = k$.',
    history: {
      text: 'سُمّي باسم والودي ويبل، الذي نشر عنه عام 1951 في متانة المواد؛ وسبقه روزين ورملر (1933) إليه في وصف أحجام الجسيمات.',
      src: ['weibull-wiki'],
    },
    example: {
      label: 'مثال محلول',
      given: 'عمر بطارية (بالسنوات) يتبع ويبل بـ $\\alpha = 0.5$ و$\\beta = 2$. ما احتمال أن تعمل أكثر من سنتين؟',
      steps: [
        { title: 'من التراكمي', body: 'للويبل تراكمي مغلق: $F(x) = 1 - e^{-\\alpha x^{\\beta}}$، فإن', tex: [r`P(X > 2) = e^{-0.5 \times 2^{2}} = e^{-2} \approx 0.1353`] },
      ],
      answer: '$P(X > 2) \\approx 0.1353$',
      check: { compute: () => 1 - weibull.cdf(2, 0.5, 2), shown: 0.1353, digits: 4 },
    },
    sliders: [
      { key: 'al', symbol: r`\alpha`, label: 'المقياس', min: 0.2, max: 2, step: 0.1, start: 0.5 },
      { key: 'be', symbol: r`\beta`, label: 'الشكل', min: 0.5, max: 4, step: 0.1, start: 2 },
    ],
    toParams: (s) => s,
    pdf: (x, { al, be }) => weibull.pdf(x, al, be),
    xMax: ({ al, be }) => quantile((x) => weibull.cdf(x, al, be), 0.995, 0, 1e3),
    caption: ({ be }) => (be < 1 ? 'حين $\\beta < 1$ يقل الخطر مع العمر (أعطال مبكرة).' : Math.abs(be - 1) < 1e-9 ? 'حين $\\beta = 1$: الأسي، خطر ثابت.' : 'حين $\\beta > 1$ يزيد الخطر مع العمر (تآكل).'),
  },
  {
    id: 'beta',
    question: 'احتمال أو نسبة مجهولة بين 0 و1: ماذا نعرف عنها بعد أن نرى بيانات؟',
    where: 'النسب والاحتمالات نفسها متغيرًا عشوائيًا. وفي الإحصاء البايزي: إن افترضنا أولًا أن $p$ منتظم على $(0, 1)$ ثم رأينا $s$ نجاحًا و$f$ إخفاقًا، صار اعتقادنا في $p$ بيتا$(s + 1, f + 1)$.',
    relation: 'بيتا$(1, 1)$ هو المنتظم على $(0, 1)$. وإذا كان $X$ و$Y$ غاما مستقلين **بالمعدل نفسه** وبشكلين $a$ و$b$ فإن $\\frac{X}{X+Y} \\sim$ بيتا$(a, b)$. والمكتوب في عمود $M_X(t)$ في الورقة هو العزم $E(X^{r}) = \\frac{B(a+r,\\,b)}{B(a,b)}$.',
    history: {
      text: 'في مقالة بايز، التي نُشرت عام 1763 بعد وفاته، ظهرت الصيغة $x^{p}(1-x)^{q}$؛ وهي نواة بيتا$(p + 1, q + 1)$، وإن لم يسمّها بايز بهذا الاسم.',
      src: ['bayes-essay-wiki'],
    },
    example: {
      label: 'مثال محلول',
      given: 'إذا كان $X \\sim$ بيتا$(2, 3)$، فما متوسطه؟ وما $P(X < 0.5)$؟',
      steps: [
        { title: 'المتوسط', body: '', tex: [r`E(X) = \frac{a}{a+b} = \frac{2}{5} = 0.4`] },
        { title: 'الاحتمال', body: 'بـ $a$ و$b$ صحيحين الكثافة كثيرة حدود: $f(x) = 12x(1-x)^{2}$.', tex: [r`P(X < 0.5) = \int_{0}^{0.5} 12x(1-x)^{2}\,dx = \frac{11}{16} = 0.6875`] },
      ],
      answer: 'المتوسط $0.4$، و$P(X < 0.5) = 0.6875$.',
      check: { compute: () => betaDist.cdf(0.5, 2, 3), shown: 0.6875, digits: 4 },
    },
    sliders: [
      { key: 's', symbol: 's', label: 'نجاحات مشاهدة', min: 0, max: 20, step: 1, start: 3 },
      { key: 'f', symbol: 'f', label: 'إخفاقات مشاهدة', min: 0, max: 20, step: 1, start: 7 },
    ],
    toParams: ({ s, f }) => ({ a: s + 1, b: f + 1 }),
    pdf: (x, { a, b }) => betaDist.pdf(x, a, b),
    xMax: () => 1,
    caption: ({ a, b }) => `بيتا$(${a}, ${b})$: الاعتقاد في $p$ بعد ${a - 1} نجاحًا و${b - 1} إخفاقًا، ومتوسطه $${(a / (a + b)).toFixed(3)}$.`,
  },
  {
    id: 'f',
    question: 'هل تباينا مجتمعين طبيعيين متساويان؟',
    where: 'نسبة تبايني عينتين **مستقلتين** من مجتمعين **طبيعيين**: $\\frac{S_1^{2}/\\sigma_1^{2}}{S_2^{2}/\\sigma_2^{2}} \\sim F(n_1 - 1,\\ n_2 - 1)$. وهو أساس تحليل التباين.',
    relation: 'إذا كان $U \\sim \\chi^{2}_{r}$ و$V \\sim \\chi^{2}_{v}$ مستقلين فإن $\\frac{U/r}{V/v} \\sim F(r, v)$. ومربع t: $T^{2} \\sim F(1, v)$. ومقلوبه: $\\frac{1}{F} \\sim F(v, r)$.',
    history: {
      text: 'قدّم فيشر عام 1924 إحصاءة $z = \\frac{1}{2}\\ln F$، ثم جدولها سنيدكور عام 1934 وسمّاها F تكريمًا لفيشر.',
      src: ['f-proofwiki'],
    },
    example: {
      label: 'مثال محلول',
      given: 'عينتان مستقلتان من مجتمعين طبيعيين: $n_1 = 11$ و$s_1^{2} = 12$، و$n_2 = 16$ و$s_2^{2} = 4$. هل تباين الأول أكبر عند مستوى $0.05$؟',
      steps: [
        { title: 'الإحصاءة', body: 'إن تساوى التباينان يختصر $\\sigma^{2}$:', tex: [r`F = \frac{s_1^{2}}{s_2^{2}} = \frac{12}{4} = 3`] },
        { title: 'القيمة الحرجة', body: 'درجات الحرية $(10, 15)$:', tex: [r`F_{0.05}(10, 15) = 2.544`] },
      ],
      answer: '$3 > 2.544$: نرفض تساوي التباينين؛ تباين الأول أكبر.',
      check: { compute: () => quantile((x) => fisherF.cdf(x, 10, 15), 0.95, 0, 50), shown: 2.544, digits: 3 },
    },
    sliders: [
      { key: 'r', symbol: 'r', label: 'درجات حرية البسط', min: 1, max: 30, step: 1, start: 10 },
      { key: 'v', symbol: 'v', label: 'درجات حرية المقام', min: 1, max: 30, step: 1, start: 15 },
    ],
    toParams: (s) => s,
    pdf: (x, { r: a, v }) => fisherF.pdf(x, a, v),
    xMax: () => 5,
    caption: ({ r: a, v }) => `$F(${a}, ${v})$${v > 2 ? `: المتوسط $${(v / (v - 2)).toFixed(3)}$، قريب من 1` : ': لا متوسط حين $v \\le 2$'}.`,
  },
];
