import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it } from 'vitest';
import { courseStore, fileStore, versionStore } from '../src/lib/db';
import { addManualFiles, markDeletedForCourse, processEntriesForCourse, processEntryBatchForCourse } from '../src/lib/repository';
import { sha256 } from '../src/lib/hash';
import type { Course, ExtractedEntry } from '../src/types';

async function buildEntries(files: Record<string, string>): Promise<ExtractedEntry[]> {
  const encoder = new TextEncoder();
  return Promise.all(
    Object.entries(files).map(async ([relativePath, text]) => {
      const content = encoder.encode(text);
      return {
        relativePath,
        content,
        sha256: await sha256(content),
        size: content.byteLength
      };
    })
  );
}

describe('processEntriesForCourse (integration)', () => {
  let course: Course;

  beforeAll(async () => {
    course = {
      id: crypto.randomUUID(),
      name: 'Course',
      url: 'https://moodle.example/course/view.php?id=1',
      matchedUrls: ['https://moodle.example/course/view.php?id=1'],
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
      order: 0,
      firstSyncCompleted: true,
      hidden: false
    };
    await courseStore.put(course);
  });

  it('stores a fresh snapshot as new files, with their content as Blobs', async () => {
    const entriesV1 = await buildEntries({ 'a.txt': 'A1', 'b.txt': 'B1', 'c.txt': 'C1' });

    const result = await processEntriesForCourse(course.id, entriesV1, 1_000);
    expect(result).toEqual({ created: 3, modified: 0, deleted: 0, unchanged: 0 });

    const files = await fileStore.byCourse(course.id);
    expect(files.map((f) => f.currentStatus).sort()).toEqual(['new', 'new', 'new']);

    const byPath = Object.fromEntries(files.map((f) => [f.relativePath, f]));
    const [version] = await versionStore.byFile(byPath['a.txt'].id);
    expect(await version.content.text()).toBe('A1');
  });

  it('on a second snapshot: dedups unchanged content by hash, versions changed files, flags removed ones as deleted', async () => {
    // a.txt changed, b.txt identical content, c.txt removed, d.txt added.
    const entriesV2 = await buildEntries({ 'a.txt': 'A2', 'b.txt': 'B1', 'd.txt': 'D1' });

    const result = await processEntriesForCourse(course.id, entriesV2, 2_000);
    expect(result).toEqual({
      created: 1, // d.txt
      modified: 1, // a.txt
      deleted: 1, // c.txt
      unchanged: 1 // b.txt
    });

    const files = await fileStore.byCourse(course.id);
    const byPath = Object.fromEntries(files.map((f) => [f.relativePath, f]));
    expect(byPath['a.txt'].currentStatus).toBe('modified');
    expect(byPath['b.txt'].currentStatus).toBe('unchanged');
    expect(byPath['c.txt'].currentStatus).toBe('deleted');
    expect(byPath['d.txt'].currentStatus).toBe('new');

    const aVersions = await versionStore.byFile(byPath['a.txt'].id);
    const bVersions = await versionStore.byFile(byPath['b.txt'].id);
    const cVersions = await versionStore.byFile(byPath['c.txt'].id);
    const dVersions = await versionStore.byFile(byPath['d.txt'].id);
    expect(aVersions).toHaveLength(2);
    expect(bVersions).toHaveLength(1); // duplicate content never got a 2nd version
    expect(cVersions).toHaveLength(1); // untouched history, just marked deleted
    expect(dVersions).toHaveLength(1);
  });
});

