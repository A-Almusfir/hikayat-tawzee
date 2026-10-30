import type { Art } from '../../content/chapterTypes';
import { choose } from '../../lib/dist';

type Of<K extends Art['kind']> = Extract<Art, { kind: K }>;

/** رسم افتتاحي يُولَّد من البيانات أو من القانون. */
export function ArtView({ art }: { art: Art }) {
  return (
    <figure className="hk-art">
      {art.kind === 'unit-grid' && <UnitGrid a={art} />}
      {art.kind === 'urn' && <Urn a={art} />}
      {art.kind === 'cups' && <Cups a={art} />}
      {art.kind === 'runs' && <Runs a={art} />}
      {art.kind === 'pascal' && <Pascal a={art} />}
      {art.kind === 'timeline' && <Timeline a={art} />}
      {art.kind === 'streak' && <Streak a={art} />}
      {art.kind === 'galton' && <Galton a={art} />}
      <figcaption>{art.caption}</figcaption>
    </figure>
  );
}

const DOTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.3, 0.5], [0.7, 0.5]],
  3: [[0.3, 0.32], [0.7, 0.32], [0.5, 0.72]],
  4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
};

/** كل مربع وحدة، وكل نقطة حدث؛ مرتبة حسب العدد. خمسة أحداث فأكثر تُكتب رقمًا. */
function UnitGrid({ a }: { a: Of<'unit-grid'> }) {
  const cells: number[] = [];
  a.counts.forEach((n, k) => {
    for (let i = 0; i < n; i++) cells.push(k);
  });
  const S = 17, rows = Math.ceil(cells.length / a.cols);
  return (
    <svg viewBox={`0 0 ${a.cols * S + 4} ${rows * S + 4}`} role="img" aria-label={a.ariaLabel} direction="ltr">
      {cells.map((k, i) => {
        const x = 2 + (i % a.cols) * S, y = 2 + Math.floor(i / a.cols) * S;
        return (
          <g key={i}>
            <rect x={x + 1} y={y + 1} width={S - 2} height={S - 2} rx="2.5" className={k ? 'hk-cell hit' : 'hk-cell'} />
            {k >= 5 ? (
              <text x={x + S / 2} y={y + S / 2 + 4} textAnchor="middle" className="hk-num">{k}</text>
            ) : (
              (DOTS[k] ?? []).map(([dx, dy], j) => <circle key={j} cx={x + 1 + dx * (S - 2)} cy={y + 1 + dy * (S - 2)} r={k >= 3 ? 2.1 : 2.6} className="hk-dot" />)
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** جرة حصى: بيضاء (دائرة مفرغة) وسوداء (ممتلئة). */
function Urn({ a }: { a: Of<'urn'> }) {
  const n = a.white + a.black, S = 22, rows = Math.ceil(n / a.cols);
  const W = a.cols * S + 24, H = rows * S + 34;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={a.ariaLabel} direction="ltr">
      <path d={`M 6 8 Q 6 ${H - 2} ${W / 2} ${H - 2} Q ${W - 6} ${H - 2} ${W - 6} 8`} className="urn-body" />
      {Array.from({ length: n }, (_, i) => {
        const x = 12 + (i % a.cols) * S + S / 2, y = 14 + Math.floor(i / a.cols) * S + S / 2;
        return <circle key={i} cx={x} cy={y} r={S / 2 - 3} className={i < a.black ? 'peb black' : 'peb white'} />;
      })}
    </svg>
  );
}

/** أكواب الشاي: «ح» حليب أولًا (ممتلئ)، «ش» شاي أولًا (مفرغ) — الحرف والشكل لا اللون فقط. */
function Cups({ a }: { a: Of<'cups'> }) {
  const n = a.milk + a.tea, S = 34, W = n * S + 8, H = 52;
  // ترتيب ثابت مختلط يوحي بالعشوائية
  const order = Array.from({ length: n }, (_, i) => ((i * 5 + 3) % n) < a.milk);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={a.ariaLabel} direction="ltr">
      {order.map((milk, i) => {
        const x = 4 + i * S;
        return (
          <g key={i}>
            <path d={`M${x + 5} 8 h${S - 12} l-3 28 h${-(S - 18)} z`} className={milk ? 'cup milk' : 'cup'} />
            <path d={`M${x + S - 7} 14 q7 2 0 12`} className="cup-handle" />
            <text x={x + S / 2 - 1} y={28} textAnchor="middle" className={milk ? 'cup-l on' : 'cup-l'}>{milk ? 'ح' : 'ش'}</text>
          </g>
        );
      })}
      <path d={`M2 44 H${W - 2}`} className="cup-handle" />
    </svg>
  );
}

/** جولات حتى الفوز رقم r: الفوز مربع ممتلئ برقمه، والخسارة مربع متقطع «خ»، والأخير مُبرز. */
function Runs({ a }: { a: Of<'runs'> }) {
  const S = 34, W = a.trials.length * S + 4, H = S + 26;
  let wins = 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={a.ariaLabel} direction="ltr">
      {a.trials.map((t, i) => {
        if (t) wins++;
        const x = 2 + i * S, last = i === a.trials.length - 1;
        return (
          <g key={i}>
            <rect x={x + 2} y={2} width={S - 4} height={S - 4} rx="5" className={t ? (last ? 'run win last' : 'run win') : 'run loss'} />
            <text x={x + S / 2} y={S / 2 + 6} textAnchor="middle" className={t ? 'run-t win' : 'run-t'}>{t ? wins : 'خ'}</text>
            <text x={x + S / 2} y={S + 18} textAnchor="middle" className="run-n">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** مثلث المعاملات؛ يُبرز في الصف الأخير المعاملات من الموضع highlightFrom فصاعدًا. */
function Pascal({ a }: { a: Of<'pascal'> }) {
  const R = a.rows, dx = 30, dy = 34, W = (R + 1) * dx + 20, H = (R + 1) * dy + 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={a.ariaLabel} direction="ltr">
      {Array.from({ length: R + 1 }, (_, r) =>
        Array.from({ length: r + 1 }, (_, k) => {
          const x = W / 2 + (k - r / 2) * dx, y = 22 + r * dy;
          const hl = r === R && k >= a.highlightFrom;
          return (
            <g key={`${r}-${k}`}>
              <circle cx={x} cy={y} r="13" className={hl ? 'pas hl' : r === R ? 'pas last' : 'pas'} />
              <text x={x} y={y + 5} textAnchor="middle" className={hl ? 'pas-t hl' : 'pas-t'}>{choose(r, k)}</text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

/** خط زمني لأحداث، والمسافات بينها أزمنة الانتظار. */
function Timeline({ a }: { a: Of<'timeline'> }) {
  const W = 320, H = 104, L = 14, R = 14;
  const X = (t: number) => L + (t / a.span) * (W - L - R);
  const ticks = Array.from({ length: Math.floor(a.span) + 1 }, (_, i) => i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={a.ariaLabel} direction="ltr">
      {a.times.map((t, i) => {
        const prev = i ? a.times[i - 1] : 0;
        return <line key={`g${i}`} x1={X(prev)} x2={X(t)} y1={i % 2 ? 26 : 20} y2={i % 2 ? 26 : 20} className="gap" />;
      })}
      <line x1={L} x2={W - R} y1={48} y2={48} className="axis-l" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={44} y2={52} className="axis-l" />
          <text x={X(t)} y={72} textAnchor="middle" className="tl-t">{t}</text>
        </g>
      ))}
      {a.times.map((t, i) => <path key={i} d={`M ${X(t)} 36 l 7 10 l -7 10 l -7 -10 z`} className="ev" />)}
      <text x={W - R} y={100} textAnchor="end" className="tl-t">{a.unit}</text>
    </svg>
  );
}

/** سلسلة إخفاقات متتالية تنتهي بعلامة استفهام. */
function Streak({ a }: { a: Of<'streak'> }) {
  const cols = 9, S = 30, rows = Math.ceil((a.length + 1) / cols);
  return (
    <svg viewBox={`0 0 ${cols * S + 4} ${rows * S + 4}`} role="img" aria-label={a.ariaLabel} direction="ltr">
      {Array.from({ length: a.length + 1 }, (_, i) => {
        const x = 2 + (i % cols) * S, y = 2 + Math.floor(i / cols) * S;
        const last = i === a.length;
        return (
          <g key={i}>
            <rect x={x + 2} y={y + 2} width={S - 4} height={S - 4} rx="5" className={last ? 'stk q' : 'stk'} />
            <text x={x + S / 2} y={y + S / 2 + 5} textAnchor="middle" className={last ? 'stk-t q' : 'stk-t'}>{last ? '؟' : i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** لوح غالتون: مسامير، وأعمدة بارتفاع ما يتوقعه ذو الحدين. */
function Galton({ a }: { a: Of<'galton'> }) {
  const R = a.rows, dx = 26, dy = 18, W = (R + 2) * dx, top = 14;
  const pegsH = top + R * dy, barMax = 90, H = pegsH + barMax + 16;
  const max = choose(R, Math.floor(R / 2));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={a.ariaLabel} direction="ltr">
      {Array.from({ length: R }, (_, r) =>
        Array.from({ length: r + 1 }, (_, k) => <circle key={`${r}-${k}`} cx={W / 2 + (k - r / 2) * dx} cy={top + r * dy} r="2.6" className="peg" />),
      )}
      {Array.from({ length: R + 1 }, (_, k) => {
        const x = W / 2 + (k - R / 2) * dx, h = (choose(R, k) / max) * barMax;
        return <rect key={k} x={x - dx / 2 + 3} y={pegsH + barMax - h + 6} width={dx - 6} height={h} className="gbar" />;
      })}
      <line x1={0} x2={W} y1={pegsH + barMax + 6} y2={pegsH + barMax + 6} className="axis-l" />
    </svg>
  );
}
