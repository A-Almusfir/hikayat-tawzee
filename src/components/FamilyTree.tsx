import { useState } from 'react';
import { sheetById } from '../content/sheet';
import { edges, type Panel } from '../content/family';
import { identity } from '../content/identity';
import { sourceById } from '../content/sources';
import type { DistId } from '../content/types';
import { href } from '../lib/router';
import { GlyphPaths } from './Glyph';
import { useLang } from '../lib/lang';
import { Rich, Tex } from './Tex';

// المحور السيني LTR داخل SVG؛ النصوص العربية تُرسم بـ direction="rtl".
// ثلاث لوحات بمواضع يدوية (يفحص سكربت الواجهة عدم تقاطع التسميات في كل لوحة).
// التوزيع الذي يظهر في لوحتين بوابة بينهما (مثل الهندسي وبواسون وذي الحدين في لوحة المستمرة).
type Place = { x: number; y: number; name: 'above' | 'below' | 'left' | 'right' };
const PANELS: Record<Panel, { title: string; titleEn: string; first: string; pos: Partial<Record<DistId, Place>>; label: Record<string, { x: number; y: number }> }> = {
  discrete: {
    title: 'المتقطعة',
    titleEn: 'Discrete',
    first: 'bin-poi',
    pos: {
      bernoulli: { x: 200, y: 72, name: 'above' },
      hypergeometric: { x: 400, y: 72, name: 'above' },
      geometric: { x: 112, y: 210, name: 'left' },
      binomial: { x: 310, y: 210, name: 'right' },
      negbin: { x: 112, y: 360, name: 'below' },
      poisson: { x: 310, y: 360, name: 'below' },
    },
    label: {
      'bern-bin': { x: 288, y: 128 },
      'bern-geo': { x: 104, y: 128 },
      'hyp-bin': { x: 394, y: 150 },
      'geo-nb': { x: 158, y: 290 },
      'bin-poi': { x: 354, y: 290 },
    },
  },
  continuous: {
    title: 'من العدّ إلى القياس',
    titleEn: 'From counting to measuring',
    first: 'poi-exp',
    pos: {
      uniform: { x: 80, y: 72, name: 'above' },
      geometric: { x: 230, y: 72, name: 'above' },
      poisson: { x: 380, y: 72, name: 'above' },
      exponential: { x: 230, y: 222, name: 'right' },
      binomial: { x: 410, y: 222, name: 'above' },
      gamma: { x: 120, y: 360, name: 'below' },
      normal: { x: 380, y: 360, name: 'below' },
    },
    label: {
      'uni-exp': { x: 128, y: 160 },
      'geo-exp': { x: 180, y: 118 },
      'poi-exp': { x: 344, y: 130 },
      'exp-gam': { x: 92, y: 284 },
      'bin-norm': { x: 404, y: 298 },
    },
  },
  sampling: {
    title: 'المعاينة',
    titleEn: 'Sampling',
    first: 'norm-chi',
    pos: {
      normal: { x: 110, y: 90, name: 'above' },
      gamma: { x: 350, y: 90, name: 'above' },
      chisquare: { x: 230, y: 232, name: 'right' },
      t: { x: 110, y: 370, name: 'below' },
    },
    label: {
      'norm-chi': { x: 236, y: 150 },
      'gam-chi': { x: 316, y: 182 },
      'chi-t': { x: 218, y: 318 },
      't-norm': { x: 66, y: 232 },
    },
  },
};
const PANEL_ORDER: Panel[] = ['discrete', 'continuous', 'sampling'];
const NAME_OFFSET = { above: [0, -42], below: [0, 50], left: [-70, 6], right: [76, 6] } as const;
const R = 30;

/** موضع اسم التوزيع: بالإنجليزية يلتصق بالدائرة يمينًا ويسارًا ولا يتجاوز حافتي الرسم. */
function namePos(p: Place, label: string, en: boolean): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const [dx, dy] = NAME_OFFSET[p.name];
  if (!en) return { x: p.x + dx, y: p.y + dy, anchor: 'middle' };
  if (p.name === 'left') return { x: p.x - R - 6, y: p.y + dy, anchor: 'end' };
  if (p.name === 'right') return { x: p.x + R + 6, y: p.y + dy, anchor: 'start' };
  const half = label.length * 4.6;
  return { x: Math.min(456 - half, Math.max(4 + half, p.x)), y: p.y + dy, anchor: 'middle' };
}

