/** The eye toggle on file and folder rows for "Ignore changes" — see ignoredFiles.ts. */
export function IgnoreButton({ ignored, title, onToggle }: { ignored: boolean; title: string; onToggle: () => void }) {
  return (
    <button
      className="icon-button row-action-button ignore-button"
      title={title}
      aria-pressed={ignored}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {ignored ? (
        // An eye: start watching for changes again.
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        // A crossed-out eye: stop watching it.
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-2.2 3.2M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
        </svg>
      )}
    </button>
  );
}
