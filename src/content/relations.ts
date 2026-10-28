import type { DistId } from './types';

export interface Relation {
  id: string;
  from: DistId;
  to: DistId;
  label: string;
  summary: string;
  tex: string;
  example: string;
  condition: string;
}

// علاقات دقيقة فقط (ليست تقريبات). التقريبات مؤجلة لأنها تحتاج شروطًا تفصيلية.
export const relations: Relation[] = [
  {
    id: 'bern-bin',
    from: 'bernoulli',
    to: 'binomial',
    label: 'جمع',
    summary: 'مجموع $n$ متغيرات برنولي مستقلة لها $p$ نفسه يتبع ذا الحدين.',
    tex: String.raw`Y_1,\dots,Y_n \overset{\text{iid}}{\sim} \mathrm{Bernoulli}(p) \;\Rightarrow\; X = \sum_{i=1}^{n} Y_i \sim \mathrm{Bin}(n,p)`,
    example:
      'كل سؤال يخمّنه الطالب متغير برنولي ($1$ للصواب) باحتمال $0.25$. عدد الإجابات الصحيحة في 10 أسئلة هو مجموعها: $\\mathrm{Bin}(10, 0.25)$، ومتوسطه $10 \\times 0.25 = 2.5$.',
    condition: 'الاستقلال وثبات $p$ في كل المحاولات.',
  },
  {
    id: 'bern-geo',
    from: 'bernoulli',
    to: 'geometric',
    label: 'تكرار حتى أول نجاح',
    summary: 'نكرر محاولات برنولي مستقلة حتى أول $1$، ونعدّ المحاولات (بما فيها الناجحة).',
    tex: String.raw`X = \min\{\,i : Y_i = 1\,\} \sim \mathrm{Geom}(p)`,
    example:
      'كل رمية نرد محاولة برنولي («6» نجاح، $p = 1/6$). رقم الرمية التي يظهر فيها أول 6 يتبع $\\mathrm{Geom}(1/6)$، ومتوسطه 6 رميات.',
    condition: 'الاستقلال وثبات $p$، وتسلسل محاولات غير محدود مسبقًا.',
  },
  {
    id: 'poi-exp',
    from: 'poisson',
    to: 'exponential',
    label: 'عدّ ↔ انتظار',
    summary: 'في عملية بواسون متجانسة بمعدل $\\lambda$: عدد الأحداث في زمن $t$ يتبع بواسون بمتوسط $\\lambda t$، وزمن الانتظار حتى الحدث التالي يتبع الأسي بمعدل $\\lambda$.',
    tex: String.raw`P(T > t) = P\big(N(t) = 0\big) = e^{-\lambda t}`,
    example:
      'طلبات بمعدل 3 في الساعة. «لا طلب خلال نصف ساعة» سؤال بواسوني: $P(N(0.5) = 0) = e^{-1.5}$. وهو نفسه سؤال أسي: $P(T > 0.5) = e^{-1.5} \\approx 0.2231$.',
    condition: 'عملية بواسون متجانسة: معدل ثابت، استقلال الفترات غير المتداخلة، أحداث منفردة.',
  },
];
