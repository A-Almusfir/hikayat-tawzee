import { useEffect, useMemo, useRef, useState } from 'react';
import type { Choice } from '../content/chapterTypes';
import { chapters } from '../content/chapters';
import { choiceLabels, choiceOrder } from '../content/chooser';
import { hint, type Leaf } from '../content/decision';
import { drill, type DrillItem } from '../content/drill';
import { ChoiceCheck } from '../components/scenes/ChoiceCheck';
import { Rich } from '../components/Tex';
import { seededRng } from '../lib/dist';
import { href } from '../lib/router';
import { parseNumber } from '../lib/shuffle';
import { progress, useProgress } from '../lib/storage';

const ORDER: Leaf[] = choiceOrder();

/** الخطوة الأولى: أي توزيع؟ تفسير الخيارات الخاطئة يأتي من مخطط القرار (مصدر واحد). */
function step1(item: DrillItem): Choice {
  return {
    prompt: 'أي توزيع يناسب؟',
    options: ORDER.map((l) => ({
      text: choiceLabels[l],
      correct: l === item.answer,
      why: l === item.answer ? item.why : l === item.trap ? item.trapWhy : `هذا يناسب موقفًا آخر: ${hint[l]}`,
    })),
  };
}

const isDone = (it: DrillItem, quiz: Record<string, number>, prefix: string) => quiz[`${prefix}${it.id}-${it.calc ? 3 : 1}`] !== undefined;

