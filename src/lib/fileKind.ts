export type RenderKind = 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'download';

interface ExtensionInfo {
  kind: RenderKind;
  mime: string;
}

// html/htm are deliberately "text" (shown as escaped source), not rendered live —
// file content comes from whatever Moodle course this was, and this page runs
// under the extension's own origin, so we never want to execute it as script.
const EXTENSION_INFO: Record<string, ExtensionInfo> = {
  pdf: { kind: 'pdf', mime: 'application/pdf' },
  png: { kind: 'image', mime: 'image/png' },
  jpg: { kind: 'image', mime: 'image/jpeg' },
  jpeg: { kind: 'image', mime: 'image/jpeg' },
  gif: { kind: 'image', mime: 'image/gif' },
  webp: { kind: 'image', mime: 'image/webp' },
  svg: { kind: 'image', mime: 'image/svg+xml' },
  bmp: { kind: 'image', mime: 'image/bmp' },
  ico: { kind: 'image', mime: 'image/x-icon' },
  txt: { kind: 'text', mime: 'text/plain' },
  md: { kind: 'text', mime: 'text/markdown' },
  html: { kind: 'text', mime: 'text/html' },
  htm: { kind: 'text', mime: 'text/html' },
  csv: { kind: 'text', mime: 'text/csv' },
  json: { kind: 'text', mime: 'application/json' },
  xml: { kind: 'text', mime: 'application/xml' },
  mp4: { kind: 'video', mime: 'video/mp4' },
  webm: { kind: 'video', mime: 'video/webm' },
  ogg: { kind: 'video', mime: 'video/ogg' },
  mp3: { kind: 'audio', mime: 'audio/mpeg' },
  wav: { kind: 'audio', mime: 'audio/wav' }
};

export function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex === -1 ? '' : filename.slice(dotIndex + 1).toLowerCase();
}

/** What kind of viewer a file's extension should get. `'download'` means no in-browser viewer. */
export function getRenderKind(filename: string): RenderKind {
  return EXTENSION_INFO[getExtension(filename)]?.kind ?? 'download';
}

export function guessMimeType(filename: string): string {
  return EXTENSION_INFO[getExtension(filename)]?.mime ?? 'application/octet-stream';
}
