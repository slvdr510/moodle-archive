/** How the course list shows each course: as a grid of cards, or as rows of a list. */
export type CourseListStyle = 'cards' | 'rows';

const STORAGE_KEY = 'moodle-archive-course-list-style';
export const DEFAULT_COURSE_LIST_STYLE: CourseListStyle = 'cards';

function isValid(value: unknown): value is CourseListStyle {
  return value === 'cards' || value === 'rows';
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
