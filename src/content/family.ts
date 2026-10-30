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
}

export const edges: Edge[] = [
  {
    id: 'bern-bin',
    panel: 'discrete',
    from: 'bernoulli',
    to: 'binomial',
    kind: 'exact',
    short: 'اجمع',
    title: 'برنولي ← ذو الحدين: جمع',
    body: 'مجموع $n$ محاولات برنولي مستقلة لها $p$ نفسه يتبع ذا الحدين.',
    tex: String.raw`Y_1 + \dots + Y_n \sim \mathrm{Bin}(n, p)`,
    condition: 'علاقة دقيقة، بشرط الاستقلال وثبات $p$.',
  },
  {
    id: 'bern-geo',
    panel: 'discrete',
    from: 'bernoulli',
    to: 'geometric',
    kind: 'exact',
    short: 'كرّر',
    title: 'برنولي ← الهندسي: تكرار حتى أول نجاح',
    body: 'كرّر محاولات برنولي المستقلة حتى أول $1$، وعدّ المحاولات بما فيها الناجحة.',
    tex: String.raw`X = \min\{\, i : Y_i = 1 \,\} \sim \mathrm{Geom}(p)`,
    condition: 'علاقة دقيقة، بشرط الاستقلال وثبات $p$.',
  },
  {
    id: 'bin-poi',
    panel: 'discrete',
    from: 'binomial',
    to: 'poisson',
    kind: 'limit',
    short: 'نهاية',
    title: 'ذو الحدين ← بواسون: كثرة الفرص وصغر الاحتمال',
    body: 'حين تكثر المحاولات ويصغر احتمال الحدث في كل منها، يقترب ذو الحدين من بواسون.',
    tex: String.raw`\mathrm{Bin}(n, p) \;\to\; \mathrm{Poisson}(\lambda),\quad np \to \lambda`,
    condition: 'نهاية حين $n$ كبير و$p$ صغير. قاعدة عملية شائعة: $n \\ge 20$ و$p \\le 0.05$.',
    detail:
      'حدّ الخطأ (متباينة لو كام): مجموع الفروق المطلقة بين الاحتمالين على كل $k$ لا يتجاوز $2np^2$. لذلك المهم صِغَر $p$، لا كِبَر $n$ وحده.',
    src: ['lecam'],
  },
  {
    id: 'poi-exp',
    panel: 'continuous',
    from: 'poisson',
    to: 'exponential',
    kind: 'exact',
    both: true,
    short: 'عدّ ↔ انتظار',
    title: 'بواسون ↔ الأسي: وجهان لعملية واحدة',
    body: 'في عملية بواسون متجانسة بمعدل $r$ لكل وحدة زمن: عدد الأحداث في زمن $t$ يتبع بواسون بمتوسط $\\lambda = rt$، وزمن الانتظار حتى الحدث التالي يتبع الأسي بمعدل $\\theta = r$ (ورقة المقرر تكتب معدل الأسي $\\theta$).',
    tex: String.raw`P(T > t) = P\big(N(t) = 0\big) = e^{-\theta t}`,
    condition: 'علاقة دقيقة داخل عملية بواسون متجانسة: معدل ثابت، واستقلال الفترات، وأحداث منفردة.',
  },
  {
    id: 'geo-exp',
    panel: 'continuous',
    from: 'geometric',
    to: 'exponential',
    kind: 'limit',
    short: 'نهاية',
    title: 'الهندسي ← الأسي: الانتظار المتقطع يصبح مستمرًا',
    body: 'اجعل كل محاولة تستغرق $1/n$ من وحدة الزمن، واحتمال نجاحها $p = \\theta/n$. زمن الانتظار يقترب من الأسي بمعدل $\\theta$. والاثنان بلا ذاكرة.',
    tex: String.raw`\left(1 - \tfrac{\theta}{n}\right)^{\lfloor nt \rfloor} \to e^{-\theta t}`,
    condition: 'نهاية بعد إعادة قياس الزمن: $p = \\theta/n$ و$n \\to \\infty$.',
    detail:
      'الهندسي هو التوزيع الوحيد بلا ذاكرة على الأعداد الصحيحة الموجبة، والأسي هو نظيره المستمر على الأعداد الموجبة.',
  },
  {
    id: 'bin-norm',
    panel: 'continuous',
    from: 'binomial',
    to: 'normal',
    kind: 'limit',
    short: 'تقريب',
    title: 'ذو الحدين ← الطبيعي: تقريب دي موافر–لابلاس',
    body: 'حين يكون عدد النجاحات المتوقع وعدد الإخفاقات المتوقع كلاهما كبيرًا، يقترب شكل ذي الحدين من منحنى الجرس.',
    tex: String.raw`\frac{X - np}{\sqrt{np(1-p)}} \approx N(0, 1)`,
    condition: '$np \\ge 10$ و$n(1-p) \\ge 10$ (وبعض الكتب تقبل 5)، مع تصحيح الاتصال.',
    detail:
      'تصحيح الاتصال: $P(X \\le k) \\approx \\Phi\\!\\left(\\frac{k + 0.5 - np}{\\sqrt{np(1-p)}}\\right)$. وإذا كان $p$ صغيرًا جدًا فالتقريب الأنسب بواسون لا الطبيعي. أهمية الطبيعي الأعم تأتي من نظرية النهاية المركزية.',
  },
  {
    id: 'hyp-bin',
    panel: 'discrete',
    from: 'hypergeometric',
    to: 'binomial',
    kind: 'limit',
    short: 'نهاية',
    title: 'فوق الهندسي ← ذو الحدين: مجتمع كبير',
    body: 'حين يكبر المجتمع كثيرًا مقارنة بالعينة، يكاد السحب دون إرجاع لا يغيّر التركيب، فيقترب فوق الهندسي من ذي الحدين بـ $p = \\frac{k}{N}$.',
    tex: String.raw`\mathrm{Hyp}(N, k, n) \;\to\; \mathrm{Bin}(n, p),\quad \tfrac{k}{N} \to p`,
    condition: 'نهاية حين $N \\to \\infty$ و$\\frac{k}{N} \\to p$ و$n$ ثابت. قاعدة عملية: $\\frac{n}{N} \\le 0.05$.',
  },
  {
    id: 'geo-nb',
    panel: 'discrete',
    from: 'geometric',
    to: 'negbin',
    kind: 'exact',
    short: 'اجمع r',
    title: 'الهندسي ← ذو الحدين السالب: جمع',
    body: 'الانتظار حتى النجاح الأول، ثم حتى الثاني، … حتى رقم $r$: مجموع $r$ متغيرات هندسية مستقلة يتبع ذا الحدين السالب. وعند $r = 1$ يعود الهندسي.',
    tex: String.raw`X_1 + \dots + X_r \sim \mathrm{NB}(r, p)`,
    condition: 'علاقة دقيقة، بشرط الاستقلال وثبات $p$.',
  },
  {
    id: 'exp-gam',
    panel: 'continuous',
    from: 'exponential',
    to: 'gamma',
    kind: 'exact',
    short: 'اجمع α',
    title: 'الأسي ← غاما: جمع',
    body: 'مجموع $\\alpha$ زمن انتظار أسي مستقل بالمعدل نفسه هو الانتظار حتى الحدث رقم $\\alpha$، ويتبع غاما. والأسي غاما بـ $\\alpha = 1$.',
    tex: String.raw`T_1 + \dots + T_\alpha \sim \mathrm{Gamma}(\alpha, \theta)`,
    condition: 'علاقة دقيقة لـ $\\alpha$ صحيح، بشرط الاستقلال والمعدل نفسه.',
  },
  {
    id: 'uni-exp',
    panel: 'continuous',
    from: 'uniform',
    to: 'exponential',
    kind: 'exact',
    short: 'حوّل',
    title: 'المنتظم ← الأسي: تحويل',
    body: 'إذا كان $U$ منتظمًا على $(0, 1)$ فإن $-\\frac{\\ln U}{\\theta}$ أسي بمعدل $\\theta$. هكذا تولّد الحواسيب أزمنة الانتظار من المنتظم.',
    tex: String.raw`-\tfrac{1}{\theta}\ln U \sim \mathrm{Exp}(\theta)`,
    condition: 'علاقة دقيقة، للمنتظم على $(0, 1)$ تحديدًا.',
  },
  {
    id: 'norm-chi',
    panel: 'sampling',
    from: 'normal',
    to: 'chisquare',
    kind: 'exact',
    short: 'ربّع واجمع',
    title: 'الطبيعي ← مربع كاي: مجموع مربعات',
    body: 'مربع متغير طبيعي معياري يتبع $\\chi^{2}_{1}$، ومجموع مربعات $v$ منها مستقلة يتبع $\\chi^{2}_{v}$. ومنه لعينة من مجتمع طبيعي: $\\frac{(n-1)S^{2}}{\\sigma^{2}} \\sim \\chi^{2}_{n-1}$.',
    tex: String.raw`Z_1^{2} + \dots + Z_v^{2} \sim \chi^{2}_{v}`,
    condition: 'علاقة دقيقة، بشرط الاستقلال؛ ونظرية العينة تشترط مجتمعًا طبيعيًا.',
  },
  {
    id: 'gam-chi',
    panel: 'sampling',
    from: 'gamma',
    to: 'chisquare',
    kind: 'exact',
    short: 'حالة خاصة',
    title: 'غاما ← مربع كاي: حالة خاصة',
    body: 'مربع كاي بـ $v$ درجة حرية هو غاما بـ $\\alpha = \\frac{v}{2}$ و$\\beta = \\frac{1}{2}$. ومنه $\\chi^{2}_{2}$ أسي بمعدل $\\frac{1}{2}$.',
    tex: String.raw`\chi^{2}_{v} = \mathrm{Gamma}\big(\tfrac{v}{2},\, \tfrac{1}{2}\big)`,
    condition: 'تطابق دقيق في الكثافة والدالة المولدة: $(1 - 2t)^{-v/2}$.',
  },
  {
    id: 'chi-t',
    panel: 'sampling',
    from: 'chisquare',
    to: 't',
    kind: 'exact',
    short: 'اقسم',
    title: 'مربع كاي ← t: طبيعي على جذر مربع كاي',
    body: 'إذا كان $Z$ طبيعيًا معياريًا و$V \\sim \\chi^{2}_{v}$ مستقلين فإن $\\frac{Z}{\\sqrt{V/v}}$ يتبع t بـ $v$ درجة حرية. ومنه $\\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t_{n-1}$.',
    tex: String.raw`T = \frac{Z}{\sqrt{V/v}} \sim t_{v}`,
    condition: 'علاقة دقيقة، بشرط **استقلال** $Z$ و$V$ (ويتحقق لـ $\\bar{X}$ و$S^{2}$ حين يكون المجتمع طبيعيًا).',
    detail: 'ومربعه $T^{2} \\sim F(1, v)$. ونسبة مربعي كاي مستقلين، كل منهما مقسوم على درجاته، تعطي F (في «توزيعات أخرى»).',
  },
  {
    id: 't-norm',
    panel: 'sampling',
    from: 't',
    to: 'normal',
    kind: 'limit',
    short: 'نهاية',
    title: 't ← الطبيعي المعياري: عينات كبيرة',
    body: 'حين تكبر درجات الحرية تقترب $S$ من $\\sigma$، فيقترب t من الطبيعي المعياري.',
    tex: String.raw`t_{v} \;\to\; N(0, 1),\quad v \to \infty`,
    condition: 'تقارب في التوزيع حين $v \\to \\infty$. وعند $v = 1$ هو توزيع كوشي بلا متوسط.',
  },
];
