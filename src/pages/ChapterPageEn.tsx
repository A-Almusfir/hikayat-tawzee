import type { Chapter } from '../content/chapterTypes';
import { chaptersEn } from '../content/en';
import { distEn } from '../content/en/distributions';
import { ChapterPage } from './ChapterPage';

/** الفصل في الواجهة الإنجليزية: يحمل الترجمة في حزمة منفصلة لا يحمّلها قارئ العربية. */
export function ChapterPageEn({ ch, scene }: { ch: Chapter; scene?: number }) {
  return <ChapterPage ch={ch} scene={scene} tr={{ ch: chaptersEn[ch.id], dist: distEn[ch.id] }} />;
}
