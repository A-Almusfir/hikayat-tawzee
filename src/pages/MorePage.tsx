import { useEffect, useState } from 'react';
import { moreCards, type MoreCard } from '../content/more';
import { sheetById } from '../content/sheet';
import { sourceById } from '../content/sources';
import { SheetCard } from '../components/SheetCard';
import { CurveChart, Legend } from '../components/charts';
import { Rich, Tex } from '../components/Tex';
import { Slider } from '../components/ui';
import { href, scrollToId } from '../lib/router';

// «توزيعات أخرى»: ما في ورقة القوانين بلا فصل كامل.
export function MorePage({ focus }: { focus?: string }) {
  useEffect(() => {
    if (focus) window.setTimeout(() => scrollToId(`more-${focus}`), 50);
  }, [focus]);
  return (
    <article className="more-page">
      <header className="page-head">
        <h1 tabIndex={-1}>توزيعات أخرى في الورقة</h1>
        <p className="lead">ويبل وبيتا وF: لكل منها بطاقة من الورقة، ومتى يظهر، وعلاقته بتوزيع آخر، ومثال محلول، ومنحنى تغيّر معلماته.</p>
        <p className="hint">والطبيعي المعياري في <a href={href.dist('normal')}>فصل الطبيعي</a> مع جدول Φ، وكل القوانين في <a href={href.exam}>ليلة الاختبار</a>.</p>
      </header>
      {moreCards.map((c) => (
        <MoreSection key={c.id} c={c} />
      ))}
    </article>
  );
}

function MoreSection({ c }: { c: MoreCard }) {
  const s = sheetById[c.id];
  const [vals, setVals] = useState(() => Object.fromEntries(c.sliders.map((x) => [x.key, x.start])));
  const [open, setOpen] = useState(false);
  const p = c.toParams(vals);
  const xMax = c.xMax(p);
  return (
    <section className="more-card" id={`more-${c.id}`} aria-labelledby={`more-${c.id}-h`}>
      <h2 id={`more-${c.id}-h`} tabIndex={-1}>
        {s.nameAr} {!s.nameAr.includes(s.nameEn) && <span className="en" lang="en" dir="ltr">{s.nameEn}</span>}
      </h2>
      <p className="more-q">{c.question}</p>
      <SheetCard id={c.id} />
      <dl className="more-facts">
        <dt>متى يظهر؟</dt>
        <dd><Rich text={c.where} /></dd>
        <dt>علاقته بغيره</dt>
        <dd><Rich text={c.relation} /></dd>
        <dt>من أين جاء؟</dt>
        <dd>
          <Rich text={c.history.text} />{' '}
          {c.history.src.map((id) => (
            <a key={id} className="cite" href={sourceById[id].url} target="_blank" rel="noopener noreferrer" aria-label={`المصدر: ${sourceById[id].cite}`}>[مصدر]</a>
          ))}
        </dd>
      </dl>
      <div className="lab">
        <div className="slider-grid">
          {c.sliders.map((x) => (
            <Slider key={x.key} label={x.label} symbol={x.symbol} value={vals[x.key]} onChange={(v) => setVals({ ...vals, [x.key]: v })} min={x.min} max={x.max} step={x.step} digits={x.step < 1 ? 1 : 0} />
          ))}
        </div>
        <CurveChart f={(x) => c.pdf(x, p)} xMin={xMax / 400} xMax={xMax} ariaLabel={`كثافة ${s.nameAr}. ${c.caption(p).replace(/\$/g, '').replace(/\\/g, '')}`} xLabel="x" />
        <Legend items={['curve']} />
        <Rich as="p" className="hint" text={c.caption(p)} />
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
          <button type="button" className="btn" onClick={() => setOpen(true)}>ورّني الحل</button>
        )}
      </div>
    </section>
  );
}
