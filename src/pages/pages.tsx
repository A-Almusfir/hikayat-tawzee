import { useEffect, useMemo, useRef, useState } from 'react';
import { choiceLabels, choiceOrder, scenarios, type ChoiceId } from '../content/chooser';
import { distById } from '../content/distributions';
import { hint } from '../content/decision';
import { journey } from '../content/identity';
import { sheetById } from '../content/sheet';
import { references } from '../content/references';
import { sources } from '../content/sources';
import type { DistId } from '../content/types';
import { Rich, Tex } from '../components/Tex';
import { href } from '../lib/router';
import { progress, useProgress, type CardStatus } from '../lib/storage';
import { useLang } from '../lib/lang';
import { overlay, type Tr } from '../lib/i18n';
import type { DistContent } from '../content/types';

export type ChooserTr = { scenarios: Tr<typeof scenarios>; labels: Tr<typeof choiceLabels> };
export type CardsTr = { dist: Partial<Record<DistId, Tr<DistContent>>>; hint: Tr<typeof hint> };
export type RefsTr = { references: Tr<typeof references> };

// ———————— أي توزيع أختار؟ ————————
const CHOICES: ChoiceId[] = choiceOrder();

export function ChooserPage({ tr }: { tr?: ChooserTr }) {
  const en = useLang() === 'en' && !!tr;
  const list = useMemo(() => (en ? overlay(scenarios, tr!.scenarios) : scenarios), [en, tr]);
  const labels = useMemo(() => (en ? overlay(choiceLabels, tr!.labels) : choiceLabels), [en, tr]);
  const saved = useProgress().chooser;
  const [idx, setIdx] = useState(() => {
    const first = scenarios.findIndex((s) => !saved[s.id]);
    return first === -1 ? 0 : first;
  });
  const s = list[idx];
  const choice = saved[s.id] as ChoiceId | undefined;
  const answered = choice !== undefined;
  // التنقل بالأسهم يغيّر الاختيار فقط؛ الإجابة تُسجَّل بزر «تحقّق»
  const [pick, setPick] = useState<ChoiceId | null>(null);
  const fb = useRef<HTMLDivElement>(null);
  const checked = useRef(false);
  useEffect(() => setPick(null), [idx, answered]);
  useEffect(() => {
    if (answered && checked.current) fb.current?.focus();
    checked.current = false;
  }, [answered]);
  const right = choice === s.answer;
  const doneCount = scenarios.filter((x) => saved[x.id]).length;
  const correctCount = scenarios.filter((x) => saved[x.id] === x.answer).length;
  useEffect(() => {
    document.getElementById('scenario-text')?.focus({ preventScroll: true });
  }, [idx]);
  return (
    <article>
      <header className="page-head">
        <h1 tabIndex={-1}>{en ? 'Which distribution?' : 'أي توزيع أختار؟'}</h1>
        <p className="lead">
          {en
            ? 'Read the situation and decide: what are we counting or measuring? Is the number of trials fixed? Is the variable discrete or continuous? And do the conditions hold? Do not rely on a keyword.'
            : 'اقرأ الموقف وحدّد: ماذا نعدّ أو نقيس؟ هل عدد المحاولات ثابت؟ هل المتغير متقطع أم مستمر؟ وهل الشروط متحققة؟ لا تعتمد على كلمة مفتاحية.'}
        </p>
      </header>
      <div className="chooser">
        <div className="progress-line">
          <span>{en ? `Situation ${idx + 1} of ${scenarios.length}` : `الموقف ${idx + 1} من ${scenarios.length}`}</span>
          <span>{en ? `Answered: ${doneCount} · Correct: ${correctCount}` : `أُجيب: ${doneCount} · صحيح: ${correctCount}`}</span>
        </div>
        <div className="progress-bar" role="progressbar" aria-label={en ? 'Progress' : 'التقدم'} aria-valuemin={0} aria-valuemax={scenarios.length} aria-valuenow={doneCount}>
          <span style={{ width: `${(doneCount / scenarios.length) * 100}%` }} />
        </div>
        <Rich as="p" className="scenario" text={s.text} />
        <span id="scenario-text" tabIndex={-1} className="sr-only">{en ? `Situation ${idx + 1}` : `الموقف ${idx + 1}`}</span>
        <fieldset className="choices">
          <legend>{en ? 'Choose the right distribution:' : 'اختر التوزيع المناسب:'}</legend>
          {CHOICES.map((c) => {
            const st = !answered ? '' : c === s.answer ? 'is-correct' : c === choice ? 'is-wrong' : '';
            return (
              <label key={c} className={`option ${st}`}>
                <input type="radio" name={`ch-${s.id}`} checked={answered ? choice === c : pick === c} disabled={answered} onChange={() => setPick(c)} />
                <span className="opt-mark" aria-hidden="true">{st === 'is-correct' ? '✓' : st === 'is-wrong' ? '✗' : ''}</span>
                {labels[c]}
              </label>
            );
          })}
        </fieldset>
        {!answered && (
          <button type="button" className="btn btn-primary check-btn" disabled={pick === null} onClick={() => { if (pick) { checked.current = true; progress.setChooser(s.id, pick); } }}>
            {en ? 'Check' : 'تحقّق'}
          </button>
        )}
        {answered && (
          <div className={`feedback ${right ? 'ok' : 'no'}`} role="status" tabIndex={-1} ref={fb}>
            <p className="verdict">
              {en ? (right ? '✓ Correct.' : `✗ You chose “${labels[choice!]}”.`) : right ? '✓ صحيح.' : `✗ اخترت «${labels[choice!]}».`} {en ? 'The answer: ' : 'الإجابة: '}
              <strong>{labels[s.answer]}</strong>
            </p>
            <dl className="why-grid">
              <dt>{en ? 'Why?' : 'لماذا؟'}</dt>
              <dd><Rich text={s.why} /></dd>
              <dt>{en ? `Why not “${labels[s.closest]}”?` : `لماذا لا يصلح «${labels[s.closest]}»؟`}</dt>
              <dd><Rich text={s.whyNotClosest} /></dd>
              <dt>{en ? 'The assumption the choice relies on' : 'الافتراض الذي يعتمد عليه الاختيار'}</dt>
              <dd><Rich text={s.assumption} /></dd>
            </dl>
            <button type="button" className="btn btn-quiet" onClick={() => progress.setChooser(s.id, undefined)}>{en ? 'Redo this situation' : 'أعد هذا الموقف'}</button>
          </div>
        )}
        <div className="pager">
          <button type="button" className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>{en ? '← Previous' : '→ السابق'}</button>
          <button type="button" className="btn" disabled={idx === scenarios.length - 1} onClick={() => setIdx(idx + 1)}>{en ? 'Next →' : 'التالي ←'}</button>
        </div>
        {doneCount === scenarios.length && (
          <p className="score" role="status">
            {en ? `You finished all the situations: ${correctCount} correct out of ${scenarios.length}.` : `أنهيت كل المواقف: ${correctCount} صحيحة من ${scenarios.length}.`}
          </p>
        )}
      </div>
    </article>
  );
}

