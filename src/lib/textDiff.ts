import { diffLines, type Change } from 'diff';

const TEXT_SIZE_THRESHOLD_BYTES = 2 * 1024 * 1024;

export function isProbablyText(bytes: Uint8Array): boolean {
  if (bytes.byteLength > TEXT_SIZE_THRESHOLD_BYTES) return false;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

export interface DiffResult {
  kind: 'text';
  changes: Change[];
}

export interface MetadataDiffResult {
  kind: 'binary';
  oldSize: number;
  newSize: number;
}

export function diffText(oldBytes: Uint8Array, newBytes: Uint8Array): DiffResult {
  const decoder = new TextDecoder('utf-8');
  const changes = diffLines(decoder.decode(oldBytes), decoder.decode(newBytes));
  return { kind: 'text', changes };
}

export function diffMetadataOnly(oldBytes: Uint8Array, newBytes: Uint8Array): MetadataDiffResult {
  return { kind: 'binary', oldSize: oldBytes.byteLength, newSize: newBytes.byteLength };
}
