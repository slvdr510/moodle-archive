import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { courseStore, fileStore, recentOpenStore, resetTrackedData, versionStore } from '../src/lib/db';
import type { Course, FileRecord, VersionRecord } from '../src/types';

describe('resetTrackedData', () => {
  it('clears courses, files, versions, and recent-opens', async () => {
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

    await recentOpenStore.recordOpen({
      id: `${course.id}::${file.id}`,
      courseId: course.id,
      fileId: file.id,
      relativePath: 'notes.pdf',
      filename: 'notes.pdf',
      openedAt: Date.now()
    });

    await resetTrackedData();

    expect(await courseStore.all()).toEqual([]);
    expect(await fileStore.get(file.id)).toBeUndefined();
    expect(await versionStore.byFile(file.id)).toEqual([]);
    expect(await recentOpenStore.byCourse(course.id)).toEqual([]);
  });
});
