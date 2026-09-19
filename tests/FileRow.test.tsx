// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FileRecord, VersionRecord } from '../src/types';

const byFileMock = vi.hoisted(() => vi.fn());
const recordOpenMock = vi.hoisted(() => vi.fn());
const openVersionInBrowserMock = vi.hoisted(() => vi.fn());
const downloadVersionMock = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/db', () => ({
  versionStore: { byFile: byFileMock },
  recentOpenStore: { recordOpen: recordOpenMock }
}));
vi.mock('../src/lib/openFile', () => ({
  openVersionInBrowser: openVersionInBrowserMock,
  downloadVersion: downloadVersionMock
}));
// VersionTimeline has its own DB/diff wiring already covered elsewhere; stub it here
// so this file's tests stay focused on FileRow's own open/picker/history logic.
vi.mock('../src/dashboard/components/VersionTimeline', () => ({
  VersionTimeline: ({ fileId }: { fileId: string }) => <div data-testid="version-timeline">{fileId}</div>
}));

import { FileRow } from '../src/dashboard/components/FileRow';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeFile(overrides: Partial<FileRecord> = {}): FileRecord {
  return {
    id: 'file-1',
    courseId: 'course-1',
    relativePath: 'notes.pdf',
    filename: 'notes.pdf',
    currentStatus: 'new',
    ...overrides
  };
}

function makeVersion(overrides: Partial<VersionRecord> = {}): VersionRecord {
  return {
    id: 'v1',
    fileId: 'file-1',
    sha256: 'hash',
    size: 100,
    timestamp: Date.now(),
    content: new Blob(['data']),
    ...overrides
  };
}

function renderFileRow(file: FileRecord) {
  return render(
    <ul>
      <FileRow file={file} />
    </ul>
  );
}

describe('FileRow', () => {
  it('opens the file directly when it has a single version', async () => {
    const version = makeVersion();
    byFileMock.mockResolvedValue([version]);

    renderFileRow(makeFile());
    await screen.findByText('notes.pdf');
    await userEvent.click(screen.getByText('notes.pdf'));

    expect(openVersionInBrowserMock).toHaveBeenCalledWith(version.content, 'notes.pdf');
    expect(screen.queryByText('Which version?')).not.toBeInTheDocument();
  });

  it('shows a version picker when there are multiple versions, and opens the chosen one', async () => {
    const v1 = makeVersion({ id: 'v1', timestamp: 1000 });
    const v2 = makeVersion({ id: 'v2', timestamp: 2000 });
    byFileMock.mockResolvedValue([v1, v2]);

    renderFileRow(makeFile());
    await screen.findByText('notes.pdf');
    await userEvent.click(screen.getByText('notes.pdf'));

    expect(screen.getByText('Which version?')).toBeInTheDocument();
    expect(openVersionInBrowserMock).not.toHaveBeenCalled();

    // Newest first: v2 should be the first entry in the list.
    const items = screen.getAllByRole('button', { name: /v\d/ });
    await userEvent.click(items[0]);

    expect(openVersionInBrowserMock).toHaveBeenCalledWith(v2.content, 'notes.pdf');
    expect(screen.queryByText('Which version?')).not.toBeInTheDocument();
  });

  it('shows the last-saved date from the latest version', async () => {
    const version = makeVersion({ timestamp: new Date('2026-03-05').getTime() });
    byFileMock.mockResolvedValue([version]);

    renderFileRow(makeFile());
    const date = await screen.findByTitle('Last saved');
    expect(date).toHaveTextContent('05/03/2026');
  });

  it('hides the history button when the file only has a single version', async () => {
    byFileMock.mockResolvedValue([makeVersion()]);

    renderFileRow(makeFile());
    await screen.findByText('notes.pdf');

    expect(screen.queryByTitle('View version history')).not.toBeInTheDocument();
  });

  it('the history button toggles the version timeline without opening the file, when there is more than one version', async () => {
    byFileMock.mockResolvedValue([makeVersion({ id: 'v1', timestamp: 1000 }), makeVersion({ id: 'v2', timestamp: 2000 })]);

    renderFileRow(makeFile());
    await screen.findByText('notes.pdf');

    await userEvent.click(screen.getByTitle('View version history'));
    expect(screen.getByTestId('version-timeline')).toBeInTheDocument();
    expect(openVersionInBrowserMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByTitle('View version history'));
    expect(screen.queryByTestId('version-timeline')).not.toBeInTheDocument();
  });

  it('the download button saves the latest version to Downloads without opening it', async () => {
    const version = makeVersion();
    byFileMock.mockResolvedValue([version]);

    renderFileRow(makeFile());
    await screen.findByText('notes.pdf');

    await userEvent.click(screen.getByTitle('Download to your Downloads folder'));

    expect(downloadVersionMock).toHaveBeenCalledWith(version.content, 'notes.pdf');
    expect(openVersionInBrowserMock).not.toHaveBeenCalled();
  });

  it('shows a "New" badge for a new file', async () => {
    byFileMock.mockResolvedValue([makeVersion()]);
    renderFileRow(makeFile({ currentStatus: 'new' }));
    expect(await screen.findByText('New')).toBeInTheDocument();
  });

  it('shows a "Deleted" badge for a deleted file', async () => {
    byFileMock.mockResolvedValue([makeVersion()]);
    renderFileRow(makeFile({ currentStatus: 'deleted' }));
    expect(await screen.findByText('Deleted')).toBeInTheDocument();
  });

  it('shows no status badge for a modified file — the version-count number covers that instead', async () => {
    byFileMock.mockResolvedValue([makeVersion({ id: 'v1', timestamp: 1000 }), makeVersion({ id: 'v2', timestamp: 2000 })]);
    renderFileRow(makeFile({ currentStatus: 'modified' }));
    await screen.findByText('notes.pdf');

    expect(screen.queryByText('Modified')).not.toBeInTheDocument();
  });

  it('shows no status badge for an unchanged file', async () => {
    byFileMock.mockResolvedValue([makeVersion()]);
    renderFileRow(makeFile({ currentStatus: 'unchanged' }));
    await screen.findByText('notes.pdf');

    expect(screen.queryByText('Unchanged')).not.toBeInTheDocument();
  });
});
