import { useState, type CSSProperties } from 'react';
import { chapters } from '../content/chapters';
import { identity, journey } from '../content/identity';
import { scenarios } from '../content/chooser';
import { sheet, sheetById } from '../content/sheet';
import { FamilyTree } from '../components/FamilyTree';
import { Glyph } from '../components/Glyph';
import { href } from '../lib/router';
import { Tex } from '../components/Tex';
import { moreCards } from '../content/more';
import { matches } from '../lib/search';
import { useLang } from '../lib/lang';
import { Rich } from '../components/Tex';

// ما في ورقة القوانين بلا فصل: يظهر في البحث برابط إلى بطاقته أو الفصل الأقرب
const extras = [
  ...moreCards.map((c) => ({ id: c.id, href: href.more(c.id), note: 'بطاقة في «توزيعات أخرى»', noteEn: 'A card in “Other distributions”' })),
  { id: 'stdnormal' as const, href: href.dist('normal'), note: 'في فصل الطبيعي، مع جدول Φ', noteEn: 'In the normal chapter, with the Φ table' },
];

export function HomePage() {
  const en = useLang() === 'en';
  const [q, setQ] = useState('');
  const shown = journey.filter((id) => matches(q, [sheetById[id].nameAr, sheetById[id].nameEn]));
  const more = q.trim() ? extras.filter((x) => matches(q, [sheetById[x.id].nameAr, sheetById[x.id].nameEn])) : [];
  return (
    <div className="home2">
      <section className="h2-hero">
        {en ? (
          <>
            <h1 tabIndex={-1}>Hikayat Tawzee</h1>
            <p className="h2-slogan">Understand the story, and the formula follows.</p>
            <p className="h2-sub">{journey.length} probability distributions, one family. Each one has a true story: where it came from, why people needed it, and how its formula is built from that story.</p>
            <a className="btn btn-primary" href={href.dist('bernoulli')}>
              Start the journey: Bernoulli's urn →
            </a>
          </>
        ) : (
          <>
            <h1 tabIndex={-1}>حكاية توزيع</h1>
            <p className="h2-slogan">افهم الحكاية… يثبت القانون.</p>
            <p className="h2-sub">{journey.length} توزيعًا احتماليًا، وعائلة واحدة. لكل توزيع حكاية حقيقية: من أين جاء، ولماذا احتاجه الناس، وكيف يُبنى قانونه منها.</p>
            <a className="btn btn-primary" href={href.dist('bernoulli')}>
              ابدأ الرحلة: جرة برنولي ←
            </a>
          </>
        )}
      </section>

      <section className="h2-tree" aria-labelledby="tree-h">
        <h2 id="tree-h">{en ? 'The family tree' : 'شجرة العائلة'}</h2>
        <p className="hint">
          {en
            ? 'Three panels: discrete, then from counting to measuring, then sampling. Tap any arrow to see the relation and its condition, or any distribution to open its chapter.'
            : 'ثلاث لوحات: المتقطعة، ثم من العدّ إلى القياس، ثم المعاينة. اضغط على أي سهم لترى العلاقة وشرطها، أو على أي توزيع لتفتح فصله.'}
        </p>
        <FamilyTree />
      </section>

      <section className="h2-journey" aria-labelledby="j-h">
        <h2 id="j-h">{en ? `The journey: ${journey.length} chapters` : `الرحلة: ${journey.length} فصلًا`}</h2>
        <div className="j-search">
          <label htmlFor="j-q">{en ? 'Search by name' : 'ابحث بالاسم'}</label>
          <input id="j-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={en ? 'e.g. gamma, Poisson, chi' : 'مثل: غاما، Poisson، كاي'} autoComplete="off" aria-describedby="j-count" />
          <span id="j-count" className="hint" role="status">{q.trim() ? (en ? `${shown.length + more.length} results` : `${shown.length + more.length} نتيجة`) : ''}</span>
        </div>
        <ol>
          {shown.map((id) => {
            const i = journey.indexOf(id);
            const d = sheetById[id];
            const story = chapters[id]?.story.headline;
            return (
              <li key={id} style={{ '--c': identity[id].color } as CSSProperties}>
                <a href={href.dist(id)}>
                  <span className="j-n">{i + 1}</span>
                  <Glyph id={id} size={30} />
                  <span className="j-body">
                    {en ? (
                      <>
                        <span className="j-name">
                          {d.nameEn} <span className="en" lang="ar" dir="rtl">{d.nameAr}</span>
                        </span>
                        <Rich className="j-q" text={d.en.when} />
                      </>
                    ) : (
                      <>
                        <span className="j-name">
                          {d.nameAr} <span className="en" lang="en" dir="ltr">{d.nameEn}</span>
                        </span>
                        <span className="j-q">{story ? `${story} · ` : ''}{chapters[id]?.question}</span>
                      </>
                    )}
                  </span>
                </a>
              </li>
            );
          })}
          {more.map((x) => (
            <li key={x.id} style={{ '--c': 'var(--ink-2)' } as CSSProperties}>
              <a href={x.href}>
                <span className="j-body">
                  <span className="j-name">
                    {en ? sheetById[x.id].nameEn : sheetById[x.id].nameAr}{' '}
                    <span className="en" lang={en ? 'ar' : 'en'} dir={en ? 'rtl' : 'ltr'}>{en ? sheetById[x.id].nameAr : sheetById[x.id].nameEn}</span>
                  </span>
                  <span className="j-q">{en ? x.noteEn : x.note}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
        {q.trim() && !shown.length && !more.length && (
          <p className="empty">
            {en ? <>No distribution by that name. Try another word, or open <a href={href.exam}>Exam night</a>.</> : <>ما فيه توزيع بهالاسم. جرّب كلمة ثانية، أو افتح <a href={href.exam}>ليلة الاختبار</a>.</>}
          </p>
        )}
      </section>

      {en ? (
        <section className="h2-tools" aria-labelledby="t-h">
          <h2 id="t-h">Review tools</h2>
          <ul>
            <li>
              <a href={href.exam}>Exam night</a> <span>All the formulas as cards ({sheet.length} distributions): the formula, mean, variance and moment generating function, a chart that identifies the distribution, and the “twins” that are easy to mix up.</span>
            </li>
            <li>
              <a href={href.drill}>Mixed practice</a> <span>Problems from all the chapters together: choose the distribution, then the parameters, then compute.</span>
            </li>
            <li>
              <a href={href.mgf}>The moment generating function</a> <span>Derive the mean and variance from <Tex tex="M_X(t)" /> step by step, and identify a distribution from the form of its function.</span>
            </li>
            <li>
              <a href={href.more()}>Other distributions</a> <span>Weibull, beta and F: a card, an example and a curve for each.</span>
            </li>
            <li>
              <a href={href.choose}>Which distribution?</a> <span>{scenarios.length} situations for telling the distributions apart.</span>
            </li>
            <li>
              <a href={href.cards}>Review cards</a> <span>Test your memory of each formula, mean, variance and condition.</span>
            </li>
          </ul>
        </section>
      ) : (
        <section className="h2-tools" aria-labelledby="t-h">
          <h2 id="t-h">أدوات المراجعة</h2>
          <ul>
            <li>
              <a href={href.exam}>ليلة الاختبار</a> <span>كل القوانين في بطاقات ({sheet.length} توزيعًا): القانون والمتوسط والتباين والدالة المولدة، ومخطط لتحديد التوزيع، و«التوائم» التي يُخلط بينها.</span>
            </li>
            <li>
              <a href={href.drill}>تدريب مختلط</a> <span>مسائل من كل الفصول معًا: اختر التوزيع، ثم المعلمات، ثم احسب.</span>
            </li>
            <li>
              <a href={href.mgf}>الدالة المولدة</a> <span>اشتق المتوسط والتباين من <Tex tex="M_X(t)" /> خطوة خطوة، وتعرّف على التوزيع من شكل دالته.</span>
            </li>
            <li>
              <a href={href.more()}>توزيعات أخرى</a> <span>ويبل وبيتا وF: بطاقة ومثال ومنحنى لكل منها.</span>
            </li>
            <li>
              <a href={href.choose}>أي توزيع أختار؟</a> <span>{scenarios.length} موقفًا للتمييز بين التوزيعات.</span>
            </li>
            <li>
              <a href={href.cards}>بطاقات المراجعة</a> <span>اختبر ذاكرتك في القانون والمتوسط والتباين والشروط.</span>
            </li>
          </ul>
        </section>
      )}
    </div>
  );
}
