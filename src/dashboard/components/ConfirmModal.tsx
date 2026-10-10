import { useT } from '../hooks/useTranslation';

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel
}: {
  title: string;
  message: string;
  confirmLabel: string;
  /** Defaults to "Cancel" — for when declining is itself a choice ("Keep it"). */
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useT();
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirm-modal-title" title={title}>
          {title}
        </h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="secondary" onClick={onCancel}>
            {cancelLabel ?? t.common.cancel}
          </button>
          <button className={danger ? 'danger' : undefined} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
