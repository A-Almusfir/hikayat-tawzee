import { useState } from 'react';
import { PART_COLORS } from '../content/distributions';
import type { DistContent, QuizQuestion } from '../content/types';
import { progress, useProgress } from '../lib/storage';
import { Rich, Tex } from './Tex';
import { Callout, RichList } from './ui';

export function StorySection({ d }: { d: DistContent }) {
  const s = d.story;
  return (
    <div className="story">
      <h3 className="story-title">{s.title}</h3>
      <Rich as="p" className="lead" text={s.scene} />
      <dl className="story-facts">
        <div>
          <dt>التجربة</dt>
          <dd><Rich text={s.experiment} /></dd>
        </div>
        <div>
          <dt>المتغير العشوائي <Tex tex="X" /></dt>
          <dd><Rich text={s.variable} /></dd>
        </div>
        <div>
          <dt>القيم الممكنة</dt>
          <dd><Rich text={s.values} /></dd>
        </div>
        <div>
          <dt>الافتراضات</dt>
          <dd><RichList items={s.assumptions} className="checks" /></dd>
        </div>
      </dl>
      {s.note && (
        <Callout title="انتبه">
          <Rich as="p" text={s.note} />
        </Callout>
      )}
    </div>
  );
}

export function FormulaSection({ d }: { d: DistContent }) {
  const f = d.formula;
  return (
    <div className="formula">
      <p className="fn-name">{f.fnName}</p>
      <Tex tex={f.annotated} display className="formula-main" />
      <ol className="parts">
        {f.parts.map((p) => (
          <li key={p.n} style={{ ['--part' as string]: PART_COLORS[p.n - 1] }}>
            <span className="part-n" aria-hidden="true">({p.n})</span>
            <div>
              <strong>
                <span className="sr-only">الجزء {p.n}: </span>
                {p.label} <Tex tex={p.tex} />
              </strong>
              <Rich as="p" text={p.explain} />
            </div>
          </li>
        ))}
      </ol>
      <h3>الفكرة الحدسية</h3>
      {f.intuition.map((t, i) => (
        <Rich key={i} as="p" text={t} />
      ))}
      <details className="deep">
        <summary>تعمّق في الاشتقاق</summary>
        <p className="badge-line">
          <span className={`badge ${f.derivationKind === 'proof' ? 'badge-proof' : 'badge-intuit'}`}>
            {f.derivationKind === 'proof' ? 'اشتقاق رياضي' : 'حقائق قابلة للإثبات + حدود ما نقدمه'}
          </span>
        </p>
        {f.derivation.map((t, i) => (
          <Rich key={i} as="p" text={t} />
        ))}
      </details>
    </div>
  );
}

const STEP_TITLES = ['تعريف المتغير X', 'لماذا هذا التوزيع؟', 'التعويض', 'النتيجة وتفسيرها'];

export function WorkedExample({ d }: { d: DistContent }) {
  const e = d.example;
  const [shown, setShown] = useState(0);
  const total = STEP_TITLES.length;
  return (
    <div className="example">
      <h3>{e.title}</h3>
      <div className="given">
        <strong>المعطيات</strong>
        <RichList items={e.given} />
        <Rich as="p" className="ask" text={e.ask} />
      </div>
      <p className="hint">حاول الحل بنفسك أولًا، ثم اكشف الخطوات واحدة تلو الأخرى.</p>
      <ol className="steps" aria-live="polite">
        {shown >= 1 && (
          <li>
            <strong>{STEP_TITLES[0]}</strong>
            <Rich as="p" text={e.defineX} />
          </li>
        )}
        {shown >= 2 && (
          <li>
            <strong>{STEP_TITLES[1]}</strong>
            <Rich as="p" text={e.why} />
          </li>
        )}
        {shown >= 3 && (
          <li>
            <strong>{STEP_TITLES[2]}</strong>
            {e.substitute.map((t, i) => (
              <Tex key={i} tex={t} display />
            ))}
          </li>
        )}
        {shown >= 4 && (
          <li>
            <strong>{STEP_TITLES[3]}</strong>
            <Rich as="p" text={e.result} />
            <Rich as="p" text={e.interpretation} />
          </li>
        )}
      </ol>
      <div className="btn-row">
        {shown < total && (
          <button type="button" className="btn" onClick={() => setShown(shown + 1)}>
            اكشف الخطوة التالية: {STEP_TITLES[shown]}
          </button>
        )}
        {shown < total && (
          <button type="button" className="btn btn-quiet" onClick={() => setShown(total)}>
            اكشف الحل كاملًا
          </button>
        )}
        {shown > 0 && (
          <button type="button" className="btn btn-quiet" onClick={() => setShown(0)}>
            أخفِ الحل
          </button>
        )}
      </div>
    </div>
  );
}

