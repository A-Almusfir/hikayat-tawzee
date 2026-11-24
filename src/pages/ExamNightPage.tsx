import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import type { DistId } from '../content/types';
import { decisionNote, decisionTree, hint, type DecisionNode, type Leaf } from '../content/decision';
import { choiceLabels } from '../content/chooser';
import { distById } from '../content/distributions';
import { chapters } from '../content/chapters';
import { identity, journey } from '../content/identity';
import { moreCards } from '../content/more';
import { sheet, sheetById, symbols, type SheetField, type SheetRow } from '../content/sheet';
import { twins } from '../content/twins';
import { Glyph } from '../components/Glyph';
import { Rich, Tex } from '../components/Tex';
import { href, scrollToId } from '../lib/router';
import { useLang } from '../lib/lang';

// كل ما في هذه الصفحة يُقرأ من ورقة القوانين (sheet.ts) وبطاقات التوزيعات ومخطط القرار (مصدر واحد للحقيقة).
export function ExamNightPage() {
  const en = useLang() === 'en';
  return (
    <article className="exam-night">
      <header className="page-head">
        <h1 tabIndex={-1}>{en ? 'Exam night' : 'ليلة الاختبار'}</h1>
        <p className="lead">
          {en
            ? `All the formulas as cards: ${sheet.length} distributions, each with when to use it, its formula, mean, variance and moment generating function. Then a glossary of symbols.`
            : `كل القوانين في بطاقات: ${sheet.length} توزيعًا، لكل واحد متى نستعمله وقانونه ومتوسطه وتباينه ودالته المولدة. ثم قاموس الرموز، ومخطط يحدد التوزيع من نص المسألة.`}
        </p>
        <div className="btn-row no-print">
          <button
            type="button"
            className="btn"
            onClick={() => {
              // تُفتح الأقسام المطوية قبل الطباعة (للمتصفحات التي لا تطلق beforeprint)
              document.querySelectorAll<HTMLDetailsElement>('.exam-night details').forEach((d) => (d.open = true));
              window.setTimeout(() => window.print(), 50);
            }}
          >
            {en ? 'Print / save as PDF' : 'اطبع / احفظ PDF'}
          </button>
          <a className="btn btn-quiet" href={href.drill}>{en ? 'Mixed practice (Arabic)' : 'تدرّب على مسائل مختلطة'}</a>
        </div>
      </header>

      <nav className="jump no-print" aria-label={en ? 'Page sections' : 'أقسام الصفحة'}>
        <label className="jump-to">
          <span className="sr-only">{en ? 'Go to a distribution' : 'روح لتوزيع'}</span>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) jump(`law-${e.target.value}`);
            }}
          >
            <option value="">{en ? 'Go to a distribution…' : 'روح لتوزيع…'}</option>
            {sheet.map((s) => <option key={s.id} value={s.id}>{en ? s.nameEn : s.nameAr}</option>)}
          </select>
        </label>
        {(en ? [['sym-h', 'Symbols']] : [['sym-h', 'الرموز'], ['decision-h', 'المخطط'], ['twins-h', 'التوائم']]).map(([id, t]) => (
          <button key={id} type="button" className="seg-tab" onClick={() => jump(id)}>{t}</button>
        ))}
      </nav>
      <LawCards />

      <section aria-labelledby="sym-h">
        <h2 id="sym-h">{en ? 'Glossary of symbols' : 'قاموس الرموز'}</h2>
        <dl className="symbols">
          {symbols.map((s) => (
            <div key={s.sym}>
              <dt><Tex tex={s.sym} /></dt>
              <dd><Rich text={en ? s.meaningEn : s.meaning} /></dd>
            </div>
          ))}
        </dl>
      </section>

      {en ? (
        <p className="lang-note no-print">The decision chart, common traps and look-alike pairs are in Arabic only for now.</p>
      ) : (
        <>
          <Fold title="وش يسأل كل توزيع؟ والفخ الشائع">
            <ul className="traps">
              {journey.map((id) => {
                // الفصول الجديدة بلا بطاقة قديمة: السؤال والفخ من الفصل نفسه
                const d = distById[id], ch = chapters[id]!;
                return (
                  <li key={id} style={{ '--c': identity[id].color } as CSSProperties}>
                    <a href={href.dist(id)}><Glyph id={id} size={20} /> {sheetById[id].nameAr}</a>
                    <span className="trap-q">{ch.question}</span>
                    <Rich as="p" text={d ? d.card.mistake : ch.trap ?? ch.exam.tricks[0]} />
                  </li>
                );
              })}
            </ul>
          </Fold>

          <Fold id="decision-h" title="وش التوزيع؟ مخطط القرار">
            <p className="hint">اسأل عن بنية الموقف لا عن كلمة مفتاحية.</p>
            <div className="decision">
              <Node n={decisionTree} />
            </div>
            <Rich as="p" className="callout" text={decisionNote} />
          </Fold>

          <Fold id="twins-h" title="التوائم: لا تلخبط بينها">
            <div className="twins">
              {twins.map((t) => (
                <div key={t.a + t.b} className="twin">
                  <div className="twin-pair">
                    {[t.a, t.b].map((id, i) => (
                      <div key={id} className="twin-side" style={{ '--c': identity[id].color } as CSSProperties}>
                        <p className="twin-name"><Glyph id={id} size={20} /> {sheetById[id].nameAr}</p>
                        <Rich as="p" text={t.what[i]} />
                        <Tex tex={sheetById[t.show?.[i] ?? id].f} />
                        <p className="twin-mean"><Tex tex={sheetById[t.show?.[i] ?? id].mean} /></p>
                      </div>
                    ))}
                  </div>
                  <p className="twin-tell"><strong>السؤال الفاصل: </strong><Rich text={t.tell} /></p>
                </div>
              ))}
            </div>
          </Fold>
        </>
      )}
    </article>
  );
}

