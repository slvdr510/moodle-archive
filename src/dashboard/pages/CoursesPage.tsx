import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { InvalidBackupError, exportAllData, exportCourse, importAllData } from '../../lib/backup';
import { courseStore, deleteCourse, resetTrackedData } from '../../lib/db';
import type { Course } from '../../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { CourseRow } from '../components/CourseRow';
import { DropdownMenu } from '../components/DropdownMenu';
import { HiddenCoursesModal } from '../components/HiddenCoursesModal';
import { Spinner } from '../components/Spinner';
import { useFileDrop } from '../hooks/useFileDrop';

type TransientMessage = { kind: 'info' | 'error'; text: string };
type PendingExport = { kind: 'all' } | { kind: 'course'; course: Course };
type PendingDelete = { kind: 'all' } | { kind: 'course'; course: Course };

function courseUrlOf(course: Course): string | undefined {
  return course.url || course.matchedUrls[0];
}

export function CoursesPage({
  onOpenCourse,
  headerMenuSlot
}: {
  onOpenCourse: (courseId: string, courseName: string, courseUrl: string | undefined) => void;
  /** DOM node in the app header to portal the "⋮" overflow menu into. */
  headerMenuSlot: HTMLDivElement | null;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  // Distinguishes "genuinely no courses" from "haven't loaded yet" — without
  // it, navigating back to this view remounts it with courses briefly empty,
  // flashing the "no courses yet" messaging before the real list loads in.
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [message, setMessage] = useState<TransientMessage | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pendingExport, setPendingExport] = useState<PendingExport | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [showHiddenModal, setShowHiddenModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function reload() {
    const all = await courseStore.all();
    setCourses([...all].sort((a, b) => a.order - b.order));
    setLoaded(true);
  }

  useEffect(() => {
    void reload();
  }, []);

  // A download in another tab (or this one, before the dashboard was opened)
  // notifies us via this message so the list refreshes without a manual reload.
  useEffect(() => {
    function onMessage(message: unknown) {
      if (typeof message === 'object' && message !== null && (message as { topic?: string }).topic === 'course-updated') {
        void reload();
      }
    }
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, []);

  async function handleRenameCourse(course: Course, name: string) {
    await courseStore.put({ ...course, name });
    await reload();
  }

  async function handleHideCourse(course: Course) {
    await courseStore.put({ ...course, hidden: true });
    await reload();
  }

  async function handleUnhideCourse(course: Course) {
    await courseStore.put({ ...course, hidden: false });
    await reload();
  }

  async function handleDeleteCourse(course: Course) {
    await deleteCourse(course.id);
    await reload();
  }

  async function handleDrop(targetId: string) {
    const sourceId = draggedId;
    setDraggedId(null);
    setDragOverId(null);
    if (!sourceId || sourceId === targetId) return;

    // Reorder only among the visible (rendered, draggable) courses — a hidden
    // course keeps its old `order` for now, since it isn't part of this list.
    const visible = courses.filter((c) => !c.hidden);
    const fromIndex = visible.findIndex((c) => c.id === sourceId);
    const toIndex = visible.findIndex((c) => c.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...visible];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const renumbered = reordered.map((c, index) => ({ ...c, order: index }));
    // Rebuild with the visible courses in their new order — hidden ones are
    // filtered out of what's rendered anyway, so their position here doesn't matter.
    setCourses([...renumbered, ...courses.filter((c) => c.hidden)]);
    await Promise.all(renumbered.map((c) => courseStore.put(c)));
  }

  async function handleReset() {
    await resetTrackedData();
    await reload();
  }

  async function handleExport() {
    setMessage(null);
    setBusy('export');
    try {
      await exportAllData();
      setMessage({ kind: 'info', text: 'Backup saved to your Downloads folder.' });
    } catch (err) {
      setMessage({ kind: 'error', text: `Could not export: ${String(err)}` });
    } finally {
      setBusy(null);
    }
  }

  async function handleExportCourse(course: Course) {
    setMessage(null);
    setBusy('export');
    try {
      await exportCourse(course.id);
      setMessage({ kind: 'info', text: `"${course.name}" saved to your Downloads folder.` });
    } catch (err) {
      setMessage({ kind: 'error', text: `Could not export "${course.name}": ${String(err)}` });
    } finally {
      setBusy(null);
    }
  }

  function handleImportClick() {
    setMessage(null);
    fileInputRef.current?.click();
  }

  function handleOpenAllCourseUrls() {
    const urls = courses
      .filter((c) => !c.hidden)
      .map(courseUrlOf)
      .filter((url): url is string => Boolean(url));
    if (urls.length === 0) {
      setMessage({ kind: 'error', text: 'No course URLs to open.' });
      return;
    }
    setMessage(null);
    for (const url of urls) {
      void chrome.tabs.create({ url });
    }
  }

  /**
   * Imports each file in turn (see `importAllData`) and reports one combined result.
   * A file that isn't a zip in this extension's course format is skipped with a
   * notice, without importing anything from it — and doesn't stop the ones after it.
   */
  async function importBackups(files: File[]) {
    setMessage(null);
    setBusy('import');
    const total = { courses: 0, files: 0, versions: 0 };
    let importedCount = 0;
    const invalid: string[] = [];
    const failures: string[] = [];
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        invalid.push(file.name);
        continue;
      }
      try {
        const summary = await importAllData(file);
        total.courses += summary.courses;
        total.files += summary.files;
        total.versions += summary.versions;
        importedCount++;
      } catch (err) {
        if (err instanceof InvalidBackupError) invalid.push(file.name);
        else failures.push(`"${file.name}": ${String(err)}`);
      }
    }
    try {
      await reload();
    } finally {
      setBusy(null);
    }

    const parts: string[] = [];
    if (importedCount > 0) {
      parts.push(`Imported ${total.courses} course(s), ${total.files} file(s), ${total.versions} version(s).`);
    }
    for (const name of invalid) {
      parts.push(`"${name}" is not a zip file in the course format used by this extension.`);
    }
    if (failures.length > 0) parts.push(`Could not import ${failures.join('; ')}`);
    setMessage({ kind: invalid.length > 0 || failures.length > 0 ? 'error' : 'info', text: parts.join(' ') });
  }

  async function handleImportFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-selecting the same file later
    if (files.length > 0) await importBackups(files);
  }

  // Backups can be dropped anywhere on the page — see importBackups for what happens to
  // a file that isn't one. Ignored while something is already running or a dialog is open.
  const draggingFiles = useFileDrop(
    (dropped) => void importBackups(dropped),
    busy !== null || pendingExport !== null || pendingDelete !== null || showHiddenModal
  );

  const visibleCourses = courses.filter((c) => !c.hidden);
  const hiddenCourses = courses.filter((c) => c.hidden);

  return (
    <div className="courses-page">
      {headerMenuSlot &&
        createPortal(
          <DropdownMenu
            title="More options"
            buttonClassName="secondary toolbar-menu-button"
            disabled={busy !== null}
            items={[
              { label: 'Export all courses', onClick: () => setPendingExport({ kind: 'all' }) },
              { label: 'Import course(s)', onClick: handleImportClick },
              { label: 'Open all course URLs', onClick: handleOpenAllCourseUrls },
              { label: 'Show hidden courses', onClick: () => setShowHiddenModal(true) },
              { label: 'Delete all courses', onClick: () => setPendingDelete({ kind: 'all' }), danger: true }
            ]}
          />,
          headerMenuSlot
        )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        multiple
        hidden
        onChange={(e) => void handleImportFileChosen(e)}
      />

      {busy && (
        <div className="busy-notice">
          <Spinner label={busy === 'export' ? 'Exporting…' : 'Importing…'} />
        </div>
      )}

      {message && <p className={message.kind === 'error' ? 'hint-text error' : 'hint-text'}>{message.text}</p>}

      {draggingFiles && (
        <div className="drop-overlay" aria-hidden="true">
          <div className="drop-overlay-message">Drop .zip backups to import their courses</div>
        </div>
      )}

      {pendingExport && (
        <ConfirmModal
          title={pendingExport.kind === 'all' ? 'Export all courses?' : `Export "${pendingExport.course.name}"?`}
          message={
            pendingExport.kind === 'all'
              ? 'Every tracked course, file, and version will be saved to a single zip in your Downloads folder.'
              : 'The course, its files, and every version will be saved to a zip in your Downloads folder.'
          }
          confirmLabel="Export"
          onCancel={() => setPendingExport(null)}
          onConfirm={() => {
            const target = pendingExport;
            setPendingExport(null);
            if (target.kind === 'all') void handleExport();
            else void handleExportCourse(target.course);
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title={pendingDelete.kind === 'all' ? 'Delete all courses?' : `Delete "${pendingDelete.course.name}"?`}
          message={
            pendingDelete.kind === 'all'
              ? 'This clears every course, file, and version history tracked by the extension. ' +
                'Download a course again afterwards to start rebuilding its history.'
              : 'This removes it and its tracked file/version history. If you download this course ' +
                'again later, it will just be re-created from scratch.'
          }
          confirmLabel="Delete"
          danger
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            const target = pendingDelete;
            setPendingDelete(null);
            if (target.kind === 'all') void handleReset();
            else void handleDeleteCourse(target.course);
          }}
        />
      )}

      {showHiddenModal && (
        <HiddenCoursesModal
          courses={hiddenCourses}
          onUnhide={(course) => void handleUnhideCourse(course)}
          onClose={() => setShowHiddenModal(false)}
        />
      )}

      <ul className="course-list">
        {visibleCourses.map((course) => (
          <CourseRow
            key={course.id}
            course={course}
            onOpen={() => onOpenCourse(course.id, course.name, courseUrlOf(course))}
            onRename={(name) => void handleRenameCourse(course, name)}
            onDelete={() => setPendingDelete({ kind: 'course', course })}
            onExport={() => setPendingExport({ kind: 'course', course })}
            onHide={() => void handleHideCourse(course)}
            onDragStart={() => setDraggedId(course.id)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragOverId !== course.id) setDragOverId(course.id);
            }}
            onDrop={() => void handleDrop(course.id)}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverId(null);
            }}
            isDragging={draggedId === course.id}
            isDragOver={dragOverId === course.id && draggedId !== course.id}
          />
        ))}
        {loaded && visibleCourses.length === 0 && (
          <li className={courses.length === 0 ? 'empty empty-welcome' : 'empty'}>
            {courses.length === 0 ? (
              <>
                <div className="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7h18v3H3zM5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9M10 14h4" />
                  </svg>
                </div>
                <h2 className="empty-title">No courses yet</h2>
                <p className="empty-subtitle">Courses are created automatically the first time you download one.</p>
                <ol className="empty-steps">
                  <li>Open a course in Moodle</li>
                  <li>Click the extension icon</li>
                  <li>
                    Press <strong>Download</strong>
                  </li>
                </ol>
                <p className="empty-hint">
                  Already have a backup? Drop its <strong>.zip</strong> anywhere on this page to import it.
                </p>
              </>
            ) : (
              'All your courses are hidden. Use "Show hidden courses" in the ⋮ menu to bring one back.'
            )}
          </li>
        )}
      </ul>
    </div>
  );
}
