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
import { assignAcademicYearColors } from '../../lib/academicYearColors';
import { InvalidBackupError, exportAllData, exportCourse, importAllData } from '../../lib/backup';
import { CARD_GAP, fitCardGrid } from '../../lib/cardLayout';
import { assignAutoCourseColors, assignCourseColors } from '../../lib/courseColors';
import { courseStore, deleteCourse, resetTrackedData } from '../../lib/db';
import type { Course } from '../../types';
import { ConcurrentDownloadsModal } from '../components/ConcurrentDownloadsModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { CourseCard } from '../components/CourseCard';
import { CourseInfoModal } from '../components/CourseInfoModal';
import { AppearanceModal } from '../components/AppearanceModal';
import { CourseListStyleModal } from '../components/CourseListStyleModal';
import { DownloadNameSettingsModal } from '../components/DownloadNameSettingsModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { HiddenCoursesModal } from '../components/HiddenCoursesModal';
import { RecentSettingsModal } from '../components/RecentSettingsModal';
import { SideMarginModal } from '../components/SideMarginModal';
import { StatusToasts, type StatusMessage } from '../components/StatusToasts';
import { useAcademicYearColors } from '../hooks/useAcademicYearColors';
import { useCourseGridKeys } from '../hooks/useCourseGridKeys';
import { useCourseListStyle } from '../hooks/useCourseListStyle';
import { useElementWidth } from '../hooks/useElementWidth';
import { useFileDrop } from '../hooks/useFileDrop';
import { focusItem } from '../hooks/keyboardNavigation';
import { useT } from '../hooks/useTranslation';

type PendingExport = { kind: 'all' } | { kind: 'course'; course: Course };
type PendingDelete = { kind: 'all' } | { kind: 'course'; course: Course };

/** The room left empty below the card list, down to the window's bottom (see
 *  .courses-page.centered::after). */
const LIST_BOTTOM_ROOM = 24;

/**
 * The height the card list can take without the page scrolling: the window's, less
 * the room above the list (the header, down to where this page starts) and
 * LIST_BOTTOM_ROOM below it, plus the last row's own bottom gap, which sits in that
 * room below. Kept up to date as the window resizes.
 */
