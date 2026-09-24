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

  describe('tree connectors', () => {
    const tree: FolderTreeNode = {
      kind: 'folder',
      name: 'Parent',
      path: 'Parent',
      children: [
        {
          kind: 'folder',
          name: 'A',
          path: 'Parent/A',
          children: [{ kind: 'folder', name: 'A1', path: 'Parent/A/A1', children: [] }]
        },
        { kind: 'folder', name: 'B', path: 'Parent/B', children: [] }
      ]
    };

    function guidesOf(name: string): string[] {
      const row = screen.getByText(name).closest('li')!;
      return Array.from(row.querySelectorAll('.tree-guide')).map((cell) => cell.className.replace('tree-guide', '').trim());
    }

    it('draws no connector for a top-level row', () => {
      render(
        <ul>
          <FolderRow node={tree} depth={0} defaultExpanded />
        </ul>
      );
      expect(guidesOf('Parent')).toEqual([]);
    });

    it('gives each child a tee, and closes the last child with a corner', () => {
      render(
        <ul>
          <FolderRow node={tree} depth={0} defaultExpanded />
        </ul>
      );
      expect(guidesOf('A')).toEqual(['elbow']);
      expect(guidesOf('B')).toEqual(['elbow last']);
    });

    it('keeps an ancestor\'s line running through its descendants only while it has later siblings', () => {
      render(
        <ul>
          <FolderRow node={tree} depth={0} defaultExpanded />
        </ul>
      );
      // A1 hangs from A, and A still has a sibling (B) below it, so A's line passes through A1.
      expect(guidesOf('A1')).toEqual(['through', 'elbow last']);
    });
  });
});
