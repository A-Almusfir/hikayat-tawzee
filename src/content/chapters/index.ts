import type { Chapter } from '../chapterTypes';
import { journey } from '../identity';
import type { DistId } from '../types';
import { poissonChapter } from './poisson';

// سجل الفصول المكتوبة بالتصميم الجديد. البقية تعرض النسخة السابقة حتى تُكتب.
export const chapters: Partial<Record<DistId, Chapter>> = {
  poisson: poissonChapter,
};

export const chapterNumber = (id: DistId) => journey.indexOf(id) + 1;
export const nextInJourney = (id: DistId): DistId | undefined => journey[journey.indexOf(id) + 1];
