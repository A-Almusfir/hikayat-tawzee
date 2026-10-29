import { useState } from 'react';
import { distById } from '../content/distributions';
import { edges } from '../content/family';
import { identity } from '../content/identity';
import { sourceById } from '../content/sources';
import type { DistId } from '../content/types';
import { href } from '../lib/router';
import { GlyphPaths } from './Glyph';
import { Rich, Tex } from './Tex';

// المحور السيني LTR داخل SVG؛ النصوص العربية تُرسم بـ direction="rtl".
const POS: Record<DistId, { x: number; y: number; name: 'above' | 'below' | 'left' | 'right' }> = {
  bernoulli: { x: 250, y: 72, name: 'above' },
  geometric: { x: 120, y: 198, name: 'left' },
  binomial: { x: 330, y: 198, name: 'right' },
  exponential: { x: 120, y: 354, name: 'below' },
  poisson: { x: 270, y: 354, name: 'below' },
  normal: { x: 404, y: 354, name: 'below' },
};
// مواضع التسميات بعيدًا عن الخطوط والأسماء (يفحص سكربت الواجهة عدم تقاطعها)
const LABEL: Record<string, { x: number; y: number }> = {
  'bern-bin': { x: 318, y: 128 },
  'bern-geo': { x: 152, y: 128 },
  'bin-poi': { x: 270, y: 280 },
  'bin-norm': { x: 404, y: 280 },
  'geo-exp': { x: 92, y: 282 },
  'poi-exp': { x: 195, y: 430 },
};
const NAME_OFFSET = { above: [0, -42], below: [0, 50], left: [-70, 6], right: [76, 6] } as const;
const R = 30;

export function FamilyTree({ initial = 'bin-poi' }: { initial?: string }) {
  const [sel, setSel] = useState(initial);
  const e = edges.find((x) => x.id === sel)!;
  return (
    <div className="tree">
      <svg viewBox="0 0 460 444" className="tree-svg" role="group" aria-label="شجرة التوزيعات: اضغط على سهم لترى العلاقة وشرطها، أو على توزيع لتفتح فصله" direction="ltr">
        <defs>
          <marker id="tarr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>
        {edges.map((ed) => {
          const a = POS[ed.from], b = POS[ed.to];
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
          const pad = R + 6;
          const x1 = a.x + (dx / len) * pad, y1 = a.y + (dy / len) * pad;
          const x2 = b.x - (dx / len) * (pad + 2), y2 = b.y - (dy / len) * (pad + 2);
          const active = ed.id === sel;
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
          const p = POS[id];
          return (
            <a key={id} href={href.dist(id)} className="t-node" aria-label={`افتح فصل ${distById[id].nameAr}`}>
              <circle cx={p.x} cy={p.y} r={R} fill="#fffdf8" stroke={identity[id].color} strokeWidth="2.5" />
              <svg x={p.x - 15} y={p.y - 15} width="30" height="30" viewBox="0 0 24 24" fill={identity[id].color} stroke={identity[id].color} aria-hidden="true">
                <GlyphPaths id={id} />
              </svg>
              <text x={p.x + NAME_OFFSET[p.name][0]} y={p.y + NAME_OFFSET[p.name][1]} textAnchor="middle" direction="rtl" className="t-name" fill={identity[id].color}>
                {distById[id].nameAr}
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
