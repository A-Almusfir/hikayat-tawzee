import { identity, type Shape } from '../content/identity';
import type { DistId } from '../content/types';

// رمز شكلي لكل توزيع. يُرسم بلون التوزيع، ويبقى مميزًا بالشكل وحده دون لون.
function paths(shape: Shape) {
  switch (shape) {
    case 'coin':
      return (
        <>
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" />
          <path d="M12 3 A9 9 0 0 0 12 21 Z" stroke="none" />
        </>
      );
    case 'triangle':
      return (
        <>
          {[[12, 5], [8, 11], [16, 11], [4, 17], [12, 17], [20, 17]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" stroke="none" />
          ))}
        </>
      );
    case 'steps':
      return (
        <>
          <path d="M3 20 H8 V15 H13 V10 H18" fill="none" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M19.5 3.5 l1.1 2.4 2.4.3-1.8 1.7.5 2.5-2.2-1.2-2.2 1.2.5-2.5-1.8-1.7 2.4-.3z" stroke="none" />
        </>
      );
    case 'dots':
      return (
        <>
          {[[5, 7], [13, 4], [19, 10], [9, 14], [16, 19], [4, 19]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" stroke="none" />
          ))}
        </>
      );
    case 'decay':
      return <path d="M3 4 C 6 15, 11 19, 21 20" fill="none" strokeWidth="2.4" strokeLinecap="round" />;
    case 'bell':
      return <path d="M2 20 C 7 20, 8 4, 12 4 C 16 4, 17 20, 22 20" fill="none" strokeWidth="2.4" strokeLinecap="round" />;
  }
}

/** مسارات الرمز فقط، لرسمها داخل SVG آخر. */
export function GlyphPaths({ id }: { id: DistId }) {
  return paths(identity[id].shape);
}

export function Glyph({ id, size = 24, color, title }: { id: DistId; size?: number; color?: string; title?: string }) {
  const c = color ?? identity[id].color;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={c} stroke={c} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} className="glyph">
      {paths(identity[id].shape)}
    </svg>
  );
}
