import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type RefObject
} from 'react';
import { createPortal } from 'react-dom';
import { InvalidBackupError, exportAllData, exportCourse, importAllData } from '../../lib/backup';
import { CARD_GAP, fitCardGrid } from '../../lib/cardLayout';
import { withoutTag } from '../../lib/courseNames';
import { assignAutoCourseColors, assignCourseColors } from '../../lib/courseColors';
import { courseStore, deleteCourse, resetTrackedData } from '../../lib/db';
import type { Course } from '../../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { CourseCard } from '../components/CourseCard';
import { CourseColorModal } from '../components/CourseColorModal';
import { CourseListStyleModal } from '../components/CourseListStyleModal';
import { DownloadNameSettingsModal } from '../components/DownloadNameSettingsModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { HiddenCoursesModal } from '../components/HiddenCoursesModal';
import { RecentSettingsModal } from '../components/RecentSettingsModal';
import { SetInstitutionModal } from '../components/SetInstitutionModal';
import { SideMarginModal } from '../components/SideMarginModal';
import { Spinner } from '../components/Spinner';
import { useCourseListStyle } from '../hooks/useCourseListStyle';
import { useElementWidth } from '../hooks/useElementWidth';
import { useFileDrop } from '../hooks/useFileDrop';
import { useT } from '../hooks/useTranslation';

type TransientMessage = { kind: 'info' | 'error'; text: string };
type PendingExport = { kind: 'all' } | { kind: 'course'; course: Course };
type PendingDelete = { kind: 'all' } | { kind: 'course'; course: Course };

/**
 * The height the card list can take without the page scrolling: the window's, less
 * the room above the list (the header, down to where this page starts) and as much
 * again below it — which is what keeps the list centered on the window (see
 * .courses-page.centered) — plus the last row's own bottom gap, which sits in that
 * room below. Kept up to date as the window resizes.
 */
