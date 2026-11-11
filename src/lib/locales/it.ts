import type { Messages } from './en';

export const it: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'di slvdr510',
    cancel: 'Annulla',
    save: 'Salva',
    close: 'Chiudi',
    delete: 'Elimina',
    export: 'Esporta',
    download: 'Scarica',
    moreOptions: 'Altre opzioni',
    exporting: 'Esportazione…',
    importing: 'Importazione…',
    savedToDownloads: (name) => `"${name}" è stato salvato nella cartella Download.`,
    couldNotExport: (name, error) => `Impossibile esportare "${name}": ${error}`
  },

  header: {
    theme: 'Tema',
    themeLight: 'Chiaro',
    themeSystem: 'Come il sistema',
    themeDark: 'Scuro',
    language: 'Lingua',
    languageAuto: 'Lingua del browser'
  },

  relativeTime: {
    justNow: 'proprio ora',
    minutes: (n) => `${n} min fa`,
    hours: (n) => `${n} h fa`,
    days: (n) => `${n} g fa`,
    weeks: (n) => `${n} sett. fa`,
    months: (n) => `${n} ${n === 1 ? 'mese' : 'mesi'} fa`,
    years: (n) => `${n} ${n === 1 ? 'anno' : 'anni'} fa`
  },

  status: {
    new: 'Nuovo',
    modified: 'Modificato',
    deleted: 'Eliminato',
    unchanged: 'Invariato'
  },

  courses: {
    openAllUrls: 'Apri tutti gli URL dei corsi',
    exportAll: 'Esporta tutti i corsi',
    importCourses: 'Importa corso/i',
    recentSettings: 'Impostazioni degli aperti di recente',
    downloadNameSettings: 'Impostazioni dei nomi di download',
    concurrentDownloads: 'Download simultanei',
    sideMargin: 'Margini laterali',
    courseListStyle: 'Stile dell’elenco dei corsi',
    appearance: 'Aspetto',
    editInfo: 'Modifica info dei corsi',
    hiddenCourses: 'Corsi nascosti',
    deleteAll: 'Elimina tutti i corsi',
    backupSaved: 'Backup salvato nella cartella Download.',
    couldNotExportAll: (error) => `Impossibile esportare: ${error}`,
    noUrlsToOpen: 'Nessun URL di corso da aprire.',
    imported: (courses, files, versions) =>
      `Importati ${courses} corso/i, ${files} file e ${versions} versione/i.`,
    notABackup: (name) => `"${name}" non è uno zip nel formato dei corsi usato da questa estensione.`,
    couldNotImport: (details) => `Impossibile importare ${details}`,
    dropBackups: 'Rilascia i backup .zip per importarne i corsi',
    exportAllTitle: 'Esportare tutti i corsi?',
    exportAllMessage: 'Tutti i corsi, i file e le versioni monitorati verranno salvati in un unico zip nella cartella Download.',
    exportAllHidden: (count) =>
      count === 1 ? 'Include anche 1 corso che è nascosto.' : `Include anche ${count} corsi che sono nascosti.`,
    exportCourseTitle: (name) => `Esportare "${name}"?`,
    exportCourseMessage: 'Il corso, i suoi file e tutte le versioni verranno salvati in uno zip nella cartella Download.',
    deleteAllTitle: 'Eliminare tutti i corsi?',
    deleteAllMessage:
      'Questo cancella tutti i corsi, i file e la cronologia delle versioni monitorati dall’estensione. ' +
      'Scarica di nuovo un corso in seguito per ricominciare a ricostruirne la cronologia.',
    deleteCourseTitle: (name) => `Eliminare "${name}"?`,
    deleteCourseMessage:
      'Questo rimuove il corso e la cronologia dei suoi file e versioni. Se scaricherai di nuovo questo corso ' +
      'più avanti, verrà semplicemente ricreato da zero.',
    emptyTitle: 'Ancora nessun corso',
    emptySubtitle: 'I corsi vengono creati automaticamente la prima volta che ne scarichi uno.',
    emptyStep1: 'Apri un corso in Moodle',
    emptyStep2: 'Fai clic sull’icona dell’estensione',
    emptyStep3Before: 'Premi ',
    emptyStep3After: '',
    emptyHintBefore: 'Hai già un backup? Rilascia il suo ',
    emptyHintAfter: ' in qualsiasi punto di questa pagina per importarlo.',
    allHidden: 'Tutti i tuoi corsi sono nascosti. Usa "Corsi nascosti" nel menu ⋮ per mostrarne di nuovo uno.'
  },

  courseRow: {
    lastDownloaded: 'Ultimo download',
    openInMoodle: 'Apri il corso in Moodle',
    setTagName: 'Imposta etichetta (sigla)',
    tagPlaceholder: 'Sigla, es. SO',
    fullNamePlaceholder: 'Nome completo (vuoto: quello di Moodle)',
    tag: 'Etichetta (sigla)',
    fullName: 'Nome completo',
    institutionPlaceholder: 'es. UHU',
    institution: 'Istituzione',
    academicYearPlaceholder: '26-27',
    academicYear: 'Anno accademico',
    editInfo: 'Modifica info del corso',
    addOption: (value) => `Aggiungi "${value}"`,
    showOptions: 'Mostra opzioni',
    hideCourse: 'Nascondi corso',
    deleteCourse: 'Elimina corso'
  },

  hiddenCourses: {
    title: 'Corsi nascosti',
    none: 'Nessun corso è nascosto.',
    unhide: 'Mostra'
  },

  courseFiles: {
    backToCourses: 'Torna ai corsi',
    addFile: 'Aggiungi file…',
    ignoredFiles: 'File ignorati',
    couldNotRead: (fileCount, firstName, error) =>
      `Impossibile leggere ${fileCount === 1 ? `"${firstName}"` : 'i file rilasciati'}: il file potrebbe essere stato ` +
      `spostato o eliminato, oppure è ancora in download. Riprova da una posizione stabile. (${error})`,
    couldNotAdd: (fileCount, error) =>
      fileCount === 1 ? `Impossibile aggiungere il file: ${error}` : `Impossibile aggiungere i file: ${error}`,
    dropFiles: (name) => `Rilascia i file per aggiungerli a "${name}"`,
    searchPlaceholder: 'Scrivi per cercare…',
    noMatches: (query) => `Nessun file o cartella corrisponde a "${query}".`,
    noFiles: 'Nessun file ancora scaricato per questo corso.'
  },

  fileRow: {
    lastSaved: (date) => `Ultimo salvataggio: ${date}`,
    manual: 'Manuale',
    manualTitle: 'Aggiunto a mano, non scaricato da Moodle',
    ignored: 'Ignorato',
    ignoredTitle: 'I download lasciano questo file così com’è',
    ignoreTitle: 'Ignora le modifiche a questo file',
    unignoreTitle: 'Non ignorare più questo file',
    ignoredWithFolderTitle: 'Ignorato insieme alla sua cartella',
    deleteTitle: 'Elimina questo file dalla cronologia',
    downloadTitle: 'Scarica nella cartella Download',
    deleteConfirmTitle: (name) => `Eliminare "${name}"?`,
    deleteConfirmMessage:
      'Questo rimuove il file e tutte le sue versioni salvate dalla cronologia. Se è ancora in Moodle, ' +
      'il prossimo download di questo corso lo aggiungerà di nuovo come nuovo file.'
  },

  folderRow: {
    ignoreTitle: 'Ignora questa cartella e tutto il suo contenuto',
    unignoreTitle: 'Non ignorare più questa cartella',
    ignoredTitle: 'I download lasciano questa cartella e tutto il suo contenuto così come sono',
    deleteTitle: 'Elimina questa cartella dalla cronologia',
    downloadTitle: 'Scarica questa cartella come zip',
    couldNotDownload: (name, error) => `Impossibile scaricare "${name}": ${error}`,
    deleteConfirmTitle: (name) => `Eliminare "${name}"?`,
    deleteConfirmMessage: (fileCount) =>
      `Questo rimuove la cartella, ${fileCount === 1 ? 'il suo file' : `i suoi ${fileCount} file`} e tutte le loro ` +
      'versioni salvate dalla cronologia. Ciò che è ancora in Moodle verrà aggiunto di nuovo come nuovo al prossimo ' +
      'download di questo corso.'
  },

  recentlyOpened: {
    title: 'Aperti di recente',
    remove: 'Rimuovi dagli aperti di recente',
    showAll: 'Mostra tutti gli aperti di recente'
  },

  recentSettings: {
    title: 'Aperti di recente',
    appliesToAll: 'Si applica a tutti i corsi.',
    show: 'Mostra i file aperti di recente',
    noLimit: 'Nessun limite',
    maximum: 'Numero massimo di file aperti di recente per corso'
  },

  downloadNames: {
    title: 'Nomi di download',
    description: 'Si applica a tutti i corsi. I corsi senza etichetta vengono scaricati con il nome originale del file.',
    prefixCourseTag: 'Aggiungi l’etichetta del corso all’inizio dei nomi di download (es. ETICHETTA_file.pdf)'
  },

  concurrentDownloads: {
    title: 'Download simultanei',
    description:
      'Quanti file di un corso vengono scaricati contemporaneamente. ' +
      'Con più file il download può finire prima su una connessione veloce, ma il server Moodle della tua istituzione viene caricato di più. ' +
      'Predefinito: 2. Si applica dal prossimo download.'
  },

  sideMargin: {
    title: 'Margini laterali',
    description:
      'Spazio vuoto su ciascun lato del contenuto in una finestra ingrandita, come frazione dello schermo. In una ' +
      'finestra più piccola il contenuto mantiene quella larghezza, usando prima i margini e poi l’intera finestra.',
    label: (percent) => `${percent}% per lato`
  },

  courseListStyle: {
    title: 'Stile dell’elenco dei corsi',
    description: 'Come vengono mostrati i corsi in questa pagina.',
    cards: 'Schede',
    grid: 'Griglia',
    rows: 'Righe'
  },

  courseColor: {
    custom: 'Colore personalizzato',
    automatic: 'Usa il colore automatico'
  },

  colorMenu: {
    code: 'Codice esadecimale',
    codeHint: 'Sei cifre, ad es. FFFFFF',
    more: 'Altri colori…'
  },

  appearance: {
    title: 'Aspetto',
    palettes: 'Tavolozze',
    paletteNames: {
      default: 'Predefinita',
      ocean: 'Oceano',
      forest: 'Bosco',
      lavender: 'Lavanda',
      warm: 'Calda',
      contrast: 'Contrasto elevato'
    },
    replaceTitle: 'Sostituire i tuoi colori?',
    replaceMessage: 'I colori che hai impostato in questo tema vengono sostituiti da quelli della tavolozza.',
    replace: 'Sostituisci',
    colors: {
      bg: 'Sfondo',
      surface: 'Sfondo secondario',
      fg: 'Testo',
      muted: 'Testo secondario',
      border: 'Bordi',
      accent: 'Pulsanti e link',
      focus: 'Focus della tastiera',
      new: 'File nuovi',
      modified: 'File modificati',
      deleted: 'File eliminati e azioni pericolose',
      unchanged: 'File invariati'
    },
    reset: 'Ripristina il colore predefinito',
    resetAll: 'Ripristina i colori',
    resetTitle: { light: 'Ripristinare i colori del tema chiaro?', dark: 'Ripristinare i colori del tema scuro?' },
    resetMessage: 'Tutti i colori che hai cambiato tornano a quelli predefiniti.'
  },

  courseUrl: {
    label: 'URL del corso',
    invalid:
      "Non è l'URL della pagina di un corso Moodle. Termina con /course/view.php?id= e il numero del corso.",
    taken: (name) => `"${name}" ha già questo URL.`,
    previousKept:
      'I suoi URL precedenti continuano a essere riconosciuti: i download da lì vanno ancora in questo corso.'
  },

  courseInfo: {
    title: 'Modifica info dei corsi',
    hidden: 'Nascosto',
    color: 'Colore',
    academicYearColor: "Colore dell'anno accademico",
    deleteOption: (value) => `Elimina "${value}"`,
    deleteOptionTitle: (value) => `Eliminare "${value}"?`,
    deleteOptionMessage: (count) =>
      count === 0 ? `Nessun corso ce l'ha: semplicemente non verrà più proposto.` : count === 1 ? `Verrà tolto dall'unico corso che ce l'ha.` : `Verrà tolto dai ${count} corsi che ce l'hanno.`
  },

  ignoredFiles: {
    title: 'File ignorati',
    description:
      'I download lasciano questi file così come sono: nessuna nuova versione, mai segnati come eliminati e non aggiunti se non sono ancora seguiti.',
    pathLabel: 'Percorso del file',
    placeholder: 'Cartella/file.pdf',
    hint:
      'Includi l’estensione e le cartelle in cui si trova: un file nella radice del corso è solo il suo nome. File con lo stesso nome in cartelle diverse sono file diversi. Termina un percorso con / per ignorare un’intera cartella con tutto il suo contenuto.',
    add: 'Aggiungi',
    folder: 'Cartella',
    remove: (path) => `Non ignorare più ${path}`,
    empty: 'Nessun file ignorato.',
    duplicate: 'Quel file è già nell’elenco.',
    notFound: 'Non ancora in questo corso',
    askDeleteTitle: (count, name) => (count === 1 ? `"${name}" ora è ignorato` : `${count} file ora sono ignorati`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'I download lo lasceranno così com’è. Vuoi anche eliminarlo da questo corso, con tutte le sue versioni salvate? Finché è ignorato, i prossimi download non lo aggiungeranno di nuovo.'
        : 'I download li lasceranno così come sono. Vuoi anche eliminarli da questo corso, con tutte le loro versioni salvate? Finché sono ignorati, i prossimi download non li aggiungeranno di nuovo.',
    keep: (count) => (count === 1 ? 'Tienilo' : 'Tienili')
  },

  upload: {
    titleOne: (name) => `Aggiungi "${name}"`,
    titleMany: (count) => `Aggiungi ${count} file`,
    where: (count) => `Dove vuoi salvar${count === 1 ? 'lo' : 'li'}?`,
    courseRoot: 'Radice del corso',
    existingFolder: 'Cartella esistente',
    newFolder: 'Nuova cartella',
    folderNamePlaceholder: 'Nome della cartella',
    newFolderNameLabel: 'Nome della nuova cartella',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' esiste già in questa cartella: il nuovo file verrà aggiunto come una sua nuova versione.',
    add: 'Aggiungi',
    adding: 'Aggiunta…'
  },

  versions: {
    whichVersion: 'Quale versione?',
    deleteTitle: 'Elimina questa versione',
    deleteConfirmTitle: (label) => `Eliminare ${label}?`,
    deleteConfirmMessage:
      'Questa versione verrà rimossa definitivamente dalla cronologia del file. Le altre versioni e il file restano.'
  },

  openFile: {
    downloadInterrupted: 'Il download è stato interrotto.',
    couldNotOpen: (filename, error) =>
      `"${filename}" è stato scaricato, ma non è stato possibile aprirlo automaticamente (${error}).\n\n` +
      'Puoi aprirlo dai download di Chrome (Ctrl+J / Cmd+Maiusc+J). ' +
      'Suggerimento: fai clic con il tasto destro su un download e scegli "Apri sempre i file di questo tipo" ' +
      'perché d’ora in poi avvenga automaticamente.'
  },

  backup: {
    courseNotFound: 'Corso non trovato.',
    invalid: (reason) => `Non è un backup valido di Moodle Archive (${reason}).`,
    notZip: 'non è un file zip',
    missingManifest: 'manca data.json',
    invalidJson: 'data.json non è un JSON valido',
    noCourses: 'data.json non descrive corsi'
  },

  viewer: {
    notFoundTitle: 'File non trovato',
    notFoundText: 'Questo file non è più nella cronologia di Moodle Archive: potrebbe essere stato eliminato.',
    cannotPreview: 'Questo tipo di file non può essere visualizzato in anteprima nel browser.',
    zoomOut: 'Riduci',
    zoomIn: 'Ingrandisci',
    fitVertically: 'Adatta in verticale',
    fitHorizontally: 'Adatta in orizzontale'
  },

  popup: {
    cannotScan: 'Impossibile analizzare questa pagina: apri prima una scheda con un corso Moodle.',
    filesDownloaded: (count) => `${count} file scaricati`,
    downloading: 'Download in corso...',
    retrying: 'Nuovo tentativo…',
    download: 'Scarica',
    history: 'Cronologia',
    addToQueue: 'Aggiungi alla coda',
    queued: (position) => `In coda (n. ${position})`,
    queueTitle: 'A seguire',
    removeFromQueue: 'Rimuovi dalla coda'
  },

  download: {
    unsupportedUrl: (url) => `URL non supportato: ${url}.`,
    processingLinks: 'Elaborazione dei link...',
    processing: (url) => `Elaborazione di ${url}`,
    downloadingFiles: 'Download dei file...',
    cancelled: (name, reason) =>
      `Download annullato: impossibile scaricare "${name}" (${reason}). Non è stato salvato nulla, riprova.`,
    sessionExpired:
      'Download annullato: Moodle chiede di accedere (la sessione potrebbe essere scaduta). Accedi a Moodle e scarica di nuovo. Non è stato salvato nulla.',
    retrying: (name) => `Nuovo tentativo per "${name}"…`,
    ignoredSkipped: (count) =>
      count === 1 ? '1 file ignorato è stato saltato.' : `${count} file ignorati sono stati saltati.`,
    unavailable: (count) =>
      count === 1 ? '1 file non è più disponibile su Moodle (il suo link dà errore) e non è stato scaricato.' : `${count} file non sono più disponibili su Moodle (i loro link danno errore) e non sono stati scaricati.`,
    downloadFailed: 'download non riuscito',
    noResponse: 'Tempo scaduto in attesa di una risposta',
    stalled: 'Bloccato: nessun dato ricevuto in tempo',
    noFileFound: 'Nessun file trovato.',
    saving: 'Salvataggio nella cronologia...',
    savingChunk: (index, total) => `Salvataggio nella cronologia... (${index}/${total})`,
    saved: 'Salvato nella cronologia.',
    saveFailed: (reason) => `Impossibile salvare nella cronologia: ${reason}`,
    timedOut: 'tempo scaduto in attesa di una risposta, riprova',
    unknownError: 'errore sconosciuto',
    interrupted: 'Download interrotto: la scheda è stata chiusa o ha cambiato pagina.',
    couldNotStart: (title) => `Impossibile avviare "${title}": apri la sua scheda e riprova.`
  }
};
