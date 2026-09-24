import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InvalidBackupError, exportAllData, exportCourse, importAllData } from '../src/lib/backup';
import { courseStore, fileStore, recentOpenStore, resetTrackedData, versionStore } from '../src/lib/db';
import type { Course, FileRecord, VersionRecord } from '../src/types';

async function seedOneCourse(): Promise<{ course: Course; file: FileRecord; version: VersionRecord }> {
  const course: Course = {
    id: crypto.randomUUID(),
    name: 'Fisica',
    url: 'https://moodle.example/course/view.php?id=1',
    matchedUrls: ['https://moodle.example/course/view.php?id=1'],
    createdAt: Date.now(),
    lastSyncedAt: Date.now(),
    order: 0,
    firstSyncCompleted: true,
    hidden: false
  };
  await courseStore.put(course);

  const file: FileRecord = {
    id: `${course.id}::notes.pdf`,
    courseId: course.id,
    relativePath: 'notes.pdf',
    filename: 'notes.pdf',
    currentStatus: 'new'
  };
  await fileStore.put(file);

  const version: VersionRecord = {
    id: `${file.id}::hash-a`,
    fileId: file.id,
    sha256: 'hash-a',
    size: 5,
    timestamp: Date.now(),
    content: new Blob(['hello'], { type: 'text/plain' })
  };
  await versionStore.put(version);

  await recentOpenStore.recordOpen({
    id: `${course.id}::${file.id}`,
    courseId: course.id,
    fileId: file.id,
    relativePath: 'notes.pdf',
    filename: 'notes.pdf',
    openedAt: Date.now()
  });

  return { course, file, version };
}

/** Like `seedOneCourse`, but with explicit ids/timestamps/content so tests can
 *  set up two distinct "installs" of what's conceptually the same course. */
async function seedCourseWithFile(opts: {
  courseId: string;
  name: string;
  matchedUrls?: string[];
  lastSyncedAt?: number;
  relativePath: string;
  sha256: string;
  content: string;
  timestamp: number;
}): Promise<{ course: Course; file: FileRecord; version: VersionRecord }> {
  const course: Course = {
    id: opts.courseId,
    name: opts.name,
    url: '',
    matchedUrls: opts.matchedUrls ?? [],
    createdAt: opts.timestamp,
    lastSyncedAt: opts.lastSyncedAt ?? opts.timestamp,
    order: 0,
    firstSyncCompleted: true,
    hidden: false
  };
  await courseStore.put(course);

  const file: FileRecord = {
    id: `${course.id}::${opts.relativePath}`,
    courseId: course.id,
    relativePath: opts.relativePath,
    filename: opts.relativePath,
    currentStatus: 'unchanged'
  };
  await fileStore.put(file);

  const version: VersionRecord = {
    id: `${file.id}::${opts.sha256}`,
    fileId: file.id,
    sha256: opts.sha256,
    size: opts.content.length,
    timestamp: opts.timestamp,
    content: new Blob([opts.content], { type: 'text/plain' })
  };
  await versionStore.put(version);

  return { course, file, version };
}