// ———————— بطاقات المراجعة ————————
const FIELDS = [
  { key: 'law', label: 'القانون', en: 'Formula' },
  { key: 'support', label: 'مجال X', en: 'Support of X' },
  { key: 'mean', label: 'المتوسط', en: 'Mean' },
  { key: 'variance', label: 'التباين', en: 'Variance' },
  { key: 'mgf', label: 'الدالة المولدة', en: 'MGF' },
  { key: 'conditions', label: 'متى نستعمله؟', en: 'When do we use it?' },
] as const;
type FieldKey = (typeof FIELDS)[number]['key'];

/** بيانات البطاقة: القوانين من ورقة المقرر، والشروط من البطاقة القديمة إن وُجدت، وإلا من مخطط القرار. */
function flashData(id: DistId, tr?: CardsTr) {
  const en = !!tr;
  const dAr = distById[id], s = sheetById[id];
  const d = dAr && en ? overlay(dAr, tr!.dist[id]) : dAr;
  const hints = en ? overlay(hint, tr!.hint) : hint;
  return {
    nameAr: s.nameAr,
    nameEn: s.nameEn,
    notation: d?.notation,
    discrete: s.group === 'discrete',
    // القانون والمجال والعزوم برموز ورقة المقرر دائمًا (x وq وE(X))
    fnLabel: en ? (s.group === 'discrete' ? 'Probability mass function' : 'Probability density function') : s.group === 'discrete' ? 'دالة الكتلة الاحتمالية' : 'دالة الكثافة الاحتمالية',
    fnTex: `${s.group === 'discrete' ? 'P(X=x)' : 'f(x)'} = ${s.f}`,
    support: s.support,
    mean: s.mean,
    variance: s.variance,
    conditions: d?.card.conditions ?? [hints[id]],
    mgf: s.mgf,
    mgfNote: en ? s.en.mgf : s.mgf.kind === 'closed' ? s.mgf.domain : s.mgf.note,
  };
}

