// طبقة الترجمة: النسخة الإنجليزية لا تكرر المحتوى، بل تكتب نصوصه فقط فوقه.
// الأرقام والمعادلات ودوال الفحص تبقى من الأصل العربي، فلا يختلف حساب بين اللغتين.

/** مفاتيح بنيوية لا تُترجم: معرّفات يعتمد عليها حفظ التقدم، وأنواع، ومصادر، ورموز رياضية. */
type Structural = 'id' | 'kind' | 'src' | 'symbol' | 'correct' | 'check' | 'type' | 'nameAr' | 'nameEn' | 'notation';

/** نصوص كائن فقط: كل حقل نصي اختياري، والدوال والأرقام لا تُترجم. المصفوفات تُطابق بالترتيب. */
export type Tr<T> = T extends string
  ? string
  : T extends (...args: never[]) => unknown
    ? never
    : T extends readonly (infer U)[]
      ? (Tr<U> | undefined)[]
      : T extends object
        ? { [K in keyof T as K extends Structural ? never : K]?: Tr<T[K]> }
        : never;

/** يضع نصوص الترجمة فوق الأصل: النص يُستبدل، والكائن يُدمج، والمصفوفة تُدمج عنصرًا بعنصر. */
export function overlay<T>(base: T, tr: Tr<T> | undefined): T {
  if (tr === undefined || tr === null) return base;
  if (typeof base === 'string') return (typeof tr === 'string' ? tr : base) as T;
  if (Array.isArray(base)) {
    const t = tr as unknown[];
    return base.map((b, i) => overlay(b, t[i] as Tr<typeof b>)) as T;
  }
  if (base && typeof base === 'object' && typeof base !== 'function') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(tr as Record<string, unknown>)) {
      out[k] = overlay((base as Record<string, unknown>)[k], v as never);
    }
    return out as T;
  }
  return base;
}

export const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

/**
 * يبني ترجمة من قائمة مسطحة «المسار → النص»، مثل '[0].steps[1].title'.
 * هكذا تُكتب ترجمات المحتوى الطويل (التدريب، الدالة المولدة…) دون تكرار بنيته.
 */
export function unflatten<T>(map: Record<string, string>): Tr<T> {
  let root: unknown;
  for (const [path, value] of Object.entries(map)) {
    const keys = [...path.matchAll(/\[(\d+)\]|\.?([^.[\]]+)/g)].map((m) => (m[1] !== undefined ? Number(m[1]) : m[2]));
    if (root === undefined) root = typeof keys[0] === 'number' ? [] : {};
    let node = root as Record<string | number, unknown>;
    keys.forEach((k, i) => {
      if (i === keys.length - 1) node[k] = value;
      else node = (node[k] ??= typeof keys[i + 1] === 'number' ? [] : {}) as Record<string | number, unknown>;
    });
  }
  return root as Tr<T>;
}
