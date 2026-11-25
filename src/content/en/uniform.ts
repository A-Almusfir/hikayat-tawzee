import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

const r = String.raw;

export const uniformEn: Tr<Chapter> = {
  question: 'Every value in a given interval is equally likely: what is the probability of part of it?',
  story: {
    headline: "Buffon's needle",
    art: {
      ariaLabel: '18 needles thrown on a floor with parallel horizontal lines; the dark needles cross a line',
      caption: 'Needles thrown at random (a simulation) onto parallel lines. The dark ones cross a line. The needle is shorter than the distance between 2 lines.',
    },
    claims: [
      {
        text: 'In 1777, in his “Essay on Moral Arithmetic”, Buffon published a problem: throw a needle onto a floor ruled with evenly spaced parallel lines; what is the probability that it crosses a line?',
        links: r`The needle has length $l$, and the lines are a distance $d \ge l$ apart.`,
      },
      {
        text: 'The solution assumes that the position of the needle and its angle are uniform and independent: every value in its range is equally likely. The answer is $\\frac{2l}{\\pi d}$.',
        links: r`The distance to the nearest line $\sim U\big(0, \tfrac{d}{2}\big)$, and the angle is uniform.`,
      },
    ],
    more: [
      { text: 'Because $\\pi$ appears in the answer, Laplace later linked repeated throws to estimating $\\pi$ by experiment.' },
      { text: "Buffon's solution for a floor with perpendicular lines (a grid), however, contains a mistake, which Laplace corrected in 1812." },
    ],
  },
  tryIt: {
    headline: 'Throw the needles and estimate π',
    prompt: 'Throw many needles, and compare the proportion that cross a line with $\\frac{2l}{\\pi d}$. Then estimate $\\pi$ from that proportion.',
  },
  build: {
    headline: 'The length you want ÷ the total length',
    steps: [
      {
        story: 'In the uniform on $(a, b)$, no value is favoured over another, so the probability of a sub-interval depends only on its length, not on where it is.',
        predict: {
          prompt: 'The distance from the centre of the needle to the nearest line is uniform on $(0, 5)$ cm. What is the probability that it is less than 1 cm?',
          options: [
            { why: 'The interval $(0, 1)$ is one fifth of the length of $(0, 5)$.' },
            { why: 'That is the length of the interval you want, not its probability.' },
            { why: 'The interval you want is not half the range.' },
            { why: 'Zero is for a single value; the interval has a length.' },
          ],
        },
      },
      {
        story: 'And the whole range has probability 1, so we divide by its length, $b - a$. Hence the density is constant over the range:',
        predict: {
          prompt: 'What is the density of the uniform on $(2, 6)$?',
          options: [
            { why: '$\\frac{1}{b - a} = \\frac{1}{6 - 2}$, and the area is $4 \\times \\frac{1}{4} = 1$.' },
            { why: 'That is the length of the range; the density is its reciprocal.' },
            { why: 'The denominator is $b - a$, not $b$.' },
            { why: 'The denominator is $6 - 2 = 4$.' },
          ],
        },
      },
    ],
    note: "The mean is the midpoint of the interval, $\\frac{a+b}{2}$, and the variance is $\\frac{(b-a)^{2}}{12}$. Buffon's needle involves **two** independent uniform variables (the distance and the angle), so the solution is an integral over an area, and the result is $\\frac{2l}{\\pi d}$ provided $l \\le d$. The uniform on $(0, 1)$ is beta$(1, 1)$, and $-\\frac{\\ln U}{\\theta}$ is exponential with rate $\\theta$: this is how computers generate other distributions from the uniform.",
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: 'A needle 4 cm long is thrown onto a floor with parallel lines every 5 cm. What is the probability that it crosses a line?',
        steps: [{ title: 'Check the condition', body: "$l = 4 \\le d = 5$, so Buffon's formula applies." }, { title: 'Substitute' }],
        answer: '$P \\approx 0.5093$: about half of the throws cross a line.',
      },
      {
        label: 'Course style',
        given: 'A bus arrives at a uniformly random time between 7:00 and 7:30. You reached the stop at 7:00. What is the probability that you wait more than 10 minutes? And what are the mean and variance of the wait?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the minutes you wait, and $X \\sim U(0, 30)$.' },
          { title: 'The probability' },
          { title: 'The mean and variance' },
        ],
        answer: '$P(X > 10) \\approx 0.6667$, the mean is 15 minutes, and the variance is 75.',
      },
    ],
    tricks: [
      'The probability = the length of the interval you want ÷ the length of the whole range, after trimming it to $(a, b)$.',
      '$P(X = x) = 0$ for any single value, so $<$ and $\\le$ make no difference.',
      'The variance is $\\frac{(b-a)^{2}}{12}$: the square of the length, not the length.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'The length you want ÷ the total length.',
    hookNote: 'In the bus example: the mean wait is 15 minutes, the midpoint of the interval.',
    compose: {
      meanings: ['The length of the interval you want', 'The length of the whole range'],
    },
    recall: [
      {
        prompt: 'If $X \\sim U(0, 10)$, what is $P(3 < X < 7)$?',
        options: [
          { why: '$\\frac{7 - 3}{10}$.' },
          { why: 'That is the length of the interval, and a probability cannot exceed 1.' },
          { why: 'That is $P(X < 7)$.' },
          { why: 'That is $P(X < 3)$.' },
        ],
      },
      {
        prompt: 'What is the variance of the uniform on $(0, 6)$?',
        options: [
          { why: '$\\frac{6^{2}}{12} = 3$.' },
          { why: 'That is $\\frac{6}{12}$: you forgot to square.' },
          { why: 'That is the length of the range.' },
          { why: 'That is the standard deviation, $\\sqrt{3}$.' },
        ],
      },
      {
        prompt: "Why does the solution to Buffon's needle need two uniform variables, not one?",
        options: [
          { text: 'Because crossing a line depends on both the position of the centre and the angle.', why: 'A needle close to a line may not cross it if it lies parallel to it.' },
          { text: 'Because the needle has 2 ends.', why: 'The 2 ends are determined by the centre and the angle.' },
          { text: 'Because the lines are parallel.', why: 'Being parallel means the distance to the nearest line is enough for the position, but the angle remains.' },
          { text: 'It does not: the distance alone is enough.', why: 'A horizontal needle does not cross a line however close its centre is, unless it lies on it.' },
        ],
      },
    ],
    bridge: 'Add up many independent variables, uniform ones or coin tosses: the shape of the sum approaches a bell (the central limit theorem). This is the normal.',
  },
  trap: 'Writing the variance as $\\frac{b-a}{12}$ instead of $\\frac{(b-a)^{2}}{12}$, or forgetting to trim the interval you want to $(a, b)$.',
  reference: { labTitle: 'The needles experiment' },
};
