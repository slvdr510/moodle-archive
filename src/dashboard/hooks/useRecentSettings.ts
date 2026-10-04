import { useSyncExternalStore } from 'react';
import { getRecentSettings, setRecentSettings, subscribeRecentSettings, type RecentSettings } from '../../lib/recentSettings';

/** Backed by a module-level store (see recentSettings.ts), same as useDateFormat. */
export function useRecentSettings(): [RecentSettings, (settings: RecentSettings) => void] {
  const settings = useSyncExternalStore(subscribeRecentSettings, getRecentSettings);
  return [settings, setRecentSettings];
}
