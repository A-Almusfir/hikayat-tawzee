import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { moreCards } from './more';
import { sheetById } from './sheet';
import { sourceById } from './sources';

describe('توزيعات أخرى', () => {
  it('ويبل وبيتا وF، ولكل منها صف في الورقة ومصدر معرّف', () => {
    expect(moreCards.map((c) => c.id)).toEqual(['weibull', 'beta', 'f']);
    for (const c of moreCards) {
      expect(sheetById[c.id]).toBeDefined();
      for (const s of c.history.src) expect(sourceById[s], s).toBeDefined();
    }
  });
  it('المثال المحلول: القيمة المعروضة = الحساب، وتظهر في الجواب أو الخطوات', () => {
    for (const c of moreCards) {
      const k = c.example.check;
      expect(Math.abs(k.compute() - k.shown), c.id).toBeLessThanOrEqual(0.5 * 10 ** -k.digits + 1e-12);
      const all = c.example.answer + c.example.steps.map((s) => (s.tex ?? []).join(' ')).join(' ');
      expect(all, c.id).toContain(k.shown.toFixed(k.digits));
    }
  });
  it('الكثافة موجبة ومحدودة على مجال العرض عند المعلمات الابتدائية', () => {
    for (const c of moreCards) {
      const p = c.toParams(Object.fromEntries(c.sliders.map((x) => [x.key, x.start])));
      const xMax = c.xMax(p);
      expect(xMax, c.id).toBeGreaterThan(0);
      for (let i = 1; i < 50; i++) {
        const y = c.pdf((xMax * i) / 50, p);
        expect(Number.isFinite(y) && y >= 0, `${c.id} ${i}`).toBe(true);
      }
    }
  });
  it('كل الرياضيات تُعرض في KaTeX', () => {
    const texts = moreCards.flatMap((c) => [c.where, c.relation, c.history.text, c.example.given, c.example.answer, ...c.example.steps.map((s) => s.body)]);
    const tex = [...texts.flatMap((t) => [...t.matchAll(/\$([^$]+?)\$/g)].map((m) => m[1])), ...moreCards.flatMap((c) => c.example.steps.flatMap((s) => s.tex ?? []))];
    for (const t of tex) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });
});
