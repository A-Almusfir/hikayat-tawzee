import type { DistContent, DistId } from '../types';
import type { Tr } from '../../lib/i18n';

// ترجمة محتوى «المرجع» في الفصول المترجمة (الاشتقاق والبطاقة والأسئلة الإضافية).
const PMF = 'Probability mass function (PMF)';

export const distEn: Partial<Record<DistId, Tr<DistContent>>> = {
  bernoulli: {
    question: 'A single trial: did the event happen or not?',
    formula: {
      fnName: PMF,
      parts: [
        { label: 'Probability of the event', explain: 'When $x=1$ this part becomes $p$, and when $x=0$ it becomes $1$, so it has no effect.' },
        { label: 'Probability it does not happen', explain: 'When $x=0$ it becomes $1-p$, and when $x=1$ it becomes $1$, so it has no effect.' },
      ],
      intuition: [
        'The formula is a short way of writing two lines: $P(X=1)=p$ and $P(X=0)=1-p$. The exponent works like a switch that turns the right part on and the other off.',
        'The mean $p$ is not a value $X$ takes; it is the proportion of times $X=1$ if we repeat the trial many times.',
      ],
      derivation: [
        'The mean: add up each value times its probability.',
        undefined,
        'Because $X$ takes only 0 or 1, $X^2 = X$, and so $E[X^2] = p$.',
        undefined,
        'The variance is largest at $p=0.5$ (the most uncertain case), and approaches zero as $p$ approaches 0 or 1.',
      ],
    },
    card: {
      params: [{ meaning: 'The probability of “success” in a single trial, $0 \\le p \\le 1$ (no unit).' }],
      fnLabel: PMF,
      conditions: ['A single trial.', 'Only two outcomes.', 'The probability of the event we watch for is a known $p$.'],
      mistake: 'Thinking the mean $p$ is a possible value of $X$. The only possible values are 0 and 1.',
    },
    quiz: [
      {
        prompt: 'Which of the following variables follows a Bernoulli distribution?',
        options: [
          { text: 'The result of testing one memory card: 1 if it is faulty, 0 if it works.', why: 'A single trial with two outcomes: that is the definition of a Bernoulli variable.' },
          { text: 'The number of faulty cards among 20 cards tested.', why: 'This is a count over several trials; it suits the binomial if its conditions hold, not the Bernoulli.' },
          { text: 'The number of cards tested until the first faulty one appears.', why: 'This is the number of trials until the first success; it suits the geometric.' },
          { text: 'The time needed to test one card, in seconds.', why: 'Time is a continuous variable, while a Bernoulli variable takes only 0 or 1.' },
        ],
      },
      {
        prompt: 'If $X \\sim \\mathrm{Bernoulli}(0.3)$, what is the variance of $X$?',
        options: [
          { why: '$p(1-p) = 0.3 \\times 0.7 = 0.21$.' },
          { why: 'That is the mean $p$, not the variance.' },
          { why: 'That is $p^2$; the variance needs $p - p^2$.' },
          { why: 'That is $1-p$, the probability that $X=0$.' },
        ],
      },
      {
        prompt: 'A student said: “Since $E[X] = 0.2$ for a Bernoulli variable, $X$ usually takes the value $0.2$.” What is correct?',
        options: [
          { text: 'The statement is wrong: $X$ takes only 0 or 1, and $0.2$ is the long-run proportion of times $X=1$.', why: 'The mean describes behaviour over repetition; it is not a possible value of the variable.' },
          { text: 'The statement is right, because the mean is the most frequent value.', why: 'The mean is not the mode, and here it is not even a possible value.' },
          { text: 'The statement is wrong because the correct mean is $0.8$.', why: 'The mean is $p = 0.2$ if $P(X=1)=0.2$; $0.8$ is the probability that $X=0$.' },
          { text: 'The statement is wrong because the mean is $0.16$.', why: '$0.16 = p(1-p)$ is the variance, not the mean.' },
        ],
      },
    ],
  },

  binomial: {
    question: 'Out of n independent trials, how many times did the event happen?',
    formula: {
      fnName: PMF,
      parts: [
        { label: 'Number of orderings', explain: 'The number of ways to choose the positions of the $k$ successes among $n$ trials. For example, $\\binom{10}{3} = 120$.' },
        { label: 'Probability of the successes', explain: 'The probability that $k$ specific trials succeed; we multiply $k$ factors of $p$ thanks to independence.' },
        { label: 'Probability of the failures', explain: 'The probability that the remaining $n-k$ trials fail.' },
      ],
      intuition: [
        'Take one specific ordering, such as: success, success, success, failure, …, failure. Thanks to independence, its probability is the product of the probabilities: $p^k(1-p)^{n-k}$.',
        'Every ordering with $k$ successes has exactly the same probability, because $p$ is constant. So we multiply by the number of these orderings, $\\binom{n}{k}$.',
        'If $p$ were not constant or the trials were not independent, the orderings would not be equally likely and the formula would not hold.',
      ],
      derivation: [
        'Let $Y_i = 1$ if trial number $i$ succeeds and $0$ otherwise. The event $\\{X = k\\}$ is a union of disjoint events, each a specific sequence with $k$ ones and $n-k$ zeros.',
        'The probability of a specific sequence, by independence:',
        undefined,
        'The number of these sequences is $\\binom{n}{k} = \\dfrac{n!}{k!(n-k)!}$, and since they are disjoint events we add their equal probabilities, which gives the formula.',
        'The total is 1 by the binomial theorem:',
        undefined,
        'The mean and variance: $X = Y_1 + \\dots + Y_n$ where each $Y_i \\sim \\mathrm{Bernoulli}(p)$. Linearity of expectation gives $E[X] = np$, and independence lets us add the variances: $\\mathrm{Var}(X) = np(1-p)$.',
      ],
    },
    card: {
      params: [
        { meaning: 'The number of trials (a positive whole number, fixed in advance).' },
        { meaning: 'The probability of success in each trial, $0 \\le p \\le 1$.' },
      ],
      fnLabel: PMF,
      conditions: ['A fixed number of trials $n$.', 'Two outcomes per trial.', 'A constant probability of success $p$.', 'Independent trials.'],
      mistake: 'Forgetting the number of orderings $\\binom{n}{k}$ and computing the probability of a single ordering only.',
    },
    quiz: [
      {
        prompt: 'A box holds 10 cards, 4 of them red. We draw 5 cards **without replacement**, and $X$ is the number of red cards. Is $X \\sim \\mathrm{Bin}(5, 0.4)$?',
        options: [
          { text: 'No; drawing without replacement from a small group changes the probability of red from draw to draw, so the trials are not independent.', why: 'After drawing a red card, the probability that the next is red becomes $3/9$, not $4/10$; the conditions of a constant probability and independence are broken. This is a hypergeometric situation.' },
          { text: 'Yes, because the number of draws is fixed at $n = 5$.', why: 'A fixed $n$ is only one condition; $p$ must also be constant and the trials independent.' },
          { text: 'Yes, because the proportion of red is $4/10 = 0.4$.', why: 'The initial proportion does not stay constant when drawing without replacement.' },
          { text: 'No, because $X$ is a continuous variable.', why: '$X$ is a whole number, so it is discrete; the problem is independence, not the type.' },
        ],
      },
      {
        prompt: 'If $X \\sim \\mathrm{Bin}(5, 0.5)$, what is $P(X = 3)$?',
        options: [
          { why: '$\\binom{5}{3}(0.5)^3(0.5)^2 = 10 \\times 0.03125 = 0.3125$.' },
          { why: 'That is the probability of a single ordering, $(0.5)^5$; it forgets the 10 orderings.' },
          { why: 'That is only $(0.5)^3$; it ignores the probability of the two failures.' },
          { why: 'That is $k/n$, a proportion, not a probability from the formula.' },
        ],
      },
      {
        prompt: 'A student computed the probability of 2 successes in 4 independent trials with $p = 0.3$ like this: $(0.3)^2(0.7)^2 = 0.0441$. Where is the mistake?',
        options: [
          { text: 'The student forgot the number of orderings $\\binom{4}{2} = 6$; the right answer is $6 \\times 0.0441 = 0.2646$.', why: 'The calculation covers only one ordering, such as (S, S, F, F), and there are 6 equally likely orderings.' },
          { text: 'There is no mistake; the answer is $0.0441$.', why: 'That is the probability of one specific ordering, not of “2 successes in any order”.' },
          { text: 'He should have added the probabilities: $0.3 + 0.3 = 0.6$.', why: 'The probabilities of independent trials are multiplied, not added.' },
          { text: 'He should have used $(0.3)^4$.', why: 'That is the probability of 4 successes, not 2.' },
        ],
      },
    ],
  },

  poisson: {
    question: 'How many events will happen in a given interval?',
    formula: {
      fnName: PMF,
      parts: [
        { label: 'Probability that no event occurs', explain: 'When $k = 0$ the formula becomes $e^{-\\lambda}$, the probability of a completely empty interval.' },
        { label: 'The effect of the rate', explain: 'The larger $\\lambda$ is, the more weight the large values of $k$ get.' },
        { label: 'Order does not matter', explain: 'The order of the $k$ events does not matter, only their number; $k!$ reins in the growth of $\\lambda^k$ so the total is 1.' },
      ],
      intuition: [
        'Imagine splitting the interval into $n$ very short time slices; in each slice either one event occurs (with a small probability $\\lambda/n$) or nothing happens.',
        'The number of slices with an event follows the binomial $\\mathrm{Bin}(n, \\lambda/n)$, whose mean is $\\lambda$ whatever $n$ is. As the slices shrink without limit, we get the Poisson formula.',
      ],
      derivation: [
        'Under the assumptions of a Poisson process (a constant rate, independent counts in non-overlapping intervals, no two events at the same instant), we split the interval into $n$ equal slices and take the limit $n \\to \\infty$:',
        undefined,
        'So the limit is $\\dfrac{e^{-\\lambda}\\lambda^{k}}{k!}$. This is an exact mathematical limit, not just a teaching approximation.',
        'The total is 1 because $\\sum_{k\\ge0}\\lambda^k/k! = e^{\\lambda}$.',
        'The mean: $E[X] = \\sum_{k\\ge1} k\\,\\dfrac{e^{-\\lambda}\\lambda^k}{k!} = \\lambda\\sum_{j\\ge0}\\dfrac{e^{-\\lambda}\\lambda^j}{j!} = \\lambda$.',
        'In the same way $E[X(X-1)] = \\lambda^2$, so $\\mathrm{Var}(X) = \\lambda^2 + \\lambda - \\lambda^2 = \\lambda$.',
      ],
    },
    card: {
      params: [{ meaning: 'The mean number of events in the given interval, $\\lambda > 0$. If you are given a rate $r$ and a time $t$, then $\\lambda = rt$.' }],
      fnLabel: PMF,
      conditions: ['Counting events in an interval (of time, area, length…).', 'A constant rate.', 'Counts in non-overlapping intervals are independent.', 'No two events at the same instant.'],
      mistake: 'Using the rate $r$ directly instead of $\\lambda = rt$ when the interval differs from the unit of the rate.',
    },
    quiz: [
      {
        prompt: 'Which of the following situations is **not** directly suited to a Poisson model?',
        options: [
          { text: 'The number of students attending from a class of 40 registered students.', why: 'Here there are 40 fixed trials (each student attends or not), so the count is capped at 40; this is counting successes in a fixed $n$, closer to the binomial if independence and a constant probability hold.' },
          { text: 'The number of messages reaching a support inbox in an hour, at a constant rate and independently of each other.', why: 'Counting events in an interval with a constant rate and independence: suited to the Poisson.' },
          { text: 'The number of typos on a page of a long book, if typos occur independently at a constant rate per page.', why: 'Counting events in an “area” at a constant rate: suited to the Poisson under these assumptions.' },
          { text: 'The number of cars passing a point in 10 minutes at a quiet time with steady traffic, with cars arriving one at a time.', why: 'Assuming a constant rate, independence and single arrivals, the Poisson fits.' },
        ],
      },
      {
        prompt: 'Calls arrive at a rate of 2 per hour (a Poisson process). What is the probability that no call arrives within an hour and a half?',
        options: [
          { why: '$\\lambda = rt = 2 \\times 1.5 = 3$, and $P(X=0) = e^{-3}$.' },
          { why: 'It used the rate for 1 hour and forgot to multiply by the length of the interval.' },
          { why: 'It used the length of the interval alone, without the rate.' },
          { why: 'The probability of an empty interval is always positive in the Poisson, however small.' },
        ],
      },
      {
        prompt: 'If $X \\sim \\mathrm{Poisson}(9)$, a student said: “The standard deviation equals 9.” What is correct?',
        options: [
          { text: 'The variance equals $9$, while the standard deviation equals $\\sqrt{9} = 3$.', why: 'In the Poisson, the mean = the variance = $\\lambda$, and the standard deviation is the square root of the variance.' },
          { text: 'The statement is right, because every measure equals $\\lambda$.', why: 'Only the mean and the variance equal $\\lambda$.' },
          { text: 'The standard deviation is $81$.', why: 'That is $\\lambda^2$, which has no meaning here.' },
          { text: 'It cannot be known without the number of trials $n$.', why: 'The Poisson has a single parameter, $\\lambda$, which is enough for everything.' },
        ],
      },
    ],
  },

  geometric: {
    question: 'How many trials do we need until the event happens for the first time?',
    formula: {
      fnName: PMF,
      parts: [
        { label: 'The failures before it', explain: 'The first $k-1$ trials are all failures; we multiply their probabilities thanks to independence.' },
        { label: 'The first success', explain: 'Trial number $k$ exactly is the success.' },
      ],
      intuition: [
        'There are no orderings here: the event $X = k$ has only one form: $k-1$ failures in a row, then a success.',
        'Each extra trial multiplies the probability by $(1-p)$, so the bars shrink by a constant ratio; hence the name “geometric” (a geometric sequence).',
      ],
      derivation: [
        'By independence: $P(X=k) = P(\\text{F}_1)\\cdots P(\\text{F}_{k-1})\\,P(\\text{S}_k) = (1-p)^{k-1}p$.',
        'The sum of the probabilities is a geometric series with ratio $q = 1-p$, where $0 < p \\le 1$:',
        undefined,
        'The cumulative distribution function: $P(X \\le k) = 1 - (1-p)^k$, because $X > k$ means the first $k$ trials are all failures.',
        'The mean: using $\\sum_{k\\ge1} k q^{k-1} = 1/(1-q)^2$:',
        undefined,
        'And computing $E[X(X-1)] = 2(1-p)/p^2$, we find:',
      ],
    },
    card: {
      params: [{ meaning: 'The probability of success in each trial, $0 < p \\le 1$.' }],
      fnLabel: PMF,
      conditions: ['Independent trials.', 'Two outcomes per trial.', 'A constant probability of success $p$.', 'We count the trials until the first success (there is no fixed $n$).'],
      mistake: 'Confusing counting the trials (mean $1/p$) with counting the failures before the success (mean $(1-p)/p$).',
    },
    quiz: [
      {
        prompt: 'You are trying to connect to a busy network; each attempt succeeds with probability $0.4$, independently of the others. Which model describes the number of attempts until the first successful connection?',
        options: [
          { text: 'The geometric: $X \\sim \\mathrm{Geom}(0.4)$ with values $1, 2, \\dots$', why: 'We repeat independent attempts with a constant probability and stop at the first success.' },
          { text: 'The binomial $\\mathrm{Bin}(n, 0.4)$', why: 'The binomial needs a number of trials fixed in advance and counts the successes; here there is no fixed $n$.' },
          { text: 'The Bernoulli $\\mathrm{Bernoulli}(0.4)$', why: 'The Bernoulli describes a single trial only.' },
          { text: 'The Poisson', why: 'The Poisson counts events in an interval of time or space, not separate trials until the first success.' },
        ],
      },
      {
        prompt: 'If $X \\sim \\mathrm{Geom}(0.5)$ (the number of trials until the first success), what is $P(X = 3)$?',
        options: [
          { why: '$(1-0.5)^{2}\\times 0.5 = 0.25 \\times 0.5 = 0.125$.' },
          { why: 'That is $P(X \\le 3) = 1 - 0.5^3$, not $P(X = 3)$.' },
          { why: 'That is $(0.5)^4$; it uses 3 failures instead of 2.' },
          { why: 'That is $\\binom{3}{1}(0.5)^3$ from the binomial formula; but here there is only one ordering: F, F, S.' },
        ],
      },
      {
        prompt: 'The probability of success is $p = 0.2$. A student said: “The mean number of trials until the first success is 4.” What do you make of it, using this site’s convention?',
        options: [
          { text: 'Wrong: the mean is $1/p = 5$ trials. The value 4 is the mean number of failures before the success, $(1-p)/p$, which is the other convention.', why: 'The two conventions always differ by exactly one trial: $X = Y + 1$.' },
          { text: 'Right, because $(1-p)/p = 4$.', why: 'That is the formula for the number of failures, not the number of trials.' },
          { text: 'Wrong: the mean is $p = 0.2$.', why: '$p$ is a probability in a single trial, not the mean number of trials.' },
          { text: 'Wrong: the mean is $(1-p)/p^2 = 20$.', why: 'That is the variance, not the mean.' },
        ],
      },
    ],
  },

  exponential: {
    question: 'How long will we wait until the next event happens?',
    formula: {
      fnName: 'Probability density function (PDF)',
      parts: [
        { label: 'The rate', explain: 'The height of the density at $x=0$; the larger the rate, the shorter the wait tends to be.' },
        { label: 'The survival probability', explain: 'It equals $P(X > x)$: the probability that no event occurs in $[0, x]$.' },
      ],
      intuition: [
        'Waiting longer than $x$ means that the number of events in the interval $[0, x]$ is zero. That is a Poisson question with mean $\\theta x$.',
        'The height of a density is not a probability; a probability is an area under the curve over an interval. That is why $f(x)$ can exceed 1 (when $\\theta > 1$) without any contradiction.',
      ],
      derivation: [
        'Let $N(x)$ be the number of events in $[0, x]$ in a homogeneous Poisson process with rate $\\theta$; then $N(x) \\sim \\mathrm{Poisson}(\\theta x)$.',
        undefined,
        'So the cumulative distribution function is $F(x) = 1 - e^{-\\theta x}$ for $x \\ge 0$, and the density is its derivative:',
        undefined,
        'The mean, by integration by parts: $E[X] = \\int_0^\\infty x\\,\\theta e^{-\\theta x}\\,dx = \\dfrac{1}{\\theta}$, and likewise $E[X^2] = \\dfrac{2}{\\theta^2}$, so $\\mathrm{Var}(X) = \\dfrac{2}{\\theta^2} - \\dfrac{1}{\\theta^2} = \\dfrac{1}{\\theta^2}$.',
        'The memoryless property: $P(X > s + x \\mid X > s) = \\dfrac{e^{-\\theta(s+x)}}{e^{-\\theta s}} = e^{-\\theta x}$; the time you have already waited does not change the distribution of what is left.',
      ],
    },
    card: {
      params: [{ meaning: 'The rate: the number of events per unit of time, $\\theta > 0$ (its unit is 1/time).' }],
      fnLabel: 'Probability density function (PDF)',
      conditions: ['A waiting time until the next event.', 'A homogeneous Poisson process (a constant rate).', 'A continuous variable: probability is an area over an interval.'],
      mistake: 'Confusing the rate $\\theta$ with the mean $1/\\theta$, or treating $f(x)$ as a probability.',
    },
    quiz: [
      {
        prompt: 'Requests reach an office as a homogeneous Poisson process at a rate of 3 per hour. The question: “How long will we wait from now until the next request arrives?” Which model fits?',
        options: [
          { text: 'The exponential with rate $\\theta = 3$ per hour.', why: 'We want a continuous waiting time until the next event in a homogeneous Poisson process.' },
          { text: 'The Poisson with mean $\\lambda = 3$.', why: 'The Poisson describes the **number** of requests in a given interval, not the **time** we wait.' },
          { text: 'The geometric.', why: 'The geometric counts separate trials until the first success; time here is continuous.' },
          { text: 'The normal.', why: 'Nothing in the data points to a symmetric bell-shaped model, and time cannot be negative.' },
        ],
      },
      {
        prompt: 'If $X \\sim \\mathrm{Exp}(\\theta = 0.5)$ per minute, what is $P(X > 4)$ (time in minutes)?',
        options: [
          { why: '$P(X > 4) = e^{-0.5 \\times 4} = e^{-2}$.' },
          { why: 'That is $P(X \\le 4)$, the complementary event.' },
          { why: 'It ignores the rate, as if $\\theta = 1$.' },
          { why: 'That is the rate, not a probability.' },
        ],
      },
      {
        prompt: 'For $X \\sim \\mathrm{Exp}(2)$, $f(0) = 2$. A student said: “That is impossible, because a probability cannot exceed 1.” What is correct?',
        options: [
          { text: 'There is no contradiction: $f(0)$ is a density, not a probability. Probability is an area under the curve, and the total area is 1.', why: 'For a continuous variable $P(X = 0) = 0$, and probabilities come from integrating over intervals.' },
          { text: 'The student is right; $\\theta$ must always be at most 1.', why: 'The rate can be any positive number.' },
          { text: '$f(0) = 2$ means that $P(X = 0) = 2$.', why: 'The probability of any single point of a continuous variable is zero.' },
          { text: 'The density must be divided by $\\theta$ to become a probability.', why: 'Dividing does not turn a density into a probability; we need an area over an interval.' },
        ],
      },
    ],
  },

  normal: {
    question: 'What is the probability that a value falls in an interval around the mean?',
    formula: {
      fnName: 'Probability density function (PDF)',
      parts: [
        { label: 'The normalizing constant', explain: 'It makes the total area under the curve 1. The smaller $\\sigma$ is, the higher the peak and the narrower the curve.' },
        { label: 'The bell shape', explain: 'Largest at $z=0$ (at the mean), and falls off quickly and symmetrically as we move away.' },
        { label: 'The standardized distance', explain: 'How many standard deviations $x$ is from the mean. With it we turn any normal distribution into $N(0,1)$.' },
      ],
      intuition: [
        '**An intuitive explanation, not a derivation:** when a value is the result of the sum of many small, independent (or weakly dependent) influences, each with a finite variance and none dominating the rest, the distribution of the sum, once standardized, approaches the normal. That is what the central limit theorem says.',
        'This does **not** mean that any large data set becomes normal. More observations do not change the shape of their distribution; household income, for example, stays skewed however much data there is. The theorem is about the distribution of the **sum or the mean**.',
        'The height of the curve is not a probability. A probability is an area over an interval, and $P(X = x) = 0$ for any single value.',
      ],
      derivation: [
        '**What can easily be proved here:** the total area is 1, using the well-known Gaussian integral $\\int_{-\\infty}^{\\infty} e^{-z^2/2}\\,dz = \\sqrt{2\\pi}$ and the substitution $z = (x-\\mu)/\\sigma$, $dx = \\sigma\\,dz$:',
        undefined,
        'Symmetry about $\\mu$ gives $E[X] = \\mu$, and integration by parts gives $\\mathrm{Var}(X) = \\sigma^2$.',
        'Standardizing: if $X \\sim N(\\mu, \\sigma^2)$ then $Z = (X - \\mu)/\\sigma \\sim N(0, 1)$, and so:',
        undefined,
        'where $\\Phi$ is the cumulative distribution function of the standard normal, which has no closed form in elementary functions; it is computed numerically or read from tables.',
        '**What we do not present here:** why is the shape $e^{-z^2/2}$ exactly the limit of standardized sums? Proving the central limit theorem needs tools beyond an introductory course (such as generating or characteristic functions), and we will not offer an incorrect “simplified derivation” in its place.',
      ],
    },
    card: {
      params: [
        { meaning: 'The mean (the centre of symmetry), in the same units as $X$.' },
        { meaning: 'The standard deviation, $\\sigma > 0$, in the units of $X$. The variance $\\sigma^2$ is in squared units.' },
      ],
      fnLabel: 'Probability density function (PDF)',
      conditions: ['A continuous variable.', 'A symmetric bell-shaped model suits the data (this should be checked).', 'Probability is an area over an interval: $P(a<X<b)$.'],
      mistake: 'Dividing by $\\sigma^2$ instead of $\\sigma$ when computing $z$, or reading $N(500, 16)$ as $\\sigma = 16$.',
    },
    quiz: [
      {
        prompt: 'If $X \\sim N(70, 25)$ is written in the convention $N(\\mu, \\sigma^2)$, what is the standard deviation $\\sigma$?',
        options: [
          { why: 'The second parameter is the variance, $\\sigma^2 = 25$, so $\\sigma = 5$.' },
          { why: 'In the convention used, 25 is the variance, not the standard deviation.' },
          { why: '70 is the mean $\\mu$.' },
          { why: 'That is $25^2$, which has no meaning here.' },
        ],
      },
      {
        prompt: 'If $X \\sim N(500, 4^2)$, what is $P(X < 508)$, approximately?',
        options: [
          { why: '$z = (508 - 500)/4 = 2$, and $\\Phi(2) \\approx 0.9772$.' },
          { why: 'It divides by the variance 16 instead of the standard deviation 4.' },
          { why: 'That is $P(X > 508)$, the right tail.' },
          { why: 'That is the probability of the interval $\\mu \\pm 2\\sigma$ on both sides, not $P(X < \\mu + 2\\sigma)$.' },
        ],
      },
      {
        prompt: 'A student said: “We have 10,000 observations of household income, so income follows a normal distribution by the central limit theorem.” What is correct?',
        options: [
          { text: 'Wrong: the theorem is about the distribution of the sum or mean of independent variables with finite variance, not the shape of the data themselves; more observations do not change the skew of income.', why: 'A larger sample makes the distribution of the **sample mean** closer to normal, but the individual observations keep their distribution.' },
          { text: 'Right: any data with more than 30 observations become normal.', why: 'That is a common but false rule; the data themselves do not turn normal.' },
          { text: 'Right, provided the values are positive.', why: 'Being positive has nothing to do with it; and income is usually skewed to the right.' },
          { text: 'Wrong, because the normal distribution needs at least 100,000 observations.', why: 'The problem is not the number; the number of observations does not decide the shape of their distribution.' },
        ],
      },
    ],
  },
};
