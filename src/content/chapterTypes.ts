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

/** رسم الحكاية يُولَّد من البيانات أو من القانون، ويكون هو نفسه رمز هوية التوزيع. */
type ArtBase = { ariaLabel: string; caption: string };
export type Art = ArtBase &
  (
    | { kind: 'unit-grid'; counts: number[]; cols: number } // counts[k] = عدد الوحدات التي وقع فيها k حدث
    | { kind: 'urn'; white: number; black: number; cols: number }
    | { kind: 'cups'; milk: number; tea: number }
    | { kind: 'runs'; trials: number[]; r: number } // 1 = فوز، 0 = خسارة؛ آخر عنصر هو الفوز رقم r
    | { kind: 'pascal'; rows: number; highlightFrom: number } // يُبرز في الصف الأخير المعاملات من الموضع highlightFrom
    | { kind: 'timeline'; times: number[]; span: number; unit: string }
    | { kind: 'streak'; length: number }
    | { kind: 'galton'; rows: number }
  );

/** المشهد ②: أداة تحكم واحدة. النوع يحدد التجربة، والمحتوى يحدد معلماتها. */
type TryBase = { headline: string; prompt: string };
export type TryIt = TryBase &
  (
    | {
        kind: 'fit';
        observed: number[];
        pmf: (k: number, theta: number) => number;
        cdf: (k: number, theta: number) => number;
        param: { symbol: string; label: string; min: number; max: number; step: number; start: number; best: number };
        xLabel: string;
        unitLabel: string;
        reveal: string;
        revealButton: string;
      }
    | { kind: 'lln'; p: number; successLabel: string; reveal: string }
    | { kind: 'points'; aNeeds: number; bMin: number; bMax: number; bStart: number }
    | { kind: 'waits'; theta: { min: number; max: number; step: number; start: number }; unit: string; rateUnit: string }
    | { kind: 'memory'; p: number; maxStreak: number; failLabel: string; successLabel: string }
    | { kind: 'galton'; rows: { min: number; max: number; start: number }; balls: number }
    | { kind: 'lab' }
  );

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
