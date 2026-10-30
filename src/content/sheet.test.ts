import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { betaDist, betaFn, chiSquare, fisherF, gammaDist, gammaFn, hypergeometric, lgamma, quantile, studentT } from '../lib/dist';
import { sheet, sheetById, sheetFixes, symbols, type SheetRow } from './sheet';

// تكامل سمبسون المركّب على [a, b].
function simpson(f: (x: number) => number, a: number, b: number, n = 200000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

/** E[g(X)] عدديًا: جمع على المجال للمتقطعة، وتكامل للمستمرة. */
function expect_(row: SheetRow, g: (x: number) => number) {
  const p = row.ex;
  if (row.group === 'discrete') {
    let s = 0;
    for (let x = 0; x <= 400; x++) s += g(x) * row.pdf(x, p);
    return s;
  }
  const cuts = RANGE[row.id] ?? [-60, 60];
  let s = 0;
  for (let i = 0; i + 1 < cuts.length; i++) s += simpson((x) => g(x) * row.pdf(x, p), cuts[i], cuts[i + 1]);
  return s;
}

// نقاط تقسيم التكامل: تغطي الكتلة كلها وتبدأ من حد المجال الحقيقي، وتُقسَّم الذيول الطويلة (t وF) عن القمة.
const RANGE: Partial<Record<string, number[]>> = {
  uniform: [2, 5],
  exponential: [0, 60],
  gamma: [0, 80],
  chisquare: [0, 150],
  weibull: [0, 60],
  t: [-4000, -40, 40, 4000],
  beta: [0, 1],
  f: [0, 40, 6000],
};

const close = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b), `${a} ≠ ${b}`).toBeLessThanOrEqual(tol * Math.max(1, Math.abs(b)));

describe('دالتا غاما وبيتا', () => {
  it('Γ(5) = 24، Γ(½) = √π، B(2,3) = 1/12', () => {
    close(gammaFn(5), 24, 1e-12);
    close(gammaFn(0.5), Math.sqrt(Math.PI), 1e-12);
    close(betaFn(2, 3), 1 / 12, 1e-12);
    close(lgamma(101), 363.73937555556347, 1e-12);
  });
});

describe('ورقة القوانين', () => {
  it('كل صفوف الورقة: 5 متقطعة و10 مستمرة، وبرنولي إضافة', () => {
    expect(sheet.filter((s) => s.group === 'discrete' && !s.extra).map((s) => s.id)).toEqual(['binomial', 'negbin', 'geometric', 'poisson', 'hypergeometric']);
    expect(sheet.filter((s) => s.group === 'continuous').map((s) => s.id)).toEqual(['uniform', 'normal', 'stdnormal', 'exponential', 'gamma', 'chisquare', 'weibull', 't', 'beta', 'f']);
    expect(sheet.filter((s) => s.extra).map((s) => s.id)).toEqual(['bernoulli']);
  });

  for (const row of sheet) {
    describe(row.nameEn, () => {
      it('الكتلة الكلية = 1، والمتوسط والتباين يطابقان القانون', () => {
        close(expect_(row, () => 1), 1);
        const m = expect_(row, (x) => x);
        close(m, row.E(row.ex), 1e-5);
        close(expect_(row, (x) => (x - m) ** 2), row.V(row.ex), 1e-5);
      });

      if (row.mgf.kind === 'closed') {
        const mgf = row.mgf;
        it('الدالة المولدة = E[e^{tX}]، وM(0) = 1، وM′(0) = E، وM″(0) − M′(0)² = Var', () => {
          close(mgf.fn(0, row.ex), 1, 1e-12);
          for (const t of [-0.3, 0.2]) close(mgf.fn(t, row.ex), expect_(row, (x) => Math.exp(t * x)), 1e-6);
          const h = 1e-4;
          const d1 = (mgf.fn(h, row.ex) - mgf.fn(-h, row.ex)) / (2 * h);
          const H = 1e-3;
          const d2 = (mgf.fn(H, row.ex) - 2 * mgf.fn(0, row.ex) + mgf.fn(-H, row.ex)) / (H * H);
          close(d1, row.E(row.ex), 1e-6);
          close(d2 - d1 * d1, row.V(row.ex), 1e-4);
        });
      }

      if (row.cdf?.kind === 'closed') {
        const cdf = row.cdf;
        it('التراكمي المغلق = تكامل الكثافة', () => {
          const lo = (RANGE[row.id] ?? [-60])[0];
          for (const q of [0.25, 0.5, 0.75]) {
            // نقطة داخل الكتلة: المتوسط ± جزء من الانحراف المعياري
            const x = row.E(row.ex) + (q - 0.5) * 2 * Math.sqrt(row.V(row.ex));
            close(cdf.fn(x, row.ex), simpson((y) => row.pdf(y, row.ex), lo, x), 1e-6);
          }
        });
      }

      it('كل صيغه تُعرض في KaTeX', () => {
        const texs = [row.f, row.support, row.mean, row.variance];
        if (row.mgf.kind === 'closed') texs.push(row.mgf.tex);
        if (row.cdf?.kind === 'closed') texs.push(row.cdf.tex);
        const notes = [row.params, row.mgf.kind === 'closed' ? row.mgf.domain : row.mgf.note, row.cdf && row.cdf.kind !== 'closed' ? row.cdf.note : ''];
        for (const n of notes) for (const m of n.matchAll(/\$([^$]+?)\$/g)) texs.push(m[1]);
        for (const t of texs) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
      });
    });
  }

  it('الدالة المولدة: t وF غير موجودة، وفوق الهندسي وويبل وبيتا بلا صيغة بسيطة', () => {
    expect(['t', 'f'].map((id) => sheetById[id as 't'].mgf.kind)).toEqual(['none', 'none']);
    expect(['hypergeometric', 'weibull', 'beta'].map((id) => sheetById[id as 'beta'].mgf.kind)).toEqual(['no-closed-form', 'no-closed-form', 'no-closed-form']);
  });

  it('عمود بيتا في الورقة هو العزم E(X^r) = B(a+r,b)/B(a,b)', () => {
    const row = sheetById.beta;
    for (const k of [1, 2, 3]) close(betaDist.moment(k, 2.5, 4), expect_(row, (x) => x ** k), 1e-6);
  });

  it('مجال فوق الهندسي يبدأ من max(0, n − (N − k))', () => {
    expect(hypergeometric.support(20, 7, 15)).toEqual([2, 7]);
    expect(hypergeometric.pmf(1, 20, 7, 15)).toBe(0);
    expect(hypergeometric.pmf(2, 20, 7, 15)).toBeGreaterThan(0);
  });

  it('شروط الوجود: متوسط t عند v = 1 وتباين F عند v = 4 غير معرّفين', () => {
    expect(sheetById.t.E({ v: 1 })).toBeNaN();
    expect(sheetById.t.V({ v: 2 })).toBeNaN();
    expect(sheetById.f.E({ r: 3, v: 2 })).toBeNaN();
    expect(sheetById.f.V({ r: 3, v: 4 })).toBeNaN();
  });

  it('غاما بـ α صحيح: التراكمي = 1 − مجموع بواسون (كما في التنبيه)', () => {
    const al = 3, be = 2, x = 1.7;
    const g = sheetById.gamma;
    let poi = 0;
    for (let k = 0; k < al; k++) poi += (Math.exp(-be * x) * (be * x) ** k) / gammaFn(k + 1);
    close(1 - poi, simpson((y) => g.pdf(y, { al, be }), 0, x), 1e-8);
  });

  it('التنبيهات تخص صفوفًا موجودة، والقاموس والتنبيهات تُعرض في KaTeX', () => {
    for (const f of sheetFixes) for (const id of f.rows) expect(sheetById[id], f.id).toBeDefined();
    const texs = [...sheetFixes.map((f) => f.text), ...symbols.map((s) => s.meaning)].flatMap((t) => [...t.matchAll(/\$([^$]+?)\$/g)].map((m) => m[1]));
    texs.push(...symbols.map((s) => s.sym));
    for (const t of texs) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });
});