function stubDownloadCapturingBlob(): { blob: () => Blob | undefined } {
  let captured: Blob | undefined;
  URL.createObjectURL = vi.fn((blob: Blob) => {
    captured = blob;
    return 'blob:fake';
  });
  URL.revokeObjectURL = vi.fn();
  vi.stubGlobal('chrome', { downloads: { download: vi.fn().mockResolvedValue(1) } });
  return { blob: () => captured };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('exportAllData', () => {
  beforeEach(resetTrackedData);

  it('downloads a zip via chrome.downloads.download', async () => {
    await seedOneCourse();
    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake');
    URL.revokeObjectURL = vi.fn();
    const download = vi.fn().mockResolvedValue(1);
    vi.stubGlobal('chrome', { downloads: { download } });

    await exportAllData();

    expect(download).toHaveBeenCalledOnce();
    const arg = download.mock.calls[0][0] as { url: string; filename: string };
    expect(arg.url).toBe('blob:fake');
    expect(arg.filename).toMatch(/^moodle-archive-backup_.*\.zip$/);
  });
});

describe('exportCourse', () => {
  beforeEach(resetTrackedData);

  it('downloads a zip named after the course', async () => {
    const { course } = await seedOneCourse();
    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake');
    URL.revokeObjectURL = vi.fn();
    const download = vi.fn().mockResolvedValue(1);
    vi.stubGlobal('chrome', { downloads: { download } });

    await exportCourse(course.id);

    expect(download).toHaveBeenCalledOnce();
    const arg = download.mock.calls[0][0] as { url: string; filename: string };
    expect(arg.url).toBe('blob:fake');
    expect(arg.filename).toMatch(/^moodle-archive-course_Fisica_.*\.zip$/);
  });

  it('throws for an unknown course id', async () => {
    await expect(exportCourse('does-not-exist')).rejects.toThrow(/course not found/i);
  });

  it('only bundles the requested course, not every tracked course', async () => {
    const { course: courseA } = await seedOneCourse();

    const courseB: Course = {
      ...courseA,
      id: crypto.randomUUID(),
      name: 'Other Course',
      url: 'https://moodle.example/course/view.php?id=2',
      matchedUrls: ['https://moodle.example/course/view.php?id=2']
    };
    await courseStore.put(courseB);
    const fileB: FileRecord = {
      id: `${courseB.id}::b.pdf`,
      courseId: courseB.id,
      relativePath: 'b.pdf',
      filename: 'b.pdf',
      currentStatus: 'new'
    };
    await fileStore.put(fileB);
    await versionStore.put({
      id: `${fileB.id}::hash-b`,
      fileId: fileB.id,
      sha256: 'hash-b',
      size: 1,
      timestamp: Date.now(),
      content: new Blob(['x'])
    });

    let exportedBlob: Blob | undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      exportedBlob = blob;
      return 'blob:fake';
    });
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal('chrome', { downloads: { download: vi.fn().mockResolvedValue(1) } });

    await exportCourse(courseA.id);
    expect(exportedBlob).toBeDefined();

    await resetTrackedData();
    const summary = await importAllData(exportedBlob!);
    expect(summary).toEqual({ courses: 1, files: 1, versions: 1, recentOpens: 1 });

    const restoredA = await courseStore.get(courseA.id);
    expect(restoredA?.name).toBe('Fisica');
    expect(await courseStore.get(courseB.id)).toBeUndefined();
  });
});

describe('exportAllData + importAllData round-trip', () => {
  beforeEach(resetTrackedData);

  it('restores an exported course, file, version (with content) and recent-open into a clean database', async () => {
    const { course, file, version } = await seedOneCourse();

    // Capture the real zip Blob instead of stubbing it away, so we can feed it
    // straight into importAllData — a genuine end-to-end round trip.
    let exportedBlob: Blob | undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      exportedBlob = blob;
      return 'blob:fake';
    });
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal('chrome', { downloads: { download: vi.fn().mockResolvedValue(1) } });

    await exportAllData();
    expect(exportedBlob).toBeDefined();

    await resetTrackedData();

    const summary = await importAllData(exportedBlob!);
    expect(summary).toEqual({ courses: 1, files: 1, versions: 1, recentOpens: 1 });

    const restoredCourse = await courseStore.get(course.id);
    expect(restoredCourse?.name).toBe('Fisica');

    const restoredFiles = await fileStore.byCourse(course.id);
    expect(restoredFiles).toHaveLength(1);
    expect(restoredFiles[0].id).toBe(file.id);

    const restoredVersions = await versionStore.byFile(file.id);
    expect(restoredVersions).toHaveLength(1);
    expect(restoredVersions[0].id).toBe(version.id);
    expect(await restoredVersions[0].content.text()).toBe('hello');

    const restoredRecentOpens = await recentOpenStore.byCourse(course.id);
    expect(restoredRecentOpens).toHaveLength(1);
  });
});

