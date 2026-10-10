import { useState, type ReactNode } from 'react';
import type { CourseListStyle } from '../../lib/courseListStyle';
import { useCourseListStyle } from '../hooks/useCourseListStyle';
import { useT } from '../hooks/useTranslation';

/** A sketch of each style, so the choice reads at a glance. */
const ICONS: Record<CourseListStyle, ReactNode> = {
  cards: (
    <svg viewBox="0 0 48 36" width="48" height="36" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="14" rx="3" />
      <rect x="26" y="2" width="20" height="14" rx="3" />
      <rect x="2" y="20" width="20" height="14" rx="3" />
      <rect x="26" y="20" width="20" height="14" rx="3" />
    </svg>
  ),
  rows: (
    <svg viewBox="0 0 48 36" width="48" height="36" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="44" height="32" rx="3" />
      <path d="M2 12.7h44M2 23.3h44" />
    </svg>
  )
};

/** Global setting for how the course list shows courses. Applied live, so the list
 *  behind the modal shows the choice; Cancel puts the previous one back. */
export function CourseListStyleModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [style, setStyle] = useCourseListStyle();
  const [original] = useState(style);
  const options: { value: CourseListStyle; label: string }[] = [
    { value: 'cards', label: t.courseListStyle.cards },
    { value: 'rows', label: t.courseListStyle.rows }
  ];

  function handleCancel() {
    setStyle(original);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div className="modal course-list-style-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t.courseListStyle.title}</h2>
        <p>{t.courseListStyle.description}</p>
        <div className="course-list-style-options" role="radiogroup" aria-label={t.courseListStyle.title}>
          {options.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={style === value}
              className={`course-list-style-option${style === value ? ' active' : ''}`}
              onClick={() => setStyle(value)}
            >
              {ICONS[value]}
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={handleCancel}>
            {t.common.cancel}
          </button>
          <button onClick={onClose}>{t.common.save}</button>
        </div>
      </div>
    </div>
  );
}
