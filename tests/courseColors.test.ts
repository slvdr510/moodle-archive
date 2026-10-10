import { describe, expect, it } from 'vitest';
import { assignCourseColors, COURSE_COLORS } from '../src/lib/courseColors';
import type { Course } from '../src/types';

function course(id: string, name: string, overrides: Partial<Course> = {}): Course {
  return {
    id,
    name,
    url: '',
    matchedUrls: [],
    createdAt: Number(id.replace(/\D/g, '')) || 0,
    lastSyncedAt: 0,
    order: 0,
    firstSyncCompleted: true,
    hidden: false,
    ...overrides
  };
}

const names = Array.from({ length: COURSE_COLORS.length }, (_, i) => course(`c${i + 1}`, `Asignatura ${i + 1}`));

/** A color's position in OKLab, where distance tracks how different two colors look. */
function oklab(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
}

describe('COURSE_COLORS', () => {
  it('has no two colors that look alike', () => {
    for (const [i, a] of COURSE_COLORS.entries()) {
      for (const b of COURSE_COLORS.slice(i + 1)) {
        const [l1, a1, b1] = oklab(a);
        const [l2, a2, b2] = oklab(b);
        expect(Math.hypot(l1 - l2, a1 - a2, b1 - b2) * 100, `${a} vs ${b}`).toBeGreaterThanOrEqual(10);
      }
    }
  });
});

describe('assignCourseColors', () => {
  it('gives every course a different color while there are colors to spare', () => {
    const colors = assignCourseColors(names);
    expect(new Set(colors.values()).size).toBe(names.length);
  });

  it('spreads courses evenly over the palette once there are more courses than colors', () => {
    const many = Array.from({ length: COURSE_COLORS.length * 2 }, (_, i) => course(`c${i + 1}`, `Curso ${i + 1}`));
    const counts = new Map<string, number>();
    for (const color of assignCourseColors(many).values()) counts.set(color, (counts.get(color) ?? 0) + 1);
    expect([...counts.values()]).toEqual(COURSE_COLORS.map(() => 2));
  });

  it("never changes an existing course's color when a new one is added", () => {
    const before = assignCourseColors(names.slice(0, 5));
    const after = assignCourseColors([...names.slice(0, 5), course('c99', 'Nueva asignatura')]);
    for (const [id, color] of before) expect(after.get(id)).toBe(color);
  });

  it('is the same however the courses are ordered in the list', () => {
    expect(assignCourseColors([...names].reverse())).toEqual(assignCourseColors(names));
  });

  it("follows the course's Moodle name, not a tag set on it", () => {
    const plain = course('c1', 'Sistemas Operativos');
    const tagged = course('c1', 'SO', { tagged: true, autoName: 'Sistemas Operativos' });
    expect(assignCourseColors([tagged]).get('c1')).toBe(assignCourseColors([plain]).get('c1'));
  });
});

describe('custom course colors', () => {
  it("uses a course's own color, without repainting any other course", () => {
    const courses = [course('c1', 'Algebra'), course('c2', 'Biologia'), course('c3', 'Calculo')];
    const before = assignCourseColors(courses);
    const after = assignCourseColors([{ ...courses[0], color: '#123456' }, courses[1], courses[2]]);
    expect(after.get('c1')).toBe('#123456');
    expect(after.get('c2')).toBe(before.get('c2'));
    expect(after.get('c3')).toBe(before.get('c3'));
  });
});
