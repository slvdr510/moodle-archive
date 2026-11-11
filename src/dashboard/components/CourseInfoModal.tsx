import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { assignAcademicYearColors, removeAcademicYearColor, setAcademicYearColor } from '../../lib/academicYearColors';
import { COURSE_COLORS } from '../../lib/courseColors';
import {
  applyCourseInfo,
  courseInfoChanged,
  courseInfoDraft,
  courseInfoOptions,
  courseInfoProblems,
  courseOpenUrl,
  coursesWithOption,
  type CourseInfoDraft,
  type DeletedOptions
} from '../../lib/courseInfo';
import { courseDisplayNames } from '../../lib/courseNames';
import type { Course } from '../../types';
import { useAcademicYearColors } from '../hooks/useAcademicYearColors';
import { useT } from '../hooks/useTranslation';
import { ColorMenu } from './ColorMenu';
import { ComboBox } from './ComboBox';
import { ConfirmModal } from './ConfirmModal';

type Field = keyof CourseInfoDraft;
/** The fields with a list of what's in use to pick from — and to delete from it. */
type ListField = 'institution' | 'academicYear';

/**
 * "Edit course info": every course, hidden ones too (marked as such), as a block
 * each in one column that scrolls, with what can be set on it — its tag, full name,
 * institution, academic year, URL and color. Opened for one course, that one's block
 * is shown in the middle, the focus in it.
 *
 * What's changed is stored as it's done, with no Save to press: a field as it's left
 * or on Enter in it (which leaves the dialog open), a row picked from a list or a
 * color as it's picked. Closing it (its ×, Escape, a click outside) stores what's
 * still being typed too. What isn't valid — a URL that isn't a course page's or is
 * another course's — isn't stored, the field saying what's wrong once it's left or
 * Enter is pressed in it; the rest of
 * that course is.
 *
 * An institution or academic year deleted from the lists to pick from (once that's
 * confirmed) is taken off every course that has it at once, and isn't offered any more.
 * An academic year's color (see academicYearColors.ts) is set beside its field, for
 * every course with that year; a year new to them gets one as it's stored. Both that
 * and a course's own color, besides its swatches, are set from a ColorMenu: a code
 * written (FFFFFF) or the browser's picker.
 */
