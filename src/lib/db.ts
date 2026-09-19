import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Course, FileRecord, RecentOpenRecord, VersionRecord } from '../types';

interface MoodleHistoryDB extends DBSchema {
  courses: { key: string; value: Course };
  files: {
    key: string;
    value: FileRecord;
    indexes: { 'by-course': string };
  };
  versions: {
    key: string;
    value: VersionRecord;
    indexes: { 'by-file': string };
  };
  recentOpens: {
    key: string;
    value: RecentOpenRecord;
    indexes: { 'by-course': string };
  };
}

const DB_NAME = 'moodle-archive';
// The project (and this database) used to be named "moodle-history". Kept only
// as a one-time migration source — see `migrateFromLegacyDatabase` — never
// written to again.
const LEGACY_DB_NAME = 'moodle-history';
const DB_VERSION = 4;
const RECENT_OPENS_LIMIT = 5;

let dbPromise: Promise<IDBPDatabase<MoodleHistoryDB>> | undefined;

function getDb(): Promise<IDBPDatabase<MoodleHistoryDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MoodleHistoryDB>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, transaction) {
        const rawDb = db as unknown as IDBDatabase;
        if (oldVersion < 1) {
          db.createObjectStore('courses', { keyPath: 'id' });

          const files = db.createObjectStore('files', { keyPath: 'id' });
          files.createIndex('by-course', 'courseId');

          const versions = db.createObjectStore('versions', { keyPath: 'id' });
          versions.createIndex('by-file', 'fileId');

          rawDb.createObjectStore('processedZips', { keyPath: 'id' });
          rawDb.createObjectStore('config', { keyPath: 'key' });
        }
        if (oldVersion < 2 && rawDb.objectStoreNames.contains('unassignedZips')) {
          // Replaced by auto-creating a course straight from the zip name.
          rawDb.deleteObjectStore('unassignedZips');
        }
        if (oldVersion < 3) {
          const recentOpens = db.createObjectStore('recentOpens', { keyPath: 'id' });
          recentOpens.createIndex('by-course', 'courseId');
        }
        if (oldVersion < 4) {
          // Folder-watching flow (zip scanning + on-disk repository) is gone —
          // versions now carry their own content as a Blob, and there's no more
          // watched-folder config to remember. Old `versions` rows predate the
          // `content` field and have no bytes to fall back on, so they're wiped
          // outright (unlike `files`/`courses`, which stay meaningful as-is and
          // get properly re-versioned the next time that course is downloaded).
          await transaction.objectStore('versions').clear();
          for (const name of ['processedZips', 'config']) {
            if (rawDb.objectStoreNames.contains(name)) {
              rawDb.deleteObjectStore(name);
            }
          }
        }
      }
    }).then(async (db) => {
      await migrateFromLegacyDatabase(db);
      return db;
    });
  }
  return dbPromise;
}

/**
 * One-time carry-over for anyone who already had courses tracked under the
 * project's old name ("moodle-history"): if that database still exists and
 * this new one is empty, copy everything across. The old database is left
 * alone (not deleted) so nothing is lost if a copy step here ever misbehaves.
 */
async function migrateFromLegacyDatabase(db: IDBPDatabase<MoodleHistoryDB>): Promise<void> {
  if (typeof indexedDB.databases !== 'function') return; // not available in every environment

  const alreadyHasData = (await db.count('courses')) > 0;
  if (alreadyHasData) return;

  const existingDatabases = await indexedDB.databases();
  if (!existingDatabases.some((d) => d.name === LEGACY_DB_NAME)) return;

  const legacyDb = await openDB(LEGACY_DB_NAME);
  try {
    for (const storeName of ['courses', 'files', 'recentOpens'] as const) {
      if (!legacyDb.objectStoreNames.contains(storeName)) continue;
      const records = await legacyDb.getAll(storeName);
      const tx = db.transaction(storeName, 'readwrite');
      await Promise.all([...records.map((record) => tx.store.put(record)), tx.done]);
    }

    if (legacyDb.objectStoreNames.contains('versions')) {
      // Versions from before the on-disk "repository" folder was replaced by
      // storing content directly have no `content` Blob to carry over — skip
      // those rather than copying forward a version nothing can ever open.
      const records: VersionRecord[] = await legacyDb.getAll('versions');
      const usable = records.filter((record) => record.content !== undefined);
      const tx = db.transaction('versions', 'readwrite');
      await Promise.all([...usable.map((record) => tx.store.put(record)), tx.done]);
    }
  } finally {
    legacyDb.close();
  }
}

