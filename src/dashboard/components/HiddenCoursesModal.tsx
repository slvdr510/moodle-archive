import type { Course } from '../../types';
import { useT } from '../hooks/useTranslation';

export function HiddenCoursesModal({
  courses,
  onUnhide,
  onClose
}: {
  courses: Course[];
  onUnhide: (course: Course) => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t.hiddenCourses.title}</h2>
          <button className="modal-close-button" onClick={onClose} title={t.common.close} aria-label={t.common.close}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {courses.length === 0 ? (
          <p>{t.hiddenCourses.none}</p>
        ) : (
          <ul className="hidden-courses-list">
            {courses.map((course) => (
              <li key={course.id} className="hidden-courses-item">
                <span className="hidden-courses-name">{course.name}</span>
                <button className="secondary" onClick={() => onUnhide(course)}>
                  {t.hiddenCourses.unhide}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
