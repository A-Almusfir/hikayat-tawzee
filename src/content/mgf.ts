import type { Choice } from './chapterTypes';
import type { SheetId } from './sheet';
import type { NumericCheck } from './types';

// الدالة المولدة للعزوم: قواعد، واشتقاق E وVar خطوة خطوة، و«تعرّف على التوزيع من M(t)».
// كل خيار في الاشتقاق يحمل دالته العددية، والاختبارات تتحقق أن الصحيح يطابق مشتقة دالة الورقة
// وأن كل مشتّت يختلف عنها فعلًا. وكل مسألة «تعرّف» تُقارن دالتها بدالة الورقة عند المعلمات الصحيحة.

const r = String.raw;
type P = Record<string, number>;

export const mgfRules: { title: string; text: string; tex?: string }[] = [
  {
    title: 'التعريف',
    text: 'الدالة المولدة متوسط $e^{tX}$. وعند $t = 0$ تساوي $1$ دائمًا، فهذا فحص سريع لأي صيغة تكتبها.',
    tex: r`M_X(t) = E\left(e^{tX}\right),\qquad M_X(0) = 1`,
  },
  {
    title: 'العزوم بالاشتقاق',
    text: 'اشتق ثم عوّض $t = 0$. المشتقة الأولى تعطي المتوسط، والثانية تعطي $E(X^2)$ لا التباين؛ اطرح مربع المتوسط.',
    tex: r`\begin{gathered} E(X) = M'(0),\quad E(X^{2}) = M''(0) \\ \mathrm{Var}(X) = M''(0) - \left[M'(0)\right]^{2} \end{gathered}`,
  },
  {
    title: 'حيلة اللوغاريتم',
    text: 'إذا كانت $M$ أُسًّا أو قوة (بواسون، الطبيعي، غاما، مربع كاي) فاشتق $R(t) = \\ln M_X(t)$ بدلها: المشتقة الثانية عند الصفر هي **التباين مباشرة**، دون طرح.',
    tex: r`\begin{gathered} R(t) = \ln M_X(t) \\ R'(0) = E(X),\quad R''(0) = \mathrm{Var}(X) \end{gathered}`,
  },
  {
    title: 'التحويل الخطي',
    text: 'مثال: $X \\sim \\mathrm{Poisson}(3)$ و$Y = 2X + 1$، فإن $M_Y(t) = e^{t}\\,e^{3(e^{2t}-1)}$، ومنها $E(Y) = 7$ و$\\mathrm{Var}(Y) = 12$.',
    tex: r`M_{aX+b}(t) = e^{bt}\,M_X(at)`,
  },
  {
    title: 'مجموع متغيرات مستقلة',
    text: 'بشرط **الاستقلال** فقط. مثال: مجموع $r$ متغيرات هندسية مستقلة بالـ $p$ نفسه دالته $\\left(\\frac{pe^{t}}{1-qe^{t}}\\right)^{r}$، وهي دالة ذي الحدين السالب.',
    tex: r`M_{X+Y}(t) = M_X(t)\,M_Y(t)`,
  },
  {
    title: 'الوحدانية',
    text: 'إذا وُجدت الدالة المولدة على فترة حول الصفر فهي تحدد التوزيع تمامًا. لذلك نتعرف على التوزيع من شكل $M(t)$. أما t وF فلا دالة مولدة لهما، فلا تصلح هذه الطريقة معهما.',
  },
];

// ————————————————————— اشتق —————————————————————

/** ما يجب أن يساويه الخيار الصحيح: دالة في t (مشتقة) أو قيمة عند المعلمات. */
export type Target = 'M1' | 'R1' | 'E' | 'EX2' | 'V';

export interface DeriveOption {
  text: string;
  correct?: boolean;
  why: string;
  fn?: (t: number, p: P) => number;
  value?: (p: P) => number;
}

export interface DeriveStep extends Choice {
  target: Target;
  options: DeriveOption[];
}

export interface DeriveItem {
  id: string;
  dist: SheetId;
  /** الدالة المولدة كما تُعطى للطالب (من الورقة). */
  given: string;
  /** سطر يُعرض قبل الخطوات (مثل تعريف R(t)). */
  setup?: string;
  steps: DeriveStep[];
}

const q = (p: number) => 1 - p;

