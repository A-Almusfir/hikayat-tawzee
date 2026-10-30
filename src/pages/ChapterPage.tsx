import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Chapter } from '../content/chapterTypes';
import { chapterNumber, nextInJourney } from '../content/chapters';
import { distById } from '../content/distributions';
import { sheetById } from '../content/sheet';
import { SheetCard } from '../components/SheetCard';
import { identity, journey, tint } from '../content/identity';
import { sourceById } from '../content/sources';
import { Glyph } from '../components/Glyph';
import { labs } from '../components/labs';
import { AnchorScene } from '../components/scenes/AnchorScene';
import { BuildScene } from '../components/scenes/BuildScene';
import { ExamScene } from '../components/scenes/ExamScene';
import { FitLab } from '../components/scenes/FitLab';
import { GaltonTry, LlnTry, MemoryTry, PointsTry, WaitsTry } from '../components/scenes/TryKinds';
import { Cites, Scene, SCENES } from '../components/scenes/Scene';
import { ArtView } from '../components/scenes/Art';
import { ZTable } from '../components/scenes/ZTable';
import { DistCardView, FormulaSection, Quiz } from '../components/sections';
import { Rich, Tex } from '../components/Tex';
import { href, scrollToId } from '../lib/router';

export function ChapterPage({ ch, scene }: { ch: Chapter; scene?: number }) {
  const d = distById[ch.id];
  const s = sheetById[ch.id];
  const color = identity[ch.id].color;
  const number = chapterNumber(ch.id);
  const style = { '--c': color, '--c-tint': tint(color, 0.08), '--c-tint2': tint(color, 0.16) } as CSSProperties;
  const [active, setActive] = useState(1);
  const Lab = labs[ch.id];

  // ترقيم المصادر بترتيب أول ظهور في الفصل
  const srcOrder = useMemo(() => {
    const ids: string[] = [];
    for (const c of [...ch.story.claims, ...ch.story.more]) for (const s of c.src) if (!ids.includes(s)) ids.push(s);
    return ids;
  }, [ch]);

  useEffect(() => {
    if (scene) window.setTimeout(() => scrollToId(`scene-${scene}`), 50);
  }, [scene]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const els = SCENES.map((_, i) => document.getElementById(`scene-${i + 1}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(Number(en.target.getAttribute('data-n')));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <article className="chapter" style={style}>
      <header className="ch-head">
        <p className="ch-num" aria-hidden="true">{number}</p>
        <div>
          <p className="ch-kicker">الفصل {number} من {journey.length} · {s.group === 'discrete' ? 'متقطع' : 'مستمر'}</p>
          <h1 tabIndex={-1}>
            <Glyph id={ch.id} size={40} /> {s.nameAr} <span className="en" lang="en" dir="ltr">{s.nameEn}</span>
          </h1>
          <p className="ch-q">{ch.question}</p>
        </div>
      </header>

      <nav className="ch-progress" aria-label="مشاهد الفصل">
        <ol>
          {SCENES.map((t, i) => (
            <li key={t}>
              <a
                href={href.dist(ch.id, i + 1)}
                aria-current={active === i + 1 ? 'step' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  history.replaceState(null, '', href.dist(ch.id, i + 1));
                  scrollToId(`scene-${i + 1}`);
                }}
              >
                <span className="pn">{i + 1}</span>
                <span className="pt">{t}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Scene n={1} title={ch.story.headline} art={<ArtView art={ch.story.art} />}>
        <ol className="claims">
          {ch.story.claims.map((c, i) => (
            <li key={i}>
              <Rich as="p" className="claim" text={c.text} /> <Cites ids={c.src} order={srcOrder} />
              {c.links && (
                <p className="claim-link">
                  <span aria-hidden="true">↙ </span>
                  <Rich text={c.links} />
                </p>
              )}
            </li>
          ))}
        </ol>
        <details className="more">
          <summary>للمزيد من الحكاية</summary>
          {ch.story.more.map((c, i) => (
            <div key={i} className="more-item">
              <Rich as="p" text={c.text} /> <Cites ids={c.src} order={srcOrder} />
            </div>
          ))}
        </details>
      </Scene>

      <TryScene ch={ch} />

      <BuildScene id={ch.id} headline={ch.build.headline} law={ch.build.law} steps={ch.build.steps} note={ch.build.note} color={color} />
      <ExamScene headline={ch.exam.headline} problems={ch.exam.problems} tricks={ch.exam.tricks} />
      {ch.extra === 'ztable' && (
        <section className="ch-extra" aria-labelledby="z-h">
          <h2 id="z-h">الطبيعي المعياري: من <Tex tex="x" /> إلى <Tex tex="z" /> إلى <Tex tex="\Phi(z)" /></h2>
          <Rich as="p" text="كل توزيع طبيعي يتحول إلى $Z \sim N(0, 1)$ بطرح المتوسط والقسمة على الانحراف المعياري. ثم نقرأ المساحة من جدول واحد." />
          <ZTable />
        </section>
      )}
      <AnchorScene ch={ch} next={nextInJourney(ch.id)} color={color} />

      <section className="reference" aria-labelledby="ref-h">
        <h2 id="ref-h">المرجع</h2>
        <p className="hint">للتعمق والمراجعة: المختبر الكامل، والاشتقاق، والبطاقة، وأسئلة إضافية.</p>
        {Lab && ch.tryIt.kind !== 'lab' && (
          <details>
            <summary>{ch.reference.labTitle}</summary>
            <Lab />
          </details>
        )}
        {d ? (
          <>
            <details>
              <summary>القانون والاشتقاق الكامل</summary>
              <FormulaSection d={d} />
            </details>
            <details>
              <summary>بطاقة التوزيع</summary>
              <DistCardView d={d} />
            </details>
            <details>
              <summary>أسئلة إضافية</summary>
              <Quiz d={d} />
            </details>
          </>
        ) : (
          <details>
            <summary>بطاقة التوزيع (من ورقة القوانين)</summary>
            <SheetCard id={ch.id} />
          </details>
        )}
      </section>

      <section className="ch-sources" aria-labelledby="src-h">
        <h2 id="src-h">مصادر هذا الفصل</h2>
        <ol>
          {srcOrder.map((id) => (
            <li key={id} id={`src-${id}`} tabIndex={-1}>
              <a href={sourceById[id].url} target="_blank" rel="noopener noreferrer">
                {sourceById[id].cite}
              </a>
            </li>
          ))}
        </ol>
        <p className="hint">جرى التحقق من هذه المصادر عبر نتائج البحث ومقتطفاته أثناء الإعداد، لا بقراءة النصوص الأصلية كاملة.</p>
      </section>
    </article>
  );
}

/** المشهد ②: يختار التجربة حسب نوعها في المحتوى. */
function TryScene({ ch }: { ch: Chapter }) {
  const t = ch.tryIt;
  const Lab = labs[ch.id];
  switch (t.kind) {
    case 'fit': return <FitLab t={t} />;
    case 'lln': return <LlnTry t={t} />;
    case 'points': return <PointsTry t={t} />;
    case 'waits': return <WaitsTry t={t} />;
    case 'memory': return <MemoryTry t={t} />;
    case 'galton': return <GaltonTry t={t} />;
    default:
      return (
        <Scene n={2} title={t.headline}>
          <Rich as="p" text={t.prompt} />
          {Lab && <Lab />}
        </Scene>
      );
  }
}
