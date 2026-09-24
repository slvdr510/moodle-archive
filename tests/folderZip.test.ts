import 'fake-indexeddb/auto';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { fileStore, versionStore } from '../src/lib/db';
import { buildFolderZip } from '../src/lib/folderZip';
import type { FileRecord } from '../src/types';

async function addFile(relativePath: string, versions: string[]): Promise<FileRecord> {
  const file: FileRecord = {
    id: `c::${relativePath}`,
    courseId: 'c',
    relativePath,
    filename: relativePath.split('/').pop()!,
    currentStatus: 'unchanged'
  };
  await fileStore.put(file);
  for (const [index, text] of versions.entries()) {
    await versionStore.put({
      id: `${file.id}::${index}`,
      fileId: file.id,
      sha256: `hash-${index}`,
      size: text.length,
      timestamp: 1_000 + index,
      content: new Blob([text])
    });
  }
  return file;
}

describe('buildFolderZip', () => {
  it('zips the latest version of every file, keeping the structure below the folder inside one top-level folder', async () => {
    const files = [
      await addFile('IRC/Tema/a.txt', ['old a', 'new a']),
      await addFile('IRC/Tema/sub/b.txt', ['b'])
    ];

    const blob = await buildFolderZip('Tema', 'IRC/Tema', files);
    const zip = await JSZip.loadAsync(blob);

    const paths = Object.values(zip.files)
      .filter((entry) => !entry.dir)
      .map((entry) => entry.name)
      .sort();
    expect(paths).toEqual(['Tema/a.txt', 'Tema/sub/b.txt']);
    expect(await zip.file('Tema/a.txt')!.async('string')).toBe('new a');
  });

  it('skips a file that has no saved version', async () => {
    const withVersion = await addFile('F/x.txt', ['x']);
    const withoutVersion = await addFile('F/y.txt', []);

    const zip = await JSZip.loadAsync(await buildFolderZip('F', 'F', [withVersion, withoutVersion]));

    expect(Object.keys(zip.files).filter((name) => !name.endsWith('/'))).toEqual(['F/x.txt']);
  });
});
