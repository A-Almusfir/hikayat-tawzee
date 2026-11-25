import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';
import { exponentialChapter } from '../chapters/exponential';

// عدد المكالمات في رسم الحكاية من الأصل نفسه (مولّد بمولّد عشوائي ثابت)
const calls = exponentialChapter.story.art.kind === 'timeline' ? exponentialChapter.story.art.times.length : 0;

const r = String.raw;

export const exponentialEn: Tr<Chapter> = {
  question: 'How long do we wait until the next event happens?',
  story: {
    headline: 'The Copenhagen telephone exchange',
    art: {
      unit: 'min',
      ariaLabel: `${calls} calls on a 5-minute timeline; the gaps between them are different waiting times`,
      caption: 'Calls generated from a model at a rate of 2 calls per minute (not real data). The lines above the axis: the waiting times from one call to the next.',
    },
    claims: [
      { text: 'In 1908 the Danish mathematician Erlang joined the Copenhagen Telephone Company and applied probability to call traffic.' },
      {
        text: 'In his first paper (1909) he showed that the number of calls arriving at random follows a Poisson distribution.',
        links: r`The number of calls in time $t$: Poisson with mean $\theta t$.`,
      },
      {
        text: 'The flip side: how long do we wait until the next call? Its answer follows mathematically from the same Poisson count: the exponential distribution.',
        links: r`$X$ = the waiting time (continuous), and $\theta$ = the rate (the rate $r$ in the Poisson chapter).`,
      },
    ],
    more: [
      { text: "The formulas for lost calls and waiting time came in Erlang's 1917 paper, and telephone companies in many countries adopted them." },
      { text: 'The unit of telecommunications traffic intensity is called the “erlang” today in his honour.' },
    ],
  },
  tryIt: {
    headline: 'How long do we wait between calls?',
    prompt: 'Choose the call rate, then generate waiting times and compare their histogram with the curve.',
    unit: 'min',
    rateUnit: 'calls/min',
  },
  build: {
    headline: 'Waiting is a Poisson count of zero',
    steps: [
      {
        story: 'Waiting longer than $x$ minutes means: not a single call in the interval $[0, x]$. The number of calls in it is Poisson with mean $\\theta x$.',
        predict: {
          prompt: 'What is the probability that no call arrives in $[0, x]$?',
          options: [
            { why: 'For a Poisson with mean $\\theta x$, the probability of zero is $e^{-\\theta x}$.' },
            { why: 'That is the probability that at least 1 call arrives.' },
            { why: 'That is the mean number of calls, not a probability.' },
            { why: 'That is for an interval of length 1 only; here the interval is $x$.' },
          ],
        },
      },
      {
        story: 'The density is the derivative of the cumulative distribution function $F(x) = P(X \\le x) = 1 - e^{-\\theta x}$.',
        predict: {
          prompt: 'What is the derivative of $1 - e^{-\\theta x}$ with respect to $x$?',
          options: [
            { why: 'The derivative of $e^{-\\theta x}$ is $-\\theta e^{-\\theta x}$, and that minus cancels the minus in front.' },
            { why: 'It forgets to multiply by the derivative of the inner exponent, $-\\theta$.' },
            { why: 'It forgets the minus sign in front; and a density is never negative.' },
            { why: 'That is the mean wait, not the density.' },
          ],
        },
      },
    ],
    note: 'The derivation assumes a homogeneous Poisson process: a constant rate. The height of a density is not a probability: when $\\theta > 1$, $f(0) = \\theta$ exceeds 1 without any contradiction. We write the rate as $\\theta$; it is the rate $r$ in the Poisson chapter, so the mean count in time $t$ is $\\lambda = \\theta t$.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: 'Calls reach an exchange at a rate of 2 per minute (a Poisson process). What is the probability that 30 seconds pass without a call?',
        steps: [
          { title: 'Match the units', body: 'The rate is per minute, so we write the time in minutes:' },
          { title: 'Define the variable', body: '$X$ = the wait until the next call in minutes, and $X \\sim \\mathrm{Exp}(2)$.' },
          { title: 'Substitute' },
        ],
        answer: '$P(X > 0.5) \\approx 0.3679$',
      },
      {
        label: 'Course style',
        given: "A customer's service time follows an exponential distribution with a mean of 4 minutes. What is the probability that the service takes between 2 and 6 minutes?",
        steps: [{ title: 'From the mean to the rate' }, { title: 'The probability of an interval = the difference of two tails' }, { title: 'Compute' }],
        answer: '$P(2 < X < 6) \\approx 0.3834$',
      },
    ],
    tricks: [
      'Given the mean? The rate is its reciprocal: $\\theta = 1/E[X]$.',
      '$P(X > t) = e^{-\\theta t}$ directly, and $P(a < X < b) = e^{-\\theta a} - e^{-\\theta b}$.',
      'Match the units: if the rate is per minute, the time is in minutes.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: '$\\theta$ is a rate, and $1/\\theta$ is the mean wait. And the time you have already waited does not change what is left.',
    hookNote: 'At a rate of 2 calls per minute: the mean wait is half a minute.',
    compose: {
      meanings: ['The rate: the height of the density at zero', 'The probability that no event occurs in $[0, x]$'],
    },
    recall: [
      {
        prompt: 'An exponential waiting time has a mean of 10 minutes. What is the rate $\\theta$?',
        options: [
          { text: '$0.1$ per minute', why: '$\\theta = 1/E[X] = 1/10$.' },
          { text: '$10$ per minute', why: 'That is the mean itself; the rate is its reciprocal.' },
          { why: 'That is the square of the mean, which is the variance.' },
          { why: 'That is the reciprocal of the variance, not of the mean.' },
        ],
      },
      {
        prompt: 'You have waited 5 minutes and no call has arrived (a homogeneous Poisson process). How does that affect the rest of the wait?',
        options: [
          { text: 'No effect: the distribution of the remaining wait is the original distribution (memorylessness).', why: '$P(X > s + t \\mid X > s) = e^{-\\theta t} = P(X > t)$.' },
          { text: 'It is now bound to be shorter, because the call is “overdue”.', why: 'That is the gambler’s fallacy in continuous form.' },
          { text: 'It is now bound to be longer.', why: 'The distribution does not change in either direction.' },
          { text: 'The distribution has become uniform.', why: 'It stays exponential with the same rate.' },
        ],
      },
      {
        prompt: 'Which question is answered by the Poisson rather than the exponential?',
        options: [
          { text: 'How many calls arrive in 10 minutes?', why: 'Counting events in an interval: Poisson with mean $10\\theta$.' },
          { text: 'How long do we wait until the next call?', why: 'A continuous waiting time: exponential.' },
          { text: 'What is the probability that we wait more than a minute?', why: 'A question about time: exponential.' },
          { text: 'What is the mean time between two calls?', why: 'The time between two events: exponential, with mean $1/\\theta$.' },
        ],
      },
    ],
    bridge: 'We do not only wait for the next call: how long until the third call? The sum of 3 independent exponential waits: this is the gamma.',
  },
  reference: { labTitle: 'The full lab: rate, time and simulation' },
};
