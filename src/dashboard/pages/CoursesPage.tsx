import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { exportAllData, exportCourse, importAllData } from '../../lib/backup';
import { courseStore, deleteCourse, resetTrackedData } from '../../lib/db';
import type { Course } from '../../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { CourseRow } from '../components/CourseRow';
import { DropdownMenu } from '../components/DropdownMenu';
import { HiddenCoursesModal } from '../components/HiddenCoursesModal';
import { Spinner } from '../components/Spinner';

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

  async function handleImportFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setBusy('import');
    try {
      const summary = await importAllData(file);
      await reload();
      setMessage({
        kind: 'info',
        text: `Imported ${summary.courses} course(s), ${summary.files} file(s), ${summary.versions} version(s).`
      });
    } catch (err) {
      setMessage({ kind: 'error', text: `Could not import: ${String(err)}` });
    } finally {
      setBusy(null);
    }
  }

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
        hidden
        onChange={(e) => void handleImportFileChosen(e)}
      />

      {(busy || (loaded && courses.length === 0)) && (
        <div className="toolbar">
          {loaded && courses.length === 0 && (
            <span className="hint-text">
              Open Moodle, go to the course, click the extension icon, then press "Download".
            </span>
          )}
          {busy && <Spinner label={busy === 'export' ? 'Exporting…' : 'Importing…'} />}
        </div>
      )}

      {message && <p className={message.kind === 'error' ? 'hint-text error' : 'hint-text'}>{message.text}</p>}

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
          <li className="empty">
            {courses.length === 0 ? (
              <>
                No courses yet — open Moodle, go to the course, click the extension icon, then press "Download".
                Courses are created automatically.
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
