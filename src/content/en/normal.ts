import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

export const normalEn: Tr<Chapter> = {
  question: 'Why do many results pile up in the shape of a bell?',
  story: {
    headline: 'From coin tosses to the bell curve',
    art: {
      ariaLabel: 'A Galton board with 10 rows of pins, and beneath it bars with heights from the binomial coefficients, in the shape of a bell',
      caption: 'A Galton board with 10 rows: each pin knocks the ball to the right or to the left. The heights of the bars are computed from the binomial.',
    },
    claims: [
      {
        text: 'On 12 November 1733, de Moivre circulated a Latin paper approximating the probabilities of tossing a coin many times (mainly the case $p = \\tfrac12$).',
        links: 'As $n$ grows, the binomial approaches a bell-shaped curve.',
      },
      {
        text: 'In it there appeared for the first time the formula we now call the normal approximation, and he took $\\sqrt{n}$ as the unit for measuring the distance from the mean.',
        links: 'Its modern name: the standard deviation $\\sigma$.',
      },
      {
        text: 'Gauss then used it to describe errors in astronomical observations (1809), and Laplace gave the first general form of the central limit theorem (1810–1812).',
        links: '$\\mu$ is the centre, and many small errors pile up around it.',
      },
    ],
    more: [
      { text: 'Galton designed a board in which balls fall between pins and form bars in the shape of a bell, and described it in his book Natural Inheritance (1889).' },
      { text: 'Rigorous proofs of the central limit theorem, with its modern conditions, came later, with Lyapunov and Lindeberg.' },
      { text: "The English version of de Moivre's result was published in the second edition of his book The Doctrine of Chances (1738)." },
      { text: 'Not every large data set is normal: the theorem is about the distribution of a sum or mean of independent variables with finite variance, not about the shape of the data themselves.' },
    ],
  },
  tryIt: {
    headline: 'From many pins to a bell',
    prompt: 'Choose the number of rows of pins, then drop the balls. Each pin knocks the ball to the right or to the left with probability $\\tfrac12$, so the number of the bin follows a binomial.',
  },
  build: {
    headline: 'The parts of the bell',
    steps: [
      { story: 'On a Galton board the balls pile up around the centre $\\mu$, and thin out quickly and symmetrically as we move away. We measure the distance in standard deviations:' },
      {
        story: 'We want a height that is largest at $z = 0$, symmetric, and falls off quickly with distance.',
        predict: {
          prompt: 'Which function gives a bell, symmetric about $\\mu$, that falls off quickly?',
          options: [
            { why: 'Squaring $z$ makes it symmetric, and the negative exponent makes it fall off quickly.' },
            { why: 'It is not symmetric: it grows without limit for negative values.' },
            { why: 'It is infinite at the centre.' },
            { why: 'It oscillates and takes negative values, and a density is never negative.' },
          ],
        },
      },
      {
        story: 'And the constant in front makes the total area equal 1, using the well-known Gaussian integral.',
        predict: {
          prompt: 'Which constant makes the total area under the curve equal 1?',
          options: [
            { why: 'Without the constant the area is $\\sigma\\sqrt{2\\pi}$, so we divide by it.' },
            { why: 'This mixes up the standard deviation and the variance.' },
            { why: 'That is the reciprocal of what we need, and it ignores $\\sigma$.' },
            { why: 'The area would then be $\\sigma\\sqrt{2\\pi}$, not 1.' },
          ],
        },
      },
    ],
    note: '**An explanation, not a derivation:** why exactly this shape? That is what the central limit theorem proves, with tools beyond an introductory course. Here we understand its parts and check its area.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: "You toss a coin 100 times. What is the probability that the number of heads is between 45 and 55 (inclusive)? Use de Moivre's approximation with a continuity correction.",
        steps: [
          { title: 'The parameters', body: '$X \\sim \\mathrm{Bin}(100, \\tfrac12)$, and $np = n(1-p) = 50 \\ge 10$, so the approximation is suitable:' },
          { title: 'Correct for continuity', body: 'The count is discrete, so we widen the interval by half a unit on each side:' },
          { title: 'Convert to $z$ and compute' },
        ],
        answer: '$P(45 \\le X \\le 55) \\approx 0.7287$, and the exact value from the binomial is also $\\approx 0.7287$.',
      },
      {
        label: 'Course style',
        given: "Students' heights at a university (a hypothetical example) are $N(170, 8^2)$ cm. What proportion of students are between 162 and 186 cm tall?",
        steps: [
          { title: 'Convert to $z$', body: 'Divide by $\\sigma = 8$, not by $\\sigma^2 = 64$:' },
          { title: 'From the table' },
        ],
        answer: 'About $0.8186$, that is, nearly 82% of the students.',
      },
    ],
    tricks: [
      '$z = (x - \\mu)/\\sigma$: divide by $\\sigma$, not by $\\sigma^2$.',
      '$\\Phi(-z) = 1 - \\Phi(z)$, so a table of positive values is enough.',
      'Approximating a discrete count? Correct for continuity by adding or subtracting $0.5$.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'Every calculation goes through $z$. And about 68%, 95% and 99.7% of values lie within 1, 2 and 3 standard deviations, roughly.',
    hookNote: 'In the notation $N(\\mu, \\sigma^2)$, the second parameter is the variance.',
    compose: {
      meanings: ['A constant that makes the total area 1', 'The shape of the bell: it falls off with the square of the distance from $\\mu$'],
    },
    recall: [
      {
        prompt: 'If $X \\sim N(100, 16)$, how many standard deviations is $108$ from the mean?',
        options: [
          { why: '$\\sigma = \\sqrt{16} = 4$, and $z = (108 - 100)/4 = 2$.' },
          { why: 'It divides by the variance 16 instead of the standard deviation 4.' },
          { why: 'That is the distance in the original units, not in standard deviations.' },
          { why: 'That is the variance.' },
        ],
      },
      {
        prompt: 'Roughly what proportion of values lie within $\\mu \\pm 2\\sigma$?',
        options: [
          { why: 'The 68–95–99.7 rule, roughly; the more exact value is $0.9545$.' },
          { why: 'That is within $\\mu \\pm \\sigma$.' },
          { why: 'That is within $\\mu \\pm 3\\sigma$.' },
          { why: 'That is the proportion below the mean alone.' },
        ],
      },
      {
        prompt: 'When is the normal approximation to the binomial suitable?',
        options: [
          { text: 'When $np$ and $n(1-p)$ are both large (10 or more, for example), with a continuity correction.', why: 'The expected numbers of successes and of failures must both be large for the shape to become symmetric.' },
          { text: 'When $n$ is large, whatever $p$ is.', why: 'If $p$ is very small the shape stays skewed, and the Poisson is the better choice.' },
          { text: 'When $p$ is very small.', why: 'That is the case for the Poisson approximation, not the normal.' },
          { text: 'Always, for any $n$.', why: 'With a small $n$ the approximation is poor.' },
        ],
      },
    ],
    bridge: 'Square a standard normal variable, and add up the squares of several independent ones: this is the chi-square, the first of the sampling distributions.',
  },
  reference: { labTitle: 'The full lab: μ, σ and the interval' },
};
