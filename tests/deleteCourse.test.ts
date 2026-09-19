import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { courseStore, deleteCourse, fileStore, versionStore } from '../src/lib/db';
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