/** قفز إلى قسم: يفتح القسم المطوي أولًا إن كان العنوان داخله. */
function jump(id: string) {
  const d = document.getElementById(id)?.closest('details');
  if (d) d.open = true;
  scrollToId(id);
}

const isDist = (id: string): id is DistId => id in identity;
/** وجهة البطاقة: فصلها إن نُشر، وإلا بطاقتها في «توزيعات أخرى»، والمعياري إلى فصل الطبيعي. */
const rowLink = (id: SheetRow['id']) =>
  isDist(id) && chapters[id] ? href.dist(id) : id === 'stdnormal' ? href.dist('normal') : moreCards.some((c) => c.id === id) ? href.more(id) : undefined;

type View = 'all' | SheetField;
const VIEWS: [View, string, string][] = [['all', 'الكل', 'All'], ['law', 'القانون', 'Formula'], ['moments', 'المتوسط والتباين', 'Mean & variance'], ['mgf', 'الدالة المولدة', 'MGF']];

/** بطاقة لكل توزيع، كاملة بنفسها. والأزرار تعرض حقلًا واحدًا في كل البطاقات للمقارنة. */
function LawCards() {
  const en = useLang() === 'en';
  const [view, setView] = useState<View>('all');
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // الطباعة دائمًا بالبطاقات كاملة، ويُرسم ذلك قبل أن يلتقط المتصفح الصفحة
    const on = () => flushSync(() => setView('all'));
    window.addEventListener('beforeprint', on);
    return () => window.removeEventListener('beforeprint', on);
  }, []);
  const choose = (v: View) => {
    setView(v);
    // من عمق الصفحة: ارجع إلى أول البطاقات حتى لا يضيع مكانك بعد تغيّر الطول
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  };
  return (
    <>
      <div ref={top} />
      <div className="view-tabs no-print" role="group" aria-labelledby="view-l">
        <span id="view-l" className="view-l">{en ? 'Show:' : 'اعرض:'}</span>
        {VIEWS.map(([v, t, tEn]) => (
          <button key={v} type="button" className={`seg-tab${view === v ? ' on' : ''}`} aria-pressed={view === v} onClick={() => choose(v)}>{en ? tEn : t}</button>
        ))}
      </div>
      {view === 'mgf' && (
        <p className="hint">
          {en ? (
            <>Want to derive the mean and variance from <Tex tex="M_X(t)" /> step by step? See the <a href={href.mgf}>MGF page</a> (Arabic).</>
          ) : (
            <>تبي تطلع المتوسط والتباين من <Tex tex="M_X(t)" /> خطوة خطوة؟ <a href={href.mgf}>صفحة الدالة المولدة</a>.</>
          )}
        </p>
      )}
      {(['discrete', 'continuous'] as const).map((g) => (
        <section key={g} aria-labelledby={`cards-${g}`}>
          <h2 id={`cards-${g}`} tabIndex={-1}>{en ? (g === 'discrete' ? 'Discrete' : 'Continuous') : g === 'discrete' ? 'المتقطعة' : 'المستمرة'}</h2>
          <div className={`law-cards view-${view}`}>
            {sheet.filter((s) => s.group === g).map((s) => <LawCard key={s.id} s={s} view={view} en={en} />)}
          </div>
        </section>
      ))}
    </>
  );
}

