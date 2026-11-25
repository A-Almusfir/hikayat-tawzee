import type { Tr } from '../../lib/i18n';
import type { mgfRules } from '../mgf';
import type { choiceLabels } from '../chooser';
import type { hint } from '../decision';
import type { references } from '../references';

// ترجمة المجموعات الصغيرة: قواعد الدالة المولدة، وأسماء الخيارات، وتلميحات مخطط القرار، والمراجع.

export const mgfRulesEn: Tr<typeof mgfRules> = [
  { title: 'The definition', text: 'The MGF is the mean of $e^{tX}$. At $t = 0$ it always equals $1$, which is a quick check on any formula you write.' },
  { title: 'Moments by differentiation', text: 'Differentiate, then substitute $t = 0$. The first derivative gives the mean, and the second gives $E(X^2)$, not the variance; subtract the square of the mean.' },
  { title: 'The logarithm trick', text: 'If $M$ is an exponential or a power (Poisson, normal, gamma, chi-square), differentiate $R(t) = \\ln M_X(t)$ instead: its second derivative at zero is **the variance directly**, with no subtraction.' },
  { title: 'A linear transformation', text: 'Example: $X \\sim \\mathrm{Poisson}(3)$ and $Y = 2X + 1$; then $M_Y(t) = e^{t}\\,e^{3(e^{2t}-1)}$, which gives $E(Y) = 7$ and $\\mathrm{Var}(Y) = 12$.' },
  { title: 'A sum of independent variables', text: 'Only under **independence**. Example: the sum of $r$ independent geometric variables with the same $p$ has the MGF $\\left(\\frac{pe^{t}}{1-qe^{t}}\\right)^{r}$, which is the MGF of the negative binomial.' },
  { title: 'Uniqueness', text: 'If the MGF exists on an interval around zero, it determines the distribution completely. That is why we can recognize a distribution from the form of $M(t)$. The t and F distributions have no MGF, so this method does not work for them.' },
];

export const choiceLabelsEn: Tr<typeof choiceLabels> = {
  bernoulli: 'Bernoulli',
  binomial: 'Binomial',
  hypergeometric: 'Hypergeometric',
  geometric: 'Geometric',
  negbin: 'Negative binomial',
  poisson: 'Poisson',
  exponential: 'Exponential',
  gamma: 'Gamma',
  uniform: 'Uniform',
  chisquare: 'Chi-square',
  t: 't (Student)',
  normal: 'Normal',
  insufficient: 'The data or conditions are not enough',
};

export const hintEn: Tr<typeof hint> = {
  bernoulli: 'A single trial with two outcomes.',
  binomial: 'A fixed number $n$ of independent trials with a constant probability $p$; we count the successes.',
  hypergeometric: 'We draw $n$ without replacement from a finite population with $k$ “successes”, and count the successes drawn.',
  geometric: 'We repeat independent trials until the first success, and count the trials.',
  negbin: 'We repeat independent trials until success number $r$, and count the trials.',
  poisson: 'We count events in an interval (of time or space) at a constant rate, with no set number of trials.',
  exponential: 'A continuous waiting time until the next event in a Poisson process: random, independent events at a constant rate.',
  gamma: 'A continuous waiting time until event number $\\alpha$ in a Poisson process (the sum of $\\alpha$ independent exponential waits).',
  normal: 'A continuous, bell-shaped measurement, symmetric about a mean, where the data support it. It is also used as a computational approximation to the binomial (when $np$ and $n(1-p)$ are both large, with a continuity correction) or to a sum of many independent variables. The mean of a sample from a normal population is also normal, and when $\\sigma$ is **known**, $\\frac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}$ is standard normal.',
  uniform: 'A continuous measurement on a given interval $(a, b)$, where all parts of equal length are equally likely.',
  chisquare: 'A sum of squares of independent standard normal variables; behind $\\frac{(n-1)S^{2}}{\\sigma^{2}}$ and the goodness-of-fit test $\\sum \\frac{(O-E)^{2}}{E}$.',
  t: 'The mean of a sample from a normal population when $\\sigma$ is unknown and we use $S$: $\\frac{\\bar{X} - \\mu}{S/\\sqrt{n}}$.',
  insufficient: 'The conditions are broken (such as a changing rate, or trials that affect one another) or the situation is outside the distributions covered, so none of them applies without changes.',
};

export const decisionNoteEn = 'And in every branch: check the conditions (independence, a constant probability or rate). If they are broken, the answer is “the data or conditions are not enough”.';

export const referencesEn: Tr<typeof references> = [
  { usedFor: 'Defining the geometric variable as the number of independent trials until the first success, and the formulas of the discrete distributions.' },
  { usedFor: 'The mean of the geometric, $1/p$, and its variance $(1-p)/p^2$, and the warning that the mean differs when counting failures.' },
  { usedFor: 'An example of the other convention (the number of failures before the first success), with mean $(1-p)/p$.' },
  { usedFor: 'The binomial mean $np$ and variance $np(1-p)$.' },
  { usedFor: 'The Poisson formula, and the equality of its mean and variance.' },
  { usedFor: 'Defining the Poisson process through exponential waiting times with rate $\\lambda$, and $\\lambda t$ as the mean number of events in an interval of length $t$.' },
  { usedFor: 'The exponential with a rate parameter: mean $1/r$ and variance $1/r^2$, and its link to the Poisson process.' },
  { usedFor: 'The normal density with location parameter $\\mu$ and scale parameter $\\sigma$ (the standard deviation), and the fact that its CDF is computed numerically.' },
  { usedFor: 'The statement of the central limit theorem and its conditions (independence, identical distribution and finite variance, and the generalized Lindeberg/Lyapunov versions).' },
];
