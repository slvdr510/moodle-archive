import { useId, useState } from 'react';
import { cleanIgnoredPath, ignoredPathMatchesAny, isFolderPath, sameIgnoredPath } from '../../lib/ignoredFiles';
import { useT } from '../hooks/useTranslation';

/**
 * The course's ignored files and folders (see ignoredFiles.ts), to review, remove, or
 * add by typing a path — the folders a file is in included, since two files with the
 * same name in different folders are different files; a path ending in "/" being a
 * whole folder. Nothing is stored until Save.
 */
export function IgnoredFilesModal({
  paths: initialPaths,
  coursePaths,
  folderPaths = [],
  onSave,
  onClose
}: {
  paths: string[];
  /** Every file of the course, as paths from its root: suggested while typing, and
   *  to tell which ignored paths match no file yet. */
  coursePaths: string[];
  /** Every folder of the course, from its root and ending in "/": suggested too. */
  folderPaths?: string[];
  onSave: (paths: string[]) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [paths, setPaths] = useState(initialPaths);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const suggestionsId = useId();

  function add() {
    const path = cleanIgnoredPath(draft);
    if (!path) return;
    if (paths.some((existing) => sameIgnoredPath(existing, path))) {
      setError(t.ignoredFiles.duplicate);
      return;
    }
    setPaths([...paths, path]);
    setDraft('');
    setError(null);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal ignored-files-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t.ignoredFiles.title}</h2>
        <p>{t.ignoredFiles.description}</p>

        {paths.length === 0 ? (
          <p className="ignored-files-empty">{t.ignoredFiles.empty}</p>
        ) : (
          <ul className="ignored-files-list">
            {paths.map((path) => (
              <li key={path}>
                {isFolderPath(path) && (
                  <svg className="ignored-folder-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-label={t.ignoredFiles.folder}>
                    <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
                  </svg>
                )}
                <span className="ignored-file-path" title={path}>
                  {path}
                </span>
                {!ignoredPathMatchesAny(path, coursePaths) && (
                  <span className="ignored-file-missing">{t.ignoredFiles.notFound}</span>
                )}
                <button
                  className="icon-button"
                  title={t.ignoredFiles.remove(path)}
                  aria-label={t.ignoredFiles.remove(path)}
                  onClick={() => setPaths(paths.filter((existing) => existing !== path))}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <label>
          {t.ignoredFiles.pathLabel}
          <span className="ignored-files-add">
            <input
              type="text"
              list={suggestionsId}
              value={draft}
              placeholder={t.ignoredFiles.placeholder}
              onChange={(e) => {
                setDraft(e.currentTarget.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <button className="secondary" disabled={!cleanIgnoredPath(draft)} onClick={add}>
              {t.ignoredFiles.add}
            </button>
          </span>
        </label>
        <datalist id={suggestionsId}>
          {[...folderPaths, ...coursePaths].map((path) => (
            <option key={path} value={path} />
          ))}
        </datalist>
        {error ? <p className="hint-text error">{error}</p> : <p className="hint-text">{t.ignoredFiles.hint}</p>}

        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button
            onClick={() => {
              onSave(paths);
              onClose();
            }}
          >
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
