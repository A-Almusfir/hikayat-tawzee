// بيانات بورتكيفيتش (1898) بالصيغة الشائعة: 10 فيالق × 20 سنة (1875–1894) = 200 فيلق-سنة،
// بعد استبعاد الفيالق G وI وVI وXI. البيانات الكاملة 14 فيلقًا (280 فيلق-سنة).
// المصادر: horsekicks-cran، ddpm-edeath، bortkiewicz-york.
export const horseKicks = {
  units: 200,
  observed: [109, 65, 22, 3, 1] as const, // عدد الفيالق-السنوات التي وقعت فيها k وفاة، k = 0..4
};

export const horseKickTotals = (() => {
  const o = horseKicks.observed;
  const deaths = o.reduce((s, n, k) => s + n * k, 0);
  const mean = deaths / horseKicks.units;
  const ex2 = o.reduce((s, n, k) => s + n * k * k, 0) / horseKicks.units;
  return { deaths, mean, variance: ex2 - mean * mean };
})();
