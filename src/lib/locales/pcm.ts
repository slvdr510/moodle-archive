import type { Messages } from './en';

/** Nigerian Pidgin (Naijá). */
export const pcm: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'na slvdr510 make am',
    cancel: 'Cancel',
    save: 'Save am',
    close: 'Close',
    delete: 'Comot am',
    export: 'Export',
    download: 'Download',
    moreOptions: 'More options',
    exporting: 'E dey export…',
    importing: 'E dey import…',
    savedToDownloads: (name) => `"${name}" don save for your Downloads folder.`,
    couldNotExport: (name, error) => `We no fit export "${name}": ${error}`
  },

  header: {
    theme: 'Theme',
    themeLight: 'Light',
    themeSystem: 'Follow system',
    themeDark: 'Dark',
    language: 'Language',
    languageAuto: 'Browser language'
  },

  relativeTime: {
    justNow: 'just now',
    minutes: (n) => `${n} min wey don pass`,
    hours: (n) => `${n} hour wey don pass`,
    days: (n) => `${n} day wey don pass`,
    weeks: (n) => `${n} week wey don pass`,
    months: (n) => `${n} month wey don pass`,
    years: (n) => `${n} year wey don pass`
  },

  status: {
    new: 'New',
    modified: 'E don change',
    deleted: 'E don comot',
    unchanged: 'E no change'
  },

  courses: {
    openAllUrls: 'Open all di course URL dem',
    exportAll: 'Export all di courses',
    importCourses: 'Import course(s)',
    recentSettings: 'Settings for di ones wey you open recently',
    downloadNameSettings: 'Settings for download name',
    sideMargin: 'Side margin dem',
    courseListStyle: 'How di course list go look',
    setInstitution: 'Set institution for courses',
    hiddenCourses: 'Courses wey you hide',
    deleteAll: 'Comot all di courses',
    backupSaved: 'Backup don save for your Downloads folder.',
    couldNotExportAll: (error) => `We no fit export: ${error}`,
    noUrlsToOpen: 'No course URL dey to open.',
    imported: (courses, files, versions) =>
      `We don import ${courses} course(s), ${files} file(s), ${versions} version(s).`,
    notABackup: (name) => `"${name}" no be zip file wey get di course format wey dis extension dey use.`,
    couldNotImport: (details) => `We no fit import ${details}`,
    dropBackups: 'Drop .zip backup dem here make we import dia courses',
    exportAllTitle: 'Make we export all di courses?',
    exportAllMessage: 'Every course, file and version wey we dey track go save inside one zip for your Downloads folder.',
    exportCourseTitle: (name) => `Make we export "${name}"?`,
    exportCourseMessage: 'Di course, im files and every version go save inside one zip for your Downloads folder.',
    deleteAllTitle: 'Make we comot all di courses?',
    deleteAllMessage:
      'Dis one go clear every course, file and version history wey di extension dey track. ' +
      'Download one course again after to start to build im history again.',
    deleteCourseTitle: (name) => `Make we comot "${name}"?`,
    deleteCourseMessage:
      'Dis one go comot di course and im file/version history. If you download dis course ' +
      'again later, e go just start fresh from scratch.',
    emptyTitle: 'No course dey yet',
    emptySubtitle: 'Courses go create by demself di first time wey you download one.',
    emptyStep1: 'Open one course for Moodle',
    emptyStep2: 'Click di extension icon',
    emptyStep3Before: 'Press ',
    emptyStep3After: '',
    emptyHintBefore: 'You don get backup before? Drop im ',
    emptyHintAfter: ' anywhere for dis page make we import am.',
    allHidden: 'All your courses don hide. Use "Courses wey you hide" for di ⋮ menu to bring one back.'
  },

  courseRow: {
    lastDownloaded: 'Last time wey you download',
    openInMoodle: 'Open di course for Moodle',
    setTagName: 'Set tag (short name)',
    setFullName: 'Set full name',
    tagPlaceholder: 'Short name, like OS',
    fullNamePlaceholder: 'Full name (empty: di one from Moodle)',
    setInstitution: 'Set institution (short name)',
    institutionPlaceholder: 'Institution short name, like UHU',
    institution: 'Institution',
    changeColor: 'Change color',
    hideCourse: 'Hide course',
    deleteCourse: 'Comot course'
  },

  hiddenCourses: {
    title: 'Courses wey you hide',
    none: 'No course dey hide.',
    unhide: 'Show am'
  },

  courseFiles: {
    backToCourses: 'Go back to courses',
    addFile: 'Add file…',
    ignoredFiles: 'Files wey you dey ignore',
    couldNotRead: (fileCount, firstName, error) =>
      `We no fit read ${fileCount === 1 ? `"${firstName}"` : 'di files wey you drop'} — maybe dem don move am or ` +
      `delete am, or e still dey download. Try again from one place wey no dey change. (${error})`,
    couldNotAdd: (fileCount, error) => `We no fit add di file${fileCount === 1 ? '' : 's'}: ${error}`,
    dropFiles: (name) => `Drop files here make we add dem to "${name}"`,
    searchPlaceholder: 'Find files by name…',
    noMatches: (query) => `No file match "${query}".`,
    noFiles: 'You never download any file for dis course yet.'
  },

  fileRow: {
    viewHistory: 'See version history',
    lastSaved: (date) => `Last time wey e save: ${date}`,
    manual: 'By hand',
    manualTitle: 'You add am by hand, e no come from Moodle',
    ignored: 'Ignored',
    ignoredTitle: 'Download no go touch dis file',
    ignoreTitle: 'Ignore changes for dis file',
    unignoreTitle: 'Stop to ignore dis file',
    ignoredWithFolderTitle: 'You dey ignore am with im folder',
    deleteTitle: 'Comot dis file from your history',
    downloadTitle: 'Download am go your Downloads folder',
    deleteConfirmTitle: (name) => `Make we comot "${name}"?`,
    deleteConfirmMessage:
      'Dis one go comot di file and all im saved versions from your history. If e still dey Moodle, ' +
      'di next time wey you download dis course go add am back as new file.'
  },

  folderRow: {
    ignoreTitle: 'Ignore dis folder and everything wey dey inside',
    unignoreTitle: 'Stop to ignore dis folder',
    ignoredTitle: 'Download no go touch dis folder and everything wey dey inside',
    deleteTitle: 'Comot dis folder from your history',
    downloadTitle: 'Download dis folder as zip',
    couldNotDownload: (name, error) => `We no fit download "${name}": ${error}`,
    deleteConfirmTitle: (name) => `Make we comot "${name}"?`,
    deleteConfirmMessage: (fileCount) =>
      `Dis one go comot di folder, im ${fileCount} file${fileCount === 1 ? '' : 's'} and all dia saved versions ` +
      'from your history. Anything wey still dey Moodle go come back as new di next time wey you download dis course.'
  },

  recentlyOpened: {
    title: 'Wetin you open recently',
    remove: 'Comot am from wetin you open recently',
    showAll: 'Show all di ones wey you open recently'
  },

  recentSettings: {
    title: 'Wetin you open recently',
    appliesToAll: 'E dey work for every course.',
    show: 'Show files wey you open recently',
    noLimit: 'No limit',
    maximum: 'Maximum number of recently opened files for each course'
  },

  downloadNames: {
    title: 'Download names',
    description: 'E dey work for every course. Courses wey no get tag go download with di file own name.',
    prefixCourseTag: 'Put di course tag for di front of download names (like TAG_file.pdf)'
  },

  sideMargin: {
    title: 'Side margin dem',
    description:
      'Empty space for each side of di content when di window full screen, as part of di screen. For smaller ' +
      'window, di content go keep dat width — e go first use di margins, then di whole window.',
    label: (percent) => `${percent}% for each side`
  },

  courseListStyle: {
    title: 'How di course list go look',
    description: 'How courses go show for dis page.',
    cards: 'Cards',
    rows: 'Lines'
  },

  courseColor: {
    title: (name) => `Di color for "${name}"`,
    palette: 'Colors',
    custom: 'Your own color',
    automatic: 'Use di automatic color'
  },

  setInstitution: {
    title: 'Set institution',
    description: 'Choose di courses wey go get dis institution. Leave am empty to comot am from dem.',
    courses: (count) => (count === 0 ? 'Courses' : `Courses (${count} selected)`),
    selectAll: 'Select all',
    selectNone: 'Select none',
    hidden: 'Hidden',
    apply: (count) => (count === 1 ? 'Apply to 1 course' : `Apply to ${count} courses`),
    remove: (count) => (count === 1 ? 'Comot from 1 course' : `Comot from ${count} courses`)
  },

  ignoredFiles: {
    title: 'Files wey you dey ignore',
    description:
      'Download no go touch dis files: no new version, dem no go ever mark am as deleted, and if dem never dey track am, dem no go add am.',
    pathLabel: 'File path',
    placeholder: 'Folder/file.pdf',
    hint:
      'Put di extension and di folders wey e dey inside: file wey dey di course root na just im name. Files wey get di same name for different folders na different files. End di path with / to ignore one whole folder with everything wey dey inside.',
    add: 'Add',
    folder: 'Folder',
    remove: (path) => `Stop to ignore ${path}`,
    empty: 'No file wey you dey ignore.',
    duplicate: 'Dat file don already dey di list.',
    notFound: 'E never dey dis course',
    askDeleteTitle: (count, name) => (count === 1 ? `You don dey ignore "${name}" now` : `You don dey ignore ${count} files now`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'Download no go touch am. You wan also delete am from dis course, plus all di versions wey you save? As long as you dey ignore am, next download no go add am back.'
        : 'Download no go touch dem. You wan also delete dem from dis course, plus all di versions wey you save? As long as you dey ignore dem, next download no go add dem back.',
    keep: (count) => (count === 1 ? 'Keep am' : 'Keep dem')
  },

  upload: {
    titleOne: (name) => `Add "${name}"`,
    titleMany: (count) => `Add ${count} files`,
    where: (count) => `Where you wan save ${count === 1 ? 'am' : 'dem'}?`,
    courseRoot: 'Course root',
    existingFolder: 'Folder wey dey already',
    newFolder: 'New folder',
    folderNamePlaceholder: 'Folder name',
    newFolderNameLabel: 'New folder name',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' dey dis folder already — di new file go enter as new version of am.',
    add: 'Add',
    adding: 'E dey add…'
  },

  versions: {
    whichVersion: 'Which version?',
    downloadTitle: 'Download dis version go your Downloads folder',
    diffVsPrevious: 'Compare am with di one before',
    comparing: (from, to) => `E dey compare v${from} → v${to}`,
    loadingDiff: 'E dey load di difference…',
    binaryChanged: 'Binary file — di content don change.',
    size: (from, to, delta) => `Size: ${from} → ${to} (${delta})`,
    deleteTitle: 'Comot dis version',
    deleteConfirmTitle: (label) => `Make we comot ${label}?`,
    deleteConfirmMessage:
      'Dis version go comot from di file history forever. Di other versions and di file itself go still dey.'
  },

  openFile: {
    downloadInterrupted: 'Di download cut.',
    couldNotOpen: (filename, error) =>
      `"${filename}" don download, but we no fit open am by imself (${error}).\n\n` +
      'You fit open am from Chrome downloads (Ctrl+J / Cmd+Shift+J). ' +
      'Tip: right-click one download for there and choose "Always open files of this type" so e go dey ' +
      'happen by imself from now.'
  },

  backup: {
    courseNotFound: 'We no see di course.',
    invalid: (reason) => `Dis one no be correct Moodle Archive backup (${reason}).`,
    notZip: 'e no be zip file',
    missingManifest: 'data.json no dey',
    invalidJson: 'data.json no be correct JSON',
    noCourses: 'data.json no talk about any course'
  },

  viewer: {
    notFoundTitle: 'We no see di file',
    notFoundText: 'Dis file no dey your Moodle Archive history again — maybe dem don delete am.',
    cannotPreview: 'You no fit preview dis kain file for browser.',
    zoomOut: 'Make am small',
    zoomIn: 'Make am big',
    fitVertically: 'Make am fit up-and-down',
    fitHorizontally: 'Make am fit side-to-side'
  },

  popup: {
    cannotScan: 'We no fit scan dis page — open one Moodle course tab first.',
    filesDownloaded: (count) => `${count} file(s) don download`,
    downloading: 'E dey download...',
    download: 'Download',
    history: 'History',
    addToQueue: 'Add am to queue',
    queued: (position) => `E dey queue (#${position})`,
    queueTitle: 'Next ones',
    removeFromQueue: 'Comot am from queue'
  },

  download: {
    unsupportedUrl: (url) => `We no dey support dis URL: ${url}.`,
    processingLinks: 'E dey process di links...',
    processing: (url) => `E dey process ${url}`,
    downloadingFiles: 'E dey download files...',
    downloadingFile: (name) => `E dey download ${name}`,
    cancelled: (name, reason) =>
      `Download don cancel: we no fit download "${name}" (${reason}). Nothing save — try again.`,
    downloadFailed: 'download no work',
    noResponse: 'Time don pass while we dey wait for answer',
    stalled: 'E don hang: no data reach on time',
    noFileFound: 'We no see any file.',
    saving: 'E dey save for history...',
    savingChunk: (index, total) => `E dey save for history... (${index}/${total})`,
    saved: 'E don save for history.',
    saveFailed: (reason) => `We no fit save am for history: ${reason}`,
    timedOut: 'time don pass while we dey wait for answer — try again',
    unknownError: 'error wey we no sabi',
    interrupted: 'Download cut: dem close di tab or e go another page.',
    couldNotStart: (title) => `We no fit start "${title}" — open im tab and try again.`
  }
};
