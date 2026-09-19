import { describe, expect, it } from 'vitest';
import { datedFilename, getRenderKind, guessMimeType } from '../src/lib/fileKind';

describe('getRenderKind', () => {
  it('classifies images, pdf, video, audio and text extensions', () => {
    expect(getRenderKind('photo.PNG')).toBe('image');
    expect(getRenderKind('notes.pdf')).toBe('pdf');
    expect(getRenderKind('clip.mp4')).toBe('video');
    expect(getRenderKind('song.mp3')).toBe('audio');
    expect(getRenderKind('notes.txt')).toBe('text');
  });

  it('treats html/htm as text, not a type to render live', () => {
    expect(getRenderKind('page.html')).toBe('text');
    expect(getRenderKind('page.htm')).toBe('text');
  });

  it('falls back to "download" for unknown or office-document extensions', () => {
    for (const name of ['sheet.xlsx', 'doc.docx', 'slides.pptx', 'archive.zip', 'README']) {
      expect(getRenderKind(name)).toBe('download');
    }
  });
});

describe('guessMimeType', () => {
  it('maps known extensions to their MIME type', () => {
    expect(guessMimeType('notes.pdf')).toBe('application/pdf');
    expect(guessMimeType('photo.png')).toBe('image/png');
    expect(guessMimeType('notes.txt')).toBe('text/plain');
  });

  it('falls back to application/octet-stream for unknown extensions', () => {
    expect(guessMimeType('archive.zip')).toBe('application/octet-stream');
    expect(guessMimeType('no-extension')).toBe('application/octet-stream');
  });
});

describe('datedFilename', () => {
  it('inserts the timestamp before the extension', () => {
    const ms = new Date(2026, 0, 5, 10, 30, 0).getTime(); // months are 0-indexed
    expect(datedFilename('notes.pdf', ms)).toBe('notes__2026-01-05_10-30-00.pdf');
  });

  it('appends the timestamp when there is no extension', () => {
    const ms = new Date(2026, 0, 5, 10, 30, 0).getTime();
    expect(datedFilename('README', ms)).toBe('README__2026-01-05_10-30-00');
  });
});
