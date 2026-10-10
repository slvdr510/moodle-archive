import type { Messages } from './en';

/** Egyptian Arabic (Masri), written in Arabic script the way it's used informally online. */
export const arz: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'من slvdr510',
    cancel: 'إلغاء',
    save: 'احفظ',
    close: 'اقفل',
    delete: 'امسح',
    export: 'صدّر',
    download: 'نزّل',
    moreOptions: 'اختيارات تانية',
    exporting: 'بيصدّر…',
    importing: 'بيستورد…',
    savedToDownloads: (name) => `«${name}» اتحفظ في فولدر التنزيلات.`,
    couldNotExport: (name, error) => `مقدرناش نصدّر «${name}»: ${error}`
  },

  header: {
    theme: 'الشكل',
    themeLight: 'فاتح',
    themeSystem: 'زي السيستم',
    themeDark: 'غامق',
    language: 'اللغة',
    languageAuto: 'لغة المتصفح'
  },

  relativeTime: {
    justNow: 'دلوقتي',
    minutes: (n) => `من ${n} دقيقة`,
    hours: (n) => `من ${n} ساعة`,
    days: (n) => `من ${n} يوم`,
    weeks: (n) => `من ${n} أسبوع`,
    months: (n) => `من ${n} شهر`,
    years: (n) => `من ${n} سنة`
  },

  status: {
    new: 'جديد',
    modified: 'متعدّل',
    deleted: 'اتمسح',
    unchanged: 'زي ما هو'
  },

  courses: {
    openAllUrls: 'افتح لينكات كل الكورسات',
    exportAll: 'صدّر كل الكورسات',
    importCourses: 'استورد كورسات',
    recentSettings: 'إعدادات اللي اتفتح قريب',
    downloadNameSettings: 'إعدادات أسامي التنزيل',
    sideMargin: 'الهوامش اللي على الجناب',
    courseListStyle: 'شكل قايمة الكورسات',
    setInstitution: 'حط المؤسسة لكورسات',
    hiddenCourses: 'الكورسات المستخبية',
    deleteAll: 'امسح كل الكورسات',
    backupSaved: 'النسخة الاحتياطية اتحفظت في فولدر التنزيلات.',
    couldNotExportAll: (error) => `مقدرناش نصدّر: ${error}`,
    noUrlsToOpen: 'مفيش لينكات كورسات تتفتح.',
    imported: (courses, files, versions) =>
      `اتستورد ${courses} كورس و${files} ملف و${versions} نسخة.`,
    notABackup: (name) => `«${name}» مش ملف zip بالشكل اللي الإضافة دي بتستخدمه للكورسات.`,
    couldNotImport: (details) => `مقدرناش نستورد ${details}`,
    dropBackups: 'سيب ملفات ‎.zip الاحتياطية هنا علشان تستورد الكورسات اللي فيها',
    exportAllTitle: 'تصدّر كل الكورسات؟',
    exportAllMessage: 'كل الكورسات والملفات والنسخ اللي بنتابعها هتتحفظ في ملف zip واحد في فولدر التنزيلات.',
    exportCourseTitle: (name) => `تصدّر «${name}»؟`,
    exportCourseMessage: 'الكورس وملفاته وكل نسخه هيتحفظوا في ملف zip في فولدر التنزيلات.',
    deleteAllTitle: 'تمسح كل الكورسات؟',
    deleteAllMessage:
      'كده هتمسح كل الكورسات والملفات وتاريخ النسخ اللي الإضافة بتتابعه. ' +
      'نزّل أي كورس تاني بعدين علشان تبدأ تبني تاريخه من جديد.',
    deleteCourseTitle: (name) => `تمسح «${name}»؟`,
    deleteCourseMessage:
      'كده هتشيل الكورس وتاريخ ملفاته ونسخه. لو نزّلت الكورس ده تاني بعدين، ' +
      'هيتعمل من الأول خالص.',
    emptyTitle: 'لسه مفيش كورسات',
    emptySubtitle: 'الكورسات بتتعمل لوحدها أول مرة تنزّل فيها كورس.',
    emptyStep1: 'افتح كورس على Moodle',
    emptyStep2: 'دوس على أيقونة الإضافة',
    emptyStep3Before: 'دوس ',
    emptyStep3After: '',
    emptyHintBefore: 'عندك نسخة احتياطية؟ سيب ملف الـ',
    emptyHintAfter: ' بتاعها في أي حتة في الصفحة دي علشان تستورده.',
    allHidden: 'كل الكورسات بتاعتك مستخبية. استخدم «الكورسات المستخبية» من القايمة ⋮ علشان ترجّع واحد.'
  },

  courseRow: {
    lastDownloaded: 'آخر تنزيل',
    openInMoodle: 'افتح الكورس على Moodle',
    setTagName: 'حط تاج (اختصار)',
    setFullName: 'حط الاسم الكامل',
    tagPlaceholder: 'اختصار، زي OS',
    fullNamePlaceholder: 'الاسم الكامل (فاضي: اسم Moodle)',
    setInstitution: 'حط المؤسسة (اختصار)',
    institutionPlaceholder: 'اختصار المؤسسة، زي UHU',
    institution: 'المؤسسة',
    changeColor: 'غيّر اللون',
    hideCourse: 'خبّي الكورس',
    deleteCourse: 'امسح الكورس'
  },

  hiddenCourses: {
    title: 'الكورسات المستخبية',
    none: 'مفيش كورسات مستخبية.',
    unhide: 'اظهر'
  },

  courseFiles: {
    backToCourses: 'ارجع للكورسات',
    addFile: 'ضيف ملف…',
    ignoredFiles: 'الملفات المتجاهلة',
    couldNotRead: (fileCount, firstName, error) =>
      `مقدرناش نقرا ${fileCount === 1 ? `«${firstName}»` : 'الملفات اللي سبتها'} — ممكن الملف يكون اتنقل أو اتمسح، ` +
      `أو لسه بيتنزّل. جرّب تاني من مكان ثابت. (${error})`,
    couldNotAdd: (fileCount, error) => `مقدرناش نضيف ${fileCount === 1 ? 'الملف' : 'الملفات'}: ${error}`,
    dropFiles: (name) => `سيب الملفات هنا علشان تضيفها لـ«${name}»`,
    searchPlaceholder: 'دوّر على ملفات بالاسم…',
    noMatches: (query) => `مفيش ملفات شبه «${query}».`,
    noFiles: 'لسه مفيش ملفات اتنزّلت للكورس ده.'
  },

  fileRow: {
    viewHistory: 'شوف تاريخ النسخ',
    lastSaved: (date) => `آخر حفظ: ${date}`,
    manual: 'يدوي',
    manualTitle: 'اتضاف باليد، مش متنزّل من Moodle',
    ignored: 'متجاهل',
    ignoredTitle: 'التنزيلات بتسيب الملف ده زي ما هو',
    ignoreTitle: 'اتجاهل التغييرات في الملف ده',
    unignoreTitle: 'بطّل تتجاهل الملف ده',
    ignoredWithFolderTitle: 'متجاهل مع الفولدر بتاعه',
    deleteTitle: 'امسح الملف ده من التاريخ بتاعك',
    downloadTitle: 'نزّله في فولدر التنزيلات',
    deleteConfirmTitle: (name) => `تمسح «${name}»؟`,
    deleteConfirmMessage:
      'كده هتشيل الملف وكل نسخه المحفوظة من التاريخ بتاعك. لو لسه موجود على Moodle، ' +
      'أول ما تنزّل الكورس ده تاني هيتضاف كملف جديد.'
  },

  folderRow: {
    ignoreTitle: 'اتجاهل الفولدر ده وكل اللي فيه',
    unignoreTitle: 'بطّل تتجاهل الفولدر ده',
    ignoredTitle: 'التنزيلات بتسيب الفولدر ده وكل اللي فيه زي ما هو',
    deleteTitle: 'امسح الفولدر ده من التاريخ بتاعك',
    downloadTitle: 'نزّل الفولدر ده كـzip',
    couldNotDownload: (name, error) => `مقدرناش ننزّل «${name}»: ${error}`,
    deleteConfirmTitle: (name) => `تمسح «${name}»؟`,
    deleteConfirmMessage: (fileCount) =>
      `كده هتشيل الفولدر وملفاته (${fileCount}) وكل نسخها المحفوظة من التاريخ بتاعك. ` +
      'أي حاجة لسه موجودة على Moodle هتتضاف تاني كجديدة المرة الجاية اللي تنزّل فيها الكورس ده.'
  },

  recentlyOpened: {
    title: 'اتفتح قريب',
    remove: 'شيله من اللي اتفتح قريب',
    showAll: 'اعرض كل اللي اتفتح مؤخرًا'
  },

  recentSettings: {
    title: 'اتفتح قريب',
    appliesToAll: 'بيتطبق على كل الكورسات.',
    show: 'اعرض الملفات اللي اتفتحت قريب',
    noLimit: 'من غير حد',
    maximum: 'أقصى عدد للملفات اللي اتفتحت قريب في كل كورس'
  },

  downloadNames: {
    title: 'أسامي التنزيل',
    description: 'بيتطبق على كل الكورسات. الكورسات اللي ملهاش تاج بتتنزّل باسم الملف نفسه.',
    prefixCourseTag: 'حط تاج الكورس في أول اسم التنزيل (زي TAG_file.pdf)'
  },

  sideMargin: {
    title: 'الهوامش اللي على الجناب',
    description:
      'المساحة الفاضية على كل جنب من المحتوى لما الشباك يكون مكبّر، كنسبة من الشاشة. في شباك أصغر المحتوى ' +
      'بيفضل بنفس العرض، فبياكل من الهوامش الأول وبعدين ياخد الشباك كله.',
    label: (percent) => `${percent}% على كل جنب`
  },

  courseListStyle: {
    title: 'شكل قايمة الكورسات',
    description: 'الكورسات تتعرض إزاي في الصفحة دي.',
    cards: 'كروت',
    rows: 'صفوف'
  },

  courseColor: {
    title: (name) => `لون "${name}"`,
    palette: 'الألوان',
    custom: 'لون على مزاجك',
    automatic: 'استخدم اللون التلقائي'
  },

  setInstitution: {
    title: 'حط المؤسسة',
    description: 'اختار الكورسات اللي هتاخد المؤسسة دي. سيبها فاضية عشان تشيلها منهم.',
    courses: (count) => (count === 0 ? 'الكورسات' : `الكورسات (${count} متختارين)`),
    selectAll: 'اختار الكل',
    selectNone: 'ولا حاجة',
    hidden: 'مخفي',
    apply: (count) => (count === 1 ? 'طبّق على كورس واحد' : `طبّق على ${count} كورسات`),
    remove: (count) => (count === 1 ? 'شيلها من كورس واحد' : `شيلها من ${count} كورسات`)
  },

  ignoredFiles: {
    title: 'الملفات المتجاهلة',
    description:
      'التنزيلات بتسيب الملفات دي زي ما هي: مفيش نسخ جديدة، عمرها ما تتعلم إنها اتمسحت، ومش بتتضاف لو لسه مش متتبعة.',
    pathLabel: 'مسار الملف',
    placeholder: 'فولدر/ملف.pdf',
    hint:
      'اكتب الامتداد والفولدرات اللي هو فيها: الملف اللي في أول الكورس هو اسمه بس. الملفات اللي ليها نفس الاسم في فولدرات مختلفة تعتبر ملفات مختلفة. خلّي المسار يخلص بـ / عشان تتجاهل فولدر كامل بكل اللي فيه.',
    add: 'ضيف',
    folder: 'فولدر',
    remove: (path) => `بطّل تتجاهل ${path}`,
    empty: 'مفيش ملفات متجاهلة.',
    duplicate: 'الملف ده موجود في القايمة أصلًا.',
    notFound: 'لسه مش موجود في الكورس ده',
    askDeleteTitle: (count, name) => (count === 1 ? `"${name}" بقى متجاهل` : `${count} ملفات بقت متجاهلة`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'التنزيلات هتسيب الملف زي ما هو. عايز كمان تمسحه من الكورس ده بكل نسخه المحفوظة؟ طول ما هو متجاهل، التنزيلات الجاية مش هترجعه.'
        : 'التنزيلات هتسيب الملفات زي ما هي. عايز كمان تمسحها من الكورس ده بكل نسخها المحفوظة؟ طول ما هي متجاهلة، التنزيلات الجاية مش هترجعها.',
    keep: (count) => (count === 1 ? 'سيبه' : 'سيبهم')
  },

  upload: {
    titleOne: (name) => `ضيف «${name}»`,
    titleMany: (count) => `ضيف ${count} ملفات`,
    where: (count) => `عايز تحفظ${count === 1 ? 'ه' : 'هم'} فين؟`,
    courseRoot: 'أول الكورس',
    existingFolder: 'فولدر موجود',
    newFolder: 'فولدر جديد',
    folderNamePlaceholder: 'اسم الفولدر',
    newFolderNameLabel: 'اسم الفولدر الجديد',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' موجود فعلًا في الفولدر ده — الملف الجديد هيتضاف كنسخة جديدة منه.',
    add: 'ضيف',
    adding: 'بيضيف…'
  },

  versions: {
    whichVersion: 'أنهي نسخة؟',
    downloadTitle: 'نزّل النسخة دي في فولدر التنزيلات',
    diffVsPrevious: 'قارن باللي قبلها',
    comparing: (from, to) => `بنقارن v${from} ← v${to}`,
    loadingDiff: 'بيحمّل الفروق…',
    binaryChanged: 'ملف باينري — المحتوى اتغيّر.',
    size: (from, to, delta) => `الحجم: ${from} ← ${to} (${delta})`,
    deleteTitle: 'امسح النسخة دي',
    deleteConfirmTitle: (label) => `تمسح ${label}؟`,
    deleteConfirmMessage:
      'النسخة دي هتتمسح من تاريخ الملف خالص. باقي النسخ والملف نفسه هيفضلوا.'
  },

  openFile: {
    downloadInterrupted: 'التنزيل وقف.',
    couldNotOpen: (filename, error) =>
      `«${filename}» اتنزّل، بس مقدرناش نفتحه لوحده (${error}).\n\n` +
      'تقدر تفتحه من تنزيلات Chrome ‏(Ctrl+J / Cmd+Shift+J). ' +
      'نصيحة: دوس كليك يمين على أي تنزيل هناك واختار «افتح الملفات من النوع ده دايمًا» ' +
      'علشان يحصل ده لوحده من دلوقتي.'
  },

  backup: {
    courseNotFound: 'الكورس مش موجود.',
    invalid: (reason) => `دي مش نسخة احتياطية سليمة من Moodle Archive ‏(${reason}).`,
    notZip: 'مش ملف zip',
    missingManifest: 'data.json مش موجود',
    invalidJson: 'data.json مش JSON سليم',
    noCourses: 'data.json مفيهوش كورسات'
  },

  viewer: {
    notFoundTitle: 'الملف مش موجود',
    notFoundText: 'الملف ده مبقاش موجود في تاريخ Moodle Archive بتاعك — ممكن يكون اتمسح.',
    cannotPreview: 'النوع ده من الملفات مينفعش يتعرض في المتصفح.',
    zoomOut: 'صغّر',
    zoomIn: 'كبّر',
    fitVertically: 'على قد الطول',
    fitHorizontally: 'على قد العرض'
  },

  popup: {
    cannotScan: 'الصفحة دي مينفعش تتفحص — افتح تابة فيها كورس على Moodle الأول.',
    filesDownloaded: (count) => `اتنزّل ${count} ملف`,
    downloading: 'بينزّل...',
    download: 'نزّل',
    history: 'التاريخ',
    addToQueue: 'ضيف للطابور',
    queued: (position) => `في الطابور (رقم ${position})`,
    queueTitle: 'اللي جاي',
    removeFromQueue: 'شيله من الطابور'
  },

  download: {
    unsupportedUrl: (url) => `لينك مش مدعوم: ${url}.`,
    processingLinks: 'بيجهّز اللينكات...',
    processing: (url) => `بيجهّز ${url}`,
    downloadingFiles: 'بينزّل الملفات...',
    downloadingFile: (name) => `بينزّل ${name}`,
    cancelled: (name, reason) =>
      `التنزيل اتلغى: مقدرناش ننزّل «${name}» (${reason}). مفيش حاجة اتحفظت — جرّب تاني.`,
    downloadFailed: 'التنزيل فشل',
    noResponse: 'الوقت خلص واحنا مستنيين رد',
    stalled: 'واقف: مفيش بيانات وصلت في الوقت',
    noFileFound: 'ملقيناش أي ملف.',
    saving: 'بيحفظ في التاريخ...',
    savingChunk: (index, total) => `بيحفظ في التاريخ... (${index}/${total})`,
    saved: 'اتحفظ في التاريخ.',
    saveFailed: (reason) => `مقدرناش نحفظ في التاريخ: ${reason}`,
    timedOut: 'الوقت خلص واحنا مستنيين رد — جرّب تاني',
    unknownError: 'غلط مش معروف',
    interrupted: 'التنزيل وقف: التابة اتقفلت أو راحت لصفحة تانية.',
    couldNotStart: (title) => `مقدرناش نبدأ «${title}» — افتح التابة بتاعته وجرّب تاني.`
  }
};
