import { useState } from 'react';
import { sheetById } from '../content/sheet';
import { edges, type Panel } from '../content/family';
import { identity } from '../content/identity';
import { sourceById } from '../content/sources';
import type { DistId } from '../content/types';
import { href } from '../lib/router';
import { GlyphPaths } from './Glyph';
import { Rich, Tex } from './Tex';

// المحور السيني LTR داخل SVG؛ النصوص العربية تُرسم بـ direction="rtl".
// ثلاث لوحات بمواضع يدوية (يفحص سكربت الواجهة عدم تقاطع التسميات في كل لوحة).
// التوزيع الذي يظهر في لوحتين بوابة بينهما (مثل الهندسي وبواسون وذي الحدين في لوحة المستمرة).
type Place = { x: number; y: number; name: 'above' | 'below' | 'left' | 'right' };
const PANELS: Record<Panel, { title: string; first: string; pos: Partial<Record<DistId, Place>>; label: Record<string, { x: number; y: number }> }> = {
  discrete: {
    title: 'المتقطعة',
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
      'bern-geo': { x: 130, y: 128 },
      'hyp-bin': { x: 394, y: 150 },
      'geo-nb': { x: 158, y: 290 },
      'bin-poi': { x: 354, y: 290 },
    },
  },
  continuous: {
    title: 'من العدّ إلى القياس',
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
      'geo-exp': { x: 262, y: 150 },
      'poi-exp': { x: 344, y: 130 },
      'exp-gam': { x: 148, y: 284 },
      'bin-norm': { x: 432, y: 298 },
    },
  },
  sampling: {
    title: 'المعاينة',
    first: 'norm-chi',
    pos: {
      normal: { x: 110, y: 90, name: 'above' },
      gamma: { x: 350, y: 90, name: 'above' },
      chisquare: { x: 230, y: 232, name: 'right' },
      t: { x: 110, y: 370, name: 'below' },
    },
    label: {
      'norm-chi': { x: 200, y: 148 },
      'gam-chi': { x: 316, y: 182 },
      'chi-t': { x: 206, y: 318 },
      't-norm': { x: 66, y: 232 },
    },
  },
};
const PANEL_ORDER: Panel[] = ['discrete', 'continuous', 'sampling'];
const NAME_OFFSET = { above: [0, -42], below: [0, 50], left: [-70, 6], right: [76, 6] } as const;
const R = 30;

export function FamilyTree({ initial = 'bin-poi' }: { initial?: string }) {
  const [panel, setPanel] = useState<Panel>(() => edges.find((x) => x.id === initial)?.panel ?? 'discrete');
  const [sel, setSel] = useState(initial);
  const P = PANELS[panel];
  const POS = P.pos, LABEL = P.label;
  const shown = edges.filter((x) => x.panel === panel);
  const e = shown.find((x) => x.id === sel) ?? shown.find((x) => x.id === P.first)!;
  const pick = (p: Panel) => (setPanel(p), setSel(PANELS[p].first));
  return (
    <div className="tree">
      <div className="seg-tabs tree-tabs" role="group" aria-label="لوحات الشجرة">
        {PANEL_ORDER.map((p) => (
          <button key={p} type="button" className={`seg-tab ${p === panel ? 'on' : ''}`} aria-pressed={p === panel} onClick={() => pick(p)}>
            {PANELS[p].title}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 460 444" className="tree-svg" role="group" aria-label={`شجرة التوزيعات، لوحة ${P.title}: اضغط على سهم لترى العلاقة وشرطها، أو على توزيع لتفتح فصله`} direction="ltr">
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
              aria-label={`${ed.title}. ${ed.kind === 'exact' ? 'علاقة دقيقة' : 'نهاية أو تقريب بشرط'}`}
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
              <text x={lp.x} y={lp.y} textAnchor="middle" direction="rtl" className="t-label">
                {ed.short}
              </text>
            </g>
          );
        })}
        {(Object.keys(POS) as DistId[]).map((id) => {
          const p = POS[id]!;
          return (
            <a key={id} href={href.dist(id)} className="t-node" aria-label={`افتح الفصل: ${sheetById[id].nameAr}`}>
              <circle cx={p.x} cy={p.y} r={R} fill="#fffdf8" stroke={identity[id].color} strokeWidth="2.5" />
              <svg x={p.x - 15} y={p.y - 15} width="30" height="30" viewBox="0 0 24 24" fill={identity[id].color} stroke={identity[id].color} aria-hidden="true">
                <GlyphPaths id={id} />
              </svg>
              <text x={p.x + NAME_OFFSET[p.name][0]} y={p.y + NAME_OFFSET[p.name][1]} textAnchor="middle" direction="rtl" className="t-name" fill={identity[id].color}>
                {sheetById[id].nameAr}
              </text>
            </a>
          );
        })}
      </svg>
      <div className="tree-key" aria-hidden="true">
        <span><i className="k-solid" /> علاقة دقيقة</span>
        <span><i className="k-dash" /> نهاية/تقريب بشرط</span>
      </div>
      <div className={`tree-panel ${e.kind}`} aria-live="polite">
        <p className="tree-kind">{e.kind === 'exact' ? 'علاقة دقيقة' : 'نهاية أو تقريب — بشرط'}</p>
        <h3>{e.title}</h3>
        <Rich as="p" text={e.body} />
        <Tex tex={e.tex} display />
        <p className="tree-cond">
          <strong>الشرط: </strong>
          <Rich text={e.condition} />
        </p>
        {(e.detail || e.src) && (
          <details className="tree-more">
            <summary>للمزيد</summary>
            {e.detail && <Rich as="p" text={e.detail} />}
            {e.src && (
              <p className="tree-src">
                المصدر:{' '}
                {e.src.map((s) => (
                  <a key={s} href={sourceById[s].url} target="_blank" rel="noopener noreferrer">
                    {sourceById[s].cite}
                  </a>
                ))}
              </p>
            )}
          </details>
        )}
        <p className="tree-note">هذه شجرة منطقية لا تاريخية: الأسهم تبيّن العلاقات الرياضية، لا من سبق من زمنيًا.</p>
      </div>
    </div>
  );
}
