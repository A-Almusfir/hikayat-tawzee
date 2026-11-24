import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

const r = String.raw;

export const hypergeometricEn: Tr<Chapter> = {
  question: 'We draw without replacement from a finite group: how many “successes” are in what we drew?',
  story: {
    headline: 'A lady tasting tea',
    art: {
      ariaLabel: 'Eight cups of tea in a mixed order: four with the milk poured first (letter M) and four with the tea poured first (letter T)',
      caption: 'Eight cups: “M” had the milk poured first, and “T” the tea first. The lady knows there are four of each kind, but not which ones.',
    },
    claims: [
      {
        text: 'In his book The Design of Experiments (1935), Fisher told of a lady who said she could tell by taste whether the milk or the tea had been poured first.',
        links: r`The population: $N = 8$ cups, of which $k = 4$ are “milk first”.`,
      },
      {
        text: 'She was given the eight cups in a random order and had to pick the four in which the milk had been poured first.',
        links: r`$n = 4$ picks without replacement, and $X$ = the number she got right.`,
      },
      {
        text: 'If she were guessing, every choice of 4 cups out of 8 would be equally likely: 70 choices, and only 1 of them entirely right.',
        links: r`$P(X = 4) = \frac{1}{70}$: we count groups, not draws.`,
      },
    ],
    more: [
      { text: 'The lady is said to have been the algae scientist Muriel Bristol, and it was William Roach, who later married her, who suggested testing her.' },
      { text: 'Fisher did not report the outcome of the experiment in his book, and the accounts of it came later and conflict with one another.' },
      { text: "The test Fisher built on this calculation is known today as Fisher's exact test, and its probabilities come from the hypergeometric distribution." },
    ],
  },
  tryIt: {
    headline: 'If she were guessing, what would we expect?',
    prompt: 'Guess many times and compare with the bars. Then increase the number of cups while keeping $k$ small, and compare with the binomial.',
  },
  build: {
    headline: 'Count groups: the ones you want ÷ all of them',
    steps: [
      {
        story: 'If she is guessing, every group of 4 cups has the same probability. The order within a group does not matter, so we count groups.',
        tex: [r`\binom{8}{4} = \frac{8!}{4!\,4!} = 70`, r`\text{all groups} = \binom{N}{n}`],
        predict: {
          prompt: 'How many ways are there to choose 4 cups out of 8?',
          options: [
            { why: '$\\binom{8}{4} = \\frac{8 \\times 7 \\times 6 \\times 5}{4!} = 70$.' },
            { why: 'That is $8 \\times 7 \\times 6 \\times 5$: the number of **orderings**. Each group is counted $4! = 24$ times here.' },
            { why: 'That is $2^{4}$, as if each cup were independent of the others; but she picks exactly 4.' },
            { why: 'It is not $8 \\times 4$; we need the number of different groups.' },
          ],
        },
      },
      {
        story: 'The groups with $x$ correct picks: take $x$ of the 4 “milk first” cups, and the remaining $4 - x$ from the other 4 cups. The two choices are made separately, so by the multiplication principle we multiply.',
        predict: {
          prompt: 'How many groups have exactly 3 correct picks?',
          options: [
            { why: '$\\binom{4}{3} = 4$ ways to choose the 3 correct cups, and $\\binom{4}{1} = 4$ to choose the wrong one.' },
            { why: 'You forgot that the 4th, wrong cup can also be chosen in 4 ways.' },
            { why: 'That is $\\binom{8}{3}$: choosing 3 of all the cups, without requiring them to be correct.' },
            { why: 'That is $4 \\times 3$; the right count is $\\binom{4}{3} \\times \\binom{4}{1}$.' },
          ],
        },
      },
    ],
    note: 'Drawing without replacement makes the draws dependent; but every group of $n$ items is equally likely, so we count groups instead of multiplying probabilities. When $N$ is very large compared with $n$, drawing barely changes the makeup, and the formula approaches the binomial with $p = \\frac{k}{N}$.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: 'If the lady were guessing, what is the probability that she gets **at least** 3 of the 4 cups right?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the number of correct picks, with $N = 8$, $k = 4$, $n = 4$, drawn without replacement: hypergeometric.' },
          { title: '“At least 3” = 3 or 4' },
          { title: 'Compute' },
        ],
        answer: "$P(X \\ge 3) \\approx 0.2429$: about once in every 4 tries by guessing alone. That is why 3 correct cups would not have convinced Fisher.",
      },
      {
        label: 'Course style',
        given: 'A department has 12 employees, 5 of them women. A committee of 4 employees is chosen at random. What is the probability that it includes exactly 2 women? And what is the mean number of women on the committee?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the number of women on the committee. Choosing without replacement from a small population: $N = 12$, $k = 5$, $n = 4$.' },
          { title: 'Substitute' },
          { title: 'The mean' },
        ],
        answer: '$P(X = 2) \\approx 0.4242$, and the mean number of women is about $1.67$.',
      },
    ],
    tricks: [
      'Check before computing: the top numbers in the numerator add up to $N$, and the bottom ones to $n$.',
      'With replacement → binomial. Without replacement from a small group → hypergeometric.',
      'The mean $n\\frac{k}{N}$ is the binomial mean with $p = \\frac{k}{N}$, and the variance is smaller by the factor $\\frac{N-n}{N-1}$.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'Choose from the successes, choose from the failures, and divide by all the possible choices.',
    hookNote: 'In the tea experiment: the mean number of correct picks by guessing is $4 \\times \\frac{4}{8} = 2$.',
    compose: {
      meanings: ['The ways to choose $x$ of the $k$ successes', 'The ways to choose the rest from the non-successes', 'All the ways to choose $n$ of $N$'],
    },
    recall: [
      {
        prompt: 'When do we use the hypergeometric instead of the binomial?',
        options: [
          { text: 'When we draw **without replacement** from a finite population, so the probability changes after each draw.', why: 'The binomial needs independent trials with a constant probability, and drawing without replacement breaks both conditions.' },
          { text: 'When the probability of success is small.', why: 'That calls for the Poisson approximation, not the hypergeometric.' },
          { text: 'When we repeat until the first success.', why: 'That is the geometric.' },
          { text: 'When $n$ is larger than 30.', why: 'The sample size alone does not decide; what matters is whether we draw with or without replacement.' },
        ],
      },
      {
        prompt: 'A box holds 10 cards, 4 of them red. We draw 3 without replacement. What is the mean number of red cards, $E(X)$?',
        options: [
          { why: '$n\\frac{k}{N} = 3 \\times \\frac{4}{10} = 1.2$.' },
          { why: 'That is $\\frac{k}{N}$ for a single draw.' },
          { why: 'That is the binomial variance $3 \\times 0.4 \\times 0.6$, not the mean.' },
          { why: 'That is the number of red cards in the whole box.' },
        ],
      },
      {
        prompt: 'Why is the hypergeometric variance smaller than the variance of a binomial with the same mean?',
        options: [
          { text: 'Because each draw without replacement reveals something about what is left, so the factor $\\frac{N-n}{N-1}$ is at most 1, and equals 1 only when $n = 1$.', why: 'If we drew the whole population ($n = N$), we would know $X$ for certain, and the factor becomes zero.' },
          { text: 'Because its probability of success is larger.', why: 'The mean is the same, $n\\frac{k}{N}$.' },
          { text: 'Because $X$ cannot exceed $n$.', why: 'The binomial cannot exceed $n$ either.' },
          { text: 'Because it is a continuous distribution.', why: 'The hypergeometric is discrete.' },
        ],
      },
    ],
    bridge: 'Back to the binomial: increase the number of trials and shrink the probability of the event, while the mean number of successes $np$ stays roughly fixed: this is where the Poisson is born.',
  },
  trap: 'Using the binomial $\\binom{n}{x}p^{x}q^{n-x}$ when drawing without replacement from a small population, or forgetting that the smallest possible value can be greater than zero.',
  reference: { labTitle: 'The cups experiment' },
};