describe('importAllData', () => {
  beforeEach(resetTrackedData);

  async function zipBlob(files: Record<string, string>): Promise<Blob> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    for (const [name, content] of Object.entries(files)) zip.file(name, content);
    return zip.generateAsync({ type: 'blob' });
  }

  async function trackedCounts() {
    return { courses: (await courseStore.all()).length, recentOpens: (await recentOpenStore.all()).length };
  }

  it.each([
    ['a zip with no data.json', () => zipBlob({ 'unrelated.txt': 'nope' })],
    ['a file that is not a zip at all', async () => new Blob(['just some text'])],
    ['a data.json that is not JSON', () => zipBlob({ 'data.json': '{ nope' })],
    ['a data.json that is not a backup manifest', () => zipBlob({ 'data.json': JSON.stringify({ hello: 'world' }) })],
    ['a manifest whose courses have no id', () => zipBlob({ 'data.json': JSON.stringify({ courses: [{ name: 'x' }], files: [], versions: [] }) })]
  ])('rejects %s with an InvalidBackupError, before writing anything', async (_label, makeInput) => {
    const before = await trackedCounts();

    const failure = await importAllData(await makeInput()).catch((err: unknown) => err);

    expect(failure).toBeInstanceOf(InvalidBackupError);
    expect((failure as Error).message).toMatch(/not a valid moodle archive backup/i);
    expect(await trackedCounts()).toEqual(before);
  });

  it('never persists hidden: true in the export — importing into an empty database leaves it visible', async () => {
    const { course } = await seedOneCourse();
    await courseStore.put({ ...course, hidden: true }); // hidden at export time

    let exportedBlob: Blob | undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      exportedBlob = blob;
      return 'blob:fake';
    });
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal('chrome', { downloads: { download: vi.fn().mockResolvedValue(1) } });

    await exportAllData();
    expect(exportedBlob).toBeDefined();

    await resetTrackedData(); // nothing local to match against by id
    await importAllData(exportedBlob!);

    const restored = await courseStore.get(course.id);
    expect(restored?.hidden).toBe(false);
  });

  it('keeps an imported course hidden when it is already hidden locally under that id', async () => {
    const { course } = await seedOneCourse(); // visible at export time

    let exportedBlob: Blob | undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      exportedBlob = blob;
      return 'blob:fake';
    });
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal('chrome', { downloads: { download: vi.fn().mockResolvedValue(1) } });

    await exportAllData();
    expect(exportedBlob).toBeDefined();

    // Hide the very same course record (same id) after the export was taken.
    await courseStore.put({ ...course, hidden: true });

    await importAllData(exportedBlob!);

    const restored = await courseStore.get(course.id);
    expect(restored?.hidden).toBe(true);
  });

  it('does not hide an imported course just because it was hidden at export time, when no local course shares its id', async () => {
    const { course } = await seedOneCourse();
    await courseStore.put({ ...course, hidden: true }); // hidden at export time

    let exportedBlob: Blob | undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      exportedBlob = blob;
      return 'blob:fake';
    });
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal('chrome', { downloads: { download: vi.fn().mockResolvedValue(1) } });

    await exportAllData();
    expect(exportedBlob).toBeDefined();

    // A local course exists here, but under a different id (and name) — no
    // match, so the imported course shouldn't inherit any hidden state from
    // it (or from its own hidden state at export time).
    await resetTrackedData();
    await courseStore.put({ ...course, id: crypto.randomUUID(), name: 'Something Else', hidden: true });
    await importAllData(exportedBlob!);

    const restored = await courseStore.get(course.id);
    expect(restored?.hidden).toBe(false);
  });
});