// Courses tracked before the switch to URL-based matching were stored with a
// `matchedZipNames` field instead of `matchedUrls` — IndexedDB doesn't reshape
// existing records just because the app's type changed. Normalize on read so
// those pre-existing rows don't crash `.includes()` calls downstream.
function normalizeCourse(course: Course): Course {
  const withUrls = course.matchedUrls ? course : { ...course, matchedUrls: [] };
  // Courses tracked before `lastSyncedAt` existed don't have it either — fall
  // back to their creation time, which is the closest thing we know.
  const withSyncedAt = withUrls.lastSyncedAt ? withUrls : { ...withUrls, lastSyncedAt: withUrls.createdAt };
  // Courses tracked before manual drag-and-drop ordering existed sort by creation
  // time instead, which is what they were implicitly ordered by anyway.
  const withOrder =
    typeof withSyncedAt.order === 'number' ? withSyncedAt : { ...withSyncedAt, order: withSyncedAt.createdAt };
  // Courses tracked before this flag existed have necessarily already been synced
  // at least once — treat them as past their first sync rather than replaying
  // first-sync suppression on their next download.
  const withFirstSync =
    typeof withOrder.firstSyncCompleted === 'boolean' ? withOrder : { ...withOrder, firstSyncCompleted: true };
  // Courses tracked before hiding existed were never hidden.
  return typeof withFirstSync.hidden === 'boolean' ? withFirstSync : { ...withFirstSync, hidden: false };
}

export const courseStore = {
  async all(): Promise<Course[]> {
    const courses = await (await getDb()).getAll('courses');
    return courses.map(normalizeCourse);
  },
  async put(course: Course): Promise<void> {
    await (await getDb()).put('courses', course);
  },
  async remove(id: string): Promise<void> {
    await (await getDb()).delete('courses', id);
  },
  async get(id: string): Promise<Course | undefined> {
    const course = await (await getDb()).get('courses', id);
    return course ? normalizeCourse(course) : undefined;
  }
};

export const fileStore = {
  async byCourse(courseId: string): Promise<FileRecord[]> {
    return (await getDb()).getAllFromIndex('files', 'by-course', courseId);
  },
  async put(file: FileRecord): Promise<void> {
    await (await getDb()).put('files', file);
  },
  async get(id: string): Promise<FileRecord | undefined> {
    return (await getDb()).get('files', id);
  },
  async remove(id: string): Promise<void> {
    await (await getDb()).delete('files', id);
  }
};

export const versionStore = {
  async byFile(fileId: string): Promise<VersionRecord[]> {
    const versions = await (await getDb()).getAllFromIndex('versions', 'by-file', fileId);
    return versions.sort((a, b) => a.timestamp - b.timestamp);
  },
  async put(version: VersionRecord): Promise<void> {
    await (await getDb()).put('versions', version);
  },
  async removeByFile(fileId: string): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('versions', 'readwrite');
    const keys = await tx.store.index('by-file').getAllKeys(fileId);
    await Promise.all([...keys.map((key) => tx.store.delete(key)), tx.done]);
  }
};

export const recentOpenStore = {
  async all(): Promise<RecentOpenRecord[]> {
    return (await getDb()).getAll('recentOpens');
  },
  /** Most recently opened files for a course, newest first. */
  async byCourse(courseId: string): Promise<RecentOpenRecord[]> {
    const all = await (await getDb()).getAllFromIndex('recentOpens', 'by-course', courseId);
    return all.sort((a, b) => b.openedAt - a.openedAt).slice(0, RECENT_OPENS_LIMIT);
  },
  /** Records that a file was just opened, keeping only the most recent entries per course. */
  async recordOpen(record: RecentOpenRecord): Promise<void> {
    const db = await getDb();
    await db.put('recentOpens', record);

    const all = await db.getAllFromIndex('recentOpens', 'by-course', record.courseId);
    const stale = all.sort((a, b) => b.openedAt - a.openedAt).slice(RECENT_OPENS_LIMIT);
    if (stale.length > 0) {
      const tx = db.transaction('recentOpens', 'readwrite');
      await Promise.all([...stale.map((r) => tx.store.delete(r.id)), tx.done]);
    }
  },
  async remove(id: string): Promise<void> {
    await (await getDb()).delete('recentOpens', id);
  }
};

/**
 * Deletes a course along with its tracked file/version metadata.
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const files = await fileStore.byCourse(courseId);
  for (const file of files) {
    await versionStore.removeByFile(file.id);
    await fileStore.remove(file.id);
  }
  await courseStore.remove(courseId);
}

/**
 * Wipes every tracked course, file, version, and recent-open record. The next
 * download from Moodle will simply re-create the course and start tracking
 * from scratch.
 */
export async function resetTrackedData(): Promise<void> {
  const db = await getDb();
  const storeNames = ['courses', 'files', 'versions', 'recentOpens'] as const;
  const tx = db.transaction(storeNames, 'readwrite');
  await Promise.all([...storeNames.map((name) => tx.objectStore(name).clear()), tx.done]);
}
