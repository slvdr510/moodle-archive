import { useId, useState } from 'react';
import { courseDisplayNames } from '../../lib/courseNames';
import type { Course } from '../../types';
import { useT } from '../hooks/useTranslation';

/**
 * Sets one institution on a hand-picked group of courses at once — or, left empty,
 * removes it from them. Hidden courses are listed too (marked as such), since they
 * keep their institution for when they're shown again.
 */
export function SetInstitutionModal({
  courses,
  suggestions,
  onApply,
  onClose
}: {
  courses: Course[];
  /** Institutions already set on courses, offered while typing. */
  suggestions: string[];
  onApply: (courseIds: string[], institution: string | undefined) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [institution, setInstitution] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const suggestionsId = useId();

  function toggle(courseId: string) {
    const next = new Set(selected);
    if (next.has(courseId)) next.delete(courseId);
    else next.add(courseId);
    setSelected(next);
  }

  function apply() {
    onApply(
      courses.filter((c) => selected.has(c.id)).map((c) => c.id),
      institution.trim() || undefined
    );
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal set-institution-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t.setInstitution.title}</h2>
        <p>{t.setInstitution.description}</p>

        <label>
          {t.courseRow.institution}
          <input
            type="text"
            list={suggestionsId}
            value={institution}
            placeholder={t.courseRow.institutionPlaceholder}
            autoFocus
            onChange={(e) => setInstitution(e.currentTarget.value)}
          />
        </label>
        <datalist id={suggestionsId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>

        <div className="set-institution-courses-header">
          <span>{t.setInstitution.courses(selected.size)}</span>
          <span className="set-institution-select-buttons">
            <button type="button" className="link-button" onClick={() => setSelected(new Set(courses.map((c) => c.id)))}>
              {t.setInstitution.selectAll}
            </button>
            <button type="button" className="link-button" onClick={() => setSelected(new Set())}>
              {t.setInstitution.selectNone}
            </button>
          </span>
        </div>
        <ul className="set-institution-courses">
          {courses.map((course) => {
            const { title, subtitle } = courseDisplayNames(course);
            return (
              <li key={course.id}>
                <label className="set-institution-course">
                  <input type="checkbox" checked={selected.has(course.id)} onChange={() => toggle(course.id)} />
                  <span className="set-institution-course-name" title={subtitle ? `${title}\n${subtitle}` : title}>
                    {title}
                    {subtitle && <span className="set-institution-course-full-name"> · {subtitle}</span>}
                  </span>
                  {course.hidden && <span className="set-institution-hidden">{t.setInstitution.hidden}</span>}
                  {course.institution && (
                    <span className="course-institution" title={t.courseRow.institution}>
                      {course.institution}
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>

        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button disabled={selected.size === 0} onClick={apply}>
            {institution.trim() ? t.setInstitution.apply(selected.size) : t.setInstitution.remove(selected.size)}
          </button>
        </div>
      </div>
    </div>
  );
}
