import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import {
  NO_IGNORE_RULES,
  cleanIgnoredPath,
  displayPath,
  ignoredPathMatchesAny,
  ignoreState,
  isIgnoredFolder,
  isIgnoredPath,
  toggleIgnoredPath
} from '../src/lib/ignoredFiles';
import { courseStore, fileStore, versionStore } from '../src/lib/db';
import { sha256 } from '../src/lib/hash';
import { ignoreRulesFor, ignoredFilesFor, markDeletedForCourse, processEntryBatchForCourse } from '../src/lib/repository';
import type { Course, ExtractedEntry } from '../src/types';

const ROOT = 'Sistemas_Operativos';

describe('ignored paths', () => {
  it('tidies a typed path', () => {
    expect(cleanIgnoredPath('  /Tema 1\\ apuntes.pdf ')).toBe('Tema 1/apuntes.pdf');
    expect(cleanIgnoredPath(' / ')).toBe('');
  });

  it('tells apart files with the same name in different folders', () => {
    expect(isIgnoredPath(`${ROOT}/apuntes.pdf`, ROOT, ['apuntes.pdf'])).toBe(true);
    expect(isIgnoredPath(`${ROOT}/Tema_1/apuntes.pdf`, ROOT, ['apuntes.pdf'])).toBe(false);
    expect(isIgnoredPath(`${ROOT}/Tema_1/apuntes.pdf`, ROOT, ['Tema_1/apuntes.pdf'])).toBe(true);
    expect(isIgnoredPath(`${ROOT}/apuntes.pdf`, ROOT, ['Tema_1/apuntes.pdf'])).toBe(false);
  });

  it('matches a path typed the way Moodle shows the name', () => {
    expect(isIgnoredPath(`${ROOT}/Tema_1/Apuntes_v2.pdf`, ROOT, ['Tema 1/Apuntes (v2).pdf'])).toBe(true);
    expect(isIgnoredPath(`${ROOT}/Diseno/notas.pdf`, ROOT, ['diseño/NOTAS.pdf'])).toBe(true);
  });

  it('needs the extension', () => {
    expect(isIgnoredPath(`${ROOT}/apuntes.pdf`, ROOT, ['apuntes'])).toBe(false);
  });

  it('works for a course with no hidden root folder', () => {
    expect(displayPath('Tema_1/a.pdf', '')).toBe('Tema_1/a.pdf');
    expect(isIgnoredPath('Tema_1/a.pdf', '', ['Tema_1/a.pdf'])).toBe(true);
  });

  it('keeps the trailing slash that marks a folder', () => {
    expect(cleanIgnoredPath(' Tema 1 / ')).toBe('Tema 1/');
    expect(cleanIgnoredPath('Tema 1\\')).toBe('Tema 1/');
  });

  it('ignores a whole folder, at any depth, and nothing outside it', () => {
    const ignored = ['Tema 1/'];
    expect(isIgnoredPath(`${ROOT}/Tema_1/a.pdf`, ROOT, ignored)).toBe(true);
    expect(isIgnoredPath(`${ROOT}/Tema_1/Practicas/b.pdf`, ROOT, ignored)).toBe(true);
    expect(isIgnoredPath(`${ROOT}/Tema_10/a.pdf`, ROOT, ignored)).toBe(false);
    expect(isIgnoredPath(`${ROOT}/Tema_1.pdf`, ROOT, ignored)).toBe(false);
    expect(isIgnoredPath(`${ROOT}/Otro/Tema_1/a.pdf`, ROOT, ignored)).toBe(false);
  });

  it('tells a folder ignored itself from one ignored by a folder it is in', () => {
    const ignored = ['Tema_1/'];
    expect(ignoreState('Tema_1', ignored, true)).toBe('self');
    expect(ignoreState('Tema_1/Practicas', ignored, true)).toBe('folder');
    expect(ignoreState('Tema_1/a.pdf', ignored)).toBe('folder');
    expect(ignoreState('Tema_1', ignored)).toBe('none'); // a file named like the folder
    expect(ignoreState('a.pdf', ['a.pdf'])).toBe('self');
  });

  it('says whether a whole folder is ignored, before knowing what is in it', () => {
    expect(isIgnoredFolder(`${ROOT}/Tema_1`, ROOT, ['Tema 1/'])).toBe(true);
    expect(isIgnoredFolder(`${ROOT}/Tema_1/Practicas`, ROOT, ['Tema 1/'])).toBe(true);
    expect(isIgnoredFolder(`${ROOT}/Tema_10`, ROOT, ['Tema 1/'])).toBe(false);
    expect(isIgnoredFolder(`${ROOT}/Tema_1`, ROOT, ['Tema_1/a.pdf'])).toBe(false); // only one file in it
    expect(isIgnoredFolder(`${ROOT}/Tema_1`, ROOT, ['Tema_1'])).toBe(false); // a file named like it
    expect(isIgnoredFolder(ROOT, ROOT, [`${ROOT}/`])).toBe(false); // the root, never
    expect(isIgnoredFolder('Tema_1', '', ['Tema_1/'])).toBe(true);
  });

  it('says whether an ignored path matches any file of the course yet', () => {
    const files = ['Tema_1/a.pdf', 'b.pdf'];
    expect(ignoredPathMatchesAny('Tema 1/', files)).toBe(true);
    expect(ignoredPathMatchesAny('b.pdf', files)).toBe(true);
    expect(ignoredPathMatchesAny('Tema_2/', files)).toBe(false);
  });

  it('toggles a path on and off', () => {
    const on = toggleIgnoredPath(undefined, 'Tema_1/a.pdf');
    expect(on).toEqual(['Tema_1/a.pdf']);
    expect(toggleIgnoredPath(on, 'tema 1/A.pdf')).toEqual([]);
  });
});

