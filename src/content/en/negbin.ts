import type { Chapter } from '../chapterTypes';
import type { Tr } from '../../lib/i18n';

const r = String.raw;

export const negbinEn: Tr<Chapter> = {
  question: 'How many trials do we need until success number r happens?',
  story: {
    headline: 'Montmort waits for the third win',
    art: {
      ariaLabel: '7 rounds: a loss, the first win, 2 losses, the second win, a loss, then the third win in round 7',
      caption: 'A player needs 3 wins, and the third win came in round 7. The highlighted square is the win we wait for, and it is always the last round.',
    },
    claims: [
      {
        text: 'In 1713, in the second edition of his book on games of chance, Montmort returned to the “problem of points” begun by Pascal and Fermat, and gave it a new solution.',
        links: 'A player needs $r$ points to win the bet.',
      },
      {
        text: 'In his work on this problem he reached what we now call the negative binomial: it does not ask how many times the player wins, but when the last win he needs arrives.',
        links: r`$X$ = the number of the round in which win number $r$ arrives, with $x \ge r$.`,
      },
    ],
    more: [
      { text: 'In 1920 Greenwood and Yule used a form of this distribution for the number of accidents among women working in munitions factories: the variance (0.69) was larger than the mean (0.47), so the Poisson did not fit. Their form counts accidents, not trials, and arises from mixing a Poisson with a gamma.' },
    ],
  },
  tryIt: {
    headline: 'When does the third win come?',
    prompt: 'Choose the number of wins needed and the probability of winning, and play many times. Where do the bars pile up?',
  },
  build: {
    headline: 'The last round is a win, and the others fall anywhere before it',
    steps: [
      {
        story: 'Take one sequence in which the third win comes in round 5, such as: loss, win, win, loss, win. The rounds are independent, so we multiply.',
        predict: {
          prompt: 'What is the probability of a specific sequence with $r$ wins and $x - r$ losses?',
          options: [
            { why: 'By independence: $p$ for each win and $q$ for each loss.' },
            { why: 'Not every round is a win; there are $x - r$ losses.' },
            { why: 'Independent probabilities are multiplied together, not multiplied by how many there are.' },
            { why: 'That is the geometric: a single win only.' },
          ],
        },
      },
      {
        story: 'How many such sequences are there? The last round is settled: it is win number $r$. The other $r - 1$ wins are spread anywhere among the previous $x - 1$ rounds.',
        predict: {
          prompt: 'Why do we count with $\\binom{x-1}{r-1}$ and not $\\binom{x}{r}$?',
          options: [
            { text: 'Because the last round is certain to be a win, so we do not choose a position for it.', why: 'If round $x$ were a loss, the third win would have come earlier and $X$ would be smaller than $x$. So we only choose among the previous rounds.' },
            { text: 'Because the first round does not count.', why: 'The first round counts; it is the last one that is settled.' },
            { text: 'Because $\\binom{x}{r}$ and $\\binom{x-1}{r-1}$ are equal.', why: 'They are not equal: $\\binom{5}{3} = 10$ and $\\binom{4}{2} = 6$.' },
            { text: 'Because the wins are not independent.', why: 'The rounds are independent; the only constraint is on where the last win falls.' },
          ],
        },
      },
    ],
    note: 'At $r = 1$ the formula becomes $p\\,q^{x-1}$: the geometric itself. And the negative binomial is the sum of $r$ independent geometric waits (until the first win, then until the second…), which gives $E(X) = \\frac{r}{p}$ and $\\mathrm{Var}(X) = \\frac{rq}{p^{2}}$.',
  },
  exam: {
    headline: 'The exam problem',
    problems: [
      {
        label: 'From the story',
        given: 'In a fair game ($p = \\tfrac12$), A needs 3 wins. What is the probability that the third win comes in round 5 exactly?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the round in which the third win comes: negative binomial with $r = 3$ and $p = \\tfrac12$.' },
          { title: 'Substitute' },
        ],
        answer: '$P(X = 5) = 0.1875$',
      },
      {
        label: 'Course style',
        given: 'A salesperson succeeds on each call with probability $0.2$, independently of other calls. What is the probability of making the second sale on the fifth call? And how many calls are needed on average for 2 sales?',
        steps: [
          { title: 'Define the variable', body: '$X$ = the call on which the second sale is made: $r = 2$, $p = 0.2$.' },
          { title: 'Substitute' },
          { title: 'The mean' },
        ],
        answer: '$P(X = 5) \\approx 0.0819$, and on average 10 calls are needed.',
      },
    ],
    tricks: [
      'The top of the coefficient is $x - 1$ and the bottom $r - 1$: the last round is settled.',
      'Read the definition: here we count the **trials** ($x \\ge r$). Some books and software count the **failures** $Y = X - r$.',
      '“More than $x$ trials” = fewer than $r$ successes in the first $x$ trials: a binomial question.',
      'Watch the symbol: here $r$ is the **number of successes** needed, while in the Poisson chapter $r$ is the rate of events ($\\lambda = rt$).',
    ],
  },
  anchor: {
    headline: 'Lock in the story',
    hook: 'The last trial is a success, and the remaining successes fall anywhere before it.',
    hookNote: 'And with $r = 1$ the geometric returns: $\\frac{1}{p}$ and $\\frac{q}{p^{2}}$.',
    compose: {
      meanings: ['The positions of the first $r - 1$ wins among the previous $x - 1$ rounds', 'The probability of the $r$ wins', 'The probability of the $x - r$ losses'],
    },
    recall: [
      {
        prompt: 'What is the difference between the binomial and the negative binomial?',
        options: [
          { text: 'Binomial: the number of trials is fixed and we count the successes. Negative binomial: the number of successes is fixed and we count the trials.', why: 'What is fixed and what varies trade places between the two.' },
          { text: 'The negative binomial gives negative probabilities.', why: 'Probabilities are never negative; the name comes from an algebraic form of its coefficients.' },
          { text: 'The negative binomial is for drawing without replacement.', why: 'That is the hypergeometric.' },
          { text: 'There is no difference; they are two names for one distribution.', why: 'The variable is different: a number of successes versus a number of trials.' },
        ],
      },
      {
        prompt: 'We toss a fair coin until heads appears for the fourth time. What is the mean number of tosses?',
        options: [
          { why: '$\\frac{r}{p} = \\frac{4}{0.5} = 8$.' },
          { why: 'That is $r$: the smallest possible number of tosses, not the mean.' },
          { why: 'That is the mean of the geometric, $\\frac{1}{p}$: the wait until the first heads only.' },
          { why: 'The denominator is $p$, not $p^{2}$.' },
        ],
      },
      {
        prompt: 'What is the smallest possible value of $X$?',
        options: [
          { why: 'You cannot get $r$ successes in fewer than $r$ trials.' },
          { why: 'That would be if we counted the failures, $Y = X - r$.' },
          { why: 'That is for the geometric only ($r = 1$).' },
          { why: 'We need at least $r$ trials.' },
        ],
      },
    ],
    bridge: 'We return to measurement, with the simplest continuous variable: every value in an interval is equally likely. This is the uniform, the first thing Buffon needed to throw his needle.',
  },
  trap: 'Writing $\\binom{x}{r}$ instead of $\\binom{x-1}{r-1}$ (forgetting that the last trial is certain to be a success), or mixing up counting trials with counting failures.',
  reference: { labTitle: 'The wins experiment' },
};
