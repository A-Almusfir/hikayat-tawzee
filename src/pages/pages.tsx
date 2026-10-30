import { useEffect, useState } from 'react';
import { choiceLabels, choiceOrder, scenarios, type ChoiceId } from '../content/chooser';
import { distById } from '../content/distributions';
import { hint } from '../content/decision';
import { journey } from '../content/identity';
import { sheetById } from '../content/sheet';
import { references } from '../content/references';
import { sources } from '../content/sources';
import type { DistId } from '../content/types';
import { Rich, Tex } from '../components/Tex';
import { Callout } from '../components/ui';
import { href } from '../lib/router';
import { progress, useProgress, type CardStatus } from '../lib/storage';

// ———————— أي توزيع أختار؟ ————————
const CHOICES: ChoiceId[] = choiceOrder();

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
  { key: 'mgf', label: 'الدالة المولدة' },
  { key: 'conditions', label: 'متى نستعمله؟' },
] as const;
type FieldKey = (typeof FIELDS)[number]['key'];

/** بيانات البطاقة: القوانين من ورقة المقرر، والشروط من البطاقة القديمة إن وُجدت، وإلا من مخطط القرار. */
function flashData(id: DistId) {
  const d = distById[id], s = sheetById[id];
  return {
    nameAr: s.nameAr,
    nameEn: s.nameEn,
    notation: d?.notation,
    discrete: s.group === 'discrete',
    // القانون والمجال والعزوم برموز ورقة المقرر دائمًا (x وq وE(X))
    fnLabel: s.group === 'discrete' ? 'دالة الكتلة الاحتمالية' : 'دالة الكثافة الاحتمالية',
    fnTex: `${s.group === 'discrete' ? 'P(X=x)' : 'f(x)'} = ${s.f}`,
    support: s.support,
    mean: s.mean,
    variance: s.variance,
    conditions: d?.card.conditions ?? [hint[id]],
    mgf: s.mgf,
  };
}

function FlashCard({ id }: { id: DistId }) {
  const d = flashData(id);
  const status = useProgress().cards[id];
  const [open, setOpen] = useState<Record<FieldKey, boolean>>({ law: false, support: false, mean: false, variance: false, mgf: false, conditions: false });
  const all = FIELDS.every((f) => open[f.key]);
  const set = (s: CardStatus) => progress.setCard(id, status === s ? undefined : s);
  const body: Record<FieldKey, React.ReactNode> = {
    law: <><span className="fl-sub">{d.fnLabel}</span><Tex tex={d.fnTex} display /></>,
    support: <Tex tex={d.support} />,
    mean: <Tex tex={d.mean} />,
    variance: <Tex tex={d.variance} />,
    mgf: d.mgf.kind === 'closed' ? <><Tex tex={`M_X(t) = ${d.mgf.tex}`} /> <Rich text={`(${d.mgf.domain})`} /></> : <Rich text={d.mgf.note} />,
    conditions: <ul>{d.conditions.map((c, i) => <Rich key={i} as="li" text={c} />)}</ul>,
  };
  return (
    <article className={`flash ${status ? `st-${status}` : ''}`} aria-labelledby={`fc-${id}`}>
      <header>
        <h2 id={`fc-${id}`}>
          {d.nameAr} <span className="en" lang="en" dir="ltr">{d.nameEn}</span>
        </h2>
        {d.notation && <Tex tex={d.notation} />}
        <span className="tag">{d.discrete ? 'متقطع' : 'مستمر'}</span>
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
              {open[f.key] ? body[f.key] : <span className="placeholder">تذكّرها أول، بعدين اكشفها</span>}
              <div className="print-only">{body[f.key]}</div>
            </dd>
          </div>
        ))}
      </dl>
      <div className="btn-row no-print">
        <button type="button" className="btn btn-quiet" onClick={() => setOpen(Object.fromEntries(FIELDS.map((f) => [f.key, !all])) as Record<FieldKey, boolean>)}>
          {all ? 'سكّر الكل' : 'اكشف الكل'}
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
  const list = journey.filter((id) => !onlyReview || cards[id] === 'review');
  const known = journey.filter((id) => cards[id] === 'known').length;
  const review = journey.filter((id) => cards[id] === 'review').length;
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
        <span>عرفتها: {known} من {journey.length}</span>
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
          <li>الشروح مكتوبة بصياغة أصلية. الحكايات تاريخية موثقة بمصادرها، وبيانات ركلات الخيل حقيقية؛ أما أمثلة «بصيغة المقرر» والرسوم المولّدة من نماذج فهي <strong>تعليمية مصطنعة</strong> ومعلنة.</li>
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
          <li><Rich text="الأسي: $\theta$ **معدل** لا مقياس (كما في ورقة المقرر)؛ المتوسط $1/\theta$، ومتوسط عدد الأحداث في زمن $t$ هو $\lambda = \theta t$." /></li>
          <li><Rich text="فوق الهندسي: مجتمع $N$ فيه $k$ نجاحًا، ونسحب $n$ دون إرجاع." /></li>
          <li><Rich text="ذو الحدين السالب: $X$ عدد **المحاولات** حتى النجاح رقم $r$، و$x \ge r$ (برامج مثل R تعدّ الإخفاقات)." /></li>
          <li><Rich text="غاما: $\alpha$ شكل و$\beta$ **معدل**؛ المتوسط $\alpha/\beta$." /></li>
          <li><Rich text="ويبل (بصيغة الورقة): $f(x) = \alpha\beta x^{\beta-1}e^{-\alpha x^{\beta}}$، و$\beta$ هو الشكل." /></li>
          <li><Rich text="مربع كاي وt وF: $v$ (و$r$ للبسط في F) درجات الحرية." /></li>
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
        <h2>مصادر الحكايات</h2>
        <p className="hint">كل جملة تاريخية في الفصول مربوطة بمصدر من هذه القائمة، واختبارات المشروع تفشل إن وُجدت جملة بلا مصدر.</p>
        <ul className="ref-list">
          {sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.cite}</a>
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
