import { useEffect, useRef, useState } from 'react';
import type { Choice } from '../../content/chapterTypes';
import { progress, useProgress } from '../../lib/storage';
import { Rich } from '../Tex';

/**
 * سؤال اختيار من متعدد: يختار الطالب ثم يضغط «تحقّق».
 * التنقل بالأسهم بين الخيارات لا يسجّل إجابة، والتركيز ينتقل إلى التغذية الراجعة بعد التحقق.
 */
export function ChoiceCheck({ id, q, kicker }: { id: string; q: Choice; kicker: string }) {
  const saved = useProgress().quiz[id];
  const answered = saved !== undefined;
  const [pick, setPick] = useState<number | null>(null);
  const fb = useRef<HTMLDivElement>(null);
  const justChecked = useRef(false);
  const ci = q.options.findIndex((o) => o.correct);

  useEffect(() => {
    if (answered && justChecked.current) {
      fb.current?.focus();
      justChecked.current = false;
    }
  }, [answered]);

  const check = () => {
    if (pick === null) return;
    justChecked.current = true;
    progress.setQuiz(id, pick);
  };

  // إجابة صحيحة: ملخص من سطر واحد بدل تكرار الخيار والتغذية الراجعة
  if (answered && saved === ci)
    return (
      <div className="predict-done feedback ok" role="status" tabIndex={-1} ref={fb}>
        <span className="pk">{kicker}</span>
        <p>
          <strong>✓ </strong>
          <Rich text={q.options[ci].text} /> — <Rich text={q.options[ci].why} />
        </p>
      </div>
    );

  return (
    <fieldset className="predict">
      <legend>
        <span className="pk">{kicker}</span>
        <Rich as="span" className="pq" text={q.prompt} />
      </legend>
      <div className="options">
        {q.options.map((o, i) => {
          // بعد التحقق نُبقي اختيار الطالب والإجابة الصحيحة فقط، حتى لا يطول المشهد
          // وإن كانت الإجابة صحيحة نُبقي الصحيحة وحدها
          if (answered && i !== ci && (i !== saved || saved === ci)) return null;
          const st = !answered ? '' : i === ci ? 'is-correct' : 'is-wrong';
          return (
            <label key={i} className={`option ${st}`}>
              <input type="radio" name={id} checked={answered ? saved === i : pick === i} disabled={answered} onChange={() => setPick(i)} />
              <span className="opt-mark" aria-hidden="true">{st === 'is-correct' ? '✓' : st === 'is-wrong' ? '✗' : ''}</span>
              <Rich text={o.text} />
            </label>
          );
        })}
      </div>
      {!answered ? (
        <button type="button" className="btn btn-c check-btn" onClick={check} disabled={pick === null}>
          تحقّق
        </button>
      ) : (
        <div className={`feedback ${saved === ci ? 'ok' : 'no'}`} role="status" tabIndex={-1} ref={fb}>
          {saved !== ci && (
            <p>
              <strong>اختيارك: </strong>
              <Rich text={q.options[saved].why} />
            </p>
          )}
          <p>
            <strong>{saved === ci ? '✓ صحيح. ' : 'الصحيح: '}</strong>
            <Rich text={q.options[ci].why} />
          </p>
          <button type="button" className="link-btn" onClick={() => (progress.setQuiz(id, undefined), setPick(null))}>
            أعد المحاولة
          </button>
        </div>
      )}
    </fieldset>
  );
}
