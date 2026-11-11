import type { Course } from '../types';
import { courseHomeUrl } from './moodleUrl';

/**
 * A course title reduced to what tells it apart, in any script: its letters and
 * digits, without case or accents — so "Física II", "fisica_ii" and "FISICA-II" are
 * one, as are a Moodle title and the name made from it (humanizeCourseTitle). Empty
 * when it has neither.
 */
export function titleKey(title: string): string {
  return title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

/**
 * Finds the saved course a crawled course belongs to: the one already downloaded
 * from this address (its main page's or its Resources page's, the same course's —
 * see courseHomeUrl). Every Moodle site is one of its own, subdomain included —
 * aulasvirtuales.uhu.es and 2024aulasvirtuales.uhu.es (the year before's) are two —
 * so the same course number, or the same title, elsewhere is another course. A
 * course that moves gets its new URL by hand (in "Edit course info", see
 * CourseInfoModal). Only a course saved before addresses were recorded has none to
 * go by, and is found by its title. Undefined when none matches.
 */
export function matchCourseForResource(courseUrl: string, courseTitle: string, courses: Course[]): Course | undefined {
  const home = courseHomeUrl(courseUrl);
  const exact = courses.find((c) => c.matchedUrls.some((url) => courseHomeUrl(url) === home));
  if (exact) return exact;

  const key = titleKey(courseTitle);
  if (!key) return undefined;
  // The Moodle title it was last downloaded with: `name` may be a tag the user set.
  return courses.find((c) => c.matchedUrls.length === 0 && titleKey(c.autoName ?? c.name) === key);
}

/** Turns a crawled course title (e.g. "Intro_to-Programming") into a readable course name. */
export function humanizeCourseTitle(courseTitle: string): string {
  return courseTitle
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