function useCardListRoom(pageRef: RefObject<HTMLElement | null>): number {
  const [room, setRoom] = useState(Infinity);
  useLayoutEffect(() => {
    function measure() {
      const page = pageRef.current;
      if (!page) return;
      const top = page.getBoundingClientRect().top + window.scrollY;
      setRoom(window.innerHeight - 2 * top + CARD_GAP);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [pageRef]);
  return room;
}

/** `institution` was briefly stored as `university`: carries over a value set back then. */
async function migrateUniversityField(course: Course): Promise<Course> {
  const { university, ...rest } = course as Course & { university?: string };
  if (university === undefined) return course;
  const migrated: Course = { ...rest, institution: rest.institution ?? university };
  await courseStore.put(migrated);
  return migrated;
}

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
  const t = useT();
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
  const [showRecentSettings, setShowRecentSettings] = useState(false);
  const [showDownloadNameSettings, setShowDownloadNameSettings] = useState(false);
  const [showSideMargin, setShowSideMargin] = useState(false);
  const [showListStyle, setShowListStyle] = useState(false);
  const [showSetInstitution, setShowSetInstitution] = useState(false);
  const [colorTarget, setColorTarget] = useState<Course | null>(null);
  const [listStyle] = useCourseListStyle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const courseListRef = useRef<HTMLUListElement>(null);
  const courseListWidth = useElementWidth(courseListRef);
  const coursesPageRef = useRef<HTMLDivElement>(null);
  const courseListHeight = useCardListRoom(coursesPageRef);

  async function reload() {
    const all = await Promise.all((await courseStore.all()).map(migrateUniversityField));
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

  async function handleRenameCourse(course: Course, name: string | undefined) {
    await courseStore.put(name === undefined ? withoutTag(course) : { ...course, name, tagged: true });
    await reload();
  }

  async function handleSetFullName(course: Course, fullName: string | undefined) {
    await courseStore.put({ ...course, fullName });
    await reload();
  }

  async function handleSetColor(course: Course, color: string | undefined) {
    await courseStore.put({ ...course, color });
    await reload();
  }

  async function handleSetInstitution(course: Course, institution: string | undefined) {
    await courseStore.put({ ...course, institution });
    await reload();
  }

  async function handleSetInstitutionFor(courseIds: string[], institution: string | undefined) {
    const ids = new Set(courseIds);
    await Promise.all(courses.filter((c) => ids.has(c.id)).map((c) => courseStore.put({ ...c, institution })));
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
      setMessage({ kind: 'info', text: t.courses.backupSaved });
    } catch (err) {
      setMessage({ kind: 'error', text: t.courses.couldNotExportAll(String(err)) });
    } finally {
      setBusy(null);
    }
  }

  async function handleExportCourse(course: Course) {
    setMessage(null);
    setBusy('export');
    try {
      await exportCourse(course.id);
      setMessage({ kind: 'info', text: t.common.savedToDownloads(course.name) });
    } catch (err) {
      setMessage({ kind: 'error', text: t.common.couldNotExport(course.name, String(err)) });
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
      setMessage({ kind: 'error', text: t.courses.noUrlsToOpen });
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
      parts.push(t.courses.imported(total.courses, total.files, total.versions));
    }
    for (const name of invalid) {
      parts.push(t.courses.notABackup(name));
    }
    if (failures.length > 0) parts.push(t.courses.couldNotImport(failures.join('; ')));
    setMessage({ kind: invalid.length > 0 || failures.length > 0 ? 'error' : 'info', text: parts.join(' ') });
  }

  async function handleImportFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.currentTarget.files ?? []);
    e.currentTarget.value = ''; // allow re-selecting the same file later
    if (files.length > 0) await importBackups(files);
  }

  // Backups can be dropped anywhere on the page — see importBackups for what happens to
  // a file that isn't one. Ignored while something is already running or a dialog is open.
  const draggingFiles = useFileDrop(
    (dropped) => void importBackups(dropped),
    busy !== null || pendingExport !== null || pendingDelete !== null || showHiddenModal || showRecentSettings || showDownloadNameSettings || showSideMargin || showListStyle || showSetInstitution || colorTarget !== null
  );

  // Every institution already set, hidden courses included, to offer while typing one.
  const institutionSuggestions = useMemo(
    () => [...new Set(courses.flatMap((c) => (c.institution ? [c.institution] : [])))].sort(),
    [courses]
  );
  // Over every course, hidden ones included, so unhiding one never repaints the others.
  const courseColors = useMemo(() => assignCourseColors(courses), [courses]);
  const autoCourseColors = useMemo(() => assignAutoCourseColors(courses), [courses]);
  const visibleCourses = courses.filter((c) => !c.hidden);
  // As cards, the courses go in balanced, centered rows (5 → 3 + 2, see cardLayout.ts):
  // the indexes of the cards each row but the last ends at, a line break after each.
  // Every card fits on the screen, with no scrolling: as many columns as leaves them
  // largest, and shrunk only if they have to be (see fitCardGrid).
  const { rowEnds, cardGrid } = useMemo(() => {
    const grid = fitCardGrid(visibleCourses.length, courseListWidth, courseListHeight);
    const ends = new Set<number>();
    if (listStyle === 'cards') {
      let index = -1;
      for (const size of grid.rows.slice(0, -1)) {
        index += size;
        ends.add(index);
      }
    }
    return { rowEnds: ends, cardGrid: grid };
  }, [listStyle, visibleCourses.length, courseListWidth, courseListHeight]);
  const hiddenCourses = courses.filter((c) => c.hidden);

  return (
    // As cards, the list is centered in the window vertically too (see .courses-page.centered).
    <div ref={coursesPageRef} className={`courses-page${listStyle === 'cards' ? ' centered' : ''}`}>
      {headerMenuSlot &&
        createPortal(
          <DropdownMenu
            title={t.common.moreOptions}
            buttonClassName="secondary toolbar-menu-button"
            disabled={busy !== null}
            items={[
              { label: t.courses.openAllUrls, onClick: handleOpenAllCourseUrls },
              { label: t.courses.exportAll, onClick: () => setPendingExport({ kind: 'all' }) },
              { label: t.courses.importCourses, onClick: handleImportClick },
              { label: t.courses.setInstitution, onClick: () => setShowSetInstitution(true) },
              { label: t.courses.recentSettings, onClick: () => setShowRecentSettings(true) },
              { label: t.courses.downloadNameSettings, onClick: () => setShowDownloadNameSettings(true) },
              { label: t.courses.sideMargin, onClick: () => setShowSideMargin(true) },
              { label: t.courses.courseListStyle, onClick: () => setShowListStyle(true) },
              { label: t.courses.hiddenCourses, onClick: () => setShowHiddenModal(true) },
              { label: t.courses.deleteAll, onClick: () => setPendingDelete({ kind: 'all' }), danger: true }
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
          <Spinner label={busy === 'export' ? t.common.exporting : t.common.importing} />
        </div>
      )}

      {message && <p className={message.kind === 'error' ? 'hint-text error' : 'hint-text'}>{message.text}</p>}

      {draggingFiles && (
        <div className="drop-overlay" aria-hidden="true">
          <div className="drop-overlay-message">{t.courses.dropBackups}</div>
        </div>
      )}

      {pendingExport && (
        <ConfirmModal
          title={pendingExport.kind === 'all' ? t.courses.exportAllTitle : t.courses.exportCourseTitle(pendingExport.course.name)}
          message={
            pendingExport.kind === 'all'
              ? t.courses.exportAllMessage
              : t.courses.exportCourseMessage
          }
          confirmLabel={t.common.export}
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
          title={pendingDelete.kind === 'all' ? t.courses.deleteAllTitle : t.courses.deleteCourseTitle(pendingDelete.course.name)}
          message={
            pendingDelete.kind === 'all'
              ? t.courses.deleteAllMessage
              : t.courses.deleteCourseMessage
          }
          confirmLabel={t.common.delete}
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

      {showRecentSettings && <RecentSettingsModal onClose={() => setShowRecentSettings(false)} />}

      {showDownloadNameSettings && <DownloadNameSettingsModal onClose={() => setShowDownloadNameSettings(false)} />}

      {showSideMargin && <SideMarginModal onClose={() => setShowSideMargin(false)} />}

      {showListStyle && <CourseListStyleModal onClose={() => setShowListStyle(false)} />}

      {colorTarget && (
        <CourseColorModal
          course={colorTarget}
          autoColor={autoCourseColors.get(colorTarget.id) ?? '#2563eb'}
          onSave={(color) => void handleSetColor(colorTarget, color)}
          onClose={() => setColorTarget(null)}
        />
      )}

      {showSetInstitution && (
        <SetInstitutionModal
          // Shown ones first, in the list's order, then the hidden ones.
          courses={[...visibleCourses, ...hiddenCourses]}
          suggestions={institutionSuggestions}
          onApply={(courseIds, institution) => void handleSetInstitutionFor(courseIds, institution)}
          onClose={() => setShowSetInstitution(false)}
        />
      )}

      <ul
        ref={courseListRef}
        className={`course-list${listStyle === 'rows' ? ' as-rows' : ''}`}
        style={
          {
            '--card-width': `${cardGrid.width}px`,
            '--card-height': `${cardGrid.height}px`,
            '--card-gap': `${CARD_GAP}px`
          } as CSSProperties
        }
      >
        {visibleCourses.map((course, index) => (
          <Fragment key={course.id}>
            <CourseCard
              course={course}
              color={courseColors.get(course.id)}
              onOpen={() => onOpenCourse(course.id, course.name, courseUrlOf(course))}
              onRename={(name) => void handleRenameCourse(course, name)}
              onSetFullName={(fullName) => void handleSetFullName(course, fullName)}
              onSetInstitution={(institution) => void handleSetInstitution(course, institution)}
              onChangeColor={() => setColorTarget(course)}
              institutionSuggestions={institutionSuggestions}
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
            {rowEnds.has(index) && <li className="course-list-break" aria-hidden="true" />}
          </Fragment>
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
                <h2 className="empty-title">{t.courses.emptyTitle}</h2>
                <p className="empty-subtitle">{t.courses.emptySubtitle}</p>
                <ol className="empty-steps">
                  <li>{t.courses.emptyStep1}</li>
                  <li>{t.courses.emptyStep2}</li>
                  <li>
                    {t.courses.emptyStep3Before}
                    <strong>{t.popup.download}</strong>
                    {t.courses.emptyStep3After}
                  </li>
                </ol>
                <p className="empty-hint">
                  {t.courses.emptyHintBefore}
                  <strong>.zip</strong>
                  {t.courses.emptyHintAfter}
                </p>
              </>
            ) : (
              t.courses.allHidden
            )}
          </li>
        )}
      </ul>
    </div>
  );
}