describe('processEntryBatchForCourse + markDeletedForCourse (chunked snapshot)', () => {
  it('splitting a snapshot across several batches gives the same result as one big call', async () => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: 'Chunked Course',
      url: '',
      matchedUrls: [],
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
      order: 0,
      firstSyncCompleted: true,
      hidden: false
    };
    await courseStore.put(course);

    // First "snapshot" (one batch), establishing a.txt/b.txt/c.txt as known.
    const entriesV1 = await buildEntries({ 'a.txt': 'A1', 'b.txt': 'B1', 'c.txt': 'C1' });
    await processEntryBatchForCourse(course.id, entriesV1, 1_000);
    await markDeletedForCourse(
      course.id,
      entriesV1.map((e) => e.relativePath),
      1_000
    );

    // Second snapshot arrives as two chunks: a.txt changed + d.txt new in chunk 1,
    // b.txt unchanged in chunk 2. c.txt is absent from both chunks, so it should
    // only be flagged deleted once, after both chunks are in.
    const chunk1 = await buildEntries({ 'a.txt': 'A2', 'd.txt': 'D1' });
    const chunk2 = await buildEntries({ 'b.txt': 'B1' });

    const result1 = await processEntryBatchForCourse(course.id, chunk1, 2_000);
    expect(result1).toEqual({ created: 1, modified: 1, deleted: 0, unchanged: 0 });

    const result2 = await processEntryBatchForCourse(course.id, chunk2, 2_000);
    expect(result2).toEqual({ created: 0, modified: 0, deleted: 0, unchanged: 1 });

    const allRelativePaths = [...chunk1, ...chunk2].map((e) => e.relativePath);
    const deletedCount = await markDeletedForCourse(course.id, allRelativePaths, 2_000);
    expect(deletedCount).toBe(1); // c.txt

    const files = await fileStore.byCourse(course.id);
    const byPath = Object.fromEntries(files.map((f) => [f.relativePath, f]));
    expect(byPath['a.txt'].currentStatus).toBe('modified');
    expect(byPath['b.txt'].currentStatus).toBe('unchanged');
    expect(byPath['c.txt'].currentStatus).toBe('deleted');
    expect(byPath['d.txt'].currentStatus).toBe('new');
  });

  it('does not re-flag an already-deleted file that is still absent', async () => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: 'Course with a stale deletion',
      url: '',
      matchedUrls: [],
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
      order: 0,
      firstSyncCompleted: true,
      hidden: false
    };
    await courseStore.put(course);

    const entries = await buildEntries({ 'a.txt': 'A1', 'b.txt': 'B1' });
    await processEntryBatchForCourse(course.id, entries, 1_000);
    await markDeletedForCourse(course.id, ['a.txt'], 1_000); // b.txt disappears, gets deleted

    const deletedAgain = await markDeletedForCourse(course.id, ['a.txt'], 2_000);
    expect(deletedAgain).toBe(0); // already deleted, not counted a second time
  });
});

describe('isFirstSync suppresses the "new" status on a course\'s first download', () => {
  it('stores every file as unchanged (not new) when isFirstSync is true', async () => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: 'Brand New Course',
      url: '',
      matchedUrls: [],
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
      order: 0,
      firstSyncCompleted: false,
      hidden: false
    };
    await courseStore.put(course);

    const entries = await buildEntries({ 'a.txt': 'A1', 'b.txt': 'B1' });
    const result = await processEntriesForCourse(course.id, entries, 1_000, true);

    expect(result).toEqual({ created: 0, modified: 0, deleted: 0, unchanged: 2 });

    const files = await fileStore.byCourse(course.id);
    expect(files.map((f) => f.currentStatus).sort()).toEqual(['unchanged', 'unchanged']);
  });

  it('marks genuinely new files as new on a later, non-first sync', async () => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: 'Course past its first sync',
      url: '',
      matchedUrls: [],
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
      order: 0,
      firstSyncCompleted: false,
      hidden: false
    };
    await courseStore.put(course);

    await processEntriesForCourse(course.id, await buildEntries({ 'a.txt': 'A1' }), 1_000, true);

    const entriesV2 = await buildEntries({ 'a.txt': 'A1', 'b.txt': 'B1' });
    const result = await processEntriesForCourse(course.id, entriesV2, 2_000, false);

    expect(result).toEqual({ created: 1, modified: 0, deleted: 0, unchanged: 1 });

    const files = await fileStore.byCourse(course.id);
    const byPath = Object.fromEntries(files.map((f) => [f.relativePath, f]));
    expect(byPath['a.txt'].currentStatus).toBe('unchanged');
    expect(byPath['b.txt'].currentStatus).toBe('new');
  });
});

describe('processEntriesForCourse for a brand new course', () => {
  it('stores every entry as new, since nothing was known before', async () => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: 'Another Course',
      url: '',
      matchedUrls: [],
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
      order: 0,
      firstSyncCompleted: true,
      hidden: false
    };
    await courseStore.put(course);

    const entries = await buildEntries({ 'notes.txt': 'N1' });
    const result = await processEntriesForCourse(course.id, entries, 1_000);

    expect(result).toEqual({ created: 1, modified: 0, deleted: 0, unchanged: 0 });
  });
});

