import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { assignAcademicYearColors } from '../../lib/academicYearColors';
import { exportCourse } from '../../lib/backup';
import { courseStore, deleteCourse, deleteFiles, fileStore, recentOpenStore, versionStore } from '../../lib/db';
import { buildFileTree, getRootFolderPath, listFolders } from '../../lib/fileTree';
import { displayPath, ignoreState, isIgnoredPath, toggleIgnoredPath } from '../../lib/ignoredFiles';
import { coursePageTitle, withoutTag } from '../../lib/courseNames';
import { hasCourseTag } from '../../lib/downloadNameSettings';
import { addManualFiles } from '../../lib/repository';
import { searchFileTree } from '../../lib/search';
import type { Course, FileRecord, RecentOpenRecord, VersionRecord } from '../../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { FileRow } from '../components/FileRow';
import { FolderRow } from '../components/FolderRow';
import { IgnoredFilesModal } from '../components/IgnoredFilesModal';
import { RecentlyOpened } from '../components/RecentlyOpened';
import { StatusToasts, type StatusMessage } from '../components/StatusToasts';
import { joinPath } from '../../lib/uploadPath';
import { UploadFilesModal } from '../components/UploadFilesModal';
import { useAcademicYearColors } from '../hooks/useAcademicYearColors';
import { useDateColumnWidth } from '../hooks/useDateColumnWidth';
import { PreloadedVersionsContext } from '../hooks/useFileOpener';
import { useFileDrop } from '../hooks/useFileDrop';
import { useFileListKeys } from '../hooks/useFileListKeys';
import { useFullListHeight } from '../hooks/useFullListHeight';
import { IgnoredFilesContext, type IgnoredFiles } from '../hooks/useIgnoredFiles';
import { useScrollFromAnywhere } from '../hooks/useScrollFromAnywhere';
import { useTypeToSearch } from '../hooks/useTypeToSearch';
import { useT } from '../hooks/useTranslation';

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
  const t = useT();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [recentOpens, setRecentOpens] = useState<RecentOpenRecord[]>([]);
  const [query, setQuery] = useState('');

  // The "⋮" menu's actions (rename/export/hide/delete) need the full Course
  // record, which this view isn't handed by App.tsx (only id/name/url) — so
  // it's fetched here, same as `files`/`recentOpens` already are.
  const [course, setCourse] = useState<Course | null>(null);
  const yearColors = useAcademicYearColors();
  // Opened straight to it (the courses list never shown), its year may have none yet.
  useEffect(() => assignAcademicYearColors([course?.academicYear]), [course?.academicYear]);
  const [name, setName] = useState(courseName);
  const [editing, setEditing] = useState(false);
  // Set by Escape, so the blur that can follow the input's removal doesn't save anyway.
  const renameCancelled = useRef(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  // The tag's field takes the focus as it opens, what's in it selected to type over —
  // not with autoFocus, which browsers only honor for what's there as the page loads —
  // and as soon as it's there, so a key pressed right away already lands in it.
  useLayoutEffect(() => {
    if (!editing) return;
    tagInputRef.current?.focus();
    tagInputRef.current?.select();
  }, [editing]);
  const [draft, setDraft] = useState(courseName);
  const [pendingExport, setPendingExport] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [showIgnoredFiles, setShowIgnoredFiles] = useState(false);
  // Files just ignored that are in the course: asked whether to delete them as well.
  const [justIgnored, setJustIgnored] = useState<FileRecord[] | null>(null);

  // Manual upload: files picked or dropped, waiting for the user to choose where they go.
  const [pendingUpload, setPendingUpload] = useState<StagedFile[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileListRef = useRef<HTMLUListElement>(null);
  useDateColumnWidth(fileListRef);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useScrollFromAnywhere(fileListRef, searchInputRef);
  useFileListKeys(fileListRef, searchInputRef);
  useTypeToSearch(searchInputRef);

  // Everything the page shows is read first — the course, its files, recently opened,
  // and every file's versions — and the page only shown once it all is, so it
  // appears whole and in place instead of its parts popping in and shifting it. Read
  // again when a download of this course is saved, with the page staying as it is
  // (open folders, search, scroll) until the new contents are in.
  const [loaded, setLoaded] = useState(false);
  const [preloadedVersions, setPreloadedVersions] = useState<Map<string, VersionRecord[]> | null>(null);
  const [savedDownloads, setSavedDownloads] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [loadedFiles, loadedRecentOpens, loadedCourse] = await Promise.all([
        fileStore.byCourse(courseId),
        recentOpenStore.byCourse(courseId),
        courseStore.get(courseId)
      ]);
      const versions = await Promise.all(loadedFiles.map((f) => versionStore.byFile(f.id)));
      if (cancelled) return;
      setPreloadedVersions(new Map(loadedFiles.map((f, i) => [f.id, versions[i]])));
      setFiles(loadedFiles);
      setRecentOpens(loadedRecentOpens);
      if (loadedCourse) setCourse(loadedCourse);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, savedDownloads]);

  // The background sends this once a download is saved in full, so one that failed or
  // was cancelled changes nothing here (see handleCourseSnapshotChunk).
  useEffect(() => {
    function onMessage(message: unknown) {
      if (typeof message !== 'object' || message === null) return;
      const { topic, courseId: updatedCourseId } = message as { topic?: string; courseId?: string };
      if (topic === 'course-updated' && updatedCourseId === courseId) setSavedDownloads((n) => n + 1);
    }
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
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
      setMessage({ kind: 'error', text: t.courseFiles.couldNotRead(files.length, files[0]?.name ?? '', String(err)) });
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
      setMessage({ kind: 'error', text: t.courseFiles.couldNotAdd(pendingUpload.length, String(err)) });
    } finally {
      setUploading(false);
    }
  }

  function commitRename() {
    setEditing(false);
    if (renameCancelled.current) {
      renameCancelled.current = false;
      setDraft(name);
      return;
    }
    const trimmed = draft.trim();
    if (course && trimmed && (trimmed !== name || !course.tagged)) {
      const updated = { ...course, name: trimmed, tagged: true };
      setCourse(updated);
      setName(trimmed);
      void courseStore.put(updated);
    } else if (course && !trimmed && hasCourseTag(course)) {
      // Emptied: no tag any more, back to the name from Moodle.
      const updated = withoutTag(course);
      setCourse(updated);
      setName(updated.name);
      setDraft(updated.name);
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
      setMessage({ kind: 'info', text: t.common.savedToDownloads(name) });
    } catch (err) {
      setMessage({ kind: 'error', text: t.common.couldNotExport(name, String(err)) });
    } finally {
      setBusy(false);
    }
  }

  // Re-read before writing, so a download that updated the course meanwhile (its
  // last-synced time, say) isn't overwritten with this page's older copy.
  async function saveIgnoredPaths(ignoredPaths: string[]) {
    const fresh = await courseStore.get(courseId);
    if (!fresh) return;
    const updated = { ...fresh, ignoredPaths };
    await courseStore.put(updated);
    setCourse(updated);

    // Then offer to delete the course's files this ignored — downloads leave them as
    // they are now, so a copy that's no longer wanted would otherwise stay for good.
    const newlyIgnored = files.filter(
      (f) =>
        !f.manual &&
        isIgnoredPath(f.relativePath, rootPath, ignoredPaths) &&
        !isIgnoredPath(f.relativePath, rootPath, fresh.ignoredPaths)
    );
    if (newlyIgnored.length > 0) setJustIgnored(newlyIgnored);
  }

  async function deleteJustIgnored(toDelete: FileRecord[]) {
    await deleteFiles(toDelete);
    handleFilesDeleted(toDelete);
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
  useFullListHeight(fileListRef, isSearching);
  const fullTree = useMemo(() => buildFileTree(files), [files]);
  // Search results are the same tree cut down to what's found, so they keep the real
  // folder structure instead of a flat list of full paths — see searchFileTree.
  const { nodes: tree, openFolders } = useMemo(
    () => (isSearching ? searchFileTree(fullTree, query) : { nodes: fullTree, openFolders: undefined }),
    [fullTree, query, isSearching]
  );

  // Where the upload modal can put things. Always built from the full file list, never
  // the search-filtered one, and expressed in real paths (the root is the hidden
  // wrapper folder, if any — see getRootFolderPath).
  const rootPath = useMemo(() => getRootFolderPath(files), [files]);
  const folderOptions = useMemo(
    () =>
      listFolders(fullTree).map((folder) => ({
        path: folder.path,
        label: rootPath && folder.path.startsWith(`${rootPath}/`) ? folder.path.slice(rootPath.length + 1) : folder.path
      })),
    [fullTree, rootPath]
  );
  const existingPaths = useMemo(() => new Set(files.map((f) => f.relativePath)), [files]);

  // Paths as the tree shows them (from the course root), which is how ignored files
  // are kept — see ignoredFiles.ts.
  const coursePaths = useMemo(
    () => files.filter((f) => !f.manual).map((f) => displayPath(f.relativePath, rootPath)),
    [files, rootPath]
  );
  const ignoredFiles = useMemo<IgnoredFiles | null>(
    () =>
      course && {
        fileState: (file) => ignoreState(displayPath(file.relativePath, rootPath), course.ignoredPaths),
        toggleFile: (file) =>
          void saveIgnoredPaths(toggleIgnoredPath(course.ignoredPaths, displayPath(file.relativePath, rootPath))),
        folderState: (folderPath) => ignoreState(displayPath(folderPath, rootPath), course.ignoredPaths, true),
        // A trailing slash marks a folder: it and everything in it.
        toggleFolder: (folderPath) =>
          void saveIgnoredPaths(toggleIgnoredPath(course.ignoredPaths, `${displayPath(folderPath, rootPath)}/`))
      },
    // saveIgnoredPaths reads `files` (to offer deleting what got ignored) and courseId,
    // which `course` already follows.
    [course, rootPath, files]
  );

  return (
    <PreloadedVersionsContext.Provider value={preloadedVersions}>
      <IgnoredFilesContext.Provider value={ignoredFiles}>
        {/* Laid out but not shown until everything's loaded (see above) — rendered all
            along rather than left out, so what measures it (useDateColumnWidth) is set
            up from the start. */}
        <div className="course-files-page" style={loaded ? undefined : { visibility: 'hidden' }}>
          <div className="toolbar course-files-toolbar">
            <button className="secondary back-button" onClick={onBack} title={t.courseFiles.backToCourses} aria-label={t.courseFiles.backToCourses}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
            </button>

            {editing ? (
              <input
                ref={tagInputRef}
                className="course-name-input"
                value={draft}
                onChange={(e) => setDraft(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') {
                    renameCancelled.current = true;
                    setDraft(name);
                    setEditing(false);
                  }
                }}
                onBlur={commitRename}
              />
            ) : (
              // The name it was opened with, until the full course record has loaded.
              // Then the academic year after it, if set, as a label of its own: whole,
              // beside the name however many lines that takes (neither is cut short).
              <h2>
                <span className="course-page-title">{course ? coursePageTitle(course) : name}</span>
                {/* Its label, in its color; the space before it, for what's read out. */}
                {course?.academicYear && ' '}
                {course?.academicYear && (
                  <span
                    className="course-page-academic-year"
                    title={`${t.courseRow.academicYear}: ${course.academicYear}`}
                    style={yearColors[course.academicYear] ? ({ '--year-color': yearColors[course.academicYear] } as CSSProperties) : undefined}
                  >
                    {course.academicYear}
                  </span>
                )}
              </h2>
            )}

            <div className="course-files-toolbar-actions">
              {courseUrl && (
                <button
                  className="secondary back-button"
                  onClick={() => void chrome.tabs.create({ url: courseUrl })}
                  title={t.courseRow.openInMoodle}
                  aria-label={t.courseRow.openInMoodle}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <path d="M15 3h6v6M10 14 21 3" />
                  </svg>
                </button>
              )}
              <DropdownMenu
                title={t.common.moreOptions}
                buttonClassName="secondary toolbar-menu-button"
                disabled={!course || busy}
                items={[
                  {
                    label: t.courseRow.setTagName,
                    icon: 'tag',
                    onClick: () => {
                      setDraft(name);
                      renameCancelled.current = false;
                      setEditing(true);
                    }
                  },
                  { label: t.courseFiles.addFile, icon: 'addFile', onClick: () => fileInputRef.current?.click() },
                  { label: t.courseFiles.ignoredFiles, icon: 'ignore', onClick: () => setShowIgnoredFiles(true) },
                  { label: t.common.export, icon: 'export', onClick: () => setPendingExport(true) },
                  { label: t.courseRow.hideCourse, icon: 'hide', onClick: () => void handleHide() },
                  { label: t.courseRow.deleteCourse, icon: 'delete', onClick: () => setPendingDelete(true), danger: true }
                ]}
              />
            </div>
          </div>


          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const picked = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = '';
              if (picked.length > 0) void stageFiles(picked);
            }}
          />

          {draggingFiles && (
            <div className="drop-overlay" aria-hidden="true">
              <div className="drop-overlay-message">{t.courseFiles.dropFiles(name)}</div>
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

          {showIgnoredFiles && course && (
            <IgnoredFilesModal
              paths={course.ignoredPaths ?? []}
              coursePaths={coursePaths}
              folderPaths={folderOptions.map((folder) => `${folder.label}/`)}
              onSave={(paths) => void saveIgnoredPaths(paths)}
              onClose={() => setShowIgnoredFiles(false)}
            />
          )}

          {justIgnored && (
            <ConfirmModal
              title={t.ignoredFiles.askDeleteTitle(justIgnored.length, justIgnored[0].filename)}
              message={t.ignoredFiles.askDeleteMessage(justIgnored.length)}
              confirmLabel={t.common.delete}
              cancelLabel={t.ignoredFiles.keep(justIgnored.length)}
              danger
              onCancel={() => setJustIgnored(null)}
              onConfirm={() => {
                const toDelete = justIgnored;
                setJustIgnored(null);
                void deleteJustIgnored(toDelete);
              }}
            />
          )}

          {pendingExport && (
            <ConfirmModal
              title={t.courses.exportCourseTitle(name)}
              message={t.courses.exportCourseMessage}
              confirmLabel={t.common.export}
              onCancel={() => setPendingExport(false)}
              onConfirm={() => {
                setPendingExport(false);
                void handleExport();
              }}
            />
          )}

          {pendingDelete && (
            <ConfirmModal
              title={t.courses.deleteCourseTitle(name)}
              message={t.courses.deleteCourseMessage}
              confirmLabel={t.common.delete}
              danger
              onCancel={() => setPendingDelete(false)}
              onConfirm={() => {
                setPendingDelete(false);
                void handleDelete();
              }}
            />
          )}

          <StatusToasts busy={busy ? t.common.exporting : null} message={message} onDismiss={() => setMessage(null)} />

          <RecentlyOpened records={recentOpens} filesById={filesById} onChange={refreshRecentOpens} />

          <input
            ref={searchInputRef}
            className="search-input"
            type="text"
            placeholder={t.courseFiles.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            // Esc in it goes straight back to the courses, as on the rest of the page (see App).
            data-passes-escape
          />

          <div className="file-list-room">
            <ul className={isSearching ? 'file-list searching' : 'file-list'} ref={fileListRef}>
              {tree.map((node) =>
                node.kind === 'folder' ? (
                  <FolderRow
                    key={`${isSearching}:${node.path}`}
                    node={node}
                    depth={0}
                    onFileOpened={refreshRecentOpens}
                    onFileDeleted={handleFileDeleted}
                    onFolderDeleted={handleFilesDeleted}
                    canDownload
                    openFolders={openFolders}
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
                  {isSearching ? t.courseFiles.noMatches(query) : t.courseFiles.noFiles}
                </li>
              )}
            </ul>
          </div>
        </div>
      </IgnoredFilesContext.Provider>
    </PreloadedVersionsContext.Provider>
  );
}
