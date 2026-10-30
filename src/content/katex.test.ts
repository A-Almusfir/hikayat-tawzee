import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { chapters } from './chapters';
import { decisionTree, hint } from './decision';
import { distributions } from './distributions';
import { drill } from './drill';
import { edges } from './family';
import { scenarios } from './chooser';
import { twins } from './twins';

// كل رياضيات المحتوى تُعرض دون خطأ، بما فيها التغليف بـ {} للمعادلات القصيرة داخل السطر.
const RAW = new Set(['tex', 'fnTex', 'support', 'mean', 'variance', 'notation', 'annotated', 'hookTex', 'range', 'symbol', 'template']);
const RAW_ARRAYS = new Set(['tex', 'slots', 'tiles', 'substitute']);

function collect(v: unknown, key = '', out: string[] = []): string[] {
  if (typeof v === 'string') {
    if (RAW.has(key)) out.push(v.replace(/@\d/g, 'x'));
    else for (const m of v.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g)) out.push((m[1] ?? m[2]).trim());
  } else if (Array.isArray(v)) {
    v.forEach((x) => (typeof x === 'string' && RAW_ARRAYS.has(key) ? out.push(x) : collect(x, key, out)));
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) if (typeof x !== 'function') collect(x, k, out);
  }
  return out;
}

describe('KaTeX', () => {
  const all = collect([Object.values(chapters), distributions, drill, edges, scenarios, twins, decisionTree, hint]);
  it('عدد معقول من المعادلات جُمع', () => expect(all.length).toBeGreaterThan(400));
  it('كل معادلة تُعرض دون خطأ (مباشرة وداخل {})', () => {
    for (const t of all) {
      expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
      if (t.length <= 40) expect(() => katex.renderToString(`{${t}}`, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
    }
  });
});
