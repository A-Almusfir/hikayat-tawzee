import { describe, expect, it } from 'vitest';
import { displayOrder, parseNumber } from './shuffle';
import { chapters } from '../content/chapters';
import { distributions } from '../content/distributions';
import { drill } from '../content/drill';

describe('ترتيب الخيارات', () => {
  it('ثابت للمعرّف نفسه، وتبديل حقيقي للعناصر', () => {
    expect(displayOrder('x', 4)).toEqual(displayOrder('x', 4));
    expect([...displayOrder('x', 4)].sort()).toEqual([0, 1, 2, 3]);
  });
  it('الإجابة الصحيحة ليست أول خيار معروض في أغلب الأسئلة، ومواضعها متنوعة', () => {
    const qs: { id: string; options: { correct?: boolean }[] }[] = [];
    for (const ch of Object.values(chapters)) {
      if (!ch) continue;
      ch.build.steps.forEach((s, i) => s.predict && qs.push({ id: `${ch.id}-build-${i}`, options: s.predict.options }));
      ch.anchor.recall.forEach((q) => qs.push({ id: q.id, options: q.options }));
    }
    for (const d of distributions) d.quiz.forEach((q) => qs.push(q));
    for (const d of drill) if (d.param) qs.push({ id: `${d.id}-2`, options: d.param.options });
    const positions = qs.map((q) => displayOrder(q.id, q.options.length).indexOf(q.options.findIndex((o) => o.correct)));
    const first = positions.filter((p) => p === 0).length / positions.length;
    expect(first).toBeLessThan(0.4);
    expect(new Set(positions).size).toBeGreaterThanOrEqual(4);
  });
});

describe('قراءة الأرقام', () => {
  it('يقبل الأرقام العربية والفاصلة العربية', () => {
    expect(parseNumber('٠٫٤٠٦')).toBeCloseTo(0.406, 12);
    expect(parseNumber('0,406')).toBeCloseTo(0.406, 12);
    expect(parseNumber(' .5 ')).toBe(0.5);
    expect(parseNumber('abc')).toBeNull();
  });
});
