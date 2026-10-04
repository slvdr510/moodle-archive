import type { Messages } from './en';

export const mr: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'slvdr510 यांनी बनवलेले',
    cancel: 'रद्द करा',
    save: 'जतन करा',
    close: 'बंद करा',
    delete: 'हटवा',
    export: 'निर्यात करा',
    download: 'डाउनलोड करा',
    moreOptions: 'आणखी पर्याय',
    exporting: 'निर्यात होत आहे…',
    importing: 'आयात होत आहे…',
    savedToDownloads: (name) => `"${name}" तुमच्या डाउनलोड्स फोल्डरमध्ये जतन झाले.`,
    couldNotExport: (name, error) => `"${name}" निर्यात करता आले नाही: ${error}`
  },

  header: {
    theme: 'थीम',
    themeLight: 'फिकट',
    themeSystem: 'सिस्टमप्रमाणे',
    themeDark: 'गडद',
    language: 'भाषा',
    languageAuto: 'ब्राउझरची भाषा'
  },

  relativeTime: {
    justNow: 'आत्ताच',
    minutes: (n) => `${n} मिनिटांपूर्वी`,
    hours: (n) => `${n} तासांपूर्वी`,
    days: (n) => `${n} दिवसांपूर्वी`,
    weeks: (n) => `${n} आठवड्यांपूर्वी`,
    months: (n) => `${n} महिन्यांपूर्वी`,
    years: (n) => `${n} वर्षांपूर्वी`
  },

  status: {
    new: 'नवीन',
    modified: 'बदललेले',
    deleted: 'हटवलेले',
    unchanged: 'बदल नाही'
  },

  courses: {
    openAllUrls: 'सर्व कोर्सचे URL उघडा',
    exportAll: 'सर्व कोर्स निर्यात करा',
    importCourses: 'कोर्स आयात करा',
    recentSettings: 'अलीकडे उघडलेल्या फाइल्सची सेटिंग्ज',
    downloadNameSettings: 'डाउनलोड नावांची सेटिंग्ज',
    sideMargin: 'बाजूचे समास',
    hiddenCourses: 'लपवलेले कोर्स',
    deleteAll: 'सर्व कोर्स हटवा',
    backupSaved: 'बॅकअप तुमच्या डाउनलोड्स फोल्डरमध्ये जतन झाला.',
    couldNotExportAll: (error) => `निर्यात करता आले नाही: ${error}`,
    noUrlsToOpen: 'उघडण्यासाठी कोणतेही कोर्स URL नाहीत.',
    imported: (courses, files, versions) =>
      `${courses} कोर्स, ${files} फाइल्स आणि ${versions} आवृत्त्या आयात झाल्या.`,
    notABackup: (name) => `"${name}" ही या एक्स्टेंशनच्या कोर्स फॉरमॅटमधील zip फाइल नाही.`,
    couldNotImport: (details) => `आयात करता आले नाही: ${details}`,
    dropBackups: 'कोर्स आयात करण्यासाठी .zip बॅकअप इथे सोडा',
    exportAllTitle: 'सर्व कोर्स निर्यात करायचे?',
    exportAllMessage: 'ट्रॅक केलेला प्रत्येक कोर्स, फाइल आणि आवृत्ती एकाच zip मध्ये तुमच्या डाउनलोड्स फोल्डरमध्ये जतन होईल.',
    exportCourseTitle: (name) => `"${name}" निर्यात करायचे?`,
    exportCourseMessage: 'कोर्स, त्याच्या फाइल्स आणि सर्व आवृत्त्या एका zip मध्ये तुमच्या डाउनलोड्स फोल्डरमध्ये जतन होतील.',
    deleteAllTitle: 'सर्व कोर्स हटवायचे?',
    deleteAllMessage:
      'यामुळे एक्स्टेंशनने ट्रॅक केलेले सर्व कोर्स, फाइल्स आणि आवृत्ती इतिहास पुसला जाईल. ' +
      'नंतर एखादा कोर्स पुन्हा डाउनलोड केल्यास त्याचा इतिहास पुन्हा तयार होऊ लागेल.',
    deleteCourseTitle: (name) => `"${name}" हटवायचे?`,
    deleteCourseMessage:
      'यामुळे कोर्स आणि त्याच्या फाइल्स व आवृत्त्यांचा इतिहास काढून टाकला जाईल. हा कोर्स नंतर पुन्हा ' +
      'डाउनलोड केल्यास तो अगदी सुरुवातीपासून नव्याने तयार होईल.',
    emptyTitle: 'अजून कोणतेही कोर्स नाहीत',
    emptySubtitle: 'एखादा कोर्स पहिल्यांदा डाउनलोड केल्यावर तो आपोआप तयार होतो.',
    emptyStep1: 'Moodle मध्ये एखादा कोर्स उघडा',
    emptyStep2: 'एक्स्टेंशनच्या आयकॉनवर क्लिक करा',
    emptyStep3Before: '',
    emptyStep3After: ' दाबा',
    emptyHintBefore: 'आधीच बॅकअप आहे? त्याची ',
    emptyHintAfter: ' फाइल या पानावर कुठेही सोडा, ती आयात होईल.',
    allHidden: 'तुमचे सर्व कोर्स लपवलेले आहेत. एखादा परत आणण्यासाठी ⋮ मेनूमधील "लपवलेले कोर्स" वापरा.'
  },

  courseRow: {
    lastDownloaded: 'शेवटचे डाउनलोड',
    openInMoodle: 'कोर्स Moodle मध्ये उघडा',
    setTagName: 'टॅगचे नाव ठेवा',
    hideCourse: 'कोर्स लपवा',
    deleteCourse: 'कोर्स हटवा'
  },

  hiddenCourses: {
    title: 'लपवलेले कोर्स',
    none: 'कोणताही कोर्स लपवलेला नाही.',
    unhide: 'दाखवा'
  },

  courseFiles: {
    backToCourses: 'कोर्सकडे परत जा',
    addFile: 'फाइल जोडा…',
    couldNotRead: (fileCount, firstName, error) =>
      `${fileCount === 1 ? `"${firstName}"` : 'सोडलेल्या फाइल्स'} वाचता आल्या नाहीत — फाइल हलवली किंवा हटवली गेली ` +
      `असेल, किंवा अजून डाउनलोड होत असेल. स्थिर ठिकाणाहून पुन्हा प्रयत्न करा. (${error})`,
    couldNotAdd: (fileCount, error) => `${fileCount === 1 ? 'फाइल' : 'फाइल्स'} जोडता आल्या नाहीत: ${error}`,
    dropFiles: (name) => `"${name}" मध्ये जोडण्यासाठी फाइल्स इथे सोडा`,
    searchPlaceholder: 'नावाने फाइल्स शोधा…',
    noMatches: (query) => `"${query}" शी जुळणारी कोणतीही फाइल नाही.`,
    noFiles: 'या कोर्सची अजून कोणतीही फाइल डाउनलोड झालेली नाही.'
  },

  fileRow: {
    viewHistory: 'आवृत्ती इतिहास पाहा',
    lastSaved: (date) => `शेवटचे जतन: ${date}`,
    manual: 'हाताने',
    manualTitle: 'हाताने जोडलेली, Moodle मधून डाउनलोड केलेली नाही',
    deleteTitle: 'ही फाइल तुमच्या इतिहासातून हटवा',
    downloadTitle: 'तुमच्या डाउनलोड्स फोल्डरमध्ये डाउनलोड करा',
    deleteConfirmTitle: (name) => `"${name}" हटवायचे?`,
    deleteConfirmMessage:
      'यामुळे फाइल आणि तिच्या सर्व जतन केलेल्या आवृत्त्या तुमच्या इतिहासातून काढल्या जातील. ती अजूनही Moodle मध्ये ' +
      'असल्यास, या कोर्सच्या पुढच्या डाउनलोडमध्ये ती नवीन फाइल म्हणून पुन्हा जोडली जाईल.'
  },

  folderRow: {
    deleteTitle: 'हा फोल्डर तुमच्या इतिहासातून हटवा',
    downloadTitle: 'हा फोल्डर zip म्हणून डाउनलोड करा',
    couldNotDownload: (name, error) => `"${name}" डाउनलोड करता आले नाही: ${error}`,
    deleteConfirmTitle: (name) => `"${name}" हटवायचे?`,
    deleteConfirmMessage: (fileCount) =>
      `यामुळे फोल्डर, त्यातील ${fileCount} फाइल्स आणि त्यांच्या सर्व जतन केलेल्या आवृत्त्या तुमच्या इतिहासातून काढल्या ` +
      'जातील. जे अजूनही Moodle मध्ये आहे ते पुढच्या वेळी हा कोर्स डाउनलोड केल्यावर नवीन म्हणून पुन्हा जोडले जाईल.'
  },

  recentlyOpened: {
    title: 'अलीकडे उघडलेल्या',
    remove: 'अलीकडे उघडलेल्या यादीतून काढा'
  },

  recentSettings: {
    title: 'अलीकडे उघडलेल्या',
    appliesToAll: 'सर्व कोर्सना लागू.',
    show: 'अलीकडे उघडलेल्या फाइल्स दाखवा',
    noLimit: 'मर्यादा नाही',
    maximum: 'प्रत्येक कोर्ससाठी अलीकडे उघडलेल्या फाइल्सची कमाल संख्या'
  },

  downloadNames: {
    title: 'डाउनलोड नावे',
    description: 'सर्व कोर्सना लागू. टॅग नसलेल्या कोर्सच्या फाइल्स त्यांच्या मूळ नावाने डाउनलोड होतात.',
    prefixCourseTag: 'डाउनलोड नावांच्या सुरुवातीला कोर्सचा टॅग जोडा (उदा. TAG_file.pdf)'
  },

  sideMargin: {
    title: 'बाजूचे समास',
    description:
      'मोठ्या केलेल्या विंडोमध्ये मजकुराच्या प्रत्येक बाजूला रिकामी जागा, स्क्रीनच्या भागाप्रमाणे. लहान विंडोमध्ये ' +
      'मजकूर हीच रुंदी ठेवतो — आधी समास वापरतो आणि मग संपूर्ण विंडो.',
    label: (percent) => `प्रत्येक बाजूला ${percent}%`
  },

  upload: {
    titleOne: (name) => `"${name}" जोडा`,
    titleMany: (count) => `${count} फाइल्स जोडा`,
    where: (count) => `${count === 1 ? 'ती' : 'त्या'} कुठे जतन करायच्या आहेत?`,
    courseRoot: 'कोर्सचा मूळ फोल्डर',
    existingFolder: 'असलेला फोल्डर',
    newFolder: 'नवीन फोल्डर',
    folderNamePlaceholder: 'फोल्डरचे नाव',
    newFolderNameLabel: 'नवीन फोल्डरचे नाव',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' या फोल्डरमध्ये आधीच आहे — नवीन फाइल तिची नवीन आवृत्ती म्हणून जोडली जाईल.',
    add: 'जोडा',
    adding: 'जोडत आहे…'
  },

  versions: {
    whichVersion: 'कोणती आवृत्ती?',
    downloadTitle: 'ही आवृत्ती तुमच्या डाउनलोड्स फोल्डरमध्ये डाउनलोड करा',
    diffVsPrevious: 'आधीच्याशी तुलना',
    comparing: (from, to) => `तुलना v${from} → v${to}`,
    loadingDiff: 'फरक लोड होत आहे…',
    binaryChanged: 'बायनरी फाइल — मजकूर बदलला आहे.',
    size: (from, to, delta) => `आकार: ${from} → ${to} (${delta})`,
    deleteTitle: 'ही आवृत्ती हटवा',
    deleteConfirmTitle: (label) => `${label} हटवायची?`,
    deleteConfirmMessage:
      'ही आवृत्ती फाइलच्या इतिहासातून कायमची काढली जाईल. इतर आवृत्त्या आणि फाइल तशाच राहतील.'
  },

  openFile: {
    downloadInterrupted: 'डाउनलोड मध्येच थांबले.',
    couldNotOpen: (filename, error) =>
      `"${filename}" डाउनलोड झाली, पण आपोआप उघडता आली नाही (${error}).\n\n` +
      'तुम्ही ती Chrome च्या डाउनलोड्समधून उघडू शकता (Ctrl+J / Cmd+Shift+J). ' +
      'टीप: तिथे एखाद्या डाउनलोडवर राइट-क्लिक करून "या प्रकारच्या फाइल्स नेहमी उघडा" निवडा, म्हणजे यापुढे ' +
      'हे आपोआप होईल.'
  },

  backup: {
    courseNotFound: 'कोर्स सापडला नाही.',
    invalid: (reason) => `हा वैध Moodle Archive बॅकअप नाही (${reason}).`,
    notZip: 'zip फाइल नाही',
    missingManifest: 'data.json नाही',
    invalidJson: 'data.json वैध JSON नाही',
    noCourses: 'data.json मध्ये कोर्सचे वर्णन नाही'
  },

  viewer: {
    notFoundTitle: 'फाइल सापडली नाही',
    notFoundText: 'ही फाइल आता तुमच्या Moodle Archive इतिहासात नाही — कदाचित ती हटवली गेली असेल.',
    cannotPreview: 'या प्रकारच्या फाइलचे ब्राउझरमध्ये पूर्वावलोकन करता येत नाही.'
  },

  popup: {
    cannotScan: 'हे पान स्कॅन करता येत नाही — आधी Moodle कोर्सचा टॅब उघडा.',
    filesDownloaded: (count) => `${count} फाइल्स डाउनलोड झाल्या`,
    downloading: 'डाउनलोड होत आहे...',
    download: 'डाउनलोड करा',
    history: 'इतिहास',
    addToQueue: 'रांगेत जोडा',
    queued: (position) => `रांगेत (क्र. ${position})`,
    queueTitle: 'पुढे',
    removeFromQueue: 'रांगेतून काढा'
  },

  download: {
    unsupportedUrl: (url) => `असमर्थित URL: ${url}.`,
    processingLinks: 'लिंक्सवर प्रक्रिया होत आहे...',
    processing: (url) => `${url} वर प्रक्रिया होत आहे`,
    downloadingFiles: 'फाइल्स डाउनलोड होत आहेत...',
    downloadingFile: (name) => `${name} डाउनलोड होत आहे`,
    cancelled: (name, reason) =>
      `डाउनलोड रद्द: "${name}" डाउनलोड करता आली नाही (${reason}). काहीही जतन झाले नाही — पुन्हा प्रयत्न करा.`,
    downloadFailed: 'डाउनलोड अयशस्वी',
    noResponse: 'प्रतिसादाची वाट पाहताना वेळ संपली',
    stalled: 'अडकले: वेळेत कोणताही डेटा मिळाला नाही',
    noFileFound: 'कोणतीही फाइल सापडली नाही.',
    saving: 'इतिहासात जतन होत आहे...',
    savingChunk: (index, total) => `इतिहासात जतन होत आहे... (${index}/${total})`,
    saved: 'इतिहासात जतन झाले.',
    saveFailed: (reason) => `इतिहासात जतन करता आले नाही: ${reason}`,
    timedOut: 'प्रतिसादाची वाट पाहताना वेळ संपली — पुन्हा प्रयत्न करा',
    unknownError: 'अज्ञात त्रुटी',
    interrupted: 'डाउनलोड थांबले: टॅब बंद झाला किंवा दुसऱ्या पानावर गेला.',
    couldNotStart: (title) => `"${title}" सुरू करता आले नाही — त्याचा टॅब उघडून पुन्हा प्रयत्न करा.`
  }
};
