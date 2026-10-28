import { useEffect, useState } from 'react';
import { choiceLabels, scenarios, type ChoiceId } from '../content/chooser';
import { distById, distOrder, distributions } from '../content/distributions';
import { references } from '../content/references';
import { relations } from '../content/relations';
import type { DistId } from '../content/types';
import { HomeTeaser, labs } from '../components/labs';
import { DistCardView, FormulaSection, Quiz, StorySection, WorkedExample } from '../components/sections';
import { Rich, Tex } from '../components/Tex';
import { Callout } from '../components/ui';
import { href, scrollToId } from '../lib/router';
import { progress, useProgress, type CardStatus } from '../lib/storage';

// ———————— الرئيسية ————————
export function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="kicker">دليل تفاعلي للتوزيعات الاحتمالية</p>
        <h1 tabIndex={-1}>حكاية توزيع</h1>
        <p className="slogan">افهم الحكاية… يثبت القانون.</p>
        <p className="hero-sub">ستة توزيعات من مقررات الاحتمالات والإحصاء التمهيدية. لكل توزيع: قصة، فتجربة بصرية، فتفسير القانون، فمثال محلول، فاختبار قصير.</p>
        <div className="btn-row">
          <a className="btn btn-primary" href={href.dist('bernoulli')}>ابدأ بالحكاية ←</a>
          <a className="btn" href={href.choose}>أي توزيع أختار؟</a>
          <a className="btn" href={href.cards}>بطاقات المراجعة</a>
        </div>
      </section>

      <section className="section" aria-labelledby="try-h">
        <h2 id="try-h">جرّب الآن</h2>
        <HomeTeaser />
      </section>

      <section className="section" aria-labelledby="pick-h">
        <h2 id="pick-h">اختر حكاية</h2>
        <ol className="dist-list">
          {distributions.map((d, i) => (
            <li key={d.id}>
              <a href={href.dist(d.id)}>
                <span className="dl-n" aria-hidden="true">{i + 1}</span>
                <span className="dl-body">
                  <span className="dl-name">
                    {d.nameAr} <span className="en" lang="en" dir="ltr">{d.nameEn}</span>
                    <span className="tag">{d.type === 'discrete' ? 'متقطع' : 'مستمر'}</span>
                  </span>
                  <span className="dl-q">{d.question}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="section tools" aria-labelledby="tools-h">
        <h2 id="tools-h">أدوات المراجعة</h2>
        <ul className="tool-list">
          <li>
            <a href={href.choose}><strong>أي توزيع أختار؟</strong></a>
            <span>{scenarios.length} موقفًا قصيرًا تختار لكل منها التوزيع، وترى السبب وأقرب بديل خاطئ.</span>
          </li>
          <li>
            <a href={href.cards}><strong>بطاقات من الذاكرة</strong></a>
            <span>أخفِ القانون والمتوسط والتباين والشروط، واختبر ذاكرتك. قابلة للطباعة.</span>
          </li>
          <li>
            <a href={href.map}><strong>خريطة العلاقات</strong></a>
            <span>كيف يولد ذو الحدين والهندسي من برنولي، وكيف يرتبط بواسون بالأسي.</span>
          </li>
        </ul>
      </section>
    </>
  );
}

// ———————— صفحة التوزيع ————————
const SECTIONS = [
  { id: 'story', title: 'الحكاية' },
  { id: 'lab', title: 'جرّب بنفسك' },
  { id: 'law', title: 'كيف جاء القانون؟' },
  { id: 'example', title: 'مثال محلول' },
  { id: 'card', title: 'بطاقة التوزيع' },
  { id: 'quiz', title: 'اختبر فهمك' },
];

export function DistPage({ id }: { id: string }) {
  const d = distById[id as DistId];
  if (!d) return <NotFound />;
  const Lab = labs[d.id];
  const i = distOrder.indexOf(d.id);
  const prev = distOrder[i - 1];
  const next = distOrder[i + 1];
  return (
    <article className="dist-page">
      <header className="dist-head">
        <p className="kicker">الحكاية {i + 1} من 6 · {d.type === 'discrete' ? 'توزيع متقطع' : 'توزيع مستمر'}</p>
        <h1 tabIndex={-1}>
          {d.nameAr} <span className="en" lang="en" dir="ltr">{d.nameEn}</span>
        </h1>
        <p className="dist-q">{d.question}</p>
        <Tex tex={d.notation} display />
        <nav aria-label="أقسام الصفحة" className="toc">
          {SECTIONS.map((s, k) => (
            <button key={s.id} type="button" onClick={() => scrollToId(s.id)}>
              <span aria-hidden="true">{k + 1}</span> {s.title}
            </button>
          ))}
        </nav>
      </header>

      <Section n={1} id="story" title="الحكاية"><StorySection d={d} /></Section>
      <Section n={2} id="lab" title="جرّب بنفسك">
        <Rich as="p" className="lead" text={d.labIntro} />
        <Lab />
      </Section>
      <Section n={3} id="law" title="كيف جاء القانون؟"><FormulaSection d={d} /></Section>
      <Section n={4} id="example" title="مثال محلول"><WorkedExample d={d} /></Section>
      <Section n={5} id="card" title="بطاقة التوزيع"><DistCardView d={d} /></Section>
      <Section n={6} id="quiz" title="اختبر فهمك"><Quiz d={d} /></Section>

      <nav className="pager" aria-label="التنقل بين التوزيعات">
        {prev ? <a href={href.dist(prev)}>→ السابق: {distById[prev].nameAr}</a> : <a href={href.home}>→ الرئيسية</a>}
        {next ? <a href={href.dist(next)}>التالي: {distById[next].nameAr} ←</a> : <a href={href.choose}>تدرّب: أي توزيع أختار؟ ←</a>}
      </nav>
    </article>
  );
}

function Section({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="section" id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} tabIndex={-1}>
        <span className="sec-n" aria-hidden="true">{n}</span> {title}
      </h2>
      {children}
    </section>
  );
}

