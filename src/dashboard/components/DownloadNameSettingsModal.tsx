import { useState } from 'react';
import { usePrefixCourseTag } from '../hooks/usePrefixCourseTag';
import { useT } from '../hooks/useTranslation';

/** Global (every course) settings for how downloaded files are named. */
export function DownloadNameSettingsModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [prefixCourseTag, setPrefixCourseTag] = usePrefixCourseTag();
  const [enabled, setEnabled] = useState(prefixCourseTag);

  function handleSave() {
    setPrefixCourseTag(enabled);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal recent-settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t.downloadNames.title}</h2>
        <p>{t.downloadNames.description}</p>
        <div className="upload-options">
          <label className="upload-option">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.currentTarget.checked)} />
            {t.downloadNames.prefixCourseTag}
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button onClick={handleSave}>{t.common.save}</button>
        </div>
      </div>
    </div>
  );
}