function useCardListRoom(pageRef: RefObject<HTMLElement | null>): number {
  const [room, setRoom] = useState(Infinity);
  useLayoutEffect(() => {
    function measure() {
      const page = pageRef.current;
      if (!page) return;
      const top = page.getBoundingClientRect().top + window.scrollY;
      setRoom(window.innerHeight - top - LIST_BOTTOM_ROOM + CARD_GAP);
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
  headerMenuSlot,
  focusCourseId
}: {
  onOpenCourse: (courseId: string, courseName: string, courseUrl: string | undefined) => void;
  /** DOM node in the app header to portal the "⋮" overflow menu into. */
  headerMenuSlot: HTMLDivElement | null;
  /** A course to put the focus on once the list is in: the one just left with Escape. */
  focusCourseId?: string | null;
}) {
  const t = useT();
  const [courses, setCourses] = useState<Course[]>([]);
  // Distinguishes "genuinely no courses" from "haven't loaded yet" — without
  // it, navigating back to this view remounts it with courses briefly empty,
  // flashing the "no courses yet" messaging before the real list loads in.
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pendingExport, setPendingExport] = useState<PendingExport | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [showHiddenModal, setShowHiddenModal] = useState(false);
  const [showRecentSettings, setShowRecentSettings] = useState(false);
  const [showDownloadNameSettings, setShowDownloadNameSettings] = useState(false);
  const [showConcurrentDownloads, setShowConcurrentDownloads] = useState(false);
  const [showSideMargin, setShowSideMargin] = useState(false);
  const [showListStyle, setShowListStyle] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  // "Edit course info" while open: for every course, or for the one in courseId.
  const [infoTarget, setInfoTarget] = useState<{ courseId?: string } | null>(null);
  // The course "Edit course info" was opened for, to give the focus back to its card
  // once it closes.
  const infoReturnTo = useRef<string | undefined>(undefined);
  const [listStyle] = useCourseListStyle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const courseListRef = useRef<HTMLUListElement>(null);
  const courseListWidth = useElementWidth(courseListRef);
  const coursesPageRef = useRef<HTMLDivElement>(null);
  const courseListHeight = useCardListRoom(coursesPageRef);
  useCourseGridKeys(courseListRef);

  async function reload() {
    const all = await Promise.all((await courseStore.all()).map(migrateUniversityField));
    setCourses([...all].sort((a, b) => a.order - b.order));
    setLoaded(true);
  }

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!loaded || !focusCourseId) return;
    const card = courseListRef.current?.querySelector<HTMLElement>(`[data-course-id="${CSS.escape(focusCourseId)}"]`);
    if (card) focusItem(card);
  }, [loaded, focusCourseId]);

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

  // What "Edit course info" saves: every course changed in it, at once.
  async function handleSaveCourseInfo(changed: Course[]) {
    await Promise.all(changed.map((course) => courseStore.put(course)));
    await reload();
  }

  function openCourseInfo(courseId?: string) {
    infoReturnTo.current = courseId;
    setInfoTarget({ courseId });
  }

  // Closed, the focus back on the card of the course it was opened for: what had it
  // before (its menu) is gone. Unless it went somewhere else already.
  useEffect(() => {
    const courseId = infoReturnTo.current;
    if (infoTarget !== null || !courseId) return;
    infoReturnTo.current = undefined;
    if (document.activeElement && document.activeElement !== document.body) return;
    courseListRef.current?.querySelector<HTMLElement>(`[data-course-id="${CSS.escape(courseId)}"]`)?.focus({ preventScroll: true });
  }, [infoTarget]);

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
    busy !== null || pendingExport !== null || pendingDelete !== null || showHiddenModal || showRecentSettings || showDownloadNameSettings || showSideMargin || showListStyle || showAppearance || infoTarget !== null
  );

  // Over every course, hidden ones included, so unhiding one never repaints the others.
  const courseColors = useMemo(() => assignCourseColors(courses), [courses]);
  // Each academic year's, one given to a year as it first shows up (set by hand, or
  // from a backup).
  const yearColors = useAcademicYearColors();
  useEffect(() => assignAcademicYearColors(courses.map((c) => c.academicYear)), [courses]);
  const autoCourseColors = useMemo(() => assignAutoCourseColors(courses), [courses]);
  const visibleCourses = courses.filter((c) => !c.hidden);
  // As cards, the courses go in balanced, centered rows (5 → 3 + 2, see cardLayout.ts);
  // in a grid, in full rows but the last (5 → 3 + 2, the 2 under the first two columns):
  // the indexes of the cards each row but the last ends at, a line break after each.
  // Every card fits on the screen, with no scrolling: as many columns as leaves them
  // largest, and shrunk only if they have to be (see fitCardGrid).
  const asCards = listStyle === 'cards' || listStyle === 'grid';
  const { rowEnds, cardGrid, gridFillers } = useMemo(() => {
    const grid = fitCardGrid(visibleCourses.length, courseListWidth, courseListHeight, listStyle === 'grid');
    const ends = new Set<number>();
    if (asCards) {
      let index = -1;
      for (const size of grid.rows.slice(0, -1)) {
        index += size;
        ends.add(index);
      }
    }
    // A grid's last row, short of a full one, made up to it with empty places: centered
    // like the full rows above, its cards then line up under theirs.
    const fillers = listStyle === 'grid' && grid.rows.length > 1 ? grid.rows[0] - grid.rows[grid.rows.length - 1] : 0;
    return { rowEnds: ends, cardGrid: grid, gridFillers: fillers };
  }, [listStyle, visibleCourses.length, courseListWidth, courseListHeight]);
  const hiddenCourses = courses.filter((c) => c.hidden);

  return (
    // As cards, the list is centered vertically too, in the room below the header (see
    // .courses-page.centered).
    <div ref={coursesPageRef} className={`courses-page${asCards ? ' centered' : ''}`}>
      {headerMenuSlot &&
        createPortal(
          <DropdownMenu
            title={t.common.moreOptions}
            buttonClassName="secondary toolbar-menu-button"
            disabled={busy !== null}
            items={[
              { label: t.courses.openAllUrls, icon: 'external', onClick: handleOpenAllCourseUrls },
              { label: t.courses.editInfo, icon: 'edit', onClick: () => openCourseInfo() },
              { label: t.courses.exportAll, icon: 'export', onClick: () => setPendingExport({ kind: 'all' }) },
              { label: t.courses.importCourses, icon: 'import', onClick: handleImportClick },
              { label: t.courses.recentSettings, icon: 'recent', onClick: () => setShowRecentSettings(true) },
              { label: t.courses.downloadNameSettings, icon: 'fileName', onClick: () => setShowDownloadNameSettings(true) },
              { label: t.courses.concurrentDownloads, icon: 'speed', onClick: () => setShowConcurrentDownloads(true) },
              { label: t.courses.sideMargin, icon: 'width', onClick: () => setShowSideMargin(true) },
              { label: t.courses.courseListStyle, icon: 'layout', onClick: () => setShowListStyle(true) },
              { label: t.courses.appearance, icon: 'palette', onClick: () => setShowAppearance(true) },
              { label: t.courses.hiddenCourses, icon: 'hide', onClick: () => setShowHiddenModal(true) },
              { label: t.courses.deleteAll, icon: 'delete', onClick: () => setPendingDelete({ kind: 'all' }), danger: true }
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

      <StatusToasts
        busy={busy === 'export' ? t.common.exporting : busy === 'import' ? t.common.importing : null}
        message={message}
        onDismiss={() => setMessage(null)}
      />

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
              ? hiddenCourses.length > 0
                ? `${t.courses.exportAllMessage} ${t.courses.exportAllHidden(hiddenCourses.length)}`
                : t.courses.exportAllMessage
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

      {showConcurrentDownloads && <ConcurrentDownloadsModal onClose={() => setShowConcurrentDownloads(false)} />}

      {showSideMargin && <SideMarginModal onClose={() => setShowSideMargin(false)} />}

      {showListStyle && <CourseListStyleModal onClose={() => setShowListStyle(false)} />}
      {showAppearance && <AppearanceModal onClose={() => setShowAppearance(false)} />}

      {infoTarget && (
        <CourseInfoModal
          // Shown ones first, in the list's order, then the hidden ones.
          courses={[...visibleCourses, ...hiddenCourses]}
          focusCourseId={infoTarget.courseId}
          autoColors={autoCourseColors}
          onSave={(changed) => void handleSaveCourseInfo(changed)}
          onClose={() => setInfoTarget(null)}
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
              academicYearColor={course.academicYear ? yearColors[course.academicYear] : undefined}
              onOpen={() => onOpenCourse(course.id, course.name, courseUrlOf(course))}
              onEditInfo={() => openCourseInfo(course.id)}
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
        {Array.from({ length: gridFillers }, (_, i) => (
          <li key={`filler-${i}`} className="course-list-filler" aria-hidden="true" />
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
