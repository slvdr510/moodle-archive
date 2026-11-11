import { COURSE_COLORS } from './courseColors';

/**
 * A color for each academic year (as written: see academicYear.ts), for its label on
 * the courses' cards — every course with that year in that color. The user can change
 * one ("Edit course info"); a year without one gets one at random as it first shows
 * up, a color no other year has: of the course palette's while there are any left,
 * any hue after that. Kept in this browser, as the dashboard's other settings are.
 */
const STORAGE_KEY = 'moodle-archive-academic-year-colors';

type Colors = Readonly<Record<string, string>>;

const HEX = /^#[0-9a-f]{6}$/i;

// What was last read, for as long as what's stored stays the same: the same object
// each time, as useSyncExternalStore needs.
let cache: { raw: string | null; colors: Colors } | null = null;

export function getAcademicYearColors(): Colors {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (cache?.raw === raw) return cache.colors;
  let colors: Record<string, string> = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === 'object') {
      colors = Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && HEX.test(entry[1]))
      );
    }
  } catch {
    // Not what's written here: as if nothing were.
  }
  cache = { raw, colors };
  return colors;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function save(colors: Colors): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  listeners.forEach((listener) => listener());
}

export function subscribeAcademicYearColors(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAcademicYearColor(year: string, color: string): void {
  if (!year.trim() || !HEX.test(color)) return;
  save({ ...getAcademicYearColors(), [year.trim()]: color.toLowerCase() });
}

/** Forgets a year's color: one deleted from what's offered to pick. */
export function removeAcademicYearColor(year: string): void {
  const { [year.trim()]: _removed, ...rest } = getAcademicYearColors();
  if (_removed !== undefined) save(rest);
}

/** Any hue, as "#rrggbb", at a saturation and lightness that read on either theme. */
function randomHue(): string {
  const hue = Math.random() * 360;
  const [s, l] = [0.62, 0.5];
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const value = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** A color for a new year, at random: one of the palette's no year has, while there are
 *  any; any hue after that. */
function pickColor(taken: Set<string>): string {
  const free = COURSE_COLORS.filter((color) => !taken.has(color));
  return free.length > 0 ? free[Math.floor(Math.random() * free.length)] : randomHue();
}

/** Gives each of `years` that has no color yet one of its own (see pickColor). */
export function assignAcademicYearColors(years: (string | undefined)[]): void {
  const colors = { ...getAcademicYearColors() };
  const taken = new Set(Object.values(colors).map((color) => color.toLowerCase()));
  let added = false;
  for (const year of years) {
    const key = year?.trim();
    if (!key || colors[key]) continue;
    const color = pickColor(taken);
    colors[key] = color;
    taken.add(color);
    added = true;
  }
  if (added) save(colors);
}
