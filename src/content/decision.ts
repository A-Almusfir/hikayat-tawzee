import type { DistId } from './types';

export type Leaf = DistId | 'insufficient';

/** وصف من سطر لكل توزيع: يُستخدم في مخطط القرار وفي تفسير الخيارات الخاطئة في التدريب. */
export const hint: Record<Leaf, string> = {
  bernoulli: 'محاولة واحدة بنتيجتين.',
  binomial: 'عدد ثابت $n$ من المحاولات المستقلة باحتمال ثابت $p$، ونعدّ النجاحات.',
  geometric: 'نكرر محاولات مستقلة حتى أول نجاح، ونعدّ المحاولات.',
  poisson: 'نعدّ أحداثًا في فترة (زمن أو مساحة) بمعدل ثابت، بلا عدد محاولات محدد.',
  exponential: 'زمن انتظار مستمر حتى الحدث التالي في عملية بمعدل ثابت.',
  normal: 'قياس مستمر جرسي متماثل حول متوسط تدعمه البيانات. ويُستعمل أيضًا تقريبًا حسابيًا لذي الحدين (إذا كان $np$ و$n(1-p)$ كبيرين، مع تصحيح الاتصال) أو لمجموع متغيرات مستقلة كثيرة.',
  insufficient: 'الشروط مكسورة (مثل سحب دون إرجاع من مجموعة صغيرة، أو معدل يتغير) أو الموقف خارج الستة، فلا يصلح أي منها دون تعديل.',
};

export interface DecisionNode {
  id: string;
  q: string;
  yes: { label: string; next: DecisionNode | Leaf };
  no: { label: string; next: DecisionNode | Leaf };
}

// مخطط القرار: أسئلة عن بنية الموقف، لا عن كلمات مفتاحية.
export const decisionTree: DecisionNode = {
  id: 'cont',
  q: 'هل المتغير قياس مستمر (زمن، طول، وزن…)؟',
  yes: {
    label: 'مستمر',
    next: {
      id: 'wait',
      q: 'هل هو زمن انتظار حتى الحدث التالي، والأحداث تقع بمعدل ثابت؟',
      yes: { label: 'نعم', next: 'exponential' },
      no: {
        label: 'لا',
        next: {
          id: 'bell',
          q: 'هل المعطى، أو البيانات، جرسي متماثل حول متوسط؟',
          yes: { label: 'نعم', next: 'normal' },
          no: { label: 'لا: ليس من الستة، تحقّق من البيانات', next: 'insufficient' },
        },
      },
    },
  },
  no: {
    label: 'عدّ (0، 1، 2، …)',
    next: {
      id: 'fixedn',
      q: 'هل عدد المحاولات $n$ محدد مسبقًا؟',
      yes: {
        label: 'نعم',
        next: {
          id: 'one',
          q: 'هل هي محاولة واحدة فقط ($n = 1$)؟',
          yes: { label: 'نعم', next: 'bernoulli' },
          no: { label: 'لا، $n$ محاولات مستقلة باحتمال ثابت', next: 'binomial' },
        },
      },
      no: {
        label: 'لا',
        next: {
          id: 'first',
          q: 'هل نكرر حتى أول نجاح ونعدّ المحاولات؟',
          yes: { label: 'نعم', next: 'geometric' },
          no: {
            label: 'لا',
            next: {
              id: 'rate',
              q: 'هل نعدّ أحداثًا في فترة (زمن أو مساحة) بمعدل ثابت؟',
              yes: { label: 'نعم', next: 'poisson' },
              no: { label: 'لا: ليس من الستة (مثل العدّ حتى النجاح الثالث)', next: 'insufficient' },
            },
          },
        },
      },
    },
  },
};

export const decisionNote = 'وفي كل فرع: تحقّق من الشروط (الاستقلال، ثبات الاحتمال أو المعدل). إن كانت مكسورة فالجواب «المعطيات أو الشروط غير كافية».';

/** كل الأوراق التي يصل إليها المخطط (للاختبارات). */
export function leaves(n: DecisionNode | Leaf = decisionTree): Leaf[] {
  if (typeof n === 'string') return [n];
  return [...leaves(n.yes.next), ...leaves(n.no.next)];
}