export const derive: DeriveItem[] = [
  {
    id: 'binomial',
    dist: 'binomial',
    given: r`M_X(t) = (q + pe^{t})^{n}`,
    steps: [
      {
        target: 'M1',
        prompt: 'اشتق بقاعدة السلسلة: ما $M\'(t)$؟',
        options: [
          { text: r`$npe^{t}(q + pe^{t})^{n-1}$`, correct: true, why: 'الأس ينزل $n$، ثم ننقصه واحدًا، ثم نضرب في مشتقة ما داخل القوس $pe^{t}$.', fn: (t, { n, p }) => n * p * Math.exp(t) * Math.pow(q(p) + p * Math.exp(t), n - 1) },
          { text: r`$n(q + pe^{t})^{n-1}$`, why: 'نسيت مشتقة ما داخل القوس، $pe^{t}$.', fn: (t, { n, p }) => n * Math.pow(q(p) + p * Math.exp(t), n - 1) },
          { text: r`$npe^{t}(q + pe^{t})^{n}$`, why: 'الأس ينقص واحدًا بعد الاشتقاق.', fn: (t, { n, p }) => n * p * Math.exp(t) * Math.pow(q(p) + p * Math.exp(t), n) },
          { text: r`$pe^{t}(q + pe^{t})^{n-1}$`, why: 'نسيت أن الأس $n$ ينزل معاملًا.', fn: (t, { n, p }) => p * Math.exp(t) * Math.pow(q(p) + p * Math.exp(t), n - 1) },
        ],
      },
      {
        target: 'E',
        prompt: 'عوّض $t = 0$: ما $E(X) = M\'(0)$؟',
        options: [
          { text: '$np$', correct: true, why: 'عند الصفر $e^{0} = 1$ و$q + p = 1$، فيبقى $np$.', value: ({ n, p }) => n * p },
          { text: '$n$', why: 'نسيت العامل $pe^{0} = p$.', value: ({ n }) => n },
          { text: '$p$', why: 'نسيت العامل $n$.', value: ({ p }) => p },
          { text: '$npq$', why: 'هذا التباين، والقوس عند الصفر $q + p = 1$ لا $q$.', value: ({ n, p }) => n * p * q(p) },
        ],
      },
      {
        target: 'EX2',
        prompt: 'المشتقة الثانية بقاعدة الضرب، ثم $t = 0$: ما $M\'\'(0) = E(X^{2})$؟',
        options: [
          { text: '$np + n(n-1)p^{2}$', correct: true, why: 'الحد الأول من اشتقاق $e^{t}$، والثاني من اشتقاق القوس.', value: ({ n, p }) => n * p + n * (n - 1) * p * p },
          { text: '$n(n-1)p^{2}$', why: 'نسيت الحد الأول من قاعدة الضرب (مشتقة $e^{t}$).', value: ({ n, p }) => n * (n - 1) * p * p },
          { text: '$n^{2}p^{2}$', why: 'هذا مربع المتوسط، لا $E(X^{2})$.', value: ({ n, p }) => n * n * p * p },
          { text: '$np$', why: 'هذا $M\'(0)$ مرة أخرى.', value: ({ n, p }) => n * p },
        ],
      },
      {
        target: 'V',
        prompt: 'ما $\\mathrm{Var}(X) = M\'\'(0) - [M\'(0)]^{2}$؟',
        options: [
          { text: '$np - np^{2} = npq$', correct: true, why: '$np + n^{2}p^{2} - np^{2} - n^{2}p^{2} = np(1 - p)$.', value: ({ n, p }) => n * p * q(p) },
          { text: '$np + n(n-1)p^{2}$', why: 'هذا $E(X^{2})$؛ لم تطرح مربع المتوسط.', value: ({ n, p }) => n * p + n * (n - 1) * p * p },
          { text: '$n^{2}pq$', why: 'خطأ في الطرح: يبقى $np - np^{2}$.', value: ({ n, p }) => n * n * p * q(p) },
          { text: '$np(1 + p)$', why: 'طرحت بإشارة معكوسة.', value: ({ n, p }) => n * p * (1 + p) },
        ],
      },
    ],
  },
  {
    id: 'poisson',
    dist: 'poisson',
    given: r`M_X(t) = e^{\lambda(e^{t} - 1)}`,
    setup: 'الدالة أُسّ، فخذ اللوغاريتم أولًا: $R(t) = \\ln M_X(t) = \\lambda(e^{t} - 1)$.',
    steps: [
      {
        target: 'R1',
        prompt: 'ما $R\'(t)$؟',
        options: [
          { text: r`$\lambda e^{t}$`, correct: true, why: 'مشتقة $e^{t}$ نفسها، ومشتقة الثابت $-1$ صفر.', fn: (t, { l }) => l * Math.exp(t) },
          { text: r`$\lambda(e^{t} - 1)$`, why: 'هذه $R(t)$ نفسها دون اشتقاق.', fn: (t, { l }) => l * (Math.exp(t) - 1) },
          { text: r`$\lambda e^{t} - 1$`, why: 'مشتقة الثابت $-1$ صفر، والـ $\\lambda$ تضرب الحدين.', fn: (t, { l }) => l * Math.exp(t) - 1 },
          { text: r`$e^{t}$`, why: 'نسيت المعامل $\\lambda$.', fn: (t) => Math.exp(t) },
        ],
      },
      {
        target: 'E',
        prompt: 'ما $E(X) = R\'(0)$؟',
        options: [
          { text: r`$\lambda$`, correct: true, why: '$\\lambda e^{0} = \\lambda$.', value: ({ l }) => l },
          { text: '$0$', why: 'هذا $R(0)$ لا $R\'(0)$.', value: () => 0 },
          { text: '$1$', why: 'هذا $M(0)$، وهو $1$ لكل توزيع.', value: () => 1 },
          { text: r`$\lambda^{2}$`, why: 'لا تربيع هنا.', value: ({ l }) => l * l },
        ],
      },
      {
        target: 'V',
        prompt: 'مع اللوغاريتم، $R\'\'(0)$ هو التباين مباشرة. ما $\\mathrm{Var}(X)$؟',
        options: [
          { text: r`$\lambda$`, correct: true, why: '$R\'\'(t) = \\lambda e^{t}$، وعند الصفر $\\lambda$. لذلك المتوسط = التباين في بواسون.', value: ({ l }) => l },
          { text: r`$\lambda + \lambda^{2}$`, why: 'هذا $E(X^{2}) = M\'\'(0)$. مع اللوغاريتم لا نحتاج إلى الطرح.', value: ({ l }) => l + l * l },
          { text: r`$\lambda^{2}$`, why: 'هذا مربع المتوسط.', value: ({ l }) => l * l },
          { text: '$0$', why: 'المشتقة الثانية لـ $\\lambda e^{t}$ ليست صفرًا.', value: () => 0 },
        ],
      },
    ],
  },
  {
    id: 'geometric',
    dist: 'geometric',
    given: r`M_X(t) = \dfrac{pe^{t}}{1 - qe^{t}}`,
    steps: [
      {
        target: 'M1',
        prompt: 'اشتق بقاعدة القسمة: ما $M\'(t)$؟',
        options: [
          { text: r`$\dfrac{pe^{t}}{(1 - qe^{t})^{2}}$`, correct: true, why: '$\\frac{pe^{t}(1 - qe^{t}) - pe^{t}(-qe^{t})}{(1-qe^{t})^{2}}$، والحدان $\\pm pqe^{2t}$ يلغي أحدهما الآخر.', fn: (t, { p }) => (p * Math.exp(t)) / (1 - q(p) * Math.exp(t)) ** 2 },
          { text: r`$\dfrac{pe^{t}(1 - 2qe^{t})}{(1 - qe^{t})^{2}}$`, why: 'إشارة خاطئة: مشتقة المقام $-qe^{t}$، وطرحها يجعلها جمعًا.', fn: (t, { p }) => (p * Math.exp(t) * (1 - 2 * q(p) * Math.exp(t))) / (1 - q(p) * Math.exp(t)) ** 2 },
          { text: r`$\dfrac{pe^{t}}{1 - qe^{t}}$`, why: 'هذه $M(t)$ نفسها: مشتقة $e^{t}$ هي $e^{t}$، لكن المقام متغير أيضًا.', fn: (t, { p }) => (p * Math.exp(t)) / (1 - q(p) * Math.exp(t)) },
          { text: r`$\dfrac{pe^{t}}{-qe^{t}}$`, why: 'لا تُشتق القسمة بقسمة المشتقتين.', fn: (_t, { p }) => -p / q(p) },
        ],
      },
      {
        target: 'E',
        prompt: 'ما $E(X) = M\'(0)$؟',
        options: [
          { text: r`$\dfrac{1}{p}$`, correct: true, why: '$\\frac{p}{(1-q)^{2}} = \\frac{p}{p^{2}} = \\frac{1}{p}$.', value: ({ p }) => 1 / p },
          { text: '$p$', why: 'نسيت أن المقام $(1 - q)^{2} = p^{2}$.', value: ({ p }) => p },
          { text: r`$\dfrac{1}{p^{2}}$`, why: 'البسط $p$ يختصر واحدة من $p^{2}$.', value: ({ p }) => 1 / (p * p) },
          { text: r`$\dfrac{q}{p}$`, why: 'هذا متوسط عدد **الإخفاقات** قبل أول نجاح، لا عدد المحاولات.', value: ({ p }) => q(p) / p },
        ],
      },
      {
        target: 'EX2',
        prompt: 'المشتقة الثانية عند الصفر: ما $M\'\'(0) = E(X^{2})$؟',
        options: [
          { text: r`$\dfrac{1 + q}{p^{2}}$`, correct: true, why: '$M\'\'(t) = \\frac{pe^{t}(1 + qe^{t})}{(1 - qe^{t})^{3}}$، وعند الصفر $\\frac{p(1+q)}{p^{3}}$.', value: ({ p }) => (1 + q(p)) / (p * p) },
          { text: r`$\dfrac{2}{p^{2}}$`, why: 'مثل المتوسط لكن نسيت أن $1 + q \\ne 2$.', value: ({ p }) => 2 / (p * p) },
          { text: r`$\dfrac{1}{p^{2}}$`, why: 'هذا مربع المتوسط، لا $E(X^{2})$.', value: ({ p }) => 1 / (p * p) },
          { text: r`$\dfrac{q}{p^{2}}$`, why: 'هذا التباين؛ $E(X^{2})$ أكبر منه بمربع المتوسط.', value: ({ p }) => q(p) / (p * p) },
        ],
      },
      {
        target: 'V',
        prompt: 'ما $\\mathrm{Var}(X)$؟',
        options: [
          { text: r`$\dfrac{q}{p^{2}}$`, correct: true, why: '$\\frac{1+q}{p^{2}} - \\frac{1}{p^{2}} = \\frac{q}{p^{2}}$.', value: ({ p }) => q(p) / (p * p) },
          { text: r`$\dfrac{1+q}{p^{2}}$`, why: 'هذا $E(X^{2})$؛ لم تطرح مربع المتوسط.', value: ({ p }) => (1 + q(p)) / (p * p) },
          { text: r`$\dfrac{q}{p}$`, why: 'المقام $p^{2}$.', value: ({ p }) => q(p) / p },
          { text: r`$\dfrac{1}{p^{2}}$`, why: 'طرحت $\\frac{q}{p^{2}}$ بدل $\\frac{1}{p^{2}}$.', value: ({ p }) => 1 / (p * p) },
        ],
      },
    ],
  },
  {
    id: 'exponential',
    dist: 'exponential',
    given: r`M_X(t) = \dfrac{\theta}{\theta - t},\quad t < \theta`,
    steps: [
      {
        target: 'M1',
        prompt: 'اكتبها $\\theta(\\theta - t)^{-1}$ واشتق: ما $M\'(t)$؟',
        options: [
          { text: r`$\dfrac{\theta}{(\theta - t)^{2}}$`, correct: true, why: '$-\\theta(\\theta - t)^{-2} \\times (-1)$: إشارتان سالبتان.', fn: (t, { th }) => th / (th - t) ** 2 },
          { text: r`$-\dfrac{\theta}{(\theta - t)^{2}}$`, why: 'نسيت مشتقة ما داخل القوس، $-1$.', fn: (t, { th }) => -th / (th - t) ** 2 },
          { text: r`$\dfrac{1}{\theta - t}$`, why: 'اشتققت البسط $\\theta$ كأنه متغير.', fn: (t, { th }) => 1 / (th - t) },
          { text: r`$\dfrac{\theta}{\theta - t}$`, why: 'هذه $M(t)$ نفسها.', fn: (t, { th }) => th / (th - t) },
        ],
      },
      {
        target: 'E',
        prompt: 'ما $E(X) = M\'(0)$؟',
        options: [
          { text: r`$\dfrac{1}{\theta}$`, correct: true, why: '$\\frac{\\theta}{\\theta^{2}} = \\frac{1}{\\theta}$: المتوسط مقلوب المعدل.', value: ({ th }) => 1 / th },
          { text: r`$\theta$`, why: 'هذا المعدل، والمتوسط مقلوبه.', value: ({ th }) => th },
          { text: r`$\dfrac{1}{\theta^{2}}$`, why: 'هذا التباين.', value: ({ th }) => 1 / (th * th) },
          { text: '$1$', why: 'هذا $M(0)$.', value: () => 1 },
        ],
      },
      {
        target: 'EX2',
        prompt: 'ما $M\'\'(0) = E(X^{2})$؟',
        options: [
          { text: r`$\dfrac{2}{\theta^{2}}$`, correct: true, why: '$M\'\'(t) = \\frac{2\\theta}{(\\theta - t)^{3}}$، وعند الصفر $\\frac{2}{\\theta^{2}}$.', value: ({ th }) => 2 / (th * th) },
          { text: r`$\dfrac{1}{\theta^{2}}$`, why: 'نسيت الأس $2$ الذي ينزل معاملًا.', value: ({ th }) => 1 / (th * th) },
          { text: r`$\dfrac{2}{\theta}$`, why: 'المقام عند الصفر $\\theta^{3}$ والبسط $2\\theta$، فيبقى $\\theta^{2}$.', value: ({ th }) => 2 / th },
          { text: r`$\dfrac{2}{\theta^{3}}$`, why: 'نسيت $\\theta$ في البسط.', value: ({ th }) => 2 / th ** 3 },
        ],
      },
      {
        target: 'V',
        prompt: 'ما $\\mathrm{Var}(X)$؟',
        options: [
          { text: r`$\dfrac{1}{\theta^{2}}$`, correct: true, why: '$\\frac{2}{\\theta^{2}} - \\frac{1}{\\theta^{2}}$.', value: ({ th }) => 1 / (th * th) },
          { text: r`$\dfrac{2}{\theta^{2}}$`, why: 'هذا $E(X^{2})$.', value: ({ th }) => 2 / (th * th) },
          { text: r`$\dfrac{3}{\theta^{2}}$`, why: 'جمعت مربع المتوسط بدل طرحه.', value: ({ th }) => 3 / (th * th) },
          { text: r`$\dfrac{1}{\theta}$`, why: 'هذا المتوسط؛ في الأسي الانحراف المعياري يساويه، لا التباين.', value: ({ th }) => 1 / th },
        ],
      },
    ],
  },
  {
    id: 'gamma',
    dist: 'gamma',
    given: r`M_X(t) = \left(1 - \dfrac{t}{\beta}\right)^{-\alpha},\quad t < \beta`,
    setup: 'قوة، فخذ اللوغاريتم: $R(t) = -\\alpha \\ln\\left(1 - \\frac{t}{\\beta}\\right)$.',
    steps: [
      {
        target: 'R1',
        prompt: 'ما $R\'(t)$؟',
        options: [
          { text: r`$\dfrac{\alpha}{\beta - t}$`, correct: true, why: '$-\\alpha \\times \\frac{-1/\\beta}{1 - t/\\beta} = \\frac{\\alpha}{\\beta - t}$.', fn: (t, { al, be }) => al / (be - t) },
          { text: r`$-\dfrac{\alpha}{\beta - t}$`, why: 'نسيت أن مشتقة $1 - \\frac{t}{\\beta}$ سالبة، فتلغي سالب $-\\alpha$.', fn: (t, { al, be }) => -al / (be - t) },
          { text: r`$\dfrac{1}{\beta - t}$`, why: 'نسيت المعامل $\\alpha$.', fn: (t, { be }) => 1 / (be - t) },
          { text: r`$\dfrac{\alpha}{\beta}$`, why: 'هذه قيمتها عند الصفر فقط، لا الدالة.', fn: (_t, { al, be }) => al / be },
        ],
      },
      {
        target: 'E',
        prompt: 'ما $E(X) = R\'(0)$؟',
        options: [
          { text: r`$\dfrac{\alpha}{\beta}$`, correct: true, why: '$\\beta$ هنا **معدل**، فالمتوسط $\\frac{\\alpha}{\\beta}$.', value: ({ al, be }) => al / be },
          { text: r`$\alpha\beta$`, why: 'هذا متوسط غاما حين يكون $\\beta$ **مقياسًا** (كتب أخرى). في ورقتكم $\\beta$ معدل.', value: ({ al, be }) => al * be },
          { text: r`$\dfrac{\beta}{\alpha}$`, why: 'مقلوب الصحيح.', value: ({ al, be }) => be / al },
          { text: r`$\dfrac{\alpha}{\beta^{2}}$`, why: 'هذا التباين.', value: ({ al, be }) => al / (be * be) },
        ],
      },
      {
        target: 'V',
        prompt: 'ما $\\mathrm{Var}(X) = R\'\'(0)$؟',
        options: [
          { text: r`$\dfrac{\alpha}{\beta^{2}}$`, correct: true, why: '$R\'\'(t) = \\frac{\\alpha}{(\\beta - t)^{2}}$، وعند الصفر $\\frac{\\alpha}{\\beta^{2}}$.', value: ({ al, be }) => al / (be * be) },
          { text: r`$\dfrac{\alpha^{2}}{\beta^{2}}$`, why: 'هذا مربع المتوسط.', value: ({ al, be }) => (al * al) / (be * be) },
          { text: r`$\dfrac{\alpha}{\beta}$`, why: 'هذا المتوسط.', value: ({ al, be }) => al / be },
          { text: r`$\alpha\beta^{2}$`, why: 'هذا تباين غاما بالمقياس لا بالمعدل.', value: ({ al, be }) => al * be * be },
        ],
      },
    ],
  },
  {
    id: 'normal',
    dist: 'normal',
    given: r`M_X(t) = e^{\mu t + \frac{\sigma^{2}t^{2}}{2}}`,
    setup: 'أُسّ، فخذ اللوغاريتم: $R(t) = \\mu t + \\frac{\\sigma^{2}t^{2}}{2}$.',
    steps: [
      {
        target: 'R1',
        prompt: 'ما $R\'(t)$؟',
        options: [
          { text: r`$\mu + \sigma^{2}t$`, correct: true, why: 'مشتقة $\\frac{t^{2}}{2}$ هي $t$.', fn: (t, { mu, s }) => mu + s * s * t },
          { text: r`$\mu + \sigma^{2}t^{2}$`, why: 'الأس ينقص واحدًا: مشتقة $t^{2}$ هي $2t$.', fn: (t, { mu, s }) => mu + s * s * t * t },
          { text: r`$\mu t + \sigma^{2}t$`, why: 'مشتقة $\\mu t$ هي $\\mu$.', fn: (t, { mu, s }) => mu * t + s * s * t },
          { text: r`$\sigma^{2}t$`, why: 'نسيت مشتقة $\\mu t$.', fn: (t, { s }) => s * s * t },
        ],
      },
      {
        target: 'E',
        prompt: 'ما $E(X) = R\'(0)$؟',
        options: [
          { text: r`$\mu$`, correct: true, why: 'الحد الثاني يختفي عند $t = 0$.', value: ({ mu }) => mu },
          { text: '$0$', why: 'هذا للطبيعي المعياري فقط.', value: () => 0 },
          { text: r`$\mu + \sigma^{2}$`, why: '$\\sigma^{2}t$ صفر عند $t = 0$.', value: ({ mu, s }) => mu + s * s },
          { text: r`$\sigma^{2}$`, why: 'هذا التباين.', value: ({ s }) => s * s },
        ],
      },
      {
        target: 'V',
        prompt: 'ما $\\mathrm{Var}(X) = R\'\'(0)$؟',
        options: [
          { text: r`$\sigma^{2}$`, correct: true, why: 'مشتقة $\\mu + \\sigma^{2}t$ هي $\\sigma^{2}$.', value: ({ s }) => s * s },
          { text: r`$\mu^{2} + \sigma^{2}$`, why: 'هذا $E(X^{2})$. مع اللوغاريتم نحصل على التباين مباشرة.', value: ({ mu, s }) => mu * mu + s * s },
          { text: r`$2\sigma^{2}$`, why: 'مشتقة $\\frac{\\sigma^{2}t^{2}}{2}$ الثانية $\\sigma^{2}$، فالـ $2$ يختصر مع $\\frac{1}{2}$.', value: ({ s }) => 2 * s * s },
          { text: r`$\sigma$`, why: 'هذا الانحراف المعياري.', value: ({ s }) => s },
        ],
      },
    ],
  },
];

