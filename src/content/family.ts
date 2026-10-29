import type { DistId } from './types';

// شجرة منطقية لا تاريخية: تبيّن كيف يرتبط كل توزيع بالآخر رياضيًا، لا من سبق من زمنيًا.
// exact = علاقة دقيقة (خط متصل)؛ limit = نهاية/تقريب بشرط مكتوب (خط متقطع).
export interface Edge {
  id: string;
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
    from: 'poisson',
    to: 'exponential',
    kind: 'exact',
    both: true,
    short: 'عدّ ↔ انتظار',
    title: 'بواسون ↔ الأسي: وجهان لعملية واحدة',
    body: 'في عملية بواسون متجانسة بمعدل $\\lambda$: عدد الأحداث في زمن $t$ يتبع بواسون بمتوسط $\\lambda t$، وزمن الانتظار حتى الحدث التالي يتبع الأسي بمعدل $\\lambda$.',
    tex: String.raw`P(T > t) = P\big(N(t) = 0\big) = e^{-\lambda t}`,
    condition: 'علاقة دقيقة داخل عملية بواسون متجانسة: معدل ثابت، واستقلال الفترات، وأحداث منفردة.',
  },
  {
    id: 'geo-exp',
    from: 'geometric',
    to: 'exponential',
    kind: 'limit',
    short: 'نهاية',
    title: 'الهندسي ← الأسي: الانتظار المتقطع يصبح مستمرًا',
    body: 'اجعل كل محاولة تستغرق $1/n$ من وحدة الزمن، واحتمال نجاحها $p = \\lambda/n$. زمن الانتظار يقترب من الأسي بمعدل $\\lambda$. والاثنان بلا ذاكرة.',
    tex: String.raw`\left(1 - \tfrac{\lambda}{n}\right)^{\lfloor nt \rfloor} \to e^{-\lambda t}`,
    condition: 'نهاية بعد إعادة قياس الزمن: $p = \\lambda/n$ و$n \\to \\infty$.',
    detail:
      'الهندسي هو التوزيع الوحيد بلا ذاكرة على الأعداد الصحيحة الموجبة، والأسي هو نظيره المستمر على الأعداد الموجبة.',
  },
  {
    id: 'bin-norm',
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
];
