import { useEffect, useState } from 'react';
import { formatDate } from '../../lib/dateFormat';
import { deleteFile } from '../../lib/db';
import { downloadNameFor } from '../../lib/downloadNameSettings';
import { downloadVersion } from '../../lib/openFile';
import { formatRelativeTime } from '../../lib/relativeTime';
import type { FileRecord } from '../../types';
import { useDateFormat } from '../hooks/useDateFormat';
import { useFileOpener } from '../hooks/useFileOpener';
import { useIgnoredFiles } from '../hooks/useIgnoredFiles';
import { useT } from '../hooks/useTranslation';
import { ConfirmModal } from './ConfirmModal';
import { FileName } from './FileName';
import { IgnoreButton } from './IgnoreButton';
import { StatusBadge } from './StatusBadge';
import { TreeGuides, rowPaddingLeft } from './TreeGuides';
import { VersionPickerModal } from './VersionPickerModal';
import { VersionTimeline } from './VersionTimeline';

export function FileRow({
  file,
  depth = 0,
  guides = [],
  isLast = false,
  onFileOpened,
  onFileDeleted
}: {
  file: FileRecord;
  depth?: number;
  /** Tree connector info — see TreeGuides. */
  guides?: boolean[];
  isLast?: boolean;
  onFileOpened?: () => void;
  /** Called once the file has been removed from the database. */
  onFileDeleted?: (file: FileRecord) => void;
}) {
  const { versions, latestVersion, handleClick, showPicker, closePicker, selectVersion, deleteVersion, reload } =
    useFileOpener(file, onFileOpened);
  const t = useT();
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [dateFormatPref] = useDateFormat();
  const ignoredFiles = useIgnoredFiles();
  const ignoreState = ignoredFiles?.fileState(file) ?? 'none';
  const ignored = ignoreState !== 'none';
  // Bumped when a version is deleted from the picker, so an open history re-reads them.
  const [versionsChanged, setVersionsChanged] = useState(0);

  // With older versions deleted down to one, the history toggle (the version count)
  // goes away, so the history mustn't stay open with no way to close it.
  const singleVersion = versions !== null && versions.length <= 1;
  useEffect(() => {
    if (singleVersion) setHistoryExpanded(false);
  }, [singleVersion]);

  return (
    <li className={`file-row status-${file.currentStatus}`}>
      <TreeGuides depth={depth} guides={guides} isLast={isLast} />
      <div className="file-row-header" style={{ paddingLeft: rowPaddingLeft(depth) }} onClick={handleClick}>
        {/* The filename takes the remaining space, with the version count (if there's
            more than one version) right after it, even when the name is cut off. */}
        <div className="file-path-group">
          <FileName name={file.filename} className="file-path" />
          {versions && versions.length > 1 && (
            <button
              className="icon-button version-count"
              title={t.fileRow.viewHistory}
              onClick={(e) => {
                e.stopPropagation();
                setHistoryExpanded((v) => !v);
              }}
            >
              {versions.length}
            </button>
          )}
        </div>
        {/* Right-hand columns, left to right: status tag, time since scanned, delete,
            download. The date column has the same width on every row (see
            useDateColumnWidth), so tags and dates line up whichever a row has. */}
        <div className="file-row-meta">
          <span className="file-status-slot">
            {/* Ignored first: an ignored file's other status never changes again, so
                that's the one thing worth knowing about it. */}
            {ignored ? (
              <span
                className="status-badge status-ignored"
                title={ignoreState === 'folder' ? t.fileRow.ignoredWithFolderTitle : t.fileRow.ignoredTitle}
              >
                {t.fileRow.ignored}
              </span>
            ) : file.currentStatus === 'new' || file.currentStatus === 'deleted' ? (
              <StatusBadge status={file.currentStatus} />
            ) : (
              file.manual && <span className="status-badge status-manual" title={t.fileRow.manualTitle}>{t.fileRow.manual}</span>
            )}
          </span>
          <span
            className="file-date"
            title={latestVersion ? t.fileRow.lastSaved(formatDate(latestVersion.timestamp, dateFormatPref)) : undefined}
          >
            {latestVersion && (
              <span className="file-date-text">{formatRelativeTime(latestVersion.timestamp, Date.now(), t)}</span>
            )}
          </span>
          {/* Not for a file added by hand: downloads never touch those anyway. Nor for
              one in an ignored folder: the folder decides, so the folder has the toggle. */}
          {ignoredFiles && !file.manual && ignoreState !== 'folder' && (
            <IgnoreButton
              ignored={ignored}
              title={ignored ? t.fileRow.unignoreTitle : t.fileRow.ignoreTitle}
              onToggle={() => ignoredFiles.toggleFile(file)}
            />
          )}
          <button
            className="icon-button row-action-button delete-button"
            title={t.fileRow.deleteTitle}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingDelete(true);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
            </svg>
          </button>
          <button
            className="icon-button row-action-button"
            title={t.fileRow.downloadTitle}
            disabled={!latestVersion}
            onClick={(e) => {
              e.stopPropagation();
              if (latestVersion) {
                const content = latestVersion.content;
                void downloadNameFor(file.courseId, file.filename).then((name) => downloadVersion(content, name));
              }
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          </button>
        </div>
      </div>

      {historyExpanded && (
        <VersionTimeline
          key={versionsChanged}
          fileId={file.id}
          courseId={file.courseId}
          filename={file.filename}
          onVersionDeleted={reload}
        />
      )}

      {confirmingDelete && (
        <ConfirmModal
          title={t.fileRow.deleteConfirmTitle(file.filename)}
          message={t.fileRow.deleteConfirmMessage}
          confirmLabel={t.common.delete}
          danger
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            void deleteFile(file).then(() => onFileDeleted?.(file));
          }}
        />
      )}

      {showPicker && versions && (
        <VersionPickerModal
          versions={versions}
          onSelect={selectVersion}
          onDelete={async (version) => {
            await deleteVersion(version);
            setVersionsChanged((n) => n + 1);
          }}
          onClose={closePicker}
        />
      )}
    </li>
  );
}
