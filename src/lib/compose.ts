/**
 * تصحيح «املأ القانون». الخانات داخل مجموعة قابلة للتبادل تُقارن كمجموعة متعددة:
 * الخانة صحيحة إن كان محتواها من القيم الصحيحة لمجموعتها، دون تكرار يتجاوز عددها هناك.
 */
export function gradeCompose(fill: (string | null)[], slots: string[], groups: number[][] = []): boolean[] {
  const groupOf = (i: number) => groups.find((g) => g.includes(i + 1))?.map((n) => n - 1) ?? [i];
  return fill.map((v, i) => {
    if (v === null) return false;
    const g = groupOf(i);
    const expected = g.map((j) => slots[j]);
    const allowed = expected.filter((e) => e === v).length;
    if (!allowed) return false;
    // عدد مرات ظهور v في خانات المجموعة حتى هذه الخانة (بالترتيب) لا يتجاوز المسموح
    const seenBefore = g.filter((j) => j <= i && fill[j] === v).length;
    return seenBefore <= allowed;
  });
}
