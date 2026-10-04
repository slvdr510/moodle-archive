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
    sideMargin: 'Margini laterali',
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
    setTagName: 'Imposta etichetta',
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
    couldNotRead: (fileCount, firstName, error) =>
      `Impossibile leggere ${fileCount === 1 ? `"${firstName}"` : 'i file rilasciati'}: il file potrebbe essere stato ` +
      `spostato o eliminato, oppure è ancora in download. Riprova da una posizione stabile. (${error})`,
    couldNotAdd: (fileCount, error) =>
      fileCount === 1 ? `Impossibile aggiungere il file: ${error}` : `Impossibile aggiungere i file: ${error}`,
    dropFiles: (name) => `Rilascia i file per aggiungerli a "${name}"`,
    searchPlaceholder: 'Cerca file per nome…',
    noMatches: (query) => `Nessun file corrisponde a "${query}".`,
    noFiles: 'Nessun file ancora scaricato per questo corso.'
  },

  fileRow: {
    viewHistory: 'Mostra cronologia delle versioni',
    lastSaved: (date) => `Ultimo salvataggio: ${date}`,
    manual: 'Manuale',
    manualTitle: 'Aggiunto a mano, non scaricato da Moodle',
    deleteTitle: 'Elimina questo file dalla cronologia',
    downloadTitle: 'Scarica nella cartella Download',
    deleteConfirmTitle: (name) => `Eliminare "${name}"?`,
    deleteConfirmMessage:
      'Questo rimuove il file e tutte le sue versioni salvate dalla cronologia. Se è ancora in Moodle, ' +
      'il prossimo download di questo corso lo aggiungerà di nuovo come nuovo file.'
  },

  folderRow: {
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
    remove: 'Rimuovi dagli aperti di recente'
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

  sideMargin: {
    title: 'Margini laterali',
    description:
      'Spazio vuoto su ciascun lato del contenuto in una finestra ingrandita, come frazione dello schermo. In una ' +
      'finestra più piccola il contenuto mantiene quella larghezza, usando prima i margini e poi l’intera finestra.',
    label: (percent) => `${percent}% per lato`
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
    downloadTitle: 'Scarica questa versione nella cartella Download',
    diffVsPrevious: 'Confronta con la precedente',
    comparing: (from, to) => `Confronto v${from} → v${to}`,
    loadingDiff: 'Caricamento delle differenze…',
    binaryChanged: 'File binario: il contenuto è cambiato.',
    size: (from, to, delta) => `Dimensione: ${from} → ${to} (${delta})`,
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
    cannotPreview: 'Questo tipo di file non può essere visualizzato in anteprima nel browser.'
  },

  popup: {
    cannotScan: 'Impossibile analizzare questa pagina: apri prima una scheda con un corso Moodle.',
    filesDownloaded: (count) => `${count} file scaricati`,
    downloading: 'Download in corso...',
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
    downloadingFile: (name) => `Download di ${name}`,
    cancelled: (name, reason) =>
      `Download annullato: impossibile scaricare "${name}" (${reason}). Non è stato salvato nulla, riprova.`,
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
