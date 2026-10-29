import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { fmt } from '../lib/dist';
import { derive, identify, mgfRules, type Target } from './mgf';
import { sheetById } from './sheet';

const close = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const TS = [-0.1, 0.05, 0.1];

describe('اشتق: كل خيار صحيح يطابق مشتقة دالة الورقة، وكل مشتّت يختلف عنها', () => {
  for (const item of derive) {
    const row = sheetById[item.dist];
    const p = row.ex;
    if (row.mgf.kind !== 'closed') throw new Error(item.id);
    const M = row.mgf.fn;
    const d = (f: (t: number) => number) => (t: number) => (f(t + 1e-5) - f(t - 1e-5)) / 2e-5;
    const fnTarget: Partial<Record<Target, (t: number) => number>> = {
      M1: d((t) => M(t, p)),
      R1: d((t) => Math.log(M(t, p))),
    };
    const E = row.E(p), V = row.V(p);
    const valTarget: Partial<Record<Target, number>> = { E, V, EX2: V + E * E };

    item.steps.forEach((s, k) => {
      it(`${item.id} خطوة ${k + 1} (${s.target})`, () => {
        expect(s.options.filter((o) => o.correct)).toHaveLength(1);
        for (const o of s.options) {
          expect(o.why.length, o.text).toBeGreaterThan(5);
          let ok: boolean;
          if (s.target === 'M1' || s.target === 'R1') {
            expect(o.fn, o.text).toBeDefined();
            ok = TS.every((t) => close(o.fn!(t, p), fnTarget[s.target]!(t), 1e-5));
          } else {
            expect(o.value, o.text).toBeDefined();
            ok = close(o.value!(p), valTarget[s.target]!, 1e-9);
          }
          expect(ok, `${item.id}: ${o.text}`).toBe(!!o.correct);
        }
      });
    });

    it(`${item.id}: آخر خطوة تعطي التباين، وقبلها المتوسط`, () => {
      expect(item.steps[item.steps.length - 1].target).toBe('V');
      expect(item.steps.some((s) => s.target === 'E')).toBe(true);
    });
  }
});

describe('تعرّف على التوزيع من M(t)', () => {
  for (const it_ of identify) {
    const row = sheetById[it_.answer];
    it(`${it_.id}: الدالة المعطاة = دالة الورقة عند المعلمات الصحيحة`, () => {
      if (row.mgf.kind !== 'closed') throw new Error(it_.id);
      for (const t of [-0.2, 0.1, 0.15]) expect(close(it_.mgf(t), row.mgf.fn(t, it_.params), 1e-12), `${it_.id} t=${t}`).toBe(true);
    });
    it(`${it_.id}: خيار صحيح واحد في كل خطوة، والمعلمات الخاطئة تعطي دالة مختلفة`, () => {
      for (const q of [it_.which, it_.param, it_.calc]) {
        expect(q.options.filter((o) => o.correct)).toHaveLength(1);
        for (const o of q.options) expect(o.why.length).toBeGreaterThan(3);
      }
      if (row.mgf.kind !== 'closed') throw new Error(it_.id);
      const mgf = row.mgf.fn;
      for (const o of it_.param.options) {
        expect(o.p, o.text).toBeDefined();
        const same = [-0.2, 0.1].every((t) => close(mgf(t, o.p!), it_.mgf(t), 1e-9));
        expect(same, o.text).toBe(!!o.correct);
      }
    });
    it(`${it_.id}: الحساب يطابق عزم الورقة، ويظهر في الخيار الصحيح`, () => {
      const c = it_.calc.check;
      const E = row.E(it_.params), V = row.V(it_.params);
      const truth = it_.calc.of === 'E' ? E : it_.calc.of === 'V' ? V : V + E * E;
      expect(close(c.compute(), truth, 1e-9)).toBe(true);
      expect(Math.abs(c.compute() - c.shown)).toBeLessThanOrEqual(0.5 * 10 ** -c.digits + 1e-12);
      expect(it_.calc.options.find((o) => o.correct)!.text).toContain(fmt(c.shown, c.digits));
    });
  }
  it('تسع مسائل على الأقل، ولا تذكر اسم التوزيع في نصها', () => {
    expect(identify.length).toBeGreaterThanOrEqual(9);
    for (const x of identify) expect(x.text, x.id).not.toMatch(/بواسون|ذو الحدين|ذي الحدين|الأسي|الهندسي|الطبيعي|غاما|كاي|المنتظم/);
  });
});

describe('KaTeX في صفحة الدالة المولدة', () => {
  it('كل معادلة تُعرض دون خطأ', () => {
    const texts: string[] = [];
    for (const r of mgfRules) texts.push(r.text, r.tex ? `$${r.tex}$` : '');
    for (const d of derive) {
      texts.push(`$${d.given}$`, d.setup ?? '');
      for (const s of d.steps) texts.push(s.prompt, ...s.options.flatMap((o) => [o.text, o.why]));
    }
    for (const x of identify) for (const q of [x.which, x.param, x.calc]) texts.push(x.text, q.prompt, ...q.options.flatMap((o) => [o.text, o.why]));
    const all = texts.flatMap((t) => [...t.matchAll(/\$([^$]+?)\$/g)].map((m) => m[1]));
    expect(all.length).toBeGreaterThan(150);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });
});
