import { hasCourseTag } from './downloadNameSettings';
import type { Course } from '../types';

/**
 * A course's full name: the one the user set ("Set full name"), else the one it gets
 * from Moodle. Undefined only for a course tagged before its Moodle name was
 * recorded, whose `name` is the tag, not a full name.
 */
export function courseFullName(course: Course): string | undefined {
  return course.fullName || course.autoName || (hasCourseTag(course) ? undefined : course.name);
}

/**
 * What a course is shown as: with a tag (an abbreviation, like "OS"), the tag, with
 * its full name beneath; without one, just the full name.
 */
export function courseDisplayNames(course: Course): { title: string; subtitle?: string } {
  const fullName = courseFullName(course);
  if (!hasCourseTag(course)) return { title: fullName ?? course.name };
  return { title: course.name, subtitle: fullName !== course.name ? fullName : undefined };
}

/**
 * The title of a course's own page: the full name the user set, else its tag, else
 * the name it gets from Moodle.
 */
export function coursePageTitle(course: Course): string {
  if (course.fullName) return course.fullName;
  if (hasCourseTag(course)) return course.name;
  return course.autoName || course.name;
}

/** `course` without its tag: back to the name it gets from Moodle. (A course tagged
 *  before that name was recorded has no other name to go back to, and keeps its own.) */
export function withoutTag(course: Course): Course {
  return { ...course, name: course.autoName ?? course.name, tagged: false };
}
