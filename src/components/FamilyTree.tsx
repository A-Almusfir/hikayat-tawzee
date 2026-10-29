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
const POS: Record<DistId, { x: number; y: number }> = {
  bernoulli: { x: 210, y: 52 },
  geometric: { x: 80, y: 178 },
  binomial: { x: 290, y: 178 },
  exponential: { x: 80, y: 334 },
  poisson: { x: 210, y: 334 },
  normal: { x: 352, y: 334 },
};
const LABEL: Record<string, { x: number; y: number }> = {
  'bern-bin': { x: 274, y: 106 },
  'bern-geo': { x: 120, y: 106 },
  'bin-poi': { x: 226, y: 258 },
  'bin-norm': { x: 352, y: 258 },
  'geo-exp': { x: 80, y: 258 },
  'poi-exp': { x: 145, y: 320 },
};
const R = 30;

export function FamilyTree({ initial = 'bin-poi' }: { initial?: string }) {
  const [sel, setSel] = useState(initial);
  const e = edges.find((x) => x.id === sel)!;
  return (
    <div className="tree">
      <svg viewBox="0 0 420 400" className="tree-svg" role="group" aria-label="شجرة التوزيعات: اضغط على سهم لترى العلاقة وشرطها، أو على توزيع لتفتح فصله" direction="ltr">
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
              <text x={p.x} y={p.y + R + 20} textAnchor="middle" direction="rtl" className="t-name" fill={identity[id].color}>
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
        {e.src && (
          <p className="tree-src">
            المصدر:{' '}
            {e.src.map((s) => (
              <a key={s} href={sourceById[s].url} target="_blank" rel="noopener noreferrer" dir="ltr" lang="en">
                {sourceById[s].cite}
              </a>
            ))}
          </p>
        )}
        <p className="tree-note">هذه شجرة منطقية لا تاريخية: الأسهم تبيّن العلاقات الرياضية، لا من سبق من زمنيًا.</p>
      </div>
    </div>
  );
}
