import type { Messages } from './en';

export const te: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'slvdr510 రూపొందించినది',
    cancel: 'రద్దు చేయి',
    save: 'సేవ్ చేయి',
    close: 'మూసివేయి',
    delete: 'తొలగించు',
    export: 'ఎగుమతి చేయి',
    download: 'డౌన్‌లోడ్ చేయి',
    moreOptions: 'మరిన్ని ఎంపికలు',
    exporting: 'ఎగుమతి అవుతోంది…',
    importing: 'దిగుమతి అవుతోంది…',
    savedToDownloads: (name) => `"${name}" మీ డౌన్‌లోడ్‌ల ఫోల్డర్‌లో సేవ్ అయింది.`,
    couldNotExport: (name, error) => `"${name}"ని ఎగుమతి చేయలేకపోయాం: ${error}`
  },

  header: {
    theme: 'థీమ్',
    themeLight: 'లేత',
    themeSystem: 'సిస్టమ్ ప్రకారం',
    themeDark: 'ముదురు',
    language: 'భాష',
    languageAuto: 'బ్రౌజర్ భాష'
  },

  relativeTime: {
    justNow: 'ఇప్పుడే',
    minutes: (n) => `${n} నిమి. క్రితం`,
    hours: (n) => `${n} గం. క్రితం`,
    days: (n) => `${n} రోజుల క్రితం`,
    weeks: (n) => `${n} వారాల క్రితం`,
    months: (n) => `${n} నెలల క్రితం`,
    years: (n) => `${n} సం. క్రితం`
  },

  status: {
    new: 'కొత్తది',
    modified: 'మార్చబడింది',
    deleted: 'తొలగించబడింది',
    unchanged: 'మార్పు లేదు'
  },

  courses: {
    openAllUrls: 'అన్ని కోర్సుల URLలను తెరువు',
    exportAll: 'అన్ని కోర్సులను ఎగుమతి చేయి',
    importCourses: 'కోర్సులను దిగుమతి చేయి',
    recentSettings: 'ఇటీవల తెరిచిన ఫైళ్ల సెట్టింగ్‌లు',
    downloadNameSettings: 'డౌన్‌లోడ్ పేర్ల సెట్టింగ్‌లు',
    sideMargin: 'పక్క మార్జిన్‌లు',
    courseListStyle: 'కోర్సుల జాబితా శైలి',
    setInstitution: 'కోర్సులకు సంస్థను సెట్ చేయి',
    hiddenCourses: 'దాచిన కోర్సులు',
    deleteAll: 'అన్ని కోర్సులను తొలగించు',
    backupSaved: 'బ్యాకప్ మీ డౌన్‌లోడ్‌ల ఫోల్డర్‌లో సేవ్ అయింది.',
    couldNotExportAll: (error) => `ఎగుమతి చేయలేకపోయాం: ${error}`,
    noUrlsToOpen: 'తెరవడానికి కోర్సు URLలు ఏవీ లేవు.',
    imported: (courses, files, versions) =>
      `${courses} కోర్సులు, ${files} ఫైళ్లు, ${versions} వెర్షన్‌లు దిగుమతి అయ్యాయి.`,
    notABackup: (name) => `"${name}" ఈ ఎక్స్‌టెన్షన్ ఉపయోగించే కోర్సు ఫార్మాట్‌లోని zip ఫైల్ కాదు.`,
    couldNotImport: (details) => `దిగుమతి చేయలేకపోయాం: ${details}`,
    dropBackups: 'కోర్సులను దిగుమతి చేయడానికి .zip బ్యాకప్‌లను ఇక్కడ వదలండి',
    exportAllTitle: 'అన్ని కోర్సులను ఎగుమతి చేయాలా?',
    exportAllMessage: 'ట్రాక్ చేస్తున్న ప్రతి కోర్సు, ఫైల్, వెర్షన్ ఒకే zipలో మీ డౌన్‌లోడ్‌ల ఫోల్డర్‌లో సేవ్ అవుతాయి.',
    exportCourseTitle: (name) => `"${name}"ని ఎగుమతి చేయాలా?`,
    exportCourseMessage: 'కోర్సు, దాని ఫైళ్లు, ప్రతి వెర్షన్ ఒక zipలో మీ డౌన్‌లోడ్‌ల ఫోల్డర్‌లో సేవ్ అవుతాయి.',
    deleteAllTitle: 'అన్ని కోర్సులను తొలగించాలా?',
    deleteAllMessage:
      'ఇది ఎక్స్‌టెన్షన్ ట్రాక్ చేస్తున్న అన్ని కోర్సులు, ఫైళ్లు, వెర్షన్ చరిత్రను తుడిచివేస్తుంది. ' +
      'తర్వాత ఏదైనా కోర్సును మళ్లీ డౌన్‌లోడ్ చేస్తే దాని చరిత్ర మళ్లీ ఏర్పడటం మొదలవుతుంది.',
    deleteCourseTitle: (name) => `"${name}"ని తొలగించాలా?`,
    deleteCourseMessage:
      'ఇది కోర్సును, దాని ఫైళ్లు మరియు వెర్షన్‌ల చరిత్రను తీసివేస్తుంది. తర్వాత ఈ కోర్సును మళ్లీ డౌన్‌లోడ్ ' +
      'చేస్తే, అది మొదటి నుంచి కొత్తగా సృష్టించబడుతుంది.',
    emptyTitle: 'ఇంకా కోర్సులు లేవు',
    emptySubtitle: 'మీరు ఒక కోర్సును మొదటిసారి డౌన్‌లోడ్ చేసినప్పుడు అది స్వయంచాలకంగా సృష్టించబడుతుంది.',
    emptyStep1: 'Moodleలో ఒక కోర్సును తెరవండి',
    emptyStep2: 'ఎక్స్‌టెన్షన్ ఐకాన్‌పై క్లిక్ చేయండి',
    emptyStep3Before: '',
    emptyStep3After: ' నొక్కండి',
    emptyHintBefore: 'ఇప్పటికే బ్యాకప్ ఉందా? దాని ',
    emptyHintAfter: ' ఫైల్‌ను ఈ పేజీలో ఎక్కడైనా వదలండి, అది దిగుమతి అవుతుంది.',
    allHidden: 'మీ కోర్సులన్నీ దాచబడ్డాయి. ఒకదాన్ని మళ్లీ చూపడానికి ⋮ మెనూలోని "దాచిన కోర్సులు" ఉపయోగించండి.'
  },

  courseRow: {
    lastDownloaded: 'చివరి డౌన్‌లోడ్',
    openInMoodle: 'కోర్సును Moodleలో తెరువు',
    setTagName: 'ట్యాగ్ (సంక్షిప్త రూపం) సెట్ చేయి',
    setFullName: 'పూర్తి పేరు సెట్ చేయి',
    tagPlaceholder: 'సంక్షిప్త రూపం, ఉదా. OS',
    fullNamePlaceholder: 'పూర్తి పేరు (ఖాళీ: Moodle లోనిది)',
    setInstitution: 'సంస్థ (సంక్షిప్త రూపం) సెట్ చేయి',
    institutionPlaceholder: 'సంస్థ సంక్షిప్త రూపం, ఉదా. UHU',
    institution: 'సంస్థ',
    changeColor: 'రంగు మార్చు',
    hideCourse: 'కోర్సును దాచు',
    deleteCourse: 'కోర్సును తొలగించు'
  },

  hiddenCourses: {
    title: 'దాచిన కోర్సులు',
    none: 'ఏ కోర్సూ దాచబడలేదు.',
    unhide: 'చూపించు'
  },

  courseFiles: {
    backToCourses: 'కోర్సులకు తిరిగి వెళ్లు',
    addFile: 'ఫైల్ జోడించు…',
    ignoredFiles: 'విస్మరించిన ఫైళ్లు',
    couldNotRead: (fileCount, firstName, error) =>
      `${fileCount === 1 ? `"${firstName}"` : 'వదిలిన ఫైళ్ల'}ని చదవలేకపోయాం — ఫైల్ తరలించబడి లేదా తొలగించబడి ఉండవచ్చు, ` +
      `లేదా ఇంకా డౌన్‌లోడ్ అవుతూ ఉండవచ్చు. స్థిరమైన స్థానం నుంచి మళ్లీ ప్రయత్నించండి. (${error})`,
    couldNotAdd: (fileCount, error) => `${fileCount === 1 ? 'ఫైల్‌ను' : 'ఫైళ్లను'} జోడించలేకపోయాం: ${error}`,
    dropFiles: (name) => `"${name}"కి జోడించడానికి ఫైళ్లను ఇక్కడ వదలండి`,
    searchPlaceholder: 'పేరుతో ఫైళ్లను వెతకండి…',
    noMatches: (query) => `"${query}"కి సరిపోయే ఫైళ్లు లేవు.`,
    noFiles: 'ఈ కోర్సుకు ఇంకా ఏ ఫైలూ డౌన్‌లోడ్ కాలేదు.'
  },

  fileRow: {
    viewHistory: 'వెర్షన్ చరిత్ర చూడండి',
    lastSaved: (date) => `చివరిగా సేవ్ చేసింది: ${date}`,
    manual: 'మాన్యువల్',
    manualTitle: 'చేతితో జోడించినది, Moodle నుంచి డౌన్‌లోడ్ చేసింది కాదు',
    ignored: 'విస్మరించబడింది',
    ignoredTitle: 'డౌన్‌లోడ్‌లు ఈ ఫైల్‌ను అలాగే ఉంచుతాయి',
    ignoreTitle: 'ఈ ఫైల్ మార్పులను విస్మరించు',
    unignoreTitle: 'ఈ ఫైల్‌ను విస్మరించడం ఆపు',
    ignoredWithFolderTitle: 'దాని ఫోల్డర్‌తో పాటు విస్మరించబడింది',
    deleteTitle: 'ఈ ఫైల్‌ను మీ చరిత్ర నుంచి తొలగించు',
    downloadTitle: 'మీ డౌన్‌లోడ్‌ల ఫోల్డర్‌కు డౌన్‌లోడ్ చేయి',
    deleteConfirmTitle: (name) => `"${name}"ని తొలగించాలా?`,
    deleteConfirmMessage:
      'ఇది ఫైల్‌ను, దాని సేవ్ చేసిన అన్ని వెర్షన్‌లను మీ చరిత్ర నుంచి తీసివేస్తుంది. అది ఇంకా Moodleలో ఉంటే, ' +
      'ఈ కోర్సు తదుపరి డౌన్‌లోడ్‌లో అది కొత్త ఫైల్‌గా మళ్లీ జోడించబడుతుంది.'
  },

  folderRow: {
    ignoreTitle: 'ఈ ఫోల్డర్‌ను, దానిలోని అన్నింటినీ విస్మరించు',
    unignoreTitle: 'ఈ ఫోల్డర్‌ను విస్మరించడం ఆపు',
    ignoredTitle: 'డౌన్‌లోడ్‌లు ఈ ఫోల్డర్‌ను, దానిలోని అన్నింటినీ అలాగే ఉంచుతాయి',
    deleteTitle: 'ఈ ఫోల్డర్‌ను మీ చరిత్ర నుంచి తొలగించు',
    downloadTitle: 'ఈ ఫోల్డర్‌ను zipగా డౌన్‌లోడ్ చేయి',
    couldNotDownload: (name, error) => `"${name}"ని డౌన్‌లోడ్ చేయలేకపోయాం: ${error}`,
    deleteConfirmTitle: (name) => `"${name}"ని తొలగించాలా?`,
    deleteConfirmMessage: (fileCount) =>
      `ఇది ఫోల్డర్‌ను, దానిలోని ${fileCount} ఫైళ్లను, వాటి సేవ్ చేసిన అన్ని వెర్షన్‌లను మీ చరిత్ర నుంచి తీసివేస్తుంది. ` +
      'ఇంకా Moodleలో ఉన్నవన్నీ తదుపరిసారి ఈ కోర్సును డౌన్‌లోడ్ చేసినప్పుడు కొత్తవిగా మళ్లీ జోడించబడతాయి.'
  },

  recentlyOpened: {
    title: 'ఇటీవల తెరిచినవి',
    remove: 'ఇటీవల తెరిచినవాటి నుంచి తీసివేయి',
    showAll: 'ఇటీవల తెరిచినవన్నీ చూపించు'
  },

  recentSettings: {
    title: 'ఇటీవల తెరిచినవి',
    appliesToAll: 'అన్ని కోర్సులకూ వర్తిస్తుంది.',
    show: 'ఇటీవల తెరిచిన ఫైళ్లను చూపించు',
    noLimit: 'పరిమితి లేదు',
    maximum: 'ప్రతి కోర్సుకు ఇటీవల తెరిచిన ఫైళ్ల గరిష్ఠ సంఖ్య'
  },

  downloadNames: {
    title: 'డౌన్‌లోడ్ పేర్లు',
    description: 'అన్ని కోర్సులకూ వర్తిస్తుంది. ట్యాగ్ లేని కోర్సుల ఫైళ్లు వాటి సొంత పేరుతోనే డౌన్‌లోడ్ అవుతాయి.',
    prefixCourseTag: 'డౌన్‌లోడ్ పేర్ల మొదట్లో కోర్సు ట్యాగ్‌ను జోడించు (ఉదా. TAG_file.pdf)'
  },

  sideMargin: {
    title: 'పక్క మార్జిన్‌లు',
    description:
      'గరిష్ఠీకరించిన విండోలో కంటెంట్‌కు ప్రతి పక్కన ఉండే ఖాళీ స్థలం, స్క్రీన్‌లో భాగంగా. చిన్న విండోలో కంటెంట్ ' +
      'అదే వెడల్పును ఉంచుకుంటుంది — ముందు మార్జిన్‌లను, తర్వాత మొత్తం విండోను ఉపయోగిస్తుంది.',
    label: (percent) => `ప్రతి పక్కన ${percent}%`
  },

  courseListStyle: {
    title: 'కోర్సుల జాబితా శైలి',
    description: 'ఈ పేజీలో కోర్సులు ఎలా చూపించాలి.',
    cards: 'కార్డులు',
    rows: 'వరుసలు'
  },

  courseColor: {
    title: (name) => `"${name}" రంగు`,
    palette: 'పాలెట్',
    custom: 'మీ రంగు',
    automatic: 'ఆటోమేటిక్ రంగు వాడు'
  },

  setInstitution: {
    title: 'సంస్థను సెట్ చేయి',
    description: 'ఈ సంస్థను ఇవ్వాల్సిన కోర్సులను ఎంచుకోండి. తీసివేయడానికి ఖాళీగా వదలండి.',
    courses: (count) => (count === 0 ? 'కోర్సులు' : `కోర్సులు (${count} ఎంచుకున్నారు)`),
    selectAll: 'అన్నీ ఎంచుకో',
    selectNone: 'ఏదీ వద్దు',
    hidden: 'దాచబడింది',
    apply: (count) => (count === 1 ? '1 కోర్సుకు వర్తింపజేయి' : `${count} కోర్సులకు వర్తింపజేయి`),
    remove: (count) => (count === 1 ? '1 కోర్సు నుండి తీసివేయి' : `${count} కోర్సుల నుండి తీసివేయి`)
  },

  ignoredFiles: {
    title: 'విస్మరించిన ఫైళ్లు',
    description:
      'డౌన్‌లోడ్‌లు ఈ ఫైళ్లను అలాగే ఉంచుతాయి: కొత్త వెర్షన్లు ఉండవు, ఎప్పుడూ తొలగించినట్లు గుర్తించబడవు, ఇంకా ట్రాక్ చేయకపోతే జోడించబడవు.',
    pathLabel: 'ఫైల్ మార్గం',
    placeholder: 'ఫోల్డర్/ఫైల్.pdf',
    hint:
      'ఎక్స్‌టెన్షన్‌ను, అది ఉన్న ఫోల్డర్లను చేర్చండి: కోర్సు రూట్‌లో ఉన్న ఫైల్ అంటే దాని పేరు మాత్రమే. వేర్వేరు ఫోల్డర్లలో ఒకే పేరున్న ఫైళ్లు వేర్వేరు ఫైళ్లు. మొత్తం ఫోల్డర్‌ను, దానిలోని అన్నింటినీ విస్మరించడానికి మార్గం చివర / పెట్టండి.',
    add: 'జోడించు',
    folder: 'ఫోల్డర్',
    remove: (path) => `${path} ను విస్మరించడం ఆపు`,
    empty: 'విస్మరించిన ఫైళ్లు లేవు.',
    duplicate: 'ఆ ఫైల్ ఇప్పటికే జాబితాలో ఉంది.',
    notFound: 'ఇంకా ఈ కోర్సులో లేదు',
    askDeleteTitle: (count, name) => (count === 1 ? `"${name}" ఇప్పుడు విస్మరించబడింది` : `${count} ఫైళ్లు ఇప్పుడు విస్మరించబడ్డాయి`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'డౌన్‌లోడ్‌లు దీన్ని అలాగే ఉంచుతాయి. దీన్ని, దాని సేవ్ చేసిన అన్ని వెర్షన్లతో సహా, ఈ కోర్సు నుండి తొలగించాలనుకుంటున్నారా? విస్మరించబడి ఉన్నంతవరకు, తదుపరి డౌన్‌లోడ్‌లు దీన్ని మళ్లీ జోడించవు.'
        : 'డౌన్‌లోడ్‌లు వీటిని అలాగే ఉంచుతాయి. వీటిని, వాటి సేవ్ చేసిన అన్ని వెర్షన్లతో సహా, ఈ కోర్సు నుండి తొలగించాలనుకుంటున్నారా? విస్మరించబడి ఉన్నంతవరకు, తదుపరి డౌన్‌లోడ్‌లు వీటిని మళ్లీ జోడించవు.',
    keep: (count) => (count === 1 ? 'ఉంచు' : 'ఉంచు')
  },

  upload: {
    titleOne: (name) => `"${name}"ని జోడించు`,
    titleMany: (count) => `${count} ఫైళ్లను జోడించు`,
    where: (count) => `${count === 1 ? 'దీన్ని' : 'వీటిని'} ఎక్కడ సేవ్ చేయాలి?`,
    courseRoot: 'కోర్సు మూలం',
    existingFolder: 'ఉన్న ఫోల్డర్',
    newFolder: 'కొత్త ఫోల్డర్',
    folderNamePlaceholder: 'ఫోల్డర్ పేరు',
    newFolderNameLabel: 'కొత్త ఫోల్డర్ పేరు',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' ఈ ఫోల్డర్‌లో ఇప్పటికే ఉంది — కొత్త ఫైల్ దాని కొత్త వెర్షన్‌గా జోడించబడుతుంది.',
    add: 'జోడించు',
    adding: 'జోడిస్తోంది…'
  },

  versions: {
    whichVersion: 'ఏ వెర్షన్?',
    downloadTitle: 'ఈ వెర్షన్‌ను మీ డౌన్‌లోడ్‌ల ఫోల్డర్‌కు డౌన్‌లోడ్ చేయి',
    diffVsPrevious: 'మునుపటిదానితో పోల్చు',
    comparing: (from, to) => `పోలుస్తోంది v${from} → v${to}`,
    loadingDiff: 'తేడాలు లోడ్ అవుతున్నాయి…',
    binaryChanged: 'బైనరీ ఫైల్ — కంటెంట్ మారింది.',
    size: (from, to, delta) => `పరిమాణం: ${from} → ${to} (${delta})`,
    deleteTitle: 'ఈ వెర్షన్‌ను తొలగించు',
    deleteConfirmTitle: (label) => `${label}ని తొలగించాలా?`,
    deleteConfirmMessage:
      'ఈ వెర్షన్ ఫైల్ చరిత్ర నుంచి శాశ్వతంగా తీసివేయబడుతుంది. ఇతర వెర్షన్‌లు, ఫైల్ అలాగే ఉంటాయి.'
  },

  openFile: {
    downloadInterrupted: 'డౌన్‌లోడ్ మధ్యలో ఆగిపోయింది.',
    couldNotOpen: (filename, error) =>
      `"${filename}" డౌన్‌లోడ్ అయింది, కానీ స్వయంచాలకంగా తెరవలేకపోయాం (${error}).\n\n` +
      'మీరు దాన్ని Chrome డౌన్‌లోడ్‌ల నుంచి తెరవవచ్చు (Ctrl+J / Cmd+Shift+J). ' +
      'చిట్కా: అక్కడ ఏదైనా డౌన్‌లోడ్‌పై రైట్-క్లిక్ చేసి "ఈ రకమైన ఫైళ్లను ఎల్లప్పుడూ తెరువు" ఎంచుకోండి, ' +
      'ఇకపై ఇది స్వయంచాలకంగా జరుగుతుంది.'
  },

  backup: {
    courseNotFound: 'కోర్సు కనబడలేదు.',
    invalid: (reason) => `ఇది చెల్లుబాటు అయ్యే Moodle Archive బ్యాకప్ కాదు (${reason}).`,
    notZip: 'zip ఫైల్ కాదు',
    missingManifest: 'data.json లేదు',
    invalidJson: 'data.json చెల్లుబాటు అయ్యే JSON కాదు',
    noCourses: 'data.jsonలో కోర్సుల వివరాలు లేవు'
  },

  viewer: {
    notFoundTitle: 'ఫైల్ కనబడలేదు',
    notFoundText: 'ఈ ఫైల్ ఇకపై మీ Moodle Archive చరిత్రలో లేదు — బహుశా తొలగించబడి ఉండవచ్చు.',
    cannotPreview: 'ఈ రకమైన ఫైల్‌ను బ్రౌజర్‌లో ప్రివ్యూ చేయలేము.',
    zoomOut: 'చిన్నదిగా చేయి',
    zoomIn: 'పెద్దదిగా చేయి',
    fitVertically: 'నిలువుగా సరిపెట్టు',
    fitHorizontally: 'అడ్డంగా సరిపెట్టు'
  },

  popup: {
    cannotScan: 'ఈ పేజీని స్కాన్ చేయలేము — ముందు Moodle కోర్సు ట్యాబ్‌ను తెరవండి.',
    filesDownloaded: (count) => `${count} ఫైళ్లు డౌన్‌లోడ్ అయ్యాయి`,
    downloading: 'డౌన్‌లోడ్ అవుతోంది...',
    download: 'డౌన్‌లోడ్ చేయి',
    history: 'చరిత్ర',
    addToQueue: 'క్యూకి జోడించు',
    queued: (position) => `క్యూలో ఉంది (#${position})`,
    queueTitle: 'తదుపరి',
    removeFromQueue: 'క్యూ నుంచి తీసివేయి'
  },

  download: {
    unsupportedUrl: (url) => `మద్దతు లేని URL: ${url}.`,
    processingLinks: 'లింక్‌లను ప్రాసెస్ చేస్తోంది...',
    processing: (url) => `${url}ని ప్రాసెస్ చేస్తోంది`,
    downloadingFiles: 'ఫైళ్లను డౌన్‌లోడ్ చేస్తోంది...',
    downloadingFile: (name) => `${name}ని డౌన్‌లోడ్ చేస్తోంది`,
    cancelled: (name, reason) =>
      `డౌన్‌లోడ్ రద్దయింది: "${name}"ని డౌన్‌లోడ్ చేయలేకపోయాం (${reason}). ఏదీ సేవ్ కాలేదు — మళ్లీ ప్రయత్నించండి.`,
    downloadFailed: 'డౌన్‌లోడ్ విఫలమైంది',
    noResponse: 'ప్రతిస్పందన కోసం వేచి ఉండగా సమయం ముగిసింది',
    stalled: 'నిలిచిపోయింది: సమయానికి డేటా అందలేదు',
    noFileFound: 'ఏ ఫైలూ కనబడలేదు.',
    saving: 'చరిత్రలో సేవ్ చేస్తోంది...',
    savingChunk: (index, total) => `చరిత్రలో సేవ్ చేస్తోంది... (${index}/${total})`,
    saved: 'చరిత్రలో సేవ్ అయింది.',
    saveFailed: (reason) => `చరిత్రలో సేవ్ చేయలేకపోయాం: ${reason}`,
    timedOut: 'ప్రతిస్పందన కోసం వేచి ఉండగా సమయం ముగిసింది — మళ్లీ ప్రయత్నించండి',
    unknownError: 'తెలియని లోపం',
    interrupted: 'డౌన్‌లోడ్ ఆగిపోయింది: ట్యాబ్ మూసివేయబడింది లేదా వేరే పేజీకి వెళ్లింది.',
    couldNotStart: (title) => `"${title}"ని ప్రారంభించలేకపోయాం — దాని ట్యాబ్‌ను తెరిచి మళ్లీ ప్రయత్నించండి.`
  }
};
