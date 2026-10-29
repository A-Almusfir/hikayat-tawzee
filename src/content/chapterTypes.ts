import type { DistId, NumericCheck } from './types';

/** جملة تاريخية لا بد أن تحمل مصدرًا واحدًا على الأقل. */
export interface Claim {
  text: string;
  src: string[];
  /** الجزء من القانون الذي تشرحه هذه الجملة (اختياري). */
  links?: string;
}

export interface Predict {
  prompt: string;
  options: { text: string; correct?: boolean; why: string }[];
}

export interface BuildStep {
  story: string;
  tex: string;
  /** رقم جزء القانون (1،2،3) الذي يظهر في هذه الخطوة. */
  part?: number;
  predict?: Predict;
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
  number: number;
  question: string;
  story: {
    headline: string;
    claims: Claim[];
    more: Claim[];
  };
  tryIt: { headline: string; prompt: string };
  build: { headline: string; steps: BuildStep[]; final: string; note: string };
  exam: { headline: string; problems: ExamProblem[]; tricks: string[] };
  anchor: {
    headline: string;
    hook: string;
    hookTex: string;
    recall: (Predict & { id: string; check?: NumericCheck })[];
    bridge: { to: DistId; text: string };
  };
}
