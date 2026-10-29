import type { Art } from '../../content/chapterTypes';

/** شبكة وحدات: كل مربع وحدة (مثل فيلق في سنة)، وكل نقطة حدث. مرتبة حسب العدد. */
export function UnitGrid({ art }: { art: Art }) {
  const cells: number[] = [];
  art.counts.forEach((n, k) => {
    for (let i = 0; i < n; i++) cells.push(k);
  });
  const S = 17;
  const rows = Math.ceil(cells.length / art.cols);
  const dotPos: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [[0.3, 0.5], [0.7, 0.5]],
    3: [[0.3, 0.32], [0.7, 0.32], [0.5, 0.72]],
    4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
  };
  return (
    <figure className="hk-art">
      <svg viewBox={`0 0 ${art.cols * S + 4} ${rows * S + 4}`} role="img" aria-label={art.ariaLabel} direction="ltr">
        {cells.map((k, i) => {
          const x = 2 + (i % art.cols) * S, y = 2 + Math.floor(i / art.cols) * S;
          return (
            <g key={i}>
              <rect x={x + 1} y={y + 1} width={S - 2} height={S - 2} rx="2.5" className={k ? 'hk-cell hit' : 'hk-cell'} />
              {k >= 5 ? (
                <text x={x + S / 2} y={y + S / 2 + 4} textAnchor="middle" className="hk-num">{k}</text>
              ) : (
                (dotPos[k] ?? []).map(([dx, dy], j) => (
                  <circle key={j} cx={x + 1 + dx * (S - 2)} cy={y + 1 + dy * (S - 2)} r={k >= 3 ? 2.1 : 2.6} className="hk-dot" />
                ))
              )}
            </g>
          );
        })}
      </svg>
      <figcaption>{art.caption}</figcaption>
    </figure>
  );
}
