import { useEffect, useState } from 'react';

// توجيه بالـ hash: كل الروابط من نوع #/... فلا يحتاج GitHub Pages إلى إعادة توجيه، ولا تظهر 404 عند فتح رابط مباشر.
export type Route =
  | { name: 'home' }
  | { name: 'dist'; id: string }
  | { name: 'choose' }
  | { name: 'cards' }
  | { name: 'map' }
  | { name: 'refs' }
  | { name: 'notfound' };

export function parse(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/';
  if (path === '/' || path === '') return { name: 'home' };
  const m = path.match(/^\/d\/([a-z]+)$/);
  if (m) return { name: 'dist', id: m[1] };
  if (path === '/choose') return { name: 'choose' };
  if (path === '/cards') return { name: 'cards' };
  if (path === '/map') return { name: 'map' };
  if (path === '/refs') return { name: 'refs' };
  return { name: 'notfound' };
}

export const href = {
  home: '#/',
  dist: (id: string) => `#/d/${id}`,
  choose: '#/choose',
  cards: '#/cards',
  map: '#/map',
  refs: '#/refs',
};

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/** تمرير سلس إلى قسم داخل الصفحة دون تغيير الـ hash (لأنه مستخدم للتوجيه). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  const h = el.querySelector<HTMLElement>('h2, h3');
  h?.focus({ preventScroll: true });
}
