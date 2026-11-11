import { academicYearOptions } from './academicYear';
import { withoutTag } from './courseNames';
import { hasCourseTag } from './downloadNameSettings';
import { courseHomeUrl, courseViewUrl } from './moodleUrl';
import type { Course } from '../types';

/** What "Edit course info" edits of a course, as written in its fields. */
export interface CourseInfoDraft {
  /** Empty for no tag. */
  tag: string;
  /** Empty for the name from Moodle. */
  fullName: string;
  institution: string;
  academicYear: string;
  /** Undefined for its automatic color. */
  color: string | undefined;
  url: string;
}

/** The URL a course opens in Moodle: the one set for it, else the first it was found at. */
export function courseOpenUrl(course: Course): string {
  return course.url || course.matchedUrls[0] || '';
}

export function courseInfoDraft(course: Course): CourseInfoDraft {
  return {
    tag: hasCourseTag(course) ? course.name : '',
    fullName: course.fullName ?? '',
    institution: course.institution ?? '',
    academicYear: course.academicYear ?? '',
    color: course.color,
    url: courseOpenUrl(course)
  };
}

/**
 * `course` with `draft` in it. What isn't valid is left as it was (see
 * courseInfoProblems). A new URL is the one it opens from then on, and the ones it
 * had stay known: a download from any of them still goes to this course (see
 * matchCourseForResource).
 */
export function applyCourseInfo(course: Course, draft: CourseInfoDraft): Course {
  const tag = draft.tag.trim();
  let next: Course = { ...course };
  if (!tag) {
    if (hasCourseTag(course)) next = withoutTag(next);
  } else if (tag !== course.name || !hasCourseTag(course)) {
    next = { ...next, name: tag, tagged: true };
  }
  next.fullName = draft.fullName.trim() || undefined;
  next.institution = draft.institution.trim() || undefined;
  next.academicYear = draft.academicYear.trim() || undefined;
  next.color = draft.color;
  const url = courseViewUrl(draft.url);
  if (url && url !== courseOpenUrl(course)) {
    next.url = url;
    if (!next.matchedUrls.includes(url)) next.matchedUrls = [...next.matchedUrls, url];
  }
  return next;
}

/** Whether `next` differs from `course` in anything "Edit course info" edits. */
export function courseInfoChanged(course: Course, next: Course): boolean {
  const info = (c: Course) =>
    JSON.stringify([
      c.name,
      hasCourseTag(c),
      c.fullName ?? null,
      c.institution ?? null,
      c.academicYear ?? null,
      c.color ?? null,
      c.url,
      c.matchedUrls
    ]);
  return info(course) !== info(next);
}

export type CourseInfoProblem =
  | { field: 'url'; kind: 'invalid' }
  | { field: 'url'; kind: 'taken'; owner: Course };

/**
 * What's wrong in a course's `draft`: a URL changed to one that isn't a course page's
 * (or emptied: a course found at one keeps one), or to one that's another course's —
 * already, or as written for it in `drafts`.
 */
export function courseInfoProblems(
  course: Course,
  draft: CourseInfoDraft,
  courses: Course[],
  drafts: Map<string, CourseInfoDraft>
): CourseInfoProblem[] {
  const problems: CourseInfoProblem[] = [];

  // Only once changed: the one it has, whatever it is (a Resources page's, from
  // before those were taken as the course's), is no reason not to save the rest.
  const written = draft.url.trim();
  const url = courseViewUrl(written);
  if (written === courseOpenUrl(course)) {
    // Unchanged.
  } else if (!url) {
    problems.push({ field: 'url', kind: 'invalid' });
  } else if (url !== courseOpenUrl(course)) {
    const home = courseHomeUrl(url);
    const owner = courses.find((other) => {
      if (other.id === course.id) return false;
      const theirs = drafts.get(other.id);
      const theirNew = theirs ? courseViewUrl(theirs.url) : undefined;
      return theirNew === home || other.matchedUrls.some((known) => courseHomeUrl(known) === home);
    });
    if (owner) problems.push({ field: 'url', kind: 'taken', owner });
  }
  return problems;
}

/** Institutions and academic years deleted from what's offered to pick. */
export interface DeletedOptions {
  institutions: Set<string>;
  academicYears: Set<string>;
}

/**
 * What a course's institution and academic year fields offer to pick from: those set
 * on any course, but the ones deleted, and those written for the others in `drafts`
 * (not its own, while it's being typed). Institutions alphabetically, academic years
 * newest first.
 */
export function courseInfoOptions(
  courseId: string,
  courses: Course[],
  drafts: Map<string, CourseInfoDraft>,
  deleted: DeletedOptions = { institutions: new Set(), academicYears: new Set() }
): { institutions: string[]; academicYears: string[] } {
  const others = [...drafts].filter(([id]) => id !== courseId).map(([, draft]) => draft);
  const institutions = new Set<string>();
  for (const institution of courses.map((c) => c.institution)) {
    if (institution && !deleted.institutions.has(institution)) institutions.add(institution);
  }
  for (const draft of others) if (draft.institution.trim()) institutions.add(draft.institution.trim());
  const set = courses.map((c) => c.academicYear).filter((year) => year && !deleted.academicYears.has(year));
  return {
    institutions: [...institutions].sort((a, b) => a.localeCompare(b)),
    academicYears: academicYearOptions([...set, ...others.map((d) => d.academicYear)])
  };
}

/** The courses whose `draft` has `value` as its institution, or as its academic year. */
export function coursesWithOption(drafts: Map<string, CourseInfoDraft>, field: 'institution' | 'academicYear', value: string): string[] {
  return [...drafts]
    .filter(([, draft]) => draft[field].trim() === value)
    .map(([id]) => id);
}
