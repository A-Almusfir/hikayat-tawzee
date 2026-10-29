import { describe, expect, it } from 'vitest';
import { gradeCompose } from './compose';

const slots = ['E', 'L', 'K'];
describe('تصحيح «املأ القانون»', () => {
  it('الترتيب الأصلي صحيح', () => expect(gradeCompose(['E', 'L', 'K'], slots, [[1, 2]])).toEqual([true, true, true]));
  it('تبادل عاملين قابلين للتبادل صحيح', () => expect(gradeCompose(['L', 'E', 'K'], slots, [[1, 2]])).toEqual([true, true, true]));
  it('دون مجموعة تبادل يُعدّ التبادل خطأ', () => expect(gradeCompose(['L', 'E', 'K'], slots)).toEqual([false, false, true]));
  it('وضع المقام في البسط خطأ', () => expect(gradeCompose(['K', 'L', 'E'], slots, [[1, 2]])).toEqual([false, true, false]));
  it('تكرار البطاقة نفسها لا يُحسب مرتين', () => expect(gradeCompose(['L', 'L', 'K'], slots, [[1, 2]])).toEqual([true, false, true]));
  it('خانة فارغة ليست صحيحة', () => expect(gradeCompose([null, 'L', 'K'], slots, [[1, 2]])).toEqual([false, true, true]));
});
