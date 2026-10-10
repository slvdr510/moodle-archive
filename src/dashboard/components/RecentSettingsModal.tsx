import { useState } from 'react';
import { useRecentSettings } from '../hooks/useRecentSettings';
import { useT } from '../hooks/useTranslation';

/** Global (every course) settings for the "Recently opened" strip. */
export function RecentSettingsModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [settings, setSettings] = useRecentSettings();
  const [enabled, setEnabled] = useState(settings.enabled);
  const [unlimited, setUnlimited] = useState(settings.unlimited);
  const [maxItems, setMaxItems] = useState(String(settings.maxItems));

  const parsedMax = Number(maxItems);
  const maxIsValid = Number.isInteger(parsedMax) && parsedMax >= 1;
  const canSave = !enabled || unlimited || maxIsValid;

  function handleSave() {
    setSettings({ enabled, unlimited, maxItems: maxIsValid ? parsedMax : settings.maxItems });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal recent-settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t.recentSettings.title}</h2>
        <p>{t.recentSettings.appliesToAll}</p>
        <div className="upload-options">
          <label className="upload-option">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.currentTarget.checked)} />
            {t.recentSettings.show}
          </label>
          <label className="upload-option">
            <input
              type="checkbox"
              checked={unlimited}
              disabled={!enabled}
              onChange={(e) => setUnlimited(e.currentTarget.checked)}
            />
            {t.recentSettings.noLimit}
          </label>
          <label className="recent-settings-max">
            {t.recentSettings.maximum}
            <input
              type="number"
              min={1}
              step={1}
              value={maxItems}
              disabled={!enabled || unlimited}
              onChange={(e) => setMaxItems(e.currentTarget.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button disabled={!canSave} onClick={handleSave}>
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
