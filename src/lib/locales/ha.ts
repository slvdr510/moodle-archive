import type { Messages } from './en';

export const ha: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'daga slvdr510',
    cancel: 'Soke',
    save: 'Ajiye',
    close: 'Rufe',
    delete: 'Share',
    export: 'Fitar',
    download: 'Sauke',
    moreOptions: 'Ƙarin zaɓuɓɓuka',
    exporting: 'Ana fitarwa…',
    importing: 'Ana shigowa da shi…',
    savedToDownloads: (name) => `An ajiye "${name}" a cikin babban fayil ɗin Abubuwan da aka sauke.`,
    couldNotExport: (name, error) => `Ba a iya fitar da "${name}" ba: ${error}`
  },

  header: {
    theme: 'Jigo',
    themeLight: 'Haske',
    themeSystem: 'Kamar na tsarin',
    themeDark: 'Duhu',
    language: 'Harshe',
    languageAuto: 'Harshen burauza'
  },

  relativeTime: {
    justNow: 'yanzun nan',
    minutes: (n) => `minti ${n} da suka wuce`,
    hours: (n) => `awa ${n} da suka wuce`,
    days: (n) => `kwana ${n} da suka wuce`,
    weeks: (n) => `mako ${n} da suka wuce`,
    months: (n) => `wata ${n} da suka wuce`,
    years: (n) => `shekara ${n} da suka wuce`
  },

  status: {
    new: 'Sabo',
    modified: 'An canza',
    deleted: 'An share',
    unchanged: 'Ba a canza ba'
  },

  courses: {
    openAllUrls: 'Buɗe URL ɗin duk kwasa-kwasai',
    exportAll: 'Fitar da duk kwasa-kwasai',
    importCourses: 'Shigo da kwasa-kwasai',
    recentSettings: 'Saitunan waɗanda aka buɗe kwanan nan',
    downloadNameSettings: 'Saitunan sunayen saukewa',
    sideMargin: 'Gefe-gefe',
    hiddenCourses: 'Kwasa-kwasan da aka ɓoye',
    deleteAll: 'Share duk kwasa-kwasai',
    backupSaved: 'An ajiye ajiyar a cikin babban fayil ɗin Abubuwan da aka sauke.',
    couldNotExportAll: (error) => `Ba a iya fitarwa ba: ${error}`,
    noUrlsToOpen: 'Babu URL na kwas da za a buɗe.',
    imported: (courses, files, versions) =>
      `An shigo da kwas ${courses}, fayil ${files} da siga ${versions}.`,
    notABackup: (name) => `"${name}" ba fayil ɗin zip ba ne a tsarin kwas da wannan ƙarin yake amfani da shi.`,
    couldNotImport: (details) => `Ba a iya shigo da ${details} ba`,
    dropBackups: 'Jefa ajiyar .zip a nan don shigo da kwasa-kwasansu',
    exportAllTitle: 'A fitar da duk kwasa-kwasai?',
    exportAllMessage:
      'Za a ajiye duk kwas, fayil da sigar da ake bibiya a cikin zip guda ɗaya a babban fayil ɗin Abubuwan da aka sauke.',
    exportCourseTitle: (name) => `A fitar da "${name}"?`,
    exportCourseMessage:
      'Za a ajiye kwas ɗin, fayilolinsa da duk sigogi a cikin zip a babban fayil ɗin Abubuwan da aka sauke.',
    deleteAllTitle: 'A share duk kwasa-kwasai?',
    deleteAllMessage:
      'Wannan zai goge duk kwasa-kwasai, fayiloli da tarihin sigogin da ƙarin yake bibiya. ' +
      'Sauke wani kwas kuma daga baya don fara sake gina tarihinsa.',
    deleteCourseTitle: (name) => `A share "${name}"?`,
    deleteCourseMessage:
      'Wannan zai cire kwas ɗin da tarihin fayiloli da sigoginsa. Idan ka sake sauke wannan kwas ' +
      'daga baya, za a sake ƙirƙirar shi daga farko.',
    emptyTitle: 'Babu kwasa-kwasai tukuna',
    emptySubtitle: 'Ana ƙirƙirar kwas kai tsaye a karon farko da ka sauke shi.',
    emptyStep1: 'Buɗe kwas a Moodle',
    emptyStep2: 'Danna gunkin ƙarin',
    emptyStep3Before: 'Danna ',
    emptyStep3After: '',
    emptyHintBefore: 'Kana da ajiya riga? Jefa fayil ɗinsa na ',
    emptyHintAfter: ' a ko’ina a wannan shafin don shigo da shi.',
    allHidden: 'An ɓoye duk kwasa-kwasanka. Yi amfani da "Kwasa-kwasan da aka ɓoye" a menu na ⋮ don dawo da ɗaya.'
  },

  courseRow: {
    lastDownloaded: 'Saukewa ta ƙarshe',
    openInMoodle: 'Buɗe kwas ɗin a Moodle',
    setTagName: 'Saita sunan alama',
    hideCourse: 'Ɓoye kwas',
    deleteCourse: 'Share kwas'
  },

  hiddenCourses: {
    title: 'Kwasa-kwasan da aka ɓoye',
    none: 'Babu kwas da aka ɓoye.',
    unhide: 'Bayyana'
  },

  courseFiles: {
    backToCourses: 'Koma ga kwasa-kwasai',
    addFile: 'Ƙara fayil…',
    couldNotRead: (fileCount, firstName, error) =>
      `Ba a iya karanta ${fileCount === 1 ? `"${firstName}"` : 'fayilolin da aka jefa'} ba — mai yiwuwa an motsa ko ` +
      `an share fayil ɗin, ko kuma har yanzu ana sauke shi. Sake gwadawa daga wuri tabbatacce. (${error})`,
    couldNotAdd: (fileCount, error) =>
      `Ba a iya ƙara ${fileCount === 1 ? 'fayil ɗin' : 'fayilolin'} ba: ${error}`,
    dropFiles: (name) => `Jefa fayiloli don ƙara su zuwa "${name}"`,
    searchPlaceholder: 'Nemi fayiloli da suna…',
    noMatches: (query) => `Babu fayil da ya dace da "${query}".`,
    noFiles: 'Ba a sauke wani fayil na wannan kwas ba tukuna.'
  },

  fileRow: {
    viewHistory: 'Duba tarihin sigogi',
    lastSaved: (date) => `An ajiye na ƙarshe: ${date}`,
    manual: 'Da hannu',
    manualTitle: 'An ƙara da hannu, ba a sauke daga Moodle ba',
    deleteTitle: 'Share wannan fayil daga tarihinka',
    downloadTitle: 'Sauke zuwa babban fayil ɗin Abubuwan da aka sauke',
    deleteConfirmTitle: (name) => `A share "${name}"?`,
    deleteConfirmMessage:
      'Wannan zai cire fayil ɗin da duk sigoginsa da aka ajiye daga tarihinka. Idan har yanzu yana Moodle, ' +
      'saukewar wannan kwas ta gaba za ta sake ƙara shi a matsayin sabon fayil.'
  },

  folderRow: {
    deleteTitle: 'Share wannan babban fayil daga tarihinka',
    downloadTitle: 'Sauke wannan babban fayil a matsayin zip',
    couldNotDownload: (name, error) => `Ba a iya sauke "${name}" ba: ${error}`,
    deleteConfirmTitle: (name) => `A share "${name}"?`,
    deleteConfirmMessage: (fileCount) =>
      `Wannan zai cire babban fayil ɗin, fayilolinsa ${fileCount} da duk sigoginsu da aka ajiye daga tarihinka. ` +
      'Duk abin da har yanzu yake Moodle za a sake ƙara shi a matsayin sabo a gaba idan ka sauke wannan kwas.'
  },

  recentlyOpened: {
    title: 'Waɗanda aka buɗe kwanan nan',
    remove: 'Cire daga waɗanda aka buɗe kwanan nan'
  },

  recentSettings: {
    title: 'Waɗanda aka buɗe kwanan nan',
    appliesToAll: 'Ya shafi duk kwasa-kwasai.',
    show: 'Nuna fayilolin da aka buɗe kwanan nan',
    noLimit: 'Babu iyaka',
    maximum: 'Matsakaicin adadin fayilolin da aka buɗe kwanan nan a kowane kwas'
  },

  downloadNames: {
    title: 'Sunayen saukewa',
    description: 'Ya shafi duk kwasa-kwasai. Ana sauke fayilolin kwasa-kwasai marasa alama da ainihin sunan fayil ɗin.',
    prefixCourseTag: 'Ƙara alamar kwas a farkon sunayen saukewa (misali ALAMA_fayil.pdf)'
  },

  sideMargin: {
    title: 'Gefe-gefe',
    description:
      'Wuri maras komai a kowane gefe na abubuwan ciki a taga da aka faɗaɗa, a matsayin kaso na allo. A ƙaramar ' +
      'taga, abubuwan ciki suna riƙe wannan faɗin, suna fara amfani da gefe-gefen sannan duk tagar.',
    label: (percent) => `${percent}% a kowane gefe`
  },

  upload: {
    titleOne: (name) => `Ƙara "${name}"`,
    titleMany: (count) => `Ƙara fayil ${count}`,
    where: (count) => `Ina kake so a ajiye ${count === 1 ? 'shi' : 'su'}?`,
    courseRoot: 'Tushen kwas',
    existingFolder: 'Babban fayil da yake akwai',
    newFolder: 'Sabon babban fayil',
    folderNamePlaceholder: 'Sunan babban fayil',
    newFolderNameLabel: 'Sunan sabon babban fayil',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' ya riga ya kasance a wannan babban fayil — za a ƙara sabon fayil ɗin a matsayin sabuwar sigarsa.',
    add: 'Ƙara',
    adding: 'Ana ƙarawa…'
  },

  versions: {
    whichVersion: 'Wace siga?',
    downloadTitle: 'Sauke wannan siga zuwa babban fayil ɗin Abubuwan da aka sauke',
    diffVsPrevious: 'Kwatanta da ta baya',
    comparing: (from, to) => `Ana kwatanta v${from} → v${to}`,
    loadingDiff: 'Ana loda bambance-bambance…',
    binaryChanged: 'Fayil na binary — abin ciki ya canza.',
    size: (from, to, delta) => `Girma: ${from} → ${to} (${delta})`,
    deleteTitle: 'Share wannan siga',
    deleteConfirmTitle: (label) => `A share ${label}?`,
    deleteConfirmMessage:
      'Za a cire wannan siga daga tarihin fayil ɗin har abada. Sauran sigogi da fayil ɗin kansa za su ci gaba da kasancewa.'
  },

  openFile: {
    downloadInterrupted: 'Saukewar ta katse.',
    couldNotOpen: (filename, error) =>
      `An sauke "${filename}", amma ba a iya buɗe shi kai tsaye ba (${error}).\n\n` +
      'Kana iya buɗe shi daga abubuwan da Chrome ya sauke (Ctrl+J / Cmd+Shift+J). ' +
      'Shawara: danna dama a kan wani abin da aka sauke a can sannan ka zaɓi "Koyaushe buɗe fayilolin wannan nau’in" ' +
      'don hakan ya riƙa faruwa kai tsaye daga yanzu.'
  },

  backup: {
    courseNotFound: 'Ba a sami kwas ɗin ba.',
    invalid: (reason) => `Wannan ba ingantacciyar ajiyar Moodle Archive ba ce (${reason}).`,
    notZip: 'ba fayil ɗin zip ba ne',
    missingManifest: 'babu data.json',
    invalidJson: 'data.json ba ingantaccen JSON ba ne',
    noCourses: 'data.json bai bayyana wani kwas ba'
  },

  viewer: {
    notFoundTitle: 'Ba a sami fayil ɗin ba',
    notFoundText: 'Wannan fayil ba ya cikin tarihin Moodle Archive ɗinka kuma — mai yiwuwa an share shi.',
    cannotPreview: 'Ba za a iya duba irin wannan fayil a burauza ba.'
  },

  popup: {
    cannotScan: 'Ba za a iya bincika wannan shafin ba — fara buɗe shafin kwas na Moodle.',
    filesDownloaded: (count) => `An sauke fayil ${count}`,
    downloading: 'Ana saukewa...',
    download: 'Sauke',
    history: 'Tarihi',
    addToQueue: 'Ƙara zuwa layi',
    queued: (position) => `A layi (na ${position})`,
    queueTitle: 'Na gaba',
    removeFromQueue: 'Cire daga layi'
  },

  download: {
    unsupportedUrl: (url) => `URL da ba a goyon baya: ${url}.`,
    processingLinks: 'Ana sarrafa hanyoyin haɗi...',
    processing: (url) => `Ana sarrafa ${url}`,
    downloadingFiles: 'Ana sauke fayiloli...',
    downloadingFile: (name) => `Ana sauke ${name}`,
    cancelled: (name, reason) =>
      `An soke saukewa: ba a iya sauke "${name}" ba (${reason}). Ba a ajiye komai ba — sake gwadawa.`,
    downloadFailed: 'saukewa ta gaza',
    noResponse: 'Lokaci ya ƙare ana jiran amsa',
    stalled: 'Ya tsaya: ba a karɓi bayanai a kan lokaci ba',
    noFileFound: 'Ba a sami wani fayil ba.',
    saving: 'Ana ajiyewa a tarihi...',
    savingChunk: (index, total) => `Ana ajiyewa a tarihi... (${index}/${total})`,
    saved: 'An ajiye a tarihi.',
    saveFailed: (reason) => `Ba a iya ajiyewa a tarihi ba: ${reason}`,
    timedOut: 'lokaci ya ƙare ana jiran amsa — sake gwadawa',
    unknownError: 'kuskuren da ba a sani ba',
    interrupted: 'Saukewar ta katse: an rufe shafin ko an koma wani shafi.',
    couldNotStart: (title) => `Ba a iya fara "${title}" ba — buɗe shafinsa ka sake gwadawa.`
  }
};
