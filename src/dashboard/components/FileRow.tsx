import { useState } from 'react';
import { formatDate } from '../../lib/dateFormat';
import { deleteFile } from '../../lib/db';
import { downloadVersion } from '../../lib/openFile';
import { formatRelativeTime } from '../../lib/relativeTime';
import type { FileRecord } from '../../types';
import { useDateFormat } from '../hooks/useDateFormat';
import { useFileOpener } from '../hooks/useFileOpener';
import { ConfirmModal } from './ConfirmModal';
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
  const { versions, latestVersion, handleClick, showPicker, closePicker, selectVersion } = useFileOpener(
    file,
    onFileOpened
  );
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [dateFormatPref] = useDateFormat();

  return (
    <li className={`file-row status-${file.currentStatus}`}>
      <TreeGuides depth={depth} guides={guides} isLast={isLast} />
      <div className="file-row-header" style={{ paddingLeft: rowPaddingLeft(depth) }} onClick={handleClick}>
        <span className="file-path" title={file.filename}>
          {file.filename}
        </span>
        {/* Right-hand columns, left to right: version count, time since scanned, status
            tag, delete, download. Every column has a fixed width and always renders,
            even when empty, so each one lines up on every row no matter which of them
            a given file happens to have. The filename takes the remaining space. */}
        <div className="file-row-meta">
          <span className="file-meta-slot file-version-slot">
            {versions && versions.length > 1 && (
              <button
                className="icon-button version-count"
                title="View version history"
                onClick={(e) => {
                  e.stopPropagation();
                  setHistoryExpanded((v) => !v);
                }}
              >
                {versions.length}
              </button>
            )}
          </span>
          <span
            className="file-date"
            title={latestVersion ? `Last saved: ${formatDate(latestVersion.timestamp, dateFormatPref)}` : undefined}
          >
            {latestVersion && formatRelativeTime(latestVersion.timestamp)}
          </span>
          <span className="file-meta-slot file-status-slot">
            {file.currentStatus === 'new' || file.currentStatus === 'deleted' ? (
              <StatusBadge status={file.currentStatus} />
            ) : (
              file.manual && <span className="status-badge status-manual" title="Added by hand, not downloaded from Moodle">Manual</span>
            )}
          </span>
          <button
            className="icon-button row-action-button delete-button"
            title="Delete this file from your history"
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
            title="Download to your Downloads folder"
            disabled={!latestVersion}
            onClick={(e) => {
              e.stopPropagation();
              if (latestVersion) void downloadVersion(latestVersion.content, file.filename);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          </button>
        </div>
      </div>

      {historyExpanded && <VersionTimeline fileId={file.id} filename={file.filename} />}

      {confirmingDelete && (
        <ConfirmModal
          title={`Delete "${file.filename}"?`}
          message="This removes the file and all of its saved versions from your history. If it is still in Moodle, the next download of this course will add it back as a new file."
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            void deleteFile(file).then(() => onFileDeleted?.(file));
          }}
        />
      )}

      {showPicker && versions && (
        <VersionPickerModal versions={versions} onSelect={selectVersion} onClose={closePicker} />
      )}
    </li>
  );
}
