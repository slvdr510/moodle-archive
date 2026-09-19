import type { Course } from '../types';

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\.[^./]+$/, '')
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Finds the saved course a crawled resource belongs to, first by an exact
 * remembered URL, then by a fuzzy slug match against course names. Returns
 * undefined if nothing matches confidently.
 */
export function matchCourseForResource(courseUrl: string, courseTitle: string, courses: Course[]): Course | undefined {
  const exact = courses.find((c) => c.matchedUrls.includes(courseUrl));
  if (exact) return exact;

  const titleSlug = slugify(courseTitle);
  return courses.find((c) => slugify(c.name) === titleSlug);
}

/** Turns a crawled course title (e.g. "Intro_to-Programming") into a readable course name. */
export function humanizeCourseTitle(courseTitle: string): string {
  return courseTitle
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
