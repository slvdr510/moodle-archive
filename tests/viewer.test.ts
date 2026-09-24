// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileStore, versionStore } from '../src/lib/db';
import type { FileRecord, VersionRecord } from '../src/types';

async function seedVersion(filename: string, content: Blob): Promise<string> {
  const file: FileRecord = {
    id: `course::${filename}`,
    courseId: 'course',
    relativePath: filename,
    filename,
    currentStatus: 'new'
  };
  const version: VersionRecord = {
    id: `${file.id}::hash`,
    fileId: file.id,
    sha256: 'hash',
    size: content.size,
    timestamp: Date.now(),
    content
  };
  await fileStore.put(file);
  await versionStore.put(version);
  return version.id;
}

/** Loads the viewer page's script against `?version=<versionId>`, as a fresh page load would. */
async function loadViewer(versionId?: string): Promise<void> {
  window.history.replaceState({}, '', versionId ? `/?version=${encodeURIComponent(versionId)}` : '/');
  vi.resetModules();
  await import('../src/viewer/main');
}

beforeEach(() => {
  document.body.replaceChildren();
  document.title = '';
  URL.createObjectURL = vi.fn(() => 'blob:fake');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('viewer page', () => {
  it('embeds a PDF in an iframe backed by a correctly typed blob', async () => {
    const versionId = await seedVersion('notes.pdf', new Blob(['%PDF-1.4']));

    await loadViewer(versionId);

    await vi.waitFor(() => expect(document.querySelector('iframe')?.src).toBe('blob:fake'));
    expect(document.title).toBe('notes.pdf');
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/pdf');
  });

  it('shows an image under a filename header', async () => {
    const versionId = await seedVersion('photo.png', new Blob(['bytes']));

    await loadViewer(versionId);

    await vi.waitFor(() => expect(document.querySelector('main img')).not.toBeNull());
    expect(document.querySelector('header')?.textContent).toBe('photo.png');
    expect(document.querySelector('img')?.getAttribute('src')).toBe('blob:fake');
    expect((vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob).type).toBe('image/png');
  });

  it('shows text as literal text, never as live markup', async () => {
    const versionId = await seedVersion('page.html', new Blob(['<script>alert(1)</script><b>x</b>']));

    await loadViewer(versionId);

    await vi.waitFor(() => expect(document.querySelector('pre')).not.toBeNull());
    expect(document.querySelector('pre')?.textContent).toBe('<script>alert(1)</script><b>x</b>');
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('pre b')).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('treats a filename with HTML-sensitive characters as plain text', async () => {
    const versionId = await seedVersion('<img src=x>.png', new Blob(['bytes']));

    await loadViewer(versionId);

    await vi.waitFor(() => expect(document.querySelector('header')).not.toBeNull());
    expect(document.querySelector('header')?.textContent).toBe('<img src=x>.png');
    expect(document.querySelectorAll('img')).toHaveLength(1);
  });

  it('says so for a file kind it cannot preview', async () => {
    const versionId = await seedVersion('clip.mp4', new Blob(['bytes']));

    await loadViewer(versionId);

    await vi.waitFor(() => expect(document.querySelector('p')).not.toBeNull());
    expect(document.querySelector('p')?.textContent).toContain("can’t be previewed");
    expect(document.querySelector('iframe, img, pre')).toBeNull();
  });

  it.each([['an unknown version id', 'no-such-version'], ['no version id at all', undefined]])(
    'shows a "not found" message for %s',
    async (_label, versionId) => {
      await loadViewer(versionId);

      await vi.waitFor(() => expect(document.title).toBe('File not found'));
      expect(document.querySelector('p')?.textContent).toContain('no longer in your Moodle Archive history');
    }
  );
});