export function DistCardView({ d }: { d: DistContent }) {
  const c = d.card;
  return (
    <div className="dcard">
      <div className="dcard-head">
        <strong>{d.nameAr}</strong> <span className="en" lang="en" dir="ltr">{d.nameEn}</span>
        <Tex tex={d.notation} />
        <span className="tag">{d.type === 'discrete' ? 'متقطع' : 'مستمر'}</span>
      </div>
      <dl className="dcard-grid">
        <dt>المعلمات</dt>
        <dd>
          <ul>
            {c.params.map((p) => (
              <li key={p.tex}>
                <Tex tex={p.tex} />: <Rich text={p.meaning} />
              </li>
            ))}
          </ul>
        </dd>
        <dt>مجال X</dt>
        <dd><Tex tex={c.support} /></dd>
        <dt>{c.fnLabel}</dt>
        <dd><Tex tex={c.fnTex} display /></dd>
        <dt>المتوسط</dt>
        <dd><Tex tex={c.mean} /></dd>
        <dt>التباين</dt>
        <dd><Tex tex={c.variance} /></dd>
        <dt>شروط الاستخدام</dt>
        <dd><RichList items={c.conditions} /></dd>
        <dt>خطأ شائع</dt>
        <dd><Rich text={c.mistake} /></dd>
      </dl>
      {d.type === 'continuous' && (
        <p className="hint">
          <Rich text="في التوزيع المستمر: $P(X = x) = 0$ لأي قيمة مفردة، والاحتمال مساحة تحت منحنى الكثافة على فترة." />
        </p>
      )}
    </div>
  );
}

const KIND_LABEL = { choose: 'اختيار التوزيع / التحقق من الشروط', compute: 'سؤال حسابي', concept: 'سؤال مفاهيمي / اكتشف الخطأ' };

function QuizItem({ q, index }: { q: QuizQuestion; index: number }) {
  const saved = useProgress().quiz[q.id];
  const chosen = saved ?? null;
  const answered = chosen !== null;
  const correctIdx = q.options.findIndex((o) => o.correct);
  const isRight = chosen === correctIdx;
  const name = `q-${q.id}`;
  return (
    <fieldset className="quiz-q">
      <legend>
        <span className="q-kind">سؤال {index + 1} · {KIND_LABEL[q.kind]}</span>
        <Rich as="span" className="q-prompt" text={q.prompt} />
      </legend>
      <div className="options">
        {q.options.map((o, i) => {
          const state = !answered ? '' : i === correctIdx ? 'is-correct' : i === chosen ? 'is-wrong' : '';
          return (
            <label key={i} className={`option ${state}`}>
              <input type="radio" name={name} checked={chosen === i} onChange={() => progress.setQuiz(q.id, i)} disabled={answered} />
              <span className="opt-mark" aria-hidden="true">{state === 'is-correct' ? '✓' : state === 'is-wrong' ? '✗' : ''}</span>
              <Rich text={o.text} />
            </label>
          );
        })}
      </div>
      {answered && (
        <div className={`feedback ${isRight ? 'ok' : 'no'}`} role="status">
          <p className="verdict">{isRight ? '✓ إجابة صحيحة.' : '✗ ليست الإجابة الصحيحة.'}</p>
          <p>
            <strong>لماذا الصحيحة صحيحة؟ </strong>
            <Rich text={q.options[correctIdx].why} />
          </p>
          <ul className="whys">
            {q.options.map((o, i) =>
              i === correctIdx ? null : (
                <li key={i}>
                  <Rich text={o.text} /> — <Rich text={o.why} />
                </li>
              ),
            )}
          </ul>
          <button type="button" className="btn btn-quiet" onClick={() => progress.setQuiz(q.id, undefined)}>
            أعد المحاولة
          </button>
        </div>
      )}
    </fieldset>
  );
}

export function Quiz({ d }: { d: DistContent }) {
  const quiz = useProgress().quiz;
  const done = d.quiz.filter((q) => quiz[q.id] !== undefined);
  const right = done.filter((q) => q.options[quiz[q.id]]?.correct).length;
  return (
    <div className="quiz">
      {d.quiz.map((q, i) => (
        <QuizItem key={q.id} q={q} index={i} />
      ))}
      {done.length === d.quiz.length && (
        <p className="score" role="status">
          النتيجة: {right} من {d.quiz.length}. {right === d.quiz.length ? 'أحسنت.' : 'راجع التفسيرات أعلاه ثم أعد المحاولة.'}
        </p>
      )}
    </div>
  );
}
