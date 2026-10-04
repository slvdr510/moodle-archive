/**
 * Every user-facing string in the app. Other locales (es.ts, ...) are typed as
 * `Messages`, so a missing or misspelled key there is a compile error. Strings that
 * embed values are functions; strings that wrap markup (a <strong>, ...) are split
 * into the text before and after it.
 */
export const en = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'by slvdr510',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    delete: 'Delete',
    export: 'Export',
    download: 'Download',
    moreOptions: 'More options',
    exporting: 'Exporting…',
    importing: 'Importing…',
    savedToDownloads: (name: string) => `"${name}" saved to your Downloads folder.`,
    couldNotExport: (name: string, error: string) => `Could not export "${name}": ${error}`
  },

  header: {
    theme: 'Theme',
    themeLight: 'Light',
    themeSystem: 'Match system',
    themeDark: 'Dark',
    language: 'Language',
    languageAuto: 'Browser language'
  },

  relativeTime: {
    justNow: 'just now',
    minutes: (n: number) => `${n}m ago`,
    hours: (n: number) => `${n}h ago`,
    days: (n: number) => `${n}d ago`,
    weeks: (n: number) => `${n}w ago`,
    months: (n: number) => `${n}mo ago`,
    years: (n: number) => `${n}y ago`
  },

  status: {
    new: 'New',
    modified: 'Modified',
    deleted: 'Deleted',
    unchanged: 'Unchanged'
  },

  courses: {
    openAllUrls: 'Open all course URLs',
    exportAll: 'Export all courses',
    importCourses: 'Import course(s)',
    recentSettings: 'Recently opened settings',
    downloadNameSettings: 'Download name settings',
    sideMargin: 'Side margins',
    hiddenCourses: 'Hidden courses',
    deleteAll: 'Delete all courses',
    backupSaved: 'Backup saved to your Downloads folder.',
    couldNotExportAll: (error: string) => `Could not export: ${error}`,
    noUrlsToOpen: 'No course URLs to open.',
    imported: (courses: number, files: number, versions: number) =>
      `Imported ${courses} course(s), ${files} file(s), ${versions} version(s).`,
    notABackup: (name: string) => `"${name}" is not a zip file in the course format used by this extension.`,
    couldNotImport: (details: string) => `Could not import ${details}`,
    dropBackups: 'Drop .zip backups to import their courses',
    exportAllTitle: 'Export all courses?',
    exportAllMessage: 'Every tracked course, file, and version will be saved to a single zip in your Downloads folder.',
    exportCourseTitle: (name: string) => `Export "${name}"?`,
    exportCourseMessage: 'The course, its files, and every version will be saved to a zip in your Downloads folder.',
    deleteAllTitle: 'Delete all courses?',
    deleteAllMessage:
      'This clears every course, file, and version history tracked by the extension. ' +
      'Download a course again afterwards to start rebuilding its history.',
    deleteCourseTitle: (name: string) => `Delete "${name}"?`,
    deleteCourseMessage:
      'This removes it and its tracked file/version history. If you download this course ' +
      'again later, it will just be re-created from scratch.',
    emptyTitle: 'No courses yet',
    emptySubtitle: 'Courses are created automatically the first time you download one.',
    emptyStep1: 'Open a course in Moodle',
    emptyStep2: 'Click the extension icon',
    /** Wraps the popup's "Download" button label, shown in bold. */
    emptyStep3Before: 'Press ',
    emptyStep3After: '',
    /** Wraps ".zip", shown in bold. */
    emptyHintBefore: 'Already have a backup? Drop its ',
    emptyHintAfter: ' anywhere on this page to import it.',
    allHidden: 'All your courses are hidden. Use "Hidden courses" in the ⋮ menu to bring one back.'
  },

  courseRow: {
    lastDownloaded: 'Last downloaded',
    openInMoodle: 'Open the course in Moodle',
    setTagName: 'Set tag name',
    hideCourse: 'Hide course',
    deleteCourse: 'Delete course'
  },

  hiddenCourses: {
    title: 'Hidden courses',
    none: 'No courses are hidden.',
    unhide: 'Unhide'
  },

  courseFiles: {
    backToCourses: 'Back to courses',
    addFile: 'Add file…',
    couldNotRead: (fileCount: number, firstName: string, error: string) =>
      `Could not read ${fileCount === 1 ? `"${firstName}"` : 'the dropped files'} — the file may have been moved or ` +
      `deleted, or it is still being downloaded. Try again from a stable location. (${error})`,
    couldNotAdd: (fileCount: number, error: string) => `Could not add the file${fileCount === 1 ? '' : 's'}: ${error}`,
    dropFiles: (name: string) => `Drop files to add them to "${name}"`,
    searchPlaceholder: 'Search files by name…',
    noMatches: (query: string) => `No files match "${query}".`,
    noFiles: 'No files downloaded yet for this course.'
  },

  fileRow: {
    viewHistory: 'View version history',
    lastSaved: (date: string) => `Last saved: ${date}`,
    manual: 'Manual',
    manualTitle: 'Added by hand, not downloaded from Moodle',
    deleteTitle: 'Delete this file from your history',
    downloadTitle: 'Download to your Downloads folder',
    deleteConfirmTitle: (name: string) => `Delete "${name}"?`,
    deleteConfirmMessage:
      'This removes the file and all of its saved versions from your history. If it is still in Moodle, ' +
      'the next download of this course will add it back as a new file.'
  },

  folderRow: {
    deleteTitle: 'Delete this folder from your history',
    downloadTitle: 'Download this folder as a zip',
    couldNotDownload: (name: string, error: string) => `Could not download "${name}": ${error}`,
    deleteConfirmTitle: (name: string) => `Delete "${name}"?`,
    deleteConfirmMessage: (fileCount: number) =>
      `This removes the folder, its ${fileCount} file${fileCount === 1 ? '' : 's'} and all of their saved versions ` +
      'from your history. Anything that is still in Moodle will be added back as new the next time you download this course.'
  },

  recentlyOpened: {
    title: 'Recently opened',
    remove: 'Remove from recently opened'
  },

  recentSettings: {
    title: 'Recently opened',
    appliesToAll: 'Applies to every course.',
    show: 'Show recently opened files',
    noLimit: 'No limit',
    maximum: 'Maximum recently opened files per course'
  },

  downloadNames: {
    title: 'Download names',
    description: "Applies to every course. Courses without a tag are downloaded under the file's own name.",
    prefixCourseTag: 'Add the course tag to the start of download names (e.g. TAG_file.pdf)'
  },

  sideMargin: {
    title: 'Side margins',
    description:
      'Empty space on each side of the content in a maximized window, as a share of the screen. The content ' +
      'keeps that width in a smaller window, using up the margins first and then the whole window.',
    label: (percent: number) => `${percent}% on each side`
  },

  upload: {
    titleOne: (name: string) => `Add "${name}"`,
    titleMany: (count: number) => `Add ${count} files`,
    where: (count: number) => `Where do you want to save ${count === 1 ? 'it' : 'them'}?`,
    courseRoot: 'Course root',
    existingFolder: 'Existing folder',
    newFolder: 'New folder',
    folderNamePlaceholder: 'Folder name',
    newFolderNameLabel: 'New folder name',
    /** Wraps the clashing filename, shown in bold. */
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' already exists in this folder — the new file will be added as a new version of it.',
    add: 'Add',
    adding: 'Adding…'
  },

  versions: {
    whichVersion: 'Which version?',
    downloadTitle: 'Download this version to your Downloads folder',
    diffVsPrevious: 'Diff vs previous',
    comparing: (from: number, to: number) => `Comparing v${from} → v${to}`,
    loadingDiff: 'Loading diff…',
    binaryChanged: 'Binary file — content changed.',
    size: (from: string, to: string, delta: string) => `Size: ${from} → ${to} (${delta})`,
    deleteTitle: 'Delete this version',
    deleteConfirmTitle: (label: string) => `Delete ${label}?`,
    deleteConfirmMessage:
      "This version is removed from the file's history for good. The other versions stay, and so does the file."
  },

  openFile: {
    downloadInterrupted: 'The download was interrupted.',
    couldNotOpen: (filename: string, error: string) =>
      `Downloaded "${filename}", but couldn't open it automatically (${error}).\n\n` +
      "You can open it from Chrome's downloads (Ctrl+J / Cmd+Shift+J). " +
      'Tip: right-click a download there and choose "Always open files of this type" so this ' +
      'happens automatically from now on.'
  },

  backup: {
    courseNotFound: 'Course not found.',
    invalid: (reason: string) => `Not a valid Moodle Archive backup (${reason}).`,
    notZip: 'not a zip file',
    missingManifest: 'missing data.json',
    invalidJson: 'data.json is not valid JSON',
    noCourses: 'data.json does not describe courses'
  },

  viewer: {
    notFoundTitle: 'File not found',
    notFoundText: 'This file is no longer in your Moodle Archive history — it may have been deleted.',
    cannotPreview: 'This kind of file can’t be previewed in the browser.'
  },

  popup: {
    cannotScan: 'This page cannot be scanned — open a Moodle course tab first.',
    filesDownloaded: (count: number) => `${count} file(s) downloaded`,
    downloading: 'Downloading...',
    download: 'Download',
    history: 'History',
    addToQueue: 'Add to queue',
    queued: (position: number) => `Queued (#${position})`,
    queueTitle: 'Up next',
    removeFromQueue: 'Remove from queue'
  },

  /** Progress lines shown in the popup while a course downloads. */
  download: {
    unsupportedUrl: (url: string) => `Unsupported url: ${url}.`,
    processingLinks: 'Processing links...',
    processing: (url: string) => `Processing ${url}`,
    downloadingFiles: 'Downloading files...',
    downloadingFile: (name: string) => `Downloading ${name}`,
    cancelled: (name: string, reason: string) =>
      `Download cancelled: could not download "${name}" (${reason}). Nothing was saved — try again.`,
    downloadFailed: 'download failed',
    noResponse: 'Timed out waiting for a response',
    stalled: 'Stalled: no data received in time',
    noFileFound: 'No file found.',
    saving: 'Saving to history...',
    savingChunk: (index: number, total: number) => `Saving to history... (${index}/${total})`,
    saved: 'Saved to history.',
    saveFailed: (reason: string) => `Could not save to history: ${reason}`,
    timedOut: 'timed out waiting for a response — try again',
    unknownError: 'unknown error',
    interrupted: 'Download interrupted: the tab was closed or navigated away.',
    couldNotStart: (title: string) => `Could not start "${title}" — open its tab and try again.`
  }
};

export type Messages = typeof en;
