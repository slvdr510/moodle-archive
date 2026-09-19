/** A small spinning indicator with an optional label, for actions (export/import)
 *  that take a moment — so it's clear something is happening, not frozen. */
export function Spinner({ label }: { label?: string }) {
  return (
    <span className="spinner-wrap" role="status" aria-live="polite">
      <svg className="spinner" viewBox="0 0 24 24" width="15" height="15" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label && <span>{label}</span>}
    </span>
  );
}