describe('importAllData merges an id-matched course instead of overwriting it wholesale', () => {
  beforeEach(resetTrackedData);

  it("keeps the local tag (name) — the imported course's own name never overwrites a local rename", async () => {
    // "Remote" export of course id "course-a" under its original name.
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Fisica',
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 1_000
    });
    const download = stubDownloadCapturingBlob();
    await exportAllData();
    expect(download.blob()).toBeDefined();

    // Locally, the *same course id* was already renamed to a custom tag.
    await resetTrackedData();
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Mi asignatura favorita',
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 1_000
    });

    await importAllData(download.blob()!);

    const restored = await courseStore.get('course-a');
    expect(restored?.name).toBe('Mi asignatura favorita'); // the local tag wins
  });

  it('diffs the latest imported content by hash, keeping the same course id (no duplicate)', async () => {
    // "Remote" install: same course id, notes.pdf has newer content.
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Fisica',
      relativePath: 'notes.pdf',
      sha256: 'hash-b',
      content: 'updated',
      timestamp: 2_000
    });
    const download = stubDownloadCapturingBlob();
    await exportAllData();
    expect(download.blob()).toBeDefined();

    // Local state: same course id, older content.
    await resetTrackedData();
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Fisica',
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 1_000
    });

    await importAllData(download.blob()!);

    const allCourses = await courseStore.all();
    expect(allCourses).toHaveLength(1); // no duplicate course

    const files = await fileStore.byCourse('course-a');
    expect(files).toHaveLength(1);
    expect(files[0].currentStatus).toBe('modified');

    const versions = await versionStore.byFile(files[0].id);
    expect(versions.map((v) => v.sha256).sort()).toEqual(['hash-a', 'hash-b']); // history kept
    const latest = versions.at(-1)!;
    expect(latest.sha256).toBe('hash-b');
    expect(await latest.content.text()).toBe('updated');
  });

  it('does not duplicate a version whose content is already known locally', async () => {
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Fisica',
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 2_000
    });
    const download = stubDownloadCapturingBlob();
    await exportAllData();

    await resetTrackedData();
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Fisica',
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 1_000
    });

    const summary = await importAllData(download.blob()!);
    expect(summary.versions).toBe(0); // identical content already known — nothing new stored

    const files = await fileStore.byCourse('course-a');
    expect(files[0].currentStatus).toBe('unchanged');
    expect(await versionStore.byFile(files[0].id)).toHaveLength(1); // no duplicate
  });

  it('merges matchedUrls and keeps the most recent lastSyncedAt', async () => {
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Fisica',
      matchedUrls: ['https://moodle.example/course/view.php?id=99'],
      lastSyncedAt: 5_000,
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 2_000
    });
    const download = stubDownloadCapturingBlob();
    await exportAllData();

    await resetTrackedData();
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Fisica',
      matchedUrls: ['https://moodle.example/course/view.php?id=1'],
      lastSyncedAt: 3_000,
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 1_000
    });

    await importAllData(download.blob()!);

    const merged = await courseStore.get('course-a');
    expect([...(merged?.matchedUrls ?? [])].sort()).toEqual([
      'https://moodle.example/course/view.php?id=1',
      'https://moodle.example/course/view.php?id=99'
    ]);
    expect(merged?.lastSyncedAt).toBe(5_000);
  });

  it('a different course name alone does not trigger a merge — only a matching id does', async () => {
    await seedCourseWithFile({
      courseId: 'course-b',
      name: 'Fisica', // same name as the local course below, but a different id
      relativePath: 'notes.pdf',
      sha256: 'hash-b',
      content: 'updated',
      timestamp: 2_000
    });
    const download = stubDownloadCapturingBlob();
    await exportAllData();

    await resetTrackedData();
    await seedCourseWithFile({
      courseId: 'course-a',
      name: 'Fisica',
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 1_000
    });

    await importAllData(download.blob()!);

    const allCourses = await courseStore.all();
    expect(allCourses.map((c) => c.id).sort()).toEqual(['course-a', 'course-b']); // two separate courses
    expect(allCourses.filter((c) => c.name === 'Fisica')).toHaveLength(2); // both keep the name "Fisica"
  });

  it('imports a brand-new course (no local id match) with its files as the baseline, not flagged "new"', async () => {
    await seedCourseWithFile({
      courseId: 'course-b',
      name: 'Brand New Course',
      relativePath: 'notes.pdf',
      sha256: 'hash-a',
      content: 'hello',
      timestamp: 2_000
    });
    const download = stubDownloadCapturingBlob();
    await exportAllData();

    await resetTrackedData();
    await importAllData(download.blob()!);

    const files = await fileStore.byCourse('course-b');
    expect(files[0].currentStatus).toBe('unchanged');

    const course = await courseStore.get('course-b');
    expect(course?.firstSyncCompleted).toBe(true);
    expect(course?.name).toBe('Brand New Course'); // no local record to preserve a tag from
  });
});
