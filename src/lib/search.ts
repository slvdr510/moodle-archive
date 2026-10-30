import type { TreeNode } from './fileTree';
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
 * searched for a file, not a folder; see searchFileTree for how a folder is found
 * instead). And matching only at the start of a word, rather than anywhere inside
 * it, avoids things like "5" matching inside "2025".
 */
export function filterFilesByQuery(files: FileRecord[], query: string): FileRecord[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  return files
    .filter((f) => matchesTerms(f.filename, terms))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath, undefined, { sensitivity: 'base' }));
}

function matchesTerms(name: string, terms: string[]): boolean {
  const tokens = tokenize(name);
  return terms.every((term) => tokens.some((token) => token.startsWith(term)));
}

/**
 * A course's file tree (see buildFileTree) cut down to what a search finds, and which
 * of its folders to show open. Files are found by name as in filterFilesByQuery, and
 * folders by their own name too, the same way:
 * - A folder with anything found inside shows just that, open, whether its own name
 *   matches or not — what's around a found file isn't a result.
 * - A folder whose name matches, with nothing found inside, shows closed but whole: it
 *   is the result, and opening it browses it as usual.
 * So `openFolders` are also the folders that hold only part of what they have.
 */
export function searchFileTree(nodes: TreeNode[], query: string): { nodes: TreeNode[]; openFolders: Set<string> } {
  const terms = tokenize(query);
  const openFolders = new Set<string>();

  function prune(list: TreeNode[]): TreeNode[] {
    return list.flatMap((node): TreeNode[] => {
      if (node.kind === 'file') return matchesTerms(node.file.filename, terms) ? [node] : [];
      const found = prune(node.children);
      if (found.length > 0) {
        openFolders.add(node.path);
        return [{ ...node, children: found }];
      }
      return matchesTerms(node.name, terms) ? [node] : [];
    });
  }

  return { nodes: terms.length === 0 ? [] : prune(nodes), openFolders };
}
