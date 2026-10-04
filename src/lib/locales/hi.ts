import type { Messages } from './en';

export const hi: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'slvdr510 द्वारा',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    close: 'बंद करें',
    delete: 'हटाएँ',
    export: 'निर्यात करें',
    download: 'डाउनलोड करें',
    moreOptions: 'और विकल्प',
    exporting: 'निर्यात हो रहा है…',
    importing: 'आयात हो रहा है…',
    savedToDownloads: (name) => `"${name}" आपके डाउनलोड फ़ोल्डर में सहेजा गया।`,
    couldNotExport: (name, error) => `"${name}" निर्यात नहीं हो सका: ${error}`
  },

  header: {
    theme: 'थीम',
    themeLight: 'हल्की',
    themeSystem: 'सिस्टम के अनुसार',
    themeDark: 'गहरी',
    language: 'भाषा',
    languageAuto: 'ब्राउज़र की भाषा'
  },

  relativeTime: {
    justNow: 'अभी-अभी',
    minutes: (n) => `${n} मिनट पहले`,
    hours: (n) => `${n} घंटे पहले`,
    days: (n) => `${n} दिन पहले`,
    weeks: (n) => `${n} सप्ताह पहले`,
    months: (n) => `${n} महीने पहले`,
    years: (n) => `${n} वर्ष पहले`
  },

  status: {
    new: 'नया',
    modified: 'बदला गया',
    deleted: 'हटाया गया',
    unchanged: 'अपरिवर्तित'
  },

  courses: {
    openAllUrls: 'सभी कोर्स URL खोलें',
    exportAll: 'सभी कोर्स निर्यात करें',
    importCourses: 'कोर्स आयात करें',
    recentSettings: 'हाल में खोली गई फ़ाइलों की सेटिंग',
    downloadNameSettings: 'डाउनलोड नाम सेटिंग',
    sideMargin: 'किनारे के मार्जिन',
    hiddenCourses: 'छिपे हुए कोर्स',
    deleteAll: 'सभी कोर्स हटाएँ',
    backupSaved: 'बैकअप आपके डाउनलोड फ़ोल्डर में सहेजा गया।',
    couldNotExportAll: (error) => `निर्यात नहीं हो सका: ${error}`,
    noUrlsToOpen: 'खोलने के लिए कोई कोर्स URL नहीं है।',
    imported: (courses, files, versions) =>
      `${courses} कोर्स, ${files} फ़ाइलें और ${versions} संस्करण आयात किए गए।`,
    notABackup: (name) => `"${name}" इस एक्सटेंशन के कोर्स फ़ॉर्मैट वाली zip फ़ाइल नहीं है।`,
    couldNotImport: (details) => `आयात नहीं हो सका: ${details}`,
    dropBackups: 'कोर्स आयात करने के लिए .zip बैकअप यहाँ छोड़ें',
    exportAllTitle: 'सभी कोर्स निर्यात करें?',
    exportAllMessage: 'हर ट्रैक किया गया कोर्स, फ़ाइल और संस्करण एक zip में आपके डाउनलोड फ़ोल्डर में सहेजा जाएगा।',
    exportCourseTitle: (name) => `"${name}" निर्यात करें?`,
    exportCourseMessage: 'कोर्स, उसकी फ़ाइलें और हर संस्करण एक zip में आपके डाउनलोड फ़ोल्डर में सहेजे जाएँगे।',
    deleteAllTitle: 'सभी कोर्स हटाएँ?',
    deleteAllMessage:
      'इससे एक्सटेंशन द्वारा ट्रैक किए गए सभी कोर्स, फ़ाइलें और संस्करण इतिहास मिट जाएँगे। ' +
      'बाद में किसी कोर्स को फिर से डाउनलोड करें ताकि उसका इतिहास दोबारा बनना शुरू हो।',
    deleteCourseTitle: (name) => `"${name}" हटाएँ?`,
    deleteCourseMessage:
      'इससे कोर्स और उसकी फ़ाइलों व संस्करणों का इतिहास हट जाएगा। अगर आप बाद में यह कोर्स फिर से ' +
      'डाउनलोड करते हैं, तो यह शुरू से नया बन जाएगा।',
    emptyTitle: 'अभी कोई कोर्स नहीं',
    emptySubtitle: 'कोर्स पहली बार डाउनलोड करने पर अपने-आप बन जाते हैं।',
    emptyStep1: 'Moodle में कोई कोर्स खोलें',
    emptyStep2: 'एक्सटेंशन आइकन पर क्लिक करें',
    emptyStep3Before: '',
    emptyStep3After: ' दबाएँ',
    emptyHintBefore: 'पहले से बैकअप है? उसकी ',
    emptyHintAfter: ' फ़ाइल इस पेज पर कहीं भी छोड़ें, वह आयात हो जाएगी।',
    allHidden: 'आपके सभी कोर्स छिपे हुए हैं। किसी को वापस लाने के लिए ⋮ मेनू में "छिपे हुए कोर्स" का उपयोग करें।'
  },

  courseRow: {
    lastDownloaded: 'पिछला डाउनलोड',
    openInMoodle: 'कोर्स Moodle में खोलें',
    setTagName: 'टैग नाम सेट करें',
    hideCourse: 'कोर्स छिपाएँ',
    deleteCourse: 'कोर्स हटाएँ'
  },

  hiddenCourses: {
    title: 'छिपे हुए कोर्स',
    none: 'कोई कोर्स छिपा हुआ नहीं है।',
    unhide: 'दिखाएँ'
  },

  courseFiles: {
    backToCourses: 'कोर्स पर वापस जाएँ',
    addFile: 'फ़ाइल जोड़ें…',
    couldNotRead: (fileCount, firstName, error) =>
      `${fileCount === 1 ? `"${firstName}"` : 'छोड़ी गई फ़ाइलें'} पढ़ी नहीं जा सकीं — हो सकता है फ़ाइल हटाई या ` +
      `खिसकाई गई हो, या अभी डाउनलोड हो रही हो। किसी स्थायी जगह से फिर से कोशिश करें। (${error})`,
    couldNotAdd: (fileCount, error) => `${fileCount === 1 ? 'फ़ाइल' : 'फ़ाइलें'} जोड़ी नहीं जा सकीं: ${error}`,
    dropFiles: (name) => `"${name}" में जोड़ने के लिए फ़ाइलें यहाँ छोड़ें`,
    searchPlaceholder: 'नाम से फ़ाइलें खोजें…',
    noMatches: (query) => `"${query}" से मेल खाती कोई फ़ाइल नहीं।`,
    noFiles: 'इस कोर्स की अभी कोई फ़ाइल डाउनलोड नहीं हुई है।'
  },

  fileRow: {
    viewHistory: 'संस्करण इतिहास देखें',
    lastSaved: (date) => `पिछली बार सहेजा गया: ${date}`,
    manual: 'मैन्युअल',
    manualTitle: 'हाथ से जोड़ी गई, Moodle से डाउनलोड नहीं हुई',
    deleteTitle: 'यह फ़ाइल अपने इतिहास से हटाएँ',
    downloadTitle: 'अपने डाउनलोड फ़ोल्डर में डाउनलोड करें',
    deleteConfirmTitle: (name) => `"${name}" हटाएँ?`,
    deleteConfirmMessage:
      'इससे फ़ाइल और उसके सभी सहेजे गए संस्करण आपके इतिहास से हट जाएँगे। अगर यह अभी भी Moodle में है, ' +
      'तो इस कोर्स के अगले डाउनलोड में यह नई फ़ाइल के रूप में फिर जुड़ जाएगी।'
  },

  folderRow: {
    deleteTitle: 'यह फ़ोल्डर अपने इतिहास से हटाएँ',
    downloadTitle: 'यह फ़ोल्डर zip के रूप में डाउनलोड करें',
    couldNotDownload: (name, error) => `"${name}" डाउनलोड नहीं हो सका: ${error}`,
    deleteConfirmTitle: (name) => `"${name}" हटाएँ?`,
    deleteConfirmMessage: (fileCount) =>
      `इससे फ़ोल्डर, उसकी ${fileCount} फ़ाइलें और उनके सभी सहेजे गए संस्करण आपके इतिहास से हट जाएँगे। ` +
      'जो कुछ अभी भी Moodle में है, वह अगली बार यह कोर्स डाउनलोड करने पर नए के रूप में फिर जुड़ जाएगा।'
  },

  recentlyOpened: {
    title: 'हाल में खोली गई',
    remove: 'हाल में खोली गई सूची से हटाएँ'
  },

  recentSettings: {
    title: 'हाल में खोली गई',
    appliesToAll: 'सभी कोर्स पर लागू होता है।',
    show: 'हाल में खोली गई फ़ाइलें दिखाएँ',
    noLimit: 'कोई सीमा नहीं',
    maximum: 'हर कोर्स में हाल में खोली गई फ़ाइलों की अधिकतम संख्या'
  },

  downloadNames: {
    title: 'डाउनलोड नाम',
    description: 'सभी कोर्स पर लागू होता है। बिना टैग वाले कोर्स की फ़ाइलें अपने मूल नाम से डाउनलोड होती हैं।',
    prefixCourseTag: 'डाउनलोड नामों की शुरुआत में कोर्स टैग जोड़ें (जैसे TAG_file.pdf)'
  },

  sideMargin: {
    title: 'किनारे के मार्जिन',
    description:
      'बड़ी की गई विंडो में सामग्री के हर ओर खाली जगह, स्क्रीन के हिस्से के रूप में। छोटी विंडो में सामग्री ' +
      'यही चौड़ाई बनाए रखती है — पहले मार्जिन इस्तेमाल होते हैं, फिर पूरी विंडो।',
    label: (percent) => `हर ओर ${percent}%`
  },

  upload: {
    titleOne: (name) => `"${name}" जोड़ें`,
    titleMany: (count) => `${count} फ़ाइलें जोड़ें`,
    where: (count) => `${count === 1 ? 'इसे' : 'इन्हें'} कहाँ सहेजना चाहते हैं?`,
    courseRoot: 'कोर्स का मूल फ़ोल्डर',
    existingFolder: 'मौजूदा फ़ोल्डर',
    newFolder: 'नया फ़ोल्डर',
    folderNamePlaceholder: 'फ़ोल्डर का नाम',
    newFolderNameLabel: 'नए फ़ोल्डर का नाम',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' इस फ़ोल्डर में पहले से है — नई फ़ाइल उसके नए संस्करण के रूप में जोड़ी जाएगी।',
    add: 'जोड़ें',
    adding: 'जोड़ा जा रहा है…'
  },

  versions: {
    whichVersion: 'कौन-सा संस्करण?',
    downloadTitle: 'यह संस्करण अपने डाउनलोड फ़ोल्डर में डाउनलोड करें',
    diffVsPrevious: 'पिछले से तुलना',
    comparing: (from, to) => `तुलना v${from} → v${to}`,
    loadingDiff: 'अंतर लोड हो रहा है…',
    binaryChanged: 'बाइनरी फ़ाइल — सामग्री बदल गई।',
    size: (from, to, delta) => `आकार: ${from} → ${to} (${delta})`,
    deleteTitle: 'यह संस्करण हटाएँ',
    deleteConfirmTitle: (label) => `${label} हटाएँ?`,
    deleteConfirmMessage:
      'यह संस्करण फ़ाइल के इतिहास से हमेशा के लिए हट जाएगा। बाकी संस्करण और फ़ाइल बनी रहेंगी।'
  },

  openFile: {
    downloadInterrupted: 'डाउनलोड बीच में रुक गया।',
    couldNotOpen: (filename, error) =>
      `"${filename}" डाउनलोड हो गई, लेकिन अपने-आप खुल नहीं सकी (${error})।\n\n` +
      'आप इसे Chrome के डाउनलोड से खोल सकते हैं (Ctrl+J / Cmd+Shift+J)। ' +
      'सुझाव: वहाँ किसी डाउनलोड पर राइट-क्लिक करके "इस प्रकार की फ़ाइलें हमेशा खोलें" चुनें, ताकि आगे से ' +
      'यह अपने-आप हो।'
  },

  backup: {
    courseNotFound: 'कोर्स नहीं मिला।',
    invalid: (reason) => `यह Moodle Archive का मान्य बैकअप नहीं है (${reason})।`,
    notZip: 'zip फ़ाइल नहीं है',
    missingManifest: 'data.json मौजूद नहीं है',
    invalidJson: 'data.json मान्य JSON नहीं है',
    noCourses: 'data.json में कोर्स का विवरण नहीं है'
  },

  viewer: {
    notFoundTitle: 'फ़ाइल नहीं मिली',
    notFoundText: 'यह फ़ाइल अब आपके Moodle Archive इतिहास में नहीं है — शायद हटा दी गई है।',
    cannotPreview: 'इस प्रकार की फ़ाइल का ब्राउज़र में पूर्वावलोकन नहीं हो सकता।'
  },

  popup: {
    cannotScan: 'यह पेज स्कैन नहीं हो सकता — पहले Moodle कोर्स का टैब खोलें।',
    filesDownloaded: (count) => `${count} फ़ाइलें डाउनलोड हुईं`,
    downloading: 'डाउनलोड हो रहा है...',
    download: 'डाउनलोड करें',
    history: 'इतिहास',
    addToQueue: 'कतार में जोड़ें',
    queued: (position) => `कतार में (क्रम ${position})`,
    queueTitle: 'आगे',
    removeFromQueue: 'कतार से हटाएँ'
  },

  download: {
    unsupportedUrl: (url) => `असमर्थित URL: ${url}।`,
    processingLinks: 'लिंक प्रोसेस हो रहे हैं...',
    processing: (url) => `${url} प्रोसेस हो रहा है`,
    downloadingFiles: 'फ़ाइलें डाउनलोड हो रही हैं...',
    downloadingFile: (name) => `${name} डाउनलोड हो रही है`,
    cancelled: (name, reason) =>
      `डाउनलोड रद्द: "${name}" डाउनलोड नहीं हो सकी (${reason})। कुछ भी सहेजा नहीं गया — फिर से कोशिश करें।`,
    downloadFailed: 'डाउनलोड विफल रहा',
    noResponse: 'जवाब का इंतज़ार करते-करते समय समाप्त हो गया',
    stalled: 'अटका हुआ: समय पर कोई डेटा नहीं मिला',
    noFileFound: 'कोई फ़ाइल नहीं मिली।',
    saving: 'इतिहास में सहेजा जा रहा है...',
    savingChunk: (index, total) => `इतिहास में सहेजा जा रहा है... (${index}/${total})`,
    saved: 'इतिहास में सहेजा गया।',
    saveFailed: (reason) => `इतिहास में सहेजा नहीं जा सका: ${reason}`,
    timedOut: 'जवाब का इंतज़ार करते-करते समय समाप्त हो गया — फिर से कोशिश करें',
    unknownError: 'अज्ञात त्रुटि',
    interrupted: 'डाउनलोड रुक गया: टैब बंद हो गया या किसी दूसरे पेज पर चला गया।',
    couldNotStart: (title) => `"${title}" शुरू नहीं हो सका — उसका टैब खोलकर फिर से कोशिश करें।`
  }
};
