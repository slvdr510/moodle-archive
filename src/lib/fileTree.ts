import type { FileRecord, FileStatus } from '../types';

export interface FolderTreeNode {
  kind: 'folder';
  name: string;
  path: string;
  children: TreeNode[];
}

export interface FileTreeNode {
  kind: 'file';
  name: string;
  file: FileRecord;
}

export type TreeNode = FolderTreeNode | FileTreeNode;

function buildRawTree(files: FileRecord[]): FolderTreeNode {
  const root: FolderTreeNode = { kind: 'folder', name: '', path: '', children: [] };

  for (const file of files) {
    const segments = file.relativePath.split('/').filter(Boolean);
    const leafName = segments.pop() ?? file.filename;

    let current = root;
    let pathSoFar = '';
    for (const segment of segments) {
      pathSoFar = pathSoFar ? `${pathSoFar}/${segment}` : segment;
      let next = current.children.find(
        (c): c is FolderTreeNode => c.kind === 'folder' && c.name === segment
      );
      if (!next) {
        next = { kind: 'folder', name: segment, path: pathSoFar, children: [] };
        current.children.push(next);
      }
      current = next;
    }

    current.children.push({ kind: 'file', name: leafName, file });
  }

  sortTree(root.children);
  return root;
}

/**
 * Turns a flat list of files (identified by "a/b/c.pdf"-style relative paths)
 * into a folder tree.
 *
 * `referenceFiles` (defaults to `files` itself) decides how many redundant
 * top-level wrapper folders to strip — see `countRedundantRootLevels` below.
 * Passing the *full* file list here while `files` is a filtered subset (e.g.
 * search results) keeps that decision based on the real folder structure,
 * rather than re-deriving it from whatever handful of files happen to match:
 * a single search match's ancestor chain is always one folder per level, so
 * naively unwrapping "while there's only one child" would strip away every
 * real folder along the way, not just the actual redundant wrapper.
 */
export function buildFileTree(files: FileRecord[], referenceFiles: FileRecord[] = files): TreeNode[] {
  const root = buildRawTree(files);
  const unwrapLevels =
    referenceFiles === files ? countRedundantRootLevels(root.children) : countRedundantRootLevels(buildRawTree(referenceFiles).children);
  return dropLevels(root.children, unwrapLevels);
}

/**
 * moodle-dl-ext always wraps a course's whole zip in one top-level folder
 * matching the course/page title — showing that as a tree node is just
 * noise (it's already the page header). Counts how many such lone wrapper
 * folders sit at the top, so callers can strip exactly that many.
 */
function countRedundantRootLevels(nodes: TreeNode[]): number {
  let levels = 0;
  while (nodes.length === 1 && nodes[0].kind === 'folder') {
    nodes = nodes[0].children;
    levels++;
  }
  return levels;
}

function dropLevels(nodes: TreeNode[], levels: number): TreeNode[] {
  for (let i = 0; i < levels; i++) {
    if (nodes.length !== 1 || nodes[0].kind !== 'folder') break;
    nodes = nodes[0].children;
  }
  return nodes;
}

function sortTree(nodes: TreeNode[]): void {
  nodes.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
  for (const node of nodes) {
    if (node.kind === 'folder') sortTree(node.children);
  }
}

const FOLDER_BADGE_ORDER: FileStatus[] = ['new', 'modified', 'deleted'];

/**
 * Every distinct non-"unchanged" status found anywhere under this folder
 * (recursively), in a fixed display order — so a folder can show New,
 * Modified and Deleted badges together when it contains a mix.
 */
export function collectFolderStatuses(node: FolderTreeNode): FileStatus[] {
  const found = new Set<FileStatus>();

  function walk(n: TreeNode): void {
    if (n.kind === 'file') {
      if (n.file.currentStatus !== 'unchanged') found.add(n.file.currentStatus);
    } else {
      for (const child of n.children) walk(child);
    }
  }
  for (const child of node.children) walk(child);

  return FOLDER_BADGE_ORDER.filter((s) => found.has(s));
}
