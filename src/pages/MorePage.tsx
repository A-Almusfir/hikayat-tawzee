import { useEffect, useMemo, useState } from 'react';
import { moreCards, type MoreCard } from '../content/more';
import { sheetById } from '../content/sheet';
import { sourceById } from '../content/sources';
import { SheetCard } from '../components/SheetCard';
import { CurveChart, Legend } from '../components/charts';
import { Rich, Tex } from '../components/Tex';
import { Slider } from '../components/ui';
import { href, scrollToId } from '../lib/router';
import { useLang } from '../lib/lang';
import { overlay, type Tr } from '../lib/i18n';

// «توزيعات أخرى»: ما في ورقة القوانين بلا فصل كامل.
export function MorePage({ focus, tr }: { focus?: string; tr?: Tr<typeof moreCards> }) {
  const en = useLang() === 'en' && !!tr;
  const cards = useMemo(() => (en ? overlay(moreCards, tr) : moreCards), [en, tr]);
  useEffect(() => {
    if (focus) window.setTimeout(() => scrollToId(`more-${focus}`), 50);
  }, [focus]);
  return (
    <article className="more-page">
      <header className="page-head">
        <h1 tabIndex={-1}>{en ? 'Other distributions' : 'توزيعات أخرى'}</h1>
        <p className="lead">
          {en
            ? 'The Weibull, beta and F: each with a formula card, when it appears, how it relates to another distribution, a worked example, and a curve that changes with its parameters.'
            : 'ويبل وبيتا وF: لكل منها بطاقة قوانين، ومتى يظهر، وعلاقته بتوزيع آخر، ومثال محلول، ومنحنى تغيّر معلماته.'}
        </p>
        <p className="hint">
          {en ? (
            <>
              The standard normal is in the <a href={href.dist('normal')}>normal chapter</a>, with the Φ table, and all the formulas are in <a href={href.exam}>Exam night</a>.
            </>
          ) : (
            <>
              والطبيعي المعياري في <a href={href.dist('normal')}>فصل الطبيعي</a> مع جدول Φ، وكل القوانين في <a href={href.exam}>ليلة الاختبار</a>.
            </>
          )}
        </p>
      </header>
      {cards.map((c) => (
        <MoreSection key={c.id} c={c} en={en} />
      ))}
    </article>
  );
}

function MoreSection({ c, en }: { c: MoreCard; en: boolean }) {
  const s = sheetById[c.id];
  const [vals, setVals] = useState(() => Object.fromEntries(c.sliders.map((x) => [x.key, x.start])));
  const [open, setOpen] = useState(false);
  const p = c.toParams(vals);
  const xMax = c.xMax(p);
  return (
    <section className="more-card" id={`more-${c.id}`} aria-labelledby={`more-${c.id}-h`}>
      <h2 id={`more-${c.id}-h`} tabIndex={-1}>
        {en ? s.nameEn : s.nameAr}{' '}
        {en ? (
          <span className="en" lang="ar" dir="rtl">{s.nameAr}</span>
        ) : (
          !s.nameAr.includes(s.nameEn) && <span className="en" lang="en" dir="ltr">{s.nameEn}</span>
        )}
      </h2>
      <p className="more-q">{c.question}</p>
      <SheetCard id={c.id} />
      <dl className="more-facts">
        <dt>{en ? 'When does it appear?' : 'متى يظهر؟'}</dt>
        <dd><Rich text={c.where} /></dd>
        <dt>{en ? 'How it relates to others' : 'علاقته بغيره'}</dt>
        <dd><Rich text={c.relation} /></dd>
        <dt>{en ? 'Where did it come from?' : 'من أين جاء؟'}</dt>
        <dd>
          <Rich text={c.history.text} />{' '}
          {c.history.src.map((id) => (
            <a key={id} className="cite" href={sourceById[id].url} target="_blank" rel="noopener noreferrer" aria-label={en ? `Source: ${sourceById[id].citeEn ?? sourceById[id].cite}` : `المصدر: ${sourceById[id].cite}`}>
              {en ? '[source]' : '[مصدر]'}
            </a>
          ))}
        </dd>
      </dl>
      <div className="lab">
        <div className="slider-grid">
          {c.sliders.map((x) => (
            <Slider key={x.key} label={x.label} symbol={x.symbol} value={vals[x.key]} onChange={(v) => setVals({ ...vals, [x.key]: v })} min={x.min} max={x.max} step={x.step} digits={x.step < 1 ? 1 : 0} />
          ))}
        </div>
        <CurveChart f={(x) => c.pdf(x, p)} xMin={xMax / 400} xMax={xMax} ariaLabel={en ? `${s.nameEn} density. ${c.captionEn(p).replace(/\$/g, '').replace(/\\/g, '')}` : `كثافة ${s.nameAr}. ${c.caption(p).replace(/\$/g, '').replace(/\\/g, '')}`}
          xLabel="x"
        />
        <Legend items={['curve']} />
        <Rich as="p" className="hint" text={en ? c.captionEn(p) : c.caption(p)} />
      </div>
      <div className="more-example">
        <h3>{c.example.label}</h3>
        <Rich as="p" text={c.example.given} />
        {open ? (
          <>
            {c.example.steps.map((st, i) => (
              <div key={i} className="ex-step">
                <strong>{st.title}</strong> {st.body && <Rich text={st.body} />}
                {(st.tex ?? []).map((t, j) => <Tex key={j} tex={t} display />)}
              </div>
            ))}
            <Rich as="p" className="answer" text={c.example.answer} />
          </>
        ) : (
          <button type="button" className="btn" onClick={() => setOpen(true)}>{en ? 'Show the solution' : 'ورّني الحل'}</button>
        )}
      </div>
    </section>
  );
}