function FlashCard({ id, tr }: { id: DistId; tr?: CardsTr }) {
  const en = !!tr;
  const d = flashData(id, tr);
  const status = useProgress().cards[id];
  const [open, setOpen] = useState<Record<FieldKey, boolean>>({ law: false, support: false, mean: false, variance: false, mgf: false, conditions: false });
  const all = FIELDS.every((f) => open[f.key]);
  const set = (s: CardStatus) => progress.setCard(id, status === s ? undefined : s);
  const body: Record<FieldKey, React.ReactNode> = {
    law: <><span className="fl-sub">{d.fnLabel}</span><Tex tex={d.fnTex} display /></>,
    support: <Tex tex={d.support} />,
    mean: <Tex tex={d.mean} />,
    variance: <Tex tex={d.variance} />,
    mgf: d.mgf.kind === 'closed' ? <><Tex tex={`M_X(t) = ${d.mgf.tex}`} /> <Rich text={`(${d.mgfNote})`} /></> : <Rich text={d.mgfNote} />,
    conditions: <ul>{d.conditions.map((c, i) => <Rich key={i} as="li" text={c} />)}</ul>,
  };
  return (
    <article className={`flash ${status ? `st-${status}` : ''}`} aria-labelledby={`fc-${id}`}>
      <header>
        <h2 id={`fc-${id}`}>
          {en ? d.nameEn : d.nameAr}{' '}
          <span className="en" lang={en ? 'ar' : 'en'} dir={en ? 'rtl' : 'ltr'}>{en ? d.nameAr : d.nameEn}</span>
        </h2>
        {d.notation && <Tex tex={d.notation} />}
        <span className="tag">{en ? (d.discrete ? 'discrete' : 'continuous') : d.discrete ? 'متقطع' : 'مستمر'}</span>
        {status && <span className={`status-pill ${status}`}>{status === 'known' ? (en ? '✓ Known' : '✓ عرفتها') : en ? '↻ To review' : '↻ للمراجعة'}</span>}
      </header>
      <dl>
        {FIELDS.map((f) => (
          <div key={f.key} className="fl-row">
            <dt>
              <button type="button" className="reveal" aria-expanded={open[f.key]} onClick={() => setOpen({ ...open, [f.key]: !open[f.key] })}>
                <span aria-hidden="true">{open[f.key] ? '−' : '+'}</span> {en ? f.en : f.label}
              </button>
            </dt>
            <dd className={open[f.key] ? 'shown' : 'hidden-field'}>
              {open[f.key] ? body[f.key] : <span className="placeholder">{en ? 'Recall it first, then reveal it' : 'تذكّرها أول، بعدين اكشفها'}</span>}
              <div className="print-only">{body[f.key]}</div>
            </dd>
          </div>
        ))}
      </dl>
      <div className="btn-row no-print">
        <button type="button" className="btn btn-quiet" onClick={() => setOpen(Object.fromEntries(FIELDS.map((f) => [f.key, !all])) as Record<FieldKey, boolean>)}>
          {en ? (all ? 'Hide all' : 'Reveal all') : all ? 'سكّر الكل' : 'اكشف الكل'}
        </button>
        <button type="button" className={`btn ${status === 'known' ? 'btn-on' : ''}`} aria-pressed={status === 'known'} onClick={() => set('known')}>{en ? '✓ I knew it' : '✓ عرفتها'}</button>
        <button type="button" className={`btn ${status === 'review' ? 'btn-on' : ''}`} aria-pressed={status === 'review'} onClick={() => set('review')}>{en ? '↻ Review it' : '↻ أراجعها'}</button>
        <a className="btn btn-quiet" href={href.dist(id)}>{en ? 'Open the story' : 'افتح الحكاية'}</a>
      </div>
    </article>
  );
}

