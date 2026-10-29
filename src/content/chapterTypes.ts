import type { DistId, NumericCheck } from './types';

/** جملة تاريخية لا بد أن تحمل مصدرًا واحدًا على الأقل. */
export interface Claim {
  text: string;
  src: string[];
  /** الجزء من القانون الذي تشرحه هذه الجملة (اختياري). */
  links?: string;
}

export interface Choice {
  prompt: string;
  options: { text: string; correct?: boolean; why: string }[];
}

/** رسم الحكاية يُولَّد من البيانات، ويكون هو نفسه رمز هوية التوزيع. */
export type Art = {
  kind: 'unit-grid';
  /** counts[k] = عدد الوحدات التي وقع فيها k حدث */
  counts: number[];
  cols: number;
  ariaLabel: string;
  caption: string;
};

/** المشهد ②: إما مطابقة القانون على بيانات حقيقية، أو المختبر التفاعلي المبسّط. */
export type TryIt =
  | {
      kind: 'fit';
      headline: string;
      prompt: string;
      observed: number[];
      pmf: (k: number, theta: number) => number;
      cdf: (k: number, theta: number) => number;
      param: { symbol: string; label: string; min: number; max: number; step: number; start: number; best: number };
      xLabel: string;
      unitLabel: string;
      reveal: string;
      revealButton: string;
    }
  | { kind: 'lab'; headline: string; prompt: string };

export interface BuildStep {
  story: string;
  tex: string[];
  predict?: Choice;
  /** أرقام خانات القانون التي تمتلئ بعد هذه الخطوة. */
  reveals?: number[];
}

/**
 * قالب القانون: الخانات تُكتب @1 و@2 … وتُستبدل بمحتوى slots (مرقّمًا من 1).
 * مثال: 'P(X=k) = @1 \cdot \frac{@2}{@3}'
 */
export interface LawTemplate {
  template: string;
  slots: string[];
  range?: string;
}

export interface ExamProblem {
  label: string;
  given: string;
  steps: { title: string; body: string; tex?: string[] }[];
  answer: string;
  check: NumericCheck;
}

export interface Chapter {
  id: DistId;
  question: string;
  story: { headline: string; art: Art; claims: Claim[]; more: Claim[] };
  tryIt: TryIt;
  build: { headline: string; law: LawTemplate; steps: BuildStep[]; note: string };
  exam: { headline: string; problems: ExamProblem[]; tricks: string[] };
  anchor: {
    headline: string;
    hook: string;
    hookTex: string;
    hookNote?: string;
    /** «املأ القانون»: بطاقات يختار منها الطالب لكل خانة (تشمل الصحيحة ومشتّتات). */
    compose: {
      tiles: string[];
      meanings: string[];
      /** خانات يمكن تبادل محتواها دون تغيير القانون (مثل عاملي ضرب في البسط). */
      interchangeable?: number[][];
    };
    recall: (Choice & { id: string; check?: NumericCheck })[];
    bridge: string;
  };
  reference: { labTitle: string };
}
