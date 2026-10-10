import { describe, expect, it } from 'vitest';
import { courseDisplayNames, coursePageTitle, withoutTag } from '../src/lib/courseNames';
import type { Course } from '../src/types';

function course(overrides: Partial<Course>): Course {
  return {
    id: 'c1',
    name: 'Sistemas Operativos',
    url: '',
    matchedUrls: [],
    createdAt: 0,
    lastSyncedAt: 0,
    order: 0,
    firstSyncCompleted: true,
    hidden: false,
    autoName: 'Sistemas Operativos',
    ...overrides
  };
}

describe('courseDisplayNames', () => {
  it('shows an untagged course by its Moodle name, or the full name set by hand', () => {
    expect(courseDisplayNames(course({}))).toEqual({ title: 'Sistemas Operativos' });
    expect(courseDisplayNames(course({ fullName: 'SSOO avanzado' }))).toEqual({ title: 'SSOO avanzado' });
  });

  it('shows a tagged course as the tag, over its full name', () => {
    expect(courseDisplayNames(course({ name: 'SO', tagged: true }))).toEqual({ title: 'SO', subtitle: 'Sistemas Operativos' });
    expect(courseDisplayNames(course({ name: 'SO', tagged: true, fullName: 'Sist. Op.' }))).toEqual({
      title: 'SO',
      subtitle: 'Sist. Op.'
    });
  });

  it('has no full name to show for a course tagged before its Moodle name was recorded', () => {
    expect(courseDisplayNames(course({ name: 'SO', tagged: true, autoName: undefined }))).toEqual({ title: 'SO' });
  });
});

describe('coursePageTitle', () => {
  it('prefers the full name set by hand, then the tag, then the Moodle name', () => {
    expect(coursePageTitle(course({ name: 'SO', tagged: true, fullName: 'Sistemas Operativos II' }))).toBe('Sistemas Operativos II');
    expect(coursePageTitle(course({ name: 'SO', tagged: true }))).toBe('SO');
    expect(coursePageTitle(course({}))).toBe('Sistemas Operativos');
  });
});

describe('withoutTag', () => {
  it('goes back to the Moodle name, no longer tagged', () => {
    const untagged = withoutTag(course({ name: 'SO', tagged: true }));
    expect(untagged).toMatchObject({ name: 'Sistemas Operativos', tagged: false });
    expect(courseDisplayNames(untagged)).toEqual({ title: 'Sistemas Operativos' });
  });
});