/** خلط فيشر–ييتس بمولّد ذي بذرة: نقي وغير متحيز. */
function shuffle<T>(xs: T[], seed: number): T[] {
  const a = [...xs], rng = seededRng(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DrillPage() {
  const quiz = useProgress().quiz;
  const [mode, setMode] = useState<'all' | 'review'>('all');
  const [idx, setIdx] = useState(0);
  // كل جولة مراجعة لها بذرة ومفاتيح حفظ مستقلة، فلا تظهر المسائل محلولة من جولة سابقة
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const prefix = mode === 'review' ? `r${seed}:` : '';
  // لا تتراكم جولات المراجعة القديمة في التخزين المحلي: نحذف مفاتيح الجولات السابقة
  useEffect(() => {
    for (const k of Object.keys(quiz)) if (/^r\d+:/.test(k) && !k.startsWith(`r${seed}:`)) progress.setQuiz(k, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  // الفصول المنتهية: أُجيب فيها عن سؤال استرجاع واحد على الأقل
  const finished = useMemo(
    () => Object.values(chapters).filter((ch) => ch && ch.anchor.recall.some((q) => quiz[q.id] !== undefined)).map((ch) => ch!.id),
    [quiz],
  );
  const list = useMemo(() => {
    if (mode === 'all') return drill;
    const pool = drill.filter((d) => d.answer === 'insufficient' || finished.includes(d.answer));
    return shuffle(pool, seed).slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, seed, finished.join()]);
  const i = Math.min(idx, Math.max(0, list.length - 1));
  const it = list[i];
  const done = list.filter((d) => isDone(d, quiz, prefix)).length;
  // عند تغيّر المسألة: ينتقل التركيز إليها ويُعلن عنها
  const moved = useRef(false);
  useEffect(() => {
    if (moved.current) document.querySelector<HTMLElement>('.drill-card .scenario')?.focus();
    moved.current = true;
  }, [i, seed, mode]);

  return (
    <article className="drill">
      <header className="page-head">
        <h1 tabIndex={-1}>تدريب مختلط</h1>
        <p className="lead">مسائل من كل الفصول معًا، كما في الاختبار. لكل مسألة ثلاث خطوات: أي توزيع؟ ثم المعلمات، ثم الحساب.</p>
      </header>
      <div className="seg-tabs" role="group" aria-label="نوع التدريب">
        <button type="button" className={`seg-tab ${mode === 'all' ? 'on' : ''}`} aria-pressed={mode === 'all'} onClick={() => (setMode('all'), setIdx(0))}>
          كل المسائل ({drill.length})
        </button>
        <button type="button" className={`seg-tab ${mode === 'review' ? 'on' : ''}`} aria-pressed={mode === 'review'} onClick={() => (setMode('review'), setIdx(0), setSeed(seed + 1))}>
          مراجعة سريعة: 3 مسائل من فصولك المنتهية
        </button>
      </div>

      {mode === 'review' && finished.length === 0 ? (
        <p className="empty">
          للحين ما خلّصت ولا فصل. جاوب أسئلة «ثبّت» في آخر أي فصل، وارجع لهنا. <a href={href.dist('bernoulli')}>ابدأ من الفصل الأول</a>.
        </p>
      ) : it ? (
        <>
          <div className="progress-line">
            <span>المسألة {i + 1} من {list.length}</span>
            <span>أنهيت: {done} من {list.length}</span>
          </div>
          <div className="progress-bar" role="progressbar" aria-label="التقدم" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={done}>
            <span style={{ width: `${(done / list.length) * 100}%` }} />
          </div>
          <DrillCard key={prefix + it.id} it={it} prefix={prefix} n={i + 1} />
          <div className="pager">
            <button type="button" className="btn" aria-disabled={i === 0} onClick={() => i > 0 && setIdx(i - 1)}>→ السابقة</button>
            {mode === 'review' && i === list.length - 1 ? (
              <button type="button" className="btn" onClick={() => (setSeed(seed + 1), setIdx(0))}>عطني 3 مسائل ثانية ←</button>
            ) : (
              <button type="button" className="btn" aria-disabled={i === list.length - 1} onClick={() => i < list.length - 1 && setIdx(i + 1)}>التالية ←</button>
            )}
          </div>
          <p className="hint">
            تبي تذكير؟ <a href={href.exam}>ليلة الاختبار</a> فيها كل القوانين ومخطط القرار.
          </p>
        </>
      ) : null}
    </article>
  );
}

function DrillCard({ it, prefix, n }: { it: DrillItem; prefix: string; n: number }) {
  const quiz = useProgress().quiz;
  const k = (step: number) => `${prefix}${it.id}-${step}`;
  const s1 = quiz[k(1)] !== undefined;
  const s2 = quiz[k(2)] !== undefined;
  return (
    <div className="drill-card">
      <div className="scenario" tabIndex={-1} aria-label={`المسألة ${n}`}>
        <Rich as="p" text={it.text} />
      </div>
      <ChoiceCheck id={k(1)} q={step1(it)} kicker="الخطوة 1 · أي توزيع؟" />
      {s1 && it.param && <ChoiceCheck id={k(2)} q={it.param} kicker="الخطوة 2 · المعلمات" />}
      {s1 && s2 && it.calc && <NumericStep id={k(3)} calc={it.calc} />}
      {s1 && !it.param && <p className="hint">هذه المسألة تنتهي عند الخطوة الأولى: الشروط لا تسمح باختيار أي من التوزيعات.</p>}
    </div>
  );
}

/** الخطوة 3: يكتب الطالب الناتج رقمًا. إن طابق رقمًا من أخطاء شائعة نشرح ذلك الخطأ بعينه. */
const TOL = 0.0006;
const lastNumber = (t: string) => {
  // آخر عدد عشري في نص الخيار هو الناتج (مثل «$e^{-2} \\approx 0.1353$»)
  const m = t.match(/\d*\.\d+/g);
  return m ? Number(m[m.length - 1]) : null;
};

function NumericStep({ id, calc }: { id: string; calc: NonNullable<DrillItem['calc']> }) {
  const saved = useProgress().quiz[id];
  const [txt, setTxt] = useState('');
  const [err, setErr] = useState('');
  const fb = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const truth = calc.check.compute();
  const correct = calc.options.find((o) => o.correct)!;
  const answered = saved !== undefined;
  const ok = answered && Math.abs(saved - truth) <= TOL;
  const trap = answered && !ok ? calc.options.find((o) => !o.correct && (() => { const n = lastNumber(o.text); return n !== null && Math.abs(n - saved) <= TOL; })()) : undefined;
  const check = () => {
    const v = parseNumber(txt);
    if (v === null) return setErr('اكتب رقمًا، مثل 0.4060');
    setErr('');
    progress.setQuiz(id, v);
    window.setTimeout(() => fb.current?.focus(), 0);
  };
  const inputId = `${id}-in`;
  return (
    <div className="predict numeric">
      <span className="pk">الخطوة 3 · الحساب</span>
      <label htmlFor={inputId} className="pq"><Rich text={calc.prompt} /> <span className="hint">(اكتب الناتج بثلاث أو أربع منازل عشرية)</span></label>
      {!answered ? (
        <>
          <div className="num-row">
            <input
              id={inputId}
              ref={inputRef}
              className="num-in"
              inputMode="decimal"
              dir="ltr"
              autoComplete="off"
              value={txt}
              onChange={(e) => setTxt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              aria-describedby={err ? `${inputId}-err` : undefined}
            />
            <button type="button" className="btn btn-c" onClick={check} disabled={!txt.trim()}>تحقّق</button>
          </div>
          {err && <p className="num-err" id={`${inputId}-err`} role="alert">{err}</p>}
        </>
      ) : (
        <div className={`feedback ${ok ? 'ok' : 'no'}`} role="status" tabIndex={-1} ref={fb}>
          <p><strong>{ok ? '✓ صحيح: ' : `✗ كتبت ${saved}. الصحيح: `}</strong><Rich text={correct.text} /> — <Rich text={correct.why} /></p>
          {trap && <p><strong>من وين جاك هالرقم؟ </strong><Rich text={trap.why} /></p>}
          {!ok && (
            <button type="button" className="link-btn" onClick={() => (progress.setQuiz(id, undefined), setTxt(''), window.setTimeout(() => inputRef.current?.focus(), 0))}>
              جرّب مرة ثانية
            </button>
          )}
        </div>
      )}
    </div>
  );
}
