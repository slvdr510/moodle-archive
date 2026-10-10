import { useId, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import { courseDisplayNames } from '../../lib/courseNames';
import { hasCourseTag } from '../../lib/downloadNameSettings';
import { formatRelativeTime } from '../../lib/relativeTime';
import type { Course } from '../../types';
import { DropdownMenu } from './DropdownMenu';
import { useT } from '../hooks/useTranslation';

type EditMode = 'tag' | 'fullName' | 'institution';

export function CourseCard({
  course,
  color,
  onOpen,
  onRename,
  onSetFullName,
  onSetInstitution,
  onChangeColor,
  institutionSuggestions = [],
  onDelete,
  onExport,
  onHide,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver
}: {
  course: Course;
  /** The card's accent color — see courseColors.ts. */
  color?: string;
  onOpen: () => void;
  /** Undefined to remove the tag, going back to the name from Moodle. */
  onRename: (name: string | undefined) => void;
  /** Undefined to go back to the name from Moodle. */
  onSetFullName: (fullName: string | undefined) => void;
  /** Undefined to remove it. */
  onSetInstitution: (institution: string | undefined) => void;
  /** Opens the color picker for this course. */
  onChangeColor: () => void;
  /** Institutions already set on other courses, offered while typing one. */
  institutionSuggestions?: string[];
  onDelete: () => void;
  onExport: () => void;
  onHide: () => void;
  onDragStart: () => void;
  onDragOver: (e: DragEvent<HTMLLIElement>) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  const t = useT();
  // Which name is being edited in place: the tag (an abbreviation), the full name, or
  // the institution's abbreviation.
  const [editing, setEditing] = useState<EditMode | null>(null);
  const institutionListId = useId();
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  // Set by Escape, so the blur that can follow the input's removal doesn't save anyway.
  const cancelled = useRef(false);
  const { title, subtitle } = courseDisplayNames(course);
  const tagged = hasCourseTag(course);

  function commit() {
    const mode = editing;
    setEditing(null);
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const trimmed = draft.trim();
    if (mode === 'tag') {
      if (trimmed && (trimmed !== course.name || !course.tagged)) onRename(trimmed);
      // Emptied: no tag any more.
      else if (!trimmed && tagged) onRename(undefined);
    } else if (mode === 'fullName') {
      // Emptied: back to the name from Moodle.
      const fullName = trimmed || undefined;
      if (fullName !== course.fullName) onSetFullName(fullName);
    } else if (mode === 'institution') {
      // Emptied: no institution.
      const institution = trimmed || undefined;
      if (institution !== course.institution) onSetInstitution(institution);
    }
  }

  function startEditing(mode: EditMode) {
    cancelled.current = false;
    setDraft(mode === 'tag' ? course.name : mode === 'fullName' ? (course.fullName ?? '') : (course.institution ?? ''));
    setEditing(mode);
  }

  const editLabels: Record<EditMode, { label: string; placeholder: string }> = {
    tag: { label: t.courseRow.setTagName, placeholder: t.courseRow.tagPlaceholder },
    fullName: { label: t.courseRow.setFullName, placeholder: t.courseRow.fullNamePlaceholder },
    institution: { label: t.courseRow.setInstitution, placeholder: t.courseRow.institutionPlaceholder }
  };

  const courseUrl = course.url || course.matchedUrls[0];

  return (
    <li
      className={`course-card${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}${menuOpen ? ' menu-open' : ''}`}
      style={color ? ({ '--course-color': color } as CSSProperties) : undefined}
      draggable={editing === null}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={() => editing === null && onOpen()}
    >
      {editing !== null ? (
        <input
          className="course-name-input"
          value={draft}
          placeholder={editLabels[editing].placeholder}
          aria-label={editLabels[editing].label}
          list={editing === 'institution' ? institutionListId : undefined}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              cancelled.current = true;
              setEditing(null);
            }
          }}
          onBlur={commit}
        />
      ) : (
        // With a tag, the card shows only the tag, as large as fits (sized from its
        // length — see .course-card-names.has-tag); the full name is left to the
        // tooltip there, and shown beneath it only as a row.
        <div
          className={`course-card-names ${tagged ? 'has-tag' : 'has-full-name'}`}
          title={subtitle ? `${title}\n${subtitle}` : title}
          style={
            (tagged
              ? { '--tag-length': Math.max(2, [...title].length) }
              : { '--name-length': Math.max(10, [...title].length) }) as CSSProperties
          }
        >
          <span className={`course-name${subtitle ? ' with-subtitle' : ''}`}>{title}</span>
          {subtitle && <span className="course-full-name">{subtitle}</span>}
        </div>
      )}

      {editing === 'institution' && (
        <datalist id={institutionListId}>
          {institutionSuggestions.map((institution) => (
            <option key={institution} value={institution} />
          ))}
        </datalist>
      )}

      <div className="course-card-footer">
        <span className="course-card-meta">
          {course.institution && (
            <span className="course-institution" title={t.courseRow.institution}>
              {course.institution}
            </span>
          )}
          <span className="course-last-synced" title={t.courseRow.lastDownloaded}>
            {formatRelativeTime(course.lastSyncedAt, Date.now(), t)}
          </span>
        </span>

        <div className="course-card-actions">
          {courseUrl && (
            <button
              className="icon-button course-open-url"
              title={t.courseRow.openInMoodle}
              onClick={(e) => {
                e.stopPropagation();
                void chrome.tabs.create({ url: courseUrl });
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6M10 14 21 3" />
              </svg>
            </button>
          )}

          <DropdownMenu
            onOpenChange={setMenuOpen}
            items={[
              { label: t.courseRow.setTagName, onClick: () => startEditing('tag') },
              { label: t.courseRow.setFullName, onClick: () => startEditing('fullName') },
              { label: t.courseRow.setInstitution, onClick: () => startEditing('institution') },
              { label: t.courseRow.changeColor, onClick: onChangeColor },
              { label: t.common.export, onClick: onExport },
              { label: t.courseRow.hideCourse, onClick: onHide },
              { label: t.courseRow.deleteCourse, onClick: onDelete, danger: true }
            ]}
          />
        </div>
      </div>
    </li>
  );
}