export function CardsPage({ tr }: { tr?: CardsTr }) {
  const en = useLang() === 'en' && !!tr;
  const cards = useProgress().cards;
  const [onlyReview, setOnlyReview] = useState(false);
  const list = journey.filter((id) => !onlyReview || cards[id] === 'review');
  const known = journey.filter((id) => cards[id] === 'known').length;
  const review = journey.filter((id) => cards[id] === 'review').length;
  return (
    <article>
      <header className="page-head">
        <h1 tabIndex={-1}>{en ? 'Review cards' : 'بطاقات المراجعة'}</h1>
        <p className="lead">
          {en ? 'Try to recall each field before revealing it. Then sort the card: “I knew it” or “Review it”.' : 'حاول أن تتذكر كل حقل قبل كشفه. ثم صنّف البطاقة: «عرفتها» أو «أراجعها».'}
        </p>
      </header>
      <div className="cards-bar no-print">
        <label className="toggle">
          <input type="checkbox" checked={onlyReview} onChange={(e) => setOnlyReview(e.target.checked)} />{' '}
          {en ? `Show only “Review it” cards (${review})` : `اعرض بطاقات «أراجعها» فقط (${review})`}
        </label>
        <span>{en ? `Known: ${known} of ${journey.length}` : `عرفتها: ${known} من ${journey.length}`}</span>
        <button type="button" className="btn" onClick={() => window.print()}>{en ? 'Print / save as PDF' : 'اطبع / احفظ PDF'}</button>
      </div>
      <p className="hint no-print">
        {en
          ? 'When printed, all the fields are shown revealed. Choose “Save as PDF” in your browser’s print window.'
          : 'عند الطباعة تظهر كل الحقول مكشوفة. اختر «حفظ بتنسيق PDF» من نافذة الطباعة في المتصفح.'}
      </p>
      {list.length === 0 ? (
        <p className="empty">{en ? 'No cards are marked “Review it” yet.' : 'لا توجد بطاقات مصنفة «أراجعها» بعد.'}</p>
      ) : (
        <div className="flash-grid">
          {list.map((id) => (
            <FlashCard key={id} id={id} tr={en ? tr : undefined} />
          ))}
        </div>
      )}
    </article>
  );
}

// ———————— المراجع والمنهج ————————
export function RefsPage({ tr }: { tr?: RefsTr }) {
  const en = useLang() === 'en' && !!tr;
  const refs = useMemo(() => (en ? overlay(references, tr!.references) : references), [en, tr]);
  if (en) return <RefsEn refs={refs} />;
  return (
    <article className="refs">
      <header className="page-head">
        <h1 tabIndex={-1}>المراجع والمنهج</h1>
      </header>
      <section className="section">
        <h2>كيف كُتب المحتوى؟</h2>
        <ul>
          <li>الحكايات التاريخية موثقة بمصادرها، وبيانات ركلات الخيل حقيقية؛ أما بقية الأمثلة فتعليمية، وكل أرقامها متحقق منها حسابيًا.</li>
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
          <li><Rich text="الأسي: $\theta$ **معدل** لا مقياس؛ المتوسط $1/\theta$، ومتوسط عدد الأحداث في زمن $t$ هو $\lambda = \theta t$." /></li>
          <li><Rich text="فوق الهندسي: مجتمع $N$ فيه $k$ نجاحًا، ونسحب $n$ دون إرجاع." /></li>
          <li><Rich text="ذو الحدين السالب: $X$ عدد **المحاولات** حتى النجاح رقم $r$، و$x \ge r$ (برامج مثل R تعدّ الإخفاقات)." /></li>
          <li><Rich text="غاما: $\alpha$ شكل و$\beta$ **معدل**؛ المتوسط $\alpha/\beta$." /></li>
          <li><Rich text="ويبل (بصيغتنا): $f(x) = \alpha\beta x^{\beta-1}e^{-\alpha x^{\beta}}$، و$\beta$ هو الشكل." /></li>
          <li><Rich text="مربع كاي وt وF: $v$ (و$r$ للبسط في F) درجات الحرية." /></li>
          <li><Rich text="الطبيعي: $N(\mu, \sigma^2)$ حيث $\sigma$ الانحراف المعياري و$\sigma^2$ التباين." /></li>
        </ul>
      </section>
      <section className="section">
        <h2>المصادر التي رُجع إليها</h2>
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
        <p className="hint">كل جملة تاريخية في الفصول مربوطة بمصدر من هذه القائمة.</p>
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
      <section className="section">
        <h2>إعداد</h2>
        <p>
          عبدالله المسفر، طالب إحصاء. لقيت خطأ أو عندك اقتراح؟ راسلني على{' '}
          <a href="https://www.linkedin.com/in/abdullah-a-365a082b3" target="_blank" rel="noopener noreferrer" lang="en" dir="ltr">LinkedIn</a>.
        </p>
      </section>
    </article>
  );
}

