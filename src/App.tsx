import { useEffect, useState } from 'react';
import { href, useRoute } from './lib/router';
import { progress } from './lib/storage';
import { poissonChapter } from './content/chapters/poisson';
import { ChapterPage } from './pages/ChapterPage';
import { HomePage } from './pages/HomePage';
import { CardsPage, ChooserPage, DistPage, NotFound, RefsPage } from './pages/pages';

const CHAPTERS = { poisson: poissonChapter } as const;

const NAV = [
  { to: href.home, label: 'الرئيسية', match: 'home' },
  { to: href.choose, label: 'أي توزيع أختار؟', match: 'choose' },
  { to: href.cards, label: 'بطاقات المراجعة', match: 'cards' },
  { to: href.refs, label: 'المراجع والمنهج', match: 'refs' },
];

export default function App() {
  const route = useRoute();
  const [cleared, setCleared] = useState(false);

  const pageKey = route.name === 'dist' ? `dist:${route.id}` : route.name;
  useEffect(() => {
    // التنقل بين مشاهد الفصل نفسه لا يعيد الصفحة إلى أعلاها
    if (route.name === 'dist' && route.scene) return;
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
    const titles: Record<string, string> = { choose: 'أي توزيع أختار؟', cards: 'بطاقات المراجعة', map: 'خريطة العلاقات', refs: 'المراجع والمنهج' };
    const h1 = document.querySelector('main h1')?.textContent;
    document.title = route.name === 'home' ? 'حكاية توزيع — افهم الحكاية… يثبت القانون' : `${titles[route.name] ?? h1 ?? ''} · حكاية توزيع`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  const page = (() => {
    switch (route.name) {
      case 'home': return <HomePage />;
      case 'dist': {
        const ch = CHAPTERS[route.id as keyof typeof CHAPTERS];
        return ch ? <ChapterPage key={route.id} ch={ch} scene={route.scene} /> : <DistPage key={route.id} id={route.id} />;
      }
      case 'choose': return <ChooserPage />;
      case 'cards': return <CardsPage />;
      case 'map': return <HomePage />;
      case 'refs': return <RefsPage />;
      default: return <NotFound />;
    }
  })();

  const clear = () => {
    if (window.confirm('سيُمسح كل تقدمك المحفوظ على هذا الجهاز (البطاقات وإجابات الأسئلة والمواقف). متابعة؟')) {
      progress.clearAll();
      setCleared(true);
      window.setTimeout(() => setCleared(false), 4000);
    }
  };

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLElement>('main h1')?.focus(); }}>
        تخطَّ إلى المحتوى
      </a>
      <header className="site-head no-print">
        <a href={href.home} className="brand">
          حكاية توزيع
        </a>
        <nav aria-label="التنقل الرئيسي">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <a href={n.to} aria-current={route.name === n.match ? 'page' : undefined}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main">{page}</main>
      <footer className="site-foot">
        <div className="no-print local-note">
          <p>تقدمك محفوظ على هذا الجهاز فقط.</p>
          <button type="button" className="btn btn-quiet" onClick={clear}>امسح التقدم</button>
          <span role="status" aria-live="polite">{cleared ? 'تم مسح التقدم.' : ''}</span>
        </div>
        <p>إعداد عبدالله المسفر — طالب إحصاء</p>
        <p>التطوير بمساعدة Claude Code</p>
      </footer>
    </>
  );
}
