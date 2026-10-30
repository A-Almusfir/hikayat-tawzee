// تطبيع النص العربي للبحث بالاسم: بلا تشكيل، والهمزات ألفًا، و«ال» التعريف محذوفة من أول كل كلمة.
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.startsWith('ال') ? w.slice(2) : w))
    .join(' ');
}

/** هل تطابق الكلمات المكتوبة (كلها) بداية كلمات في أحد الأسماء؟ */
export function matches(query: string, names: string[]): boolean {
  const q = normalize(query).split(' ').filter(Boolean);
  if (!q.length) return true;
  const words = names.flatMap((n) => normalize(n).split(' '));
  return q.every((t) => words.some((w) => w.startsWith(t)));
}
