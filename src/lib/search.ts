import type { FileRecord } from '../types';

/** Splits text into its meaningful pieces on any run of non-alphanumeric
 *  characters (`/`, `_`, `-`, `.`, spaces, …), lowercased and with accents
 *  stripped so "práctica" and "practica" are interchangeable. */
function tokenize(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Case- and accent-insensitive, multi-term match against each file's own filename
 * — the folder(s) it lives in are deliberately not searched. Every term must be
 * the *start* of one of the filename's words (in any order), so "20" finds
 * "INF_EX_2011_SEP.pdf", "tem" finds "TEMA_3.pdf", and "2014 sep" matches
 * "2014-15_..._SEP_1.pdf" even though "2014 sep" never appears as one literal
 * substring. Terms are split on punctuation the same way filenames are, so
 * "tema-3" behaves like "tema 3".
 *
 * Two reasons a folder name shouldn't be indexed here: it would pull in every
 * file inside a folder whose name happens to match (surprising — the user
 * searched for a file, not a folder). And matching only at the start of a word,
 * rather than anywhere inside it, avoids things like "5" matching inside "2025".
 */
export function filterFilesByQuery(files: FileRecord[], query: string): FileRecord[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  return files
    .filter((f) => {
      const tokens = tokenize(f.filename);
      return terms.every((term) => tokens.some((token) => token.startsWith(term)));
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath, undefined, { sensitivity: 'base' }));
}
