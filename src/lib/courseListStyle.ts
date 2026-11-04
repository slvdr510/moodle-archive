/** How the course list shows each course: as cards, in balanced rows each centered on
 *  its own; as cards in a grid, lined up in columns as well as rows; or as rows of a
 *  list. */
export type CourseListStyle = 'cards' | 'grid' | 'rows';

const STORAGE_KEY = 'moodle-archive-course-list-style';
export const DEFAULT_COURSE_LIST_STYLE: CourseListStyle = 'cards';

function isValid(value: unknown): value is CourseListStyle {
  return value === 'cards' || value === 'grid' || value === 'rows';
}

export function getCourseListStyle(): CourseListStyle {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isValid(stored) ? stored : DEFAULT_COURSE_LIST_STYLE;
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function setCourseListStyle(style: CourseListStyle): void {
  localStorage.setItem(STORAGE_KEY, isValid(style) ? style : DEFAULT_COURSE_LIST_STYLE);
  listeners.forEach((listener) => listener());
}

export function subscribeCourseListStyle(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
