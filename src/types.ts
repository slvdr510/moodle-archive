export interface Course {
  id: string;
  name: string;
  url: string;
  /** Moodle course URLs (as crawled) known to belong to this course. */
  matchedUrls: string[];
  createdAt: number;
  /** When a download was last run for this course (regardless of whether any file changed). */
  lastSyncedAt: number;
  /** Manual sort position in the course list (lower = earlier) — set by drag-and-drop. */
  order: number;
  /** False until this course's first-ever download finishes. Every file in that
   *  first download is the baseline, not a "new" file relative to anything, so
   *  its files are stored as 'unchanged' rather than 'new' while this is false. */
  firstSyncCompleted: boolean;
  /** Hidden courses are left out of the main list and out of "Open all course
   *  URLs" — but still tracked normally otherwise (still shows up on the next
   *  download, still exportable, etc). Toggled from the course's own menu; see
   *  the "Show hidden courses" entry in the toolbar menu to unhide one. */
  hidden: boolean;
}

export type FileStatus = 'new' | 'modified' | 'deleted' | 'unchanged';

export interface FileRecord {
  id: string;
  courseId: string;
  /** Path of the file as crawled from Moodle, e.g. "Week1/notes.pdf". */
  relativePath: string;
  filename: string;
  currentStatus: FileStatus;
  deletedAt?: number;
  /** Added by hand (upload / drag-and-drop) rather than crawled from Moodle. Such a
   *  file is never in a Moodle snapshot, so a download must not mark it as deleted. */
  manual?: boolean;
}

export interface VersionRecord {
  id: string;
  fileId: string;
  sha256: string;
  size: number;
  /** When this version was captured (the moment it was downloaded from Moodle). */
  timestamp: number;
  /** The file's own bytes, stored directly in IndexedDB. */
  content: Blob;
}

export interface RecentOpenRecord {
  /** `${courseId}::${fileId}`, so re-opening a file updates its entry instead of duplicating it. */
  id: string;
  courseId: string;
  fileId: string;
  relativePath: string;
  filename: string;
  openedAt: number;
}

/** One file crawled from Moodle, ready to be diffed/stored as a version. */
export interface ExtractedEntry {
  relativePath: string;
  content: Uint8Array;
  sha256: string;
  size: number;
}
