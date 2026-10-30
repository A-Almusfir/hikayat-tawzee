import type { DistId } from './types';

export type Leaf = DistId | 'insufficient';

/** وصف من سطر لكل توزيع: يُستخدم في مخطط القرار وفي تفسير الخيارات الخاطئة في التدريب. */
export const hint: Record<Leaf, string> = {
  bernoulli: 'محاولة واحدة بنتيجتين.',
  binomial: 'عدد ثابت $n$ من المحاولات المستقلة باحتمال ثابت $p$، ونعدّ النجاحات.',
  hypergeometric: 'نسحب $n$ دون إرجاع من مجتمع محدود فيه $k$ «نجاحًا»، ونعدّ النجاحات المسحوبة.',
  geometric: 'نكرر محاولات مستقلة حتى أول نجاح، ونعدّ المحاولات.',
  negbin: 'نكرر محاولات مستقلة حتى النجاح رقم $r$، ونعدّ المحاولات.',
  poisson: 'نعدّ أحداثًا في فترة (زمن أو مساحة) بمعدل ثابت، بلا عدد محاولات محدد.',
  exponential: 'زمن انتظار مستمر حتى الحدث التالي في عملية بمعدل ثابت.',
  gamma: 'زمن انتظار مستمر حتى الحدث رقم $\\alpha$ في عملية بمعدل ثابت (مجموع $\\alpha$ زمن انتظار أسي مستقل).',
  normal: 'قياس مستمر جرسي متماثل حول متوسط تدعمه البيانات. ويُستعمل أيضًا تقريبًا حسابيًا لذي الحدين (إذا كان $np$ و$n(1-p)$ كبيرين، مع تصحيح الاتصال) أو لمجموع متغيرات مستقلة كثيرة. ومتوسط عينة من مجتمع طبيعي حين $\\sigma$ **معلوم** طبيعي أيضًا.',
  uniform: 'قياس مستمر في فترة محددة $(a, b)$، وكل أجزائها المتساوية الطول متساوية الاحتمال.',
  chisquare: 'مجموع مربعات متغيرات طبيعية معيارية مستقلة، ومنه $\\frac{(n-1)S^{2}}{\\sigma^{2}}$ واختبار المطابقة $\\sum \\frac{(O-E)^{2}}{E}$.',
  t: 'متوسط عينة من مجتمع طبيعي حين $\\sigma$ مجهول ونستعمل $S$: $\\frac{\\bar{X} - \\mu}{S/\\sqrt{n}}$.',
  insufficient: 'الشروط مكسورة (مثل معدل يتغير، أو محاولات يؤثر بعضها في بعض) أو الموقف خارج التوزيعات المغطاة، فلا يصلح أي منها دون تعديل.',
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
      q: 'هل هو زمن انتظار، والأحداث تقع بمعدل ثابت؟',
      yes: {
        label: 'نعم',
        next: {
          id: 'firstev',
          q: 'هل ننتظر الحدث التالي (الأول) فقط؟',
          yes: { label: 'نعم', next: 'exponential' },
          no: { label: 'لا، حتى الحدث رقم $\\alpha$', next: 'gamma' },
        },
      },
      no: {
        label: 'لا',
        next: {
          id: 'stat',
          q: 'هل هو إحصاءة اختبار تستعمل $S$ أو $S^{2}$ مكان $\\sigma$ (والمجتمع طبيعي)، أو تقارن تكرارات مشاهدة بمتوقعة؟',
          yes: {
            label: 'نعم',
            next: {
              id: 'which-stat',
              q: 'هل هي تباين أو مطابقة تكرارات، أم متوسط عينة و$\\sigma$ مجهول؟',
              yes: { label: 'تباين $S^{2}$، أو مطابقة $\\sum \\frac{(O-E)^{2}}{E}$', next: 'chisquare' },
              no: { label: 'متوسط بـ $S$ مكان $\\sigma$', next: 't' },
            },
          },
          no: {
            label: 'لا',
            next: {
              id: 'flat',
              q: 'هل القيم في فترة محددة، وكل أجزائها المتساوية متساوية الاحتمال؟',
              yes: { label: 'نعم', next: 'uniform' },
              no: {
                label: 'لا',
                next: {
                  id: 'bell',
          q: 'هل المعطى، أو البيانات، جرسي متماثل حول متوسط؟',
                  yes: { label: 'نعم', next: 'normal' },
                  no: { label: 'لا: ليس مما سبق، تحقّق من البيانات', next: 'insufficient' },
                },
              },
            },
          },
        },
      },
    },
  },
  no: {
    label: 'عدّ (0، 1، 2، …)',
    next: {
      id: 'fixedn',
      q: 'هل عدد المحاولات (أو السحبات) $n$ محدد مسبقًا؟',
      yes: {
        label: 'نعم',
        next: {
          id: 'norepl',
          q: 'هل نسحب **دون إرجاع** من مجتمع محدود معروف التركيب؟',
          yes: { label: 'نعم', next: 'hypergeometric' },
          no: {
            label: 'لا، المحاولات مستقلة',
            next: {
              id: 'one',
              q: 'هل هي محاولة واحدة فقط ($n = 1$)؟',
              yes: { label: 'نعم', next: 'bernoulli' },
              no: { label: 'لا، $n$ محاولات مستقلة باحتمال ثابت', next: 'binomial' },
            },
          },
        },
      },
      no: {
        label: 'لا',
        next: {
          id: 'until',
          q: 'هل نكرر محاولات مستقلة حتى نجاح، ونعدّ المحاولات؟',
          yes: {
            label: 'نعم',
            next: {
              id: 'first',
              q: 'حتى أول نجاح؟',
              yes: { label: 'نعم', next: 'geometric' },
              no: { label: 'لا، حتى النجاح رقم $r$', next: 'negbin' },
            },
          },
          no: {
            label: 'لا',
            next: {
              id: 'rate',
              q: 'هل نعدّ أحداثًا في فترة (زمن أو مساحة) بمعدل ثابت؟',
              yes: { label: 'نعم', next: 'poisson' },
              no: { label: 'لا: ليس مما سبق', next: 'insufficient' },
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
