import { lazy, Suspense, useEffect, useState } from 'react';
import { href, useRoute } from './lib/router';
import { setLang, TRANSLATED, useLang } from './lib/lang';
import { progress } from './lib/storage';
import { chapters } from './content/chapters';
import type { DistId } from './content/types';
import { HomePage } from './pages/HomePage';

// الصفحات غير الرئيسية تُحمَّل عند الحاجة فقط، فتصغر الحزمة الأولى على الجوال
const ChapterPage = lazy(() => import('./pages/ChapterPage').then((m) => ({ default: m.ChapterPage })));
const DrillPage = lazy(() => import('./pages/DrillPage').then((m) => ({ default: m.DrillPage })));
const ExamNightPage = lazy(() => import('./pages/ExamNightPage').then((m) => ({ default: m.ExamNightPage })));
const MgfPage = lazy(() => import('./pages/MgfPage').then((m) => ({ default: m.MgfPage })));
const MorePage = lazy(() => import('./pages/MorePage').then((m) => ({ default: m.MorePage })));
const CardsPage = lazy(() => import('./pages/pages').then((m) => ({ default: m.CardsPage })));
const ChooserPage = lazy(() => import('./pages/pages').then((m) => ({ default: m.ChooserPage })));
const RefsPage = lazy(() => import('./pages/pages').then((m) => ({ default: m.RefsPage })));
const NotFound = lazy(() => import('./pages/pages').then((m) => ({ default: m.NotFound })));


const LINKEDIN = 'https://www.linkedin.com/in/abdullah-a-365a082b3';

const NAV = [
  { to: href.home, label: 'الرئيسية', en: 'Home', match: 'home' },
  { to: href.exam, label: 'ليلة الاختبار', en: 'Exam night', match: 'exam' },
  { to: href.drill, label: 'تدريب مختلط', en: 'Mixed practice', match: 'drill' },
  { to: href.mgf, label: 'الدالة المولدة', en: 'MGF', match: 'mgf' },
  { to: href.more(), label: 'توزيعات أخرى', en: 'Other distributions', match: 'more' },
  { to: href.choose, label: 'أي توزيع أختار؟', en: 'Which distribution?', match: 'choose' },
  { to: href.cards, label: 'بطاقات المراجعة', en: 'Review cards', match: 'cards' },
  { to: href.refs, label: 'المراجع والمنهج', en: 'Sources', match: 'refs' },
];

export default function App() {
  const route = useRoute();
  const lang = useLang();
  const en = lang === 'en';
  const [cleared, setCleared] = useState(false);

  const pageKey = route.name === 'dist' ? `dist:${route.id}` : route.name;
  useEffect(() => {
    const titles: Record<string, string> = { choose: 'أي توزيع أختار؟', cards: 'بطاقات المراجعة', refs: 'المراجع والمنهج', exam: 'ليلة الاختبار', drill: 'تدريب مختلط', mgf: 'الدالة المولدة للعزوم', more: 'توزيعات أخرى' };
    // الصفحة قد تُحمَّل لاحقًا (lazy): ننتظر ظهور عنوانها قبل ضبط العنوان والتركيز
    const ready = () => {
      const h1 = document.querySelector<HTMLElement>('main h1');
      if (!h1) return false;
      const brand = en ? 'Hikayat Tawzee' : 'حكاية توزيع';
      document.title = route.name === 'home' ? (en ? 'Hikayat Tawzee — the story behind each distribution' : 'حكاية توزيع — افهم الحكاية… يثبت القانون') : `${(en && h1.textContent) || titles[route.name] || h1.textContent || ''} · ${brand}`;
      // رابط مشهد مباشر أو بطاقة في «توزيعات أخرى»: الصفحة تتولى التمرير
      if ((route.name === 'dist' && route.scene) || (route.name === 'more' && route.id)) return true;
      window.scrollTo(0, 0);
      h1.focus({ preventScroll: true });
      return true;
    };
    if (ready()) return;
    const main = document.getElementById('main');
    if (!main) return;
    const mo = new MutationObserver(() => ready() && mo.disconnect());
    mo.observe(main, { childList: true, subtree: true });
    return () => mo.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, lang]);

  const page = (() => {
    switch (route.name) {
      case 'home': return <HomePage />;
      case 'dist': {
        const ch = chapters[route.id as DistId];
        return ch ? <ChapterPage key={route.id} ch={ch} scene={route.scene} /> : <NotFound />;
      }
      case 'choose': return <ChooserPage />;
      case 'cards': return <CardsPage />;
      case 'refs': return <RefsPage />;
      case 'exam': return <ExamNightPage />;
      case 'drill': return <DrillPage />;
      case 'mgf': return <MgfPage />;
      case 'more': return <MorePage focus={route.id} />;
      default: return <NotFound />;
    }
  })();

  const clear = () => {
    if (window.confirm(en ? 'All progress saved on this device (cards, answers and scenarios) will be cleared. Continue?' : 'سيُمسح كل تقدمك المحفوظ على هذا الجهاز (البطاقات وإجابات الأسئلة والمواقف). متابعة؟')) {
      progress.clearAll();
      setCleared(true);
      window.setTimeout(() => setCleared(false), 4000);
    }
  };

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLElement>('main h1')?.focus(); }}>
        {en ? 'Skip to content' : 'تخطَّ إلى المحتوى'}
      </a>
      <header className="site-head no-print">
        <a href={href.home} className="brand">
          {en ? 'Hikayat Tawzee' : 'حكاية توزيع'}
        </a>
        <button type="button" className="lang-btn" onClick={() => setLang(en ? 'ar' : 'en')} lang={en ? 'ar' : 'en'} aria-label={en ? 'التبديل إلى العربية' : 'Switch to English (beta)'}>
          {en ? 'عربي' : 'English'}
          {!en && <span className="beta">beta</span>}
        </button>
        <nav aria-label={en ? 'Main navigation' : 'التنقل الرئيسي'}>
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <a href={n.to} aria-current={route.name === n.match ? 'page' : undefined}>{en ? n.en : n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main">
        {/* مفتاح لكل صفحة: لا تبقى الصفحة السابقة مخفية في الشجرة أثناء تحميل الجديدة */}
        <Suspense key={pageKey} fallback={<p className="loading" role="status">{en ? 'Loading…' : 'جارٍ التحميل…'}</p>}>
          {en && !TRANSLATED.has(route.name) ? (
            <>
              <p className="lang-note" lang="en" dir="ltr">
                This page is in Arabic only for now. The English beta covers the home page, the family tree and Exam night.
              </p>
              <div lang="ar" dir="rtl">{page}</div>
            </>
          ) : (
            page
          )}
        </Suspense>
      </main>
      <footer className="site-foot">
        <div className="no-print local-note">
          <p>{en ? 'Your progress is saved on this device only.' : 'تقدمك محفوظ على هذا الجهاز فقط.'}</p>
          <button type="button" className="btn btn-quiet" onClick={clear}>{en ? 'Clear progress' : 'امسح التقدم'}</button>
          <span role="status" aria-live="polite">{cleared ? (en ? 'Progress cleared.' : 'تم مسح التقدم.') : ''}</span>
        </div>
        <div className="signature">
          <p className="sig-name">
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">{en ? 'Abdullah Almusfir' : 'عبدالله المسفر'}</a>
          </p>
          <p className="sig-role">
            {en ? 'Statistics student' : 'طالب إحصاء'} · <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" lang="en" dir="ltr">LinkedIn</a>
          </p>
        </div>
      </footer>
    </>
  );
}