export function CourseInfoModal({
  courses,
  focusCourseId,
  autoColors,
  onSave,
  onClose
}: {
  /** In the courses list's order. */
  courses: Course[];
  /** The course it was opened for, if any. */
  focusCourseId?: string;
  /** The color each course gets when it has none of its own. */
  autoColors: Map<string, string>;
  /** Courses changed, as they're to be stored. */
  onSave: (changed: Course[]) => void;
  onClose: () => void;
}) {
  const t = useT();
  const titleId = useId();
  const yearColors = useAcademicYearColors();
  const [drafts, setDrafts] = useState(() => new Map(courses.map((course) => [course.id, courseInfoDraft(course)])));
  // Fields left (blurred): what's wrong in one is shown once it's left, not while it's
  // still being typed.
  const [left, setLeft] = useState<Set<string>>(new Set());
  const [deleted, setDeleted] = useState<DeletedOptions>({ institutions: new Set(), academicYears: new Set() });
  // An option asked to be deleted, waiting to be confirmed.
  const [pendingDelete, setPendingDelete] = useState<{ field: ListField; value: string } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const targetId = focusCourseId && courses.some((c) => c.id === focusCourseId) ? focusCourseId : courses[0]?.id;

  // The course it was opened for in the middle of the list, as it shows.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !focusCourseId) return;
    const block = list.querySelector<HTMLElement>(`[data-course-id="${CSS.escape(focusCourseId)}"]`);
    if (block) list.scrollTop = block.offsetTop - (list.clientHeight - block.offsetHeight) / 2;
  }, [focusCourseId]);

  /**
   * Stores the courses in `courseIds` as written for them in `from`, those that
   * changed: what isn't valid in one left as it was, the rest of it stored.
   */
  function store(courseIds: string[], from = drafts) {
    const changed: Course[] = [];
    for (const course of courses.filter((c) => courseIds.includes(c.id))) {
      const draft = from.get(course.id)!;
      const problems = courseInfoProblems(course, draft, courses, from);
      const valid = problems.some((p) => p.field === 'url') ? { ...draft, url: courseOpenUrl(course) } : draft;
      const next = applyCourseInfo(course, valid);
      if (courseInfoChanged(course, next)) changed.push(next);
    }
    if (changed.length > 0) {
      onSave(changed);
      assignAcademicYearColors(changed.map((c) => c.academicYear));
    }
  }

  /** Writes `value` in a course's `field`; and stores the course right away, for
   *  what's picked rather than typed. */
  function update(courseId: string, field: Field, value: string | undefined, storeNow = false) {
    const next = new Map(drafts).set(courseId, { ...drafts.get(courseId)!, [field]: value });
    setDrafts(next);
    if (storeNow) store([courseId], next);
  }

  function leave(courseId: string, field: Field) {
    setLeft((current) => new Set(current).add(`${courseId}/${field}`));
    store([courseId]);
  }

  function deleteOption({ field, value }: { field: ListField; value: string }) {
    const ids = coursesWithOption(drafts, field, value);
    const next = new Map(drafts);
    for (const id of ids) next.set(id, { ...next.get(id)!, [field]: '' });
    setDrafts(next);
    setDeleted((current) => {
      const key = field === 'institution' ? 'institutions' : 'academicYears';
      return { ...current, [key]: new Set(current[key]).add(value) };
    });
    if (field === 'academicYear') removeAcademicYearColor(value);
    store(ids, next);
  }

  /** Closes it, storing what's still being typed. */
  function finish() {
    store(courses.map((c) => c.id));
    onClose();
  }

  // Enter in a field stores it, as leaving it does, the dialog staying open: what's
  // being written is often only one of several things to set. Not where the field
  // took it itself (a row of its list picked), nor on a button (that's pressing it).
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing || !(target instanceof HTMLInputElement)) return;
    const courseId = target.closest<HTMLElement>('[data-course-id]')?.dataset.courseId;
    const field = target.dataset.field as Field | undefined;
    if (target.type === 'color' || !courseId || !field) return;
    e.preventDefault();
    leave(courseId, field);
  }

  return (
    <div className="modal-backdrop" onClick={finish}>
      <div
        className="modal course-info-modal"
        role="dialog"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="modal-header">
          <h2 id={titleId}>{t.courseInfo.title}</h2>
          <button className="modal-close-button" onClick={finish} title={t.common.close} aria-label={t.common.close}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={listRef} className="course-info-list">
          {courses.map((course) => (
            <CourseInfoBlock
              key={course.id}
              course={course}
              draft={drafts.get(course.id)!}
              autoColor={autoColors.get(course.id) ?? 'var(--accent)'}
              options={courseInfoOptions(course.id, courses, drafts, deleted)}
              yearColors={yearColors}
              problems={courseInfoProblems(course, drafts.get(course.id)!, courses, drafts).filter((p) =>
                left.has(`${course.id}/${p.field}`)
              )}
              targeted={course.id === focusCourseId}
              autoFocus={course.id === targetId}
              onChange={(field, value, storeNow) => update(course.id, field, value, storeNow)}
              onLeave={(field) => leave(course.id, field)}
              onDeleteOption={(field, value) => setPendingDelete({ field, value })}
            />
          ))}
        </div>
      </div>

      {/* Outside this dialog, over it: a click on its backdrop isn't one on this one's. */}
      {pendingDelete &&
        createPortal(
          <ConfirmModal
            title={t.courseInfo.deleteOptionTitle(pendingDelete.value)}
            message={t.courseInfo.deleteOptionMessage(coursesWithOption(drafts, pendingDelete.field, pendingDelete.value).length)}
            confirmLabel={t.common.delete}
            danger
            strong
            onConfirm={() => {
              deleteOption(pendingDelete);
              setPendingDelete(null);
            }}
            onCancel={() => setPendingDelete(null)}
          />,
          document.body
        )}
    </div>
  );
}

