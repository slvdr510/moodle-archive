/** Joins path pieces with "/", skipping empty ones. */
export function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join('/');
}

/**
 * Turns whatever the user typed as a new folder name into a single, safe folder
 * name: path separators are dropped (it's one folder, never a path), and "." and
 * ".." are rejected. Returns '' when nothing usable is left.
 */
export function sanitizeFolderName(input: string): string {
  const name = input.replace(/[/\\]/g, '').trim();
  return name === '.' || name === '..' ? '' : name;
}
