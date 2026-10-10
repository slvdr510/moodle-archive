import type { Messages } from './en';

export const sw: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'na slvdr510',
    cancel: 'Ghairi',
    save: 'Hifadhi',
    close: 'Funga',
    delete: 'Futa',
    export: 'Hamisha',
    download: 'Pakua',
    moreOptions: 'Chaguo zaidi',
    exporting: 'Inahamisha…',
    importing: 'Inaleta…',
    savedToDownloads: (name) => `"${name}" imehifadhiwa kwenye folda yako ya Vipakuliwa.`,
    couldNotExport: (name, error) => `Imeshindwa kuhamisha "${name}": ${error}`
  },

  header: {
    theme: 'Mandhari',
    themeLight: 'Angavu',
    themeSystem: 'Kama mfumo',
    themeDark: 'Giza',
    language: 'Lugha',
    languageAuto: 'Lugha ya kivinjari'
  },

  relativeTime: {
    justNow: 'sasa hivi',
    minutes: (n) => `dakika ${n} zilizopita`,
    hours: (n) => `saa ${n} zilizopita`,
    days: (n) => `siku ${n} zilizopita`,
    weeks: (n) => `wiki ${n} zilizopita`,
    months: (n) => (n === 1 ? 'mwezi 1 uliopita' : `miezi ${n} iliyopita`),
    years: (n) => (n === 1 ? 'mwaka 1 uliopita' : `miaka ${n} iliyopita`)
  },

  status: {
    new: 'Mpya',
    modified: 'Imebadilishwa',
    deleted: 'Imefutwa',
    unchanged: 'Haijabadilika'
  },

  courses: {
    openAllUrls: 'Fungua URL za kozi zote',
    exportAll: 'Hamisha kozi zote',
    importCourses: 'Leta kozi',
    recentSettings: 'Mipangilio ya zilizofunguliwa hivi karibuni',
    downloadNameSettings: 'Mipangilio ya majina ya vipakuliwa',
    sideMargin: 'Pambizo za pembeni',
    courseListStyle: 'Mtindo wa orodha ya kozi',
    setInstitution: 'Weka taasisi kwa kozi',
    hiddenCourses: 'Kozi zilizofichwa',
    deleteAll: 'Futa kozi zote',
    backupSaved: 'Nakala rudufu imehifadhiwa kwenye folda yako ya Vipakuliwa.',
    couldNotExportAll: (error) => `Imeshindwa kuhamisha: ${error}`,
    noUrlsToOpen: 'Hakuna URL za kozi za kufungua.',
    imported: (courses, files, versions) =>
      `Zimeletwa kozi ${courses}, faili ${files} na matoleo ${versions}.`,
    notABackup: (name) => `"${name}" si faili la zip katika muundo wa kozi unaotumiwa na kiendelezi hiki.`,
    couldNotImport: (details) => `Imeshindwa kuleta ${details}`,
    dropBackups: 'Dondosha nakala rudufu za .zip ili kuleta kozi zake',
    exportAllTitle: 'Hamisha kozi zote?',
    exportAllMessage: 'Kila kozi, faili na toleo linalofuatiliwa vitahifadhiwa kwenye zip moja katika folda yako ya Vipakuliwa.',
    exportCourseTitle: (name) => `Hamisha "${name}"?`,
    exportCourseMessage: 'Kozi, faili zake na kila toleo vitahifadhiwa kwenye zip katika folda yako ya Vipakuliwa.',
    deleteAllTitle: 'Futa kozi zote?',
    deleteAllMessage:
      'Hii inafuta kila kozi, faili na historia ya matoleo inayofuatiliwa na kiendelezi. ' +
      'Pakua kozi tena baadaye ili kuanza kujenga upya historia yake.',
    deleteCourseTitle: (name) => `Futa "${name}"?`,
    deleteCourseMessage:
      'Hii inaondoa kozi pamoja na historia ya faili na matoleo yake. Ukipakua kozi hii tena ' +
      'baadaye, itaundwa upya kuanzia mwanzo.',
    emptyTitle: 'Bado hakuna kozi',
    emptySubtitle: 'Kozi huundwa kiotomatiki mara ya kwanza unapopakua moja.',
    emptyStep1: 'Fungua kozi kwenye Moodle',
    emptyStep2: 'Bofya aikoni ya kiendelezi',
    emptyStep3Before: 'Bonyeza ',
    emptyStep3After: '',
    emptyHintBefore: 'Tayari una nakala rudufu? Dondosha faili lake la ',
    emptyHintAfter: ' popote kwenye ukurasa huu ili kuileta.',
    allHidden: 'Kozi zako zote zimefichwa. Tumia "Kozi zilizofichwa" kwenye menyu ya ⋮ ili kurudisha moja.'
  },

  courseRow: {
    lastDownloaded: 'Ilipakuliwa mwisho',
    openInMoodle: 'Fungua kozi kwenye Moodle',
    setTagName: 'Weka lebo (kifupisho)',
    setFullName: 'Weka jina kamili',
    tagPlaceholder: 'Kifupisho, k.m. OS',
    fullNamePlaceholder: 'Jina kamili (tupu: la Moodle)',
    setInstitution: 'Weka taasisi (kifupisho)',
    institutionPlaceholder: 'Kifupisho cha taasisi, k.m. UHU',
    institution: 'Taasisi',
    changeColor: 'Badilisha rangi',
    hideCourse: 'Ficha kozi',
    deleteCourse: 'Futa kozi'
  },

  hiddenCourses: {
    title: 'Kozi zilizofichwa',
    none: 'Hakuna kozi iliyofichwa.',
    unhide: 'Onyesha'
  },

  courseFiles: {
    backToCourses: 'Rudi kwenye kozi',
    addFile: 'Ongeza faili…',
    ignoredFiles: 'Faili zinazopuuzwa',
    couldNotRead: (fileCount, firstName, error) =>
      `Imeshindwa kusoma ${fileCount === 1 ? `"${firstName}"` : 'faili zilizodondoshwa'} — huenda faili limehamishwa ` +
      `au kufutwa, au bado linapakuliwa. Jaribu tena kutoka mahali thabiti. (${error})`,
    couldNotAdd: (fileCount, error) =>
      `Imeshindwa kuongeza ${fileCount === 1 ? 'faili' : 'faili hizo'}: ${error}`,
    dropFiles: (name) => `Dondosha faili ili kuziongeza kwenye "${name}"`,
    searchPlaceholder: 'Tafuta faili kwa jina…',
    noMatches: (query) => `Hakuna faili zinazolingana na "${query}".`,
    noFiles: 'Bado hakuna faili zilizopakuliwa kwa kozi hii.'
  },

  fileRow: {
    viewHistory: 'Tazama historia ya matoleo',
    lastSaved: (date) => `Ilihifadhiwa mwisho: ${date}`,
    manual: 'Kwa mkono',
    manualTitle: 'Imeongezwa kwa mkono, haikupakuliwa kutoka Moodle',
    ignored: 'Inapuuzwa',
    ignoredTitle: 'Upakuaji huiacha faili hii kama ilivyo',
    ignoreTitle: 'Puuza mabadiliko ya faili hii',
    unignoreTitle: 'Acha kupuuza faili hii',
    ignoredWithFolderTitle: 'Inapuuzwa pamoja na folda yake',
    deleteTitle: 'Futa faili hili kwenye historia yako',
    downloadTitle: 'Pakua kwenye folda yako ya Vipakuliwa',
    deleteConfirmTitle: (name) => `Futa "${name}"?`,
    deleteConfirmMessage:
      'Hii inaondoa faili na matoleo yake yote yaliyohifadhiwa kwenye historia yako. Ikiwa bado liko kwenye Moodle, ' +
      'upakuaji ujao wa kozi hii utaliongeza tena kama faili jipya.'
  },

  folderRow: {
    ignoreTitle: 'Puuza folda hii na kila kitu kilichomo',
    unignoreTitle: 'Acha kupuuza folda hii',
    ignoredTitle: 'Upakuaji huiacha folda hii na kila kitu kilichomo kama kilivyo',
    deleteTitle: 'Futa folda hii kwenye historia yako',
    downloadTitle: 'Pakua folda hii kama zip',
    couldNotDownload: (name, error) => `Imeshindwa kupakua "${name}": ${error}`,
    deleteConfirmTitle: (name) => `Futa "${name}"?`,
    deleteConfirmMessage: (fileCount) =>
      `Hii inaondoa folda, faili zake ${fileCount} na matoleo yao yote yaliyohifadhiwa kwenye historia yako. ` +
      'Chochote ambacho bado kiko kwenye Moodle kitaongezwa tena kama kipya utakapopakua kozi hii tena.'
  },

  recentlyOpened: {
    title: 'Zilizofunguliwa hivi karibuni',
    remove: 'Ondoa kwenye zilizofunguliwa hivi karibuni',
    showAll: 'Onyesha zote zilizofunguliwa hivi karibuni'
  },

  recentSettings: {
    title: 'Zilizofunguliwa hivi karibuni',
    appliesToAll: 'Inatumika kwa kozi zote.',
    show: 'Onyesha faili zilizofunguliwa hivi karibuni',
    noLimit: 'Hakuna kikomo',
    maximum: 'Idadi ya juu ya faili zilizofunguliwa hivi karibuni kwa kila kozi'
  },

  downloadNames: {
    title: 'Majina ya vipakuliwa',
    description: 'Inatumika kwa kozi zote. Kozi zisizo na lebo hupakuliwa kwa jina asili la faili.',
    prefixCourseTag: 'Ongeza lebo ya kozi mwanzoni mwa majina ya vipakuliwa (k.m. LEBO_faili.pdf)'
  },

  sideMargin: {
    title: 'Pambizo za pembeni',
    description:
      'Nafasi tupu kila upande wa maudhui kwenye dirisha lililopanuliwa, kama sehemu ya skrini. Kwenye dirisha ' +
      'dogo zaidi, maudhui hubaki na upana huo, yakitumia pambizo kwanza na kisha dirisha zima.',
    label: (percent) => `${percent}% kila upande`
  },

  courseListStyle: {
    title: 'Mtindo wa orodha ya kozi',
    description: 'Jinsi kozi zinavyoonyeshwa kwenye ukurasa huu.',
    cards: 'Kadi',
    rows: 'Mistari'
  },

  courseColor: {
    title: (name) => `Rangi ya "${name}"`,
    palette: 'Rangi zilizopo',
    custom: 'Rangi maalum',
    automatic: 'Tumia rangi ya kiotomatiki'
  },

  setInstitution: {
    title: 'Weka taasisi',
    description: 'Chagua kozi za kupewa taasisi hii. Iache tupu ili kuiondoa kwenye kozi hizo.',
    courses: (count) => (count === 0 ? 'Kozi' : `Kozi (${count} zimechaguliwa)`),
    selectAll: 'Chagua zote',
    selectNone: 'Hakuna',
    hidden: 'Imefichwa',
    apply: (count) => (count === 1 ? 'Tumia kwa kozi 1' : `Tumia kwa kozi ${count}`),
    remove: (count) => (count === 1 ? 'Ondoa kwenye kozi 1' : `Ondoa kwenye kozi ${count}`)
  },

  ignoredFiles: {
    title: 'Faili zinazopuuzwa',
    description:
      'Upakuaji huziacha faili hizi kama zilivyo: hakuna matoleo mapya, hazitiwi alama kuwa zimefutwa, na haziongezwi ikiwa bado hazifuatiliwi.',
    pathLabel: 'Njia ya faili',
    placeholder: 'Folda/faili.pdf',
    hint:
      'Weka kiendelezi na folda ilimo: faili iliyo kwenye mzizi wa kozi ni jina lake tu. Faili zenye jina moja katika folda tofauti ni faili tofauti. Maliza njia kwa / ili kupuuza folda nzima na kila kitu kilichomo.',
    add: 'Ongeza',
    folder: 'Folda',
    remove: (path) => `Acha kupuuza ${path}`,
    empty: 'Hakuna faili zinazopuuzwa.',
    duplicate: 'Faili hiyo tayari iko kwenye orodha.',
    notFound: 'Bado haipo kwenye kozi hii',
    askDeleteTitle: (count, name) => (count === 1 ? `"${name}" sasa inapuuzwa` : `Faili ${count} sasa zinapuuzwa`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'Upakuaji utaiacha kama ilivyo. Je, ungependa pia kuifuta kwenye kozi hii, pamoja na matoleo yake yote yaliyohifadhiwa? Ikiwa bado inapuuzwa, upakuaji ujao hautaiongeza tena.'
        : 'Upakuaji utaziacha kama zilivyo. Je, ungependa pia kuzifuta kwenye kozi hii, pamoja na matoleo yake yote yaliyohifadhiwa? Zikiwa bado zinapuuzwa, upakuaji ujao hautaziongeza tena.',
    keep: (count) => (count === 1 ? 'Ibaki' : 'Zibaki')
  },

  upload: {
    titleOne: (name) => `Ongeza "${name}"`,
    titleMany: (count) => `Ongeza faili ${count}`,
    where: (count) => `Unataka ${count === 1 ? 'kulihifadhi' : 'kuzihifadhi'} wapi?`,
    courseRoot: 'Mzizi wa kozi',
    existingFolder: 'Folda iliyopo',
    newFolder: 'Folda mpya',
    folderNamePlaceholder: 'Jina la folda',
    newFolderNameLabel: 'Jina la folda mpya',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' tayari lipo kwenye folda hii — faili jipya litaongezwa kama toleo jipya lake.',
    add: 'Ongeza',
    adding: 'Inaongeza…'
  },

  versions: {
    whichVersion: 'Toleo lipi?',
    downloadTitle: 'Pakua toleo hili kwenye folda yako ya Vipakuliwa',
    diffVsPrevious: 'Linganisha na lililotangulia',
    comparing: (from, to) => `Inalinganisha v${from} → v${to}`,
    loadingDiff: 'Inapakia tofauti…',
    binaryChanged: 'Faili la binary — maudhui yamebadilika.',
    size: (from, to, delta) => `Ukubwa: ${from} → ${to} (${delta})`,
    deleteTitle: 'Futa toleo hili',
    deleteConfirmTitle: (label) => `Futa ${label}?`,
    deleteConfirmMessage:
      'Toleo hili litaondolewa kabisa kwenye historia ya faili. Matoleo mengine na faili lenyewe vitabaki.'
  },

  openFile: {
    downloadInterrupted: 'Upakuaji ulikatizwa.',
    couldNotOpen: (filename, error) =>
      `"${filename}" imepakuliwa, lakini imeshindwa kufunguka kiotomatiki (${error}).\n\n` +
      'Unaweza kuifungua kutoka kwenye vipakuliwa vya Chrome (Ctrl+J / Cmd+Shift+J). ' +
      'Kidokezo: bofya kulia kipakuliwa hapo na uchague "Fungua faili za aina hii kila wakati" ili kuanzia ' +
      'sasa hili lifanyike kiotomatiki.'
  },

  backup: {
    courseNotFound: 'Kozi haikupatikana.',
    invalid: (reason) => `Si nakala rudufu halali ya Moodle Archive (${reason}).`,
    notZip: 'si faili la zip',
    missingManifest: 'data.json haipo',
    invalidJson: 'data.json si JSON halali',
    noCourses: 'data.json haielezi kozi zozote'
  },

  viewer: {
    notFoundTitle: 'Faili halikupatikana',
    notFoundText: 'Faili hili halipo tena kwenye historia yako ya Moodle Archive — huenda limefutwa.',
    cannotPreview: 'Aina hii ya faili haiwezi kuonyeshwa kwenye kivinjari.',
    zoomOut: 'Punguza ukubwa',
    zoomIn: 'Ongeza ukubwa',
    fitVertically: 'Linganisha wima',
    fitHorizontally: 'Linganisha mlalo'
  },

  popup: {
    cannotScan: 'Ukurasa huu hauwezi kuchanganuliwa — fungua kichupo cha kozi ya Moodle kwanza.',
    filesDownloaded: (count) => `Faili ${count} zimepakuliwa`,
    downloading: 'Inapakua...',
    download: 'Pakua',
    history: 'Historia',
    addToQueue: 'Ongeza kwenye foleni',
    queued: (position) => `Kwenye foleni (#${position})`,
    queueTitle: 'Inayofuata',
    removeFromQueue: 'Ondoa kwenye foleni'
  },

  download: {
    unsupportedUrl: (url) => `URL haitumiki: ${url}.`,
    processingLinks: 'Inachakata viungo...',
    processing: (url) => `Inachakata ${url}`,
    downloadingFiles: 'Inapakua faili...',
    downloadingFile: (name) => `Inapakua ${name}`,
    cancelled: (name, reason) =>
      `Upakuaji umeghairiwa: imeshindwa kupakua "${name}" (${reason}). Hakuna kilichohifadhiwa — jaribu tena.`,
    downloadFailed: 'upakuaji umeshindwa',
    noResponse: 'Muda umekwisha ukisubiri jibu',
    stalled: 'Imekwama: hakuna data iliyopokelewa kwa wakati',
    noFileFound: 'Hakuna faili lililopatikana.',
    saving: 'Inahifadhi kwenye historia...',
    savingChunk: (index, total) => `Inahifadhi kwenye historia... (${index}/${total})`,
    saved: 'Imehifadhiwa kwenye historia.',
    saveFailed: (reason) => `Imeshindwa kuhifadhi kwenye historia: ${reason}`,
    timedOut: 'muda umekwisha ukisubiri jibu — jaribu tena',
    unknownError: 'hitilafu isiyojulikana',
    interrupted: 'Upakuaji ulikatizwa: kichupo kilifungwa au kilihamia ukurasa mwingine.',
    couldNotStart: (title) => `Imeshindwa kuanza "${title}" — fungua kichupo chake na ujaribu tena.`
  }
};
