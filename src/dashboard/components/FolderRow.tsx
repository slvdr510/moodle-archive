import { useEffect, useState, type CSSProperties } from 'react';
import type { FileRecord } from '../../types';
import { deleteFiles } from '../../lib/db';
import { collectFolderFiles, collectFolderStatuses, type FolderTreeNode } from '../../lib/fileTree';
import { buildFolderZip } from '../../lib/folderZip';
import { downloadNameFor } from '../../lib/downloadNameSettings';
import { downloadVersion } from '../../lib/openFile';
import { ConfirmModal } from './ConfirmModal';
import { FileRow } from './FileRow';
import { StatusBadges } from './StatusBadge';
import { TreeGuides, rowPaddingLeft } from './TreeGuides';
import { useIgnoredFiles } from '../hooks/useIgnoredFiles';
import { useT } from '../hooks/useTranslation';
import { IgnoreButton } from './IgnoreButton';

export function FolderRow({
  node,
  depth,
  guides = [],
  isLast = false,
  onFileOpened,
  onFileDeleted,
  onFolderDeleted,
  canDownload = false,
  openFolders
}: {
  node: FolderTreeNode;
  depth: number;
  /** Tree connector info — see TreeGuides. */
  guides?: boolean[];
  isLast?: boolean;
  onFileOpened?: () => void;
  onFileDeleted?: (file: FileRecord) => void;
  /** Called once every file in the folder has been removed from the database. The
   *  delete button is only offered when this is given, and never for a folder showing
   *  just part of what it holds (see openFolders): it would delete only that part. */
  onFolderDeleted?: (files: FileRecord[]) => void;
  /** Offers a button to download the folder as a zip — like deletion, only for a
   *  folder showing all it holds. */
  canDownload?: boolean;
  /** A search's results (see searchFileTree): the folders, this one or any inside it,
   *  with something found in them, shown expanded instead of collapsed to reveal it.
   *  They hold just what was found. Any other folder in the results was found by its
   *  own name, and holds all it has. */
  openFolders?: ReadonlySet<string>;
}) {
  const t = useT();
  const startsOpen = openFolders?.has(node.path) ?? false;
  const showsAll = !startsOpen;
  const [expanded, setExpanded] = useState(startsOpen);
  // Typing on in the search can open or close it (a file found inside it now, or no
  // longer): follow the search over an earlier click.
  useEffect(() => setExpanded(startsOpen), [startsOpen]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [zipping, setZipping] = useState(false);
  const statuses = collectFolderStatuses(node);
  const folderFiles = collectFolderFiles(node);
  const ignoredFiles = useIgnoredFiles();
  const ignoreState = ignoredFiles?.folderState(node.path) ?? 'none';
  // A folder with only files added by hand has nothing for downloads to touch.
  const canIgnore = ignoredFiles !== null && ignoreState !== 'folder' && folderFiles.some((f) => !f.manual);
  // What this folder's children need to draw their connectors: the ancestors' lines
  // that keep going past them, plus this folder's own line if it has later siblings.
  const childGuides = depth === 0 ? [] : [...guides, !isLast];

  async function handleDownload(): Promise<void> {
    setZipping(true);
    try {
      const zip = await buildFolderZip(node.name, node.path, folderFiles);
      const zipName = `${node.name}.zip`;
      await downloadVersion(zip, folderFiles[0] ? await downloadNameFor(folderFiles[0].courseId, zipName) : zipName);
    } catch (err) {
      console.error('Could not download the folder:', err);
      window.alert(t.folderRow.couldNotDownload(node.name, String(err)));
    } finally {
      setZipping(false);
    }
  }

  return (
    // The folder's contents go inside its own row, so its header can stay stuck to the
    // top of the file list while they scroll past — and only while they do (see
    // .folder-row-header's position: sticky, offset by depth so nested ones stack).
    <li className="folder-row">
      <div
        className="folder-row-header"
        style={{ paddingLeft: rowPaddingLeft(depth), '--depth': depth } as CSSProperties}
        onClick={() => setExpanded((e) => !e)}
      >
        <TreeGuides depth={depth} guides={guides} isLast={isLast} />
        <span className="folder-toggle">{expanded ? '▾' : '▸'}</span>
        <span className="folder-name" title={node.name}>
          {node.name}
        </span>
        {/* Ignored instead of its files' statuses: none of them changes any more. */}
        {ignoreState !== 'none' ? (
          <span className="status-badges">
            <span
              className="status-badge status-ignored"
              title={ignoreState === 'folder' ? t.fileRow.ignoredWithFolderTitle : t.folderRow.ignoredTitle}
            >
              {t.fileRow.ignored}
            </span>
          </span>
        ) : (
          <StatusBadges statuses={statuses} />
        )}
        {canIgnore && (
          <IgnoreButton
            ignored={ignoreState === 'self'}
            title={ignoreState === 'self' ? t.folderRow.unignoreTitle : t.folderRow.ignoreTitle}
            onToggle={() => ignoredFiles.toggleFolder(node.path)}
          />
        )}
        {onFolderDeleted && showsAll && (
          <button
            className="icon-button row-action-button delete-button"
            title={t.folderRow.deleteTitle}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingDelete(true);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
            </svg>
          </button>
        )}
        {canDownload && showsAll && (
          <button
            className="icon-button row-action-button"
            title={t.folderRow.downloadTitle}
            disabled={zipping}
            onClick={(e) => {
              e.stopPropagation();
              void handleDownload();
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          </button>
        )}
      </div>

      {confirmingDelete && (
        <ConfirmModal
          title={t.folderRow.deleteConfirmTitle(node.name)}
          message={t.folderRow.deleteConfirmMessage(folderFiles.length)}
          confirmLabel={t.common.delete}
          danger
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            void deleteFiles(folderFiles).then(() => onFolderDeleted?.(folderFiles));
          }}
        />
      )}
      {expanded && (
        <ul className="folder-children">
          {node.children.map((child, index) =>
            child.kind === 'folder' ? (
              <FolderRow
                key={child.path}
                node={child}
                depth={depth + 1}
                guides={childGuides}
                isLast={index === node.children.length - 1}
                onFileOpened={onFileOpened}
                onFileDeleted={onFileDeleted}
                onFolderDeleted={onFolderDeleted}
                canDownload={canDownload}
                openFolders={openFolders}
              />
            ) : (
              <FileRow
                key={child.file.id}
                file={child.file}
                depth={depth + 1}
                guides={childGuides}
                isLast={index === node.children.length - 1}
                onFileOpened={onFileOpened}
                onFileDeleted={onFileDeleted}
              />
            )
          )}
        </ul>
      )}
    </li>
  );
}
