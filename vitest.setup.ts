import { Blob as NodeBlob } from 'node:buffer';

// jsdom's own Blob only implements `slice`/`size`/`type` — no `text()`/`arrayBuffer()` —
// unlike real browsers. Swap in Node's spec-compliant Blob everywhere so code under test
// that calls those methods (e.g. reading a version's content) behaves like it would in
// an actual extension, regardless of which test environment (node/jsdom) a file uses.
globalThis.Blob = NodeBlob as unknown as typeof Blob;
