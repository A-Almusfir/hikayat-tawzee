import { chiSquare, poisson } from '../lib/dist';

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

// مطابقة بواسون بمربع كاي (فصل مربع كاي).
/** الفئات بعد الدمج: 0، 1، 2 فأكثر (المتوقع في 3 و4 أقل من 5). */
export function chiFit(lambda: number) {
  const N = horseKicks.units, o = horseKicks.observed;
  const O = [o[0], o[1], o.slice(2).reduce((a, b) => a + b, 0)];
  const p0 = poisson.pmf(0, lambda), p1 = poisson.pmf(1, lambda);
  const E = [N * p0, N * p1, N * (1 - p0 - p1)];
  const parts = O.map((x, i) => (x - E[i]) ** 2 / E[i]);
  const stat = parts.reduce((a, b) => a + b, 0);
  return { O, E, parts, stat, p: 1 - chiSquare.cdf(stat, 1) };
}
export const CHI1_95 = 3.841;
