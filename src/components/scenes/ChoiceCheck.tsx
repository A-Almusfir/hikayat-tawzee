import { useEffect, useRef, useState } from 'react';
import type { Choice } from '../../content/chapterTypes';
import { displayOrder } from '../../lib/shuffle';
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
  const fsRef = useRef<HTMLFieldSetElement>(null);
  const retried = useRef(false);
  const justChecked = useRef(false);
  const ci = q.options.findIndex((o) => o.correct);
  const order = displayOrder(id, q.options.length);

  useEffect(() => {
    if (!answered && retried.current) {
      retried.current = false;
      fsRef.current?.querySelector<HTMLInputElement>('input[type=radio]')?.focus();
    }
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
    <fieldset className="predict" ref={fsRef}>
      <legend>
        <span className="pk">{kicker}</span>
        <Rich as="span" className="pq" text={q.prompt} />
      </legend>
      <div className="options" hidden={answered}>
        {order.map((i) => {
          const o = q.options[i];
          // بعد التحقق تختفي الخيارات: التغذية الراجعة تذكر اختيار الطالب والصحيح بنصّيهما
          if (answered) return null;
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
          <p>
            <strong>✗ اخترت: </strong>
            <Rich text={q.options[saved].text} /> — <Rich text={q.options[saved].why} />
          </p>
          <p>
            <strong>✓ الصحيح: </strong>
            <Rich text={q.options[ci].text} /> — <Rich text={q.options[ci].why} />
          </p>
          <button type="button" className="link-btn" onClick={() => ((retried.current = true), progress.setQuiz(id, undefined), setPick(null))}>
            جرّب مرة ثانية
          </button>
        </div>
      )}
    </fieldset>
  );
}
