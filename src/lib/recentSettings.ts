export interface RecentSettings {
  /** Whether the "Recently opened" strip is shown at all. */
  enabled: boolean;
  /** Show every recently opened file, ignoring `maxItems`. */
  unlimited: boolean;
  /** How many recently opened files to show per course when not `unlimited`. */
  maxItems: number;
}

const STORAGE_KEY = 'moodle-archive-recent-settings';
export const DEFAULT_RECENT_SETTINGS: RecentSettings = { enabled: true, unlimited: false, maxItems: 5 };

function isValidMax(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

// useSyncExternalStore compares snapshots by identity, so the parsed object is
// cached and only replaced when the stored string actually changes.
let cachedRaw: string | null | undefined;
let cachedSettings: RecentSettings = DEFAULT_RECENT_SETTINGS;

export function getRecentSettings(): RecentSettings {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSettings;
  cachedRaw = raw;
  cachedSettings = parse(raw);
  return cachedSettings;
}

function parse(raw: string | null): RecentSettings {
  if (!raw) return DEFAULT_RECENT_SETTINGS;
  try {
    const stored = JSON.parse(raw) as Partial<RecentSettings>;
    return {
      enabled: typeof stored.enabled === 'boolean' ? stored.enabled : DEFAULT_RECENT_SETTINGS.enabled,
      unlimited: typeof stored.unlimited === 'boolean' ? stored.unlimited : DEFAULT_RECENT_SETTINGS.unlimited,
      maxItems: isValidMax(stored.maxItems) ? stored.maxItems : DEFAULT_RECENT_SETTINGS.maxItems
    };
  } catch {
    return DEFAULT_RECENT_SETTINGS;
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function setRecentSettings(settings: RecentSettings): void {
  const maxItems = isValidMax(settings.maxItems) ? settings.maxItems : DEFAULT_RECENT_SETTINGS.maxItems;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, maxItems }));
  listeners.forEach((listener) => listener());
}

export function subscribeRecentSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The slice of a newest-first list that the settings say should be shown. */
export function applyRecentSettings<T>(items: T[], settings: RecentSettings = getRecentSettings()): T[] {
  if (!settings.enabled) return [];
  return settings.unlimited ? items : items.slice(0, settings.maxItems);
}
