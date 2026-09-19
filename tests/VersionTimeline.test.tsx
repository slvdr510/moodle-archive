// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VersionRecord } from '../src/types';

const byFileMock = vi.hoisted(() => vi.fn());
const downloadVersionMock = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/db', () => ({
  versionStore: { byFile: byFileMock }
}));
vi.mock('../src/lib/openFile', () => ({
  downloadVersion: downloadVersionMock
}));

import { VersionTimeline } from '../src/dashboard/components/VersionTimeline';

afterEach(() => {
  cleanup();
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

    render(<VersionTimeline fileId="file-1" filename="notes.pdf" />);
    await screen.findByText('v1');

    await userEvent.click(screen.getByTitle('Download this version to your Downloads folder'));

    expect(downloadVersionMock).toHaveBeenCalledWith(version.content, 'notes.pdf');
  });

  it('downloads an older version under a dated filename, so it does not look like the latest one', async () => {
    const v1 = makeVersion({ id: 'v1', timestamp: new Date(2026, 0, 1, 9, 0, 0).getTime() });
    const v2 = makeVersion({ id: 'v2', timestamp: new Date(2026, 0, 5, 10, 30, 0).getTime() });
    byFileMock.mockResolvedValue([v1, v2]);

    render(<VersionTimeline fileId="file-1" filename="notes.pdf" />);
    await screen.findByText('v2');

    const downloadButtons = screen.getAllByTitle('Download this version to your Downloads folder');
    await userEvent.click(downloadButtons[0]); // v1, the older one

    expect(downloadVersionMock).toHaveBeenCalledWith(v1.content, 'notes__2026-01-01_09-00-00.pdf');
  });
});
