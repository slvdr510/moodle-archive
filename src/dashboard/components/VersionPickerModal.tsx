import { formatDateTime } from '../../lib/dateFormat';
import type { VersionRecord } from '../../types';
import { useDateFormat } from '../hooks/useDateFormat';

export function VersionPickerModal({
  versions,
  onSelect,
  onClose
}: {
  /** Ascending by timestamp (oldest first), same order as versionStore.byFile. */
  versions: VersionRecord[];
  onSelect: (version: VersionRecord) => void;
  onClose: () => void;
}) {
  const labeled = versions.map((version, index) => ({ version, label: `v${index + 1}` }));
  const newestFirst = [...labeled].reverse();
  const [dateFormatPref] = useDateFormat();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Which version?</h2>
        <ul className="version-picker-list">
          {newestFirst.map(({ version, label }) => (
            <li key={version.id}>
              <button className="version-picker-item" onClick={() => onSelect(version)}>
                <span className="version-picker-index">{label}</span>
                <span className="version-picker-date">{formatDateTime(version.timestamp, dateFormatPref)}</span>
                <span className="version-picker-size">{version.size.toLocaleString()} B</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
