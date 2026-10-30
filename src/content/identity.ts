import type { DistId } from './types';

// هوية كل توزيع: لون محايد + شكل يتكرران في كل مكان (الشجرة، الرسوم، العناوين).
// الشكل يحمل المعنى أيضًا حتى لا يعتمد التمييز على اللون وحده. التباين ≥ 4.5:1 مفحوص في الاختبارات.
export type Shape = 'coin' | 'triangle' | 'cups' | 'steps' | 'stairs' | 'dots' | 'decay' | 'hump' | 'flat' | 'bell' | 'squares' | 'heavy';

export const identity: Record<DistId, { color: string; shape: Shape }> = {
  bernoulli: { color: '#8A4B22', shape: 'coin' },
  binomial: { color: '#2A5A8C', shape: 'triangle' },
  hypergeometric: { color: '#5E3B7D', shape: 'cups' },
  geometric: { color: '#426A2E', shape: 'steps' },
  negbin: { color: '#22604B', shape: 'stairs' },
  poisson: { color: '#1E5F6E', shape: 'dots' },
  exponential: { color: '#7D2E2E', shape: 'decay' },
  gamma: { color: '#8A3457', shape: 'hump' },
  uniform: { color: '#3F5B70', shape: 'flat' },
  normal: { color: '#6B5A1E', shape: 'bell' },
  chisquare: { color: '#7A3B12', shape: 'squares' },
  t: { color: '#3D3F86', shape: 'heavy' },
};

export const PAPER = '#fbf7f0';
export const INK = '#1b2a4a';

/** مزج لون مع الورق بنسبة t (للخلفيات الفاتحة). */
export function tint(hex: string, t = 0.1) {
  const p = [1, 3, 5].map((i) => parseInt(PAPER.slice(i, i + 2), 16));
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return '#' + c.map((v, i) => Math.round(p[i] * (1 - t) + v * t).toString(16).padStart(2, '0')).join('');
}

export function contrast(a: string, b: string) {
  const lum = (h: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const v = parseInt(h.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** ترتيب الفصول في الرحلة (منطقي لا تاريخي). */
// الفصل الجديد يُدرج بعد أقرب فصل إليه: فوق الهندسي بعد ذي الحدين، وغاما بعد الأسي، وذو الحدين السالب بعد الهندسي.
// لا يُضاف توزيع هنا قبل أن يكتمل فصله (الاختبارات تشترط فصلًا لكل توزيع في الرحلة).
export const journey: DistId[] = ['bernoulli', 'binomial', 'hypergeometric', 'poisson', 'exponential', 'gamma', 'geometric', 'negbin', 'normal', 'chisquare', 't'];

