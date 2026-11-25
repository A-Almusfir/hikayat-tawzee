import { useEffect, useRef, useState } from 'react';
import type { ExamProblem } from '../../content/chapterTypes';
import { Rich, Tex } from '../Tex';
import { Scene } from './Scene';
import { useLang } from '../../lib/lang';

/** مسألة واحدة معروضة في كل مرة؛ التبديل بأزرار، والكشف خطوة خطوة. */
export function ExamScene({ headline, problems, tricks }: { headline: string; problems: ExamProblem[]; tricks: string[] }) {
  const [idx, setIdx] = useState(0);
  const en = useLang() === 'en';
  return (
    <Scene
      n={4}
      title={headline}
      artAfter
      art={
        <aside className="tricks">
          <h3>{en ? 'Shortcuts' : 'حيل تختصر عليك'}</h3>
          <ul>
            {tricks.map((t, i) => (
              <Rich key={i} as="li" text={t} />
            ))}
          </ul>
        </aside>
      }
    >
      <div className="seg-tabs" role="group" aria-label={en ? 'Choose a problem' : 'اختر المسألة'}>
        {problems.map((p, i) => (
          <button key={i} type="button" className={`seg-tab ${i === idx ? 'on' : ''}`} aria-pressed={i === idx} onClick={() => setIdx(i)}>
            {i + 1}. {p.label}
          </button>
        ))}
      </div>
      <ExamBlock key={idx} p={problems[idx]} />
    </Scene>
  );
}

function ExamBlock({ p }: { p: ExamProblem }) {
  const [shown, setShown] = useState(0);
  const en = useLang() === 'en';
  const listRef = useRef<HTMLOListElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const items = listRef.current?.querySelectorAll<HTMLElement>(':scope > li');
    items?.[items.length - 1]?.focus();
  }, [shown]);
  const reveal = (n: number) => {
    moved.current = n > 0;
    setShown(n);
  };
  return (
    <div className="exam">
      <Rich as="p" className="exam-given" text={p.given} />
      <ol className="steps" ref={listRef}>
        {p.steps.slice(0, shown).map((s, i) => (
          <li key={i} tabIndex={-1}>
            <strong><Rich text={s.title} /></strong>
            {s.body && <Rich as="p" text={s.body} />}
            {s.tex?.map((t, j) => <Tex key={j} tex={t} display />)}
          </li>
        ))}
      </ol>
      {shown === p.steps.length && (
        <p className="exam-answer" role="status">
          <strong>{en ? 'Answer: ' : 'الجواب: '}</strong>
          <Rich text={p.answer} />
        </p>
      )}
      <div className="btn-row">
        {shown < p.steps.length ? (
          <>
            <button type="button" className="btn btn-c" onClick={() => reveal(shown + 1)}>
              {shown === 0 ? (en ? 'Tried it? Show the first step' : 'جرّبت؟ ورّني أول خطوة') : <>{en ? 'Next step' : 'الخطوة التالية'}: <Rich text={p.steps[shown].title} /></>}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => reveal(p.steps.length)}>
              {en ? 'Show the full solution' : 'ورّني الحل كامل'}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-quiet" onClick={() => reveal(0)}>
            {en ? 'Hide the solution' : 'سكّر الحل'}
          </button>
        )}
      </div>
    </div>
  );
}