export function FamilyTree({ initial = 'bin-poi' }: { initial?: string }) {
  const en = useLang() === 'en';
  const [panel, setPanel] = useState<Panel>(() => edges.find((x) => x.id === initial)?.panel ?? 'discrete');
  const [sel, setSel] = useState(initial);
  const P = PANELS[panel];
  const POS = P.pos, LABEL = P.label;
  const shown = edges.filter((x) => x.panel === panel);
  const e = shown.find((x) => x.id === sel) ?? shown.find((x) => x.id === P.first)!;
  const pick = (p: Panel) => (setPanel(p), setSel(PANELS[p].first));
  const T = (x: (typeof edges)[number]) => (en ? x.en : x);
  const name = (id: DistId) => (en ? sheetById[id].nameEn : sheetById[id].nameAr);
  const dir = (txt: string) => (/[\u0600-\u06FF]/.test(txt) ? 'rtl' : 'ltr');
  const exact = en ? 'Exact relation' : 'علاقة دقيقة';
  const limit = en ? 'Limit or approximation, under a condition' : 'نهاية أو تقريب — بشرط';
  return (
    <div className="tree">
      <div className="seg-tabs tree-tabs" role="group" aria-label={en ? 'Tree panels' : 'لوحات الشجرة'}>
        {PANEL_ORDER.map((p) => (
          <button key={p} type="button" className={`seg-tab ${p === panel ? 'on' : ''}`} aria-pressed={p === panel} onClick={() => pick(p)}>
            {en ? PANELS[p].titleEn : PANELS[p].title}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 460 444" className="tree-svg" role="group" aria-label={en ? `Distribution tree, ${P.titleEn} panel: tap an arrow to see the relation and its condition, or a distribution to open its chapter` : `شجرة التوزيعات، لوحة ${P.title}: اضغط على سهم لترى العلاقة وشرطها، أو على توزيع لتفتح فصله`} direction="ltr">
        <defs>
          <marker id="tarr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>
        {shown.map((ed) => {
          const a = POS[ed.from]!, b = POS[ed.to]!;
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
          const pad = R + 6;
          const x1 = a.x + (dx / len) * pad, y1 = a.y + (dy / len) * pad;
          const x2 = b.x - (dx / len) * (pad + 2), y2 = b.y - (dy / len) * (pad + 2);
          const active = ed.id === e.id;
          const lp = LABEL[ed.id];
          return (
            <g
              key={ed.id}
              className={`t-edge ${ed.kind} ${active ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={`${T(ed).title}. ${ed.kind === 'exact' ? exact : limit}`}
              onClick={() => setSel(ed.id)}
              onKeyDown={(k) => {
                if (k.key === 'Enter' || k.key === ' ') {
                  k.preventDefault();
                  setSel(ed.id);
                }
              }}
            >
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="hit" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="ln" markerEnd="url(#tarr)" markerStart={ed.both ? 'url(#tarr)' : undefined} />
              <text x={lp.x} y={lp.y} textAnchor="middle" direction={dir(T(ed).short)} className="t-label">
                {T(ed).short}
              </text>
            </g>
          );
        })}
        {(Object.keys(POS) as DistId[]).map((id) => {
          const p = POS[id]!;
          const np = namePos(p, name(id), en);
          return (
            <a key={id} href={href.dist(id)} className="t-node" aria-label={en ? `Open the chapter: ${sheetById[id].nameEn}` : `افتح الفصل: ${sheetById[id].nameAr}`}>
              <circle cx={p.x} cy={p.y} r={R} fill="#fffdf8" stroke={identity[id].color} strokeWidth="2.5" />
              <svg x={p.x - 15} y={p.y - 15} width="30" height="30" viewBox="0 0 24 24" fill={identity[id].color} stroke={identity[id].color} aria-hidden="true">
                <GlyphPaths id={id} />
              </svg>
              <text x={np.x} y={np.y} textAnchor={np.anchor} direction={en ? 'ltr' : 'rtl'} className="t-name" fill={identity[id].color}>
                {name(id)}
              </text>
            </a>
          );
        })}
      </svg>
      <div className="tree-key" aria-hidden="true">
        <span><i className="k-solid" /> {exact}</span>
        <span><i className="k-dash" /> {en ? 'Limit/approximation' : 'نهاية/تقريب بشرط'}</span>
      </div>
      <div className={`tree-panel ${e.kind}`} aria-live="polite">
        <p className="tree-kind">{e.kind === 'exact' ? exact : limit}</p>
        <h3>{T(e).title}</h3>
        <Rich as="p" text={T(e).body} />
        <Tex tex={e.tex} display />
        <p className="tree-cond">
          <strong>{en ? 'Condition: ' : 'الشرط: '}</strong>
          <Rich text={T(e).condition} />
        </p>
        {(T(e).detail || e.src) && (
          <details className="tree-more">
            <summary>{en ? 'More' : 'للمزيد'}</summary>
            {T(e).detail && <Rich as="p" text={T(e).detail!} />}
            {e.src && (
              <p className="tree-src">
                {en ? 'Source:' : 'المصدر:'}{' '}
                {e.src.map((s, i) => (
                  <span key={s}>
                    {i > 0 && ' · '}
                    <a href={sourceById[s].url} target="_blank" rel="noopener noreferrer">
                      {(en && sourceById[s].citeEn) || sourceById[s].cite}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </details>
        )}
        <p className="tree-note">{en ? 'This is a logical tree, not a historical one: the arrows show mathematical relations, not which came first.' : 'هذه شجرة منطقية لا تاريخية: الأسهم تبيّن العلاقات الرياضية، لا من سبق من زمنيًا.'}</p>
      </div>
    </div>
  );
}
