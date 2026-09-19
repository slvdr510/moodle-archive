import { describe, expect, it } from 'vitest';
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
