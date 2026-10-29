import type { DistId } from './types';

// هوية كل توزيع: لون + شكل يتكرران في كل مكان (الشجرة، الرسوم، العناوين).
// الشكل يحمل المعنى أيضًا حتى لا يعتمد التمييز على اللون وحده. التباين ≥ 4.5:1 مفحوص في الاختبارات.
export type Shape = 'coin' | 'triangle' | 'steps' | 'dots' | 'decay' | 'bell';

export const identity: Record<DistId, { color: string; shape: Shape }> = {
  bernoulli: { color: '#9A4318', shape: 'coin' },
  binomial: { color: '#2456A4', shape: 'triangle' },
  geometric: { color: '#3E6A1F', shape: 'steps' },
  poisson: { color: '#6F3A94', shape: 'dots' },
  exponential: { color: '#0E6B6B', shape: 'decay' },
  normal: { color: '#755800', shape: 'bell' },
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
export const journey: DistId[] = ['bernoulli', 'binomial', 'poisson', 'exponential', 'geometric', 'normal'];

