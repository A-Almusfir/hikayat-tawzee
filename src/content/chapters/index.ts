import type { Chapter } from '../chapterTypes';
import { journey } from '../identity';
import type { DistId } from '../types';
import { bernoulliChapter } from './bernoulli';
import { binomialChapter } from './binomial';
import { chisquareChapter } from './chisquare';
import { exponentialChapter } from './exponential';
import { gammaChapter } from './gamma';
import { geometricChapter } from './geometric';
import { hypergeometricChapter } from './hypergeometric';
import { negbinChapter } from './negbin';
import { normalChapter } from './normal';
import { poissonChapter } from './poisson';
import { tChapter } from './t';
import { uniformChapter } from './uniform';

// سجل الفصول المكتوبة بالتصميم الجديد.
export const chapters: Partial<Record<DistId, Chapter>> = {
  bernoulli: bernoulliChapter,
  binomial: binomialChapter,
  hypergeometric: hypergeometricChapter,
  poisson: poissonChapter,
  exponential: exponentialChapter,
  gamma: gammaChapter,
  geometric: geometricChapter,
  negbin: negbinChapter,
  uniform: uniformChapter,
  normal: normalChapter,
  chisquare: chisquareChapter,
  t: tChapter,
};

export const chapterNumber = (id: DistId) => journey.indexOf(id) + 1;
export const nextInJourney = (id: DistId): DistId | undefined => journey[journey.indexOf(id) + 1];
