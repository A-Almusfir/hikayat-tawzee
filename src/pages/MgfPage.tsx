import { useEffect, useRef, useState } from 'react';
import { derive, identify, mgfRules, type DeriveItem, type IdentifyItem } from '../content/mgf';
import { sheetById } from '../content/sheet';
import { ChoiceCheck } from '../components/scenes/ChoiceCheck';
import { Rich, Tex } from '../components/Tex';
import { href } from '../lib/router';
import { useProgress } from '../lib/storage';

// صفحة الدالة المولدة: قواعد، ثم اشتقاق E وVar خطوة خطوة، ثم «تعرّف على التوزيع من M(t)».
export function MgfPage() {
  const [tab, setTab] = useState(derive[0].id);
  const [idx, setIdx] = useState(0);
  const quiz = useProgress().quiz;
  const item = derive.find((d) => d.id === tab)!;
  const it = identify[idx];
  const done = identify.filter((x) => quiz[`mgf-i-${x.id}-3`] !== undefined).length;
  // عند تغيّر المسألة: ينتقل التركيز إليها
  const moved = useRef(false);
  useEffect(() => {
    if (moved.current) document.querySelector<HTMLElement>('.mgf-id .scenario')?.focus();
    moved.current = true;
  }, [idx]);

  return (
    <article className="mgf">
      <header className="page-head">
        <h1 tabIndex={-1}>الدالة المولدة للعزوم</h1>
        <Rich as="p" className="lead" text="من $M_X(t)$ إلى المتوسط والتباين، ومن شكل $M_X(t)$ إلى اسم التوزيع: مهارتان تتكرران في الاختبار. القواعد أولًا، ثم اشتقاق خطوة خطوة، ثم مسائل تعرّف." />
      </header>

      <section aria-labelledby="mgf-rules-h">
        <h2 id="mgf-rules-h">القواعد</h2>
        <div className="mgf-rules">
          {mgfRules.map((r) => (
            <div key={r.title} className="mgf-rule">
              <h3>{r.title}</h3>
              {r.tex && <Tex tex={r.tex} display />}
              <Rich as="p" text={r.text} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="mgf-der-h">
        <h2 id="mgf-der-h">اشتق المتوسط والتباين</h2>
        <div className="seg-tabs" role="group" aria-label="التوزيع">
          {derive.map((d) => (
            <button key={d.id} type="button" className={`seg-tab ${tab === d.id ? 'on' : ''}`} aria-pressed={tab === d.id} onClick={() => setTab(d.id)}>
              {sheetById[d.dist].nameAr}
            </button>
          ))}
        </div>
        <DeriveCard key={item.id} item={item} />
      </section>

      <section aria-labelledby="mgf-id-h" className="mgf-id">
        <h2 id="mgf-id-h">تعرّف على التوزيع من دالته المولدة</h2>
        <p className="hint">الدالة المولدة تحدد التوزيع تمامًا (إذا وُجدت حول الصفر)، فشكلها يكفي لمعرفته.</p>
        <div className="progress-line">
          <span>المسألة {idx + 1} من {identify.length}</span>
          <span>أنهيت: {done} من {identify.length}</span>
        </div>
        <div className="progress-bar" role="progressbar" aria-label="التقدم" aria-valuemin={0} aria-valuemax={identify.length} aria-valuenow={done}>
          <span style={{ width: `${(done / identify.length) * 100}%` }} />
        </div>
        <IdentifyCard key={it.id} it={it} n={idx + 1} />
        <div className="pager">
          <button type="button" className="btn" aria-disabled={idx === 0} onClick={() => idx > 0 && setIdx(idx - 1)}>→ السابقة</button>
          <button type="button" className="btn" aria-disabled={idx === identify.length - 1} onClick={() => idx < identify.length - 1 && setIdx(idx + 1)}>التالية ←</button>
        </div>
        <p className="hint">
          الدوال كلها في <a href={href.exam}>ليلة الاختبار</a> مع مجال <Tex tex="t" /> لكل منها.
        </p>
      </section>
    </article>
  );
}

function DeriveCard({ item }: { item: DeriveItem }) {
  const quiz = useProgress().quiz;
  const row = sheetById[item.dist];
  const k = (i: number) => `mgf-d-${item.id}-${i + 1}`;
  const shown = item.steps.findIndex((_, i) => quiz[k(i)] === undefined);
  const last = shown === -1 ? item.steps.length - 1 : shown;
  return (
    <div className="drill-card mgf-card">
      <div className="scenario">
        <Tex tex={item.given} display />
        {item.setup && <Rich as="p" text={item.setup} />}
      </div>
      {item.steps.slice(0, last + 1).map((s, i) => (
        <ChoiceCheck key={k(i)} id={k(i)} q={s} kicker={`الخطوة ${i + 1}`} />
      ))}
      {shown === -1 && (
        <p className="callout">
          <strong>الخلاصة: </strong>
          <Tex tex={row.mean} />، <Tex tex={row.variance} /> — كما في الورقة.
        </p>
      )}
    </div>
  );
}

function IdentifyCard({ it, n }: { it: IdentifyItem; n: number }) {
  const quiz = useProgress().quiz;
  const k = (i: number) => `mgf-i-${it.id}-${i}`;
  const s1 = quiz[k(1)] !== undefined;
  const s2 = quiz[k(2)] !== undefined;
  return (
    <div className="drill-card">
      <div className="scenario" tabIndex={-1} aria-label={`المسألة ${n}`}>
        <Rich as="p" text={it.text} />
      </div>
      <ChoiceCheck id={k(1)} q={it.which} kicker="الخطوة 1 · أي توزيع؟" />
      {s1 && <ChoiceCheck id={k(2)} q={it.param} kicker="الخطوة 2 · المعلمات" />}
      {s1 && s2 && <ChoiceCheck id={k(3)} q={it.calc} kicker="الخطوة 3 · الحساب" />}
    </div>
  );
}
