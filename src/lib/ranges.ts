// نطاقات المنزلقات. اختيرت لتجنّب الحالات غير المعرّفة (مثل p = 0 في الهندسي أو σ = 0)
// ولتبقى الرسوم مقروءة على شاشة الجوال.
export const RANGES = {
  bernoulliP: { min: 0.05, max: 0.95, step: 0.05 },
  binomialN: { min: 1, max: 30, step: 1 },
  binomialP: { min: 0.05, max: 0.95, step: 0.05 },
  geometricP: { min: 0.1, max: 0.9, step: 0.05 },
  poissonRate: { min: 0.5, max: 5, step: 0.5 },
  poissonT: { min: 0.5, max: 3, step: 0.5 },
  expLambda: { min: 0.5, max: 6, step: 0.5 },
  normalMu: { min: 480, max: 520, step: 1 },
  normalSigma: { min: 1, max: 12, step: 0.5 },
} as const;

/** حد أقصى لعدد العينات في كل ضغطة محاكاة. */
export const SIM_BATCH = 500;
export const SIM_MAX = 5000;
