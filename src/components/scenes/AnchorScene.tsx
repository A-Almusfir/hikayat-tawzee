import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gradeCompose } from '../../lib/compose';
import { useProgress } from '../../lib/storage';
import type { Chapter } from '../../content/chapterTypes';
import { distById } from '../../content/distributions';
import { identity } from '../../content/identity';
import type { DistId } from '../../content/types';
import { href } from '../../lib/router';
import { Glyph } from '../Glyph';
import { Rich, Tex } from '../Tex';
import { ChoiceCheck } from './ChoiceCheck';
import { Scene } from './Scene';

const BOX = String.raw`\boxed{\;?\;}`;

export function AnchorScene({ ch, next, color }: { ch: Chapter; next?: DistId; color: string }) {
  const a = ch.anchor;
  const quiz = useProgress().quiz;
  // أسئلة الاسترجاع تظهر بعد كتابة القانون (أو إن سبقت الإجابة عنها، أو بطلب الطالب)
  const [stage2, setStage2] = useState(() => a.recall.some((q) => quiz[q.id] !== undefined));
  return (
    <Scene
      n={5}
      title={a.headline}
      art={
        <div className="hook">
          <Rich as="p" text={a.hook} />
          <Tex tex={a.hookTex} display />
          {a.hookNote && <Rich as="p" className="hook-data" text={a.hookNote} />}
        </div>
      }
    >
      <ComposeLaw ch={ch} color={color} onChecked={() => setStage2(true)} />
      {stage2 ? (
        <Recall ch={ch} />
      ) : (
        <button type="button" className="link-btn" onClick={() => setStage2(true)}>
          تخطَّ إلى أسئلة الاسترجاع ({a.recall.length})
        </button>
      )}
      {next && (
        <a className="bridge" href={href.dist(next)} style={{ '--to': identity[next].color } as CSSProperties}>
          <Glyph id={next} size={36} />
          <span>
            <span className="bridge-k">الفصل التالي: {distById[next].nameAr}</span>
            <Rich as="span" className="bridge-t" text={a.bridge} />
          </span>
          <span aria-hidden="true" className="bridge-arr">←</span>
        </a>
      )}
      {!next && (
        <a className="bridge" href={href.choose} style={{ '--to': 'var(--ink)' } as CSSProperties}>
          <span>
            <span className="bridge-k">أنهيت الرحلة: تدرّب على التمييز</span>
            <Rich as="span" className="bridge-t" text={a.bridge} />
          </span>
          <span aria-hidden="true" className="bridge-arr">←</span>
        </a>
      )}
    </Scene>
  );
}

