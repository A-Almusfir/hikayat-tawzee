// أنواع المحتوى. النصوص تدعم رياضيات داخلية بين $...$ وسطرية بين $$...$$.

export type DistId = 'bernoulli' | 'binomial' | 'geometric' | 'poisson' | 'exponential' | 'normal';

/** تحقق رقمي يُستخدم في الاختبارات الآلية لضمان اتساق الإجابة مع الحساب. */
export interface NumericCheck {
  compute: () => number;
  /** القيمة المعروضة في النص (مقرّبة). */
  shown: number;
  digits: number;
}

export interface FormulaPart {
  /** رقم الجزء كما يظهر تحت المعادلة. */
  n: number;
  tex: string;
  label: string;
  explain: string;
}

export interface QuizOption {
  text: string;
  correct?: boolean;
  why: string;
}

export interface QuizQuestion {
  id: string;
  kind: 'choose' | 'compute' | 'concept';
  prompt: string;
  options: QuizOption[];
  check?: NumericCheck;
}

export interface DistContent {
  id: DistId;
  nameAr: string;
  nameEn: string;
  /** الرمز المختصر مثل X \sim \mathrm{Bin}(n,p) */
  notation: string;
  type: 'discrete' | 'continuous';
  /** سؤال يمثل فكرة التوزيع (للصفحة الرئيسية). */
  question: string;
  story: {
    title: string;
    scene: string;
    experiment: string;
    variable: string;
    values: string;
    assumptions: string[];
    note?: string;
  };
  labIntro: string;
  formula: {
    fnName: string;
    tex: string;
    annotated: string;
    parts: FormulaPart[];
    intuition: string[];
    derivation: string[];
    derivationKind: 'proof' | 'intuition-only';
  };
  example: {
    title: string;
    given: string[];
    ask: string;
    defineX: string;
    why: string;
    substitute: string[];
    result: string;
    interpretation: string;
    check: NumericCheck;
  };
  card: {
    params: { tex: string; meaning: string }[];
    support: string;
    fnLabel: string;
    fnTex: string;
    mean: string;
    variance: string;
    conditions: string[];
    mistake: string;
  };
  quiz: QuizQuestion[];
}
