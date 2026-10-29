import katex from 'katex';
import { Fragment, useMemo, type ReactNode } from 'react';

const cache = new Map<string, string>();
function render(tex: string, display: boolean) {
  const key = (display ? 'D:' : 'I:') + tex;
  let html = cache.get(key);
  if (!html) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore' });
    cache.set(key, html);
  }
  return html;
}

/** معادلة KaTeX. تُعرض دائمًا باتجاه LTR داخل الواجهة العربية. */
export function Tex({ tex, display = false, className = '' }: { tex: string; display?: boolean; className?: string }) {
  // المعادلات القصيرة داخل السطر لا تنكسر عند «=» (تجميعها في {} يمنع KaTeX من كسرها)
  const src = !display && tex.length <= 40 ? `{${tex}}` : tex;
  const html = useMemo(() => render(src, display), [src, display]);
  if (display) return <div className={`tex-block ${className}`} dir="ltr" dangerouslySetInnerHTML={{ __html: html }} />;
  return <span className={`tex ${className}`} dir="ltr" dangerouslySetInnerHTML={{ __html: html }} />;
}

const TOKEN = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\*\*[\s\S]+?\*\*)/g;

function inline(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('$$')) return <Tex key={i} tex={part.slice(2, -2)} display />;
    if (part.startsWith('$')) return <Tex key={i} tex={part.slice(1, -1)} />;
    if (part.startsWith('**')) return <strong key={i}>{inline(part.slice(2, -2))}</strong>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** نص عربي يحتوي رياضيات بين $...$ أو $$...$$ وتأكيدًا بين **...**. */
export function Rich({ text, as = 'span', className }: { text: string; as?: 'span' | 'p' | 'div' | 'li'; className?: string }) {
  const t = text.trim();
  if (t.startsWith('$$') && t.endsWith('$$') && t.indexOf('$$', 2) === t.length - 2) return <Tex tex={t.slice(2, -2)} display className={className} />;
  const Tag = as;
  return <Tag className={className}>{inline(text)}</Tag>;
}

/** رقم أو تعبير قصير يجب أن يبقى LTR داخل جملة عربية. */
export function Num({ children }: { children: ReactNode }) {
  return <bdi dir="ltr" className="num">{children}</bdi>;
}