async function entry(relativePath: string, text: string): Promise<ExtractedEntry> {
  const content = new TextEncoder().encode(text);
  return { relativePath, content, sha256: await sha256(content), size: content.byteLength };
}

function newCourse(): Course {
  return {
    id: crypto.randomUUID(),
    name: 'Sistemas Operativos',
    url: '',
    matchedUrls: [],
    createdAt: 0,
    lastSyncedAt: 0,
    order: 0,
    firstSyncCompleted: true,
    hidden: false
  };
}

describe('ignoreRulesFor (integration)', () => {
  it("gives the downloader a course's ignored paths and the root they're relative to", async () => {
    const course = newCourse();
    await courseStore.put(course);
    await processEntryBatchForCourse(course.id, [await entry(`${ROOT}/a.pdf`, 'a'), await entry(`${ROOT}/Tema_1/b.pdf`, 'b')], 1, true);

    expect(await ignoreRulesFor({ ...course, ignoredPaths: ['Tema 1/'] })).toEqual({ ignoredPaths: ['Tema 1/'], rootPath: ROOT });
    expect(await ignoreRulesFor(course)).toEqual(NO_IGNORE_RULES);
  });
});

describe('ignoredFilesFor (integration)', () => {
  it('leaves an ignored file as it is on a later download, and only that one', async () => {
    const course = newCourse();
    await courseStore.put(course);
    await processEntryBatchForCourse(
      course.id,
      [
        await entry(`${ROOT}/apuntes.pdf`, 'root v1'),
        await entry(`${ROOT}/Tema_1/apuntes.pdf`, 'tema v1'),
        await entry(`${ROOT}/Tema_1/borrar.pdf`, 'gone v1')
      ],
      1,
      true
    );

    // Ignore the root apuntes.pdf, the soon-gone borrar.pdf, and a file not tracked yet.
    const ignored = await ignoredFilesFor({ ...course, ignoredPaths: ['apuntes.pdf', 'Tema 1/borrar.pdf', 'nuevo.pdf'] });

    // The next download: both apuntes.pdf changed, borrar.pdf is gone, nuevo.pdf appeared.
    const crawled = [
      await entry(`${ROOT}/apuntes.pdf`, 'root v2'),
      await entry(`${ROOT}/Tema_1/apuntes.pdf`, 'tema v2'),
      await entry(`${ROOT}/nuevo.pdf`, 'new')
    ];
    await processEntryBatchForCourse(course.id, crawled.filter((e) => !ignored.isIgnored(e.relativePath)), 2);
    await markDeletedForCourse(course.id, [...crawled.map((e) => e.relativePath), ...ignored.trackedPaths], 2);

    const files = new Map((await fileStore.byCourse(course.id)).map((f) => [f.relativePath, f]));
    const versionCount = async (path: string) => (await versionStore.byFile(files.get(path)!.id)).length;

    expect(await versionCount(`${ROOT}/apuntes.pdf`)).toBe(1); // ignored: no new version
    expect(await versionCount(`${ROOT}/Tema_1/apuntes.pdf`)).toBe(2); // same name, other folder: updated
    expect(files.get(`${ROOT}/Tema_1/borrar.pdf`)?.currentStatus).toBe('unchanged'); // ignored: not marked deleted
    expect(files.has(`${ROOT}/nuevo.pdf`)).toBe(false); // ignored before it was ever tracked: never added
  });
});

describe('a download that never fetched the ignored files (integration)', () => {
  it('keeps the ignored ones it already had, and still notices files gone from Moodle', async () => {
    const course = newCourse();
    await courseStore.put(course);
    await processEntryBatchForCourse(
      course.id,
      [
        await entry(`${ROOT}/apuntes.pdf`, 'apuntes'),
        await entry(`${ROOT}/Videos/clase1.mp4`, 'video'),
        await entry(`${ROOT}/Videos/clase2.mp4`, 'video 2'),
        await entry(`${ROOT}/borrado.pdf`, 'gone')
      ],
      1,
      true
    );
    const ignored = await ignoredFilesFor({ ...course, ignoredPaths: ['Videos/'] });

    // The downloader left Videos/ out entirely, and borrado.pdf is gone from Moodle:
    // only apuntes.pdf comes back.
    const crawled = [await entry(`${ROOT}/apuntes.pdf`, 'apuntes')];
    await processEntryBatchForCourse(course.id, crawled, 2);
    await markDeletedForCourse(course.id, [...crawled.map((e) => e.relativePath), ...ignored.trackedPaths], 2);

    const status = new Map((await fileStore.byCourse(course.id)).map((f) => [f.relativePath, f.currentStatus]));
    expect(status.get(`${ROOT}/Videos/clase1.mp4`)).toBe('unchanged');
    expect(status.get(`${ROOT}/Videos/clase2.mp4`)).toBe('unchanged');
    expect(status.get(`${ROOT}/borrado.pdf`)).toBe('deleted');
  });
});
