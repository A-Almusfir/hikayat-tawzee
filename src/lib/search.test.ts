import { describe, expect, it } from 'vitest';
import { matches, normalize } from './search';

describe('البحث بالاسم', () => {
  it('يتجاهل «ال» والتشكيل والهمزات وحالة الأحرف', () => {
    expect(normalize('الأُسّي')).toBe('اسي');
    expect(matches('اسي', ['الأسي', 'Exponential'])).toBe(true);
    expect(matches('ذو الحدين', ['ذو الحدين السالب'])).toBe(true);
    expect(matches('سالب', ['ذو الحدين السالب'])).toBe(true);
    expect(matches('expo', ['الأسي', 'Exponential'])).toBe(true);
    expect(matches('كاي', ['مربع كاي', 'Chi-square'])).toBe(true);
    expect(matches('chi', ['مربع كاي', 'Chi-square'])).toBe(true);
    expect(matches('غاما', ['بواسون', 'Poisson'])).toBe(false);
    expect(matches('', ['أي شيء'])).toBe(true);
  });
});