/** «املأ القانون من ذاكرتك»: اختر لكل خانة البطاقة الصحيحة، ثم تحقّق. */
function ComposeLaw({ ch, color, onChecked }: { ch: Chapter; color: string; onChecked: () => void }) {
  const law = ch.build.law;
  const n = law.slots.length;
  const [fill, setFill] = useState<(string | null)[]>(() => Array(n).fill(null));
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const doneRef = useRef<HTMLDivElement>(null);
  const firstTile = useRef<HTMLButtonElement>(null);
  const answerRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (showAnswer) answerRef.current?.focus();
  }, [showAnswer]);
  const tex = law.template.replace(/@(\d)/g, (_, d: string) => {
    const v = fill[Number(d) - 1];
    return v ? String.raw`\underbrace{\textcolor{${color}}{${v}}}_{(${d})}` : String.raw`\underbrace{${BOX}}_{(${d})}`;
  });
  const place = (t: string) => {
    const next = fill.slice();
    next[active] = t;
    setFill(next);
    setChecked(false);
    const empty = next.findIndex((v) => v === null);
    setActive(empty === -1 ? active : empty);
  };
  const grades = gradeCompose(fill, law.slots, ch.anchor.compose.interchangeable);
  const ok = (i: number) => grades[i];
  const allOk = grades.every(Boolean);
  const reset = () => {
    setFill(Array(n).fill(null));
    setActive(0);
    setChecked(false);
    setWrongTries(0);
    setShowAnswer(false);
    window.setTimeout(() => firstTile.current?.focus(), 0);
  };
  const check = () => {
    setChecked(true);
    if (!gradeCompose(fill, law.slots, ch.anchor.compose.interchangeable).every(Boolean)) setWrongTries((w) => w + 1);
    onChecked();
  };
  useEffect(() => {
    if (checked && allOk) doneRef.current?.focus();
  }, [checked, allOk]);
  if (checked && allOk)
    return (
      <div className="compose done feedback ok" role="status" tabIndex={-1} ref={doneRef}>
        <p>
          <strong>✓ كتبت القانون كاملًا من ذاكرتك:</strong>
        </p>
        <Tex tex={tex} display />
        <ul>
          {law.slots.map((sl, i) => (
            <li key={i}>
              ({i + 1}) <Tex tex={sl} />: <Rich text={ch.anchor.compose.meanings[i]} />
            </li>
          ))}
        </ul>
        <button type="button" className="link-btn" onClick={reset}>
          أعد الكتابة
        </button>
      </div>
    );
  return (
    <div className="compose">
      <p className="pk">من الذاكرة</p>
      <p className="pq">اكتب القانون: اختر خانة ثم البطاقة التي تناسبها.</p>
      <Tex tex={tex} display />
      <div className="slots" role="group" aria-label="خانات القانون">
        {law.slots.map((_, i) => (
          <button key={i} type="button" className={`slot ${i === active ? 'on' : ''} ${checked ? (ok(i) ? 'ok' : 'no') : ''}`} aria-pressed={i === active} onClick={() => setActive(i)}>
            <span>الخانة ({i + 1})</span> {fill[i] ? <Tex tex={fill[i]!} /> : <span aria-label="فارغة">؟</span>}
            {checked && <span aria-hidden="true">{ok(i) ? ' ✓' : ' ✗'}</span>}
          </button>
        ))}
      </div>
      <div className="tiles" role="group" aria-label={`بطاقات للخانة ${active + 1}`}>
        {ch.anchor.compose.tiles.map((t, i) => (
          <button key={t} type="button" className="tile" onClick={() => place(t)} ref={i === 0 ? firstTile : undefined}>
            <Tex tex={t} />
          </button>
        ))}
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-c" disabled={fill.some((v) => v === null)} onClick={check}>
          تحقّق
        </button>
        <button type="button" className="btn btn-quiet" onClick={reset}>
          امسح
        </button>
      </div>
      {checked && (
        <div className="feedback no" role="status">
          <p>
            <strong>راجع الخانات المعلّمة ✗، ثم اختر لها بطاقة أخرى.</strong>
          </p>
          {/* الإجابة لا تُكشف من أول محاولة: بعد محاولتين خاطئتين، أو بطلب الطالب */}
          {showAnswer || wrongTries >= 2 ? (
            <ul ref={answerRef} tabIndex={-1} aria-label="الإجابة">
              {law.slots.map((sl, i) => (
                <li key={i}>
                  ({i + 1}) <Tex tex={sl} />: <Rich text={ch.anchor.compose.meanings[i]} />
                </li>
              ))}
            </ul>
          ) : (
            <button type="button" className="link-btn" onClick={() => setShowAnswer(true)}>
              أرني الإجابة
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** أسئلة الاسترجاع: سؤال واحد معروض في كل مرة. */
function Recall({ ch }: { ch: Chapter }) {
  const qs = ch.anchor.recall;
  const [i, setI] = useState(0);
  return (
    <div className="recall">
      <ChoiceCheck key={qs[i].id} id={qs[i].id} q={qs[i]} kicker={`من الذاكرة · ${i + 1} من ${qs.length}`} />
      <div className="btn-row">
        <button type="button" className="btn btn-quiet" disabled={i === 0} onClick={() => setI(i - 1)}>
          → السابق
        </button>
        <button type="button" className="btn btn-quiet" disabled={i === qs.length - 1} onClick={() => setI(i + 1)}>
          السؤال التالي ←
        </button>
      </div>
    </div>
  );
}
