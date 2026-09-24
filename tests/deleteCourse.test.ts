import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { courseStore, deleteCourse, deleteFile, fileStore, recentOpenStore, versionStore } from '../src/lib/db';
import type { Course, FileRecord, VersionRecord } from '../src/types';

describe('deleteCourse', () => {
  it('removes the course and all of its tracked file/version metadata', async () => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: 'Fisica',
      url: '',
      matchedUrls: ['https://moodle.example/course/view.php?id=1'],
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
      order: 0,
      firstSyncCompleted: true,
      hidden: false
    };
    await courseStore.put(course);

    const file: FileRecord = {
      id: `${course.id}::notes.pdf`,
      courseId: course.id,
      relativePath: 'notes.pdf',
      filename: 'notes.pdf',
      currentStatus: 'new'
    };
    await fileStore.put(file);

    const version: VersionRecord = {
      id: `${file.id}::hash-a`,
      fileId: file.id,
      sha256: 'hash-a',
      size: 10,
      timestamp: Date.now(),
      content: new Blob(['hello'])
    };
    await versionStore.put(version);

    await deleteCourse(course.id);

    expect(await courseStore.get(course.id)).toBeUndefined();
    expect(await fileStore.get(file.id)).toBeUndefined();
    expect(await versionStore.byFile(file.id)).toEqual([]);
  });
});

describe('deleteFile', () => {
  it('removes the file, its versions and its recent-open entry, leaving sibling files alone', async () => {
    const courseId = crypto.randomUUID();
    const makeFile = (name: string): FileRecord => ({
      id: `${courseId}::${name}`,
      courseId,
      relativePath: name,
      filename: name,
      currentStatus: 'unchanged'
    });
    const target = makeFile('a.pdf');
    const sibling = makeFile('b.pdf');
    for (const file of [target, sibling]) {
      await fileStore.put(file);
      await versionStore.put({
        id: `${file.id}::hash`,
        fileId: file.id,
        sha256: 'hash',
        size: 1,
        timestamp: Date.now(),
        content: new Blob(['x'])
      });
      await recentOpenStore.recordOpen({
        id: `${courseId}::${file.id}`,
        courseId,
        fileId: file.id,
        relativePath: file.relativePath,
        filename: file.filename,
        openedAt: Date.now()
      });
    }

    await deleteFile(target);

    expect(await fileStore.get(target.id)).toBeUndefined();
    expect(await versionStore.byFile(target.id)).toEqual([]);
    expect((await recentOpenStore.byCourse(courseId)).map((r) => r.fileId)).toEqual([sibling.id]);
    expect(await fileStore.get(sibling.id)).toBeDefined();
    expect(await versionStore.byFile(sibling.id)).toHaveLength(1);
  });
});