// ———————— أي توزيع أختار؟ ————————
const CHOICES: ChoiceId[] = ['bernoulli', 'binomial', 'geometric', 'poisson', 'exponential', 'normal', 'insufficient'];

export function ChooserPage() {
  const saved = useProgress().chooser;
  const [idx, setIdx] = useState(() => {
    const first = scenarios.findIndex((s) => !saved[s.id]);
    return first === -1 ? 0 : first;
  });
  const s = scenarios[idx];
  const choice = saved[s.id] as ChoiceId | undefined;
  const answered = choice !== undefined;
  const right = choice === s.answer;
  const doneCount = scenarios.filter((x) => saved[x.id]).length;
  const correctCount = scenarios.filter((x) => saved[x.id] === x.answer).length;
  useEffect(() => {
    document.getElementById('scenario-text')?.focus({ preventScroll: true });
  }, [idx]);
  return (
    <article>
      <header className="page-head">
        <h1 tabIndex={-1}>أي توزيع أختار؟</h1>
        <p className="lead">اقرأ الموقف وحدّد: ماذا نعدّ أو نقيس؟ هل عدد المحاولات ثابت؟ هل المتغير متقطع أم مستمر؟ وهل الشروط متحققة؟ لا تعتمد على كلمة مفتاحية.</p>
      </header>
      <div className="chooser">
        <div className="progress-line">
          <span>الموقف {idx + 1} من {scenarios.length}</span>
          <span>أُجيب: {doneCount} · صحيح: {correctCount}</span>
        </div>
        <div className="progress-bar" role="progressbar" aria-label="التقدم" aria-valuemin={0} aria-valuemax={scenarios.length} aria-valuenow={doneCount}>
          <span style={{ width: `${(doneCount / scenarios.length) * 100}%` }} />
        </div>
        <Rich as="p" className="scenario" text={s.text} />
        <span id="scenario-text" tabIndex={-1} className="sr-only">الموقف {idx + 1}</span>
        <fieldset className="choices">
          <legend>اختر التوزيع المناسب:</legend>
          {CHOICES.map((c) => {
            const st = !answered ? '' : c === s.answer ? 'is-correct' : c === choice ? 'is-wrong' : '';
            return (
              <label key={c} className={`option ${st}`}>
                <input type="radio" name={`ch-${s.id}`} checked={choice === c} disabled={answered} onChange={() => progress.setChooser(s.id, c)} />
                <span className="opt-mark" aria-hidden="true">{st === 'is-correct' ? '✓' : st === 'is-wrong' ? '✗' : ''}</span>
                {choiceLabels[c]}
              </label>
            );
          })}
        </fieldset>
        {answered && (
          <div className={`feedback ${right ? 'ok' : 'no'}`} role="status">
            <p className="verdict">{right ? '✓ صحيح.' : `✗ اخترت «${choiceLabels[choice!]}».`} الإجابة: <strong>{choiceLabels[s.answer]}</strong></p>
            <dl className="why-grid">
              <dt>لماذا؟</dt>
              <dd><Rich text={s.why} /></dd>
              <dt>لماذا لا يصلح «{choiceLabels[s.closest]}»؟</dt>
              <dd><Rich text={s.whyNotClosest} /></dd>
              <dt>الافتراض الذي يعتمد عليه الاختيار</dt>
              <dd><Rich text={s.assumption} /></dd>
            </dl>
            <button type="button" className="btn btn-quiet" onClick={() => progress.setChooser(s.id, undefined)}>أعد هذا الموقف</button>
          </div>
        )}
        <div className="pager">
          <button type="button" className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>→ السابق</button>
          <button type="button" className="btn" disabled={idx === scenarios.length - 1} onClick={() => setIdx(idx + 1)}>التالي ←</button>
        </div>
        {doneCount === scenarios.length && (
          <p className="score" role="status">أنهيت كل المواقف: {correctCount} صحيحة من {scenarios.length}.</p>
        )}
      </div>
    </article>
  );
}

