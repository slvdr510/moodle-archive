import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../hooks/useTranslation';
import { Spinner } from './Spinner';

export type StatusMessage = { kind: 'info' | 'error'; text: string };

/** How long a message stays: an error long enough to read what went wrong. */
export const MESSAGE_MS = { info: 4000, error: 8000 } as const;
/** Its fading out, before it's gone. */
const LEAVE_MS = 200;

/**
 * What's going on (`busy`: "Exporting…", with its spinner) and how it went
 * (`message`), floating a quarter of the way down the window rather than taking room —
 * nothing moves as they come and go.
 *
 * `busy` stays as long as it's given. A message goes on its own after a few seconds
 * (MESSAGE_MS), fading out, then `onDismiss`; not while the pointer is over it (to read
 * it, or copy it), and at once from its ×. A new message starts its time over.
 */
export function StatusToasts({
  busy,
  message,
  onDismiss
}: {
  busy?: string | null;
  message?: StatusMessage | null;
  onDismiss: () => void;
}) {
  const t = useT();
  const [leaving, setLeaving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // A new message: shown whole again, its time from the start (the pointer that was
  // over the last one, gone with it).
  useEffect(() => {
    setLeaving(false);
    setHovered(false);
  }, [message]);

  useEffect(() => {
    if (!message || hovered || leaving) return;
    const timer = setTimeout(() => setLeaving(true), MESSAGE_MS[message.kind]);
    return () => clearTimeout(timer);
  }, [message, hovered, leaving]);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => onDismissRef.current(), LEAVE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  return createPortal(
    // Always there, so what comes into it is read out as it comes.
    <div className="status-toasts" aria-live="polite">
      {busy && (
        <div className="status-toast busy">
          <Spinner label={busy} />
        </div>
      )}
      {message && (
        <div
          className={`status-toast ${message.kind}${leaving ? ' leaving' : ''}`}
          role={message.kind === 'error' ? 'alert' : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span className="status-toast-text">{message.text}</span>
          <button type="button" className="status-toast-close" title={t.common.close} aria-label={t.common.close} onClick={() => setLeaving(true)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
