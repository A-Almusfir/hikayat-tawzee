import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { DistId } from '../content/types';
import { decisionNote, decisionTree, hint, type DecisionNode, type Leaf } from '../content/decision';
import { choiceLabels } from '../content/chooser';
import { distById } from '../content/distributions';
import { chapters } from '../content/chapters';
import { identity, journey } from '../content/identity';
import { moreCards } from '../content/more';
import { sheet, sheetById, sheetFixes, symbols, type SheetRow } from '../content/sheet';
import { twins } from '../content/twins';
import { Glyph } from '../components/Glyph';
import { Rich, Tex } from '../components/Tex';
import { href, scrollToId } from '../lib/router';

// كل ما في هذه الصفحة يُقرأ من ورقة القوانين (sheet.ts) وبطاقات التوزيعات ومخطط القرار (مصدر واحد للحقيقة).
export function ExamNightPage() {
  return (
    <article className="exam-night">
      <header className="page-head">
        <h1 tabIndex={-1}>ليلة الاختبار</h1>
        <p className="lead">ورقة القوانين كاملة بترتيبها وأعمدتها: {sheet.filter((s) => !s.extra).length} توزيعًا، ومعها ملاحظات تكمل ما ينقصها وتصحح خطأها. ثم قاموس الرموز، ومخطط يحدد التوزيع من نص المسألة.</p>
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
            اطبع / احفظ PDF
          </button>
          <a className="btn btn-quiet" href={href.drill}>تدرّب على مسائل مختلطة</a>
        </div>
      </header>

      <nav className="jump no-print" aria-label="أقسام الصفحة">
        {[['sheet-discrete', 'المتقطعة'], ['sheet-continuous', 'المستمرة'], ['fix-h', 'الملاحظات'], ['sym-h', 'الرموز'], ['decision-h', 'المخطط'], ['twins-h', 'التوائم']].map(([id, t]) => (
          <button key={id} type="button" className="seg-tab" onClick={() => jump(id)}>{t}</button>
        ))}
      </nav>
      <p className="hint">الأرقام الصغيرة بجانب أسماء التوزيعات = ملاحظات على الورقة، تجدها أسفل الجدولين.</p>
      <SheetTable group="discrete" title="المتقطعة" />
      <SheetTable group="continuous" title="المستمرة" />

      <section aria-labelledby="fix-h" className="sheet-fixes">
        <h2 id="fix-h">ورقة القوانين: ما ينقصها وما يحتاج تصحيحًا</h2>
        <p>الجدولان أعلاه منقولان كما هما من ورقة قوانين المقرر، وفيها خانات فارغة وشروط غير مذكورة وخطأ واحد. هنا نكمل الناقص ونصحح الخطأ حتى لا تنقله إلى إجابتك. الرقم بجانب اسم التوزيع في الجدول يوصلك إلى ملاحظته، و«↑ ارجع للجدول» يرجعك.</p>
        <ol>
          {sheetFixes.map((f) => (
            <li key={f.id} id={`fix-${f.id}`} tabIndex={-1}>
              <span className={`fix-kind ${f.kind}`}>{FIX_KIND[f.kind]}</span> <Rich text={f.text} />{' '}
              <button type="button" className="link-btn no-print" onClick={() => scrollToId(`row-${f.rows[0]}`)}>
                ↑ ارجع للجدول
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="sym-h">
        <h2 id="sym-h">قاموس الرموز</h2>
        <dl className="symbols">
          {symbols.map((s) => (
            <div key={s.sym}>
              <dt><Tex tex={s.sym} /></dt>
              <dd><Rich text={s.meaning} /></dd>
            </div>
          ))}
        </dl>
      </section>

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
    </article>
  );
}

/** قفز إلى قسم: يفتح القسم المطوي أولًا إن كان العنوان داخله. */
function jump(id: string) {
  const d = document.getElementById(id)?.closest('details');
  if (d) d.open = true;
  scrollToId(id);
}

const FIX_KIND = { error: 'خطأ في الورقة', add: 'إضافة', clarify: 'توضيح', notation: 'اختلاف رموز' } as const;
const fixNumbers = (id: SheetRow['id']) => sheetFixes.flatMap((f, i) => (f.rows.includes(id) ? [{ n: i + 1, id: f.id, kind: f.kind }] : []));
const isDist = (id: string): id is DistId => id in identity;
/** وجهة صف الورقة: فصله إن نُشر، وإلا بطاقته في «توزيعات أخرى»، والمعياري إلى فصل الطبيعي. */
const rowLink = (id: SheetRow['id']) =>
  isDist(id) && chapters[id] ? href.dist(id) : id === 'stdnormal' ? href.dist('normal') : moreCards.some((c) => c.id === id) ? href.more(id) : undefined;

/** جدول بأعمدة ورقة المقرر نفسها. الرابط إلى الفصل يظهر فقط إن كان الفصل منشورًا. */
function SheetTable({ group, title }: { group: SheetRow['group']; title: string }) {
  const rows = sheet.filter((s) => s.group === group);
  const cont = group === 'continuous';
  return (
    <section aria-labelledby={`sheet-${group}`}>
      <h2 id={`sheet-${group}`}>{title}</h2>
      <table className="cheat sheet-table" role="table">
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">التوزيع</th>
            <th scope="col" role="columnheader">{cont ? <Tex tex="f(x)" /> : <Tex tex="f(x) = P(X = x)" />}</th>
            <th scope="col" role="columnheader">المتوسط والتباين</th>
            <th scope="col" role="columnheader"><Tex tex="M_X(t)" /></th>
            {cont && <th scope="col" role="columnheader"><Tex tex="F(x)" /></th>}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((s) => {
            const dist = isDist(s.id) ? s.id : undefined;
            const name = (
              <>
                {dist && <Glyph id={dist} size={20} />} {s.nameAr}
              </>
            );
            return (
              <tr key={s.id} id={`row-${s.id}`} tabIndex={-1} role="row" style={{ '--c': dist ? identity[dist].color : 'var(--ink-2)' } as CSSProperties}>
                <th scope="row" role="rowheader">
                  <span className="sheet-name">
                    {rowLink(s.id) ? <a href={rowLink(s.id)}>{name}</a> : <span className="nolink">{name}</span>}
                    <span className="en" lang="en" dir="ltr">{s.nameEn}</span>
                  </span>
                  <span className="sheet-marks">
                    {s.extra && <span className="tag">ليس في الورقة</span>}
                    {fixNumbers(s.id).map((f) => (
                      <button key={f.id} type="button" className={`fix-mark ${f.kind}`} aria-label={`ملاحظة ${f.n} (${FIX_KIND[f.kind]}): انتقل إليه`} onClick={() => scrollToId(`fix-${f.id}`)}>
                        {f.n}
                      </button>
                    ))}
                  </span>
                </th>
                <td role="cell" data-label="القانون">
                  <Tex tex={s.f} />
                  <span className="sub"><Tex tex={s.support} /></span>
                  <Rich className="sub" text={s.params} />
                </td>
                <td role="cell" data-label="المتوسط والتباين">
                  <Tex tex={s.mean} />
                  <Tex tex={s.variance} />
                </td>
                <td role="cell" data-label="الدالة المولدة">
                  {s.mgf.kind === 'closed' ? (
                    <>
                      <Tex tex={s.mgf.tex} />
                      <Rich className="sub" text={s.mgf.domain} />
                    </>
                  ) : (
                    <span className="sheet-note">
                      <strong>{s.mgf.kind === 'none' ? 'غير موجودة' : 'بلا صيغة بسيطة'}</strong> <Rich text={s.mgf.note} />
                    </span>
                  )}
                </td>
                {cont && (
                  <td role="cell" data-label="التراكمي">
                    {!s.cdf ? null : s.cdf.kind === 'closed' ? <Tex tex={s.cdf.tex} /> : <span className="sheet-note"><Rich text={s.cdf.note} /></span>}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
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
