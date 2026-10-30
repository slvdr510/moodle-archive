import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { base64ToBytes, bytesToBase64 } from '../src/lib/base64';

describe('bytesToBase64 / base64ToBytes', () => {
  it('round-trips arbitrary bytes exactly', () => {
    const original = new Uint8Array([0, 1, 2, 253, 254, 255, 127, 128, 65, 97]);
    const roundTripped = base64ToBytes(bytesToBase64(original));
    expect(Array.from(roundTripped)).toEqual(Array.from(original));
  });

  it('round-trips a large payload without blowing the call stack', () => {
    const original = new Uint8Array(500_000).map((_, i) => i % 256);
    const roundTripped = base64ToBytes(bytesToBase64(original));
    expect(roundTripped.length).toBe(original.length);
    expect(Array.from(roundTripped)).toEqual(Array.from(original));
  });

  it('round-trips empty content', () => {
    expect(base64ToBytes(bytesToBase64(new Uint8Array(0)))).toEqual(new Uint8Array(0));
  });

  it('survives a real JSON.stringify/parse round trip — unlike a raw ArrayBuffer, which does not', () => {
    const original = new Uint8Array([80, 68, 70, 45, 49, 46, 52]); // "PDF-1.4"
    const encoded = bytesToBase64(original);

    const throughJson = JSON.parse(JSON.stringify({ content: encoded })) as { content: string };
    const decoded = base64ToBytes(throughJson.content);

    expect(Array.from(decoded)).toEqual(Array.from(original));
  });
});

describe("bytesToBase64 / base64ToBytes with the browser's own base64", () => {
  // Node doesn't have it yet: stood in for by Buffer's, as Chrome 140 on has it.
  const toBase64 = vi.fn(function (this: Uint8Array) {
    return Buffer.from(this.buffer, this.byteOffset, this.byteLength).toString('base64');
  });
  const fromBase64 = vi.fn((base64: string) => new Uint8Array(Buffer.from(base64, 'base64')));

  beforeEach(() => {
    Object.defineProperty(Uint8Array.prototype, 'toBase64', { value: toBase64, configurable: true });
    Object.defineProperty(Uint8Array, 'fromBase64', { value: fromBase64, configurable: true });
  });

  afterEach(() => {
    delete (Uint8Array.prototype as { toBase64?: unknown }).toBase64;
    delete (Uint8Array as { fromBase64?: unknown }).fromBase64;
    vi.clearAllMocks();
  });

  it('uses it, for the same text the fallback gives', () => {
    const original = new Uint8Array(100_003).map((_, i) => (i * 7) % 256);
    const encoded = bytesToBase64(original);
    expect(toBase64).toHaveBeenCalledOnce();

    delete (Uint8Array.prototype as { toBase64?: unknown }).toBase64;
    expect(bytesToBase64(original)).toBe(encoded);
  });

  it('encodes only the part of the buffer a view covers', () => {
    const whole = new Uint8Array([1, 2, 3, 4, 5, 6]);
    expect(Array.from(base64ToBytes(bytesToBase64(whole.subarray(2, 5))))).toEqual([3, 4, 5]);
    expect(fromBase64).toHaveBeenCalledOnce();
  });
});
