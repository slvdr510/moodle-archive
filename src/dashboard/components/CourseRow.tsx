import { useState, type DragEvent } from 'react';
import { formatRelativeTime } from '../../lib/relativeTime';
import type { Course } from '../../types';
import { DropdownMenu } from './DropdownMenu';

export function CourseRow({
  course,
  onOpen,
  onRename,
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
  onOpen: () => void;
  onRename: (name: string) => void;
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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(course.name);
  const [menuOpen, setMenuOpen] = useState(false);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== course.name) {
      onRename(trimmed);
    } else {
      setDraft(course.name);
    }
  }

  const courseUrl = course.url || course.matchedUrls[0];

  return (
    <li
      className={`course-row${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}${menuOpen ? ' menu-open' : ''}`}
      draggable={!editing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={() => !editing && onOpen()}
    >
      {editing ? (
        <input
          className="course-name-input"
          value={draft}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(course.name);
              setEditing(false);
            }
          }}
          onBlur={commit}
        />
      ) : (
        <span className="course-name">{course.name}</span>
      )}

      <div className="course-row-right">
        <span className="course-last-synced" title="Last downloaded">
          {formatRelativeTime(course.lastSyncedAt)}
        </span>

        {courseUrl && (
          <button
            className="icon-button course-open-url"
            title="Open the course in Moodle"
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
            {
              label: 'Set tag name',
              onClick: () => {
                setDraft(course.name);
                setEditing(true);
              }
            },
            { label: 'Export', onClick: onExport },
            { label: 'Hide course', onClick: onHide },
            { label: 'Delete course', onClick: onDelete, danger: true }
          ]}
        />
      </div>
    </li>
  );
}
