// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  assignAcademicYearColors,
  getAcademicYearColors,
  removeAcademicYearColor,
  setAcademicYearColor,
  subscribeAcademicYearColors
} from '../src/lib/academicYearColors';
import { COURSE_COLORS } from '../src/lib/courseColors';

beforeEach(() => localStorage.clear());

describe('academic year colors', () => {
  it('gives each year without one a color no other year has, from the palette while there are any left', () => {
    setAcademicYearColor('24-25', COURSE_COLORS[0]);
    assignAcademicYearColors(['24-25', '25-26', undefined, '', ' 26-27 ', '25-26']);
    const colors = getAcademicYearColors();
    expect(Object.keys(colors).sort()).toEqual(['24-25', '25-26', '26-27']);
    // One already set stays.
    expect(colors['24-25']).toBe(COURSE_COLORS[0]);
    expect(new Set(Object.values(colors)).size).toBe(3);
    for (const color of Object.values(colors)) expect(COURSE_COLORS).toContain(color);
  });

  it('goes on with any hue once the palette is used up, still one for each', () => {
    const years = Array.from({ length: 14 }, (_, i) => `${10 + i}-${11 + i}`);
    assignAcademicYearColors(years);
    const colors = Object.values(getAcademicYearColors());
    expect(colors).toHaveLength(14);
    expect(new Set(colors).size).toBe(14);
    for (const color of colors) expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('keeps a color set by hand, and forgets a removed one', () => {
    setAcademicYearColor('25-26', '#ABCDEF');
    expect(getAcademicYearColors()['25-26']).toBe('#abcdef');
    removeAcademicYearColor('25-26');
    expect(getAcademicYearColors()['25-26']).toBeUndefined();
  });

  it('tells its listeners, and gives the same object back while nothing changed', () => {
    let calls = 0;
    const unsubscribe = subscribeAcademicYearColors(() => calls++);
    setAcademicYearColor('25-26', '#123456');
    expect(calls).toBe(1);
    expect(getAcademicYearColors()).toBe(getAcademicYearColors());
    // Nothing new to give: nothing written.
    assignAcademicYearColors(['25-26']);
    expect(calls).toBe(1);
    unsubscribe();
  });

  it('ignores what is stored if it is not what it writes', () => {
    localStorage.setItem('moodle-archive-academic-year-colors', '{"25-26":"red","24-25":"#00ff00"');
    expect(getAcademicYearColors()).toEqual({});
    localStorage.setItem('moodle-archive-academic-year-colors', '{"25-26":"red","24-25":"#00ff00"}');
    expect(getAcademicYearColors()).toEqual({ '24-25': '#00ff00' });
  });
});
