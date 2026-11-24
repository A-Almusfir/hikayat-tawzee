import { createContext, useContext, useSyncExternalStore } from 'react';

// لغة الواجهة: العربية افتراضيًا، والإنجليزية تجريبية (الرئيسية والشجرة وليلة الاختبار والفصول المترجمة).
// تُحفظ في المتصفح، وتضبط lang وdir على الصفحة كلها.
export type Lang = 'ar' | 'en';

const KEY = 'hikayat:lang';
const subs = new Set<() => void>();

function read(): Lang {
  try {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

let current: Lang = typeof window === 'undefined' ? 'ar' : read();

function apply() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = current;
  document.documentElement.dir = current === 'en' ? 'ltr' : 'rtl';
}
apply();

export function setLang(l: Lang) {
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    // التخزين غير متاح: تبقى اللغة لهذه الزيارة فقط
  }
  apply();
  subs.forEach((f) => f());
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => current,
    () => 'ar',
  );
}

/** الصفحات المترجمة في النسخة التجريبية. */
export const TRANSLATED = new Set(['home', 'exam']);

/** الفصول المترجمة (تُفحص في الاختبارات مقابل content/en). */
export const TRANSLATED_CHAPTERS = new Set(['bernoulli', 'binomial', 'hypergeometric', 'poisson', 'exponential', 'gamma', 'geometric', 'negbin']);

export const isTranslated = (route: { name: string; id?: string }) =>
  TRANSLATED.has(route.name) || (route.name === 'dist' && !!route.id && TRANSLATED_CHAPTERS.has(route.id));

/** صفحة غير مترجمة داخل الواجهة الإنجليزية: مكوناتها تبقى بالعربية حتى لا تختلط اللغتان. */
const ArabicOnly = createContext(false);
export const ArabicOnlyScope = ArabicOnly.Provider;

/** لغة المحتوى الفعلية للمكوّن: الإنجليزية فقط إن كانت الصفحة مترجمة. */
export function useUiLang(): Lang {
  const lang = useLang();
  return useContext(ArabicOnly) ? 'ar' : lang;
}