// ————————————————————— تعرّف على التوزيع من M(t) —————————————————————

export interface IdentifyItem {
  id: string;
  /** نص المسألة، بما فيه الدالة المولدة. */
  text: string;
  /** الدالة المعطاة عدديًا (مكتوبة من النص مباشرة) — تُقارن بدالة الورقة. */
  mgf: (t: number) => number;
  answer: SheetId;
  params: P;
  which: Choice;
  param: Choice & { options: (Choice['options'][number] & { p?: P })[] };
  /** أي عزم تسأل عنه الخطوة الثالثة (للتحقق من الورقة). */
  calc: Choice & { of: 'E' | 'V' | 'EX2'; check: NumericCheck };
}

// أسماء الخيارات في الخطوة الأولى
const N: Partial<Record<SheetId, string>> = {
  binomial: 'ذو الحدين',
  negbin: 'ذو الحدين السالب',
  geometric: 'الهندسي',
  poisson: 'بواسون',
  uniform: 'المنتظم',
  normal: 'الطبيعي',
  exponential: 'الأسي',
  gamma: 'غاما',
  chisquare: 'مربع كاي',
};

export const identify: IdentifyItem[] = [
  {
    id: 'id-bin',
    text: 'متغير عشوائي دالته المولدة $M_X(t) = (0.3 + 0.7e^{t})^{8}$.',
    mgf: (t) => Math.pow(0.3 + 0.7 * Math.exp(t), 8),
    answer: 'binomial',
    params: { n: 8, p: 0.7 },
    which: {
      prompt: 'أي توزيع؟',
      options: [
        { text: N.binomial!, correct: true, why: 'الشكل $(q + pe^{t})^{n}$ بالضبط.' },
        { text: N.negbin!, why: 'ذاك فيه كسر $\\frac{pe^{t}}{1 - qe^{t}}$ مرفوع لقوة.' },
        { text: N.poisson!, why: 'بواسون دالته أُسّ: $e^{\\lambda(e^{t}-1)}$.' },
        { text: N.geometric!, why: 'الهندسي كسر بلا قوة خارجية.' },
      ],
    },
    param: {
      prompt: 'ما المعلمات؟',
      options: [
        { text: '$n = 8$، $p = 0.7$', correct: true, why: 'معامل $e^{t}$ هو $p$، والحد الثابت $q = 0.3$.', p: { n: 8, p: 0.7 } },
        { text: '$n = 8$، $p = 0.3$', why: 'الحد الثابت هو $q$، و$p$ هو معامل $e^{t}$.', p: { n: 8, p: 0.3 } },
        { text: '$n = 7$، $p = 0.7$', why: 'الأس هو $n$ نفسه.', p: { n: 7, p: 0.7 } },
      ],
    },
    calc: {
      of: 'V',
      prompt: 'ما $\\mathrm{Var}(X)$؟',
      options: [
        { text: '$8 \\times 0.7 \\times 0.3 = 1.68$', correct: true, why: '$npq$.' },
        { text: '$5.6$', why: 'هذا المتوسط $np$.' },
        { text: '$0.21$', why: 'هذا $pq$ دون $n$.' },
      ],
      check: { compute: () => 8 * 0.7 * 0.3, shown: 1.68, digits: 2 },
    },
  },
  {
    id: 'id-poi',
    text: 'متغير عشوائي دالته المولدة $M_X(t) = e^{3(e^{t} - 1)}$.',
    mgf: (t) => Math.exp(3 * (Math.exp(t) - 1)),
    answer: 'poisson',
    params: { l: 3 },
    which: {
      prompt: 'أي توزيع؟',
      options: [
        { text: N.poisson!, correct: true, why: 'الشكل $e^{\\lambda(e^{t}-1)}$.' },
        { text: N.normal!, why: 'الطبيعي أُسّ أيضًا لكن فيه $t$ و$t^{2}$، لا $e^{t}$.' },
        { text: N.exponential!, why: 'الأسي دالته كسر $\\frac{\\theta}{\\theta - t}$، رغم اسمه.' },
        { text: N.binomial!, why: 'ذو الحدين قوة لقوس، لا أُسّ.' },
      ],
    },
    param: {
      prompt: 'ما المعلمة؟',
      options: [
        { text: '$\\lambda = 3$', correct: true, why: 'المعامل أمام $(e^{t} - 1)$.', p: { l: 3 } },
        { text: '$\\lambda = e^{3}$', why: 'المعلمة هي المعامل في الأس، لا الأُسّ نفسه.', p: { l: Math.exp(3) } },
        { text: '$\\lambda = \\frac{1}{3}$', why: 'لا مقلوب هنا.', p: { l: 1 / 3 } },
      ],
    },
    calc: {
      of: 'EX2',
      prompt: 'ما $E(X^{2})$؟',
      options: [
        { text: '$3 + 3^{2} = 12$', correct: true, why: '$E(X^{2}) = \\mathrm{Var}(X) + [E(X)]^{2} = \\lambda + \\lambda^{2}$.' },
        { text: '$9$', why: 'هذا $[E(X)]^{2}$ وحده.' },
        { text: '$3$', why: 'هذا التباين (أو المتوسط).' },
      ],
      check: { compute: () => 3 + 9, shown: 12, digits: 0 },
    },
  },
  {
    id: 'id-chi',
    text: 'متغير عشوائي دالته المولدة $M_X(t) = (1 - 2t)^{-5}$ حين $t < \\frac{1}{2}$.',
    mgf: (t) => Math.pow(1 - 2 * t, -5),
    answer: 'chisquare',
    params: { v: 10 },
    which: {
      prompt: 'أي توزيع؟',
      options: [
        { text: N.chisquare!, correct: true, why: 'الشكل $(1 - 2t)^{-v/2}$. وهو نفسه غاما بـ $\\alpha = 5$ و$\\beta = \\frac{1}{2}$: الدالتان متطابقتان، فالتوزيع واحد.' },
        { text: N.exponential!, why: 'الأسي أسّه $-1$ فقط؛ هنا $-5$.' },
        { text: N.normal!, why: 'الطبيعي دالته أُسّ لا قوة.' },
        { text: N.geometric!, why: 'الهندسي فيه $e^{t}$.' },
      ],
    },
    param: {
      prompt: 'ما درجات الحرية $v$؟',
      options: [
        { text: '$v = 10$', correct: true, why: '$\\frac{v}{2} = 5$.', p: { v: 10 } },
        { text: '$v = 5$', why: 'الأس هو $\\frac{v}{2}$ لا $v$.', p: { v: 5 } },
        { text: '$v = \\frac{5}{2}$', why: 'ضربت بدل أن تقسم: $\\frac{v}{2} = 5$.', p: { v: 2.5 } },
      ],
    },
    calc: {
      of: 'V',
      prompt: 'ما $\\mathrm{Var}(X)$؟',
      options: [
        { text: '$2v = 20$', correct: true, why: 'تباين مربع كاي $2v$. (ومن غاما: $\\frac{\\alpha}{\\beta^{2}} = \\frac{5}{1/4} = 20$ أيضًا.)' },
        { text: '$10$', why: 'هذا المتوسط $v$.' },
        { text: '$5$', why: 'هذا $\\frac{v}{2}$.' },
      ],
      check: { compute: () => 2 * 10, shown: 20, digits: 0 },
    },
  },
  {
    id: 'id-norm',
    text: 'متغير عشوائي دالته المولدة $M_X(t) = e^{2t + 4.5t^{2}}$.',
    mgf: (t) => Math.exp(2 * t + 4.5 * t * t),
    answer: 'normal',
    params: { mu: 2, s: 3 },
    which: {
      prompt: 'أي توزيع؟',
      options: [
        { text: N.normal!, correct: true, why: 'الشكل $e^{\\mu t + \\sigma^{2}t^{2}/2}$: أُسّ فيه $t$ و$t^{2}$.' },
        { text: N.poisson!, why: 'بواسون أسّه فيه $e^{t}$ لا $t^{2}$.' },
        { text: N.gamma!, why: 'غاما قوة لقوس، لا أُسّ.' },
        { text: N.uniform!, why: 'المنتظم فرق أُسّين مقسوم على $t$.' },
      ],
    },
    param: {
      prompt: 'ما المعلمات؟',
      options: [
        { text: '$\\mu = 2$، $\\sigma^{2} = 9$', correct: true, why: '$\\frac{\\sigma^{2}}{2} = 4.5$، فإن $\\sigma^{2} = 9$.', p: { mu: 2, s: 3 } },
        { text: '$\\mu = 2$، $\\sigma^{2} = 4.5$', why: 'معامل $t^{2}$ هو $\\frac{\\sigma^{2}}{2}$ لا $\\sigma^{2}$.', p: { mu: 2, s: Math.sqrt(4.5) } },
        { text: '$\\mu = 4.5$، $\\sigma^{2} = 2$', why: 'معامل $t$ هو المتوسط.', p: { mu: 4.5, s: Math.SQRT2 } },
      ],
    },
    calc: {
      of: 'EX2',
      prompt: 'ما $E(X^{2})$؟',
      options: [
        { text: '$9 + 2^{2} = 13$', correct: true, why: '$E(X^{2}) = \\sigma^{2} + \\mu^{2}$.' },
        { text: '$9$', why: 'هذا التباين وحده.' },
        { text: '$4$', why: 'هذا $\\mu^{2}$ وحده.' },
      ],
      check: { compute: () => 9 + 4, shown: 13, digits: 0 },
    },
  },
  {
    id: 'id-exp',
    text: 'متغير عشوائي دالته المولدة $M_X(t) = \\frac{4}{4 - t}$ حين $t < 4$.',
    mgf: (t) => 4 / (4 - t),
    answer: 'exponential',
    params: { th: 4 },
    which: {
      prompt: 'أي توزيع؟',
      options: [
        { text: N.exponential!, correct: true, why: 'الشكل $\\frac{\\theta}{\\theta - t}$.' },
        { text: N.geometric!, why: 'الهندسي فيه $e^{t}$.' },
        { text: N.poisson!, why: 'بواسون أُسّ.' },
        { text: N.uniform!, why: 'المنتظم فيه $e^{tb} - e^{ta}$.' },
      ],
    },
    param: {
      prompt: 'ما المعدل $\\theta$؟',
      options: [
        { text: '$\\theta = 4$', correct: true, why: 'البسط والحد الثابت في المقام.', p: { th: 4 } },
        { text: '$\\theta = \\frac{1}{4}$', why: 'هذا المتوسط لا المعدل.', p: { th: 0.25 } },
      ],
    },
    calc: {
      of: 'V',
      prompt: 'ما $\\mathrm{Var}(X)$؟',
      options: [
        { text: '$\\frac{1}{16} = 0.0625$', correct: true, why: '$\\frac{1}{\\theta^{2}}$.' },
        { text: '$0.25$', why: 'هذا المتوسط $\\frac{1}{\\theta}$.' },
        { text: '$16$', why: 'هذا $\\theta^{2}$؛ التباين مقلوبه.' },
      ],
      check: { compute: () => 1 / 16, shown: 0.0625, digits: 4 },
    },
  },
  {
    id: 'id-negbin',
    text: 'متغير عشوائي دالته المولدة $M_X(t) = \\left(\\frac{0.25e^{t}}{1 - 0.75e^{t}}\\right)^{3}$.',
    mgf: (t) => Math.pow((0.25 * Math.exp(t)) / (1 - 0.75 * Math.exp(t)), 3),
    answer: 'negbin',
    params: { r: 3, p: 0.25 },
    which: {
      prompt: 'أي توزيع؟',
      options: [
        { text: N.negbin!, correct: true, why: 'دالة الهندسي مرفوعة لقوة $r$: مجموع $r$ متغيرات هندسية مستقلة.' },
        { text: N.geometric!, why: 'الهندسي هو هذا الكسر نفسه **دون** القوة $3$.' },
        { text: N.binomial!, why: 'ذو الحدين قوة لقوس $(q + pe^{t})$ بلا مقام.' },
        { text: N.gamma!, why: 'غاما ليس فيه $e^{t}$.' },
      ],
    },
    param: {
      prompt: 'ما المعلمات؟',
      options: [
        { text: '$r = 3$، $p = 0.25$', correct: true, why: 'معامل $e^{t}$ في البسط هو $p$، والقوة هي $r$.', p: { r: 3, p: 0.25 } },
        { text: '$r = 3$، $p = 0.75$', why: '$0.75$ هو $q$.', p: { r: 3, p: 0.75 } },
        { text: '$r = 1$، $p = 0.25$', why: 'هذا الهندسي؛ القوة هنا $3$.', p: { r: 1, p: 0.25 } },
      ],
    },
    calc: {
      of: 'E',
      prompt: 'ما $E(X)$؟',
      options: [
        { text: '$\\frac{3}{0.25} = 12$', correct: true, why: '$\\frac{r}{p}$: ثلاثة أضعاف متوسط الهندسي.' },
        { text: '$4$', why: 'هذا متوسط الهندسي $\\frac{1}{p}$ وحده.' },
        { text: '$9$', why: 'هذا متوسط عدد الإخفاقات $\\frac{rq}{p}$، لا المحاولات.' },
      ],
      check: { compute: () => 3 / 0.25, shown: 12, digits: 0 },
    },
  },
  {
    id: 'id-unif',
    text: 'متغير عشوائي دالته المولدة $M_X(t) = \\frac{e^{5t} - e^{2t}}{3t}$ حين $t \\ne 0$.',
    mgf: (t) => (Math.exp(5 * t) - Math.exp(2 * t)) / (3 * t),
    answer: 'uniform',
    params: { a: 2, b: 5 },
    which: {
      prompt: 'أي توزيع؟',
      options: [
        { text: N.uniform!, correct: true, why: 'الشكل $\\frac{e^{tb} - e^{ta}}{t(b-a)}$.' },
        { text: N.exponential!, why: 'الأسي كسر بلا $e^{t}$.' },
        { text: N.normal!, why: 'الطبيعي أُسّ واحد.' },
        { text: N.geometric!, why: 'الهندسي متقطع ودالته $\\frac{pe^{t}}{1 - qe^{t}}$.' },
      ],
    },
    param: {
      prompt: 'ما المجال؟',
      options: [
        { text: '$a = 2$، $b = 5$', correct: true, why: 'معاملا $t$ في الأسّين، و$b - a = 3$ في المقام.', p: { a: 2, b: 5 } },
        { text: '$a = 0$، $b = 3$', why: '$3$ هو طول المجال $b - a$، لا طرفه.', p: { a: 0, b: 3 } },
      ],
    },
    calc: {
      of: 'V',
      prompt: 'ما $\\mathrm{Var}(X)$؟',
      options: [
        { text: '$\\frac{3^{2}}{12} = 0.75$', correct: true, why: '$\\frac{(b-a)^{2}}{12}$.' },
        { text: '$3.5$', why: 'هذا المتوسط $\\frac{a+b}{2}$.' },
        { text: '$0.25$', why: 'القسمة على $12$ لا على $36$.' },
      ],
      check: { compute: () => 9 / 12, shown: 0.75, digits: 2 },
    },
  },
  {
    id: 'id-gamma',
    text: 'متغير عشوائي دالته المولدة $M_X(t) = \\left(1 - \\frac{t}{3}\\right)^{-2}$ حين $t < 3$.',
    mgf: (t) => Math.pow(1 - t / 3, -2),
    answer: 'gamma',
    params: { al: 2, be: 3 },
    which: {
      prompt: 'أي توزيع؟',
      options: [
        { text: N.gamma!, correct: true, why: 'الشكل $\\left(1 - \\frac{t}{\\beta}\\right)^{-\\alpha}$. وبـ $\\alpha = 2$ صحيح هو مجموع زمني انتظار أسيين مستقلين.' },
        { text: N.exponential!, why: 'الأسي حالة $\\alpha = 1$؛ هنا الأس $-2$.' },
        { text: N.chisquare!, why: 'مربع كاي يحتاج $\\beta = \\frac{1}{2}$، أي $(1 - 2t)$؛ هنا $\\beta = 3$.' },
        { text: N.negbin!, why: 'ذو الحدين السالب فيه $e^{t}$.' },
      ],
    },
    param: {
      prompt: 'ما المعلمات؟',
      options: [
        { text: '$\\alpha = 2$، $\\beta = 3$', correct: true, why: 'القوة $-\\alpha$، والمقسوم عليه $t$ هو المعدل $\\beta$.', p: { al: 2, be: 3 } },
        { text: '$\\alpha = 2$، $\\beta = \\frac{1}{3}$', why: 'في صيغة الورقة $\\beta$ معدل: $1 - \\frac{t}{\\beta}$، فـ $\\beta = 3$.', p: { al: 2, be: 1 / 3 } },
        { text: '$\\alpha = 3$، $\\beta = 2$', why: 'تبادلت المعلمتان.', p: { al: 3, be: 2 } },
      ],
    },
    calc: {
      of: 'V',
      prompt: 'ما $\\mathrm{Var}(X)$؟',
      options: [
        { text: '$\\frac{2}{9} \\approx 0.2222$', correct: true, why: '$\\frac{\\alpha}{\\beta^{2}}$.' },
        { text: '$0.6667$', why: 'هذا المتوسط $\\frac{\\alpha}{\\beta}$.' },
        { text: '$18$', why: 'هذا $\\alpha\\beta^{2}$ (صيغة المقياس).' },
      ],
      check: { compute: () => 2 / 9, shown: 0.2222, digits: 4 },
    },
  },
  {
    id: 'id-sum',
    text: '$X$ و$Y$ مستقلان، و$M_X(t) = e^{2(e^{t}-1)}$ و$M_Y(t) = e^{3(e^{t}-1)}$. ما توزيع $X + Y$؟',
    mgf: (t) => Math.exp(2 * (Math.exp(t) - 1)) * Math.exp(3 * (Math.exp(t) - 1)),
    answer: 'poisson',
    params: { l: 5 },
    which: {
      prompt: 'لاستقلالهما $M_{X+Y} = M_X M_Y = e^{5(e^{t}-1)}$. أي توزيع؟',
      options: [
        { text: N.poisson!, correct: true, why: 'حاصل الضرب ما زال بالشكل $e^{\\lambda(e^{t}-1)}$: مجموع بواسونين مستقلين بواسون.' },
        { text: N.binomial!, why: 'لا قوس مرفوع لقوة هنا.' },
        { text: N.normal!, why: 'لا $t^{2}$ في الأس.' },
      ],
    },
    param: {
      prompt: 'ما المعلمة؟',
      options: [
        { text: '$\\lambda = 5$', correct: true, why: 'الأسّان يُجمعان: $2 + 3$.', p: { l: 5 } },
        { text: '$\\lambda = 6$', why: 'حاصل ضرب الدالتين يجمع الأسّين، لا يضربهما.', p: { l: 6 } },
      ],
    },
    calc: {
      of: 'V',
      prompt: 'ما $\\mathrm{Var}(X + Y)$؟',
      options: [
        { text: '$5$', correct: true, why: 'بواسون: التباين = المتوسط = $5$. (ولاستقلالهما $2 + 3$ أيضًا.)' },
        { text: '$25$', why: 'هذا مربع المتوسط.' },
        { text: '$6$', why: 'هذا $2 \\times 3$.' },
      ],
      check: { compute: () => 5, shown: 5, digits: 0 },
    },
  },
];