// ———————— بطاقات من الذاكرة ————————
const FIELDS = [
  { key: 'law', label: 'القانون' },
  { key: 'support', label: 'مجال X' },
  { key: 'mean', label: 'المتوسط' },
  { key: 'variance', label: 'التباين' },
  { key: 'conditions', label: 'شروط الاستخدام' },
] as const;
type FieldKey = (typeof FIELDS)[number]['key'];

function FlashCard({ id }: { id: DistId }) {
  const d = distById[id];
  const status = useProgress().cards[id];
  const [open, setOpen] = useState<Record<FieldKey, boolean>>({ law: false, support: false, mean: false, variance: false, conditions: false });
  const all = FIELDS.every((f) => open[f.key]);
  const set = (s: CardStatus) => progress.setCard(id, status === s ? undefined : s);
  const body: Record<FieldKey, React.ReactNode> = {
    law: <><span className="fl-sub">{d.card.fnLabel}</span><Tex tex={d.card.fnTex} display /></>,
    support: <Tex tex={d.card.support} />,
    mean: <Tex tex={d.card.mean} />,
    variance: <Tex tex={d.card.variance} />,
    conditions: <ul>{d.card.conditions.map((c, i) => <Rich key={i} as="li" text={c} />)}</ul>,
  };
  return (
    <article className={`flash ${status ? `st-${status}` : ''}`} aria-labelledby={`fc-${id}`}>
      <header>
        <h2 id={`fc-${id}`}>
          {d.nameAr} <span className="en" lang="en" dir="ltr">{d.nameEn}</span>
        </h2>
        <Tex tex={d.notation} />
        <span className="tag">{d.type === 'discrete' ? 'متقطع' : 'مستمر'}</span>
        {status && <span className={`status-pill ${status}`}>{status === 'known' ? '✓ عرفتها' : '↻ للمراجعة'}</span>}
      </header>
      <dl>
        {FIELDS.map((f) => (
          <div key={f.key} className="fl-row">
            <dt>
              <button type="button" className="reveal" aria-expanded={open[f.key]} onClick={() => setOpen({ ...open, [f.key]: !open[f.key] })}>
                <span aria-hidden="true">{open[f.key] ? '−' : '+'}</span> {f.label}
              </button>
            </dt>
            <dd className={open[f.key] ? 'shown' : 'hidden-field'}>
              {open[f.key] ? body[f.key] : <span className="placeholder">تذكّرها أولًا ثم اكشفها</span>}
              <div className="print-only">{body[f.key]}</div>
            </dd>
          </div>
        ))}
      </dl>
      <div className="btn-row no-print">
        <button type="button" className="btn btn-quiet" onClick={() => setOpen(Object.fromEntries(FIELDS.map((f) => [f.key, !all])) as Record<FieldKey, boolean>)}>
          {all ? 'أخفِ الكل' : 'اكشف الكل'}
        </button>
        <button type="button" className={`btn ${status === 'known' ? 'btn-on' : ''}`} aria-pressed={status === 'known'} onClick={() => set('known')}>✓ عرفتها</button>
        <button type="button" className={`btn ${status === 'review' ? 'btn-on' : ''}`} aria-pressed={status === 'review'} onClick={() => set('review')}>↻ أراجعها</button>
        <a className="btn btn-quiet" href={href.dist(id)}>افتح الحكاية</a>
      </div>
    </article>
  );
}

