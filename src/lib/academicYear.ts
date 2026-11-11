/** The year an academic year (as written: any text) starts in, in full — its first
 *  number of 2 or 4 digits: 2025 for "25-26", "2025/2026" or "Curso 25/26". */
function startYear(text: string): number | undefined {
  const match = /(?<!\d)(\d{4}|\d{2})(?!\d)/.exec(text);
  if (!match) return undefined;
  return match[1].length === 2 ? 2000 + Number(match[1]) : Number(match[1]);
}

/**
 * The academic years among `years`, each once, as written: to pick from. Newest first,
 * by the year each starts in; those with none to go by after them, alphabetically.
 */
export function academicYearOptions(years: (string | undefined)[]): string[] {
  const written = [...new Set(years.map((year) => year?.trim()).filter((year): year is string => !!year))];
  return written.sort((a, b) => {
    const [yearA, yearB] = [startYear(a), startYear(b)];
    if (yearA !== undefined && yearB !== undefined && yearA !== yearB) return yearB - yearA;
    if ((yearA === undefined) !== (yearB === undefined)) return yearA === undefined ? 1 : -1;
    return a.localeCompare(b);
  });
}
