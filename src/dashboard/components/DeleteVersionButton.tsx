import { useState } from 'react';
import type { VersionRecord } from '../../types';
import { useT } from '../hooks/useTranslation';
import { ConfirmModal } from './ConfirmModal';

/** A trash button that deletes one of a file's older versions, after a confirmation. */
export function DeleteVersionButton({
  version,
  label,
  onDelete
}: {
  version: VersionRecord;
  /** How the version is shown in the list, e.g. "v1". */
  label: string;
  onDelete: (version: VersionRecord) => Promise<void> | void;
}) {
  const t = useT();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        className="icon-button version-delete-button"
        title={t.versions.deleteTitle}
        aria-label={t.versions.deleteTitle}
        onClick={(e) => {
          e.stopPropagation();
          setConfirming(true);
        }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
        </svg>
      </button>
      {confirming && (
        <ConfirmModal
          title={t.versions.deleteConfirmTitle(label)}
          message={t.versions.deleteConfirmMessage}
          confirmLabel={t.common.delete}
          danger
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            void onDelete(version);
          }}
        />
      )}
    </>
  );
}
