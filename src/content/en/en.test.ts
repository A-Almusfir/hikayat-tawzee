import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { chapters } from '../chapters';
import type { DistId } from '../types';
import { hasArabic, overlay } from '../../lib/i18n';
import { chaptersEn } from './index';
import { distById } from '../distributions';
import { distEn } from './distributions';
import { sourceById, sources } from '../sources';
import { mgfRules, derive, identify } from '../mgf';
import { drill } from '../drill';
import { moreCards } from '../more';
import { choiceLabels, scenarios } from '../chooser';
import { hint, decisionTree, decisionNote } from '../decision';
import { twins } from '../twins';
import { references } from '../references';
import { mgfRulesEn, choiceLabelsEn, hintEn, decisionNoteEn, referencesEn } from './small';
import { deriveEn } from './mgfDerive';
import { identifyEn } from './mgfIdentify';
import { drillEn } from './drill';
import { moreCardsEn } from './more';
import { scenariosEn } from './chooser';
import { decisionTreeEn, twinsEn } from './exam';

/** كل النصوص في كائن مع مساراتها. */
function strings(x: unknown, path = ''): [string, string][] {
  if (typeof x === 'string') return [[path, x]];
  if (Array.isArray(x)) return x.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (x && typeof x === 'object') return Object.entries(x).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

/** الأعداد في نص (أرقام لاتينية كما يكتبها الموقع في اللغتين). */
const numbers = (s: string) => new Set(s.match(/\d+(?:\.\d+)?/g) ?? []);

const ids = Object.keys(chaptersEn) as DistId[];

/** فحوص مشتركة: لا عربية متبقية، ولا مسارات زائدة، والأرقام نفسها، والرياضيات تُعرض. */
function checkTranslation(name: string, ar: object, tr: unknown, ignore: (path: string) => boolean = () => false) {
  const en = overlay(ar, tr as never);
  const arStr = new Map(strings(ar));
  const enStr = strings(en).filter(([p]) => !ignore(p));
  it(`${name}: لا يبقى نص عربي في النسخة الإنجليزية`, () => {
    const left = enStr.filter(([, s]) => hasArabic(s)).map(([p]) => p);
    expect(left, left.join('\n')).toEqual([]);
  });
  it(`${name}: الترجمة لا تضيف حقولًا ولا عناصر غير موجودة في الأصل`, () => {
    const extra = strings(tr).map(([p]) => p).filter((p) => !arStr.has(p));
    expect(extra, extra.join('\n')).toEqual([]);
  });
  it(`${name}: كل رقم في النص العربي باقٍ في الترجمة، ولا أرقام جديدة إلا الصغيرة`, () => {
    const bad: string[] = [];
    for (const [p, e] of enStr) {
      const a = arStr.get(p);
      if (a === undefined || a === e) continue;
      const na = numbers(a), ne = numbers(e);
      for (const n of na) if (!ne.has(n)) bad.push(`${p}: ناقص ${n}`);
      for (const n of ne) if (!na.has(n) && !(Number.isInteger(+n) && +n <= 10)) bad.push(`${p}: زائد ${n}`);
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });
  it(`${name}: لا نجمة مفردة (Rich يدعم **عريض** فقط، فالمفردة تظهر حرفيًا)`, () => {
    const bad = enStr.filter(([, s]) => /(^|[^*])\*(?!\*)/.test(s.replace(/\$[^$]*\$/g, '').replace(/\*\*/g, ''))).map(([p]) => p);
    expect(bad, bad.join('\n')).toEqual([]);
  });
  it(`${name}: رياضيات النصوص الإنجليزية تُعرض في KaTeX`, () => {
    const tex = enStr.flatMap(([, s]) => [...s.matchAll(/\$([^$]+?)\$/g)].map((m) => m[1]));
    for (const t of tex) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });
}

describe('الترجمة الإنجليزية للفصول', () => {
  it('كل فصل عربي له ترجمة', () => {
    expect(Object.keys(chapters).sort()).toEqual([...ids].sort());
  });

  for (const id of ids) checkTranslation(id, chapters[id]!, chaptersEn[id]);

  // محتوى «المرجع»: الاسم العربي يبقى (يُعرض بجانب الإنجليزي عمدًا)
  for (const id of ids) {
    const d = distById[id];
    if (d) checkTranslation(`${id} (المرجع)`, d, distEn[id], (p) => p === 'nameAr');
  }
  it('مصادر الفصول المترجمة: إشارة إنجليزية لكل إشارة فيها عربية', () => {
    for (const id of ids) {
      const ch = chapters[id]!;
      for (const c of [...ch.story.claims, ...ch.story.more])
        for (const s of c.src) {
          const src = sourceById[s];
          const shown = src.citeEn ?? src.cite;
          expect(hasArabic(shown), `${id}: ${s}`).toBe(false);
        }
    }
  });

  it('لكل فصل مترجم له «مرجع» قديم ترجمةُ مرجعه', () => {
    for (const id of ids) if (distById[id]) expect(distEn[id], id).toBeDefined();
  });

  // الصفحات العامة: كل مجموعة محتوى لها ترجمة كاملة
  const pages: [string, object, unknown][] = [
    ['قواعد الدالة المولدة', mgfRules, mgfRulesEn],
    ['اشتق', derive, deriveEn],
    ['تعرّف', identify, identifyEn],
    ['التدريب المختلط', drill, drillEn],
    ['توزيعات أخرى', moreCards, moreCardsEn],
    ['أسماء الخيارات', choiceLabels, choiceLabelsEn],
    ['أي توزيع أختار؟', scenarios, scenariosEn],
    ['تلميحات المخطط', hint, hintEn],
    ['مخطط القرار', decisionTree, decisionTreeEn],
    ['التوائم', twins, twinsEn],
    ['المراجع', references, referencesEn],
  ];
  for (const [name, ar, en] of pages) checkTranslation(name, ar, en);

  it('تعليقات منحنيات «توزيعات أخرى» بالإنجليزية في كل قيم المنزلقات', () => {
    for (const c of moreCards) {
      const grid = c.sliders.reduce<Record<string, number>[]>((acc, sl) => {
        const vals: number[] = [];
        for (let v = sl.min; v <= sl.max + 1e-9; v += sl.step) vals.push(+v.toFixed(6));
        return acc.flatMap((o) => vals.map((v) => ({ ...o, [sl.key]: v })));
      }, [{}]);
      for (const sv of grid) {
        const t = c.captionEn(c.toParams(sv));
        expect(hasArabic(t), `${c.id}: ${t}`).toBe(false);
        for (const m of t.matchAll(/\$([^$]+?)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true, strict: 'ignore' }), m[1]).not.toThrow();
      }
    }
  });

  it('ملاحظة المخطط مترجمة', () => {
    expect(hasArabic(decisionNoteEn)).toBe(false);
    expect(hasArabic(decisionNote)).toBe(true);
  });

  it('كل المصادر لها إشارة بلا عربية في الواجهة الإنجليزية (صفحة المراجع تعرضها كلها)', () => {
    const bad = sources.filter((s) => hasArabic(s.citeEn ?? s.cite)).map((s) => s.id);
    expect(bad).toEqual([]);
  });
});
