import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

const r = String.raw;

export const bernoulliEn: Tr<Chapter> = {
  question: 'Did the event happen or not? And what happens when we ask the question many times?',
  story: {
    headline: "Bernoulli's urn",
    art: {
      ariaLabel: 'An urn with 30 white pebbles and 20 black ones, a ratio of 3 to 2',
      caption: "A small version of Bernoulli's urn: 3 white pebbles for every 2 black ones (3000 and 2000 in his example).",
    },
    claims: [
      {
        text: 'Jacob Bernoulli (died 1705) left his book “Ars Conjectandi” (The Art of Conjecturing) unfinished; his nephew Nicolaus published it in 1713.',
      },
      {
        text: 'In it he imagined an urn with 3000 white pebbles and 2000 black ones: you draw a pebble, record its colour, then put it back.',
        links: r`One draw: $X = 1$ if it is white, and $P(X=1) = p = 0.6$.`,
      },
      {
        text: 'He proved that the probability that the proportion of white pebbles strays from $\\tfrac35$ by any margin you choose approaches zero as the draws pile up: the “law of large numbers”.',
        links: r`The mean $E[X] = p$ is what the proportion approaches.`,
      },
    ],
    more: [
      { text: 'The law of large numbers is in the fourth part of the book, and that part itself was left unfinished.' },
      { text: "Bernoulli's real aim was the reverse: if we do not know what is in the urn, how many draws do we need to estimate the unknown proportion with confidence?" },
    ],
  },
  tryIt: {
    headline: 'Does the proportion approach the truth?',
    prompt: "Draw pebbles from Bernoulli's urn (3 white : 2 black), and watch the proportion of white in your draws.",
    successLabel: 'white',
    reveal:
      'This is what Bernoulli proved: the probability that the proportion strays from $0.6$ by more than any margin you choose approaches zero as the draws pile up. But a single draw is still $0$ or $1$.',
  },
  build: {
    headline: 'One formula for two lines',
    steps: [
      { story: 'A single draw has two outcomes: white ($X = 1$) with probability $p$, or black ($X = 0$) with probability $1 - p$.' },
      {
        story: 'We want one formula for both cases. The idea: an exponent that switches the right part on and the other off.',
        predict: {
          prompt: 'What is $p^{x}$ when $x = 0$?',
          options: [
            { why: 'Any number to the power zero equals 1, so this part has no effect when $x = 0$.' },
            { why: 'A zero exponent does not make the result zero; $p^0 = 1$.' },
            { why: 'That is its value when $x = 1$, not $x = 0$.' },
            { why: 'That is the probability of $X = 0$, but it comes from the second part, not from $p^{x}$.' },
          ],
        },
      },
      {
        story: 'And the second part works in the opposite case.',
        predict: {
          prompt: 'Which part gives $1 - p$ when $x = 0$ and disappears when $x = 1$?',
          options: [
            { why: 'When $x = 0$ the exponent becomes 1, giving $1-p$; when $x = 1$ the exponent becomes zero, giving 1.' },
            { why: 'This gives $1-p$ when $x = 1$, the opposite of what we want.' },
            { why: 'When $x = 1$ it gives $1-p$ instead of disappearing.' },
            { why: 'This gives $p$ when $x = 0$, not $1-p$.' },
          ],
        },
      },
    ],
    note: 'The word “success” names the event we are watching for; it does not say the event is good. From the formula: $E[X] = p$ and $\\mathrm{Var}(X) = p(1-p)$.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: "From Bernoulli's urn (3000 white and 2000 black) we draw one pebble, and $X = 1$ if it is white. What are $E[X]$ and $\\mathrm{Var}(X)$?",
        steps: [
          { title: 'Define the variable', body: '$X \\sim \\mathrm{Bernoulli}(p)$ where $p = \\tfrac{3000}{5000} = 0.6$.' },
          { title: 'The mean' },
          { title: 'The variance', body: 'Since $X^2 = X$, we have $E[X^2] = p$:' },
        ],
        answer: '$E[X] = 0.6$ and $\\mathrm{Var}(X) = 0.24$',
      },
      {
        label: 'Course style',
        given: 'The probability that a product is defective is $0.05$. We inspect one product, and $X = 1$ if it is defective. What are $E[X]$ and $\\mathrm{Var}(X)$?',
        steps: [
          { title: 'Define the “success”', body: 'The event we watch for here is a defect, so $p = 0.05$ (“success” is a name, not a judgement).' },
          { title: 'Substitute' },
        ],
        answer: '$E[X] = 0.05$ and $\\mathrm{Var}(X) = 0.0475$',
      },
    ],
    tricks: [
      '$P(X = 1) = p$ always: first decide what “the event we watch for” is.',
      '$X^2 = X$ because $X$ is either 0 or 1, so $E[X^2] = p$.',
      'The variance $p(1-p)$ is largest at $p = \\tfrac12$.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'A yes-or-no question: $X$ takes only $0$ or $1$.',
    hookNote: "And for Bernoulli's urn: the mean is $0.6$ and the variance $0.24$.",
    compose: {
      meanings: ['Active when $x = 1$, and becomes 1 when $x = 0$', 'Active when $x = 0$, and becomes 1 when $x = 1$'],
    },
    recall: [
      {
        prompt: "In Bernoulli's urn, what does the outcome $X = 1$ mean?",
        options: [
          { text: 'Drawing a white pebble: the event we chose to watch for.', why: '“Success” names the event we watch for, and here we chose white.' },
          { text: 'That the draw was “good”.', why: 'Success is not a judgement of quality; it names the event we watch for.' },
          { text: 'Drawing two pebbles.', why: 'A Bernoulli variable is a single trial.' },
          { text: 'That the proportion has reached $0.6$.', why: 'The proportion is about many draws; a single draw is 0 or 1.' },
        ],
      },
      {
        prompt: 'A Bernoulli variable has mean $0.25$. What is its variance?',
        options: [
          { why: '$p(1-p) = 0.25 \\times 0.75 = 0.1875$.' },
          { why: 'That is the mean $p$.' },
          { why: 'That is $p^2$.' },
          { why: 'That is $1-p$.' },
        ],
      },
      {
        prompt: 'For which value of $p$ is the Bernoulli variance largest?',
        options: [
          { why: '$p(1-p)$ is a parabola with its peak at $p = \\tfrac12$, where uncertainty is greatest.' },
          { why: 'At $p = 1$ the outcome is certain and the variance is zero.' },
          { why: 'At $p = 0$ the outcome is also certain and the variance is zero.' },
          { why: 'That is the largest value of the variance, not the value of $p$ that gives it.' },
        ],
      },
    ],
    bridge: 'Repeat a Bernoulli draw $n$ times and count the successes: this is where the binomial is born.',
  },
  reference: { labTitle: 'The full lab: probability and simulation' },
};
