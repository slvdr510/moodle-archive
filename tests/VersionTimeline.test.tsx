// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VersionRecord } from '../src/types';

const byFileMock = vi.hoisted(() => vi.fn());
const downloadVersionMock = vi.hoisted(() => vi.fn());
const deleteVersionMock = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/db', () => ({
  versionStore: { byFile: byFileMock },
  deleteVersion: deleteVersionMock
}));
vi.mock('../src/lib/openFile', () => ({
  downloadVersion: downloadVersionMock
}));

import { VersionTimeline } from '../src/dashboard/components/VersionTimeline';

afterEach(() => {
  act(() => cleanup());
  vi.clearAllMocks();
});

function makeVersion(overrides: Partial<VersionRecord> = {}): VersionRecord {
  return {
    id: 'v1',
    fileId: 'file-1',
    sha256: 'hash',
    size: 100,
    timestamp: new Date(2026, 0, 5, 10, 30, 0).getTime(),
    content: new Blob(['data']),
    ...overrides
  };
}

describe('VersionTimeline', () => {
  it('downloads the latest version under its plain filename', async () => {
    const version = makeVersion();
    byFileMock.mockResolvedValue([version]);

    render(<VersionTimeline fileId="file-1" courseId="course-1" filename="notes.pdf" />);
    await screen.findByText('v1');

    await userEvent.click(screen.getByTitle('Download this version to your Downloads folder'));

    expect(downloadVersionMock).toHaveBeenCalledWith(version.content, 'notes.pdf');
  });

  it('downloads an older version under a dated filename, so it does not look like the latest one', async () => {
    const v1 = makeVersion({ id: 'v1', timestamp: new Date(2026, 0, 1, 9, 0, 0).getTime() });
    const v2 = makeVersion({ id: 'v2', timestamp: new Date(2026, 0, 5, 10, 30, 0).getTime() });
    byFileMock.mockResolvedValue([v1, v2]);

    render(<VersionTimeline fileId="file-1" courseId="course-1" filename="notes.pdf" />);
    await screen.findByText('v2');

    const downloadButtons = screen.getAllByTitle('Download this version to your Downloads folder');
    await userEvent.click(downloadButtons[0]); // v1, the older one

    expect(downloadVersionMock).toHaveBeenCalledWith(v1.content, 'notes__2026-01-01_09-00-00.pdf');
  });

  it('offers to delete every version but the latest, and deletes one after confirming', async () => {
    const v1 = makeVersion({ id: 'v1', timestamp: new Date(2026, 0, 1).getTime() });
    const v2 = makeVersion({ id: 'v2', timestamp: new Date(2026, 0, 5).getTime() });
    byFileMock.mockResolvedValueOnce([v1, v2]).mockResolvedValueOnce([v2]);
    const onVersionDeleted = vi.fn();

    render(
      <VersionTimeline fileId="file-1" courseId="course-1" filename="notes.pdf" onVersionDeleted={onVersionDeleted} />
    );
    await screen.findByText('v2');

    const deleteButtons = screen.getAllByTitle('Delete this version');
    expect(deleteButtons).toHaveLength(1); // v1 only — the latest one can't be deleted

    await userEvent.click(deleteButtons[0]);
    expect(screen.getByText('Delete v1?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(deleteVersionMock).toHaveBeenCalledWith(v1);
    expect(await screen.findByText('v1')).toBeInTheDocument(); // v2 renumbered, now the only one
    expect(screen.queryByTitle('Delete this version')).toBeNull();
    expect(onVersionDeleted).toHaveBeenCalled();
  });
});
