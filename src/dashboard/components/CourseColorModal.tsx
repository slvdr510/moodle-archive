import { useState, type CSSProperties } from 'react';
import { COURSE_COLORS } from '../../lib/courseColors';
import { courseDisplayNames } from '../../lib/courseNames';
import type { Course } from '../../types';
import { useT } from '../hooks/useTranslation';

/**
 * Picks a course's card color: one of the palette's, any other from the browser's
 * color picker, or back to its automatic one. Previewed on a small card here;
 * nothing is stored until Save.
 */
export function CourseColorModal({
  course,
  autoColor,
  onSave,
  onClose
}: {
  course: Course;
  /** The color the course gets when it has none of its own. */
  autoColor: string;
  /** Undefined to go back to the automatic color. */
  onSave: (color: string | undefined) => void;
  onClose: () => void;
}) {
  const t = useT();
  // Undefined while on the automatic color.
  const [color, setColor] = useState<string | undefined>(course.color);
  const shown = color ?? autoColor;
  const { title } = courseDisplayNames(course);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal course-color-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirm-modal-title" title={t.courseColor.title(title)}>
          {t.courseColor.title(title)}
        </h2>

        <div className="course-color-preview" style={{ '--course-color': shown } as CSSProperties} aria-hidden="true">
          <span>{title}</span>
        </div>

        <div className="course-color-swatches" role="radiogroup" aria-label={t.courseColor.palette}>
          {COURSE_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              role="radio"
              aria-checked={color?.toLowerCase() === swatch}
              aria-label={swatch}
              title={swatch}
              className={`course-color-swatch${color?.toLowerCase() === swatch ? ' active' : ''}`}
              style={{ background: swatch }}
              onClick={() => setColor(swatch)}
            />
          ))}
        </div>

        <label className="course-color-custom">
          <input type="color" value={shown} onInput={(e) => setColor(e.currentTarget.value)} />
          {t.courseColor.custom}
        </label>

        <button
          type="button"
          className="link-button course-color-auto"
          disabled={color === undefined}
          onClick={() => setColor(undefined)}
        >
          {t.courseColor.automatic}
        </button>

        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button
            onClick={() => {
              onSave(color);
              onClose();
            }}
          >
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
