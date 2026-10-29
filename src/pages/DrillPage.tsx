import { useMemo, useState } from 'react';
import type { Choice } from '../content/chapterTypes';
import { chapters } from '../content/chapters';
import { choiceLabels } from '../content/chooser';
import { hint, type Leaf } from '../content/decision';
import { drill, type DrillItem } from '../content/drill';
import { ChoiceCheck } from '../components/scenes/ChoiceCheck';
import { Rich } from '../components/Tex';
import { href } from '../lib/router';
import { useProgress } from '../lib/storage';

const ORDER: Leaf[] = ['bernoulli', 'binomial', 'geometric', 'poisson', 'exponential', 'normal', 'insufficient'];

/** الخطوة الأولى: أي توزيع؟ تفسير الخيارات الخاطئة يأتي من مخطط القرار (مصدر واحد). */
function step1(item: DrillItem): Choice {
  return {
    prompt: 'أي توزيع يناسب؟',
    options: ORDER.map((l) => ({
      text: choiceLabels[l],
      correct: l === item.answer,
      why: l === item.answer ? item.why : l === item.trap ? item.trapWhy : `هذا يناسب موقفًا آخر: ${hint[l]}`,
    })),
  };
}

const isDone = (it: DrillItem, quiz: Record<string, number>) => quiz[`${it.id}-${it.calc ? 3 : 1}`] !== undefined;

export function DrillPage() {
  const quiz = useProgress().quiz;
  const [mode, setMode] = useState<'all' | 'review'>('all');
  const [idx, setIdx] = useState(0);
  const [seed, setSeed] = useState(0);

  // الفصول المنتهية: أُجيب فيها عن سؤال استرجاع واحد على الأقل
  const finished = useMemo(
    () => Object.values(chapters).filter((ch) => ch && ch.anchor.recall.some((q) => quiz[q.id] !== undefined)).map((ch) => ch!.id),
    [quiz],
  );
  const list = useMemo(() => {
    if (mode === 'all') return drill;
    const pool = drill.filter((d) => d.answer === 'insufficient' || finished.includes(d.answer));
    // ثلاث مسائل عشوائية؛ seed يعيد الاختيار
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, seed, finished.join()]);
  const i = Math.min(idx, Math.max(0, list.length - 1));
  const it = list[i];
  const done = list.filter((d) => isDone(d, quiz)).length;

  return (
    <article className="drill">
      <header className="page-head">
        <h1 tabIndex={-1}>تدريب مختلط</h1>
        <p className="lead">مسائل من التوزيعات الستة معًا، كما في الاختبار. لكل مسألة ثلاث خطوات: أي توزيع؟ ثم المعلمات، ثم الحساب.</p>
      </header>
      <div className="seg-tabs" role="group" aria-label="نوع التدريب">
        <button type="button" className={`seg-tab ${mode === 'all' ? 'on' : ''}`} aria-pressed={mode === 'all'} onClick={() => (setMode('all'), setIdx(0))}>
          كل المسائل ({drill.length})
        </button>
        <button type="button" className={`seg-tab ${mode === 'review' ? 'on' : ''}`} aria-pressed={mode === 'review'} onClick={() => (setMode('review'), setIdx(0), setSeed(seed + 1))}>
          راجع اليوم: 3 مسائل من فصولك المنتهية
        </button>
      </div>

      {mode === 'review' && finished.length === 0 ? (
        <p className="empty">
          لم تُنهِ أي فصل بعد. أجب عن أسئلة «ثبّت» في نهاية أي فصل، ثم عد إلى هنا. <a href={href.dist('bernoulli')}>ابدأ من الفصل الأول</a>.
        </p>
      ) : it ? (
        <>
          <div className="progress-line">
            <span>المسألة {i + 1} من {list.length}</span>
            <span>أنهيت: {done} من {list.length}</span>
          </div>
          <div className="progress-bar" role="progressbar" aria-label="التقدم" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={done}>
            <span style={{ width: `${(done / list.length) * 100}%` }} />
          </div>
          <DrillCard key={it.id} it={it} />
          <div className="pager">
            <button type="button" className="btn" disabled={i === 0} onClick={() => setIdx(i - 1)}>→ السابقة</button>
            {mode === 'review' && i === list.length - 1 ? (
              <button type="button" className="btn" onClick={() => (setSeed(seed + 1), setIdx(0))}>3 مسائل أخرى ←</button>
            ) : (
              <button type="button" className="btn" disabled={i === list.length - 1} onClick={() => setIdx(i + 1)}>التالية ←</button>
            )}
          </div>
          <p className="hint">
            تحتاج تذكيرًا؟ <a href={href.exam}>ليلة الاختبار</a> فيها مخطط القرار والجدول.
          </p>
        </>
      ) : null}
    </article>
  );
}

function DrillCard({ it }: { it: DrillItem }) {
  const quiz = useProgress().quiz;
  const s1 = quiz[`${it.id}-1`] !== undefined;
  const s2 = quiz[`${it.id}-2`] !== undefined;
  return (
    <div className="drill-card">
      <Rich as="p" className="scenario" text={it.text} />
      <ChoiceCheck id={`${it.id}-1`} q={step1(it)} kicker="الخطوة 1 · أي توزيع؟" />
      {s1 && it.param && <ChoiceCheck id={`${it.id}-2`} q={it.param} kicker="الخطوة 2 · المعلمات" />}
      {s1 && s2 && it.calc && <ChoiceCheck id={`${it.id}-3`} q={it.calc} kicker="الخطوة 3 · الحساب" />}
      {s1 && !it.param && <p className="hint">هذه المسألة تنتهي عند الخطوة الأولى: الشروط لا تسمح باختيار أي من الستة.</p>}
    </div>
  );
}
