import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { recentOpenStore } from '../src/lib/db';
import type { RecentOpenRecord } from '../src/types';

function makeRecord(fileId: string, openedAt: number, courseId = 'course-1'): RecentOpenRecord {
  return {
    id: `${courseId}::${fileId}`,
    courseId,
    fileId,
    relativePath: `${fileId}.pdf`,
    filename: `${fileId}.pdf`,
    openedAt
  };
}

describe('recentOpenStore', () => {
  it('returns entries for a course newest-first', async () => {
    const courseId = crypto.randomUUID();
    await recentOpenStore.recordOpen(makeRecord('a', 1000, courseId));
    await recentOpenStore.recordOpen(makeRecord('b', 3000, courseId));
    await recentOpenStore.recordOpen(makeRecord('c', 2000, courseId));

    const results = await recentOpenStore.byCourse(courseId);
    expect(results.map((r) => r.fileId)).toEqual(['b', 'c', 'a']);
  });

  it('re-opening the same file updates its timestamp instead of duplicating it', async () => {
    const courseId = crypto.randomUUID();
    await recentOpenStore.recordOpen(makeRecord('a', 1000, courseId));
    await recentOpenStore.recordOpen(makeRecord('a', 5000, courseId));

    const results = await recentOpenStore.byCourse(courseId);
    expect(results).toHaveLength(1);
    expect(results[0].openedAt).toBe(5000);
  });

  it('keeps only the most recent entries once the limit is exceeded', async () => {
    const courseId = crypto.randomUUID();
    for (let i = 0; i < 8; i++) {
      await recentOpenStore.recordOpen(makeRecord(`file-${i}`, i * 1000, courseId));
    }

    const results = await recentOpenStore.byCourse(courseId);
    expect(results.length).toBeLessThanOrEqual(5);
    // The most recently opened ones must be the ones kept.
    expect(results.map((r) => r.fileId)).toEqual(['file-7', 'file-6', 'file-5', 'file-4', 'file-3']);
  });

  it('keeps separate courses independent of each other', async () => {
    const courseA = crypto.randomUUID();
    const courseB = crypto.randomUUID();
    await recentOpenStore.recordOpen(makeRecord('a', 1000, courseA));
    await recentOpenStore.recordOpen(makeRecord('b', 1000, courseB));

    expect((await recentOpenStore.byCourse(courseA)).map((r) => r.fileId)).toEqual(['a']);
    expect((await recentOpenStore.byCourse(courseB)).map((r) => r.fileId)).toEqual(['b']);
  });

  it('remove() deletes a single entry without touching the others', async () => {
    const courseId = crypto.randomUUID();
    await recentOpenStore.recordOpen(makeRecord('a', 1000, courseId));
    await recentOpenStore.recordOpen(makeRecord('b', 2000, courseId));

    await recentOpenStore.remove(`${courseId}::a`);

    const results = await recentOpenStore.byCourse(courseId);
    expect(results.map((r) => r.fileId)).toEqual(['b']);
  });
});
