import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

const r = String.raw;

export const binomialEn: Tr<Chapter> = {
  question: 'Out of n independent trials, how many times does the event happen?',
  story: {
    headline: 'A bet stopped before the end',
    art: {
      ariaLabel: 'The triangle of coefficients up to row 4: 1, 4, 6, 4, 1; shaded 6, 4 and 1',
      caption: 'The triangle of coefficients up to row 4. Shaded: the ways to win at least 2 points in 4 rounds (6 + 4 + 1 = 11 of 16).',
    },
    claims: [
      {
        text: 'In 1654 Pascal and Fermat exchanged letters on the “problem of points”: a game stopped before its end, so how should the stake be divided fairly?',
        links: r`$X$ = the number of wins in $n$ rounds.`,
      },
      {
        text: 'Their idea: what has already happened does not matter, only the ways the game could be finished; each player takes a share in proportion to the ways in which they win.',
        links: 'The formula = the number of ways × the probability of one way.',
      },
      {
        text: 'The number of ways is in the triangle of coefficients, which reached us in the work of al-Karaji (around 1000 CE) through al-Samawal; it was also known in China and India.',
        links: r`$\binom{n}{k}$ = the number of ways that contain $k$ wins.`,
      },
    ],
    more: [
      { text: 'The problem of points was posed long before them, for example by Pacioli in 1494, and it was brought to them by Antoine Gombaud (the Chevalier de Méré).' },
      { text: 'No one can be said to have “invented” the triangle first; it was known in several civilizations.' },
    ],
  },
  tryIt: {
    headline: 'How should the stake be divided fairly?',
    prompt: 'In a fair game, A needs 2 points to win. Choose how many points B needs, and see in how many of the ways to finish the game A comes out on top.',
  },
  build: {
    headline: 'The number of ways × the probability of one way',
    steps: [
      {
        story: 'Take one specific way of finishing the game, such as: win, win, loss, loss (W W L L). The rounds are independent, and the probability of a win is the same $p$ in each.',
        predict: {
          prompt: 'What is the probability of one specific way with $k$ wins and $n-k$ losses?',
          options: [
            { why: 'By independence we multiply the probabilities of the rounds: $p$ for each win and $1-p$ for each loss.' },
            { why: 'Independent probabilities are multiplied together, not multiplied by how many there are.' },
            { why: 'This forgets the probability of the $n-k$ losses.' },
            { why: 'That is the probability of winning every round.' },
          ],
        },
      },
      {
        story: 'Every way with $k$ wins has the same probability, because $p$ is constant. So how many such ways are there?',
        predict: {
          prompt: 'In 4 rounds, how many ways contain exactly 2 wins?',
          options: [
            { why: 'WWLL, WLWL, WLLW, LWWL, LWLW, LLWW: we choose the positions of the two wins out of 4, that is $\\binom{4}{2} = 6$.' },
            { why: 'That is the number of rounds, not the number of ways to choose 2 positions among them.' },
            { why: 'It is not $2 \\times 4$; count the 6 orderings one by one.' },
            { why: 'That is the number of wins, not the number of ways.' },
          ],
        },
      },
    ],
    note: 'The different ways are mutually exclusive events, so we add their equal probabilities. If $p$ changed, or the rounds were not independent, the ways would not be equally likely and the formula would not hold.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: "A fair game ($p = \\tfrac12$) has stopped: A needs 2 points to win and B needs 3. What is A's fair share of the stake?",
        steps: [
          { title: 'How many rounds are enough?', body: 'The game is sure to end within $2 + 3 - 1 = 4$ rounds, so we imagine playing all 4.' },
          { title: 'Define the variable', body: '$X$ = the number of rounds A wins out of 4, and $X \\sim \\mathrm{Bin}(4, \\tfrac12)$. A wins if $X \\ge 2$.' },
          { title: 'Substitute' },
        ],
        answer: "A's share is $\\tfrac{11}{16} = 0.6875$ of the stake, and B's share is $\\tfrac{5}{16}$.",
      },
      {
        label: 'Course style',
        given: 'A student guesses the answers to 8 true-or-false questions. What is the probability of answering **at least** 6 questions correctly?',
        steps: [
          { title: 'Define the variable', body: '$X \\sim \\mathrm{Bin}(8, \\tfrac12)$: a fixed number of independent trials, with a constant $p$.' },
          { title: '“At least 6” = 6, 7 or 8', body: 'Only 3 terms, so we add them directly:' },
          { title: 'Compute' },
        ],
        answer: '$P(X \\ge 6) \\approx 0.1445$',
      },
    ],
    tricks: [
      '“At least” or “at most”: add up the side with fewer terms, directly or through the complement.',
      '$\\binom{n}{k} = \\binom{n}{n-k}$ shortens the work.',
      'With $p = \\tfrac12$ every way is equally likely: the probability = the number of ways you want ÷ $2^{n}$.',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'The number of ways × the probability of one way.',
    hookNote: 'In the problem of points: $n = 4$ and $p = \\tfrac12$, so the mean is 2 wins.',
    compose: {
      meanings: ['The number of ways that contain $k$ successes', 'The probability of the $k$ successes', 'The probability of the $n-k$ failures'],
    },
    recall: [
      {
        prompt: 'When does the binomial not apply?',
        options: [
          { text: 'When the probability of success changes between trials or the trials are not independent, as when drawing without replacement from a small group.', why: 'The formula assumes all ways are equally likely, which needs a constant $p$ and independence.' },
          { text: 'When $p$ is smaller than $0.5$.', why: 'The binomial accepts any $p$ between 0 and 1.' },
          { text: 'When $n$ is larger than 10.', why: 'There is no upper limit on $n$; the calculation just gets longer.' },
          { text: 'When we count the successes rather than the failures.', why: 'Counting the successes is the very definition of $X$.' },
        ],
      },
      {
        prompt: 'If $X \\sim \\mathrm{Bin}(10, 0.3)$, what is the mean?',
        options: [
          { why: '$np = 10 \\times 0.3 = 3$.' },
          { why: 'That is the variance $np(1-p)$.' },
          { why: 'That is $p$ for a single trial.' },
          { why: 'That is the mean number of failures.' },
        ],
      },
      {
        prompt: 'In 5 coin tosses, why is $P(X = 2) = 10 \\times (0.5)^5$ and not just $(0.5)^5$?',
        options: [
          { text: 'Because there are $\\binom{5}{2} = 10$ orderings for the positions of the two heads, each with the same probability.', why: '$(0.5)^5$ is the probability of only one ordering.' },
          { text: 'Because the tosses are not independent.', why: 'The tosses are independent, which is why we multiply the probabilities in the first place.' },
          { text: 'Because $p$ changes between tosses.', why: 'It is the same coin, and $p = 0.5$ is constant.' },
          { text: 'Because the mean is 10.', why: 'The mean here is $2.5$; 10 is the number of orderings.' },
        ],
      },
    ],
    bridge: 'And what if we draw **without replacement** from a small group? The probability changes after every draw, so the binomial no longer applies: this is the hypergeometric.',
  },
  reference: { labTitle: 'The full lab: n, p, k and simulation' },
};