function CourseInfoBlock({
  course,
  draft,
  autoColor,
  options,
  yearColors,
  problems,
  targeted,
  autoFocus,
  onChange,
  onLeave,
  onDeleteOption
}: {
  course: Course;
  draft: CourseInfoDraft;
  autoColor: string;
  options: { institutions: string[]; academicYears: string[] };
  /** Each academic year's color. */
  yearColors: Readonly<Record<string, string>>;
  /** What's wrong in it, to be shown. */
  problems: ReturnType<typeof courseInfoProblems>;
  /** The course it was opened for: marked. */
  targeted: boolean;
  /** Where the focus goes as it opens (see useDialogKeys): its first field. */
  autoFocus: boolean;
  /** `storeNow` for what's picked rather than typed: stored as it's picked, not once
   *  the field is left. */
  onChange: (field: Field, value: string | undefined, storeNow?: boolean) => void;
  /** A field left: stored. */
  onLeave: (field: Field) => void;
  onDeleteOption: (field: ListField, value: string) => void;
}) {
  const t = useT();
  const institutionRef = useRef<HTMLInputElement>(null);
  const academicYearRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const colorLabelId = `${id}-color`;
  // Named as it'll be shown with what's written now.
  const { title, subtitle } = courseDisplayNames(applyCourseInfo(course, draft));
  const color = draft.color ?? autoColor;
  const customColor = draft.color !== undefined && !COURSE_COLORS.includes(draft.color.toLowerCase());
  const year = draft.academicYear.trim();
  const yearColor = year ? yearColors[year] : undefined;
  const urlProblem = problems.find((p) => p.field === 'url');
  const newUrl = !urlProblem && draft.url.trim() !== '' && draft.url.trim() !== courseOpenUrl(course);

  const text = (field: Field) => ({
    'data-field': field,
    value: draft[field] ?? '',
    onChange: (e: { currentTarget: HTMLInputElement }) => onChange(field, e.currentTarget.value),
    onBlur: () => onLeave(field)
  });

  return (
    <section
      className={`course-info-block${targeted ? ' targeted' : ''}`}
      data-course-id={course.id}
      style={{ '--course-color': color } as CSSProperties}
      aria-label={title}
    >
      <header className="course-info-block-header">
        <span className="course-info-block-title" title={subtitle ? `${title}\n${subtitle}` : title}>
          {title}
          {subtitle && <span className="course-info-block-subtitle"> · {subtitle}</span>}
        </span>
        {course.hidden && <span className="course-info-hidden">{t.courseInfo.hidden}</span>}
      </header>

      <div className="course-info-fields">
        <div className="course-info-field">
          <label htmlFor={`${id}-tag`}>{t.courseRow.tag}</label>
          <input id={`${id}-tag`} type="text" placeholder={t.courseRow.tagPlaceholder} data-autofocus={autoFocus || undefined} {...text('tag')} />
        </div>
        <div className="course-info-field">
          <label htmlFor={`${id}-institution`}>{t.courseRow.institution}</label>
          <ComboBox
            inputRef={institutionRef}
            id={`${id}-institution`}
            field="institution"
            value={draft.institution}
            onValueChange={(value) => onChange('institution', value)}
            options={options.institutions}
            current={draft.institution.trim() || undefined}
            newOption={(typed) => {
              const value = typed.trim();
              return value && !options.institutions.includes(value) ? value : undefined;
            }}
            addLabel={t.courseRow.addOption}
            toggleLabel={t.courseRow.showOptions}
            onPick={(value) => onChange('institution', value, true)}
            onBlur={() => onLeave('institution')}
            onDelete={(value) => onDeleteOption('institution', value)}
            deleteLabel={t.courseInfo.deleteOption}
            placeholder={t.courseRow.institutionPlaceholder}
          />
        </div>
        <div className="course-info-field">
          <label htmlFor={`${id}-academicYear`}>{t.courseRow.academicYear}</label>
          <div className="course-info-year">
          {/* Its color, for every course with this year; none until there's a year
              stored to have one. */}
          <ColorMenu
            className={`academic-year-color${yearColor ? '' : ' unset'}`}
            style={yearColor ? { background: yearColor } : undefined}
            label={t.courseInfo.academicYearColor}
            disabled={!yearColor}
            value={yearColor ?? '#000000'}
            onInput={(value) => setAcademicYearColor(year, value)}
          />
          <ComboBox
            inputRef={academicYearRef}
            id={`${id}-academicYear`}
            field="academicYear"
            value={draft.academicYear}
            onValueChange={(value) => onChange('academicYear', value)}
            options={options.academicYears}
            current={draft.academicYear.trim() || undefined}
            // Any text: as it's written.
            newOption={(typed) => {
              const value = typed.trim();
              return value && !options.academicYears.includes(value) ? value : undefined;
            }}
            addLabel={t.courseRow.addOption}
            toggleLabel={t.courseRow.showOptions}
            onPick={(value) => onChange('academicYear', value, true)}
            onDelete={(value) => onDeleteOption('academicYear', value)}
            deleteLabel={t.courseInfo.deleteOption}
            optionColor={(value) => yearColors[value]}
            onBlur={() => onLeave('academicYear')}
            placeholder={t.courseRow.academicYearPlaceholder}
          />
          </div>
        </div>

        {/* A row of its own: longer than the rest. */}
        <div className="course-info-field course-info-wide">
          <label htmlFor={`${id}-fullName`}>{t.courseRow.fullName}</label>
          {/* Empty, it's the one from Moodle: that's what shows. */}
          <input id={`${id}-fullName`} type="text" placeholder={course.autoName || t.courseRow.fullNamePlaceholder} {...text('fullName')} />
        </div>

        <div className="course-info-field course-info-wide">
          <label htmlFor={`${id}-url`}>{t.courseUrl.label}</label>
          <input
            id={`${id}-url`}
            type="url"
            dir="ltr"
            spellcheck={false}
            className={urlProblem ? 'invalid' : undefined}
            aria-invalid={urlProblem ? true : undefined}
            aria-describedby={urlProblem || newUrl ? `${id}-url-hint` : undefined}
            placeholder="https://…/course/view.php?id=…"
            {...text('url')}
          />
          {urlProblem?.field === 'url' && (
            <span id={`${id}-url-hint`} className="hint-text error">
              {urlProblem.kind === 'taken' ? t.courseUrl.taken(courseDisplayNames(urlProblem.owner).title) : t.courseUrl.invalid}
            </span>
          )}
          {newUrl && (
            <span id={`${id}-url-hint`} className="hint-text">
              {t.courseUrl.previousKept}
            </span>
          )}
        </div>

        <div className="course-info-wide course-info-color" role="radiogroup" aria-labelledby={colorLabelId}>
          <span id={colorLabelId} className="course-info-label">
            {t.courseInfo.color}
          </span>
          <div className="course-info-swatches">
            <button
              type="button"
              role="radio"
              aria-checked={draft.color === undefined}
              aria-label={t.courseColor.automatic}
              title={t.courseColor.automatic}
              className={`course-color-swatch auto${draft.color === undefined ? ' active' : ''}`}
              style={{ background: autoColor }}
              onClick={() => onChange('color', undefined, true)}
            >
              A
            </button>
            {COURSE_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                role="radio"
                aria-checked={draft.color?.toLowerCase() === swatch}
                aria-label={swatch}
                title={swatch}
                className={`course-color-swatch${draft.color?.toLowerCase() === swatch ? ' active' : ''}`}
                style={{ background: swatch }}
                onClick={() => onChange('color', swatch, true)}
              />
            ))}
            <ColorMenu
              className={`course-color-custom${customColor ? ' active' : ''}`}
              // Its color, once it's the one set; a rainbow until then.
              style={customColor ? { background: draft.color } : undefined}
              label={t.courseColor.custom}
              value={color.startsWith('#') ? color.toLowerCase() : '#2563eb'}
              // Stored once the menu is closed, not at each color the picker goes through.
              onInput={(value) => onChange('color', value)}
              onClose={() => onLeave('color')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
