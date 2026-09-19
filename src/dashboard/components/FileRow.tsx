import { useState } from 'react';
import { formatDate } from '../../lib/dateFormat';
import { downloadVersion } from '../../lib/openFile';
import type { FileRecord } from '../../types';
import { useDateFormat } from '../hooks/useDateFormat';
import { useFileOpener } from '../hooks/useFileOpener';
import { StatusBadge } from './StatusBadge';
import { VersionPickerModal } from './VersionPickerModal';
import { VersionTimeline } from './VersionTimeline';

export function FileRow({
  file,
  depth = 0,
  onFileOpened
}: {
  file: FileRecord;
  depth?: number;
  onFileOpened?: () => void;
}) {
  const { versions, latestVersion, handleClick, showPicker, closePicker, selectVersion } = useFileOpener(
    file,
    onFileOpened
  );
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [dateFormatPref] = useDateFormat();

  return (
    <li className={`file-row status-${file.currentStatus}`}>
      <div className="file-row-header" style={{ paddingLeft: 16 + depth * 16 }} onClick={handleClick}>
        <span className="file-path">{file.filename}</span>
        <div className="file-row-meta">
          {latestVersion && (
            <span className="file-date" title="Last saved">
              {formatDate(latestVersion.timestamp, dateFormatPref)}
            </span>
          )}
          {latestVersion && (
            <button
              className="icon-button download-button"
              title="Download to your Downloads folder"
              onClick={(e) => {
                e.stopPropagation();
                void downloadVersion(latestVersion.content, file.filename);
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
              </svg>
            </button>
          )}
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
          {(file.currentStatus === 'new' || file.currentStatus === 'deleted') && (
            <StatusBadge status={file.currentStatus} />
          )}
        </div>
      </div>

      {historyExpanded && <VersionTimeline fileId={file.id} filename={file.filename} />}

      {showPicker && versions && (
        <VersionPickerModal versions={versions} onSelect={selectVersion} onClose={closePicker} />
      )}
    </li>
  );
}
