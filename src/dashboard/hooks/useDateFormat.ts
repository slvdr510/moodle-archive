import { useSyncExternalStore } from 'react';
import { getStoredDateFormat, setStoredDateFormat, subscribeDateFormat, type DateFormatPref } from '../../lib/dateFormat';

/** Backed by a module-level store (see dateFormat.ts) rather than local state, so
 *  every component showing a date re-renders together when the preference changes. */
export function useDateFormat(): [DateFormatPref, (pref: DateFormatPref) => void] {
  const pref = useSyncExternalStore(subscribeDateFormat, getStoredDateFormat);
  return [pref, setStoredDateFormat];
}
