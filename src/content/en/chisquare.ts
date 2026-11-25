import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

export const chisquareEn: Tr<Chapter> = {
  question: 'Does the model fit the data? And what is the distribution of a sum of squares of independent standard normal variables?',
  story: {
    headline: 'Pearson measures how far a model is from the data',
    art: {
      ariaLabel: '200 squares from the Poisson chapter, each a corps in one year, with dots for its deaths',
      caption: 'The horse-kick data from the Poisson chapter. Here we ask a different question: how far is what happened from what the Poisson expects? And is that distance too large to be chance?',
    },
    claims: [
      {
        text: 'In 1900 Karl Pearson published a measure of how far observed data are from an assumed model, and worked out the distribution of this measure and its table.',
        links: '$\\chi^{2} = \\sum \\frac{(O - E)^{2}}{E}$ over the categories.',
      },
      {
        text: 'But the distribution itself is older: Abbe reached it (1863), and then Helmert (1875–1876), as a sum of squares of normal errors.',
      },
    ],
    more: [
      { text: 'Fisher wrote that the distribution originated with Helmert, and that Pearson rediscovered it in 1900.' },
      { text: "Helmert did not mention Abbe's work in his publications." },
    ],
  },
  tryIt: {
    headline: 'Is the Poisson enough to describe the kicks?',
    prompt: 'Move $\\lambda$ and watch $\\chi^{2}$: when does the distance shrink, and when does it exceed the critical value?',
  },
  build: {
    headline: 'Square the difference, and weight it by the expected count',
    steps: [
      {
        story: 'In each category we compare what happened, $O_i$, with what the model expects, $E_i$. And we square the difference.',
        predict: {
          prompt: 'Why do we square the difference instead of adding up the differences as they are?',
          options: [
            { text: 'Because the differences $O_i - E_i$ always add up to zero: both totals are the number of units.', why: 'An excess in one category is matched by a shortfall in others, so the signs cancel out.' },
            { text: 'Because all the differences are negative.', why: 'Some are positive and some negative.' },
            { text: 'To get the standard deviation.', why: 'We take no square root; the measure is a weighted sum of squares.' },
            { text: 'Because the $O_i$ are whole numbers.', why: 'That has nothing to do with squaring.' },
          ],
        },
      },
      {
        story: 'And we divide by $E_i$: a difference of 5 in a category expecting 100 matters less than a difference of 5 in a category expecting 10. If the model is right, the sum follows a chi-square approximately.',
        predict: {
          prompt: 'There are 3 categories, and we estimated 1 parameter ($\\lambda$) from the data. How many degrees of freedom?',
          options: [
            { why: '$3 - 1 - 1$: one is lost because the total is fixed, and one for the estimated parameter.' },
            { why: 'You forgot to subtract the parameter estimated from the data.' },
            { why: 'The categories are not all free: their total is fixed.' },
            { why: 'There is 1 degree of freedom left.' },
          ],
        },
      },
    ],
    note: 'The approximation needs every expected count $E_i \\ge 5$, roughly, which is why we merged the categories of 2, 3 and 4 deaths. The origin of the distribution: if $Z_1, \\dots, Z_v$ are **independent** standard normals, the sum of their squares is $\\chi^{2}_{v}$, which is the gamma with $\\alpha = \\frac{v}{2}$ and $\\beta = \\frac{1}{2}$. Hence the sampling result: for a sample from a **normal** population, $\\frac{(n-1)S^{2}}{\\sigma^{2}} \\sim \\chi^{2}_{n-1}$.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: 'With $\\lambda = 0.61$ deaths per corps-year, and after merging the categories (0, 1, 2 or more), the observed counts are $109, 65, 26$. Do the data fit a Poisson at the $0.05$ level?',
        steps: [{ title: 'The expected counts', body: '$E = 200\\,P(X = k)$:' }, { title: 'The statistic' }, { title: 'Compare', body: 'The degrees of freedom are $3 - 1 - 1 = 1$, and the critical value is $\\chi^{2}_{1,\\,0.05} = 3.841$.' }],
        answer: '$\\chi^{2} \\approx 0.063 < 3.841$: no evidence against the Poisson. The data are very close to the formula.',
      },
      {
        label: 'Course style',
        given: 'A sample of 10 packages from a normal population has variance $s^{2} = 4.5$. Does this show that the population variance is greater than $\\sigma^{2} = 2$, at the $0.05$ level?',
        steps: [
          { title: 'The statistic', body: 'From the sampling result (the population is normal):' },
          { title: 'The critical value', body: 'The degrees of freedom are $n - 1 = 9$, and the test is right-tailed:' },
        ],
        answer: '$20.25 > 16.919$: we reject $\\sigma^{2} = 2$; the variance is larger.',
      },
    ],
    tricks: [
      'Merge the categories with an expected count below 5 **before** computing.',
      'Degrees of freedom = number of categories − 1 − number of parameters estimated from the data.',
      'The goodness-of-fit test is right-tailed: we reject when $\\chi^{2}$ is large.',
      'The mean is $v$ and the variance $2v$; and $\\chi^{2}_{2}$ is the exponential with rate $\\frac{1}{2}$.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'Square the differences, weight them by the expected counts, and add up.',
    hookNote: 'And it is the gamma with $\\alpha = \\frac{v}{2}$ and $\\beta = \\frac{1}{2}$.',
    compose: {
      meanings: ['The squared difference between observed and expected', 'The expected count in the category: it weights the difference'],
    },
    recall: [
      {
        prompt: '$Z_1, Z_2, Z_3$ are independent standard normals. What is the distribution of $Z_1^{2} + Z_2^{2} + Z_3^{2}$?',
        options: [
          { why: 'The sum of the squares of $v$ independent standard normal variables: $\\chi^{2}_{v}$.' },
          { why: 'That is the distribution of $Z_1 + Z_2 + Z_3$, not of the sum of squares.' },
          { why: 'That is for a single square.' },
          { why: 't is a standard normal divided by the square root of an independent chi-square over its degrees of freedom, not a sum of squares.' },
        ],
      },
      {
        prompt: 'What is the mean of $\\chi^{2}_{8}$?',
        options: [
          { why: 'The mean is $v$.' },
          { why: 'That is the variance, $2v$.' },
          { why: 'That is $\\alpha = \\frac{v}{2}$ in the gamma form.' },
          { why: 'There is no squaring here.' },
        ],
      },
      {
        prompt: 'Why did we merge the categories of 3 and 4 deaths with the category of 2 deaths?',
        options: [
          { text: 'Because their expected counts are below 5, and the chi-square approximation needs large enough expected counts in every category.', why: 'The expected counts are $E_2 = 20.2$, $E_3 = 4.1$ and $E_{\\ge 4} = 0.7$; merged, they total $25.0$.' },
          { text: 'Because their observed counts are small.', why: 'The criterion is the **expected** count $E_i$, not the observed one.' },
          { text: 'Because the Poisson does not allow more than 2 deaths.', why: 'The Poisson accepts any non-negative count.' },
          { text: 'To increase the degrees of freedom.', why: 'Merging **reduces** the categories and the degrees of freedom.' },
        ],
      },
    ],
    bridge: 'Divide a standard normal variable by the root of an independent $\\frac{\\chi^{2}_{v}}{v}$, and you get what a brewery worker needed: the t distribution.',
  },
  trap: 'Forgetting to subtract the estimated parameters from the degrees of freedom, or keeping categories with an expected count below 5.',
  reference: { labTitle: 'The goodness-of-fit experiment' },
};
