import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

const r = String.raw;

export const poissonEn: Tr<Chapter> = {
  question: 'How many events will happen in a given interval?',
  story: {
    headline: 'Soldiers killed by horse kicks',
    art: {
      ariaLabel: '200 squares, each a corps in one year: 109 with no deaths, 65 with 1 death, 22 with 2, 3 with 3, 1 with 4',
      caption: 'Each square = a corps in one year, and each dot = a death. Sorted by the number of deaths, not by corps and year.',
    },
    claims: [
      {
        text: 'In 1898 the statistician Bortkiewicz published the number of Prussian army soldiers killed by horse kicks, for each corps in each year.',
        links: '$X$: the number of events in an interval (a corps, a year).',
      },
      {
        text: '122 deaths in 200 corps-years, that is $0.61$ on average. Every day, each soldier had a chance that rarely ended in death, but the chances were many.',
        links: '$\\lambda$: the mean count in the interval.',
      },
      {
        text: 'This situation is described by a law that Poisson derived (1837) as a limit of the binomial; de Moivre had reached a form of it earlier (1711).',
        links: 'The formula: the limit of the binomial as $n \\to \\infty$ and $p \\to 0$.',
      },
    ],
    more: [
      { text: 'The full data cover 14 corps over 20 years (1875–1894), that is 280 corps-years. The common table shown here (200) leaves out corps G, I, VI and XI.' },
      { text: 'They were ordinary corps of the Prussian army, not “cavalry corps” as is sometimes written.' },
      { text: 'Because de Moivre reached a form of the result first, this distribution is a standard example of “Stigler’s law”: many discoveries are named after someone other than their first discoverer.' },
    ],
  },
  tryIt: {
    headline: 'Does a single law describe 200 corps-years of accidents?',
    prompt: 'Move $\\lambda$ until the expected bars match what actually happened.',
    param: { label: 'Mean number of deaths per corps-year' },
    xLabel: 'Number of deaths per corps-year',
    unitLabel: 'corps-years',
    reveal:
      'The mean of the data itself is $\\bar{x} = \\tfrac{122}{200} = 0.61$, and its variance is ${\\approx 0.61}$. Their equality is **consistent** with the Poisson, but does not prove it on its own; the stronger evidence is that all the bars match.',
    revealButton: 'Reveal what Bortkiewicz found',
  },
  build: {
    headline: 'The formula is built from the story',
    steps: [
      {
        story: 'Split the corps-year into $n$ small chances, each with probability of death $\\lambda/n$.',
        tex: [r`\text{In this model: } X \sim \mathrm{Bin}\!\left(n,\ \tfrac{\lambda}{n}\right)`],
      },
      {
        story: 'A year with no deaths at all means all $n$ chances passed safely.',
        predict: {
          prompt: 'What does $\\left(1-\\tfrac{\\lambda}{n}\\right)^{n}$ become as the number of chances grows without limit?',
          options: [
            { why: 'A well-known limit. With $\\lambda = 0.61$ it gives $0.543$, and what actually happened was $109/200 = 0.545$.' },
            { why: 'Each factor is less than 1, but it approaches 1 as fast as the number of factors grows, so the product does not collapse to zero.' },
            { why: 'If it were, no deaths would ever occur, yet the data contain 122 deaths.' },
            { why: 'That is only the first-order approximation, and it turns negative when $\\lambda > 1$.' },
          ],
        },
      },
      {
        story: '$k$ deaths: we choose the $k$ chances in which a death occurs (each with probability $\\lambda/n$), **and the remaining $n-k$ chances pass safely.**',
        predict: {
          prompt: 'Why does $k!$ remain in the denominator?',
          options: [
            { text: 'Because the order of the $k$ deaths does not matter; we only count them.', why: '$\\binom{n}{k}$ chooses a set of chances, not an ordering of them. Once $n^k$ cancels (the bracket approaches 1 for fixed $k$), $1/k!$ remains.' },
            { text: 'Because $\\lambda$ is small.', why: 'How small $\\lambda$ is has nothing to do with the denominator; the formula holds for any $\\lambda > 0$.' },
            { text: 'Just to make the number smaller so it does not exceed 1.', why: 'The denominator is not a cosmetic trick; it comes from counting sets instead of orderings.' },
            { text: 'Because $k$ is a whole number.', why: 'That $k$ is a whole number is a condition for $k!$ to exist, not the reason it appears.' },
          ],
        },
      },
    ],
    note: 'The limit is exact, provided its assumptions hold: a constant rate, independence, and no two events at the same instant.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: 'With a mean of $\\lambda = 0.61$ deaths per corps-year, what is the probability that a corps goes a year without any deaths? And how many of the 200 corps-years would we expect to be like that?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the number of deaths in a corps over a year, and $X \\sim \\mathrm{Poisson}(0.61)$.' },
          { title: 'Substitute', body: '“Without any deaths” means $X = 0$:' },
          { title: 'Interpret', body: 'We expect $200 \\times 0.5434 \\approx 108.7$ corps-years, and 109 were actually observed.' },
        ],
        answer: '$P(X = 0) \\approx 0.5434$',
      },
      {
        label: 'Course style',
        given: 'Messages reach a technical-support inbox at a rate of 4 messages per hour (a Poisson process). What is the probability that **at least** 2 messages arrive within **30 minutes**?',
        steps: [
          { title: 'Convert the interval first', body: 'The rate is per hour, and the interval is half an hour:' },
          { title: '“At least” means the complement', body: 'Instead of adding infinitely many terms:' },
          { title: 'Substitute' },
        ],
        answer: '$P(X \\ge 2) \\approx 0.5940$',
      },
    ],
    tricks: [
      'Is the interval different from the unit of the rate? Compute $\\lambda = r\\,t$ before anything else.',
      '“At least” → the complement: $1 - P(0) - P(1) - \\dots$',
      '“None” → directly $P(X = 0) = e^{-\\lambda}$.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'The Poisson counts independent events that occur at a constant rate over an interval. And a single number governs everything:',
    hookNote: 'And in the horse-kick data themselves: the mean is $0.61$ and the variance ${\\approx 0.61}$.',
    compose: {
      meanings: ['The remaining chances pass safely (which is also $P(X=0)$)', 'The mean raised to the power of the number of events', 'The order does not matter'],
    },
    recall: [
      {
        prompt: 'When do you choose the Poisson rather than the binomial?',
        options: [
          { text: 'When we count events in an interval (of time or space) with no set number of trials.', why: 'The Poisson does not need $n$; the mean count in the interval, $\\lambda$, is enough.' },
          { text: 'When the probability of success is $0.5$.', why: 'The value of $p$ does not decide the model; the binomial accepts any $p$.' },
          { text: 'When we ask about the waiting time until the next event.', why: 'That is the question of the exponential distribution, the next chapter.' },
          { text: 'When the number of trials is exactly 10.', why: 'A fixed number of trials is the mark of the binomial, not the Poisson.' },
        ],
      },
      {
        prompt: 'The rate is 2 events per hour. What is $\\lambda$ for an interval of 3 hours?',
        options: [
          { why: '$\\lambda = r\\,t = 2 \\times 3 = 6$.' },
          { why: 'That is the rate for 1 hour; it forgets to multiply by the length of the interval.' },
          { why: 'It divides instead of multiplying.' },
          { why: 'It adds the rate and the time; units cannot be added like that.' },
        ],
      },
      {
        prompt: 'If the mean number of events in the interval is 4, what is the variance?',
        options: [
          { why: 'In the Poisson, the mean = the variance = $\\lambda$.' },
          { why: 'That is the standard deviation $\\sqrt{4}$, not the variance.' },
          { why: 'That is $\\lambda^2$; it has no meaning here.' },
          { why: 'That is $1/\\lambda$, the mean waiting time in the exponential.' },
        ],
      },
    ],
    bridge: 'Change the question: instead of “how many events in the interval?” ask “how long do we wait until the next event?”. This is where the exponential distribution is born.',
  },
  reference: { labTitle: 'The full lab: rate, interval and simulation' },
};
