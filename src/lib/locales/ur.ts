import type { Messages } from './en';

export const ur: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'از slvdr510',
    cancel: 'منسوخ کریں',
    save: 'محفوظ کریں',
    close: 'بند کریں',
    delete: 'حذف کریں',
    export: 'برآمد کریں',
    download: 'ڈاؤن لوڈ کریں',
    moreOptions: 'مزید اختیارات',
    exporting: 'برآمد ہو رہا ہے…',
    importing: 'درآمد ہو رہا ہے…',
    savedToDownloads: (name) => `"${name}" آپ کے ڈاؤن لوڈز فولڈر میں محفوظ ہو گیا۔`,
    couldNotExport: (name, error) => `"${name}" برآمد نہیں ہو سکا: ${error}`
  },

  header: {
    theme: 'تھیم',
    themeLight: 'ہلکا',
    themeSystem: 'سسٹم کے مطابق',
    themeDark: 'گہرا',
    language: 'زبان',
    languageAuto: 'براؤزر کی زبان'
  },

  relativeTime: {
    justNow: 'ابھی ابھی',
    minutes: (n) => `${n} منٹ پہلے`,
    hours: (n) => `${n} گھنٹے پہلے`,
    days: (n) => `${n} دن پہلے`,
    weeks: (n) => `${n} ہفتے پہلے`,
    months: (n) => `${n} ماہ پہلے`,
    years: (n) => `${n} سال پہلے`
  },

  status: {
    new: 'نیا',
    modified: 'ترمیم شدہ',
    deleted: 'حذف شدہ',
    unchanged: 'غیر تبدیل شدہ'
  },

  courses: {
    openAllUrls: 'تمام کورسز کے URL کھولیں',
    exportAll: 'تمام کورسز برآمد کریں',
    importCourses: 'کورسز درآمد کریں',
    recentSettings: 'حال ہی میں کھولی گئی فائلوں کی ترتیبات',
    downloadNameSettings: 'ڈاؤن لوڈ ناموں کی ترتیبات',
    sideMargin: 'اطراف کے حاشیے',
    hiddenCourses: 'چھپے ہوئے کورسز',
    deleteAll: 'تمام کورسز حذف کریں',
    backupSaved: 'بیک اپ آپ کے ڈاؤن لوڈز فولڈر میں محفوظ ہو گیا۔',
    couldNotExportAll: (error) => `برآمد نہیں ہو سکا: ${error}`,
    noUrlsToOpen: 'کھولنے کے لیے کوئی کورس URL نہیں۔',
    imported: (courses, files, versions) =>
      `${courses} کورس، ${files} فائلیں اور ${versions} ورژن درآمد ہو گئے۔`,
    notABackup: (name) => `"${name}" اس ایکسٹینشن کے کورس فارمیٹ والی zip فائل نہیں ہے۔`,
    couldNotImport: (details) => `درآمد نہیں ہو سکا: ${details}`,
    dropBackups: 'کورسز درآمد کرنے کے لیے ‎.zip بیک اپ یہاں چھوڑیں',
    exportAllTitle: 'تمام کورسز برآمد کریں؟',
    exportAllMessage: 'ہر ٹریک کیا گیا کورس، فائل اور ورژن ایک zip میں آپ کے ڈاؤن لوڈز فولڈر میں محفوظ ہو جائے گا۔',
    exportCourseTitle: (name) => `"${name}" برآمد کریں؟`,
    exportCourseMessage: 'کورس، اس کی فائلیں اور ہر ورژن ایک zip میں آپ کے ڈاؤن لوڈز فولڈر میں محفوظ ہو جائیں گے۔',
    deleteAllTitle: 'تمام کورسز حذف کریں؟',
    deleteAllMessage:
      'اس سے ایکسٹینشن کے ٹریک کیے گئے تمام کورسز، فائلیں اور ورژن کی تاریخ مٹ جائے گی۔ ' +
      'بعد میں کوئی کورس دوبارہ ڈاؤن لوڈ کریں تاکہ اس کی تاریخ پھر سے بننا شروع ہو۔',
    deleteCourseTitle: (name) => `"${name}" حذف کریں؟`,
    deleteCourseMessage:
      'اس سے کورس اور اس کی فائلوں اور ورژنز کی تاریخ ہٹ جائے گی۔ اگر آپ بعد میں یہ کورس دوبارہ ' +
      'ڈاؤن لوڈ کریں تو یہ شروع سے نئے سرے سے بن جائے گا۔',
    emptyTitle: 'ابھی کوئی کورس نہیں',
    emptySubtitle: 'کورس پہلی بار ڈاؤن لوڈ کرنے پر خود بخود بن جاتے ہیں۔',
    emptyStep1: 'Moodle میں کوئی کورس کھولیں',
    emptyStep2: 'ایکسٹینشن کے آئیکن پر کلک کریں',
    emptyStep3Before: '',
    emptyStep3After: ' دبائیں',
    emptyHintBefore: 'پہلے سے بیک اپ موجود ہے؟ اس کی ',
    emptyHintAfter: ' فائل اس صفحے پر کہیں بھی چھوڑیں تاکہ وہ درآمد ہو جائے۔',
    allHidden: 'آپ کے تمام کورسز چھپے ہوئے ہیں۔ کسی کو واپس لانے کے لیے ⋮ مینو میں "چھپے ہوئے کورسز" استعمال کریں۔'
  },

  courseRow: {
    lastDownloaded: 'آخری ڈاؤن لوڈ',
    openInMoodle: 'کورس Moodle میں کھولیں',
    setTagName: 'ٹیگ کا نام رکھیں',
    hideCourse: 'کورس چھپائیں',
    deleteCourse: 'کورس حذف کریں'
  },

  hiddenCourses: {
    title: 'چھپے ہوئے کورسز',
    none: 'کوئی کورس چھپا ہوا نہیں۔',
    unhide: 'دکھائیں'
  },

  courseFiles: {
    backToCourses: 'کورسز پر واپس جائیں',
    addFile: 'فائل شامل کریں…',
    couldNotRead: (fileCount, firstName, error) =>
      `${fileCount === 1 ? `"${firstName}"` : 'چھوڑی گئی فائلیں'} پڑھی نہیں جا سکیں — ہو سکتا ہے فائل منتقل یا حذف ` +
      `ہو گئی ہو، یا ابھی ڈاؤن لوڈ ہو رہی ہو۔ کسی مستقل جگہ سے دوبارہ کوشش کریں۔ (${error})`,
    couldNotAdd: (fileCount, error) => `${fileCount === 1 ? 'فائل' : 'فائلیں'} شامل نہیں ہو سکیں: ${error}`,
    dropFiles: (name) => `"${name}" میں شامل کرنے کے لیے فائلیں یہاں چھوڑیں`,
    searchPlaceholder: 'نام سے فائلیں تلاش کریں…',
    noMatches: (query) => `"${query}" سے کوئی فائل میل نہیں کھاتی۔`,
    noFiles: 'اس کورس کی ابھی کوئی فائل ڈاؤن لوڈ نہیں ہوئی۔'
  },

  fileRow: {
    viewHistory: 'ورژن کی تاریخ دیکھیں',
    lastSaved: (date) => `آخری بار محفوظ: ${date}`,
    manual: 'دستی',
    manualTitle: 'ہاتھ سے شامل کی گئی، Moodle سے ڈاؤن لوڈ نہیں ہوئی',
    deleteTitle: 'یہ فائل اپنی تاریخ سے حذف کریں',
    downloadTitle: 'اپنے ڈاؤن لوڈز فولڈر میں ڈاؤن لوڈ کریں',
    deleteConfirmTitle: (name) => `"${name}" حذف کریں؟`,
    deleteConfirmMessage:
      'اس سے فائل اور اس کے تمام محفوظ ورژن آپ کی تاریخ سے ہٹ جائیں گے۔ اگر یہ ابھی بھی Moodle میں ہے تو ' +
      'اس کورس کے اگلے ڈاؤن لوڈ میں یہ نئی فائل کے طور پر دوبارہ شامل ہو جائے گی۔'
  },

  folderRow: {
    deleteTitle: 'یہ فولڈر اپنی تاریخ سے حذف کریں',
    downloadTitle: 'یہ فولڈر zip کے طور پر ڈاؤن لوڈ کریں',
    couldNotDownload: (name, error) => `"${name}" ڈاؤن لوڈ نہیں ہو سکا: ${error}`,
    deleteConfirmTitle: (name) => `"${name}" حذف کریں؟`,
    deleteConfirmMessage: (fileCount) =>
      `اس سے فولڈر، اس کی ${fileCount} فائلیں اور ان کے تمام محفوظ ورژن آپ کی تاریخ سے ہٹ جائیں گے۔ ` +
      'جو کچھ ابھی بھی Moodle میں ہے وہ اگلی بار یہ کورس ڈاؤن لوڈ کرنے پر نئے کے طور پر دوبارہ شامل ہو جائے گا۔'
  },

  recentlyOpened: {
    title: 'حال ہی میں کھولی گئی',
    remove: 'حال ہی میں کھولی گئی فائلوں سے ہٹائیں'
  },

  recentSettings: {
    title: 'حال ہی میں کھولی گئی',
    appliesToAll: 'تمام کورسز پر لاگو ہوتا ہے۔',
    show: 'حال ہی میں کھولی گئی فائلیں دکھائیں',
    noLimit: 'کوئی حد نہیں',
    maximum: 'ہر کورس میں حال ہی میں کھولی گئی فائلوں کی زیادہ سے زیادہ تعداد'
  },

  downloadNames: {
    title: 'ڈاؤن لوڈ نام',
    description: 'تمام کورسز پر لاگو ہوتا ہے۔ بغیر ٹیگ والے کورسز کی فائلیں اپنے اصل نام سے ڈاؤن لوڈ ہوتی ہیں۔',
    prefixCourseTag: 'ڈاؤن لوڈ ناموں کے شروع میں کورس کا ٹیگ لگائیں (مثلاً TAG_file.pdf)'
  },

  sideMargin: {
    title: 'اطراف کے حاشیے',
    description:
      'بڑی کی گئی ونڈو میں مواد کے ہر طرف خالی جگہ، اسکرین کے حصے کے طور پر۔ چھوٹی ونڈو میں مواد یہی ' +
      'چوڑائی رکھتا ہے، پہلے حاشیے استعمال کرتا ہے اور پھر پوری ونڈو۔',
    label: (percent) => `ہر طرف ${percent}%`
  },

  upload: {
    titleOne: (name) => `"${name}" شامل کریں`,
    titleMany: (count) => `${count} فائلیں شامل کریں`,
    where: (count) => `${count === 1 ? 'اسے' : 'انہیں'} کہاں محفوظ کرنا چاہتے ہیں؟`,
    courseRoot: 'کورس کی جڑ',
    existingFolder: 'موجودہ فولڈر',
    newFolder: 'نیا فولڈر',
    folderNamePlaceholder: 'فولڈر کا نام',
    newFolderNameLabel: 'نئے فولڈر کا نام',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' اس فولڈر میں پہلے سے موجود ہے — نئی فائل اس کے نئے ورژن کے طور پر شامل ہو گی۔',
    add: 'شامل کریں',
    adding: 'شامل ہو رہا ہے…'
  },

  versions: {
    whichVersion: 'کون سا ورژن؟',
    downloadTitle: 'یہ ورژن اپنے ڈاؤن لوڈز فولڈر میں ڈاؤن لوڈ کریں',
    diffVsPrevious: 'پچھلے سے موازنہ',
    comparing: (from, to) => `موازنہ v${from} ← v${to}`,
    loadingDiff: 'فرق لوڈ ہو رہا ہے…',
    binaryChanged: 'بائنری فائل — مواد تبدیل ہو گیا۔',
    size: (from, to, delta) => `سائز: ${from} ← ${to} (${delta})`,
    deleteTitle: 'یہ ورژن حذف کریں',
    deleteConfirmTitle: (label) => `${label} حذف کریں؟`,
    deleteConfirmMessage:
      'یہ ورژن فائل کی تاریخ سے ہمیشہ کے لیے ہٹ جائے گا۔ باقی ورژن اور فائل خود باقی رہیں گے۔'
  },

  openFile: {
    downloadInterrupted: 'ڈاؤن لوڈ رک گیا۔',
    couldNotOpen: (filename, error) =>
      `"${filename}" ڈاؤن لوڈ ہو گئی، لیکن خود بخود کھل نہیں سکی (${error})۔\n\n` +
      'آپ اسے Chrome کے ڈاؤن لوڈز سے کھول سکتے ہیں (Ctrl+J / Cmd+Shift+J)۔ ' +
      'مشورہ: وہاں کسی ڈاؤن لوڈ پر رائٹ کلک کر کے "اس قسم کی فائلیں ہمیشہ کھولیں" منتخب کریں تاکہ ' +
      'آئندہ یہ خود بخود ہو۔'
  },

  backup: {
    courseNotFound: 'کورس نہیں ملا۔',
    invalid: (reason) => `یہ Moodle Archive کا درست بیک اپ نہیں ہے (${reason})۔`,
    notZip: 'zip فائل نہیں ہے',
    missingManifest: 'data.json موجود نہیں',
    invalidJson: 'data.json درست JSON نہیں ہے',
    noCourses: 'data.json میں کورسز کی تفصیل نہیں'
  },

  viewer: {
    notFoundTitle: 'فائل نہیں ملی',
    notFoundText: 'یہ فائل اب آپ کی Moodle Archive تاریخ میں نہیں ہے — شاید حذف ہو گئی ہو۔',
    cannotPreview: 'اس قسم کی فائل کا براؤزر میں پیش نظارہ نہیں ہو سکتا۔'
  },

  popup: {
    cannotScan: 'یہ صفحہ اسکین نہیں ہو سکتا — پہلے Moodle کورس کا ٹیب کھولیں۔',
    filesDownloaded: (count) => `${count} فائلیں ڈاؤن لوڈ ہوئیں`,
    downloading: 'ڈاؤن لوڈ ہو رہا ہے...',
    download: 'ڈاؤن لوڈ کریں',
    history: 'تاریخ',
    addToQueue: 'قطار میں شامل کریں',
    queued: (position) => `قطار میں (نمبر ${position})`,
    queueTitle: 'اگلا',
    removeFromQueue: 'قطار سے ہٹائیں'
  },

  download: {
    unsupportedUrl: (url) => `غیر معاون URL: ${url}۔`,
    processingLinks: 'لنکس پر کارروائی ہو رہی ہے...',
    processing: (url) => `${url} پر کارروائی ہو رہی ہے`,
    downloadingFiles: 'فائلیں ڈاؤن لوڈ ہو رہی ہیں...',
    downloadingFile: (name) => `${name} ڈاؤن لوڈ ہو رہی ہے`,
    cancelled: (name, reason) =>
      `ڈاؤن لوڈ منسوخ: "${name}" ڈاؤن لوڈ نہیں ہو سکی (${reason})۔ کچھ بھی محفوظ نہیں ہوا — دوبارہ کوشش کریں۔`,
    downloadFailed: 'ڈاؤن لوڈ ناکام ہو گیا',
    noResponse: 'جواب کا انتظار کرتے ہوئے وقت ختم ہو گیا',
    stalled: 'رکا ہوا: وقت پر کوئی ڈیٹا موصول نہیں ہوا',
    noFileFound: 'کوئی فائل نہیں ملی۔',
    saving: 'تاریخ میں محفوظ ہو رہا ہے...',
    savingChunk: (index, total) => `تاریخ میں محفوظ ہو رہا ہے... (${index}/${total})`,
    saved: 'تاریخ میں محفوظ ہو گیا۔',
    saveFailed: (reason) => `تاریخ میں محفوظ نہیں ہو سکا: ${reason}`,
    timedOut: 'جواب کا انتظار کرتے ہوئے وقت ختم ہو گیا — دوبارہ کوشش کریں',
    unknownError: 'نامعلوم خرابی',
    interrupted: 'ڈاؤن لوڈ رک گیا: ٹیب بند ہو گیا یا کسی اور صفحے پر چلا گیا۔',
    couldNotStart: (title) => `"${title}" شروع نہیں ہو سکا — اس کا ٹیب کھول کر دوبارہ کوشش کریں۔`
  }
};
