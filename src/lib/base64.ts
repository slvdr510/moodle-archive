// chrome.runtime.sendMessage serializes with plain JSON, and JSON.stringify turns an
// ArrayBuffer/Uint8Array into `{}`. A base64 string survives JSON serialization
// intact on every Chrome version, so file content crosses the content-script/background
// boundary encoded as one.

// Chrome 140 on does it itself, ~100× faster: by hand, an 8 MiB piece of a file took
// ~250 ms, and held up every download in the tab while it did.
type NativeBase64 = {
  toBase64?: (this: Uint8Array) => string;
};
const NativeUint8Array = Uint8Array as { fromBase64?: (base64: string) => Uint8Array };

export function bytesToBase64(bytes: Uint8Array): string {
  const toBase64 = (Uint8Array.prototype as NativeBase64).toBase64;
  if (toBase64) return toBase64.call(bytes);

  // Chunked to avoid blowing the call stack on String.fromCharCode(...bytes) for large files.
  let binary = '';
  const CHUNK_SIZE = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  if (NativeUint8Array.fromBase64) return NativeUint8Array.fromBase64(base64);

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
