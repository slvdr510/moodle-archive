import { useSyncExternalStore } from 'react';
import {
  getCourseListStyle,
  setCourseListStyle,
  subscribeCourseListStyle,
  type CourseListStyle
} from '../../lib/courseListStyle';

/** Backed by a module-level store (see courseListStyle.ts), same as useSideMargin. */
export function useCourseListStyle(): [CourseListStyle, (style: CourseListStyle) => void] {
  const style = useSyncExternalStore(subscribeCourseListStyle, getCourseListStyle);
  return [style, setCourseListStyle];
}
