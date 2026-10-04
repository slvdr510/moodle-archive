import { formatDateTime } from '../../lib/dateFormat';
import type { VersionRecord } from '../../types';
import { useDateFormat } from '../hooks/useDateFormat';
import { useT } from '../hooks/useTranslation';
import { DeleteVersionButton } from './DeleteVersionButton';

export function VersionPickerModal({
  versions,
  onSelect,
  onDelete,
  onClose
}: {
  /** Ascending by timestamp (oldest first), same order as versionStore.byFile. */
  versions: VersionRecord[];
  onSelect: (version: VersionRecord) => void;
  /** Deletes an older version; when given, each one but the latest gets a delete button. */
  onDelete?: (version: VersionRecord) => Promise<void> | void;
  onClose: () => void;
}) {
  const labeled = versions.map((version, index) => ({ version, label: `v${index + 1}` }));
  const newestFirst = [...labeled].reverse();
  const [dateFormatPref] = useDateFormat();
  const t = useT();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t.versions.whichVersion}</h2>
        <ul className="version-picker-list">
          {newestFirst.map(({ version, label }, i) => (
            <li key={version.id} className="version-picker-row">
              <button className="version-picker-item" onClick={() => onSelect(version)}>
                <span className="version-picker-index">{label}</span>
                <span className="version-picker-date">{formatDateTime(version.timestamp, dateFormatPref)}</span>
                <span className="version-picker-size">{version.size.toLocaleString()} B</span>
              </button>
              {/* The latest version (first here) can't be deleted — see db.deleteVersion. */}
              {onDelete && i > 0 && <DeleteVersionButton version={version} label={label} onDelete={onDelete} />}
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            {t.common.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
