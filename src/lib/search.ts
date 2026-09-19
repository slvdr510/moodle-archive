import type { FileRecord } from '../types';

/** Splits a path into its meaningful pieces on any run of non-alphanumeric
 *  characters (`/`, `_`, `-`, `.`, spaces, …), lowercased. */
function tokenize(path: string): string[] {
  return path.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Case-insensitive, multi-term match against each file's own filename — the
 * folder(s) it lives in are deliberately not searched. Every term must exactly
 * match one of the filename's tokens (in any order), so "2014 sep" matches
 * "2014-15_..._SEP_1.pdf" (tokens include "2014" and "sep") even though
 * "2014 sep" itself never appears as one literal substring.
 *
 * Two reasons a folder name shouldn't be indexed here: it would pull in every
 * file inside a folder whose name happens to match (surprising — the user
 * searched for a file, not a folder), and matching whole tokens rather than
 * raw substrings avoids things like "5" matching inside "2025", or "tema"
 * matching inside a folder named "...todos_los_temas".
 */
export function filterFilesByQuery(files: FileRecord[], query: string): FileRecord[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return files
    .filter((f) => {
      const tokens = tokenize(f.filename);
      return terms.every((term) => tokens.includes(term));
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath, undefined, { sensitivity: 'base' }));
}
