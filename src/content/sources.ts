// سجل المصادر. كل جملة تاريخية في الفصول تحمل معرّف مصدر من هنا، والاختبارات تفشل إن لم يوجد.
// verified: كيف تحققنا منه أثناء الإعداد (لم يكن فتح الصفحات مباشرة متاحًا دائمًا من بيئة العمل).
export interface Source {
  id: string;
  cite: string;
  url: string;
  verified: 'search-snippet' | 'multiple-search-snippets';
}

export const sources: Source[] = [
  {
    id: 'bortkiewicz-york',
    cite: 'L. von Bortkiewicz (1898), Das Gesetz der kleinen Zahlen — جدول البيانات الأصلي (University of York, History of Statistics)',
    url: 'https://www.york.ac.uk/depts/maths/histstat/bortkiewicz.htm',
    verified: 'search-snippet',
  },
  {
    id: 'horsekicks-cran',
    cite: 'Horsekicks R package (W. Venables) — vignette: Deaths by horse-kick in the Prussian army',
    url: 'https://archive.linux.duke.edu/cran/web/packages/Horsekicks/vignettes/hkdeaths.html',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'ddpm-edeath',
    cite: 'DDPM R package — data_edeath: Horse-kicks deaths (200 corps-years, excluding corps G, I, VI, XI; after Preece, Ross & Kirby 1988)',
    url: 'https://search.r-project.org/CRAN/refmans/DDPM/html/data_edeath.html',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'bortkiewicz-mactutor',
    cite: 'MacTutor History of Mathematics — Ladislaus Josephowitsch Bortkiewicz',
    url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Bortkiewicz',
    verified: 'search-snippet',
  },
  {
    id: 'demoivre-poisson-arxiv',
    cite: 'The distribution of the de Moivre experiment (arXiv:2606.15178) — Poisson 1837 Recherches…, ch. 8: limit of the binomial; de Moivre earlier (De Mensura Sortis)',
    url: 'https://arxiv.org/pdf/2606.15178',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'stigler1982',
    cite: 'S. M. Stigler (1982), Poisson on the Poisson distribution, Statistics & Probability Letters 1(1): 33–35 — ترجمة نص بواسون 1837 مع إشارة إلى عمل دي موافر السابق',
    url: 'https://ideas.repec.org/a/eee/stapro/v1y1982i1p33-35.html',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'poisson-eom',
    cite: 'Encyclopedia of Mathematics — Poisson, Siméon-Denis',
    url: 'https://encyclopediaofmath.org/wiki/Poisson,_Simeon-Denis',
    verified: 'search-snippet',
  },
  {
    id: 'lecam',
    cite: 'The Poisson binomial distribution — Old & New (arXiv:1908.10024): متباينة لو كام',
    url: 'https://arxiv.org/pdf/1908.10024',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'ars-conjectandi',
    cite: 'Wikipedia — Ars Conjectandi (نُشر 1713 بعد وفاة ياكوب برنولي؛ قانون الأعداد الكبيرة في الجزء الرابع)',
    url: 'https://en.wikipedia.org/wiki/Ars_Conjectandi',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'bernoulli-eom',
    cite: 'Encyclopedia of Mathematics — Bernoulli, Jakob',
    url: 'https://encyclopediaofmath.org/wiki/Bernoulli,_Jakob',
    verified: 'search-snippet',
  },
  {
    id: 'urn-problem',
    cite: 'Wikipedia — Urn problem (جرة برنولي في Ars Conjectandi)',
    url: 'https://en.wikipedia.org/wiki/Urn_problem',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'bernoulli-urn-unibo',
    cite: 'Rivista di Statistica (Università di Bologna) — شرح مثال جرة برنولي: 3000 بيضاء و2000 سوداء مع الإرجاع',
    url: 'https://rivista-statistica.unibo.it/article/download/6029/5802/17778',
    verified: 'search-snippet',
  },
  {
    id: 'points-wiki',
    cite: 'Wikipedia — Problem of points (باسكال وفيرما 1654؛ باتشولي 1494؛ غومبو)',
    url: 'https://en.wikipedia.org/wiki/Problem_of_points',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'points-aps',
    cite: 'APS News (2009) — July 1654: Pascal\'s letters to Fermat on the Problem of Points',
    url: 'https://www.aps.org/apsnews/2009/07/pascal-letters-fermat-points',
    verified: 'search-snippet',
  },
  {
    id: 'samawal-mactutor',
    cite: 'MacTutor — Al-Samawal (حفظ عمل الكرجي في المعاملات)',
    url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Al-Samawal/',
    verified: 'search-snippet',
  },
  {
    id: 'karaji-wiki',
    cite: 'Wikipedia — Al-Karaji',
    url: 'https://en.wikipedia.org/wiki/Al-Karaji',
    verified: 'search-snippet',
  },
  {
    id: 'erlang-mactutor',
    cite: 'MacTutor — Agner Krarup Erlang (ورقة 1909: المكالمات العشوائية تتبع بواسون؛ ورقة 1917)',
    url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Erlang/',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'erlang-plus',
    cite: 'Plus Magazine — Agner Krarup Erlang (1878–1929)',
    url: 'https://plus.maths.org/content/node/2154',
    verified: 'search-snippet',
  },
  {
    id: 'erlang-wiki',
    cite: 'Wikipedia — Agner Krarup Erlang',
    url: 'https://en.wikipedia.org/wiki/Agner_Krarup_Erlang',
    verified: 'search-snippet',
  },
  {
    id: 'poisson-process-libretexts',
    cite: 'LibreTexts — Discrete Stochastic Processes (Gallager), 2.2 Poisson Process: فترات انتظار أسية بمعدل λ',
    url: 'https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Signal_Processing_and_Modeling/Discrete_Stochastic_Processes_(Gallager)/02%3A_Poisson_Processes/2.02%3A_Definition_and_Properties_of_a_Poisson_Process',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'gambler-wiki',
    cite: "Wikipedia — Gambler's fallacy (مونت كارلو، 18 أغسطس 1913، الأسود 26 مرة)",
    url: 'https://en.wikipedia.org/wiki/Gambler%27s_fallacy',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'montecarlo-mja',
    cite: 'Medical Journal of Australia (2011) — The Monte Carlo fallacy',
    url: 'https://www.mja.com.au/journal/2011/195/7/monte-carlo-fallacy',
    verified: 'search-snippet',
  },
  {
    id: 'geometric-eom',
    cite: 'Encyclopedia of Mathematics — Geometric distribution',
    url: 'https://encyclopediaofmath.org/wiki/Geometric_distribution',
    verified: 'search-snippet',
  },
  {
    id: 'geostat-mathworks',
    cite: 'MathWorks — geostat (الاصطلاح الآخر: عدد الإخفاقات قبل أول نجاح)',
    url: 'https://www.mathworks.com/help/stats/geostat.html',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'demoivre-dsb',
    cite: 'MacTutor / Dictionary of Scientific Biography — De Moivre (ورقة 12 نوفمبر 1733، حالة p = 1/2، عقيدة الفرص 1738)',
    url: 'https://mathshistory.st-andrews.ac.uk/DSB/De_Moivre.pdf',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'normal-history-lane',
    cite: 'LibreTexts — Introductory Statistics (Lane), 7.2 History of the Normal Distribution',
    url: 'https://stats.libretexts.org/Bookshelves/Introductory_Statistics/Introductory_Statistics_(Lane)/07%3A_Normal_Distribution/7.02%3A_History_of_the_Normal_Distribution',
    verified: 'search-snippet',
  },
  {
    id: 'galton-wiki',
    cite: 'Wikipedia — Galton board',
    url: 'https://en.wikipedia.org/wiki/Galton_board',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'galton-ni',
    cite: 'galton.org — Natural Inheritance (1889)',
    url: 'https://galton.org/books/natural-inheritance/',
    verified: 'search-snippet',
  },
  {
    id: 'clt-statlect',
    cite: 'StatLect — Central Limit Theorem',
    url: 'https://www.statlect.com/asymptotic-theory/central-limit-theorem',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'tea-wiki',
    cite: 'Lady tasting tea — Wikipedia (تجربة فيشر في The Design of Experiments, 1935، واختبار فيشر الدقيق)',
    url: 'https://en.wikipedia.org/wiki/Lady_tasting_tea',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'tea-uprm',
    cite: 'W. Rolke, University of Puerto Rico — The Lady tasting tea (ثمانية أكواب، و70 اختيارًا متساوي الاحتمال)',
    url: 'https://academic.uprm.edu/wrolke/esma3015/lady-tea.html',
    verified: 'search-snippet',
  },
  {
    id: 'muriel-bristol-wiki',
    cite: 'Muriel Bristol — Wikipedia (السيدة في التجربة، واقتراح وليم روتش، وعدم نشر النتيجة)',
    url: 'https://en.wikipedia.org/wiki/Muriel_Bristol',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'sheynin-history',
    cite: 'O. Sheynin — Theory of Probability: A Historical Essay (arXiv:1802.09966)؛ عن مونمور وذي الحدين السالب في مسألة النقاط، بالإحالة إلى Hald (1990)',
    url: 'https://arxiv.org/pdf/1802.09966',
    verified: 'search-snippet',
  },
  {
    id: 'montmort-1713',
    cite: 'On an identity by Chaundy and Bullard II: More history (arXiv:1205.6362)؛ الطبعة الثانية من Essay d’analyse sur les jeux de hazard لمونمور (1713) وحلها الجديد لمسألة النقاط',
    url: 'https://arxiv.org/pdf/1205.6362',
    verified: 'search-snippet',
  },
  {
    id: 'greenwood-utah',
    cite: 'A. Treibergs, University of Utah — Munitions accidents example (Greenwood & Yule 1920: متوسط 0.47 وتباين 0.69)',
    url: 'https://www2.math.utah.edu/~treiberg/M3074MunitionsEg.pdf',
    verified: 'search-snippet',
  },
  {
    id: 'erlang-eom',
    cite: 'Encyclopedia of Mathematics — Erlang, Agner Krarup (طريقة «المراحل المتتالية»، وتوزيع إرلانغ مجموعًا لمتغيرات أسية مستقلة متماثلة)',
    url: 'https://encyclopediaofmath.org/wiki/Erlang,_Agner_Krarup',
    verified: 'search-snippet',
  },
  {
    id: 'informs-queueing',
    cite: 'INFORMS — Queueing Models (History of O.R.)',
    url: 'https://www.informs.org/Explore/History-of-O.R.-Excellence/O.R.-Methodologies/Queueing-Models',
    verified: 'search-snippet',
  },
  {
    id: 'fisher-history-mactutor',
    cite: 'MacTutor — R. A. Fisher: History of Statistics (توزيع مربع كاي: أصله عند هلمرت، وأعاد بيرسون اكتشافه عام 1900)',
    url: 'https://mathshistory.st-andrews.ac.uk/Extras/Fisher_Statistics_History',
    verified: 'search-snippet',
  },
  {
    id: 'helmert-wiki',
    cite: 'Friedrich Robert Helmert — Wikipedia (اكتشافه توزيع مربع كاي عام 1876)',
    url: 'https://en.wikipedia.org/wiki/Friedrich_Robert_Helmert',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'gosset-wiki',
    cite: 'William Sealy Gosset — Wikipedia («Student»، مصنع غينيس، The Probable Error of a Mean, Biometrika 1908)',
    url: 'https://en.wikipedia.org/wiki/William_Sealy_Gosset',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'gosset-eom',
    cite: 'Encyclopedia of Mathematics — Gosset, William Sealy',
    url: 'https://encyclopediaofmath.org/wiki/Gosset,_William_Sealy',
    verified: 'search-snippet',
  },
  {
    id: 'gosset-usu',
    cite: 'Utah State University, History of Statistics — William Sealy Gosset',
    url: 'https://www.usu.edu/math/schneit/StatsHistory/ModernStatisticians/Gosset',
    verified: 'search-snippet',
  },
  {
    id: 'buffon-eom',
    cite: 'Encyclopedia of Mathematics — Buffon problem (إبرة طولها l وخطوط متوازية بينها d ≥ l: الاحتمال 2l/(πd))',
    url: 'https://encyclopediaofmath.org/wiki/Buffon_problem',
    verified: 'multiple-search-snippets',
  },
  {
    id: 'buffon-proofwiki',
    cite: 'ProofWiki — Buffon’s Needle: Historical Note (Essai d’arithmétique morale, 1777؛ ولابلاس وتقدير π)',
    url: 'https://proofwiki.org/wiki/Buffon%27s_Needle/Historical_Note',
    verified: 'search-snippet',
  },
  {
    id: 'buffon-laplace-mathworld',
    cite: 'Wolfram MathWorld — Buffon–Laplace Needle Problem (حل بوفون للشبكة المتعامدة فيه خطأ، وصححه لابلاس 1812)',
    url: 'https://mathworld.wolfram.com/Buffon-LaplaceNeedleProblem.html',
    verified: 'search-snippet',
  },
  {
    id: 'weibull-wiki',
    cite: 'Waloddi Weibull — Wikipedia (ورقته في متانة المواد 1951، وسبق Rosin وRammler عام 1933)',
    url: 'https://en.wikipedia.org/wiki/Waloddi_Weibull',
    verified: 'search-snippet',
  },
  {
    id: 'bayes-essay-wiki',
    cite: 'An Essay Towards Solving a Problem in the Doctrine of Chances — Wikipedia (مقالة بايز، نُشرت 1763 بعد وفاته)',
    url: 'https://en.wikipedia.org/wiki/An_Essay_Towards_Solving_a_Problem_in_the_Doctrine_of_Chances',
    verified: 'search-snippet',
  },
  {
    id: 'f-proofwiki',
    cite: 'ProofWiki — F-Distribution: Historical Note (إحصاءة z عند فيشر 1924، وتسمية سنيدكور F عام 1934)',
    url: 'https://proofwiki.org/wiki/Definition:F-Distribution/Historical_Note',
    verified: 'search-snippet',
  },
];

export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s])) as Record<string, Source>;
