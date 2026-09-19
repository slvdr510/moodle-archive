export type DateFormatPref = 'dmy' | 'mdy' | 'ymd';

const STORAGE_KEY = 'moodle-archive-date-format';
const DEFAULT_FORMAT: DateFormatPref = 'dmy';

export function getStoredDateFormat(): DateFormatPref {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dmy' || stored === 'mdy' || stored === 'ymd' ? stored : DEFAULT_FORMAT;
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function setStoredDateFormat(pref: DateFormatPref): void {
  localStorage.setItem(STORAGE_KEY, pref);
  listeners.forEach((listener) => listener());
}

/** Lets every displayed date across the dashboard re-render together when the
 *  preference changes, without threading a context provider through the tree. */
export function subscribeDateFormat(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function formatDate(timestampMs: number, pref: DateFormatPref = getStoredDateFormat()): string {
  const date = new Date(timestampMs);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  switch (pref) {
    case 'dmy':
      return `${day}/${month}/${year}`;
    case 'mdy':
      return `${month}/${day}/${year}`;
    case 'ymd':
      return `${year}/${month}/${day}`;
  }
}

export function formatDateTime(timestampMs: number, pref: DateFormatPref = getStoredDateFormat()): string {
  const time = new Date(timestampMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(timestampMs, pref)} ${time}`;
}
