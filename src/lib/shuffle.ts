import { seededRng } from './dist';

/** بصمة نصية ثابتة (FNV-1a) لاشتقاق بذرة من معرّف السؤال. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** خلط فيشر–ييتس بمولّد ذي بذرة: نقي وغير متحيز. */
export function shuffle<T>(xs: T[], seed: number): T[] {
  const a = [...xs], rng = seededRng(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ترتيب عرض ثابت لكل سؤال (لا يتغير بين إعادة التحميل، ولا يضع الصحيحة أولًا دائمًا). */
export function displayOrder(id: string, n: number): number[] {
  return shuffle(Array.from({ length: n }, (_, i) => i), hashString(id));
}

/** يقرأ رقمًا كتبه الطالب، بالأرقام العربية أو الغربية، وبالفاصلة العشرية العربية أو النقطة. */
export function parseNumber(s: string): number | null {
  const t = s
    .trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[٫,]/g, '.')
    .replace(/\s/g, '');
  if (!/^-?\d*\.?\d+$/.test(t)) return null;
  return Number(t);
}
