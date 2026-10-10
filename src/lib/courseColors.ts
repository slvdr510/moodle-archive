import type { Course } from '../types';

/**
 * The colors a course card can get — a fixed set picked to be told apart at a glance
 * (and to read on both the light and dark themes), rather than any hue a hash lands
 * on, which could hand two courses near-identical shades. Every pair is at least 10
 * apart in OKLab ΔE (×100), which tests/courseColors.test.ts checks.
 */
export const COURSE_COLORS = [
  '#e5484d', // red
  '#f2711c', // orange
  '#d4a017', // gold
  '#3f9c45', // green
  '#0d9488', // teal
  '#2f6fdb', // blue
  '#7c4ddb', // violet
  '#c53fb8', // magenta
  '#9a6b4f', // brown
  '#64748b' // slate
];

/** What a course's color is derived from: its own Moodle name — never a tag the user
 *  set, so renaming a course doesn't repaint it. A course tagged before its Moodle
 *  name was recorded falls back to its id, which never changes either. */
function colorKey(course: Course): string {
  if (course.autoName !== undefined) return course.autoName;
  return course.tagged ? course.id : course.name;
}

/** FNV-1a: small, and spreads similar names (e.g. "Tema 1", "Tema 2") far apart. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (const char of text.normalize('NFC').toLowerCase()) {
    value ^= char.codePointAt(0)!;
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/**
 * Gives each of `keys` (already in claiming order) a color from COURSE_COLORS, no two
 * the same while there are colors to spare: each prefers the color its `hashKey`
 * hashes to, and one whose preference is taken gets the next free color — so a key
 * added later never changes the color of one already there. Past one key per color,
 * a key shares the least used one.
 */
function assignDistinctColors<T>(keys: T[], hashKey: (key: T) => string): Map<T, string> {
  const uses = COURSE_COLORS.map(() => 0);
  const colors = new Map<T, string>();

  for (const key of keys) {
    const preferred = hash(hashKey(key)) % COURSE_COLORS.length;
    const fewestUses = Math.min(...uses);
    // From the preferred color onwards, the first one among the least used.
    let index = preferred;
    while (uses[index] !== fewestUses) index = (index + 1) % COURSE_COLORS.length;
    uses[index]++;
    colors.set(key, COURSE_COLORS[index]);
  }

  return colors;
}

function oldestFirst(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
}

/** Each course's automatic card color, by course id — oldest courses claiming
 *  theirs first. See assignDistinctColors. */
export function assignAutoCourseColors(courses: Course[]): Map<string, string> {
  const byId = new Map(courses.map((course) => [course.id, course]));
  return assignDistinctColors(
    oldestFirst(courses).map((course) => course.id),
    (id) => colorKey(byId.get(id)!)
  );
}

/**
 * Each course's card color, by course id: the one the user picked ("Change color"),
 * else its automatic one. A course with a color of its own still holds on to its
 * automatic one, so picking or resetting a color never repaints any other course.
 */
export function assignCourseColors(courses: Course[]): Map<string, string> {
  const colors = assignAutoCourseColors(courses);
  for (const course of courses) {
    if (course.color) colors.set(course.id, course.color);
  }
  return colors;
}