describe('addManualFiles (integration)', () => {
  const encoder = new TextEncoder();

  async function makeCourse(): Promise<Course> {
    const course: Course = {
      id: crypto.randomUUID(),
      name: 'Manual',
      url: '',
      matchedUrls: [],
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
      order: 0,
      firstSyncCompleted: true,
      hidden: false
    };
    await courseStore.put(course);
    return course;
  }

  it('stores a new file with its content, flagged manual and not badged as new', async () => {
    const course = await makeCourse();
    await addManualFiles(course.id, [{ relativePath: 'IRC/Tema_1/notes.txt', content: encoder.encode('hello') }], 1_000);

    const [file] = await fileStore.byCourse(course.id);
    expect(file).toMatchObject({ relativePath: 'IRC/Tema_1/notes.txt', filename: 'notes.txt', currentStatus: 'unchanged', manual: true });
    const [version] = await versionStore.byFile(file.id);
    expect(await version.content.text()).toBe('hello');
  });

  it('adds different content at an existing path as a new version, and ignores identical content', async () => {
    const course = await makeCourse();
    const path = 'a.txt';
    await addManualFiles(course.id, [{ relativePath: path, content: encoder.encode('v1') }], 1_000);
    await addManualFiles(course.id, [{ relativePath: path, content: encoder.encode('v2') }], 2_000);

    const [file] = await fileStore.byCourse(course.id);
    expect(await versionStore.byFile(file.id)).toHaveLength(2);
    expect(file.currentStatus).toBe('unchanged');

    await addManualFiles(course.id, [{ relativePath: path, content: encoder.encode('v2') }], 3_000);
    expect(await versionStore.byFile(file.id)).toHaveLength(2);
  });

  it('adds a version to a file that is still in Moodle, without touching the course\'s other files', async () => {
    const course = await makeCourse();
    await processEntriesForCourse(course.id, await buildEntries({ 'Tema/a.txt': 'from moodle', 'Tema/b.txt': 'other' }), 1_000, true);

    await addManualFiles(course.id, [{ relativePath: 'Tema/a.txt', content: encoder.encode('my update') }], 2_000);

    const byPath = Object.fromEntries((await fileStore.byCourse(course.id)).map((f) => [f.relativePath, f]));
    expect(Object.keys(byPath).sort()).toEqual(['Tema/a.txt', 'Tema/b.txt']);
    const versions = await versionStore.byFile(byPath['Tema/a.txt'].id);
    expect(await Promise.all(versions.map((v) => v.content.text()))).toEqual(['from moodle', 'my update']);
    expect(await versionStore.byFile(byPath['Tema/b.txt'].id)).toHaveLength(1);
    expect(byPath['Tema/b.txt'].manual).toBeUndefined();
  });

  it('replaces a file Moodle already dropped: it comes back to life and stays, instead of being flagged deleted again', async () => {
    const course = await makeCourse();
    await processEntriesForCourse(course.id, await buildEntries({ 'old.txt': 'from moodle' }), 1_000);
    await processEntriesForCourse(course.id, [], 2_000);
    expect((await fileStore.byCourse(course.id))[0].currentStatus).toBe('deleted');

    await addManualFiles(course.id, [{ relativePath: 'old.txt', content: encoder.encode('mine') }], 3_000);
    let [file] = await fileStore.byCourse(course.id);
    expect(file).toMatchObject({ currentStatus: 'unchanged', manual: true });
    expect(file.deletedAt).toBeUndefined();
    expect(await versionStore.byFile(file.id)).toHaveLength(2);

    // Another download that still doesn't include it.
    await processEntriesForCourse(course.id, [], 4_000);
    [file] = await fileStore.byCourse(course.id);
    expect(file.currentStatus).toBe('unchanged');
  });

  it('is not marked deleted by a later download that does not include it, while Moodle files still are', async () => {
    const course = await makeCourse();
    await addManualFiles(course.id, [{ relativePath: 'mine.txt', content: encoder.encode('mine') }], 1_000);
    await processEntriesForCourse(course.id, await buildEntries({ 'moodle.txt': 'm' }), 2_000);

    // A second download in which the Moodle file has vanished.
    await processEntriesForCourse(course.id, [], 3_000);

    const byPath = Object.fromEntries((await fileStore.byCourse(course.id)).map((f) => [f.relativePath, f]));
    expect(byPath['mine.txt'].currentStatus).toBe('unchanged');
    expect(byPath['moodle.txt'].currentStatus).toBe('deleted');
  });
});
