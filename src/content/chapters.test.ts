import { describe, expect, it } from 'vitest';
import { fmt, poisson } from '../lib/dist';
import { poissonChapter } from './chapters/poisson';
import { edges } from './family';
import { horseKicks, horseKickTotals } from './horsekicks';
import { contrast, identity, PAPER, tint } from './identity';
import { sourceById } from './sources';

const chapters = [poissonChapter];

describe('المصادر', () => {
  it('كل جملة تاريخية تحمل مصدرًا معرّفًا في السجل', () => {
    for (const ch of chapters)
      for (const c of [...ch.story.claims, ...ch.story.more]) {
        expect(c.src.length).toBeGreaterThan(0);
        for (const s of c.src) expect(sourceById[s], `مصدر غير معرّف: ${s}`).toBeDefined();
      }
    for (const e of edges) for (const s of e.src ?? []) expect(sourceById[s]).toBeDefined();
  });
  it('الحكاية لا تتجاوز أربع جمل أساسية', () => {
    for (const ch of chapters) expect(ch.story.claims.length).toBeLessThanOrEqual(4);
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
});

describe('أرقام الفصل تطابق الحساب', () => {
  it('مسائل الاختبار وأسئلة الاسترجاع', () => {
    for (const ch of chapters) {
      for (const p of ch.exam.problems) {
        const c = p.check;
        expect(Math.abs(c.compute() - c.shown)).toBeLessThanOrEqual(0.5 * 10 ** -c.digits + 1e-12);
        expect(p.answer + p.steps.map((s) => (s.tex ?? []).join(' ')).join(' ')).toContain(c.shown.toFixed(c.digits));
      }
      for (const q of ch.anchor.recall) {
        expect(q.options.filter((o) => o.correct)).toHaveLength(1);
        if (q.check) expect(q.options.find((o) => o.correct)!.text).toContain(fmt(q.check.shown, q.check.digits));
      }
      for (const s of ch.build.steps) if (s.predict) expect(s.predict.options.filter((o) => o.correct)).toHaveLength(1);
    }
  });
  it('نهاية (1 − λ/n)^n تقترب من e^{−λ} كما يقول الفصل', () => {
    const l = 0.61;
    expect(Math.pow(1 - l / 1e6, 1e6)).toBeCloseTo(Math.exp(-l), 6);
    expect(Math.exp(-l)).toBeCloseTo(0.5434, 4);
    expect(109 / 200).toBeCloseTo(0.545, 3);
  });
});

describe('الشجرة والهوية', () => {
  it('الأسهم التقريبية تحمل شرطًا، والعلاقات الست موجودة', () => {
    expect(edges.map((e) => e.id).sort()).toEqual(['bern-bin', 'bern-geo', 'bin-norm', 'bin-poi', 'geo-exp', 'poi-exp']);
    for (const e of edges) expect(e.condition.length).toBeGreaterThan(20);
  });
  it('تباين ألوان الهوية ≥ 4.5:1 على الورق وعلى خلفية المشهد', () => {
    for (const { color } of Object.values(identity)) {
      expect(contrast(color, PAPER)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(color, tint(color, 0.16))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
