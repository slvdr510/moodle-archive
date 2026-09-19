import { describe, expect, it } from 'vitest';
import { buildFileTree, collectFolderStatuses, type FolderTreeNode, type TreeNode } from '../src/lib/fileTree';
import type { FileRecord, FileStatus } from '../src/types';

function makeFile(relativePath: string, currentStatus: FileStatus): FileRecord {
  return {
    id: relativePath,
    courseId: 'course-1',
    relativePath,
    filename: relativePath.split('/').pop()!,
    currentStatus
  };
}

function namesOf(nodes: TreeNode[]): string[] {
  return nodes.map((n) => n.name);
}

describe('buildFileTree', () => {
  it('nests files under their folder path, folders before files, alphabetically', () => {
    const tree = buildFileTree([
      makeFile('b.pdf', 'new'),
      makeFile('Week1/notes.pdf', 'new'),
      makeFile('a.pdf', 'new'),
      makeFile('ACTAS/2013.pdf', 'new')
    ]);

    expect(namesOf(tree)).toEqual(['ACTAS', 'Week1', 'a.pdf', 'b.pdf']);

    const actas = tree[0] as FolderTreeNode;
    expect(actas.path).toBe('ACTAS');
    expect(namesOf(actas.children)).toEqual(['2013.pdf']);
  });

  it('groups multiple files under the same nested folder', () => {
    // Two top-level folders so the lone-wrapper unwrap (tested separately below) doesn't fire.
    const tree = buildFileTree([
      makeFile('19/INF_RES_2014_FEB.pdf', 'new'),
      makeFile('19/INF_RES_2014_SEP.pdf', 'new'),
      makeFile('20/other.pdf', 'new')
    ]);

    expect(namesOf(tree)).toEqual(['19', '20']);
    const folder = tree[0] as FolderTreeNode;
    expect(namesOf(folder.children)).toEqual(['INF_RES_2014_FEB.pdf', 'INF_RES_2014_SEP.pdf']);
  });

  it('builds multi-level nesting correctly', () => {
    const tree = buildFileTree([
      makeFile('ACTAS/2013-14/notes.pdf', 'new'),
      makeFile('OTHER/thing.pdf', 'new')
    ]);
    const level1 = tree[0] as FolderTreeNode;
    expect(level1.path).toBe('ACTAS');
    const level2 = level1.children[0] as FolderTreeNode;
    expect(level2.path).toBe('ACTAS/2013-14');
    expect(level2.children[0].name).toBe('notes.pdf');
  });

  it('unwraps a single top-level folder, since moodle-dl-ext always wraps a course in one', () => {
    const tree = buildFileTree([
      makeFile('CourseTitle/19/a.pdf', 'new'),
      makeFile('CourseTitle/ACTAS/b.pdf', 'new')
    ]);

    expect(namesOf(tree)).toEqual(['19', 'ACTAS']);
  });

  it('keeps unwrapping through a chain of nested lone wrapper folders', () => {
    const tree = buildFileTree([makeFile('Course/Only/nested/notes.pdf', 'new')]);
    expect(namesOf(tree)).toEqual(['notes.pdf']);
  });

  it('does not unwrap when there is more than one entry at the top level', () => {
    const tree = buildFileTree([makeFile('Course/a.pdf', 'new'), makeFile('Course2/b.pdf', 'new')]);
    expect(namesOf(tree)).toEqual(['Course', 'Course2']);
  });

  it('given a reference file list, only strips the wrapper that is actually redundant there — not real subfolders that merely happen to be alone in a filtered subset', () => {
    const allFiles = [
      makeFile('Course/Practica_0/HojaTrabajo.docx', 'new'),
      makeFile('Course/Practica_1/busqueda.cpp', 'new'),
      makeFile('Course/Practica_1/Guion.pdf', 'new')
    ];

    // "Course" is the one true redundant wrapper (single top-level folder across
    // the whole course) — but within this filtered-to-one-match subset, EVERY
    // ancestor (Course, then Practica_1) has exactly one child, so naively
    // unwrapping "while there's only one folder" would strip Practica_1 too.
    const searchResult = [allFiles[1]];

    const treeWithoutReference = buildFileTree(searchResult);
    expect(namesOf(treeWithoutReference)).toEqual(['busqueda.cpp']); // the bug

    const treeWithReference = buildFileTree(searchResult, allFiles);
    expect(namesOf(treeWithReference)).toEqual(['Practica_1']);
    const practica1 = treeWithReference[0] as FolderTreeNode;
    expect(namesOf(practica1.children)).toEqual(['busqueda.cpp']);
  });
});

describe('collectFolderStatuses', () => {
  it('returns an empty list for a folder with only unchanged files', () => {
    const tree = buildFileTree([
      makeFile('f/a.pdf', 'unchanged'),
      makeFile('f/b.pdf', 'unchanged'),
      makeFile('_sibling.pdf', 'unchanged')
    ]);
    expect(collectFolderStatuses(tree[0] as FolderTreeNode)).toEqual([]);
  });

  it('surfaces new/modified/deleted together when a folder has a mix, in a fixed order', () => {
    const tree = buildFileTree([
      makeFile('f/a.pdf', 'deleted'),
      makeFile('f/b.pdf', 'new'),
      makeFile('f/c.pdf', 'modified'),
      makeFile('f/d.pdf', 'unchanged'),
      makeFile('_sibling.pdf', 'unchanged')
    ]);
    expect(collectFolderStatuses(tree[0] as FolderTreeNode)).toEqual(['new', 'modified', 'deleted']);
  });

  it('aggregates recursively from nested subfolders', () => {
    const tree = buildFileTree([
      makeFile('parent/child/a.pdf', 'modified'),
      makeFile('parent/b.pdf', 'unchanged'),
      makeFile('_sibling.pdf', 'unchanged')
    ]);
    const parent = tree[0] as FolderTreeNode;
    expect(parent.name).toBe('parent');
    expect(collectFolderStatuses(parent)).toEqual(['modified']);
  });

  it('deduplicates repeated statuses across many files', () => {
    const tree = buildFileTree([
      makeFile('f/a.pdf', 'new'),
      makeFile('f/b.pdf', 'new'),
      makeFile('f/c.pdf', 'new'),
      makeFile('_sibling.pdf', 'unchanged')
    ]);
    expect(collectFolderStatuses(tree[0] as FolderTreeNode)).toEqual(['new']);
  });
});
