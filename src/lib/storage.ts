import { useSyncExternalStore } from 'react';
import type { DistId } from '../content/types';

// التقدم محفوظ محليًا على هذا الجهاز فقط (localStorage). لا يُرسل إلى أي خادم.
export type CardStatus = 'known' | 'review';
export interface Progress {
  cards: Partial<Record<DistId, CardStatus>>;
  quiz: Record<string, number>;
  chooser: Record<string, string>;
}

const KEY = 'hikayat-tawzee:v1';
const empty = (): Progress => ({ cards: {}, quiz: {}, chooser: {} });

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as Partial<Progress>;
    return { cards: p.cards ?? {}, quiz: p.quiz ?? {}, chooser: p.chooser ?? {} };
  } catch {
    return empty();
  }
}

let state: Progress = typeof window === 'undefined' ? empty() : load();
const listeners = new Set<() => void>();

function commit(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* التخزين غير متاح (تصفح خاص مثلًا) — يستمر الموقع دون حفظ */
  }
  listeners.forEach((l) => l());
}

export const progress = {
  setCard: (id: DistId, s: CardStatus | undefined) => {
    const cards = { ...state.cards };
    if (s) cards[id] = s;
    else delete cards[id];
    commit({ ...state, cards });
  },
  setQuiz: (qid: string, choice: number | undefined) => {
    const quiz = { ...state.quiz };
    if (choice === undefined) delete quiz[qid];
    else quiz[qid] = choice;
    commit({ ...state, quiz });
  },
  setChooser: (sid: string, choice: string | undefined) => {
    const chooser = { ...state.chooser };
    if (choice === undefined) delete chooser[sid];
    else chooser[sid] = choice;
    commit({ ...state, chooser });
  },
  clearAll: () => commit(empty()),
};

export function useProgress(): Progress {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
