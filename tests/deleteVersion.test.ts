import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { deleteVersion, versionStore } from '../src/lib/db';
import type { VersionRecord } from '../src/types';

function makeVersion(id: string, timestamp: number): VersionRecord {
  return { id, fileId: 'file-1', sha256: id, size: 1, timestamp, content: new Blob([id]) };
}

describe('deleteVersion', () => {
  it('deletes an older version but refuses the latest, which the next download compares against', async () => {
    const older = makeVersion('old', 1);
    const latest = makeVersion('new', 2);
    await versionStore.put(older);
    await versionStore.put(latest);

    await expect(deleteVersion(latest)).rejects.toThrow();
    await deleteVersion(older);

    expect((await versionStore.byFile('file-1')).map((v) => v.id)).toEqual(['new']);
  });
});
