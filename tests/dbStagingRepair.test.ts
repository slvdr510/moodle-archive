import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it } from 'vitest';

// A development build, caught halfway through adding the `staging` store, opened
// databases at version 5 without creating it — every download then failed with
// "One of the specified object stores was not found".
beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('moodle-archive', 5);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('courses', { keyPath: 'id' });
      db.createObjectStore('files', { keyPath: 'id' }).createIndex('by-course', 'courseId');
      db.createObjectStore('versions', { keyPath: 'id' }).createIndex('by-file', 'fileId');
      db.createObjectStore('recentOpens', { keyPath: 'id' }).createIndex('by-course', 'courseId');
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('courses', 'readwrite');
      tx.objectStore('courses').put({ id: 'c1', name: 'Redes', url: '', matchedUrls: [], createdAt: 1, lastSyncedAt: 1, order: 1, firstSyncCompleted: true, hidden: false });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    };
    request.onerror = () => reject(request.error);
  });
});

describe('a database left at version 5 without the staging store (integration)', () => {
  it('gets the store, keeping everything it had', async () => {
    const { courseStore, stagingStore } = await import('../src/lib/db');

    await stagingStore.put({ downloadId: 'd', relativePath: 'Redes/a.pdf', index: 0, content: new Blob(['a']) });

    expect(await stagingStore.pieces('d', 'Redes/a.pdf', 1)).toHaveLength(1);
    expect((await courseStore.all()).map((c) => c.name)).toEqual(['Redes']);
  });
});
