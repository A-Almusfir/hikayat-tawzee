import type { BuildStep, LawTemplate } from '../../content/chapterTypes';
import { useProgress } from '../../lib/storage';
import { Rich, Tex } from '../Tex';
import { ChoiceCheck } from './ChoiceCheck';
import { Scene } from './Scene';

const BOX = String.raw`\boxed{\;?\;}`;

/** يركّب القانون من القالب: خانة ممتلئة (ملونة ومرقّمة) أو خانة فارغة. */
export function lawTex(law: LawTemplate, color: string, filled: (n: number) => boolean, numbered = true) {
  return law.template.replace(/@(\d)/g, (_, d: string) => {
    const n = Number(d);
    if (!filled(n)) return BOX;
    const body = String.raw`\textcolor{${color}}{${law.slots[n - 1]}}`;
    return numbered ? String.raw`\underbrace{${body}}_{(${n})}` : body;
  });
}

export function BuildScene({ id, headline, law, steps, note, color }: { id: string; headline: string; law: LawTemplate; steps: BuildStep[]; note: string; color: string }) {
  const quiz = useProgress().quiz;
  const key = (i: number) => `${id}-build-${i}`;
  const done = (i: number) => !steps[i].predict || quiz[key(i)] !== undefined;
  // تظهر الخطوة التالية بعد الإجابة عن توقّع الخطوة الحالية
  let visible = 1;
  for (let i = 0; i < steps.length - 1 && done(i); i++) visible = i + 2;
  const revealed = new Set<number>();
  steps.forEach((s, i) => i < visible && done(i) && s.reveals?.forEach((n) => revealed.add(n)));
  const complete = law.slots.every((_, i) => revealed.has(i + 1));

  return (
    <Scene
      n={3}
      title={headline}
      art={
        <div className="build-art" aria-live="polite">
          <p className="build-k">{complete ? 'القانون كاملًا' : 'القانون حتى الآن'}</p>
          <Tex tex={lawTex(law, color, (n) => revealed.has(n), complete)} display />
          {law.range && <p className="build-range"><Tex tex={law.range} /></p>}
          {complete && <Rich as="p" className="hint" text={note} />}
        </div>
      }
    >
      <ol className="build-steps">
        {steps.slice(0, visible).map((s, i) => (
          <li key={i}>
            <Rich as="p" text={s.story} />
            {s.predict && <ChoiceCheck id={key(i)} q={s.predict} kicker="توقّع قبل أن تكشف" />}
            {done(i) && s.tex.map((t, j) => <Tex key={j} tex={t} display />)}
          </li>
        ))}
      </ol>
    </Scene>
  );
}
