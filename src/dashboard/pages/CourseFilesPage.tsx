import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exportCourse } from '../../lib/backup';
import { courseStore, deleteCourse, fileStore, recentOpenStore } from '../../lib/db';
import { buildFileTree, getRootFolderPath, listFolders } from '../../lib/fileTree';
import { addManualFiles } from '../../lib/repository';
import { filterFilesByQuery } from '../../lib/search';
import type { Course, FileRecord, RecentOpenRecord } from '../../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { FileRow } from '../components/FileRow';
import { FolderRow } from '../components/FolderRow';
import { RecentlyOpened } from '../components/RecentlyOpened';
import { Spinner } from '../components/Spinner';
import { joinPath } from '../../lib/uploadPath';
import { UploadFilesModal } from '../components/UploadFilesModal';
import { useFileDrop } from '../hooks/useFileDrop';

/** A file the user picked or dropped, already read into memory. */
interface StagedFile {
  name: string;
  content: Uint8Array;
}

export function CourseFilesPage({
  courseId,
  courseName,
  courseUrl,
  onBack
}: {
  courseId: string;
  courseName: string;
  courseUrl?: string;
  onBack: () => void;
}) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [recentOpens, setRecentOpens] = useState<RecentOpenRecord[]>([]);
  const [query, setQuery] = useState('');

  // The "⋮" menu's actions (rename/export/hide/delete) need the full Course
  // record, which this view isn't handed by App.tsx (only id/name/url) — so
  // it's fetched here, same as `files`/`recentOpens` already are.
  const [course, setCourse] = useState<Course | null>(null);
  const [name, setName] = useState(courseName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(courseName);
  const [pendingExport, setPendingExport] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Manual upload: files picked or dropped, waiting for the user to choose where they go.
  const [pendingUpload, setPendingUpload] = useState<StagedFile[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fileStore.byCourse(courseId).then(setFiles);
    void recentOpenStore.byCourse(courseId).then(setRecentOpens);
    void courseStore.get(courseId).then((c) => c && setCourse(c));
  }, [courseId]);

  // The bytes are read the moment a file is picked or dropped, not later when the user
  // confirms: a `File` is only a handle to something on disk, and by then it may be
  // gone (a browser download still being finalized, a temp file, an unplugged drive),
  // which fails with a NotFoundError.
  async function stageFiles(files: File[]) {
    setMessage(null);
    try {
      setPendingUpload(
        await Promise.all(files.map(async (file) => ({ name: file.name, content: new Uint8Array(await file.arrayBuffer()) })))
      );
    } catch (err) {
      setMessage(
        `Could not read ${files.length === 1 ? `"${files[0].name}"` : 'the dropped files'} — the file may have been moved or ` +
          `deleted, or it is still being downloaded. Try again from a stable location. (${String(err)})`
      );
    }
  }

  // Already choosing a destination for other files — a second drop is ignored.
  const draggingFiles = useFileDrop((dropped) => void stageFiles(dropped), pendingUpload !== null);

  const refreshRecentOpens = useCallback(() => {
    void recentOpenStore.byCourse(courseId).then(setRecentOpens);
  }, [courseId]);

  function handleFileDeleted(deleted: FileRecord) {
    setFiles((current) => current.filter((f) => f.id !== deleted.id));
    refreshRecentOpens();
  }

  function handleFilesDeleted(deleted: FileRecord[]) {
    const ids = new Set(deleted.map((f) => f.id));
    setFiles((current) => current.filter((f) => !ids.has(f.id)));
    refreshRecentOpens();
  }

  async function handleUploadConfirm(folderPath: string) {
    if (!pendingUpload) return;
    setUploading(true);
    setMessage(null);
    try {
      await addManualFiles(
        courseId,
        pendingUpload.map((file) => ({ relativePath: joinPath(folderPath, file.name), content: file.content }))
      );
      setFiles(await fileStore.byCourse(courseId));
      setPendingUpload(null);
    } catch (err) {
      setPendingUpload(null);
      setMessage(`Could not add the file${pendingUpload.length === 1 ? '' : 's'}: ${String(err)}`);
    } finally {
      setUploading(false);
    }
  }

  function commitRename() {
    setEditing(false);
    const trimmed = draft.trim();
    if (course && trimmed && trimmed !== name) {
      const updated = { ...course, name: trimmed };
      setCourse(updated);
      setName(trimmed);
      void courseStore.put(updated);
    } else {
      setDraft(name);
    }
  }

  async function handleExport() {
    setMessage(null);
    setBusy(true);
    try {
      await exportCourse(courseId);
      setMessage(`"${name}" saved to your Downloads folder.`);
    } catch (err) {
      setMessage(`Could not export "${name}": ${String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleHide() {
    if (!course) return;
    await courseStore.put({ ...course, hidden: true });
    onBack();
  }

  async function handleDelete() {
    await deleteCourse(courseId);
    onBack();
  }

  const filesById = useMemo(() => new Map(files.map((f) => [f.id, f])), [files]);

  const isSearching = query.trim().length > 0;
  const displayedFiles = useMemo(
    () => (isSearching ? filterFilesByQuery(files, query) : files),
    [files, query, isSearching]
  );
  // Reuses the same tree-building as the normal view, just scoped to the matching
  // files, so search results keep the real folder structure instead of a flat
  // list of full paths. `files` (the full list) is passed as the reference so the
  // redundant-root-folder unwrapping is decided from the real structure, not from
  // however few files happen to match the search.
  const tree = useMemo(() => buildFileTree(displayedFiles, files), [displayedFiles, files]);

  // Where the upload modal can put things. Always built from the full file list, never
  // the search-filtered one, and expressed in real paths (the root is the hidden
  // wrapper folder, if any — see getRootFolderPath).
  const rootPath = useMemo(() => getRootFolderPath(files), [files]);
  const folderOptions = useMemo(
    () =>
      listFolders(buildFileTree(files)).map((folder) => ({
        path: folder.path,
        label: rootPath && folder.path.startsWith(`${rootPath}/`) ? folder.path.slice(rootPath.length + 1) : folder.path
      })),
    [files, rootPath]
  );
  const existingPaths = useMemo(() => new Set(files.map((f) => f.relativePath)), [files]);

  return (
    <div className="course-files-page">
      <div className="toolbar course-files-toolbar">
        <button className="secondary back-button" onClick={onBack} title="Back to courses" aria-label="Back to courses">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
        </button>

        {editing ? (
          <input
            className="course-name-input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setDraft(name);
                setEditing(false);
              }
            }}
            onBlur={commitRename}
          />
        ) : (
          <h2>{name}</h2>
        )}

        <div className="course-files-toolbar-actions">
          {courseUrl && (
            <button
              className="secondary back-button"
              onClick={() => void chrome.tabs.create({ url: courseUrl })}
              title="Open the course in Moodle"
              aria-label="Open the course in Moodle"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6M10 14 21 3" />
              </svg>
            </button>
          )}
          <DropdownMenu
            title="More options"
            buttonClassName="secondary toolbar-menu-button"
            disabled={!course || busy}
            items={[
              {
                label: 'Set tag name',
                onClick: () => {
                  setDraft(name);
                  setEditing(true);
                }
              },
              { label: 'Add file…', onClick: () => fileInputRef.current?.click() },
              { label: 'Export', onClick: () => setPendingExport(true) },
              { label: 'Hide course', onClick: () => void handleHide() },
              { label: 'Delete course', onClick: () => setPendingDelete(true), danger: true }
            ]}
          />
        </div>
      </div>

      {busy && (
        <div className="busy-notice">
          <Spinner label="Exporting…" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (picked.length > 0) void stageFiles(picked);
        }}
      />

      {draggingFiles && (
        <div className="drop-overlay" aria-hidden="true">
          <div className="drop-overlay-message">Drop files to add them to "{name}"</div>
        </div>
      )}

      {pendingUpload && (
        <UploadFilesModal
          files={pendingUpload}
          rootPath={rootPath}
          folders={folderOptions}
          existingPaths={existingPaths}
          busy={uploading}
          onConfirm={(folderPath) => void handleUploadConfirm(folderPath)}
          onCancel={() => setPendingUpload(null)}
        />
      )}

      {pendingExport && (
        <ConfirmModal
          title={`Export "${name}"?`}
          message="The course, its files, and every version will be saved to a zip in your Downloads folder."
          confirmLabel="Export"
          onCancel={() => setPendingExport(false)}
          onConfirm={() => {
            setPendingExport(false);
            void handleExport();
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title={`Delete "${name}"?`}
          message="This removes it and its tracked file/version history. If you download this course again later, it will just be re-created from scratch."
          confirmLabel="Delete"
          danger
          onCancel={() => setPendingDelete(false)}
          onConfirm={() => {
            setPendingDelete(false);
            void handleDelete();
          }}
        />
      )}

      {message && <p className="hint-text">{message}</p>}

      <RecentlyOpened records={recentOpens} filesById={filesById} onChange={refreshRecentOpens} />

      <input
        className="search-input"
        type="text"
        placeholder="Search files by name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <ul className="file-list">
        {tree.map((node) =>
          node.kind === 'folder' ? (
            <FolderRow
              key={`${isSearching}:${node.path}`}
              node={node}
              depth={0}
              onFileOpened={refreshRecentOpens}
              onFileDeleted={handleFileDeleted}
              onFolderDeleted={isSearching ? undefined : handleFilesDeleted}
              canDownload={!isSearching}
              defaultExpanded={isSearching}
            />
          ) : (
            <FileRow
              key={`${isSearching}:${node.file.id}`}
              file={node.file}
              depth={0}
              onFileOpened={refreshRecentOpens}
              onFileDeleted={handleFileDeleted}
            />
          )
        )}
        {tree.length === 0 && (
          <li className="empty">
            {isSearching ? `No files match "${query}".` : 'No files downloaded yet for this course.'}
          </li>
        )}
      </ul>
    </div>
  );
}
