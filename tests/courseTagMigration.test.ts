import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { inferLegacyTagState, migrateLegacyCourseTags } from '../src/lib/courseTagMigration';
import { courseStore, fileStore } from '../src/lib/db';
import type { Course, FileRecord } from '../src/types';

function course(overrides: Partial<Course> = {}): Course {
  return {
    id: 'c1',
    name: 'PCD GII Recursos CVUHU RE',
    url: '',
    matchedUrls: [],
    createdAt: 0,
    lastSyncedAt: 0,
    order: 0,
    firstSyncCompleted: true,
    hidden: false,
    ...overrides
  };
}

function file(relativePath: string, overrides: Partial<FileRecord> = {}): FileRecord {
  return {
    id: `c1::${relativePath}`,
    courseId: 'c1',
    relativePath,
    filename: relativePath.split('/').pop()!,
    currentStatus: 'unchanged',
    ...overrides
  };
}

// As the crawler and the background would have produced them from the title
// "PCD-GII_Recursos (CVUHU-RE)".
const crawled = [file('PCD-GII_Recursos_CVUHU-RE/Tema_2.pdf'), file('PCD-GII_Recursos_CVUHU-RE/Practicas/P1.pdf')];

describe('inferLegacyTagState', () => {
  it('recognizes a course still on its automatic name', () => {
    expect(inferLegacyTagState(course(), crawled)).toEqual({ autoName: 'PCD GII Recursos CVUHU RE' });
  });

  it('recognizes a name the user set as a tag', () => {
    expect(inferLegacyTagState(course({ name: 'PCD' }), crawled)).toEqual({ tagged: true });
  });

  it('folds away accents the crawler dropped from the folder name', () => {
    expect(inferLegacyTagState(course({ name: 'Cálculo I' }), [file('Calculo_I/a.pdf')])).toEqual({ autoName: 'Cálculo I' });
  });

  it('ignores files added by hand', () => {
    const files = [...crawled, file('Mis apuntes/x.pdf', { manual: true })];
    expect(inferLegacyTagState(course({ name: 'PCD' }), files)).toEqual({ tagged: true });
  });

  it("can't tell without crawled files under a single title folder", () => {
    expect(inferLegacyTagState(course({ name: 'PCD' }), [])).toBeUndefined();
    expect(inferLegacyTagState(course({ name: 'PCD' }), [file('a.pdf')])).toBeUndefined();
    expect(inferLegacyTagState(course({ name: 'PCD' }), [file('A/a.pdf'), file('B/b.pdf')])).toBeUndefined();
  });
});

describe('migrateLegacyCourseTags', () => {
  it('fills in only courses without a tag state, and is safe to re-run', async () => {
    await courseStore.put(course({ id: 'legacy', name: 'PCD' }));
    await courseStore.put(course({ id: 'already', name: 'SO', tagged: false, autoName: 'SO' }));
    await fileStore.put(file('PCD-GII_Recursos_CVUHU-RE/Tema_2.pdf', { id: 'legacy::x', courseId: 'legacy' }));
    await fileStore.put(file('Sistemas/x.pdf', { id: 'already::x', courseId: 'already' }));

    await migrateLegacyCourseTags();
    await migrateLegacyCourseTags();

    expect(await courseStore.get('legacy')).toMatchObject({ name: 'PCD', tagged: true });
    expect(await courseStore.get('already')).toMatchObject({ tagged: false, autoName: 'SO' });
  });
});
