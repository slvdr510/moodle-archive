import { useState } from 'react';
import { collectFolderStatuses, type FolderTreeNode } from '../../lib/fileTree';
import { FileRow } from './FileRow';
import { StatusBadges } from './StatusBadge';

export function FolderRow({
  node,
  depth,
  onFileOpened,
  defaultExpanded = false
}: {
  node: FolderTreeNode;
  depth: number;
  onFileOpened?: () => void;
  /** Start expanded instead of collapsed — used to reveal search-result matches immediately. */
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const statuses = collectFolderStatuses(node);

  return (
    <>
      <li className="folder-row">
        <div
          className="folder-row-header"
          style={{ paddingLeft: 16 + depth * 16 }}
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="folder-toggle">{expanded ? '▾' : '▸'}</span>
          <span className="folder-name">{node.name}</span>
          <StatusBadges statuses={statuses} />
        </div>
      </li>
      {expanded &&
        node.children.map((child) =>
          child.kind === 'folder' ? (
            <FolderRow
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileOpened={onFileOpened}
              defaultExpanded={defaultExpanded}
            />
          ) : (
            <FileRow key={child.file.id} file={child.file} depth={depth + 1} onFileOpened={onFileOpened} />
          )
        )}
    </>
  );
}
