import { sheetById, type SheetId } from '../content/sheet';
import { Rich, Tex } from './Tex';
import { useLang } from '../lib/lang';

/** بطاقة توزيع مبنية من ورقة القوانين نفسها (للفصول التي لا بطاقة قديمة لها). */
export function SheetCard({ id }: { id: SheetId }) {
  const s = sheetById[id];
  const en = useLang() === 'en';
  return (
    <div className="dcard">
      <div className="dcard-head">
        <strong>{en ? s.nameEn : s.nameAr}</strong>{' '}
        <span className="en" lang={en ? 'ar' : 'en'} dir={en ? 'rtl' : 'ltr'}>{en ? s.nameAr : s.nameEn}</span>
        <span className="tag">{en ? (s.group === 'discrete' ? 'discrete' : 'continuous') : s.group === 'discrete' ? 'متقطع' : 'مستمر'}</span>
      </div>
      <dl className="dcard-grid">
        <dt>{en ? 'Parameters' : 'المعلمات'}</dt>
        <dd><Rich text={en ? s.en.params : s.params} /></dd>
        <dt>{en ? 'Formula' : 'القانون'}</dt>
        <dd><Tex tex={s.f} display /></dd>
        <dt>{en ? 'Support' : 'المجال'}</dt>
        <dd><Tex tex={s.support} /></dd>
        <dt>{en ? 'Mean' : 'المتوسط'}</dt>
        <dd><Tex tex={s.mean} /></dd>
        <dt>{en ? 'Variance' : 'التباين'}</dt>
        <dd><Tex tex={s.variance} /></dd>
        <dt>{en ? 'MGF' : 'الدالة المولدة'}</dt>
        <dd>
          {s.mgf.kind === 'closed' ? (
            <>
              <Tex tex={s.mgf.tex} /> <Rich text={`(${en ? s.en.mgf : s.mgf.domain})`} />
            </>
          ) : en ? (
            <Rich text={`**${s.mgf.kind === 'none' ? 'Does not exist' : 'No simple closed form'}.** ${s.en.mgf}`} />
          ) : (
            <Rich text={`**${s.mgf.kind === 'none' ? 'غير موجودة' : 'بلا صيغة بسيطة'}:** ${s.mgf.note}`} />
          )}
        </dd>
        {s.cdf && (
          <>
            <dt>{en ? 'CDF' : 'التراكمي'}</dt>
            <dd>{s.cdf.kind === 'closed' ? <Tex tex={s.cdf.tex} /> : <Rich text={en ? s.en.cdf! : s.cdf.note} />}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
