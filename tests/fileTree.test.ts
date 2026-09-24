import { describe, expect, it } from 'vitest';
import {
  buildFileTree,
  collectFolderFiles,
  collectFolderStatuses,
  getRootFolderPath,
  listFolders,
  type FolderTreeNode,
  type TreeNode
} from '../src/lib/fileTree';
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

  it('shows a single Modified when a folder has both new and deleted files', () => {
    const tree = buildFileTree([
      makeFile('f/a.pdf', 'deleted'),
      makeFile('f/b.pdf', 'new'),
      makeFile('f/d.pdf', 'unchanged'),
      makeFile('_sibling.pdf', 'unchanged')
    ]);
    expect(collectFolderStatuses(tree[0] as FolderTreeNode)).toEqual(['modified']);
  });

  it('does not duplicate Modified when the folder also has modified files', () => {
    const tree = buildFileTree([
      makeFile('f/a.pdf', 'deleted'),
      makeFile('f/b.pdf', 'new'),
      makeFile('f/c.pdf', 'modified'),
      makeFile('_sibling.pdf', 'unchanged')
    ]);
    expect(collectFolderStatuses(tree[0] as FolderTreeNode)).toEqual(['modified']);
  });

  it('keeps new + modified, or modified + deleted, as separate badges — only new + deleted merge', () => {
    const newAndModified = buildFileTree([
      makeFile('f/a.pdf', 'new'),
      makeFile('f/b.pdf', 'modified'),
      makeFile('_sibling.pdf', 'unchanged')
    ]);
    expect(collectFolderStatuses(newAndModified[0] as FolderTreeNode)).toEqual(['new', 'modified']);

    const modifiedAndDeleted = buildFileTree([
      makeFile('f/a.pdf', 'modified'),
      makeFile('f/b.pdf', 'deleted'),
      makeFile('_sibling.pdf', 'unchanged')
    ]);
    expect(collectFolderStatuses(modifiedAndDeleted[0] as FolderTreeNode)).toEqual(['modified', 'deleted']);
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

describe('getRootFolderPath', () => {
  it('is the hidden wrapper folder that buildFileTree strips from the top', () => {
    const files = [makeFile('IRC/a.pdf', 'unchanged'), makeFile('IRC/Tema_1/b.pdf', 'unchanged')];
    expect(getRootFolderPath(files)).toBe('IRC');
    expect(namesOf(buildFileTree(files))).toEqual(['Tema_1', 'a.pdf']);
  });

  it('includes every wrapper level when several are stripped', () => {
    const files = [makeFile('A/B/a.pdf', 'unchanged'), makeFile('A/B/c/d.pdf', 'unchanged')];
    expect(getRootFolderPath(files)).toBe('A/B');
  });

  it('is empty when nothing is stripped, or there are no files', () => {
    expect(getRootFolderPath([makeFile('a.pdf', 'unchanged'), makeFile('F/b.pdf', 'unchanged')])).toBe('');
    expect(getRootFolderPath([])).toBe('');
  });
});

describe('collectFolderFiles and listFolders', () => {
  const files = [
    makeFile('W/a/x.pdf', 'unchanged'),
    makeFile('W/a/deep/y.pdf', 'unchanged'),
    makeFile('W/b/z.pdf', 'unchanged'),
    makeFile('W/top.pdf', 'unchanged')
  ];

  it('collects every file under a folder at any depth', () => {
    const folderA = buildFileTree(files).find((n) => n.name === 'a') as FolderTreeNode;
    expect(collectFolderFiles(folderA).map((f) => f.relativePath).sort()).toEqual(['W/a/deep/y.pdf', 'W/a/x.pdf']);
  });

  it('lists every folder with its real path and depth, in display order', () => {
    expect(listFolders(buildFileTree(files))).toEqual([
      { path: 'W/a', name: 'a', depth: 0 },
      { path: 'W/a/deep', name: 'deep', depth: 1 },
      { path: 'W/b', name: 'b', depth: 0 }
    ]);
  });
});

describe('manually added files and the hidden wrapper folder', () => {
  const manual = (path: string): FileRecord => ({ ...makeFile(path, 'unchanged'), manual: true });

  it('does not treat a folder made of manual files as a redundant wrapper', () => {
    const files = [manual('Nueva/a.pdf')];
    expect(getRootFolderPath(files)).toBe('');
    expect(namesOf(buildFileTree(files))).toEqual(['Nueva']);
  });

  it('still strips the crawled wrapper, with manual files sitting inside it', () => {
    const files = [makeFile('Curso/a.pdf', 'unchanged'), makeFile('Curso/b/c.pdf', 'unchanged'), manual('Curso/Nueva/d.pdf')];
    expect(getRootFolderPath(files)).toBe('Curso');
    expect(namesOf(buildFileTree(files))).toEqual(['b', 'Nueva', 'a.pdf']);
  });
});
