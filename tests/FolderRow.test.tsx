// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { FolderRow } from '../src/dashboard/components/FolderRow';
import type { FolderTreeNode } from '../src/lib/fileTree';

afterEach(cleanup);

function makeFolderTree(): FolderTreeNode {
  return {
    kind: 'folder',
    name: 'Parent',
    path: 'Parent',
    children: [
      {
        kind: 'folder',
        name: 'Child',
        path: 'Parent/Child',
        children: []
      }
    ]
  };
}

describe('FolderRow', () => {
  it('starts collapsed by default, revealing children only after a click', async () => {
    render(
      <ul>
        <FolderRow node={makeFolderTree()} depth={0} />
      </ul>
    );

    expect(screen.queryByText('Child')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Parent'));
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('starts expanded when defaultExpanded is set, e.g. for search results', () => {
    render(
      <ul>
        <FolderRow node={makeFolderTree()} depth={0} defaultExpanded />
      </ul>
    );

    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('propagates defaultExpanded to nested subfolders too', () => {
    const node: FolderTreeNode = {
      kind: 'folder',
      name: 'Parent',
      path: 'Parent',
      children: [
        {
          kind: 'folder',
          name: 'Child',
          path: 'Parent/Child',
          children: [{ kind: 'folder', name: 'Grandchild', path: 'Parent/Child/Grandchild', children: [] }]
        }
      ]
    };

    render(
      <ul>
        <FolderRow node={node} depth={0} defaultExpanded />
      </ul>
    );

    expect(screen.getByText('Grandchild')).toBeInTheDocument();
  });
});