describe('التراكميات غير المغلقة: غاما وبيتا غير الكاملتين وقيم الجداول', () => {
  it('تطابق تكامل الكثافة', () => {
    close(gammaDist.cdf(1.7, 2.5, 1.5), simpson((y) => gammaDist.pdf(y, 2.5, 1.5), 0, 1.7), 1e-8);
    close(chiSquare.cdf(4.2, 5), simpson((y) => chiSquare.pdf(y, 5), 0, 4.2), 1e-8);
    close(betaDist.cdf(0.3, 2.5, 4), simpson((y) => betaDist.pdf(y, 2.5, 4), 0, 0.3), 1e-8);
    close(studentT.cdf(1.1, 8), 0.5 + simpson((y) => studentT.pdf(y, 8), 0, 1.1), 1e-8);
    close(studentT.cdf(-0.7, 8), 0.5 - simpson((y) => studentT.pdf(y, 8), 0, 0.7), 1e-8);
    close(fisherF.cdf(1.3, 6, 12), simpson((y) => fisherF.pdf(y, 6, 12), 0, 1.3), 1e-8);
    close(betaDist.cdf(0.5, 2, 3), 11 / 16, 1e-12);
  });
  it('قيم الجداول المعروفة', () => {
    // مربع كاي: 3.841 (v=1) و5.991 (v=2) و18.307 (v=10) عند 0.95
    close(chiSquare.cdf(3.841459, 1), 0.95, 1e-6);
    close(chiSquare.cdf(5.991465, 2), 0.95, 1e-6);
    close(chiSquare.cdf(18.307038, 10), 0.95, 1e-6);
    // t: 2.262 (v=9) و2.228 (v=10) و1.96 (v كبير) عند 0.975
    close(studentT.cdf(2.262157, 9), 0.975, 1e-6);
    close(studentT.cdf(2.228139, 10), 0.975, 1e-6);
    close(studentT.cdf(1.959964, 1e6), 0.975, 1e-5);
    // F(3, 10) عند 0.95: 3.708
    close(fisherF.cdf(3.708265, 3, 10), 0.95, 1e-6);
    close(quantile((x) => studentT.cdf(x, 9), 0.975, 0, 10), 2.262157, 1e-5);
  });
  it('علاقات: χ²(2) أسي بمعدل ½، وT² يتبع F(1, v)', () => {
    close(chiSquare.cdf(3, 2), 1 - Math.exp(-1.5), 1e-12);
    close(fisherF.cdf(2.5 ** 2, 1, 7), studentT.cdf(2.5, 7) - studentT.cdf(-2.5, 7), 1e-10);
  });
});
