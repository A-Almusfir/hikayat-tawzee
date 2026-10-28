export interface Reference {
  title: string;
  url: string;
  usedFor: string;
}

// مصادر استُخدمت فعلًا للتحقق من الاصطلاحات والصيغ. انظر صفحة «المراجع والمنهج» لطريقة التحقق وحدوده.
export const references: Reference[] = [
  {
    title: 'OpenStax — Introductory Statistics 2e, Chapter 4 Formula Review',
    url: 'https://openstax.org/books/introductory-statistics-2e/pages/4-formula-review',
    usedFor: 'تعريف المتغير الهندسي بأنه عدد المحاولات المستقلة حتى أول نجاح، وصيغ التوزيعات المتقطعة.',
  },
  {
    title: 'OpenStax — Introductory Business Statistics, 4.3 Geometric Distribution',
    url: 'https://openstax.org/books/introductory-business-statistics/pages/4-3-geometric-distribution',
    usedFor: 'متوسط الهندسي $1/p$ وتباينه $(1-p)/p^2$، والتنبيه إلى اختلاف المتوسط عند عدّ الإخفاقات.',
  },
  {
    title: 'MathWorks — geostat (Statistics and Machine Learning Toolbox)',
    url: 'https://www.mathworks.com/help/stats/geostat.html',
    usedFor: 'مثال على الاصطلاح الآخر (عدد الإخفاقات قبل أول نجاح) بمتوسط $(1-p)/p$.',
  },
  {
    title: 'MathWorks — binostat',
    url: 'https://www.mathworks.com/help/stats/binostat.html',
    usedFor: 'متوسط ذي الحدين $np$ وتباينه $np(1-p)$.',
  },
  {
    title: 'LibreTexts — Introductory Statistics (Lane), 5.9 Poisson Distribution',
    url: 'https://stats.libretexts.org/Bookshelves/Introductory_Statistics/Introductory_Statistics_(Lane)/05%3A_Probability/5.09%3A_Poisson_Distribution',
    usedFor: 'قانون بواسون وتساوي المتوسط والتباين.',
  },
  {
    title: 'LibreTexts — Discrete Stochastic Processes (Gallager), 2.2 Definition and Properties of a Poisson Process',
    url: 'https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Signal_Processing_and_Modeling/Discrete_Stochastic_Processes_(Gallager)/02%3A_Poisson_Processes/2.02%3A_Definition_and_Properties_of_a_Poisson_Process',
    usedFor: 'تعريف عملية بواسون بفترات انتظار أسية بمعدل $\\lambda$، وأن $\\lambda t$ متوسط عدد الأحداث في فترة طولها $t$.',
  },
  {
    title: 'Random Services (K. Siegrist, University of Alabama in Huntsville) — The Exponential Distribution',
    url: 'https://www.randomservices.org/random/poisson/Exponential.html',
    usedFor: 'الأسي بمعامل معدل: المتوسط $1/r$ والتباين $1/r^2$، وعلاقته بعملية بواسون.',
  },
  {
    title: 'NIST/SEMATECH e-Handbook of Statistical Methods — Normal Distribution (1.3.6.6.1)',
    url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm',
    usedFor: 'كثافة الطبيعي بمعلمة موقع $\\mu$ ومعلمة قياس $\\sigma$ (انحراف معياري)، وأن دالة التوزيع التراكمية تُحسب عدديًا.',
  },
  {
    title: 'StatLect — Central Limit Theorem',
    url: 'https://www.statlect.com/asymptotic-theory/central-limit-theorem',
    usedFor: 'صيغة مبرهنة النهاية المركزية وشروطها (الاستقلال وتماثل التوزيع والتباين المحدود، ونسخ ليندبرغ/ليابونوف المعمّمة).',
  },
];
