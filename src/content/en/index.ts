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

// ترجمات الفصول (نصوص فقط فوق الفصل العربي). أي فصل هنا يجب أن يكون في TRANSLATED_CHAPTERS (lib/lang.ts) والعكس.
export const chaptersEn: Partial<Record<DistId, Tr<Chapter>>> = {
  bernoulli: bernoulliEn,
  binomial: binomialEn,
  hypergeometric: hypergeometricEn,
  poisson: poissonEn,
  exponential: exponentialEn,
  gamma: gammaEn,
  geometric: geometricEn,
  negbin: negbinEn,
};
