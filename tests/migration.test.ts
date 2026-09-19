import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Regression + migration test: the project (and its database) used to be named
// "moodle-history". Anyone who already tracked courses there must not lose that
// data once the database is renamed to "moodle-archive" — and separately, some
// of those old records predate fields the current code relies on (`matchedUrls`
// on courses, `content` on versions), which must not crash the app either.

const LEGACY_DB_NAME = 'moodle-history';

async function seedLegacyV3Database(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(LEGACY_DB_NAME, 3);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('courses', { keyPath: 'id' });
      const files = db.createObjectStore('files', { keyPath: 'id' });
      files.createIndex('by-course', 'courseId');
      const versions = db.createObjectStore('versions', { keyPath: 'id' });
      versions.createIndex('by-file', 'fileId');
      db.createObjectStore('processedZips', { keyPath: 'id' });
      db.createObjectStore('config', { keyPath: 'key' });
      const recentOpens = db.createObjectStore('recentOpens', { keyPath: 'id' });
      recentOpens.createIndex('by-course', 'courseId');
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(['courses', 'files', 'versions'], 'readwrite');
      tx.objectStore('courses').put({
        id: 'course-old',
        name: 'Fisica',
        url: '',
        matchedZipNames: ['Fisica'],
        createdAt: Date.now()
      });
      tx.objectStore('files').put({
        id: 'course-old::notes.pdf',
        courseId: 'course-old',
        relativePath: 'notes.pdf',
        filename: 'notes.pdf',
        currentStatus: 'unchanged'
      });
      tx.objectStore('versions').put({
        id: 'course-old::notes.pdf::hash-a',
        fileId: 'course-old::notes.pdf',
        sha256: 'hash-a',
        size: 10,
        timestamp: Date.now(),
        sourceZip: 'Fisica.zip',
        repositoryFilePath: 'Fisica_repository/notes__2026-01-01.pdf'
      });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

describe('opening the renamed database for the first time, with an old "moodle-history" database present', () => {
  beforeEach(async () => {
    await seedLegacyV3Database();
    vi.resetModules();
  });

  it('carries the old course/file over, drops unusable old version rows, and does not throw', async () => {
    const { courseStore, versionStore } = await import('../src/lib/db');

    const courses = await courseStore.all();
    expect(courses).toHaveLength(1);
    expect(courses[0].name).toBe('Fisica');
    expect(courses[0].matchedUrls).toEqual([]);

    const versions = await versionStore.byFile('course-old::notes.pdf');
    expect(versions).toEqual([]); // no `content` to carry over — correctly dropped
  });

  it('leaves the old "moodle-history" database in place, untouched, as a safety net', async () => {
    const { courseStore } = await import('../src/lib/db');
    await courseStore.all(); // triggers the migration

    const databases = await indexedDB.databases();
    expect(databases.some((d) => d.name === LEGACY_DB_NAME)).toBe(true);
  });

  it('only migrates once — a second app start does not re-copy or duplicate anything', async () => {
    const { courseStore: firstOpen } = await import('../src/lib/db');
    await firstOpen.all();

    vi.resetModules();
    const { courseStore: secondOpen } = await import('../src/lib/db');
    const courses = await secondOpen.all();

    expect(courses).toHaveLength(1);
  });
});
