import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { decisionNote, decisionTree, hint, type DecisionNode, type Leaf } from '../content/decision';
import { choiceLabels } from '../content/chooser';
import { distById } from '../content/distributions';
import { identity, journey } from '../content/identity';
import { twins } from '../content/twins';
import { Glyph } from '../components/Glyph';
import { Rich, Tex } from '../components/Tex';
import { href } from '../lib/router';

// كل ما في هذه الصفحة يُقرأ من بطاقات التوزيعات ومخطط القرار (مصدر واحد للحقيقة).
export function ExamNightPage() {
  return (
    <article className="exam-night">
      <header className="page-head">
        <h1 tabIndex={-1}>ليلة الاختبار</h1>
        <p className="lead">الستة في صفحة واحدة: ماذا يسأل كل توزيع، وقانونه، ومتوسطه وتباينه، والفخ الذي يقع فيه الطلاب. ثم مخطط يحدد التوزيع من نص المسألة.</p>
        <div className="btn-row no-print">
          <button type="button" className="btn" onClick={() => window.print()}>اطبع / احفظ PDF</button>
          <a className="btn btn-quiet" href={href.drill}>تدرّب على مسائل مختلطة</a>
        </div>
      </header>

      <section aria-labelledby="sum-h">
        <h2 id="sum-h">الجدول</h2>
        <table className="cheat" role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader">التوزيع</th>
              <th scope="col" role="columnheader">ماذا يسأل؟</th>
              <th scope="col" role="columnheader">المعلمات</th>
              <th scope="col" role="columnheader">مجال X</th>
              <th scope="col" role="columnheader">القانون</th>
              <th scope="col" role="columnheader">المتوسط</th>
              <th scope="col" role="columnheader">التباين</th>
              <th scope="col" role="columnheader">الفخ الشائع</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {journey.map((id) => {
              const d = distById[id];
              const c = d.card;
              return (
                <tr key={id} role="row" style={{ '--c': identity[id].color } as CSSProperties}>
                  <th scope="row" role="rowheader">
                    <a href={href.dist(id)}>
                      <Glyph id={id} size={22} /> {d.nameAr}
                    </a>
                    <span className="tag">{d.type === 'discrete' ? 'متقطع' : 'مستمر'}</span>
                  </th>
                  <td role="cell" data-label="ماذا يسأل؟">{d.question}</td>
                  <td role="cell" data-label="المعلمات"><Tex tex={c.params.map((p) => p.tex).join(',\\ ')} /></td>
                  <td role="cell" data-label="مجال X"><Tex tex={c.support} /></td>
                  <td role="cell" data-label="القانون"><Tex tex={c.fnTex} /></td>
                  <td role="cell" data-label="المتوسط"><Tex tex={c.mean} /></td>
                  <td role="cell" data-label="التباين"><Tex tex={c.variance} /></td>
                  <td role="cell" data-label="الفخ الشائع"><Rich text={c.mistake} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <Fold title="أي توزيع؟ مخطط القرار">
        <p className="hint">اسأل عن بنية الموقف لا عن كلمة مفتاحية.</p>
        <div className="decision">
          <Node n={decisionTree} />
        </div>
        <Rich as="p" className="callout" text={decisionNote} />
      </Fold>

      <Fold title="التوائم: لا تخلط بينها">
        <div className="twins">
          {twins.map((t) => (
            <div key={t.a + t.b} className="twin">
              <div className="twin-pair">
                {[t.a, t.b].map((id, i) => (
                  <div key={id} className="twin-side" style={{ '--c': identity[id].color } as CSSProperties}>
                    <p className="twin-name"><Glyph id={id} size={20} /> {distById[id].nameAr}</p>
                    <Rich as="p" text={t.what[i]} />
                    <Tex tex={distById[id].card.fnTex} />
                    <p className="twin-mean"><Tex tex={distById[id].card.mean} /></p>
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

function LeafView({ l }: { l: Leaf }) {
  if (l === 'insufficient') return <span className="leaf">{choiceLabels.insufficient}</span>;
  return (
    <a className="leaf" href={href.dist(l)} style={{ '--c': identity[l].color } as CSSProperties}>
      <Glyph id={l} size={18} /> {distById[l].nameAr} <span className="leaf-h"><Rich text={hint[l]} /></span>
    </a>
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
function Fold({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 900px)').matches);
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('beforeprint', on);
    return () => window.removeEventListener('beforeprint', on);
  }, []);
  return (
    <details className="fold" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary><h2>{title}</h2></summary>
      {children}
    </details>
  );
}
