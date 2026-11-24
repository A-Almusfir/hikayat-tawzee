import type { ReactNode } from 'react';
import { sourceById } from '../../content/sources';
import { scrollToId } from '../../lib/router';
import { useUiLang } from '../../lib/lang';

export const SCENES = ['الحكاية', 'جرّب', 'ابنِ القانون', 'مسألة الاختبار', 'ثبّت'];
export const SCENES_EN = ['The story', 'Try it', 'Build the formula', 'Exam problem', 'Lock it in'];

export function Scene({ n, title, art, artAfter, children }: { n: number; title: string; art?: ReactNode; artAfter?: boolean; children: ReactNode }) {
  const en = useUiLang() === 'en';
  return (
    <section className={`scene ${n % 2 ? 'odd' : 'even'}`} id={`scene-${n}`} data-n={n} aria-labelledby={`scene-${n}-h`}>
      <header className="scene-head">
        <p className="scene-k">{en ? `Scene ${n} · ${SCENES_EN[n - 1]}` : `المشهد ${n} · ${SCENES[n - 1]}`}</p>
        <h2 id={`scene-${n}-h`} tabIndex={-1}>{title}</h2>
      </header>
      <div className={`scene-in ${artAfter ? 'art-after' : ''}`}>
        <div className="scene-text">{children}</div>
        {art && <div className="scene-art">{art}</div>}
      </div>
    </section>
  );
}

/** إشارة مصادر واحدة لكل جملة (زر واحد) تنقل إلى قائمة مصادر الفصل. */
export function Cites({ ids, order }: { ids: string[]; order: string[] }) {
  const en = useUiLang() === 'en';
  const nums = ids.map((id) => order.indexOf(id) + 1);
  return (
    <button
      type="button"
      className="cite"
      dir="ltr"
      onClick={() => scrollToId(`src-${ids[0]}`)}
      aria-label={`${en ? 'Sources' : 'المصادر'} ${nums.join(en ? ', ' : '، ')}: ${ids.map((id) => (en && sourceById[id].citeEn) || sourceById[id].cite).join(' — ')}`}
    >
      [{nums.join(', ')}]
    </button>
  );
}
