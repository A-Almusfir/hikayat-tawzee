import { lazy } from 'react';

// الصفحات العامة في الواجهة الإنجليزية: كل صفحة تحمّل ترجمتها وحدها عند فتحها،
// فلا يحمّل قارئ العربية شيئًا منها، ولا تحمّل صفحة إنجليزية ترجمات الصفحات الأخرى.

export const ExamNightPageEn = lazy(async () => {
  const [{ ExamNightPage }, { chaptersEn }, { distEn }, exam, small] = await Promise.all([
    import('./ExamNightPage'),
    import('../content/en'),
    import('../content/en/distributions'),
    import('../content/en/exam'),
    import('../content/en/small'),
  ]);
  const tr = { decision: exam.decisionTreeEn, hint: small.hintEn, note: small.decisionNoteEn, twins: exam.twinsEn, labels: small.choiceLabelsEn, chapters: chaptersEn, dist: distEn };
  return { default: () => <ExamNightPage tr={tr} /> };
});

export const MgfPageEn = lazy(async () => {
  const [{ MgfPage }, { mgfRulesEn }, { deriveEn }, { identifyEn }] = await Promise.all([
    import('./MgfPage'),
    import('../content/en/small'),
    import('../content/en/mgfDerive'),
    import('../content/en/mgfIdentify'),
  ]);
  const tr = { rules: mgfRulesEn, derive: deriveEn, identify: identifyEn };
  return { default: () => <MgfPage tr={tr} /> };
});

export const DrillPageEn = lazy(async () => {
  const [{ DrillPage }, { drillEn }, { choiceLabelsEn, hintEn }] = await Promise.all([
    import('./DrillPage'),
    import('../content/en/drill'),
    import('../content/en/small'),
  ]);
  const tr = { drill: drillEn, labels: choiceLabelsEn, hint: hintEn };
  return { default: () => <DrillPage tr={tr} /> };
});

export const MorePageEn = lazy(async () => {
  const [{ MorePage }, { moreCardsEn }] = await Promise.all([import('./MorePage'), import('../content/en/more')]);
  return { default: ({ focus }: { focus?: string }) => <MorePage focus={focus} tr={moreCardsEn} /> };
});

export const ChooserPageEn = lazy(async () => {
  const [{ ChooserPage }, { scenariosEn }, { choiceLabelsEn }] = await Promise.all([
    import('./pages'),
    import('../content/en/chooser'),
    import('../content/en/small'),
  ]);
  const tr = { scenarios: scenariosEn, labels: choiceLabelsEn };
  return { default: () => <ChooserPage tr={tr} /> };
});

export const CardsPageEn = lazy(async () => {
  const [{ CardsPage }, { distEn }, { hintEn }] = await Promise.all([
    import('./pages'),
    import('../content/en/distributions'),
    import('../content/en/small'),
  ]);
  const tr = { dist: distEn, hint: hintEn };
  return { default: () => <CardsPage tr={tr} /> };
});

export const RefsPageEn = lazy(async () => {
  const [{ RefsPage }, { referencesEn }] = await Promise.all([import('./pages'), import('../content/en/small')]);
  const tr = { references: referencesEn };
  return { default: () => <RefsPage tr={tr} /> };
});
