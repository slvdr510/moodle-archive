import { courseStore, fileStore } from './db';
import type { Course, FileRecord } from '../types';

/**
 * Courses renamed ("Set tag name") before tags were tracked have neither `tagged`
 * nor `autoName`, so nothing told their tag apart from an automatic name — and the
 * download-name prefix (see downloadNameSettings.ts) skipped them. Their files still
 * say what the automatic name was: the crawler puts every file under a first folder
 * made from the course's Moodle title (`getValidFilename(title)`), and the automatic
 * name is that same title humanized. Compared with the differences between those
 * two transforms folded away, a match means the name is still the automatic one.
 */

/** Folds away everything getValidFilename/humanizeCourseTitle may change: accents, case, separators, symbols. */
function titleKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * What a legacy course's tag state should be, from its files — or undefined when
 * the files can't tell (no crawled files, or not all under one title folder, as
 * when Moodle gave no title), in which case it's left for its next download.
 */
export function inferLegacyTagState(course: Course, files: FileRecord[]): Pick<Course, 'tagged' | 'autoName'> | undefined {
  const titleFolders = new Set(
    files.filter((f) => !f.manual && f.relativePath.includes('/')).map((f) => f.relativePath.split('/')[0])
  );
  if (titleFolders.size !== 1) return undefined;
  const [titleFolder] = titleFolders;
  if (titleFolder.startsWith('invalid-filename_')) return undefined;

  const key = titleKey(titleFolder);
  if (!key) return undefined;
  // Still the automatic name: record it as such, so a later rename is detected.
  return key === titleKey(course.name) ? { autoName: course.name } : { tagged: true };
}

/** Fills in the tag state of every course that predates it. Safe to run any number of times. */
export async function migrateLegacyCourseTags(): Promise<void> {
  const legacy = (await courseStore.all()).filter((c) => c.tagged === undefined && c.autoName === undefined);
  for (const course of legacy) {
    const state = inferLegacyTagState(course, await fileStore.byCourse(course.id));
    if (state) await courseStore.put({ ...course, ...state });
  }
}
