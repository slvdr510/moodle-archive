import { recentOpenStore } from '../../lib/db';
import { applyRecentSettings } from '../../lib/recentSettings';
import type { FileRecord, RecentOpenRecord } from '../../types';
import { useFileOpener } from '../hooks/useFileOpener';
import { useRecentSettings } from '../hooks/useRecentSettings';
import { FileName } from './FileName';
import { VersionPickerModal } from './VersionPickerModal';
import { useT } from '../hooks/useTranslation';

function RecentFileItem({
  record,
  file,
  onChange
}: {
  record: RecentOpenRecord;
  file: FileRecord;
  onChange: () => void;
}) {
  const t = useT();
  const { handleClick, showPicker, closePicker, selectVersion, deleteVersion, versions } = useFileOpener(file, onChange);

  return (
    <>
      {/* The whole pill opens the file, not just its text. The inner button stays for
          keyboard/screen-reader access — its clicks bubble up to this handler. */}
      <div className="recent-file-item" onClick={handleClick}>
        <button className="recent-file-open">
          <FileName name={file.filename} />
        </button>
        <button
          className="recent-file-remove"
          title={t.recentlyOpened.remove}
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
        <VersionPickerModal versions={versions} onSelect={selectVersion} onDelete={deleteVersion} onClose={closePicker} />
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
  const t = useT();
  const [settings] = useRecentSettings();
  const items = applyRecentSettings(
    records
      .map((record) => ({ record, file: filesById.get(record.fileId) }))
      .filter((x): x is { record: RecentOpenRecord; file: FileRecord } => x.file !== undefined),
    settings
  );

  if (items.length === 0) return null;

  return (
    <section className="recently-opened">
      <h3>{t.recentlyOpened.title}</h3>
      <div className="recently-opened-list">
        {items.map(({ record, file }) => (
          <RecentFileItem key={record.id} record={record} file={file} onChange={onChange} />
        ))}
      </div>
    </section>
  );
}
