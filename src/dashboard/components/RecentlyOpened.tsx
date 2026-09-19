import { recentOpenStore } from '../../lib/db';
import type { FileRecord, RecentOpenRecord } from '../../types';
import { useFileOpener } from '../hooks/useFileOpener';
import { VersionPickerModal } from './VersionPickerModal';

function RecentFileItem({
  record,
  file,
  onChange
}: {
  record: RecentOpenRecord;
  file: FileRecord;
  onChange: () => void;
}) {
  const { handleClick, showPicker, closePicker, selectVersion, versions } = useFileOpener(file, onChange);

  return (
    <>
      <div className="recent-file-item">
        <button className="recent-file-open" onClick={handleClick}>
          {file.filename}
        </button>
        <button
          className="recent-file-remove"
          title="Remove from recently opened"
          onClick={(e) => {
            e.stopPropagation();
            void recentOpenStore.remove(record.id).then(onChange);
          }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {showPicker && versions && (
        <VersionPickerModal versions={versions} onSelect={selectVersion} onClose={closePicker} />
      )}
    </>
  );
}

export function RecentlyOpened({
  records,
  filesById,
  onChange
}: {
  records: RecentOpenRecord[];
  filesById: Map<string, FileRecord>;
  onChange: () => void;
}) {
  const items = records
    .map((record) => ({ record, file: filesById.get(record.fileId) }))
    .filter((x): x is { record: RecentOpenRecord; file: FileRecord } => x.file !== undefined);

  if (items.length === 0) return null;

  return (
    <section className="recently-opened">
      <h3>Recently opened</h3>
      <div className="recently-opened-list">
        {items.map(({ record, file }) => (
          <RecentFileItem key={record.id} record={record} file={file} onChange={onChange} />
        ))}
      </div>
    </section>
  );
}
