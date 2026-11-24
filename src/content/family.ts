import type { DistId } from './types';

// شجرة منطقية لا تاريخية: تبيّن كيف يرتبط كل توزيع بالآخر رياضيًا، لا من سبق من زمنيًا.
// exact = علاقة دقيقة (خط متصل)؛ limit = نهاية/تقريب بشرط مكتوب (خط متقطع).
export type Panel = 'discrete' | 'continuous' | 'sampling';

export interface Edge {
  id: string;
  panel: Panel;
  from: DistId;
  to: DistId;
  kind: 'exact' | 'limit';
  both?: boolean;
  short: string;
  title: string;
  body: string;
  tex: string;
  /** الشرط باختصار، بلغة الطالب. */
  condition: string;
  /** تفصيل إضافي يظهر في «للمزيد». */
  detail?: string;
  src?: string[];
  /** النسخة الإنجليزية (تجريبية). */
  en: { short: string; title: string; body: string; condition: string; detail?: string };
}

export const edges: Edge[] = [
  {
    id: 'bern-bin',
    panel: 'discrete',
    from: 'bernoulli',
    to: 'binomial',
    kind: 'exact',
    short: 'مجموع n مستقلة',
    title: 'برنولي ← ذو الحدين: جمع',
    body: 'مجموع $n$ محاولات برنولي مستقلة لها $p$ نفسه يتبع ذا الحدين.',
    tex: String.raw`Y_1 + \dots + Y_n \sim \mathrm{Bin}(n, p)`,
    condition: 'علاقة دقيقة، بشرط الاستقلال وثبات $p$.',
    en: {
      short: 'sum of n iid',
      title: 'Bernoulli → Binomial: a sum',
      body: 'The sum of $n$ independent Bernoulli trials with the same $p$ follows a binomial distribution.',
      condition: 'Exact, given independence and a constant $p$.',
    },
  },
  {
    id: 'bern-geo',
    panel: 'discrete',
    from: 'bernoulli',
    to: 'geometric',
    kind: 'exact',
    short: 'حتى أول نجاح',
    title: 'برنولي ← الهندسي: تكرار حتى أول نجاح',
    body: 'كرّر محاولات برنولي المستقلة حتى أول $1$، وعدّ المحاولات بما فيها الناجحة.',
    tex: String.raw`X = \min\{\, i : Y_i = 1 \,\} \sim \mathrm{Geom}(p)`,
    condition: 'علاقة دقيقة، بشرط الاستقلال وثبات $p$.',
    en: {
      short: 'until 1st success',
      title: 'Bernoulli → Geometric: repeat until the first success',
      body: 'Repeat independent Bernoulli trials until the first $1$, and count the trials, including the success.',
      condition: 'Exact, given independence and a constant $p$.',
    },
  },
  {
    id: 'bin-poi',
    panel: 'discrete',
    from: 'binomial',
    to: 'poisson',
    kind: 'limit',
    short: 'n→∞, np→λ',
    title: 'ذو الحدين ← بواسون: كثرة الفرص وصغر الاحتمال',
    body: 'حين تكثر المحاولات ويصغر احتمال الحدث في كل منها، يقترب ذو الحدين من بواسون.',
    tex: String.raw`\mathrm{Bin}(n, p) \;\to\; \mathrm{Poisson}(\lambda),\quad np \to \lambda`,
    condition: 'نهاية حين $n$ كبير و$p$ صغير. قاعدة عملية شائعة: $n \\ge 20$ و$p \\le 0.05$.',
    detail:
      'حدّ الخطأ (متباينة لو كام): مجموع الفروق المطلقة بين الاحتمالين على كل $k$ لا يتجاوز $2np^2$. لذلك المهم صِغَر $p$، لا كِبَر $n$ وحده.',
    src: ['lecam'],
    en: {
      short: 'n→∞, np→λ',
      title: 'Binomial → Poisson: many chances, small probability',
      body: 'When the number of trials grows and the probability of the event in each one shrinks, the binomial approaches the Poisson.',
      condition: 'A limit as $n$ grows and $p$ shrinks. A common rule of thumb: $n \\ge 20$ and $p \\le 0.05$.',
      detail: 'Error bound (Le Cam\'s inequality): the total absolute difference between the two probabilities over all $k$ is at most $2np^2$. So what matters is a small $p$, not just a large $n$.',
    },
  },
  {
    id: 'poi-exp',
    panel: 'continuous',
    from: 'poisson',
    to: 'exponential',
    kind: 'exact',
    both: true,
    short: 'العدد ↔ الانتظار',
    title: 'بواسون ↔ الأسي: وجهان لعملية واحدة',
    body: 'في عملية بواسون متجانسة بمعدل $r$ لكل وحدة زمن: عدد الأحداث في زمن $t$ يتبع بواسون بمتوسط $\\lambda = rt$، وزمن الانتظار حتى الحدث التالي يتبع الأسي بمعدل $\\theta = r$.',
    tex: String.raw`P(T > t) = P\big(N(t) = 0\big) = e^{-\theta t}`,
    condition: 'علاقة دقيقة داخل عملية بواسون متجانسة: معدل ثابت، واستقلال الفترات، وأحداث منفردة.',
    en: {
      short: 'count ↔ wait',
      title: 'Poisson ↔ Exponential: two views of one process',
      body: 'In a homogeneous Poisson process with rate $r$ per unit time, the number of events in time $t$ is Poisson with mean $\\lambda = rt$, and the waiting time until the next event is exponential with rate $\\theta = r$.',
      condition: 'Exact within a homogeneous Poisson process: a constant rate, independent intervals, and events that occur one at a time.',
    },
  },
  {
    id: 'geo-exp',
    panel: 'continuous',
    from: 'geometric',
    to: 'exponential',
    kind: 'limit',
    short: 'p=θ/n, n→∞',
    title: 'الهندسي ← الأسي: الانتظار المتقطع يصبح مستمرًا',
    body: 'اجعل كل محاولة تستغرق $1/n$ من وحدة الزمن، واحتمال نجاحها $p = \\theta/n$. زمن الانتظار يقترب من الأسي بمعدل $\\theta$. والاثنان بلا ذاكرة.',
    tex: String.raw`\left(1 - \tfrac{\theta}{n}\right)^{\lfloor nt \rfloor} \to e^{-\theta t}`,
    condition: 'نهاية بعد إعادة قياس الزمن: $p = \\theta/n$ و$n \\to \\infty$.',
    detail:
      'الهندسي هو التوزيع الوحيد بلا ذاكرة على الأعداد الصحيحة الموجبة، والأسي هو نظيره المستمر على الأعداد الموجبة.',
    en: {
      short: 'p=θ/n, n→∞',
      title: 'Geometric → Exponential: discrete waiting becomes continuous',
      body: 'Let each trial take $1/n$ of a time unit, with success probability $p = \\theta/n$. The waiting time approaches an exponential with rate $\\theta$. Both are memoryless.',
      condition: 'A limit after rescaling time: $p = \\theta/n$ and $n \\to \\infty$.',
      detail: 'The geometric is the only memoryless distribution on the positive integers, and the exponential is its continuous counterpart on the positive reals.',
    },
  },
  {
    id: 'bin-norm',
    panel: 'continuous',
    from: 'binomial',
    to: 'normal',
    kind: 'limit',
    short: 'np, nq ≥ 10',
    title: 'ذو الحدين ← الطبيعي: تقريب دي موافر–لابلاس',
    body: 'حين يكون عدد النجاحات المتوقع وعدد الإخفاقات المتوقع كلاهما كبيرًا، يقترب شكل ذي الحدين من منحنى الجرس.',
    tex: String.raw`\frac{X - np}{\sqrt{np(1-p)}} \approx N(0, 1)`,
    condition: '$np \\ge 10$ و$nq = n(1-p) \\ge 10$ (وبعض الكتب تقبل 5)، مع تصحيح الاتصال.',
    detail:
      'تصحيح الاتصال: $P(X \\le k) \\approx \\Phi\\!\\left(\\frac{k + 0.5 - np}{\\sqrt{np(1-p)}}\\right)$. وإذا كان $p$ صغيرًا جدًا فالتقريب الأنسب بواسون لا الطبيعي. أهمية الطبيعي الأعم تأتي من نظرية النهاية المركزية.',
    en: {
      short: 'np, nq ≥ 10',
      title: 'Binomial → Normal: the de Moivre–Laplace approximation',
      body: 'When the expected numbers of successes and of failures are both large, the binomial takes the shape of the bell curve.',
      condition: '$np \\ge 10$ and $nq = n(1-p) \\ge 10$ (some books accept 5), with a continuity correction.',
      detail: 'Continuity correction: $P(X \\le k) \\approx \\Phi\\!\\left(\\frac{k + 0.5 - np}{\\sqrt{np(1-p)}}\\right)$. If $p$ is very small, the Poisson is the better approximation. The wider importance of the normal comes from the central limit theorem.',
    },
  },
  {
    id: 'hyp-bin',
    panel: 'discrete',
    from: 'hypergeometric',
    to: 'binomial',
    kind: 'limit',
    short: 'N→∞, k/N→p',
    title: 'فوق الهندسي ← ذو الحدين: مجتمع كبير',
    body: 'حين يكبر المجتمع كثيرًا مقارنة بالعينة، يكاد السحب دون إرجاع لا يغيّر التركيب، فيقترب فوق الهندسي من ذي الحدين بـ $p = \\frac{k}{N}$.',
    tex: String.raw`\mathrm{Hyp}(N, k, n) \;\to\; \mathrm{Bin}(n, p),\quad \tfrac{k}{N} \to p`,
    condition: 'نهاية حين $N \\to \\infty$ و$\\frac{k}{N} \\to p$ و$n$ ثابت. قاعدة عملية: $\\frac{n}{N} \\le 0.05$.',
    en: {
      short: 'N→∞, k/N→p',
      title: 'Hypergeometric → Binomial: a large population',
      body: 'When the population is much larger than the sample, drawing without replacement barely changes its makeup, so the hypergeometric approaches a binomial with $p = \\frac{k}{N}$.',
      condition: 'A limit as $N \\to \\infty$ with $\\frac{k}{N} \\to p$ and $n$ fixed. Rule of thumb: $\\frac{n}{N} \\le 0.05$.',
    },
  },
  {
    id: 'geo-nb',
    panel: 'discrete',
    from: 'geometric',
    to: 'negbin',
    kind: 'exact',
    short: 'مجموع r مستقلة',
    title: 'الهندسي ← ذو الحدين السالب: جمع',
    body: 'الانتظار حتى النجاح الأول، ثم حتى الثاني، … حتى رقم $r$: مجموع $r$ متغيرات هندسية مستقلة يتبع ذا الحدين السالب. وعند $r = 1$ يعود الهندسي.',
    tex: String.raw`X_1 + \dots + X_r \sim \mathrm{NB}(r, p)`,
    condition: 'علاقة دقيقة، بشرط الاستقلال وثبات $p$.',
    en: {
      short: 'sum of r iid',
      title: 'Geometric → Negative binomial: a sum',
      body: 'Wait until the first success, then the second, and so on up to the $r$-th: the sum of $r$ independent geometric variables is negative binomial. With $r = 1$ it is the geometric again.',
      condition: 'Exact, given independence and a constant $p$.',
    },
  },
  {
    id: 'exp-gam',
    panel: 'continuous',
    from: 'exponential',
    to: 'gamma',
    kind: 'exact',
    short: 'مجموع α مستقلة، α صحيح',
    title: 'الأسي ← غاما: جمع',
    body: 'مجموع $\\alpha$ زمن انتظار أسي مستقل بالمعدل نفسه هو الانتظار حتى الحدث رقم $\\alpha$، ويتبع غاما. والأسي غاما بـ $\\alpha = 1$.',
    tex: String.raw`T_1 + \dots + T_\alpha \sim \mathrm{Gamma}(\alpha, \theta)`,
    condition: 'علاقة دقيقة لـ $\\alpha$ صحيح، بشرط الاستقلال والمعدل نفسه.',
    en: {
      short: 'sum of α iid, whole α',
      title: 'Exponential → Gamma: a sum',
      body: 'The sum of $\\alpha$ independent exponential waiting times with the same rate is the wait until the $\\alpha$-th event, and it follows a gamma distribution. The exponential is the gamma with $\\alpha = 1$.',
      condition: 'Exact for a whole-number $\\alpha$, given independence and the same rate.',
    },
  },
  {
    id: 'uni-exp',
    panel: 'continuous',
    from: 'uniform',
    to: 'exponential',
    kind: 'exact',
    short: '−ln(U)/θ',
    title: 'المنتظم ← الأسي: تحويل',
    body: 'إذا كان $U$ منتظمًا على $(0, 1)$ فإن $-\\frac{\\ln U}{\\theta}$ أسي بمعدل $\\theta$. هكذا تولّد الحواسيب أزمنة الانتظار من المنتظم.',
    tex: String.raw`-\tfrac{1}{\theta}\ln U \sim \mathrm{Exp}(\theta)`,
    condition: 'علاقة دقيقة، للمنتظم على $(0, 1)$ تحديدًا.',
    en: {
      short: '−ln(U)/θ',
      title: 'Uniform → Exponential: a transformation',
      body: 'If $U$ is uniform on $(0, 1)$, then $-\\frac{\\ln U}{\\theta}$ is exponential with rate $\\theta$. This is how computers generate waiting times from uniform random numbers.',
      condition: 'Exact, for the uniform on $(0, 1)$ specifically.',
    },
  },
  {
    id: 'norm-chi',
    panel: 'sampling',
    from: 'normal',
    to: 'chisquare',
    kind: 'exact',
    short: 'مجموع Z² مستقلة',
    title: 'الطبيعي المعياري ← مربع كاي: مجموع مربعات',
    body: 'مربع متغير طبيعي معياري يتبع $\\chi^{2}_{1}$، ومجموع مربعات $v$ منها مستقلة يتبع $\\chi^{2}_{v}$. ومنه لعينة من مجتمع طبيعي: $\\frac{(n-1)S^{2}}{\\sigma^{2}} \\sim \\chi^{2}_{n-1}$.',
    tex: String.raw`Z_1^{2} + \dots + Z_v^{2} \sim \chi^{2}_{v}`,
    condition: 'علاقة دقيقة، بشرط الاستقلال؛ ونظرية العينة تشترط مجتمعًا طبيعيًا.',
    en: {
      short: 'sum of indep. Z²',
      title: 'Standard normal → Chi-square: a sum of squares',
      body: 'The square of a standard normal variable is $\\chi^{2}_{1}$, and the sum of $v$ independent such squares is $\\chi^{2}_{v}$. Hence, for a sample from a normal population: $\\frac{(n-1)S^{2}}{\\sigma^{2}} \\sim \\chi^{2}_{n-1}$.',
      condition: 'Exact, given independence; the sampling result requires a normal population.',
    },
  },
  {
    id: 'gam-chi',
    panel: 'sampling',
    from: 'gamma',
    to: 'chisquare',
    kind: 'exact',
    short: 'α=v/2, β=1/2',
    title: 'غاما ← مربع كاي: حالة خاصة',
    body: 'مربع كاي بـ $v$ درجة حرية هو غاما بـ $\\alpha = \\frac{v}{2}$ و$\\beta = \\frac{1}{2}$. ومنه $\\chi^{2}_{2}$ أسي بمعدل $\\frac{1}{2}$.',
    tex: String.raw`\chi^{2}_{v} = \mathrm{Gamma}\big(\tfrac{v}{2},\, \tfrac{1}{2}\big)`,
    condition: 'تطابق دقيق في الكثافة والدالة المولدة: $(1 - 2t)^{-v/2}$.',
    en: {
      short: 'α=v/2, β=1/2',
      title: 'Gamma → Chi-square: a special case',
      body: 'Chi-square with $v$ degrees of freedom is the gamma with $\\alpha = \\frac{v}{2}$ and $\\beta = \\frac{1}{2}$. Hence $\\chi^{2}_{2}$ is exponential with rate $\\frac{1}{2}$.',
      condition: 'Identical density and MGF: $(1 - 2t)^{-v/2}$.',
    },
  },
  {
    id: 'chi-t',
    panel: 'sampling',
    from: 'chisquare',
    to: 't',
    kind: 'exact',
    short: 'Z/√(V/v), Z⊥V',
    title: 'مربع كاي ← t: طبيعي معياري على جذر مربع كاي',
    body: 'إذا كان $Z$ طبيعيًا معياريًا و$V \\sim \\chi^{2}_{v}$ مستقلين فإن $\\frac{Z}{\\sqrt{V/v}}$ يتبع t بـ $v$ درجة حرية. ومنه $\\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t_{n-1}$.',
    tex: String.raw`T = \frac{Z}{\sqrt{V/v}} \sim t_{v}`,
    condition: 'علاقة دقيقة، بشرط **استقلال** $Z$ و$V$ (ويتحقق لـ $\\bar{X}$ و$S^{2}$ حين يكون المجتمع طبيعيًا).',
    detail: 'ومربعه $T^{2} \\sim F(1, v)$. ونسبة مربعي كاي مستقلين، كل منهما مقسوم على درجاته، تعطي F (في «توزيعات أخرى»).',
    en: {
      short: 'Z/√(V/v), Z⊥V',
      title: 'Chi-square → t: a standard normal over the root of a chi-square',
      body: 'If $Z$ is standard normal and $V \\sim \\chi^{2}_{v}$, and the two are independent, then $\\frac{Z}{\\sqrt{V/v}}$ follows t with $v$ degrees of freedom. Hence $\\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t_{n-1}$.',
      condition: 'Exact, given the **independence** of $Z$ and $V$ (which holds for $\\bar{X}$ and $S^{2}$ when the population is normal).',
      detail: 'Its square is $T^{2} \\sim F(1, v)$. The ratio of two independent chi-squares, each divided by its degrees of freedom, gives F.',
    },
  },
  {
    id: 't-norm',
    panel: 'sampling',
    from: 't',
    to: 'normal',
    kind: 'limit',
    short: 'v→∞',
    title: 't ← الطبيعي المعياري: عينات كبيرة',
    body: 'حين تكبر درجات الحرية تقترب $S$ من $\\sigma$، فيقترب t من الطبيعي المعياري.',
    tex: String.raw`t_{v} \;\to\; N(0, 1),\quad v \to \infty`,
    condition: 'تقارب في التوزيع حين $v \\to \\infty$. وعند $v = 1$ هو توزيع كوشي بلا متوسط.',
    en: {
      short: 'v→∞',
      title: 't → Standard normal: large samples',
      body: 'As the degrees of freedom grow, $S$ approaches $\\sigma$, so t approaches the standard normal.',
      condition: 'Convergence in distribution as $v \\to \\infty$. At $v = 1$ it is the Cauchy distribution, which has no mean.',
    },
  },
];
