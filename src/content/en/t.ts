import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

const r = String.raw;

export const tEn: Tr<Chapter> = {
  question: 'A small sample and an unknown population variance: how do we judge the mean?',
  story: {
    headline: 'A brewery worker writing as “Student”',
    art: {
      ariaLabel: '6 small samples from the same population, with 4 values each; the sample means are scattered around the true mean',
      caption: '6 (hypothetical) samples of 4 values from the same population. The short line is the mean of each sample, and the dashed line the true mean. With samples this small, the mean and the standard deviation change a lot from sample to sample.',
    },
    claims: [
      {
        text: 'Gosset worked at the Guinness brewery in Dublin, and his experiments on barley and yeast had few observations.',
        links: r`$n$ is small, and $\sigma$ is unknown.`,
      },
      {
        text: 'In 1908 he published a paper in the journal Biometrika, “The probable error of a mean”, under a pseudonym: “Student”. It gave the distribution of the mean when the spread is estimated from the same sample.',
        links: r`$\frac{\bar{X} - \mu}{S/\sqrt{n}}$ is not standard normal.`,
      },
    ],
    more: [
      { text: 'Karl Pearson, the editor of Biometrika, helped him with the mathematics of his papers.' },
      { text: 'The t test built on his paper is one of the most widely used statistical tools in practice.' },
    ],
  },
  tryIt: {
    headline: 'What happens when we put S in place of σ?',
    prompt: 'Draw small samples from a normal population, and compute $T$ for each one. How often does $|T|$ exceed $1.96$? Then increase $n$.',
  },
  build: {
    headline: 'Z once we no longer know σ',
    steps: [
      {
        story: 'If we knew $\\sigma$, the calculation would be easy: the mean of a sample from a normal population, minus $\\mu$ and divided by its standard error, is exactly standard normal.',
        predict: {
          prompt: 'Why could Gosset not use $Z$?',
          options: [
            { text: 'Because $\\sigma$ is unknown, and he had to estimate it with $S$ from the same small sample.', why: 'And $S$ from a small sample varies a lot, which adds uncertainty.' },
            { text: 'Because $\\mu$ is known.', why: '$\\mu$ is what we are testing; the problem is $\\sigma$.' },
            { text: 'Because the population is not normal.', why: 'The normality assumption holds; the problem is that $\\sigma$ is unknown.' },
            { text: 'Because $n$ is large.', why: '$n$ is small; if it were large, $S$ would be close to $\\sigma$.' },
          ],
        },
      },
      {
        story: 'We put $S$ in place of $\\sigma$. But $S$ is random: $\\frac{(n-1)S^{2}}{\\sigma^{2}}$ follows $\\chi^{2}_{n-1}$, and it is **independent** of $\\bar{X}$ when the population is normal. So the ratio is a standard normal over the root of a chi-square divided by its degrees of freedom:',
        predict: {
          prompt: 'For a sample of 10 values, how many degrees of freedom does $T$ have?',
          options: [
            { why: '$n - 1$: we lose one because $S$ measures the deviations from the estimated $\\bar{X}$.' },
            { why: 'The degrees of freedom come from $S$, and they are $n - 1$.' },
            { why: 'We estimated only 1 parameter ($\\mu$, through $\\bar{X}$).' },
            { why: 'That is when $\\sigma$ is known, so $T$ becomes $Z$.' },
          ],
        },
      },
    ],
    note: 'The general definition: $T = \\frac{Z}{\\sqrt{V/v}}$ where $Z$ is standard normal and $V \\sim \\chi^{2}_{v}$, and the two are **independent**. In an exam you rarely substitute into the t density; you use the table of critical values. As $v$ grows, t approaches the standard normal, and at $v = 1$ it is the Cauchy distribution, which has no mean. Its square is $T^{2} \\sim F(1, v)$.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'In the spirit of the story',
        given: 'A new type of barley was tried in 10 fields (hypothetical numbers), giving a mean increase in yield of $\\bar{x} = 2.0$ with standard deviation $s = 2.5$. Is the true increase greater than zero, at the $0.05$ level?',
        steps: [
          { title: 'The statistic', body: 'The population is normal and $\\sigma$ is unknown: t with $9$ degrees of freedom.' },
          { title: 'The critical value', body: 'One-tailed (greater than zero):' },
        ],
        answer: '$2.53 > 1.833$: we reject the hypothesis that the increase is zero. Had we wrongly used $Z$, the critical value would have been $1.645$.',
      },
      {
        label: 'Course style',
        given: 'A sample of 16 bottles from a normal population: $\\bar{x} = 498$ ml and $s = 4$ ml. Find a 95% confidence interval for the population mean $\\mu$.',
        steps: [{ title: 'The critical value', body: '$\\sigma$ is unknown, $v = 15$, and the two tails together are $0.05$:' }, { title: 'The interval' }],
        answer: 'The interval is $498 \\pm 2.131$, that is, from $495.869$ to $500.131$ ml.',
      },
    ],
    tricks: [
      '$\\sigma$ known → $Z$. $\\sigma$ unknown and we use $S$ → t with $n - 1$ degrees of freedom (and a normal population).',
      'The table gives $t_{v,\\,\\alpha}$ for the right tail; for a 95% confidence interval or a two-tailed test, take $\\alpha = 0.025$.',
      'As $v$ grows, t approaches $Z$: $t_{9,\\,0.025} = 2.262$ but $z_{0.025} = 1.96$.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: '$\\sigma$ unknown? Put $S$ in its place, and pay the price in heavier tails.',
    hookNote: '$E(T) = 0$ when $v > 1$, and $\\mathrm{Var}(T) = \\frac{v}{v-2}$ when $v > 2$: larger than 1, the variance of the standard normal.',
    compose: {
      meanings: ['How far the sample mean is from the assumed mean', 'The sample standard deviation, in place of the unknown $\\sigma$', 'The sample size'],
    },
    recall: [
      {
        prompt: 'When do we use t instead of $Z$ for a sample mean?',
        options: [
          { text: 'When $\\sigma$ is unknown and we estimate it with $S$, and the population is normal.', why: "That is the condition of Gosset's derivation: a normal population, and $\\bar{X}$ independent of $S$." },
          { text: 'When $\\sigma$ is known.', why: 'With a known $\\sigma$ we use $Z$.' },
          { text: 'When the variable is a count rather than a measurement.', why: 'That decides discrete or continuous, not t or $Z$.' },
          { text: 'When we are testing the variance.', why: 'The variance is tested with the chi-square.' },
        ],
      },
      {
        prompt: 'What is the variance of t with 6 degrees of freedom?',
        options: [
          { why: '$\\frac{v}{v-2} = \\frac{6}{4}$.' },
          { why: 'That is the variance of the standard normal; t is more spread out.' },
          { why: 'That is $v$ itself.' },
          { why: 'That is the mean.' },
        ],
      },
      {
        prompt: 'What happens to the t distribution as the degrees of freedom grow?',
        options: [
          { text: 'It approaches the standard normal.', why: '$S$ approaches $\\sigma$ with large samples.' },
          { text: 'It becomes more spread out.', why: 'The opposite: its variance $\\frac{v}{v-2}$ approaches 1.' },
          { text: 'It becomes skewed to the right.', why: 't is always symmetric about zero.' },
          { text: 'It approaches the chi-square.', why: 'The chi-square is positive and skewed; t is symmetric.' },
        ],
      },
    ],
    bridge: 'You have finished all the stories of the journey. Now tell them apart in mixed problems; and in “Other distributions” there are cards for the Weibull, beta and F.',
  },
  trap: 'Using $Z$ and $1.96$ with a small sample and an unknown $\\sigma$, or taking $n$ degrees of freedom instead of $n - 1$.',
  reference: { labTitle: 'The small-samples experiment' },
};
