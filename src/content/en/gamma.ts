import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';
import { gammaChapter } from '../chapters/gamma';

const r = String.raw;

// عدد المكالمات في رسم الحكاية من الأصل نفسه (مولّد بمولّد عشوائي ثابت)
const calls = gammaChapter.story.art.kind === 'timeline' ? gammaChapter.story.art.times.length : 0;

export const gammaEn: Tr<Chapter> = {
  question: 'How long do we wait until event number α happens?',
  story: {
    headline: 'Erlang splits the wait into stages',
    art: {
      unit: 'min',
      ariaLabel: `${calls} calls on a 3-minute timeline; the wait until the 3rd call is the sum of the first 3 gaps`,
      caption: 'Calls generated from a model at a rate of 2 calls per minute (not real data). The wait until the 3rd call is the sum of the first 3 gaps.',
    },
    claims: [
      {
        text: 'Erlang showed (1909) that calls arrive according to a Poisson process, so the waits between them are exponential.',
        links: r`Each gap between two calls: exponential with rate $\beta$ (the $\theta$ of the exponential).`,
      },
      {
        text: 'When the exponential did not fit call durations, Erlang split a call into successive stages, each with an independent exponential duration.',
        links: r`The same logic: the wait until call number $\alpha$ is the sum of $\alpha$ exponential gaps.`,
      },
      {
        text: 'The sum of independent, identically distributed exponential times is called the Erlang distribution today; it is the gamma when the number of stages is a whole number.',
        links: r`$X$ = the wait until event number $\alpha$.`,
      },
    ],
    more: [
      { text: 'His approach is known today as the method of “phases” (stages), and Erlang models are still a foundation of queueing theory and call-centre planning.' },
      { text: "Erlang's story concerns a whole-number $\\alpha$. The general gamma allows any $\\alpha > 0$, with the gamma function $\\Gamma(\\alpha)$ taking the place of the factorial." },
    ],
  },
  tryIt: {
    headline: 'Wait for the third event',
    prompt: 'Each wait here is the sum of $\\alpha$ exponential times. Generate many of them and compare the histogram with the curve, then increase $\\alpha$ and watch the shape.',
  },
  build: {
    headline: 'A long wait = few events',
    steps: [
      {
        story: 'Waiting longer than $x$ for event number $\\alpha$ means: **fewer than** $\\alpha$ events happened in $[0, x]$. The number of events in that interval is Poisson with mean $\\beta x$.',
        predict: {
          prompt: 'Why “fewer than $\\alpha$” events, and not “zero” as in the exponential?',
          options: [
            { text: 'Because we are waiting for event number $\\alpha$: as long as fewer events than that have happened, the wait goes on.', why: 'In the exponential ($\\alpha = 1$), “fewer than 1” means zero, so it is the same case.' },
            { text: 'Because the events in the gamma are not independent.', why: 'It is the same Poisson process, with independent events.' },
            { text: 'Because the rate changes over time.', why: 'The rate $\\beta$ is constant.' },
            { text: 'Because exactly $\\alpha$ events must happen in $[0, x]$.', why: 'That is the probability of a single value; a wait longer than $x$ covers every count from 0 to $\\alpha - 1$.' },
          ],
        },
      },
      {
        story: 'The density is the derivative of $F(x) = 1 - P(X > x)$. When we differentiate, the terms of the sum cancel one another and only one term remains:',
        predict: {
          prompt: 'At $\\alpha = 1$, what does the formula become?',
          options: [
            { text: '$\\beta e^{-\\beta x}$: the exponential.', why: '$\\beta^{1}$, $\\Gamma(1) = 0! = 1$, and $x^{0} = 1$.' },
            { why: 'That is $P(X > x)$ for the exponential, not the density.' },
            { why: 'That is the case $\\alpha = 2$.' },
            { why: 'That is the scale form of the exponential; here $\\beta$ is a rate.' },
          ],
        },
      },
    ],
    note: 'The derivation here is for a whole-number $\\alpha$. The same formula works for any $\\alpha > 0$ once $\\Gamma(\\alpha) = \\int_0^\\infty t^{\\alpha-1}e^{-t}\\,dt$ replaces $(\\alpha-1)!$. Special cases include the exponential ($\\alpha = 1$) and the chi-square ($\\alpha = \\frac{v}{2}$, $\\beta = \\frac{1}{2}$).',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: 'Calls reach an exchange at a rate of 2 calls per minute (a Poisson process). What is the probability that the **third call** arrives after more than 2 minutes?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the wait until the third call: gamma with $\\alpha = 3$ and $\\beta = 2$.' },
          { title: 'Turn it into a Poisson question', body: 'The third call comes after 2 minutes ⇔ at most 2 calls in the first 2 minutes, a Poisson count with mean $\\beta x = 4$:' },
          { title: 'Compute' },
        ],
        answer: '$P(X > 2) \\approx 0.2381$',
      },
      {
        label: 'Course style',
        given: 'The time to repair a machine (in hours) follows a gamma distribution with $\\alpha = 3$ and $\\beta = 0.5$. Find the mean and variance, and the probability that the repair is finished within 4 hours.',
        steps: [
          { title: 'The mean and variance' },
          { title: 'Turn it into a Poisson question', body: '$\\alpha$ is a whole number, so finishing within 4 hours ⇔ at least 3 “stages” in 4 hours, with mean $\\beta x = 2$:' },
          { title: 'Compute' },
        ],
        answer: 'The mean is 6 hours, the variance 12, and $P(X \\le 4) \\approx 0.3233$.',
      },
    ],
    tricks: [
      'Whole-number $\\alpha$? Turn the gamma question into a Poisson one: $P(X > x) = P(N(x) \\le \\alpha - 1)$ with mean $\\beta x$.',
      'Here $\\beta$ is a **rate**: the mean is $\\frac{\\alpha}{\\beta}$. If you are given the mean time between events, the rate is its reciprocal.',
      '$\\Gamma(n) = (n-1)!$, $\\Gamma(\\frac{1}{2}) = \\sqrt{\\pi}$, and $\\Gamma(\\alpha + 1) = \\alpha\\,\\Gamma(\\alpha)$.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'Gamma = waiting for $\\alpha$ events = the sum of $\\alpha$ independent exponential waits.',
    hookNote: 'With $\\alpha = 1$ the exponential returns: $\\frac{1}{\\beta}$ and $\\frac{1}{\\beta^{2}}$.',
    compose: {
      meanings: ['The rate raised to the number of stages', 'The gamma function: $(\\alpha - 1)!$ for a whole number', 'The effect of the $\\alpha - 1$ events before the last', 'The probability that no others occur: exponential decay'],
    },
    recall: [
      {
        prompt: '$X$ is the sum of 4 independent exponential waiting times, each with rate $\\theta = 2$. What is the distribution of $X$?',
        options: [
          { text: 'Gamma with $\\alpha = 4$ and $\\beta = 2$.', why: 'The number of waits is $\\alpha$, and the common rate is $\\beta$.' },
          { text: 'Exponential with rate $8$.', why: 'A sum of exponential times is not exponential; its mean grows, it does not shrink.' },
          { text: 'Exponential with rate $2$.', why: 'That is a single wait only.' },
          { text: 'Gamma with $\\alpha = 2$ and $\\beta = 4$.', why: 'The two parameters are swapped.' },
        ],
      },
      {
        prompt: 'If $X$ is gamma with $\\alpha = 5$ and $\\beta = 2$, what is the mean?',
        options: [
          { why: '$\\frac{\\alpha}{\\beta} = \\frac{5}{2}$.' },
          { why: 'That is $\\alpha\\beta$: the scale form, but here $\\beta$ is a rate.' },
          { why: 'That is the variance, $\\frac{\\alpha}{\\beta^{2}}$.' },
          { why: 'That is $\\frac{\\beta}{\\alpha}$.' },
        ],
      },
      {
        prompt: 'How is the chi-square related to the gamma?',
        options: [
          { text: 'Chi-square with $v$ degrees of freedom is the gamma with $\\alpha = \\frac{v}{2}$ and $\\beta = \\frac{1}{2}$.', why: 'Substitute into the gamma density and you get the chi-square density exactly.' },
          { text: 'Chi-square is the gamma with $\\alpha = 1$.', why: 'That is the exponential.' },
          { text: 'They are unrelated.', why: 'Compare the two MGFs: $(1 - 2t)^{-v/2} = (1 - \\frac{t}{1/2})^{-v/2}$.' },
          { text: 'Chi-square is the square of a gamma variable.', why: 'Chi-square with 1 degree of freedom is the square of a **standard normal** variable; with $v$ degrees of freedom it is the sum of $v$ independent such squares.' },
        ],
      },
    ],
    bridge: 'Make the wait discrete: instead of minutes, the number of trials until the first success. This is the geometric, the memoryless counterpart of the exponential; and after it the negative binomial, the counterpart of the gamma.',
  },
  trap: 'Confusing $\\beta$ as a rate with a scale: here the mean is $\\frac{\\alpha}{\\beta}$, not $\\alpha\\beta$.',
  reference: { labTitle: 'The stages experiment' },
};
