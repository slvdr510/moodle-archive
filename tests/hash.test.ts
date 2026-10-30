import { describe, expect, it } from 'vitest';
import { Sha256, sha256 } from '../src/lib/hash';

function randomBytes(size: number, seed: number): Uint8Array {
  const bytes = new Uint8Array(size);
  let x = seed;
  for (let i = 0; i < size; i++) {
    x = (Math.imul(x, 1103515245) + 12345) | 0;
    bytes[i] = x >>> 24;
  }
  return bytes;
}

function hashInPieces(bytes: Uint8Array, cuts: number[]): string {
  const hash = new Sha256();
  let start = 0;
  for (const cut of [...cuts, bytes.length]) {
    hash.update(bytes.subarray(start, cut));
    start = cut;
  }
  return hash.digestHex();
}

describe('Sha256, fed a piece at a time', () => {
  it('gives the standard digests', () => {
    expect(hashInPieces(new Uint8Array(0), [])).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(hashInPieces(new TextEncoder().encode('abc'), [])).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it("matches the browser's own for every length around a block's edges", async () => {
    for (let size = 0; size <= 200; size++) {
      const bytes = randomBytes(size, size);
      expect(hashInPieces(bytes, [])).toBe(await sha256(bytes));
    }
  });

  it('gives the same digest however the content is cut into pieces', async () => {
    const bytes = randomBytes(1_000_003, 7);
    const expected = await sha256(bytes);
    expect(hashInPieces(bytes, [1, 63, 64, 65, 1000, 4097, 500_000, 999_999])).toBe(expected);
    expect(hashInPieces(bytes, [0, 0, 128, 128])).toBe(expected);
  });
});
