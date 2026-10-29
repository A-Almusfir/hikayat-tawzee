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
    id: 'poisson-eom',
    cite: 'Encyclopedia of Mathematics — Poisson, Siméon-Denis',
    url: 'https://encyclopediaofmath.org/wiki/Poisson,_Simeon-Denis',
    verified: 'search-snippet',
  },
  {
    id: 'lecam',
    cite: "Le Cam's inequality: Σ_k |P(S=k) − e^{−λ}λ^k/k!| ≤ 2 Σ p_i² (e.g. The Poisson binomial distribution — Old & New, arXiv:1908.10024)",
    url: 'https://arxiv.org/pdf/1908.10024',
    verified: 'multiple-search-snippets',
  },
];

export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s])) as Record<string, Source>;
