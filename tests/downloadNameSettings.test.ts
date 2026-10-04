// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { courseStore } from '../src/lib/db';
import { applyCourseTag, downloadNameFor, getPrefixCourseTag, setPrefixCourseTag } from '../src/lib/downloadNameSettings';
import type { Course } from '../src/types';

function course(overrides: Partial<Course> = {}): Course {
  return {
    id: 'c1',
    name: 'PCD',
    url: '',
    matchedUrls: [],
    createdAt: 0,
    lastSyncedAt: 0,
    order: 0,
    firstSyncCompleted: true,
    hidden: false,
    tagged: true,
    ...overrides
  };
}

beforeEach(() => localStorage.clear());

describe('course tag in download names', () => {
  it('is on by default, prefixing the tag and "_"', () => {
    expect(getPrefixCourseTag()).toBe(true);
    expect(applyCourseTag('Tema_2.pdf', course())).toBe('PCD_Tema_2.pdf');
  });

  it('can be turned off', () => {
    setPrefixCourseTag(false);
    expect(applyCourseTag('Tema_2.pdf', course())).toBe('Tema_2.pdf');
  });

  it('treats a name different from the automatic one as a tag, even without `tagged`', () => {
    expect(applyCourseTag('a.pdf', course({ tagged: undefined, autoName: 'PCD GII Recursos' }))).toBe('PCD_a.pdf');
    expect(applyCourseTag('a.pdf', course({ tagged: undefined, name: 'PCD GII', autoName: 'PCD GII' }))).toBe('a.pdf');
  });

  it('leaves the name alone for a course without a user-set tag', () => {
    setPrefixCourseTag(true);
    expect(applyCourseTag('Tema_2.pdf', course({ tagged: undefined }))).toBe('Tema_2.pdf');
    expect(applyCourseTag('Tema_2.pdf', undefined)).toBe('Tema_2.pdf');
  });

  it('replaces characters a filename cannot hold', () => {
    expect(applyCourseTag('a.pdf', course({ name: 'PCD/2: GII' }), true)).toBe('PCD_2_ GII_a.pdf');
  });

  it('looks the course up by id', async () => {
    await courseStore.put(course({ id: 'tagged-course', name: 'SO' }));
    setPrefixCourseTag(true);
    expect(await downloadNameFor('tagged-course', 'x.pdf')).toBe('SO_x.pdf');
    setPrefixCourseTag(false);
    expect(await downloadNameFor('tagged-course', 'x.pdf')).toBe('x.pdf');
  });
});
