// chrome.runtime.sendMessage serializes with plain JSON by default (structured
// clone is opt-in, Chrome 148+, via the manifest's `message_serialization` key —
// see manifest.config.ts), and JSON.stringify turns an ArrayBuffer/Uint8Array into
// `{}`. A base64 string survives JSON serialization intact on every Chrome version,
// so file content crosses the content-script/background boundary encoded as one.

export function bytesToBase64(bytes: Uint8Array): string {
  // Chunked to avoid blowing the call stack on String.fromCharCode(...bytes) for large files.
  let binary = '';
  const CHUNK_SIZE = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
