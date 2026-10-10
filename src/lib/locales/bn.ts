import type { Messages } from './en';

export const bn: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'slvdr510-এর তৈরি',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ',
    close: 'বন্ধ করুন',
    delete: 'মুছুন',
    export: 'এক্সপোর্ট',
    download: 'ডাউনলোড',
    moreOptions: 'আরও বিকল্প',
    exporting: 'এক্সপোর্ট হচ্ছে…',
    importing: 'ইমপোর্ট হচ্ছে…',
    savedToDownloads: (name) => `"${name}" আপনার ডাউনলোডস ফোল্ডারে সংরক্ষিত হয়েছে।`,
    couldNotExport: (name, error) => `"${name}" এক্সপোর্ট করা যায়নি: ${error}`
  },

  header: {
    theme: 'থিম',
    themeLight: 'হালকা',
    themeSystem: 'সিস্টেম অনুযায়ী',
    themeDark: 'গাঢ়',
    language: 'ভাষা',
    languageAuto: 'ব্রাউজারের ভাষা'
  },

  relativeTime: {
    justNow: 'এইমাত্র',
    minutes: (n) => `${n} মিনিট আগে`,
    hours: (n) => `${n} ঘণ্টা আগে`,
    days: (n) => `${n} দিন আগে`,
    weeks: (n) => `${n} সপ্তাহ আগে`,
    months: (n) => `${n} মাস আগে`,
    years: (n) => `${n} বছর আগে`
  },

  status: {
    new: 'নতুন',
    modified: 'পরিবর্তিত',
    deleted: 'মুছে ফেলা',
    unchanged: 'অপরিবর্তিত'
  },

  courses: {
    openAllUrls: 'সব কোর্সের URL খুলুন',
    exportAll: 'সব কোর্স এক্সপোর্ট করুন',
    importCourses: 'কোর্স ইমপোর্ট করুন',
    recentSettings: 'সাম্প্রতিক খোলা ফাইলের সেটিংস',
    downloadNameSettings: 'ডাউনলোড নামের সেটিংস',
    sideMargin: 'পাশের মার্জিন',
    courseListStyle: 'কোর্স তালিকার ধরন',
    setInstitution: 'কোর্সগুলোর প্রতিষ্ঠান দিন',
    hiddenCourses: 'লুকানো কোর্স',
    deleteAll: 'সব কোর্স মুছুন',
    backupSaved: 'ব্যাকআপ আপনার ডাউনলোডস ফোল্ডারে সংরক্ষিত হয়েছে।',
    couldNotExportAll: (error) => `এক্সপোর্ট করা যায়নি: ${error}`,
    noUrlsToOpen: 'খোলার মতো কোনো কোর্স URL নেই।',
    imported: (courses, files, versions) =>
      `${courses}টি কোর্স, ${files}টি ফাইল ও ${versions}টি সংস্করণ ইমপোর্ট হয়েছে।`,
    notABackup: (name) => `"${name}" এই এক্সটেনশনের কোর্স ফরম্যাটের zip ফাইল নয়।`,
    couldNotImport: (details) => `ইমপোর্ট করা যায়নি: ${details}`,
    dropBackups: 'কোর্স ইমপোর্ট করতে .zip ব্যাকআপ এখানে ছাড়ুন',
    exportAllTitle: 'সব কোর্স এক্সপোর্ট করবেন?',
    exportAllMessage: 'ট্র্যাক করা প্রতিটি কোর্স, ফাইল ও সংস্করণ একটি zip-এ আপনার ডাউনলোডস ফোল্ডারে সংরক্ষিত হবে।',
    exportCourseTitle: (name) => `"${name}" এক্সপোর্ট করবেন?`,
    exportCourseMessage: 'কোর্স, এর ফাইল ও প্রতিটি সংস্করণ একটি zip-এ আপনার ডাউনলোডস ফোল্ডারে সংরক্ষিত হবে।',
    deleteAllTitle: 'সব কোর্স মুছবেন?',
    deleteAllMessage:
      'এতে এক্সটেনশনের ট্র্যাক করা সব কোর্স, ফাইল ও সংস্করণের ইতিহাস মুছে যাবে। ' +
      'পরে কোনো কোর্স আবার ডাউনলোড করলে তার ইতিহাস নতুন করে তৈরি হতে শুরু করবে।',
    deleteCourseTitle: (name) => `"${name}" মুছবেন?`,
    deleteCourseMessage:
      'এতে কোর্সটি এবং এর ফাইল ও সংস্করণের ইতিহাস সরিয়ে ফেলা হবে। পরে এই কোর্সটি আবার ডাউনলোড করলে ' +
      'এটি একেবারে নতুন করে তৈরি হবে।',
    emptyTitle: 'এখনও কোনো কোর্স নেই',
    emptySubtitle: 'প্রথমবার কোনো কোর্স ডাউনলোড করলে সেটি স্বয়ংক্রিয়ভাবে তৈরি হয়।',
    emptyStep1: 'Moodle-এ একটি কোর্স খুলুন',
    emptyStep2: 'এক্সটেনশনের আইকনে ক্লিক করুন',
    emptyStep3Before: '',
    emptyStep3After: ' চাপুন',
    emptyHintBefore: 'আগে থেকেই ব্যাকআপ আছে? এর ',
    emptyHintAfter: ' ফাইলটি এই পৃষ্ঠার যেকোনো জায়গায় ছাড়ুন, ইমপোর্ট হয়ে যাবে।',
    allHidden: 'আপনার সব কোর্স লুকানো আছে। কোনোটি ফিরিয়ে আনতে ⋮ মেনুতে "লুকানো কোর্স" ব্যবহার করুন।'
  },

  courseRow: {
    lastDownloaded: 'শেষ ডাউনলোড',
    openInMoodle: 'কোর্সটি Moodle-এ খুলুন',
    setTagName: 'ট্যাগ (সংক্ষিপ্ত রূপ) দিন',
    setFullName: 'পূর্ণ নাম দিন',
    tagPlaceholder: 'সংক্ষিপ্ত রূপ, যেমন OS',
    fullNamePlaceholder: 'পূর্ণ নাম (খালি: Moodle-এর নাম)',
    setInstitution: 'প্রতিষ্ঠান (সংক্ষিপ্ত রূপ) দিন',
    institutionPlaceholder: 'প্রতিষ্ঠানের সংক্ষিপ্ত রূপ, যেমন UHU',
    institution: 'প্রতিষ্ঠান',
    changeColor: 'রং বদলান',
    hideCourse: 'কোর্স লুকান',
    deleteCourse: 'কোর্স মুছুন'
  },

  hiddenCourses: {
    title: 'লুকানো কোর্স',
    none: 'কোনো কোর্স লুকানো নেই।',
    unhide: 'দেখান'
  },

  courseFiles: {
    backToCourses: 'কোর্সে ফিরে যান',
    addFile: 'ফাইল যোগ করুন…',
    ignoredFiles: 'উপেক্ষিত ফাইল',
    couldNotRead: (fileCount, firstName, error) =>
      `${fileCount === 1 ? `"${firstName}"` : 'ছাড়া ফাইলগুলো'} পড়া যায়নি — ফাইলটি হয়তো সরানো বা মুছে ফেলা হয়েছে, ` +
      `অথবা এখনও ডাউনলোড হচ্ছে। একটি স্থির জায়গা থেকে আবার চেষ্টা করুন। (${error})`,
    couldNotAdd: (fileCount, error) => `${fileCount === 1 ? 'ফাইলটি' : 'ফাইলগুলো'} যোগ করা যায়নি: ${error}`,
    dropFiles: (name) => `"${name}"-এ যোগ করতে ফাইল এখানে ছাড়ুন`,
    searchPlaceholder: 'নাম দিয়ে ফাইল খুঁজুন…',
    noMatches: (query) => `"${query}"-এর সাথে মেলে এমন কোনো ফাইল নেই।`,
    noFiles: 'এই কোর্সের এখনও কোনো ফাইল ডাউনলোড হয়নি।'
  },

  fileRow: {
    viewHistory: 'সংস্করণের ইতিহাস দেখুন',
    lastSaved: (date) => `শেষ সংরক্ষণ: ${date}`,
    manual: 'ম্যানুয়াল',
    manualTitle: 'হাতে যোগ করা, Moodle থেকে ডাউনলোড করা নয়',
    ignored: 'উপেক্ষিত',
    ignoredTitle: 'ডাউনলোড এই ফাইলটি যেমন আছে তেমনই রাখে',
    ignoreTitle: 'এই ফাইলের পরিবর্তন উপেক্ষা করুন',
    unignoreTitle: 'এই ফাইল উপেক্ষা করা বন্ধ করুন',
    ignoredWithFolderTitle: 'ফোল্ডারসহ উপেক্ষিত',
    deleteTitle: 'এই ফাইলটি আপনার ইতিহাস থেকে মুছুন',
    downloadTitle: 'আপনার ডাউনলোডস ফোল্ডারে ডাউনলোড করুন',
    deleteConfirmTitle: (name) => `"${name}" মুছবেন?`,
    deleteConfirmMessage:
      'এতে ফাইলটি ও এর সব সংরক্ষিত সংস্করণ আপনার ইতিহাস থেকে সরে যাবে। এটি এখনও Moodle-এ থাকলে ' +
      'এই কোর্সের পরের ডাউনলোডে এটি নতুন ফাইল হিসেবে আবার যোগ হবে।'
  },

  folderRow: {
    ignoreTitle: 'এই ফোল্ডার ও এর সব কিছু উপেক্ষা করুন',
    unignoreTitle: 'এই ফোল্ডার উপেক্ষা করা বন্ধ করুন',
    ignoredTitle: 'ডাউনলোড এই ফোল্ডার ও এর সব কিছু যেমন আছে তেমনই রাখে',
    deleteTitle: 'এই ফোল্ডারটি আপনার ইতিহাস থেকে মুছুন',
    downloadTitle: 'এই ফোল্ডারটি zip হিসেবে ডাউনলোড করুন',
    couldNotDownload: (name, error) => `"${name}" ডাউনলোড করা যায়নি: ${error}`,
    deleteConfirmTitle: (name) => `"${name}" মুছবেন?`,
    deleteConfirmMessage: (fileCount) =>
      `এতে ফোল্ডারটি, এর ${fileCount}টি ফাইল ও সেগুলোর সব সংরক্ষিত সংস্করণ আপনার ইতিহাস থেকে সরে যাবে। ` +
      'যা কিছু এখনও Moodle-এ আছে, পরের বার এই কোর্স ডাউনলোড করলে তা নতুন হিসেবে আবার যোগ হবে।'
  },

  recentlyOpened: {
    title: 'সম্প্রতি খোলা',
    remove: 'সম্প্রতি খোলা তালিকা থেকে সরান',
    showAll: 'সম্প্রতি খোলা সব দেখুন'
  },

  recentSettings: {
    title: 'সম্প্রতি খোলা',
    appliesToAll: 'সব কোর্সে প্রযোজ্য।',
    show: 'সম্প্রতি খোলা ফাইল দেখান',
    noLimit: 'কোনো সীমা নেই',
    maximum: 'প্রতি কোর্সে সম্প্রতি খোলা ফাইলের সর্বোচ্চ সংখ্যা'
  },

  downloadNames: {
    title: 'ডাউনলোডের নাম',
    description: 'সব কোর্সে প্রযোজ্য। ট্যাগবিহীন কোর্সের ফাইল নিজের নামেই ডাউনলোড হয়।',
    prefixCourseTag: 'ডাউনলোডের নামের শুরুতে কোর্সের ট্যাগ যোগ করুন (যেমন TAG_file.pdf)'
  },

  sideMargin: {
    title: 'পাশের মার্জিন',
    description:
      'বড় করা উইন্ডোতে বিষয়বস্তুর প্রতিটি পাশে ফাঁকা জায়গা, স্ক্রিনের অংশ হিসেবে। ছোট উইন্ডোতে বিষয়বস্তু ' +
      'এই প্রস্থই ধরে রাখে — আগে মার্জিন ব্যবহার করে, তারপর পুরো উইন্ডো।',
    label: (percent) => `প্রতি পাশে ${percent}%`
  },

  courseListStyle: {
    title: 'কোর্স তালিকার ধরন',
    description: 'এই পৃষ্ঠায় কোর্সগুলো কীভাবে দেখানো হবে।',
    cards: 'কার্ড',
    rows: 'সারি'
  },

  courseColor: {
    title: (name) => `"${name}"-এর রং`,
    palette: 'প্যালেট',
    custom: 'নিজের পছন্দের রং',
    automatic: 'স্বয়ংক্রিয় রং ব্যবহার করুন'
  },

  setInstitution: {
    title: 'প্রতিষ্ঠান দিন',
    description: 'যে কোর্সগুলোতে এই প্রতিষ্ঠান দিতে চান সেগুলো বাছুন। সরাতে চাইলে খালি রাখুন।',
    courses: (count) => (count === 0 ? 'কোর্স' : `কোর্স (${count}টি নির্বাচিত)`),
    selectAll: 'সব নির্বাচন',
    selectNone: 'কোনোটি নয়',
    hidden: 'লুকানো',
    apply: (count) => (count === 1 ? '১টি কোর্সে প্রয়োগ করুন' : `${count}টি কোর্সে প্রয়োগ করুন`),
    remove: (count) => (count === 1 ? '১টি কোর্স থেকে সরান' : `${count}টি কোর্স থেকে সরান`)
  },

  ignoredFiles: {
    title: 'উপেক্ষিত ফাইল',
    description:
      'ডাউনলোড এই ফাইলগুলো যেমন আছে তেমনই রাখে: নতুন সংস্করণ নেই, কখনো মুছে ফেলা হিসেবে চিহ্নিত হয় না, আর এখনো ট্র্যাক করা না হলে যোগ করা হয় না।',
    pathLabel: 'ফাইলের পথ',
    placeholder: 'ফোল্ডার/ফাইল.pdf',
    hint:
      'এক্সটেনশন আর যে ফোল্ডারগুলোতে ফাইলটি আছে সেগুলো লিখুন: কোর্সের রুটে থাকা ফাইল শুধু তার নাম। ভিন্ন ফোল্ডারে একই নামের ফাইল আলাদা ফাইল। পুরো ফোল্ডার ও এর সব কিছু উপেক্ষা করতে পথের শেষে / দিন।',
    add: 'যোগ করুন',
    folder: 'ফোল্ডার',
    remove: (path) => `${path} উপেক্ষা করা বন্ধ করুন`,
    empty: 'কোনো উপেক্ষিত ফাইল নেই।',
    duplicate: 'ফাইলটি ইতিমধ্যে তালিকায় আছে।',
    notFound: 'এখনো এই কোর্সে নেই',
    askDeleteTitle: (count, name) => (count === 1 ? `"${name}" এখন উপেক্ষিত` : `${count}টি ফাইল এখন উপেক্ষিত`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'ডাউনলোড ফাইলটি যেমন আছে তেমনই রাখবে। এর সব সংরক্ষিত সংস্করণসহ এটি এই কোর্স থেকে মুছেও ফেলতে চান? যতক্ষণ উপেক্ষিত থাকবে, পরের ডাউনলোড এটি আবার যোগ করবে না।'
        : 'ডাউনলোড ফাইলগুলো যেমন আছে তেমনই রাখবে। এগুলোর সব সংরক্ষিত সংস্করণসহ এই কোর্স থেকে মুছেও ফেলতে চান? যতক্ষণ উপেক্ষিত থাকবে, পরের ডাউনলোড এগুলো আবার যোগ করবে না।',
    keep: (count) => (count === 1 ? 'রেখে দিন' : 'রেখে দিন')
  },

  upload: {
    titleOne: (name) => `"${name}" যোগ করুন`,
    titleMany: (count) => `${count}টি ফাইল যোগ করুন`,
    where: (count) => `${count === 1 ? 'এটি' : 'এগুলো'} কোথায় সংরক্ষণ করতে চান?`,
    courseRoot: 'কোর্সের মূল ফোল্ডার',
    existingFolder: 'বিদ্যমান ফোল্ডার',
    newFolder: 'নতুন ফোল্ডার',
    folderNamePlaceholder: 'ফোল্ডারের নাম',
    newFolderNameLabel: 'নতুন ফোল্ডারের নাম',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' এই ফোল্ডারে আগে থেকেই আছে — নতুন ফাইলটি এর নতুন সংস্করণ হিসেবে যোগ হবে।',
    add: 'যোগ করুন',
    adding: 'যোগ হচ্ছে…'
  },

  versions: {
    whichVersion: 'কোন সংস্করণ?',
    downloadTitle: 'এই সংস্করণটি আপনার ডাউনলোডস ফোল্ডারে ডাউনলোড করুন',
    diffVsPrevious: 'আগেরটির সাথে তুলনা',
    comparing: (from, to) => `তুলনা হচ্ছে v${from} → v${to}`,
    loadingDiff: 'পার্থক্য লোড হচ্ছে…',
    binaryChanged: 'বাইনারি ফাইল — বিষয়বস্তু বদলেছে।',
    size: (from, to, delta) => `আকার: ${from} → ${to} (${delta})`,
    deleteTitle: 'এই সংস্করণটি মুছুন',
    deleteConfirmTitle: (label) => `${label} মুছবেন?`,
    deleteConfirmMessage:
      'এই সংস্করণটি ফাইলের ইতিহাস থেকে স্থায়ীভাবে সরে যাবে। অন্য সংস্করণগুলো ও ফাইলটি থেকে যাবে।'
  },

  openFile: {
    downloadInterrupted: 'ডাউনলোড বাধাগ্রস্ত হয়েছে।',
    couldNotOpen: (filename, error) =>
      `"${filename}" ডাউনলোড হয়েছে, কিন্তু স্বয়ংক্রিয়ভাবে খোলা যায়নি (${error})।\n\n` +
      'আপনি এটি Chrome-এর ডাউনলোডস থেকে খুলতে পারেন (Ctrl+J / Cmd+Shift+J)। ' +
      'টিপ: সেখানে কোনো ডাউনলোডে রাইট-ক্লিক করে "এই ধরনের ফাইল সবসময় খুলুন" বেছে নিন, যাতে এখন থেকে ' +
      'এটি স্বয়ংক্রিয়ভাবে হয়।'
  },

  backup: {
    courseNotFound: 'কোর্স পাওয়া যায়নি।',
    invalid: (reason) => `এটি বৈধ Moodle Archive ব্যাকআপ নয় (${reason})।`,
    notZip: 'zip ফাইল নয়',
    missingManifest: 'data.json নেই',
    invalidJson: 'data.json বৈধ JSON নয়',
    noCourses: 'data.json-এ কোনো কোর্সের বিবরণ নেই'
  },

  viewer: {
    notFoundTitle: 'ফাইল পাওয়া যায়নি',
    notFoundText: 'এই ফাইলটি আর আপনার Moodle Archive ইতিহাসে নেই — হয়তো মুছে ফেলা হয়েছে।',
    cannotPreview: 'এই ধরনের ফাইল ব্রাউজারে প্রিভিউ করা যায় না।',
    zoomOut: 'ছোট করুন',
    zoomIn: 'বড় করুন',
    fitVertically: 'উল্লম্বভাবে মানানসই করুন',
    fitHorizontally: 'অনুভূমিকভাবে মানানসই করুন'
  },

  popup: {
    cannotScan: 'এই পৃষ্ঠাটি স্ক্যান করা যায় না — আগে একটি Moodle কোর্সের ট্যাব খুলুন।',
    filesDownloaded: (count) => `${count}টি ফাইল ডাউনলোড হয়েছে`,
    downloading: 'ডাউনলোড হচ্ছে...',
    download: 'ডাউনলোড',
    history: 'ইতিহাস',
    addToQueue: 'সারিতে যোগ করুন',
    queued: (position) => `সারিতে আছে (#${position})`,
    queueTitle: 'এরপর',
    removeFromQueue: 'সারি থেকে সরান'
  },

  download: {
    unsupportedUrl: (url) => `অসমর্থিত URL: ${url}।`,
    processingLinks: 'লিংক প্রক্রিয়া করা হচ্ছে...',
    processing: (url) => `${url} প্রক্রিয়া করা হচ্ছে`,
    downloadingFiles: 'ফাইল ডাউনলোড হচ্ছে...',
    downloadingFile: (name) => `${name} ডাউনলোড হচ্ছে`,
    cancelled: (name, reason) =>
      `ডাউনলোড বাতিল: "${name}" ডাউনলোড করা যায়নি (${reason})। কিছুই সংরক্ষিত হয়নি — আবার চেষ্টা করুন।`,
    downloadFailed: 'ডাউনলোড ব্যর্থ হয়েছে',
    noResponse: 'উত্তরের অপেক্ষায় সময় শেষ হয়ে গেছে',
    stalled: 'আটকে গেছে: সময়মতো কোনো ডেটা আসেনি',
    noFileFound: 'কোনো ফাইল পাওয়া যায়নি।',
    saving: 'ইতিহাসে সংরক্ষণ হচ্ছে...',
    savingChunk: (index, total) => `ইতিহাসে সংরক্ষণ হচ্ছে... (${index}/${total})`,
    saved: 'ইতিহাসে সংরক্ষিত হয়েছে।',
    saveFailed: (reason) => `ইতিহাসে সংরক্ষণ করা যায়নি: ${reason}`,
    timedOut: 'উত্তরের অপেক্ষায় সময় শেষ হয়ে গেছে — আবার চেষ্টা করুন',
    unknownError: 'অজানা ত্রুটি',
    interrupted: 'ডাউনলোড বাধাগ্রস্ত হয়েছে: ট্যাবটি বন্ধ করা হয়েছে বা অন্য পৃষ্ঠায় চলে গেছে।',
    couldNotStart: (title) => `"${title}" শুরু করা যায়নি — এর ট্যাবটি খুলে আবার চেষ্টা করুন।`
  }
};
