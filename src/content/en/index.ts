import type { Chapter } from '../chapterTypes';
import type { DistId } from '../types';
import type { Tr } from '../../lib/i18n';
import { bernoulliEn } from './bernoulli';
import { binomialEn } from './binomial';
import { hypergeometricEn } from './hypergeometric';
import { poissonEn } from './poisson';
import { exponentialEn } from './exponential';
import { gammaEn } from './gamma';
import { geometricEn } from './geometric';
import { negbinEn } from './negbin';
import { uniformEn } from './uniform';
import { normalEn } from './normal';
import { chisquareEn } from './chisquare';
import { tEn } from './t';

// ترجمات الفصول (نصوص فقط فوق الفصل العربي). كل فصل عربي يجب أن تكون له ترجمة هنا (يفحصه en.test.ts).
export const chaptersEn: Partial<Record<DistId, Tr<Chapter>>> = {
  bernoulli: bernoulliEn,
  binomial: binomialEn,
  hypergeometric: hypergeometricEn,
  poisson: poissonEn,
  exponential: exponentialEn,
  gamma: gammaEn,
  geometric: geometricEn,
  negbin: negbinEn,
  uniform: uniformEn,
  normal: normalEn,
  chisquare: chisquareEn,
  t: tEn,
};
