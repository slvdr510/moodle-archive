import type { Messages } from './en';

export const ar: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'بواسطة slvdr510',
    cancel: 'إلغاء',
    save: 'حفظ',
    close: 'إغلاق',
    delete: 'حذف',
    export: 'تصدير',
    download: 'تنزيل',
    moreOptions: 'مزيد من الخيارات',
    exporting: 'جارٍ التصدير…',
    importing: 'جارٍ الاستيراد…',
    savedToDownloads: (name) => `تم حفظ «${name}» في مجلد التنزيلات.`,
    couldNotExport: (name, error) => `تعذّر تصدير «${name}»: ${error}`
  },

  header: {
    theme: 'المظهر',
    themeLight: 'فاتح',
    themeSystem: 'مطابقة النظام',
    themeDark: 'داكن',
    language: 'اللغة',
    languageAuto: 'لغة المتصفح'
  },

  relativeTime: {
    justNow: 'الآن',
    minutes: (n) => `منذ ${n} د`,
    hours: (n) => `منذ ${n} س`,
    days: (n) => `منذ ${n} يوم`,
    weeks: (n) => `منذ ${n} أسبوع`,
    months: (n) => `منذ ${n} شهر`,
    years: (n) => `منذ ${n} سنة`
  },

  status: {
    new: 'جديد',
    modified: 'معدَّل',
    deleted: 'محذوف',
    unchanged: 'دون تغيير'
  },

  courses: {
    openAllUrls: 'فتح روابط جميع المقررات',
    exportAll: 'تصدير جميع المقررات',
    importCourses: 'استيراد مقررات',
    recentSettings: 'إعدادات الملفات المفتوحة مؤخرًا',
    downloadNameSettings: 'إعدادات أسماء التنزيل',
    sideMargin: 'الهوامش الجانبية',
    hiddenCourses: 'المقررات المخفية',
    deleteAll: 'حذف جميع المقررات',
    backupSaved: 'تم حفظ النسخة الاحتياطية في مجلد التنزيلات.',
    couldNotExportAll: (error) => `تعذّر التصدير: ${error}`,
    noUrlsToOpen: 'لا توجد روابط مقررات لفتحها.',
    imported: (courses, files, versions) =>
      `تم استيراد ${courses} مقرر و${files} ملف و${versions} إصدار.`,
    notABackup: (name) => `«${name}» ليس ملف zip بتنسيق المقررات الذي تستخدمه هذه الإضافة.`,
    couldNotImport: (details) => `تعذّر استيراد ${details}`,
    dropBackups: 'أفلِت النسخ الاحتياطية بصيغة ‎.zip لاستيراد مقرراتها',
    exportAllTitle: 'تصدير جميع المقررات؟',
    exportAllMessage: 'سيتم حفظ كل المقررات والملفات والإصدارات المتتبَّعة في ملف zip واحد في مجلد التنزيلات.',
    exportCourseTitle: (name) => `تصدير «${name}»؟`,
    exportCourseMessage: 'سيتم حفظ المقرر وملفاته وكل إصداراته في ملف zip في مجلد التنزيلات.',
    deleteAllTitle: 'حذف جميع المقررات؟',
    deleteAllMessage:
      'سيؤدي هذا إلى مسح كل المقررات والملفات وسجلات الإصدارات التي تتتبعها الإضافة. ' +
      'نزّل مقررًا مرة أخرى بعد ذلك لتبدأ في إعادة بناء سجله.',
    deleteCourseTitle: (name) => `حذف «${name}»؟`,
    deleteCourseMessage:
      'سيؤدي هذا إلى إزالة المقرر وسجل ملفاته وإصداراته. إذا نزّلت هذا المقرر مرة أخرى لاحقًا، ' +
      'فسيُعاد إنشاؤه من البداية.',
    emptyTitle: 'لا توجد مقررات بعد',
    emptySubtitle: 'تُنشأ المقررات تلقائيًا عند تنزيل أحدها لأول مرة.',
    emptyStep1: 'افتح مقررًا في Moodle',
    emptyStep2: 'انقر على أيقونة الإضافة',
    emptyStep3Before: 'اضغط ',
    emptyStep3After: '',
    emptyHintBefore: 'لديك نسخة احتياطية بالفعل؟ أفلِت ملف ',
    emptyHintAfter: ' الخاص بها في أي مكان في هذه الصفحة لاستيراده.',
    allHidden: 'جميع مقرراتك مخفية. استخدم «المقررات المخفية» في القائمة ⋮ لإظهار أحدها.'
  },

  courseRow: {
    lastDownloaded: 'آخر تنزيل',
    openInMoodle: 'فتح المقرر في Moodle',
    setTagName: 'تعيين اسم الوسم',
    hideCourse: 'إخفاء المقرر',
    deleteCourse: 'حذف المقرر'
  },

  hiddenCourses: {
    title: 'المقررات المخفية',
    none: 'لا توجد مقررات مخفية.',
    unhide: 'إظهار'
  },

  courseFiles: {
    backToCourses: 'العودة إلى المقررات',
    addFile: 'إضافة ملف…',
    couldNotRead: (fileCount, firstName, error) =>
      `تعذّرت قراءة ${fileCount === 1 ? `«${firstName}»` : 'الملفات المُفلتة'} — ربما نُقل الملف أو حُذف، ` +
      `أو لا يزال قيد التنزيل. أعد المحاولة من موقع ثابت. (${error})`,
    couldNotAdd: (fileCount, error) => `تعذّرت إضافة ${fileCount === 1 ? 'الملف' : 'الملفات'}: ${error}`,
    dropFiles: (name) => `أفلِت الملفات لإضافتها إلى «${name}»`,
    searchPlaceholder: 'البحث عن الملفات بالاسم…',
    noMatches: (query) => `لا توجد ملفات تطابق «${query}».`,
    noFiles: 'لم يُنزَّل أي ملف لهذا المقرر بعد.'
  },

  fileRow: {
    viewHistory: 'عرض سجل الإصدارات',
    lastSaved: (date) => `آخر حفظ: ${date}`,
    manual: 'يدوي',
    manualTitle: 'أُضيف يدويًا، ولم يُنزَّل من Moodle',
    deleteTitle: 'حذف هذا الملف من السجل',
    downloadTitle: 'تنزيل إلى مجلد التنزيلات',
    deleteConfirmTitle: (name) => `حذف «${name}»؟`,
    deleteConfirmMessage:
      'سيؤدي هذا إلى إزالة الملف وجميع إصداراته المحفوظة من السجل. إذا كان لا يزال في Moodle، ' +
      'فسيُضاف مجددًا كملف جديد عند التنزيل التالي لهذا المقرر.'
  },

  folderRow: {
    deleteTitle: 'حذف هذا المجلد من السجل',
    downloadTitle: 'تنزيل هذا المجلد كملف zip',
    couldNotDownload: (name, error) => `تعذّر تنزيل «${name}»: ${error}`,
    deleteConfirmTitle: (name) => `حذف «${name}»؟`,
    deleteConfirmMessage: (fileCount) =>
      `سيؤدي هذا إلى إزالة المجلد وملفاته (${fileCount}) وجميع إصداراتها المحفوظة من السجل. ` +
      'كل ما لا يزال في Moodle سيُضاف مجددًا كجديد في المرة القادمة التي تنزّل فيها هذا المقرر.'
  },

  recentlyOpened: {
    title: 'المفتوحة مؤخرًا',
    remove: 'إزالة من المفتوحة مؤخرًا'
  },

  recentSettings: {
    title: 'المفتوحة مؤخرًا',
    appliesToAll: 'ينطبق على جميع المقررات.',
    show: 'إظهار الملفات المفتوحة مؤخرًا',
    noLimit: 'بلا حد',
    maximum: 'الحد الأقصى للملفات المفتوحة مؤخرًا لكل مقرر'
  },

  downloadNames: {
    title: 'أسماء التنزيل',
    description: 'ينطبق على جميع المقررات. تُنزَّل ملفات المقررات التي ليس لها وسم باسم الملف الأصلي.',
    prefixCourseTag: 'إضافة وسم المقرر إلى بداية أسماء التنزيل (مثل TAG_file.pdf)'
  },

  sideMargin: {
    title: 'الهوامش الجانبية',
    description:
      'المساحة الفارغة على كل جانب من المحتوى في نافذة مكبّرة، كنسبة من عرض الشاشة. في النافذة الأصغر يحتفظ ' +
      'المحتوى بهذا العرض، فيستهلك الهوامش أولًا ثم النافذة بأكملها.',
    label: (percent) => `${percent}% على كل جانب`
  },

  upload: {
    titleOne: (name) => `إضافة «${name}»`,
    titleMany: (count) => `إضافة ${count} ملفات`,
    where: (count) => `أين تريد حفظ${count === 1 ? 'ه' : 'ها'}؟`,
    courseRoot: 'جذر المقرر',
    existingFolder: 'مجلد موجود',
    newFolder: 'مجلد جديد',
    folderNamePlaceholder: 'اسم المجلد',
    newFolderNameLabel: 'اسم المجلد الجديد',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' موجود بالفعل في هذا المجلد — سيُضاف الملف الجديد كإصدار جديد منه.',
    add: 'إضافة',
    adding: 'جارٍ الإضافة…'
  },

  versions: {
    whichVersion: 'أي إصدار؟',
    downloadTitle: 'تنزيل هذا الإصدار إلى مجلد التنزيلات',
    diffVsPrevious: 'المقارنة بالسابق',
    comparing: (from, to) => `مقارنة v${from} ← v${to}`,
    loadingDiff: 'جارٍ تحميل الفروق…',
    binaryChanged: 'ملف ثنائي — تغيّر المحتوى.',
    size: (from, to, delta) => `الحجم: ${from} ← ${to} (${delta})`,
    deleteTitle: 'حذف هذا الإصدار',
    deleteConfirmTitle: (label) => `حذف ${label}؟`,
    deleteConfirmMessage:
      'سيُحذف هذا الإصدار نهائيًا من سجل الملف. تبقى الإصدارات الأخرى والملف نفسه.'
  },

  openFile: {
    downloadInterrupted: 'توقف التنزيل.',
    couldNotOpen: (filename, error) =>
      `تم تنزيل «${filename}» لكن تعذّر فتحه تلقائيًا (${error}).\n\n` +
      'يمكنك فتحه من تنزيلات Chrome ‏(Ctrl+J / Cmd+Shift+J). ' +
      'تلميح: انقر بزر الماوس الأيمن على أحد التنزيلات هناك واختر «فتح الملفات من هذا النوع دائمًا» ' +
      'ليحدث ذلك تلقائيًا من الآن فصاعدًا.'
  },

  backup: {
    courseNotFound: 'لم يتم العثور على المقرر.',
    invalid: (reason) => `ليست نسخة احتياطية صالحة من Moodle Archive ‏(${reason}).`,
    notZip: 'ليس ملف zip',
    missingManifest: 'الملف data.json مفقود',
    invalidJson: 'الملف data.json ليس JSON صالحًا',
    noCourses: 'الملف data.json لا يصف أي مقررات'
  },

  viewer: {
    notFoundTitle: 'لم يتم العثور على الملف',
    notFoundText: 'لم يعد هذا الملف موجودًا في سجل Moodle Archive — ربما حُذف.',
    cannotPreview: 'لا يمكن معاينة هذا النوع من الملفات في المتصفح.'
  },

  popup: {
    cannotScan: 'لا يمكن فحص هذه الصفحة — افتح علامة تبويب لمقرر في Moodle أولًا.',
    filesDownloaded: (count) => `تم تنزيل ${count} ملف`,
    downloading: 'جارٍ التنزيل...',
    download: 'تنزيل',
    history: 'السجل',
    addToQueue: 'إضافة إلى قائمة الانتظار',
    queued: (position) => `في الانتظار (رقم ${position})`,
    queueTitle: 'التالي',
    removeFromQueue: 'إزالة من قائمة الانتظار'
  },

  download: {
    unsupportedUrl: (url) => `رابط غير مدعوم: ${url}.`,
    processingLinks: 'جارٍ معالجة الروابط...',
    processing: (url) => `جارٍ معالجة ${url}`,
    downloadingFiles: 'جارٍ تنزيل الملفات...',
    downloadingFile: (name) => `جارٍ تنزيل ${name}`,
    cancelled: (name, reason) =>
      `أُلغي التنزيل: تعذّر تنزيل «${name}» (${reason}). لم يُحفظ أي شيء — أعد المحاولة.`,
    downloadFailed: 'فشل التنزيل',
    noResponse: 'انتهت مهلة انتظار الرد',
    stalled: 'متوقف: لم تصل أي بيانات في الوقت المحدد',
    noFileFound: 'لم يتم العثور على أي ملف.',
    saving: 'جارٍ الحفظ في السجل...',
    savingChunk: (index, total) => `جارٍ الحفظ في السجل... (${index}/${total})`,
    saved: 'تم الحفظ في السجل.',
    saveFailed: (reason) => `تعذّر الحفظ في السجل: ${reason}`,
    timedOut: 'انتهت مهلة انتظار الرد — أعد المحاولة',
    unknownError: 'خطأ غير معروف',
    interrupted: 'توقف التنزيل: أُغلقت علامة التبويب أو انتقلت إلى صفحة أخرى.',
    couldNotStart: (title) => `تعذّر بدء «${title}» — افتح علامة التبويب الخاصة به وأعد المحاولة.`
  }
};
