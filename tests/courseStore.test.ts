import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { courseStore } from '../src/lib/db';
import type { Course } from '../src/types';

describe('courseStore normalization', () => {
  it('treats a pre-existing course lacking firstSyncCompleted as already past its first sync', async () => {
    const legacyCourse = {
      id: crypto.randomUUID(),
      name: 'Legacy Course',
      url: '',
      matchedUrls: [],
      createdAt: 1_000,
      lastSyncedAt: 1_000,
      order: 0
      // firstSyncCompleted intentionally omitted, simulating a record saved
      // before that field existed.
    } as unknown as Course;
    await courseStore.put(legacyCourse);

    const fetched = await courseStore.get(legacyCourse.id);
    expect(fetched?.firstSyncCompleted).toBe(true);

    const all = await courseStore.all();
    expect(all.find((c) => c.id === legacyCourse.id)?.firstSyncCompleted).toBe(true);
  });

  it('reads an academic year kept as its two years as the text it showed as', async () => {
    const course = {
      id: crypto.randomUUID(),
      name: 'Course',
      url: '',
      matchedUrls: [],
      createdAt: 1_000,
      lastSyncedAt: 1_000,
      order: 0,
      firstSyncCompleted: true,
      hidden: false,
      academicYear: { start: '25', end: '26' }
    } as unknown as Course;
    await courseStore.put(course);
    expect((await courseStore.get(course.id))?.academicYear).toBe('25-26');
  });

  it('leaves an explicit firstSyncCompleted: false alone', async () => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: 'Brand New Course',
      url: '',
      matchedUrls: [],
      createdAt: 1_000,
      lastSyncedAt: 1_000,
      order: 0,
      firstSyncCompleted: false,
      hidden: false
    };
    await courseStore.put(course);

    const fetched = await courseStore.get(course.id);
    expect(fetched?.firstSyncCompleted).toBe(false);
  });

  it('treats a pre-existing course lacking `hidden` as not hidden', async () => {
    const legacyCourse = {
      id: crypto.randomUUID(),
      name: 'Legacy Course',
      url: '',
      matchedUrls: [],
      createdAt: 1_000,
      lastSyncedAt: 1_000,
      order: 0,
      firstSyncCompleted: true
      // `hidden` intentionally omitted, simulating a record saved before that field existed.
    } as unknown as Course;
    await courseStore.put(legacyCourse);

    const fetched = await courseStore.get(legacyCourse.id);
    expect(fetched?.hidden).toBe(false);
  });
});
