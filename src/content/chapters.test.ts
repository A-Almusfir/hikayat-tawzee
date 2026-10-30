import { describe, expect, it } from 'vitest';
import { binomial, chiSquare, fmt, normal, poisson, quantile, studentT } from '../lib/dist';
import { chapters } from './chapters';
import type { Chapter } from './chapterTypes';
import { edges } from './family';
import { horseKicks, horseKickTotals } from './horsekicks';
import { contrast, identity, journey, PAPER, tint } from './identity';
import { sheetById } from './sheet';
import { sourceById } from './sources';

const all = Object.values(chapters) as Chapter[];
const words = (s: string) => s.replace(/\$[^$]*\$/g, ' س ').split(/\s+/).filter(Boolean).length;

describe('المصادر', () => {
  it('كل جملة تاريخية تحمل مصدرًا معرّفًا في السجل', () => {
    for (const ch of all)
      for (const c of [...ch.story.claims, ...ch.story.more]) {
        expect(c.src.length).toBeGreaterThan(0);
        for (const s of c.src) expect(sourceById[s], `مصدر غير معرّف: ${s}`).toBeDefined();
      }
    for (const e of edges) for (const s of e.src ?? []) expect(sourceById[s]).toBeDefined();
  });
  it('الاستشهادات نصوص عادية بلا رموز رياضية خام', () => {
    for (const s of Object.values(sourceById)) expect(s.cite).not.toMatch(/[Σ^{}]|_\{/);
  });
});

describe('حدود الطول التي اتفق عليها المجلس', () => {
  it('الحكاية: أربع جمل على الأكثر، وأقل من 80 كلمة مع روابطها', () => {
    for (const ch of all) {
      expect(ch.story.claims.length).toBeLessThanOrEqual(4);
      const total = ch.story.claims.reduce((s, c) => s + words(c.text) + words(c.links ?? ''), 0);
      expect(total, `${ch.id}: ${total} كلمة`).toBeLessThan(80);
    }
  });
  it('توقّعان على الأكثر في «ابنِ القانون»، وكل خانات القانون تُكشف', () => {
    for (const ch of all) {
      expect(ch.build.steps.filter((s) => s.predict).length).toBeLessThanOrEqual(2);
      const rev = new Set(ch.build.steps.flatMap((s) => s.reveals ?? []));
      ch.build.law.slots.forEach((_, i) => expect(rev.has(i + 1)).toBe(true));
      expect((ch.build.law.template.match(/@\d/g) ?? []).length).toBe(ch.build.law.slots.length);
    }
  });
  it('«املأ القانون»: البطاقات تشمل كل خانة، ولكل خانة معنى', () => {
    for (const ch of all) {
      for (const s of ch.build.law.slots) expect(ch.anchor.compose.tiles).toContain(s);
      expect(ch.anchor.compose.meanings).toHaveLength(ch.build.law.slots.length);
      expect(ch.anchor.compose.tiles.length).toBeGreaterThan(ch.build.law.slots.length);
    }
  });
});

describe('بيانات ركلات الخيل', () => {
  it('200 فيلق-سنة، 122 وفاة، المتوسط 0.61، والتباين ≈ 0.61', () => {
    expect(horseKicks.observed.reduce((a, b) => a + b, 0)).toBe(200);
    expect(horseKickTotals.deaths).toBe(122);
    expect(horseKickTotals.mean).toBeCloseTo(0.61, 12);
    expect(horseKickTotals.variance).toBeCloseTo(0.6079, 4);
  });
  it('المتوقع وفق بواسون(0.61): 108.7، 66.3، 20.2، 4.1، 0.6', () => {
    const exp = [0, 1, 2, 3, 4].map((k) => 200 * poisson.pmf(k, 0.61));
    expect(exp.map((v) => fmt(v, 1))).toEqual(['108.7', '66.3', '20.2', '4.1', '0.6']);
  });
  it('أفضل λ في المختبر قريب من 0.61 فعلًا (أقل فرق كلي)', () => {
    const t = chapters.poisson!.tryIt;
    if (t.kind !== 'fit') throw new Error('expected fit');
    const N = 200;
    const diff = (l: number) => t.observed.reduce((s, o, k) => s + Math.abs(o - N * t.pmf(k, l)), 0) + N * (1 - t.cdf(t.observed.length - 1, l));
    let best = t.param.min;
    for (let l = t.param.min; l <= t.param.max; l += t.param.step) if (diff(l) < diff(best)) best = l;
    expect(Math.abs(best - t.param.best)).toBeLessThanOrEqual(0.02);
  });
});

describe('أرقام الفصل تطابق الحساب', () => {
  it('مسائل الاختبار وأسئلة الاسترجاع', () => {
    for (const ch of all) {
      for (const p of ch.exam.problems) {
        const c = p.check;
        expect(Math.abs(c.compute() - c.shown)).toBeLessThanOrEqual(0.5 * 10 ** -c.digits + 1e-12);
        expect(p.answer + p.steps.map((s) => (s.tex ?? []).join(' ')).join(' ')).toContain(c.shown.toFixed(c.digits));
      }
      for (const q of [...ch.anchor.recall, ...ch.build.steps.flatMap((s) => (s.predict ? [s.predict] : []))]) {
        expect(q.options.filter((o) => o.correct)).toHaveLength(1);
        const chk = (q as { check?: { shown: number; digits: number } }).check;
        if (chk) expect(q.options.find((o) => o.correct)!.text).toContain(fmt(chk.shown, chk.digits));
      }
    }
  });
  it('نهاية (1 − λ/n)^n تقترب من e^{−λ} كما يقول الفصل', () => {
    expect(Math.pow(1 - 0.61 / 1e6, 1e6)).toBeCloseTo(Math.exp(-0.61), 6);
    expect(Math.exp(-0.61)).toBeCloseTo(0.5434, 4);
  });
});

describe('الشجرة والهوية والرحلة', () => {
  it('الأسهم الست موجودة، والتقريبية منها تحمل شرطًا', () => {
    expect(edges.map((e) => e.id).sort()).toEqual(['bern-bin', 'bern-geo', 'bin-norm', 'bin-poi', 'geo-exp', 'poi-exp']);
    for (const e of edges) expect(e.condition.length).toBeGreaterThan(20);
  });
  it('كل فصل مسجل في الرحلة والعكس، ولكل فصل جسر وهوية وصف في ورقة القوانين', () => {
    for (const ch of all) expect(journey).toContain(ch.id);
    for (const id of journey) {
      expect(chapters[id], id).toBeDefined();
      expect(chapters[id]!.anchor.bridge.length, id).toBeGreaterThan(20);
      expect(identity[id], id).toBeDefined();
      expect(sheetById[id], id).toBeDefined();
    }
  });
  it('تباين ألوان الهوية ≥ 4.5:1 على الورق وعلى خلفية المشهد', () => {
    for (const { color } of Object.values(identity)) {
      expect(contrast(color, PAPER)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(color, tint(color, 0.16))).toBeGreaterThanOrEqual(4.5);
      expect(contrast('#ffffff', color)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('حدود الخلايا الفارغة ≥ 3:1 (عنصر غير نصي)', () => {
    expect(contrast('#968a74', PAPER)).toBeGreaterThanOrEqual(3);
  });
});

describe('قيم الجداول المذكورة في فصول المعاينة والتدريب', () => {
  it('مربع كاي وt من التراكمي نفسه', () => {
    const q = (cdf: (x: number) => number, p: number) => quantile(cdf, p, 0, 60);
    expect(fmt(q((x) => chiSquare.cdf(x, 1), 0.95), 3)).toBe('3.841');
    expect(fmt(q((x) => chiSquare.cdf(x, 9), 0.95), 3)).toBe('16.919');
    expect(fmt(q((x) => chiSquare.cdf(x, 5), 0.95), 2)).toBe('11.07');
    for (const [v, a, s] of [[9, 0.05, '1.833'], [15, 0.025, '2.131'], [9, 0.025, '2.262'], [8, 0.025, '2.306'], [24, 0.025, '2.064'], [5, 0.05, '2.015']] as const)
      expect(fmt(q((x) => studentT.cdf(x, v), 1 - a), 3), `t ${v} ${a}`).toBe(s);
    expect(fmt(1 - normal.cdf(2.015, 0, 1), 3)).toBe('0.022');
  });
});

describe('أرقام مذكورة في نصوص الفصول الجديدة', () => {
  it('الفصول المسجلة هي فصول الرحلة', () => {
    expect(Object.keys(chapters).sort()).toEqual([...journey].sort());
  });
  it('مسألة النقاط: 11 من 16 طريقًا، و2^4 = 16', () => {
    expect([2, 3, 4].reduce((s, k) => s + binomial.pmf(k, 4, 0.5) * 16, 0)).toBeCloseTo(11, 10);
  });
  it('8 أسئلة صح/خطأ: 37/256', () => {
    expect(1 - binomial.cdf(5, 8, 0.5)).toBeCloseTo(37 / 256, 12);
  });
  it('دي موافر: التقريب والقيمة الدقيقة لـ P(45 ≤ X ≤ 55) كلاهما ≈ 0.7287', () => {
    const exact = binomial.cdf(55, 100, 0.5) - binomial.cdf(44, 100, 0.5);
    expect(fmt(exact, 4)).toBe('0.7287');
    expect(fmt(normal.interval(44.5, 55.5, 50, 5), 4)).toBe('0.7287');
  });
  it('الروليت: (19/37)^10 ≈ 0.0013، و37/18 ≈ 2.06', () => {
    expect(fmt(Math.pow(19 / 37, 10), 4)).toBe('0.0013');
    expect(fmt(37 / 18, 2)).toBe('2.06');
  });
  it('الطبيعي: ضمن μ ± 2σ ≈ 0.9545', () => {
    expect(fmt(normal.interval(-2, 2, 0, 1), 4)).toBe('0.9545');
  });
});
