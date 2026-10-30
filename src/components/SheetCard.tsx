import { sheetById, type SheetId } from '../content/sheet';
import { Rich, Tex } from './Tex';

/** بطاقة توزيع مبنية من ورقة القوانين نفسها (للفصول التي لا بطاقة قديمة لها). */
export function SheetCard({ id }: { id: SheetId }) {
  const s = sheetById[id];
  return (
    <div className="dcard">
      <div className="dcard-head">
        <strong>{s.nameAr}</strong> <span className="en" lang="en" dir="ltr">{s.nameEn}</span>
        <span className="tag">{s.group === 'discrete' ? 'متقطع' : 'مستمر'}</span>
      </div>
      <dl className="dcard-grid">
        <dt>المعلمات</dt>
        <dd><Rich text={s.params} /></dd>
        <dt>القانون</dt>
        <dd><Tex tex={s.f} display /></dd>
        <dt>المجال</dt>
        <dd><Tex tex={s.support} /></dd>
        <dt>المتوسط</dt>
        <dd><Tex tex={s.mean} /></dd>
        <dt>التباين</dt>
        <dd><Tex tex={s.variance} /></dd>
        <dt>الدالة المولدة</dt>
        <dd>
          {s.mgf.kind === 'closed' ? (
            <>
              <Tex tex={s.mgf.tex} /> <Rich text={`(${s.mgf.domain})`} />
            </>
          ) : (
            <Rich text={`**${s.mgf.kind === 'none' ? 'غير موجودة' : 'بلا صيغة بسيطة'}:** ${s.mgf.note}`} />
          )}
        </dd>
        {s.cdf && (
          <>
            <dt>التراكمي</dt>
            <dd>{s.cdf.kind === 'closed' ? <Tex tex={s.cdf.tex} /> : <Rich text={s.cdf.note} />}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
