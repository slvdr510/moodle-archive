import { useT } from '../hooks/useTranslation';

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  strong = false,
  onConfirm,
  onCancel
}: {
  title: string;
  message: string;
  confirmLabel: string;
  /** Defaults to "Cancel" — for when declining is itself a choice ("Keep it"). */
  cancelLabel?: string;
  danger?: boolean;
  /** For something dangerous: the confirm button in red, and the cancel one — in focus
   *  as it opens — in the accent color, the safe choice that stands out. */
  strong?: boolean;
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
        {/* In focus as it opens (see useDialogKeys): the confirm button, or for something
            that can't be undone, the cancel one, so a stray Enter doesn't do it. */}
        <div className="modal-actions">
          <button className={danger && strong ? 'safe' : 'secondary'} data-autofocus={danger || undefined} onClick={onCancel}>
            {cancelLabel ?? t.common.cancel}
          </button>
          <button className={danger ? `danger${strong ? ' solid' : ''}` : undefined} data-autofocus={!danger || undefined} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
