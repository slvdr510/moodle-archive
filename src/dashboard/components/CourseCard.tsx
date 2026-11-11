import { useState, type CSSProperties, type DragEvent } from 'react';
import { courseDisplayNames } from '../../lib/courseNames';
import { hasCourseTag } from '../../lib/downloadNameSettings';
import { formatRelativeTime } from '../../lib/relativeTime';
import type { Course } from '../../types';
import { DropdownMenu } from './DropdownMenu';
import { useT } from '../hooks/useTranslation';

export function CourseCard({
  course,
  color,
  academicYearColor,
  onOpen,
  onEditInfo,
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
  /** Its academic year's color — see academicYearColors.ts. */
  academicYearColor?: string;
  onOpen: () => void;
  /** Opens "Edit course info" on this course: its tag, full name, institution,
   *  academic year, URL and color. */
  onEditInfo: () => void;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const { title, subtitle } = courseDisplayNames(course);
  const tagged = hasCourseTag(course);
  const courseUrl = course.url || course.matchedUrls[0];

  return (
    <li
      className={`course-card${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}${menuOpen ? ' menu-open' : ''}`}
      style={color ? ({ '--course-color': color } as CSSProperties) : undefined}
      // Takes the focus from the arrow keys (see useCourseGridKeys), and gets it back on
      // returning from the course with Escape.
      tabIndex={-1}
      data-course-id={course.id}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
    >
      {/* With a tag, the card shows only the tag, as large as fits (sized from its
          length — see .course-card-names.has-tag); the full name is left to the
          tooltip there, and shown beneath it only as a row. The academic year goes
          right under it on a card, always shown; at the end of a row. */}
      <div
        className={`course-card-names ${tagged ? 'has-tag' : 'has-full-name'}${course.academicYear ? ' has-academic-year' : ''}`}
        title={subtitle ? `${title}\n${subtitle}` : title}
        style={
          (tagged
            ? { '--tag-length': Math.max(2, [...title].length) }
            : { '--name-length': Math.max(10, [...title].length) }) as CSSProperties
        }
      >
        <span className={`course-name${subtitle ? ' with-subtitle' : ''}`}>{title}</span>
        {subtitle && <span className="course-full-name">{subtitle}</span>}
        {course.academicYear && (
          <span
            className="course-academic-year"
            title={`${t.courseRow.academicYear}: ${course.academicYear}`}
            style={academicYearColor ? ({ '--year-color': academicYearColor } as CSSProperties) : undefined}
          >
            {course.academicYear}
          </span>
        )}
      </div>

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
              { label: t.courseRow.editInfo, icon: 'edit', onClick: onEditInfo },
              { label: t.common.export, icon: 'export', onClick: onExport },
              { label: t.courseRow.hideCourse, icon: 'hide', onClick: onHide },
              { label: t.courseRow.deleteCourse, icon: 'delete', onClick: onDelete, danger: true }
            ]}
          />
        </div>
      </div>
    </li>
  );
}
