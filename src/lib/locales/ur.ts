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
    concurrentDownloads: 'بیک وقت ڈاؤن لوڈز',
    sideMargin: 'اطراف کے حاشیے',
    courseListStyle: 'کورس فہرست کا انداز',
    appearance: 'ظاہری شکل',
    editInfo: 'کورسز کی معلومات میں ترمیم کریں',
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
    exportAllHidden: (count) => `اس میں ${count} چھپے ہوئے کورس بھی شامل ہیں۔`,
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
    setTagName: 'ٹیگ (مخفف) سیٹ کریں',
    tagPlaceholder: 'مخفف، جیسے OS',
    fullNamePlaceholder: 'پورا نام (خالی: Moodle والا)',
    tag: 'ٹیگ (مخفف)',
    fullName: 'پورا نام',
    institutionPlaceholder: 'جیسے UHU',
    institution: 'ادارہ',
    academicYearPlaceholder: '⁦26-27⁩',
    academicYear: 'تعلیمی سال',
    editInfo: 'کورس کی معلومات میں ترمیم کریں',
    addOption: (value) => `"${value}" شامل کریں`,
    showOptions: 'اختیارات دکھائیں',
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
    ignoredFiles: 'نظرانداز کی گئی فائلیں',
    couldNotRead: (fileCount, firstName, error) =>
      `${fileCount === 1 ? `"${firstName}"` : 'چھوڑی گئی فائلیں'} پڑھی نہیں جا سکیں — ہو سکتا ہے فائل منتقل یا حذف ` +
      `ہو گئی ہو، یا ابھی ڈاؤن لوڈ ہو رہی ہو۔ کسی مستقل جگہ سے دوبارہ کوشش کریں۔ (${error})`,
    couldNotAdd: (fileCount, error) => `${fileCount === 1 ? 'فائل' : 'فائلیں'} شامل نہیں ہو سکیں: ${error}`,
    dropFiles: (name) => `"${name}" میں شامل کرنے کے لیے فائلیں یہاں چھوڑیں`,
    searchPlaceholder: 'تلاش کے لیے ٹائپ کریں…',
    noMatches: (query) => `"${query}" سے کوئی فائل یا فولڈر میل نہیں کھاتا۔`,
    noFiles: 'اس کورس کی ابھی کوئی فائل ڈاؤن لوڈ نہیں ہوئی۔'
  },

  fileRow: {
    lastSaved: (date) => `آخری بار محفوظ: ${date}`,
    manual: 'دستی',
    manualTitle: 'ہاتھ سے شامل کی گئی، Moodle سے ڈاؤن لوڈ نہیں ہوئی',
    ignored: 'نظرانداز',
    ignoredTitle: 'ڈاؤن لوڈ اس فائل کو جیسی ہے ویسی ہی رہنے دیتے ہیں',
    ignoreTitle: 'اس فائل کی تبدیلیوں کو نظرانداز کریں',
    unignoreTitle: 'اس فائل کو نظرانداز کرنا بند کریں',
    ignoredWithFolderTitle: 'اپنے فولڈر کے ساتھ نظرانداز',
    deleteTitle: 'یہ فائل اپنی تاریخ سے حذف کریں',
    downloadTitle: 'اپنے ڈاؤن لوڈز فولڈر میں ڈاؤن لوڈ کریں',
    deleteConfirmTitle: (name) => `"${name}" حذف کریں؟`,
    deleteConfirmMessage:
      'اس سے فائل اور اس کے تمام محفوظ ورژن آپ کی تاریخ سے ہٹ جائیں گے۔ اگر یہ ابھی بھی Moodle میں ہے تو ' +
      'اس کورس کے اگلے ڈاؤن لوڈ میں یہ نئی فائل کے طور پر دوبارہ شامل ہو جائے گی۔'
  },

  folderRow: {
    ignoreTitle: 'اس فولڈر اور اس کے تمام مواد کو نظرانداز کریں',
    unignoreTitle: 'اس فولڈر کو نظرانداز کرنا بند کریں',
    ignoredTitle: 'ڈاؤن لوڈ اس فولڈر اور اس کے تمام مواد کو جیسا ہے ویسا ہی رہنے دیتے ہیں',
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
    remove: 'حال ہی میں کھولی گئی فائلوں سے ہٹائیں',
    showAll: 'حال ہی میں کھولی گئی سب دکھائیں'
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

  concurrentDownloads: {
    title: 'بیک وقت ڈاؤن لوڈز',
    description:
      'کسی کورس کی کتنی فائلیں ایک ساتھ ڈاؤن لوڈ ہوں۔ ' +
      'تیز کنکشن پر زیادہ رکھنے سے ڈاؤن لوڈ جلدی مکمل ہو سکتا ہے، لیکن آپ کے ادارے کے Moodle سرور پر زیادہ بوجھ پڑتا ہے۔ ' +
      'طے شدہ: 2۔ اگلے ڈاؤن لوڈ سے لاگو ہوتا ہے۔'
  },

  sideMargin: {
    title: 'اطراف کے حاشیے',
    description:
      'بڑی کی گئی ونڈو میں مواد کے ہر طرف خالی جگہ، اسکرین کے حصے کے طور پر۔ چھوٹی ونڈو میں مواد یہی ' +
      'چوڑائی رکھتا ہے، پہلے حاشیے استعمال کرتا ہے اور پھر پوری ونڈو۔',
    label: (percent) => `ہر طرف ${percent}%`
  },

  courseListStyle: {
    title: 'کورس فہرست کا انداز',
    description: 'اس صفحے پر کورس کیسے دکھائے جائیں۔',
    cards: 'کارڈز',
    grid: 'گرڈ',
    rows: 'قطاریں'
  },

  courseColor: {
    custom: 'اپنی پسند کا رنگ',
    automatic: 'خودکار رنگ استعمال کریں'
  },

  colorMenu: {
    code: 'ہیکس کوڈ',
    codeHint: 'چھ ہندسے، جیسے FFFFFF',
    more: 'مزید رنگ…'
  },

  appearance: {
    title: 'ظاہری شکل',
    palettes: 'رنگوں کے مجموعے',
    paletteNames: {
      default: 'ڈیفالٹ',
      ocean: 'سمندر',
      forest: 'جنگل',
      lavender: 'لیونڈر',
      warm: 'گرم',
      contrast: 'زیادہ تضاد'
    },
    replaceTitle: 'اپنے رنگ بدلیں؟',
    replaceMessage: 'اس تھیم میں آپ کے رکھے رنگوں کی جگہ مجموعے کے رنگ آ جائیں گے۔',
    replace: 'بدلیں',
    colors: {
      bg: 'پس منظر',
      surface: 'ثانوی پس منظر',
      fg: 'متن',
      muted: 'ثانوی متن',
      border: 'کنارے',
      accent: 'بٹن اور لنکس',
      focus: 'کی بورڈ فوکس',
      new: 'نئی فائلیں',
      modified: 'بدلی ہوئی فائلیں',
      deleted: 'حذف شدہ فائلیں اور خطرناک کارروائیاں',
      unchanged: 'بغیر تبدیلی والی فائلیں'
    },
    reset: 'ڈیفالٹ رنگ بحال کریں',
    resetAll: 'رنگ ری سیٹ کریں',
    resetTitle: { light: 'ہلکی تھیم کے رنگ ری سیٹ کریں؟', dark: 'گہری تھیم کے رنگ ری سیٹ کریں؟' },
    resetMessage: 'اس میں بدلے گئے سب رنگ ڈیفالٹ پر واپس آ جائیں گے۔'
  },

  courseUrl: {
    label: 'کورس کا URL',
    invalid:
      'یہ Moodle کورس کے صفحے کا URL نہیں ہے۔ یہ ⁦/course/view.php?id=⁩ اور کورس نمبر پر ختم ہوتا ہے۔',
    taken: (name) => `"${name}" کے پاس یہ URL پہلے سے ہے۔`,
    previousKept:
      'اس کے پرانے URL بھی پہچانے جاتے رہیں گے: وہاں سے ڈاؤن لوڈ اسی کورس میں جائیں گے۔'
  },

  courseInfo: {
    title: 'کورسز کی معلومات میں ترمیم کریں',
    hidden: 'پوشیدہ',
    color: 'رنگ',
    academicYearColor: 'تعلیمی سال کا رنگ',
    deleteOption: (value) => `"${value}" حذف کریں`,
    deleteOptionTitle: (value) => `"${value}" حذف کریں؟`,
    deleteOptionMessage: (count) =>
      count === 0 ? `کسی کورس میں یہ نہیں ہے: بس اب یہ اختیار کے طور پر نہیں دکھایا جائے گا۔` : count === 1 ? `اسے اس کورس سے ہٹا دیا جائے گا جس میں یہ ہے۔` : `اسے ان ${count} کورسز سے ہٹا دیا جائے گا جن میں یہ ہے۔`
  },

  ignoredFiles: {
    title: 'نظرانداز کی گئی فائلیں',
    description:
      'ڈاؤن لوڈ ان فائلوں کو جیسی ہیں ویسی ہی رہنے دیتے ہیں: کوئی نیا ورژن نہیں، کبھی حذف شدہ نشان زد نہیں ہوتیں، اور اگر ابھی ٹریک نہیں ہو رہیں تو شامل بھی نہیں ہوتیں۔',
    pathLabel: 'فائل کا راستہ',
    placeholder: 'فولڈر/فائل.pdf',
    hint:
      'ایکسٹینشن اور وہ فولڈر شامل کریں جن میں یہ ہے: کورس کی جڑ میں موجود فائل صرف اس کا نام ہے۔ مختلف فولڈروں میں ایک ہی نام کی فائلیں الگ الگ فائلیں ہیں۔ پورے فولڈر اور اس کے تمام مواد کو نظرانداز کرنے کے لیے راستے کے آخر میں / لگائیں۔',
    add: 'شامل کریں',
    folder: 'فولڈر',
    remove: (path) => `${path} کو نظرانداز کرنا بند کریں`,
    empty: 'کوئی نظرانداز فائل نہیں۔',
    duplicate: 'یہ فائل پہلے سے فہرست میں ہے۔',
    notFound: 'ابھی اس کورس میں نہیں ہے',
    askDeleteTitle: (count, name) => (count === 1 ? `"${name}" اب نظرانداز ہے` : `${count} فائلیں اب نظرانداز ہیں`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'ڈاؤن لوڈ اسے جیسی ہے ویسی ہی رہنے دیں گے۔ کیا آپ اسے اس کے تمام محفوظ ورژنز سمیت اس کورس سے حذف بھی کرنا چاہتے ہیں؟ جب تک یہ نظرانداز ہے، آئندہ ڈاؤن لوڈ اسے دوبارہ شامل نہیں کریں گے۔'
        : 'ڈاؤن لوڈ انہیں جیسی ہیں ویسی ہی رہنے دیں گے۔ کیا آپ انہیں ان کے تمام محفوظ ورژنز سمیت اس کورس سے حذف بھی کرنا چاہتے ہیں؟ جب تک یہ نظرانداز ہیں، آئندہ ڈاؤن لوڈ انہیں دوبارہ شامل نہیں کریں گے۔',
    keep: (count) => (count === 1 ? 'رکھیں' : 'رکھیں')
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
    cannotPreview: 'اس قسم کی فائل کا براؤزر میں پیش نظارہ نہیں ہو سکتا۔',
    zoomOut: 'چھوٹا کریں',
    zoomIn: 'بڑا کریں',
    fitVertically: 'عمودی طور پر فٹ کریں',
    fitHorizontally: 'افقی طور پر فٹ کریں'
  },

  popup: {
    cannotScan: 'یہ صفحہ اسکین نہیں ہو سکتا — پہلے Moodle کورس کا ٹیب کھولیں۔',
    filesDownloaded: (count) => `${count} فائلیں ڈاؤن لوڈ ہوئیں`,
    downloading: 'ڈاؤن لوڈ ہو رہا ہے...',
    retrying: 'دوبارہ کوشش ہو رہی ہے…',
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
    cancelled: (name, reason) =>
      `ڈاؤن لوڈ منسوخ: "${name}" ڈاؤن لوڈ نہیں ہو سکی (${reason})۔ کچھ بھی محفوظ نہیں ہوا — دوبارہ کوشش کریں۔`,
    sessionExpired:
      'ڈاؤن لوڈ منسوخ: Moodle نے لاگ ان کرنے کو کہا (شاید آپ کا سیشن ختم ہو گیا ہے)۔ Moodle میں لاگ ان کریں اور دوبارہ ڈاؤن لوڈ کریں۔ کچھ بھی محفوظ نہیں ہوا۔',
    retrying: (name) => `"${name}" دوبارہ آزمایا جا رہا ہے…`,
    ignoredSkipped: (count) => count === 1 ? 'نظرانداز 1 فائل چھوڑ دی گئی۔' : `نظرانداز ${count} فائلیں چھوڑ دی گئیں۔`,
    unavailable: (count) =>
      count === 1 ? '1 فائل اب Moodle پر دستیاب نہیں (اس کا لنک خرابی دیتا ہے)، اس لیے ڈاؤن لوڈ نہیں کی گئی۔' : `${count} فائلیں اب Moodle پر دستیاب نہیں (ان کے لنک خرابی دیتے ہیں)، اس لیے ڈاؤن لوڈ نہیں کی گئیں۔`,
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
