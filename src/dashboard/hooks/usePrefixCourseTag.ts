import { useSyncExternalStore } from 'react';
import { getPrefixCourseTag, setPrefixCourseTag, subscribePrefixCourseTag } from '../../lib/downloadNameSettings';

/** Backed by a module-level store (see downloadNameSettings.ts), same as useRecentSettings. */
export function usePrefixCourseTag(): [boolean, (enabled: boolean) => void] {
  const enabled = useSyncExternalStore(subscribePrefixCourseTag, getPrefixCourseTag);
  return [enabled, setPrefixCourseTag];
}
