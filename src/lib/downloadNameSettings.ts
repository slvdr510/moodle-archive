import { courseStore } from './db';
import type { Course } from '../types';

/**
 * Whether files downloaded from a course get the course's tag (the name set with
 * "Set tag name") put in front of their name: "Tema_2.pdf" → "PCD_Tema_2.pdf".
 * Stored in localStorage, which the dashboard and the viewer page share (same
 * extension origin), so both name downloads the same way.
 */
const STORAGE_KEY = 'moodle-archive-prefix-course-tag';

/** On unless the user has turned it off. */
export function getPrefixCourseTag(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== 'false';
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function setPrefixCourseTag(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
  listeners.forEach((listener) => listener());
}

export function subscribePrefixCourseTag(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** A tag is only usable as a filename prefix once characters a filename can't hold are swapped out. */
function tagAsFilenamePart(tag: string): string {
  return tag.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim();
}

/**
 * Whether the user has given `course` a tag: set with "Set tag name" since `tagged`
 * existed, or — for a course renamed before that — a name that differs from the
 * automatic one recorded on its downloads.
 */
export function hasCourseTag(course: Course): boolean {
  return course.tagged === true || (course.autoName !== undefined && course.name !== course.autoName);
}

/**
 * `filename` as it should be saved for a file of `course`: prefixed with the
 * course's tag and "_" when the setting is on and the user has given the course a
 * tag, unchanged otherwise (a course still on its automatic name has no tag).
 */
export function applyCourseTag(filename: string, course: Course | undefined, enabled = getPrefixCourseTag()): string {
  if (!enabled || !course || !hasCourseTag(course)) return filename;
  const tag = tagAsFilenamePart(course.name);
  return tag ? `${tag}_${filename}` : filename;
}

/**
 * Same as `applyCourseTag`, looking the course up by id. Falls back to the plain
 * filename if that lookup fails — a missing prefix must never stop a download.
 */
export async function downloadNameFor(courseId: string, filename: string): Promise<string> {
  if (!getPrefixCourseTag()) return filename;
  try {
    return applyCourseTag(filename, await courseStore.get(courseId), true);
  } catch (err) {
    console.error('Could not look up the course tag for a download name:', err);
    return filename;
  }
}
