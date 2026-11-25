import { chaptersEn } from '../content/en';
import { distEn } from '../content/en/distributions';
import { decisionTreeEn, twinsEn } from '../content/en/exam';
import { choiceLabelsEn, decisionNoteEn, hintEn, mgfRulesEn, referencesEn } from '../content/en/small';
import { deriveEn } from '../content/en/mgfDerive';
import { identifyEn } from '../content/en/mgfIdentify';
import { drillEn } from '../content/en/drill';
import { moreCardsEn } from '../content/en/more';
import { scenariosEn } from '../content/en/chooser';
import { DrillPage } from './DrillPage';
import { ExamNightPage } from './ExamNightPage';
import { MgfPage } from './MgfPage';
import { MorePage } from './MorePage';
import { CardsPage, ChooserPage, RefsPage } from './pages';

// الصفحات العامة في الواجهة الإنجليزية: كل منها يحمل ترجمته هنا، في حزمة لا يحمّلها قارئ العربية.

export const ExamNightPageEn = () => (
  <ExamNightPage
    tr={{ decision: decisionTreeEn, hint: hintEn, note: decisionNoteEn, twins: twinsEn, labels: choiceLabelsEn, chapters: chaptersEn, dist: distEn }}
  />
);
export const MgfPageEn = () => <MgfPage tr={{ rules: mgfRulesEn, derive: deriveEn, identify: identifyEn }} />;
export const DrillPageEn = () => <DrillPage tr={{ drill: drillEn, labels: choiceLabelsEn, hint: hintEn }} />;
export const MorePageEn = ({ focus }: { focus?: string }) => <MorePage focus={focus} tr={moreCardsEn} />;
export const ChooserPageEn = () => <ChooserPage tr={{ scenarios: scenariosEn, labels: choiceLabelsEn }} />;
export const CardsPageEn = () => <CardsPage tr={{ dist: distEn, hint: hintEn }} />;
export const RefsPageEn = () => <RefsPage tr={{ references: referencesEn }} />;