function LawCard({ s, view, en }: { s: SheetRow; view: View; en: boolean }) {
  const dist = isDist(s.id) ? s.id : undefined;
  const link = rowLink(s.id);
  const show = (f: SheetField) => view === 'all' || view === f;
  const warn = s.warn && show(s.warn.on) ? (en ? s.en.warn : s.warn.text) : undefined;
  const more = link?.startsWith('#/more');
  return (
    <article className="law-card" id={`law-${s.id}`} tabIndex={-1} aria-labelledby={`law-h-${s.id}`} style={{ '--c': dist ? identity[dist].color : 'var(--ink-2)' } as CSSProperties}>
      <header>
        <h3 id={`law-h-${s.id}`}>
          {dist && <Glyph id={dist} size={20} />} {en ? s.nameEn : s.nameAr}{' '}
          <span className="en" lang={en ? 'ar' : 'en'} dir={en ? 'rtl' : 'ltr'}>{en ? s.nameAr : s.nameEn}</span>
        </h3>
        {view === 'all' && <p className="law-when"><strong>{en ? 'When? ' : 'متى؟ '}</strong><Rich text={en ? s.en.when : s.when} /></p>}
      </header>
      <dl>
        {show('law') && (
          <div>
            <dt>{en ? 'Formula' : 'القانون'}</dt>
            <dd>
              <Tex tex={s.f} />
              <span className="sub"><Tex tex={s.support} /></span>
              <Rich className="sub" text={en ? s.en.params : s.params} />
            </dd>
          </div>
        )}
        {show('moments') && (
          <>
            <div><dt>{en ? 'Mean' : 'المتوسط'}</dt><dd><Tex tex={s.mean} /></dd></div>
            <div><dt>{en ? 'Variance' : 'التباين'}</dt><dd><Tex tex={s.variance} /></dd></div>
          </>
        )}
        {show('mgf') && (
          <div>
            <dt>{en ? 'MGF' : 'الدالة المولدة'}</dt>
            <dd>
              {s.mgf.kind === 'closed' ? (
                <>
                  <Tex tex={`M_${s.id === 'stdnormal' ? 'Z' : 'X'}(t) = ${s.mgf.tex}`} />
                  {en ? (
                    <span className="sub">{s.en.mgf.startsWith('for') ? '' : 'for '}<Rich text={s.en.mgf} /></span>
                  ) : (
                    <span className="sub">{s.mgf.domain.startsWith('لكل') ? '' : 'بشرط '}<Rich text={s.mgf.domain} /></span>
                  )}
                </>
              ) : (
                <span className="law-note">
                  <strong>{s.mgf.kind === 'none' ? (en ? 'Does not exist.' : 'غير موجودة.') : en ? 'No simple closed form.' : 'بلا صيغة بسيطة.'}</strong>{' '}
                  <Rich text={en ? s.en.mgf : s.mgf.note} />
                </span>
              )}
            </dd>
          </div>
        )}
        {view === 'all' && s.cdf && (
          <div>
            <dt>{en ? 'CDF' : 'التراكمي'}</dt>
            <dd>{s.cdf.kind === 'closed' ? <Tex tex={`F(x) = ${s.cdf.tex}`} /> : <span className="law-note"><Rich text={en ? s.en.cdf! : s.cdf.note} /></span>}</dd>
          </div>
        )}
      </dl>
      {warn && <p className="law-warn"><strong>{en ? 'Watch out: ' : 'انتبه: '}</strong><Rich text={warn} /></p>}
      {view === 'all' && link && (
        <a
          className="law-link no-print"
          href={link}
          aria-label={en ? `${more ? 'Full card' : 'Chapter'} for ${s.nameEn} (Arabic)` : more ? `البطاقة الكاملة لـ${s.nameAr}` : `افتح فصل ${s.nameAr}`}
        >
          {en ? `${more ? 'Full card' : 'Open the chapter'} (Arabic) →` : `${more ? 'البطاقة الكاملة' : 'افتح الفصل'} ←`}
        </a>
      )}
    </article>
  );
}

function LeafView({ l }: { l: Leaf }) {
  if (l === 'insufficient') return <span className="leaf">{choiceLabels.insufficient}</span>;
  const body = (
    <>
      <Glyph id={l} size={18} /> {sheetById[l].nameAr} <span className="leaf-h"><Rich text={hint[l]} /></span>
    </>
  );
  // ورقة بلا فصل منشور بعد: نص بلا رابط
  return chapters[l] ? (
    <a className="leaf" href={href.dist(l)} style={{ '--c': identity[l].color } as CSSProperties}>{body}</a>
  ) : (
    <span className="leaf" style={{ '--c': identity[l].color } as CSSProperties}>{body}</span>
  );
}

function Node({ n }: { n: DecisionNode }) {
  return (
    <div className="dnode">
      <Rich as="p" className="dq" text={n.q} />
      <ul>
        {[n.yes, n.no].map((b) => (
          <li key={b.label}>
            <span className="dl"><Rich text={b.label} /> ←</span>
            {typeof b.next === 'string' ? <LeafView l={b.next} /> : <Node n={b.next} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** قسم قابل للطي: مفتوح على الحاسوب، مطوي على الجوال لتبقى الصفحة قصيرة، ويُفتح عند الطباعة. */
function Fold({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 900px)').matches);
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('beforeprint', on);
    return () => window.removeEventListener('beforeprint', on);
  }, []);
  return (
    <details className="fold" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary><h2 id={id} tabIndex={-1}>{title}</h2></summary>
      {children}
    </details>
  );
}
