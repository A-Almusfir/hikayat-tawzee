import { describe, expect, it } from 'vitest';
import { fmt } from '../lib/dist';
import { leaves } from './decision';
import { drill } from './drill';
import { journey } from './identity';
import { twins } from './twins';

describe('مخطط القرار', () => {
  it('يصل إلى التوزيعات الستة، كل منها مرة واحدة، وإلى «ليس من الستة» حين لا يتطابق الموقف', () => {
    const ls = leaves();
    expect(ls.filter((l) => l !== 'insufficient').sort()).toEqual([...journey].sort());
    expect(ls.filter((l) => l === 'insufficient').length).toBeGreaterThanOrEqual(2);
  });
});

describe('التدريب المختلط', () => {
  it('ثلاث مسائل على الأقل لكل توزيع، وفيها «الشروط غير كافية»، ولا تذكر اسم التوزيع في نصها', () => {
    for (const d of journey) expect(drill.filter((x) => x.answer === d).length, d).toBeGreaterThanOrEqual(3);
    for (const x of drill) expect(x.text, x.id).not.toMatch(/برنولي|ذو الحدين|ذي الحدين|بواسون|الأسي|الهندسي|الطبيعي|N\(/);
    expect(drill.some((x) => x.answer === 'insufficient')).toBe(true);
  });
  it('أقرب فخ يختلف عن الإجابة، ولكل خيار تفسير', () => {
    for (const d of drill) {
      expect(d.trap).not.toBe(d.answer);
      expect(d.trapWhy.length).toBeGreaterThan(10);
      for (const q of [d.param, d.calc]) if (q) {
        expect(q.options.filter((o) => o.correct)).toHaveLength(1);
        for (const o of q.options) expect(o.why.length).toBeGreaterThan(3);
      }
      // إما خطوتان بعد الأولى، أو لا شيء (مسألة الشروط غير الكافية)
      expect(!!d.param).toBe(!!d.calc);
      expect(d.answer === 'insufficient').toBe(!d.param);
    }
  });
  it('الحساب: القيمة المعروضة = الحساب، وتظهر في نص الإجابة الصحيحة', () => {
    for (const d of drill) if (d.calc) {
      const c = d.calc.check;
      expect(Math.abs(c.compute() - c.shown), d.id).toBeLessThanOrEqual(0.5 * 10 ** -c.digits + 1e-12);
      expect(d.calc.options.find((o) => o.correct)!.text, d.id).toContain(fmt(c.shown, c.digits));
    }
  });
});

describe('التوائم', () => {
  it('الأزواج الأربعة المتفق عليها', () => {
    expect(twins.map((t) => `${t.a}|${t.b}`)).toEqual(['bernoulli|binomial', 'binomial|geometric', 'poisson|exponential', 'geometric|exponential']);
  });
});
