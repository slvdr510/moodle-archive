/**
 * Files and folders of a course the user asked downloads to leave alone ("Ignore
 * changes"): kept in `Course.ignoredPaths` as paths relative to the course root as
 * the file tree shows it — the hidden wrapper folder (see getRootFolderPath) left
 * out — so "notes.pdf" is the file at the root and "Week 1/notes.pdf" a different one
 * in that folder, however alike their names. A path ending in "/" is a folder, and
 * covers everything in it, at any depth: "Week 1/".
 */

/** Whether an ignored path is a folder (and everything in it) rather than one file. */
export function isFolderPath(path: string): boolean {
  return path.endsWith('/');
}

/** The path as the user typed it, tidied: either slash, no empty segments, no
 *  leading slash or spaces — a trailing slash kept, as it marks a folder. Empty if
 *  nothing usable is left. */
export function cleanIgnoredPath(input: string): string {
  const folder = /[/\\]\s*$/.test(input);
  const path = input
    .split(/[/\\]/)
    .map((segment) => segment.trim())
    .filter((segment) => segment !== '')
    .join('/');
  return path && folder ? `${path}/` : path;
}

/**
 * What two paths are compared by. Moodle names are stored the way the crawler's
 * getValidFilename turns them into filenames (accents dropped, spaces as "_", other
 * symbols removed), so a path typed as the name reads on Moodle — "Tema 1/Apuntes
 * (v2).pdf" — still matches the stored "Tema_1/Apuntes_v2.pdf". Case doesn't count.
 * A folder keeps its trailing slash, so it never matches a file of the same name.
 */
function matchKey(path: string): string {
  const cleaned = cleanIgnoredPath(path);
  const key = cleaned
    .split('/')
    .filter((segment) => segment !== '')
    .map((segment) =>
      segment
        .normalize('NFD')
        .replaceAll(/[̀-ͯ]/gu, '')
        .replaceAll(' ', '_')
        .replaceAll(/[^-\w.]/gu, '')
        .toLowerCase()
    )
    .join('/');
  return isFolderPath(cleaned) ? `${key}/` : key;
}

export function sameIgnoredPath(a: string, b: string): boolean {
  return matchKey(a) === matchKey(b);
}

/** A file's or folder's path relative to the course root as the tree shows it —
 *  `rootPath` being the hidden wrapper folder, from getRootFolderPath. */
export function displayPath(relativePath: string, rootPath: string): string {
  return rootPath && relativePath.startsWith(`${rootPath}/`) ? relativePath.slice(rootPath.length + 1) : relativePath;
}

/**
 * Whether the file or folder at `path` (relative to the course root, see displayPath)
 * is ignored: 'self' when it's in `ignoredPaths` itself, 'folder' when a folder it's
 * in is (which then decides — ignoring or not the item itself changes nothing).
 */
export type IgnoreState = 'none' | 'self' | 'folder';

export function ignoreState(path: string, ignoredPaths: readonly string[] | undefined, isFolder = false): IgnoreState {
  if (!ignoredPaths?.length) return 'none';
  const key = matchKey(path).replace(/\/$/, '');
  let state: IgnoreState = 'none';
  for (const entry of ignoredPaths) {
    const entryKey = matchKey(entry);
    if (isFolderPath(entryKey)) {
      if (key.startsWith(entryKey)) return 'folder';
      if (isFolder && entryKey === `${key}/`) state = 'self';
    } else if (!isFolder && entryKey === key) {
      state = 'self';
    }
  }
  return state;
}

/** Whether the file at `relativePath` (a real, stored path) is ignored, by itself or
 *  by a folder it's in. */
export function isIgnoredPath(relativePath: string, rootPath: string, ignoredPaths: readonly string[] | undefined): boolean {
  return ignoreState(displayPath(relativePath, rootPath), ignoredPaths) !== 'none';
}

/** Whether `entry` (an ignored path) covers any of `filePaths` (files' paths from the
 *  course root) — false for one typed ahead of the file or folder existing. */
export function ignoredPathMatchesAny(entry: string, filePaths: readonly string[]): boolean {
  return filePaths.some((path) => ignoreState(path, [entry]) !== 'none');
}

/** `ignoredPaths` with `path` added, or removed if it's already there. */
export function toggleIgnoredPath(ignoredPaths: readonly string[] | undefined, path: string): string[] {
  const current = ignoredPaths ?? [];
  return current.some((existing) => sameIgnoredPath(existing, path))
    ? current.filter((existing) => !sameIgnoredPath(existing, path))
    : [...current, cleanIgnoredPath(path)];
}