export function CardsPage() {
  const cards = useProgress().cards;
  const [onlyReview, setOnlyReview] = useState(false);
  const list = distOrder.filter((id) => !onlyReview || cards[id] === 'review');
  const known = distOrder.filter((id) => cards[id] === 'known').length;
  const review = distOrder.filter((id) => cards[id] === 'review').length;
  return (
    <article>
      <header className="page-head">
        <h1 tabIndex={-1}>بطاقات من الذاكرة</h1>
        <p className="lead">حاول أن تتذكر كل حقل قبل كشفه. ثم صنّف البطاقة: «عرفتها» أو «أراجعها».</p>
      </header>
      <div className="cards-bar no-print">
        <label className="toggle">
          <input type="checkbox" checked={onlyReview} onChange={(e) => setOnlyReview(e.target.checked)} /> اعرض بطاقات «أراجعها» فقط ({review})
        </label>
        <span>عرفتها: {known} من 6</span>
        <button type="button" className="btn" onClick={() => window.print()}>اطبع / احفظ PDF</button>
      </div>
      <p className="hint no-print">عند الطباعة تظهر كل الحقول مكشوفة. اختر «حفظ بتنسيق PDF» من نافذة الطباعة في المتصفح.</p>
      {list.length === 0 ? (
        <p className="empty">لا توجد بطاقات مصنفة «أراجعها» بعد.</p>
      ) : (
        <div className="flash-grid">
          {list.map((id) => (
            <FlashCard key={id} id={id} />
          ))}
        </div>
      )}
    </article>
  );
}

// ———————— خريطة العلاقات ————————
const NODE_POS: Record<DistId, { x: number; y: number }> = {
  bernoulli: { x: 300, y: 60 },
  binomial: { x: 130, y: 190 },
  geometric: { x: 470, y: 190 },
  poisson: { x: 130, y: 330 },
  exponential: { x: 470, y: 330 },
  normal: { x: 300, y: 440 },
};

