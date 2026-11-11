import { useSyncExternalStore } from 'react';
import { getAcademicYearColors, subscribeAcademicYearColors } from '../../lib/academicYearColors';

/** Each academic year's color (see academicYearColors.ts), kept up to date. */
export function useAcademicYearColors(): Readonly<Record<string, string>> {
  return useSyncExternalStore(subscribeAcademicYearColors, getAcademicYearColors);
}
