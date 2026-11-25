import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

const r = String.raw;

export const geometricEn: Tr<Chapter> = {
  question: 'How many trials do we need until the event happens for the first time?',
  story: {
    headline: 'Black 26 times in Monte Carlo',
    art: {
      ariaLabel: '26 black spins in a row, then a question mark for the next spin',
      caption: '26 spins in a row with no red. The question mark: the next spin, where the probability of red is 18 in 37, as on any spin.',
    },
    claims: [
      {
        text: 'On 18 August 1913, the roulette ball at the Monte Carlo Casino landed on black 26 times in a row.',
        links: r`$X$ = the number of spins until the first red: $1, 2, 3, \dots$`,
      },
      {
        text: 'Players thought red was “due”, so they bet on it heavily, and they are said to have lost huge sums.',
        links: r`The probability of red is the same on every spin: $p = \tfrac{18}{37}$.`,
      },
      {
        text: 'But the spins are independent, and the wheel has no memory. This “memorylessness” is the heart of the geometric distribution, which is not credited to any single discoverer.',
        links: 'The name comes from the geometric sequence: $p, \\; p(1-p), \\; p(1-p)^2, \\dots$',
      },
    ],
    more: [
      { text: 'The incident gave its name to the “gambler’s fallacy”, or “Monte Carlo fallacy”: the belief that an independent event is “due” because it has not happened for a while.' },
      { text: 'Another common convention counts the failures before the first success, $Y = X - 1$, with mean $(1-p)/p$. On this site we count the trials, including the successful one.' },
    ],
  },
  tryIt: {
    headline: 'Is red “due”?',
    prompt: 'Move the number of spins that have already passed without red, and watch the distribution of what is left until the first red.',
    failLabel: 'not red',
    successLabel: 'red',
  },
  build: {
    headline: 'Failures in a row, then one success',
    steps: [
      {
        story: 'The first red on spin $k$ means that none of the first $k-1$ spins is red, and each of them misses red with probability $1 - p = \\tfrac{19}{37}$.',
        predict: {
          prompt: 'What is the probability that $k-1$ independent spins pass with no red?',
          options: [
            { why: 'By independence we multiply $k-1$ factors of $1-p$.' },
            { why: 'Independent probabilities are multiplied, not added.' },
            { why: 'That is the probability that the spins are not all red, which is a different event.' },
            { why: 'That is $k$ failures, but spin $k$ itself is the success.' },
          ],
        },
      },
      {
        story: 'Then spin $k$ itself is red, with probability $p$.',
        predict: {
          prompt: 'Why do we not multiply by a number of orderings, as in the binomial?',
          options: [
            { text: 'Because there is only one ordering: all the failures first, then the success.', why: 'If red came before spin $k$, $X$ would be smaller than $k$.' },
            { text: 'Because $p$ is small.', why: 'The formula holds for any $p$; the reason is that the order is fixed.' },
            { text: 'Because the spins are not independent.', why: 'They are independent, which is why we multiply the probabilities.' },
            { text: 'Because $k$ has no upper limit.', why: 'Having no upper limit does not remove orderings; the ordering itself is unique.' },
          ],
        },
      },
    ],
    note: 'Each extra spin multiplies the probability by $1-p$: a geometric sequence, hence the name. And the wheel has no memory: $P(X > s + t \\mid X > s) = P(X > t)$.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: 'On a European wheel ($p = \\tfrac{18}{37}$ for red), what is the probability that red does not appear in the first 10 spins?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the spin on which red first appears, and $X \\sim \\mathrm{Geom}(\\tfrac{18}{37})$.' },
          { title: '“No red in 10 spins” means $X > 10$' },
          { title: 'Compute and interpret', body: 'Rare, but it does not make red “due” on the eleventh spin: its probability there is still $\\tfrac{18}{37}$.' },
        ],
        answer: '$P(X > 10) \\approx 0.0013$',
      },
      {
        label: 'Course style',
        given: 'A login attempt succeeds with probability $0.3$, and attempts are independent. What is the probability of needing **exactly 3 attempts**? And what is the mean number of attempts?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the number of attempts until the first success (including the successful one), and $X \\sim \\mathrm{Geom}(0.3)$.' },
          { title: 'Substitute', body: 'Two failures, then a success:' },
          { title: 'The mean' },
        ],
        answer: '$P(X = 3) = 0.147$, and the mean is $\\approx 3.33$ attempts.',
      },
    ],
    tricks: [
      '“More than $k$ trials” → directly $P(X > k) = (1-p)^{k}$.',
      'Memorylessness: $P(X > s + t \\mid X > s) = P(X > t)$.',
      'Check what $X$ counts: the trials (mean $1/p$) or the failures (mean $(1-p)/p$)?',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'Your chance is $\\tfrac16$? You need 6 trials on average. And the wheel has no memory.',
    hookNote: 'With $p = \\tfrac{18}{37}$: the first red appears after about 2 spins on average ($\\tfrac{37}{18} \\approx 2.06$).',
    compose: {
      meanings: ['The $k-1$ failures before the success', 'The success on trial $k$ itself'],
    },
    recall: [
      {
        prompt: 'After 25 spins in a row with no red, what is the probability of red on the next spin?',
        options: [
          { text: '$\\tfrac{18}{37} \\approx 0.49$, as on any other spin.', why: 'The spins are independent, so the past does not change the next spin.' },
          { text: 'More than $0.9$, because it is “overdue”.', why: 'That is the gambler’s fallacy itself.' },
          { text: 'Less than $0.1$, because black is “hot”.', why: 'The opposite fallacy; the wheel has no memory either way.' },
          { text: 'Exactly $\\tfrac12$.', why: 'A European wheel has a green zero, so the probability of red is $\\tfrac{18}{37}$.' },
        ],
      },
      {
        prompt: 'If $p = 0.25$, what is the mean number of trials until the first success?',
        options: [
          { why: '$E[X] = 1/p = 4$.' },
          { why: 'That is the mean number of failures before the success, the other convention.' },
          { why: 'That is the probability of success in a single trial.' },
          { why: 'That is the variance, $(1-p)/p^2$.' },
        ],
      },
      {
        prompt: 'If $p = 0.5$, what is the probability that we need **more than 3** trials?',
        options: [
          { why: '$P(X > 3) = (1-p)^3 = 0.5^3$: the first 3 trials are all failures.' },
          { why: 'That is $0.5^4$; “more than 3” only means the first 3 fail.' },
          { why: 'That is $P(X \\le 3)$, the complement.' },
          { why: 'That is the probability for a single trial.' },
        ],
      },
    ],
    bridge: 'We waited for the first success. What if we needed 3 successes, like a player who needs 3 points to win the bet? This is the negative binomial.',
  },
  reference: { labTitle: 'The full lab: p and simulation' },
};