export function MapPage() {
  const [sel, setSel] = useState(relations[0].id);
  const r = relations.find((x) => x.id === sel)!;
  return (
    <article>
      <header className="page-head">
        <h1 tabIndex={-1}>خريطة العلاقات</h1>
        <p className="lead">اضغط على أي علاقة لترى معناها ومثالًا قصيرًا. نعرض هنا علاقات دقيقة فقط؛ أما التقريبات (مثل تقريب ذي الحدين بالطبيعي) فتحتاج شروطًا تفصيلية وأجّلناها.</p>
      </header>
      <div className="map-wrap">
        <svg viewBox="0 0 600 490" className="map" role="group" aria-label="خريطة العلاقات بين التوزيعات" direction="ltr">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          {relations.map((rel) => {
            const a = NODE_POS[rel.from], b = NODE_POS[rel.to];
            const active = rel.id === sel;
            const both = rel.id === 'poi-exp';
            const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
            const pad = 52;
            const x1 = a.x + (dx / len) * pad, y1 = a.y + (dy / len) * (pad - 18);
            const x2 = b.x - (dx / len) * pad, y2 = b.y - (dy / len) * (pad - 18);
            return (
              <g
                key={rel.id}
                className={`edge ${active ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={`${distById[rel.from].nameAr} و${distById[rel.to].nameAr}: ${rel.label}`}
                onClick={() => setSel(rel.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSel(rel.id);
                  }
                }}
              >
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="edge-hit" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="edge-line" markerEnd="url(#arr)" markerStart={both ? 'url(#arr)' : undefined} />
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} textAnchor="middle" className="edge-label" direction="rtl">
                  {rel.label}
                </text>
              </g>
            );
          })}
          {distributions.map((d) => {
            const p = NODE_POS[d.id];
            return (
              <a key={d.id} href={href.dist(d.id)} className="node" aria-label={`افتح حكاية ${d.nameAr}`}>
                <rect x={p.x - 78} y={p.y - 30} width="156" height="60" rx="10" className={d.id === 'normal' ? 'node-iso' : ''} />
                <text x={p.x} y={p.y - 3} textAnchor="middle" className="node-ar" direction="rtl">{d.nameAr}</text>
                <text x={p.x} y={p.y + 19} textAnchor="middle" className="node-en">{d.nameEn}</text>
              </a>
            );
          })}
        </svg>
        <div className="map-panel" aria-live="polite">
          <h2>
            {distById[r.from].nameAr} {r.id === 'poi-exp' ? '↔' : '←'} {distById[r.to].nameAr}: {r.label}
          </h2>
          <Rich as="p" text={r.summary} />
          <Tex tex={r.tex} display />
          <h3>مثال</h3>
          <Rich as="p" text={r.example} />
          <p className="cond"><strong>الشرط: </strong><Rich text={r.condition} /></p>
          <div className="btn-row">
            {relations.map((x) => (
              <button key={x.id} type="button" className={`btn ${x.id === sel ? 'btn-on' : 'btn-quiet'}`} aria-pressed={x.id === sel} onClick={() => setSel(x.id)}>
                {distById[x.from].nameAr} {x.id === 'poi-exp' ? '↔' : '←'} {distById[x.to].nameAr}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Callout title="لماذا يقف الطبيعي وحيدًا؟">
        <p>يرتبط الطبيعي بتوزيعات كثيرة عبر تقريبات (مثل مبرهنة النهاية المركزية وتقريب ذي الحدين وبواسون)، لكن كل تقريب يحتاج شروطًا على حجم المعلمات. لم نضفها في هذه النسخة حتى لا تُفهم علاقات تقريبية على أنها مساواة دقيقة.</p>
      </Callout>
    </article>
  );
}

// ———————— المراجع والمنهج ————————
export function RefsPage() {
  return (
    <article className="refs">
      <header className="page-head">
        <h1 tabIndex={-1}>المراجع والمنهج</h1>
      </header>
      <section className="section">
        <h2>كيف كُتب المحتوى؟</h2>
        <ul>
          <li>الشروح والأمثلة مكتوبة بصياغة أصلية، والأمثلة كلها <strong>تعليمية مصطنعة</strong> (مصنع، مكتب مساعدة، آلة تعبئة…) وليست بيانات حقيقية.</li>
          <li>كل رقم في الأمثلة المحلولة والأسئلة الحسابية يُعاد حسابه آليًا في اختبارات المشروع، ويُرفض البناء إن لم يطابق الحساب النص المعروض.</li>
          <li>الرسوم مبنية مباشرة من القوانين؛ والمحاكاة تستخدم مولّد أعداد عشوائية في المتصفح، ونتائجها تتغير من تشغيل لآخر.</li>
          <li>للتوزيع الطبيعي قدّمنا حدسًا وحقائق قابلة للإثبات، ولم نقدم «اشتقاقًا مبسطًا» لأنه يحتاج أدوات أعلى من المقرر التمهيدي.</li>
        </ul>
      </section>
      <section className="section">
        <h2>الاصطلاحات المستخدمة</h2>
        <ul>
          <li><Rich text="برنولي: $X \in \{0,1\}$ و$P(X=1) = p$." /></li>
          <li><Rich text="ذو الحدين: $X$ عدد النجاحات في $n$ محاولة مستقلة باحتمال ثابت $p$." /></li>
          <li><Rich text="الهندسي: $X$ عدد **المحاولات** حتى أول نجاح بما فيها محاولة النجاح، $X \in \{1,2,\dots\}$. (اصطلاح آخر شائع يعدّ الإخفاقات قبله.)" /></li>
          <li><Rich text="بواسون: $\lambda$ متوسط عدد الأحداث في الفترة؛ ومع معدل $r$ وزمن $t$: $\lambda = rt$." /></li>
          <li><Rich text="الأسي: $\lambda$ **معدل** لا مقياس؛ المتوسط $1/\lambda$." /></li>
          <li><Rich text="الطبيعي: $N(\mu, \sigma^2)$ حيث $\sigma$ الانحراف المعياري و$\sigma^2$ التباين." /></li>
        </ul>
      </section>
      <section className="section">
        <h2>المصادر التي رُجع إليها</h2>
        <Callout kind="warn" title="حدود التحقق — بشفافية">
          <p>
            أثناء الإعداد لم يكن الوصول المباشر إلى صفحات هذه المصادر متاحًا من بيئة العمل، فجرت المطابقة عبر مقتطفات نتائج البحث التي تعرض نص الصفحات المعنية. الصيغ نفسها قياسية ومتحقق منها أيضًا رياضيًا في اختبارات المشروع (مجموع الاحتمالات، المتوسط والتباين بالتعريف، قيم جداول Φ). يُنصح بمراجعة مختص قبل الاعتماد الرسمي في مقرر.
          </p>
        </Callout>
        <ul className="ref-list">
          {references.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" lang="en" dir="ltr">{r.title}</a>
              <Rich as="p" text={r.usedFor} />
            </li>
          ))}
        </ul>
      </section>
      <section className="section">
        <h2>الخصوصية</h2>
        <p>لا تسجيل دخول، ولا تحليلات تتبع، ولا خوادم. التقدم (البطاقات والإجابات) يُحفظ في متصفحك على هذا الجهاز فقط، ويمكنك مسحه من أسفل الصفحة.</p>
      </section>
    </article>
  );
}

export function NotFound() {
  return (
    <article className="page-head">
      <h1 tabIndex={-1}>الصفحة غير موجودة</h1>
      <p>
        <a href={href.home}>العودة إلى الرئيسية</a>
      </p>
    </article>
  );
}
