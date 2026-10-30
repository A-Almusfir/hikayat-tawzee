import type { CSSProperties } from 'react';
import { chapters } from '../content/chapters';
import { identity, journey } from '../content/identity';
import { scenarios } from '../content/chooser';
import { sheet, sheetById } from '../content/sheet';
import { FamilyTree } from '../components/FamilyTree';
import { Glyph } from '../components/Glyph';
import { href } from '../lib/router';
import { Tex } from '../components/Tex';

export function HomePage() {
  return (
    <div className="home2">
      <section className="h2-hero">
        <h1 tabIndex={-1}>حكاية توزيع</h1>
        <p className="h2-slogan">افهم الحكاية… يثبت القانون.</p>
        <p className="h2-sub">{journey.length} توزيعات احتمالية، وعائلة واحدة. لكل توزيع حكاية حقيقية: من أين جاء، ولماذا احتاجه الناس، وكيف يُبنى قانونه منها.</p>
        <a className="btn btn-primary" href={href.dist('bernoulli')}>
          ابدأ الرحلة: جرة برنولي ←
        </a>
      </section>

      <section className="h2-tree" aria-labelledby="tree-h">
        <h2 id="tree-h">شجرة العائلة</h2>
        <p className="hint">اضغط على أي سهم لترى العلاقة وشرطها، أو على أي توزيع لتفتح فصله.</p>
        <FamilyTree />
      </section>

      <section className="h2-journey" aria-labelledby="j-h">
        <h2 id="j-h">الرحلة: {journey.length} فصول</h2>
        <ol>
          {journey.map((id, i) => {
            const d = sheetById[id];
            const story = chapters[id]?.story.headline;
            return (
              <li key={id} style={{ '--c': identity[id].color } as CSSProperties}>
                <a href={href.dist(id)}>
                  <span className="j-n">{i + 1}</span>
                  <Glyph id={id} size={30} />
                  <span className="j-body">
                    <span className="j-name">
                      {d.nameAr} <span className="en" lang="en" dir="ltr">{d.nameEn}</span>
                    </span>
                    <span className="j-q">{story ? `${story} · ` : ''}{chapters[id]?.question}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="h2-tools" aria-labelledby="t-h">
        <h2 id="t-h">أدوات المراجعة</h2>
        <ul>
          <li>
            <a href={href.exam}>ليلة الاختبار</a> <span>ورقة القوانين كاملة ({sheet.filter((s) => !s.extra).length} توزيعًا) مع تنبيهات على ما ينقصها، ومخطط لتحديد التوزيع، و«التوائم» التي يُخلط بينها.</span>
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
    </div>
  );
}