/** صفحة المراجع بالإنجليزية: البنية نفسها، والمصادر بإشاراتها الإنجليزية. */
function RefsEn({ refs }: { refs: typeof references }) {
  return (
    <article className="refs">
      <header className="page-head">
        <h1 tabIndex={-1}>Sources and method</h1>
      </header>
      <section className="section">
        <h2>How was the content written?</h2>
        <ul>
          <li>The historical stories are documented with their sources, and the horse-kick data are real; the other examples are for teaching, and every number in them has been checked by calculation.</li>
          <li>The charts are built directly from the formulas; the simulations use a random number generator in the browser, and their results change from run to run.</li>
          <li>For the normal distribution we give intuition and provable facts, but no “simplified derivation”, because a real one needs tools beyond an introductory course.</li>
        </ul>
      </section>
      <section className="section">
        <h2>The conventions used</h2>
        <ul>
          <li><Rich text="Bernoulli: $X \in \{0,1\}$ and $P(X=1) = p$." /></li>
          <li><Rich text="Binomial: $X$ is the number of successes in $n$ independent trials with a constant probability $p$." /></li>
          <li><Rich text="Geometric: $X$ is the number of **trials** until the first success, including the successful trial, $X \in \{1,2,\dots\}$. (Another common convention counts the failures before it.)" /></li>
          <li><Rich text="Poisson: $\lambda$ is the mean number of events in the interval; with a rate $r$ and a time $t$: $\lambda = rt$." /></li>
          <li><Rich text="Exponential: $\theta$ is a **rate**, not a scale; the mean is $1/\theta$, and the mean number of events in time $t$ is $\lambda = \theta t$." /></li>
          <li><Rich text="Hypergeometric: a population of $N$ with $k$ successes, and we draw $n$ without replacement." /></li>
          <li><Rich text="Negative binomial: $X$ is the number of **trials** until success number $r$, with $x \ge r$ (software such as R counts the failures)." /></li>
          <li><Rich text="Gamma: $\alpha$ is the shape and $\beta$ the **rate**; the mean is $\alpha/\beta$." /></li>
          <li><Rich text="Weibull (our form): $f(x) = \alpha\beta x^{\beta-1}e^{-\alpha x^{\beta}}$, where $\beta$ is the shape." /></li>
          <li><Rich text="Chi-square, t and F: $v$ (and $r$ for the numerator in F) are the degrees of freedom." /></li>
          <li><Rich text="Normal: $N(\mu, \sigma^2)$, where $\sigma$ is the standard deviation and $\sigma^2$ the variance." /></li>
        </ul>
      </section>
      <section className="section">
        <h2>References consulted</h2>
        <ul className="ref-list">
          {refs.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" lang="en" dir="ltr">{r.title}</a>
              <Rich as="p" text={r.usedFor} />
            </li>
          ))}
        </ul>
      </section>
      <section className="section">
        <h2>Sources for the stories</h2>
        <p className="hint">Every historical sentence in the chapters is linked to a source from this list.</p>
        <ul className="ref-list">
          {sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.citeEn ?? s.cite}</a>
            </li>
          ))}
        </ul>
      </section>
      <section className="section">
        <h2>Privacy</h2>
        <p>No sign-in, no tracking analytics, no servers. Your progress (cards and answers) is saved in your browser on this device only, and you can clear it from the bottom of the page.</p>
      </section>
      <section className="section">
        <h2>Prepared by</h2>
        <p>
          Abdullah Almusfir, a statistics student. Found a mistake or have a suggestion? Message me on{' '}
          <a href="https://www.linkedin.com/in/abdullah-a-365a082b3" target="_blank" rel="noopener noreferrer">LinkedIn</a>.
        </p>
      </section>
    </article>
  );
}

export function NotFound() {
  const en = useLang() === 'en';
  return (
    <article className="page-head">
      <h1 tabIndex={-1}>{en ? 'Page not found' : 'الصفحة غير موجودة'}</h1>
      <p>
        <a href={href.home}>{en ? 'Back to the home page' : 'العودة إلى الرئيسية'}</a>
      </p>
    </article>
  );
}
