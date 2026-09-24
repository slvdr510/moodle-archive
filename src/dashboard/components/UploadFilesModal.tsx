import { useState } from 'react';
import { joinPath, sanitizeFolderName } from '../../lib/uploadPath';

type Destination = 'root' | 'existing' | 'new';

export interface FolderOption {
  /** Real full path, as stored in `relativePath`s. */
  path: string;
  /** What the user sees — the path relative to the course's root. */
  label: string;
}

/**
 * Asks where files the user just dropped/picked should go in a course: the root,
 * a folder that already exists, or a brand-new one. A file whose name is already in
 * that folder isn't renamed or refused: it's added as one more version of the
 * existing file (see addManualFiles), and the modal just says so up front.
 */
export function UploadFilesModal({
  files,
  rootPath,
  folders,
  existingPaths,
  busy = false,
  onConfirm,
  onCancel
}: {
  /** Only the names matter here — the caller keeps the content. */
  files: { name: string }[];
  /** Real path of the course's root (see getRootFolderPath). */
  rootPath: string;
  folders: FolderOption[];
  /** relativePaths already tracked in this course, to say which files will become a new version. */
  existingPaths: Set<string>;
  busy?: boolean;
  /** Receives the real folder path the files should be saved under, each keeping its own name. */
  onConfirm: (folderPath: string) => void;
  onCancel: () => void;
}) {
  const [destination, setDestination] = useState<Destination>('root');
  const [folderPath, setFolderPath] = useState(folders[0]?.path ?? '');
  const [newFolder, setNewFolder] = useState('');

  const cleanedNewFolder = sanitizeFolderName(newFolder);
  const targetFolder =
    destination === 'root' ? rootPath : destination === 'existing' ? folderPath : joinPath(rootPath, cleanedNewFolder);
  // With "New folder" picked but still unnamed there's no destination yet — checking
  // against the root in the meantime would flag a name clash with a file that has
  // nothing to do with where the files are going.
  const hasDestination = destination !== 'new' || cleanedNewFolder !== '';
  const updatedNames = hasDestination
    ? files.filter((file) => existingPaths.has(joinPath(targetFolder, file.name))).map((file) => file.name)
    : [];

  const canConfirm = !busy && hasDestination && (destination !== 'existing' || folders.length > 0);

  const submit = () => onConfirm(targetFolder);

  const title = files.length === 1 ? `Add "${files[0].name}"` : `Add ${files.length} files`;

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div className="modal upload-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>Where do you want to save {files.length === 1 ? 'it' : 'them'}?</p>

        <div className="upload-options">
          <label className="upload-option">
            <input type="radio" name="destination" checked={destination === 'root'} onChange={() => setDestination('root')} />
            <span>Course root</span>
          </label>

          <label className="upload-option">
            <input
              type="radio"
              name="destination"
              checked={destination === 'existing'}
              disabled={folders.length === 0}
              onChange={() => setDestination('existing')}
            />
            <span>Existing folder</span>
          </label>
          {destination === 'existing' && (
            <select value={folderPath} onChange={(e) => setFolderPath(e.target.value)} aria-label="Existing folder">
              {folders.map((folder) => (
                <option key={folder.path} value={folder.path}>
                  {folder.label}
                </option>
              ))}
            </select>
          )}

          <label className="upload-option">
            <input type="radio" name="destination" checked={destination === 'new'} onChange={() => setDestination('new')} />
            <span>New folder</span>
          </label>
          {destination === 'new' && (
            <input
              type="text"
              value={newFolder}
              autoFocus
              placeholder="Folder name"
              aria-label="New folder name"
              // Only ever a folder name: separators can't be typed at all.
              onChange={(e) => setNewFolder(e.target.value.replace(/[/\\]/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) submit();
              }}
            />
          )}
        </div>

        {updatedNames.map((name, index) => (
          <p key={index} className="upload-note">
            <strong>{name}</strong> already exists in this folder — the new file will be added as a new version of it.
          </p>
        ))}

        <div className="modal-actions">
          <button className="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button onClick={submit} disabled={!canConfirm}>
            {busy ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
