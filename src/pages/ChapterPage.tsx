import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { Chapter, ExamProblem, Predict as PredictT } from '../content/chapterTypes';
import { distById } from '../content/distributions';
import { horseKicks, horseKickTotals } from '../content/horsekicks';
import { identity, tint } from '../content/identity';
import { sourceById } from '../content/sources';
import { Glyph } from '../components/Glyph';
import { labs } from '../components/labs';
import { DistCardView, FormulaSection, Quiz } from '../components/sections';
import { Rich, Tex } from '../components/Tex';
import { fmt, poisson } from '../lib/dist';
import { href, scrollToId } from '../lib/router';
import { progress, useProgress } from '../lib/storage';

const SCENES = ['الحكاية', 'جرّب', 'ابنِ القانون', 'مسألة الاختبار', 'ثبّت'];

export function ChapterPage({ ch, scene }: { ch: Chapter; scene?: number }) {
  const d = distById[ch.id];
  const color = identity[ch.id].color;
  const style = { '--c': color, '--c-tint': tint(color, 0.08), '--c-tint2': tint(color, 0.16) } as CSSProperties;
  const [active, setActive] = useState(1);

  // ترقيم المصادر بترتيب أول ظهور في الفصل
  const srcOrder = useMemo(() => {
    const ids: string[] = [];
    for (const c of [...ch.story.claims, ...ch.story.more]) for (const s of c.src) if (!ids.includes(s)) ids.push(s);
    return ids;
  }, [ch]);

  useEffect(() => {
    if (scene) window.setTimeout(() => scrollToId(`scene-${scene}`), 50);
  }, [scene]);

  useEffect(() => {
    const els = SCENES.map((_, i) => document.getElementById(`scene-${i + 1}`)).filter(Boolean) as HTMLElement[];
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(Number(en.target.getAttribute('data-n')));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const Lab = labs[ch.id];

  return (
    <article className="chapter" style={style}>
      <header className="ch-head">
        <p className="ch-num" aria-hidden="true">{ch.number}</p>
        <div>
          <p className="ch-kicker">الفصل {ch.number} من 6 · {d.type === 'discrete' ? 'متقطع' : 'مستمر'}</p>
          <h1 tabIndex={-1}>
            <Glyph id={ch.id} size={40} /> {d.nameAr} <span className="en" lang="en" dir="ltr">{d.nameEn}</span>
          </h1>
          <p className="ch-q">{ch.question}</p>
        </div>
      </header>

      <nav className="ch-progress" aria-label="مشاهد الفصل">
        <ol>
          {SCENES.map((t, i) => (
            <li key={t}>
              <a
                href={href.dist(ch.id, i + 1)}
                aria-current={active === i + 1 ? 'step' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  history.replaceState(null, '', href.dist(ch.id, i + 1));
                  scrollToId(`scene-${i + 1}`);
                }}
              >
                <span className="pn">{i + 1}</span>
                <span className="pt">{t}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ① الحكاية */}
      <Scene n={1} title={ch.story.headline} art={<HorseKickGrid />}>
        <ol className="claims">
          {ch.story.claims.map((c, i) => (
            <li key={i}>
              <Rich as="p" className="claim" text={c.text} />
              <Cites ids={c.src} order={srcOrder} />
              {c.links && (
                <p className="claim-link">
                  <span aria-hidden="true">↙ </span>
                  <Rich text={c.links} />
                </p>
              )}
            </li>
          ))}
        </ol>
        <details className="more">
          <summary>للمزيد من الحكاية</summary>
          {ch.story.more.map((c, i) => (
            <div key={i} className="more-item">
              <Rich as="p" text={c.text} />
              <Cites ids={c.src} order={srcOrder} />
            </div>
          ))}
        </details>
      </Scene>

      {/* ② جرّب */}
      <TryHorseKicks title={ch.tryIt.headline} prompt={ch.tryIt.prompt} />

      {/* ③ ابنِ القانون */}
      <BuildScene ch={ch} />

      {/* ④ مسألة الاختبار */}
      <Scene
        n={4}
        title={ch.exam.headline}
        artAfter
        art={
          <aside className="tricks">
            <h3>حيل الحساب</h3>
            <ul>
              {ch.exam.tricks.map((t, i) => (
                <Rich key={i} as="li" text={t} />
              ))}
            </ul>
          </aside>
        }
      >
        {ch.exam.problems.map((p, i) => (
          <ExamBlock key={i} p={p} />
        ))}
      </Scene>

      {/* ⑤ ثبّت وانتقل */}
      <Scene
        n={5}
        title={ch.anchor.headline}
        art={
          <div className="hook">
            <Rich as="p" text={ch.anchor.hook} />
            <Tex tex={ch.anchor.hookTex} display />
            <p className="hook-data">
              وفي بيانات الخيل نفسها: المتوسط <Tex tex={fmt(horseKickTotals.mean, 2)} /> والتباين <Tex tex={`\\approx ${fmt(horseKickTotals.variance, 2)}`} />.
            </p>
          </div>
        }
      >
        <p className="lead-s">ثلاثة أسئلة سريعة من الذاكرة:</p>
        {ch.anchor.recall.map((q) => (
          <PredictBox key={q.id} id={q.id} q={q} kicker="من الذاكرة" />
        ))}
        <a className="bridge" href={href.dist(ch.anchor.bridge.to)} style={{ '--to': identity[ch.anchor.bridge.to].color } as CSSProperties}>
          <Glyph id={ch.anchor.bridge.to} size={36} />
          <span>
            <span className="bridge-k">الفصل التالي: {distById[ch.anchor.bridge.to].nameAr}</span>
            <Rich as="span" className="bridge-t" text={ch.anchor.bridge.text} />
          </span>
          <span aria-hidden="true" className="bridge-arr">←</span>
        </a>
      </Scene>

      <section className="reference" aria-labelledby="ref-h">
        <h2 id="ref-h">المرجع</h2>
        <p className="hint">للتعمق والمراجعة: المختبر الكامل، والاشتقاق، والبطاقة، وأسئلة إضافية.</p>
        <details>
          <summary>المختبر الكامل: المعدل والفترة والمحاكاة</summary>
          <Lab />
        </details>
        <details>
          <summary>القانون والاشتقاق الكامل</summary>
          <FormulaSection d={d} />
        </details>
        <details>
          <summary>بطاقة التوزيع</summary>
          <DistCardView d={d} />
        </details>
        <details>
          <summary>أسئلة إضافية</summary>
          <Quiz d={d} />
        </details>
      </section>

      <section className="ch-sources" aria-labelledby="src-h">
        <h2 id="src-h">مصادر هذا الفصل</h2>
        <ol>
          {srcOrder.map((id) => (
            <li key={id} id={`src-${id}`}>
              <a href={sourceById[id].url} target="_blank" rel="noopener noreferrer" lang="en" dir="ltr">
                {sourceById[id].cite}
              </a>
            </li>
          ))}
        </ol>
        <p className="hint">جرى التحقق من هذه المصادر عبر نتائج البحث ومقتطفاته أثناء الإعداد، لا بقراءة النصوص الأصلية كاملة.</p>
      </section>
    </article>
  );
}

function Scene({ n, title, art, artAfter, children }: { n: number; title: string; art?: ReactNode; artAfter?: boolean; children: ReactNode }) {
  return (
    <section className={`scene ${n % 2 ? 'odd' : 'even'}`} id={`scene-${n}`} data-n={n} aria-labelledby={`scene-${n}-h`}>
      <header className="scene-head">
        <p className="scene-k">المشهد {n} · {SCENES[n - 1]}</p>
        <h2 id={`scene-${n}-h`} tabIndex={-1}>{title}</h2>
      </header>
      <div className={`scene-in ${artAfter ? 'art-after' : ''}`}>
        <div className="scene-text">{children}</div>
        {art && <div className="scene-art">{art}</div>}
      </div>
    </section>
  );
}

function Cites({ ids, order }: { ids: string[]; order: string[] }) {
  return (
    <span className="cites">
      {ids.map((id) => (
        <button key={id} type="button" className="cite" onClick={() => scrollToId(`src-${id}`)} aria-label={`المصدر ${order.indexOf(id) + 1}: ${sourceById[id].cite}`}>
          [{order.indexOf(id) + 1}]
        </button>
      ))}
    </span>
  );
}

// ———— رسم الحكاية: 200 فيلق-سنة مرتبة حسب عدد الوفيات ————
function HorseKickGrid() {
  const cells: number[] = [];
  horseKicks.observed.forEach((n, k) => {
    for (let i = 0; i < n; i++) cells.push(k);
  });
  const COLS = 20, S = 17;
  const dotPos: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [[0.3, 0.5], [0.7, 0.5]],
    3: [[0.3, 0.32], [0.7, 0.32], [0.5, 0.72]],
    4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
  };
  return (
    <figure className="hk-art">
      <svg viewBox={`0 0 ${COLS * S + 4} ${10 * S + 4}`} role="img" aria-label="200 مربع، كل مربع فيلق في سنة: 109 بلا وفيات، 65 بوفاة واحدة، 22 بوفاتين، 3 بثلاث، 1 بأربع" direction="ltr">
        {cells.map((k, i) => {
          const x = 2 + (i % COLS) * S, y = 2 + Math.floor(i / COLS) * S;
          return (
            <g key={i}>
              <rect x={x + 1} y={y + 1} width={S - 2} height={S - 2} rx="2.5" className={k ? 'hk-cell hit' : 'hk-cell'} />
              {(dotPos[k] ?? []).map(([dx, dy], j) => (
                <circle key={j} cx={x + 1 + dx * (S - 2)} cy={y + 1 + dy * (S - 2)} r={k >= 3 ? 2.1 : 2.6} className="hk-dot" />
              ))}
            </g>
          );
        })}
      </svg>
      <figcaption>
        كل مربع = فيلق واحد في سنة واحدة، وكل نقطة = وفاة. 200 مربعًا مرتبة حسب عدد الوفيات، لا حسب الفيلق والسنة.
      </figcaption>
    </figure>
  );
}

// ———— المشهد ②: طابق القانون على البيانات ————
function TryHorseKicks({ title, prompt }: { title: string; prompt: string }) {
  const [lambda, setLambda] = useState(1.2);
  const [shown, setShown] = useState(false);
  const obs = horseKicks.observed;
  const N = horseKicks.units;
  const ks = [0, 1, 2, 3, 4];
  const exp = ks.map((k) => N * poisson.pmf(k, lambda));
  const expTail = N * (1 - poisson.cdf(4, lambda));
  const diff = ks.reduce((s, k) => s + Math.abs(obs[k] - exp[k]), 0) + expTail;
  const W = 400, H = 230, L = 38, B = 32, T = 10;
  const yMax = 140;
  const Y = (v: number) => T + (H - T - B) * (1 - Math.min(v, yMax) / yMax);
  const slot = (W - L - 8) / 6;
  const cats = [...ks.map((k) => ({ label: String(k), o: obs[k], e: exp[k] })), { label: '5+', o: 0, e: expTail }];
  return (
    <section className="scene even" id="scene-2" data-n={2} aria-labelledby="scene-2-h">
      <header className="scene-head">
        <p className="scene-k">المشهد 2 · جرّب</p>
        <h2 id="scene-2-h" tabIndex={-1}>{title}</h2>
      </header>
      <div className="scene-in">
        <div className="scene-text">
          <p className="fit" aria-live="polite">
            الفرق الكلي بين ما وقع وما يتوقعه القانون: <strong className="num" dir="ltr">{fmt(diff, 1)}</strong> فيلق-سنة
          </p>
          {!shown ? (
            <button type="button" className="btn btn-c" onClick={() => setShown(true)}>
              اكشف ما وجده بورتكيفيتش
            </button>
          ) : (
            <div className="reveal-box" role="status">
              <p>
                متوسط البيانات نفسها <Tex tex={`\\bar{x} = \\tfrac{122}{200} = 0.61`} />، وتباينها <Tex tex={`\\approx ${fmt(horseKickTotals.variance, 2)}`} />: المتوسط والتباين متساويان تقريبًا، وهذه بصمة بواسون.
              </p>
              <button type="button" className="btn btn-quiet" onClick={() => setLambda(0.61)}>
                ضع <Tex tex="\lambda = 0.61" />
              </button>
            </div>
          )}
        </div>
        <div className="scene-art">
          <Rich as="p" text={prompt} />
          <div className="one-control">
            <label htmlFor="hk-l">
              متوسط عدد الوفيات في الفيلق-السنة <Tex tex="\lambda" />
            </label>
            <div className="slider-row">
              <input id="hk-l" type="range" min={0.2} max={1.6} step={0.01} value={lambda} onChange={(e) => setLambda(Number(e.target.value))} dir="ltr" aria-valuetext={fmt(lambda, 2)} />
              <output htmlFor="hk-l" className="num big-out" dir="ltr">{fmt(lambda, 2)}</output>
            </div>
          </div>
          <figure className="hk-chart">
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`عند λ=${fmt(lambda, 2)}: المتوقع ${cats.map((c) => `${c.label}: ${fmt(c.e, 1)}`).join('، ')}. الواقع: 109، 65، 22، 3، 1، 0`} direction="ltr">
              <defs>
                <pattern id="obsHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#1b2a4a" strokeWidth="1.6" />
                </pattern>
              </defs>
              {[0, 35, 70, 105, 140].map((t) => (
                <g key={t}>
                  <line x1={L} x2={W - 4} y1={Y(t)} y2={Y(t)} className="grid" />
                  <text x={L - 6} y={Y(t) + 5} textAnchor="end" className="tick">{t}</text>
                </g>
              ))}
              {cats.map((c, i) => {
                const cx = L + slot * (i + 0.5);
                const bw = slot * 0.36;
                return (
                  <g key={c.label}>
                    <rect x={cx - bw - 1} y={Y(c.o)} width={bw} height={Y(0) - Y(c.o)} fill="url(#obsHatch)" stroke="#1b2a4a" strokeWidth="1.5" />
                    <rect x={cx + 1} y={Y(c.e)} width={bw} height={Y(0) - Y(c.e)} fill="var(--c)" />
                    <text x={cx} y={H - B + 20} textAnchor="middle" className="tick">{c.label}</text>
                  </g>
                );
              })}
              <line x1={L} x2={W - 4} y1={Y(0)} y2={Y(0)} className="axis" />
            </svg>
            <figcaption>
              <span className="lg"><i className="lg-obs" /> ما وقع (عدد الفيالق-السنوات)</span>
              <span className="lg"><i className="lg-exp" /> ما يتوقعه بواسون</span>
              <span className="lg-x">عدد الوفيات في الفيلق-السنة</span>
            </figcaption>
          </figure>
          <table className="hk-table">
            <caption className="sr-only">ما وقع مقابل المتوقع</caption>
            <thead>
              <tr>
                <th scope="row">الوفيات</th>
                {cats.map((c) => <th key={c.label} scope="col" dir="ltr">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">وقع</th>
                {cats.map((c) => <td key={c.label} dir="ltr">{c.o}</td>)}
              </tr>
              <tr>
                <th scope="row">متوقع</th>
                {cats.map((c) => <td key={c.label} dir="ltr">{fmt(c.e, 1)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ———— المشهد ③: ابنِ القانون مع «توقّع قبل الكشف» ————
function BuildScene({ ch }: { ch: Chapter }) {
  const quiz = useProgress().quiz;
  const steps = ch.build.steps;
  const answered = (i: number) => quiz[`${ch.id}-build-${i}`] !== undefined;
  // تظهر الخطوة التالية بعد الإجابة عن توقّع الخطوة الحالية
  let visible = 1;
  for (let i = 0; i < steps.length - 1; i++) if (!steps[i].predict || answered(i)) visible = i + 2;
  else break;
  const p1 = answered(1), p2 = answered(2);
  const q = String.raw`\boxed{\;?\;}`;
  const partial = `P(X=k) = ${p1 ? '\\textcolor{#6F3A94}{e^{-\\lambda}}' : q}\\;\\cdot\\;\\frac{${p2 ? '\\textcolor{#6F3A94}{\\lambda^{k}}' : q}}{${p2 ? '\\textcolor{#6F3A94}{k!}' : q}}`;
  const done = p1 && p2;
  return (
    <Scene
      n={3}
      title={ch.build.headline}
      art={
        <div className="build-art" aria-live="polite">
          <p className="build-k">{done ? 'القانون كاملًا' : 'القانون حتى الآن'}</p>
          <Tex tex={done ? ch.build.final : partial} display />
          <p className="build-range"><Tex tex="k = 0, 1, 2, \dots" /></p>
          {done && <Rich as="p" className="hint" text={ch.build.note} />}
        </div>
      }
    >
      <ol className="build-steps">
        {steps.slice(0, visible).map((s, i) => (
          <li key={i}>
            <Rich as="p" text={s.story} />
            {(!s.predict || answered(i)) && <Tex tex={s.tex} display />}
            {s.predict && <PredictBox id={`${ch.id}-build-${i}`} q={s.predict} />}
          </li>
        ))}
      </ol>
    </Scene>
  );
}

function PredictBox({ id, q, kicker = 'توقّع قبل أن تكشف' }: { id: string; q: PredictT; kicker?: string }) {
  const chosen = useProgress().quiz[id];
  const answered = chosen !== undefined;
  const ci = q.options.findIndex((o) => o.correct);
  return (
    <fieldset className="predict">
      <legend>
        <span className="pk">{kicker}</span>
        <Rich as="span" className="pq" text={q.prompt} />
      </legend>
      <div className="options">
        {q.options.map((o, i) => {
          // بعد الإجابة نُبقي اختيار الطالب والإجابة الصحيحة فقط، حتى لا يطول المشهد
          if (answered && i !== ci && i !== chosen) return null;
          const st = !answered ? '' : i === ci ? 'is-correct' : i === chosen ? 'is-wrong' : '';
          return (
            <label key={i} className={`option ${st}`}>
              <input type="radio" name={id} checked={chosen === i} disabled={answered} onChange={() => progress.setQuiz(id, i)} />
              <span className="opt-mark" aria-hidden="true">{st === 'is-correct' ? '✓' : st === 'is-wrong' ? '✗' : ''}</span>
              <Rich text={o.text} />
            </label>
          );
        })}
      </div>
      {answered && (
        <div className={`feedback ${chosen === ci ? 'ok' : 'no'}`} role="status">
          {chosen !== ci && (
            <p>
              <strong>اختيارك: </strong>
              <Rich text={q.options[chosen].why} />
            </p>
          )}
          <p>
            <strong>{chosen === ci ? '✓ صحيح. ' : 'الصحيح: '}</strong>
            <Rich text={q.options[ci].why} />
          </p>
          <button type="button" className="btn btn-quiet" onClick={() => progress.setQuiz(id, undefined)}>
            أعد المحاولة
          </button>
        </div>
      )}
    </fieldset>
  );
}

function ExamBlock({ p }: { p: ExamProblem }) {
  const [shown, setShown] = useState(0);
  return (
    <div className="exam">
      <p className="exam-label">{p.label}</p>
      <Rich as="p" className="exam-given" text={p.given} />
      <ol className="steps" aria-live="polite">
        {p.steps.slice(0, shown).map((s, i) => (
          <li key={i}>
            <strong>{s.title}</strong>
            {s.body && <Rich as="p" text={s.body} />}
            {s.tex?.map((t, j) => <Tex key={j} tex={t} display />)}
          </li>
        ))}
      </ol>
      {shown === p.steps.length && (
        <p className="exam-answer">
          <strong>الجواب: </strong>
          <Rich text={p.answer} />
        </p>
      )}
      <div className="btn-row">
        {shown < p.steps.length ? (
          <>
            <button type="button" className="btn btn-c" onClick={() => setShown(shown + 1)}>
              {shown === 0 ? 'حاولت؟ اكشف الخطوة الأولى' : `الخطوة التالية: ${p.steps[shown].title}`}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setShown(p.steps.length)}>
              اكشف الحل كاملًا
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-quiet" onClick={() => setShown(0)}>
            أخفِ الحل
          </button>
        )}
      </div>
    </div>
  );
}
