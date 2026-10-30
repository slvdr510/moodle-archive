import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { courseStore } from '../src/lib/db';

function openNewerVersion(): Promise<number | 'blocked'> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('moodle-archive', 99);
    request.onblocked = () => resolve('blocked');
    request.onsuccess = () => {
      request.result.close();
      resolve(request.result.version);
    };
    request.onerror = () => reject(request.error);
  });
}

describe('a newer version of the extension upgrading the database (integration)', () => {
  it('is not kept waiting by this code holding the database open', async () => {
    await courseStore.all(); // opens the database, and keeps it open

    expect(await openNewerVersion()).toBe(99);
    // This older code is what fails now, not the newer one.
    await expect(courseStore.all()).rejects.toThrow();
  });
});
