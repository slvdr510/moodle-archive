import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { stagingStore } from '../src/lib/db';
import { sha256 } from '../src/lib/hash';
import { unstageEntry } from '../src/lib/repository';

const bytes = (text: string) => new TextEncoder().encode(text);

function put(downloadId: string, relativePath: string, index: number, text: string): Promise<void> {
  return stagingStore.put({ downloadId, relativePath, index, content: new Blob([bytes(text)]) });
}

describe('files sent piece by piece (integration)', () => {
  it('puts a file back together in order, whatever order its pieces came in', async () => {
    await put('d1', 'Curso/a.pdf', 1, 'world');
    await put('d1', 'Curso/a.pdf', 0, 'hello ');

    const entry = await unstageEntry('d1', 'Curso/a.pdf', 2);

    expect(await new Blob([entry.content as BlobPart]).text()).toBe('hello world');
    expect(entry).toMatchObject({ relativePath: 'Curso/a.pdf', size: 11, sha256: await sha256(bytes('hello world')) });
  });

  it("leaves out a longer failed try's last pieces, and other files' and downloads' pieces", async () => {
    await put('d2', 'Curso/a.pdf', 0, 'first try, part 1');
    await put('d2', 'Curso/a.pdf', 1, 'first try, part 2');
    await put('d2', 'Curso/a.pdf', 0, 'second try'); // the retry came down in one piece
    await put('d2', 'Curso/a.pdf2', 0, 'another file');
    await put('d3', 'Curso/a.pdf', 0, 'another download');

    const entry = await unstageEntry('d2', 'Curso/a.pdf', 1);

    expect(await new Blob([entry.content as BlobPart]).text()).toBe('second try');
  });

  it('hashes a file too big to read whole a piece at a time, to the same digest', async () => {
    const piece = new Uint8Array(8 * 1024 * 1024).map((_, i) => i % 251);
    const count = 9; // 72 MiB, past the size read whole
    for (let index = 0; index < count; index++) {
      await stagingStore.put({ downloadId: 'big', relativePath: 'Curso/video.mp4', index, content: new Blob([piece]) });
    }

    const entry = await unstageEntry('big', 'Curso/video.mp4', count);

    const whole = new Uint8Array(piece.length * count);
    for (let index = 0; index < count; index++) whole.set(piece, index * piece.length);
    expect(entry.size).toBe(whole.length);
    expect(entry.sha256).toBe(await sha256(whole));
  });

  it('refuses a file missing a piece, rather than store part of it', async () => {
    await put('d4', 'Curso/a.pdf', 0, 'start');
    await put('d4', 'Curso/a.pdf', 2, 'end');

    await expect(unstageEntry('d4', 'Curso/a.pdf', 3)).rejects.toThrow('did not arrive whole');
  });

  it('drops every piece of a file, past its last one too, and nothing else', async () => {
    for (const index of [0, 1, 2]) await put('d5', 'Curso/a.pdf', index, `part ${index}`);
    await put('d5', 'Curso/b.pdf', 0, 'b');

    await stagingStore.removeFile('d5', 'Curso/a.pdf');

    expect(await stagingStore.pieces('d5', 'Curso/a.pdf', 3)).toEqual([]);
    expect(await stagingStore.pieces('d5', 'Curso/b.pdf', 1)).toHaveLength(1);

    await stagingStore.clear();
    expect(await stagingStore.pieces('d5', 'Curso/b.pdf', 1)).toEqual([]);
  });
});
