// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FileRecord } from '../src/types';

const deleteFilesMock = vi.hoisted(() => vi.fn());
const buildFolderZipMock = vi.hoisted(() => vi.fn());
const downloadVersionMock = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/folderZip', () => ({ buildFolderZip: buildFolderZipMock }));
vi.mock('../src/lib/openFile', () => ({ downloadVersion: downloadVersionMock, openVersionInBrowser: vi.fn() }));

vi.mock('../src/lib/db', () => ({
  deleteFiles: deleteFilesMock,
  deleteFile: vi.fn(),
  versionStore: { byFile: vi.fn().mockResolvedValue([]) },
  recentOpenStore: { recordOpen: vi.fn() }
}));

import { FolderRow } from '../src/dashboard/components/FolderRow';
import type { FolderTreeNode } from '../src/lib/fileTree';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeFile(relativePath: string): FileRecord {
  return { id: relativePath, courseId: 'c', relativePath, filename: relativePath.split('/').pop()!, currentStatus: 'unchanged' };
}

const inner = makeFile('Tema/sub/b.pdf');
const outer = makeFile('Tema/a.pdf');
const node: FolderTreeNode = {
  kind: 'folder',
  name: 'Tema',
  path: 'Tema',
  children: [
    { kind: 'folder', name: 'sub', path: 'Tema/sub', children: [{ kind: 'file', name: 'b.pdf', file: inner }] },
    { kind: 'file', name: 'a.pdf', file: outer }
  ]
};

describe('FolderRow delete', () => {
  it('offers no delete button unless the parent handles deletions (e.g. not while searching)', () => {
    render(
      <ul>
        <FolderRow node={node} depth={0} />
      </ul>
    );
    expect(screen.queryByTitle('Delete this folder from your history')).not.toBeInTheDocument();
  });

  it('asks for confirmation, then deletes every file in the folder, subfolders included', async () => {
    deleteFilesMock.mockResolvedValue(undefined);
    const onFolderDeleted = vi.fn();
    render(
      <ul>
        <FolderRow node={node} depth={0} onFolderDeleted={onFolderDeleted} />
      </ul>
    );

    await userEvent.click(screen.getByTitle('Delete this folder from your history'));
    expect(screen.getByText('Delete "Tema"?')).toBeInTheDocument();
    expect(screen.getByText(/its 2 files/)).toBeInTheDocument();
    expect(deleteFilesMock).not.toHaveBeenCalled();
    // Opening the confirmation must not also toggle the folder open.
    expect(screen.queryByText('sub')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(deleteFilesMock).toHaveBeenCalledWith(expect.arrayContaining([inner, outer]));
    await vi.waitFor(() => expect(onFolderDeleted).toHaveBeenCalledWith(expect.arrayContaining([inner, outer])));
  });

  it('keeps everything when the confirmation is cancelled', async () => {
    const onFolderDeleted = vi.fn();
    render(
      <ul>
        <FolderRow node={node} depth={0} onFolderDeleted={onFolderDeleted} />
      </ul>
    );

    await userEvent.click(screen.getByTitle('Delete this folder from your history'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(deleteFilesMock).not.toHaveBeenCalled();
    expect(onFolderDeleted).not.toHaveBeenCalled();
  });
});

describe('FolderRow download', () => {
  it('offers no download button unless the parent allows it (e.g. not while searching)', () => {
    render(
      <ul>
        <FolderRow node={node} depth={0} />
      </ul>
    );
    expect(screen.queryByTitle('Download this folder as a zip')).not.toBeInTheDocument();
  });

  it('zips the whole folder and saves it as <folder name>.zip, without toggling the folder open', async () => {
    const zip = new Blob(['zip-bytes']);
    buildFolderZipMock.mockResolvedValue(zip);
    render(
      <ul>
        <FolderRow node={node} depth={0} canDownload />
      </ul>
    );

    await userEvent.click(screen.getByTitle('Download this folder as a zip'));

    await vi.waitFor(() => expect(downloadVersionMock).toHaveBeenCalledWith(zip, 'Tema.zip'));
    expect(buildFolderZipMock).toHaveBeenCalledWith('Tema', 'Tema', expect.arrayContaining([inner, outer]));
    expect(screen.queryByText('sub')).not.toBeInTheDocument();
  });
});
