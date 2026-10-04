import type { Messages } from './en';

export const de: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'von slvdr510',
    cancel: 'Abbrechen',
    save: 'Speichern',
    close: 'Schließen',
    delete: 'Löschen',
    export: 'Exportieren',
    download: 'Herunterladen',
    moreOptions: 'Weitere Optionen',
    exporting: 'Wird exportiert…',
    importing: 'Wird importiert…',
    savedToDownloads: (name) => `„${name}“ wurde in deinem Downloads-Ordner gespeichert.`,
    couldNotExport: (name, error) => `„${name}“ konnte nicht exportiert werden: ${error}`
  },

  header: {
    theme: 'Design',
    themeLight: 'Hell',
    themeSystem: 'Wie System',
    themeDark: 'Dunkel',
    language: 'Sprache',
    languageAuto: 'Browsersprache'
  },

  relativeTime: {
    justNow: 'gerade eben',
    minutes: (n) => `vor ${n} Min.`,
    hours: (n) => `vor ${n} Std.`,
    days: (n) => `vor ${n} T.`,
    weeks: (n) => `vor ${n} Wo.`,
    months: (n) => `vor ${n} Mon.`,
    years: (n) => `vor ${n} J.`
  },

  status: {
    new: 'Neu',
    modified: 'Geändert',
    deleted: 'Gelöscht',
    unchanged: 'Unverändert'
  },

  courses: {
    openAllUrls: 'Alle Kurs-URLs öffnen',
    exportAll: 'Alle Kurse exportieren',
    importCourses: 'Kurs(e) importieren',
    recentSettings: 'Einstellungen für zuletzt geöffnet',
    downloadNameSettings: 'Einstellungen für Download-Namen',
    sideMargin: 'Seitenränder',
    hiddenCourses: 'Ausgeblendete Kurse',
    deleteAll: 'Alle Kurse löschen',
    backupSaved: 'Sicherung in deinem Downloads-Ordner gespeichert.',
    couldNotExportAll: (error) => `Export fehlgeschlagen: ${error}`,
    noUrlsToOpen: 'Keine Kurs-URLs zum Öffnen.',
    imported: (courses, files, versions) =>
      `${courses} Kurs(e), ${files} Datei(en) und ${versions} Version(en) importiert.`,
    notABackup: (name) => `„${name}“ ist keine Zip-Datei im Kursformat dieser Erweiterung.`,
    couldNotImport: (details) => `Import fehlgeschlagen: ${details}`,
    dropBackups: '.zip-Sicherungen hier ablegen, um ihre Kurse zu importieren',
    exportAllTitle: 'Alle Kurse exportieren?',
    exportAllMessage:
      'Alle erfassten Kurse, Dateien und Versionen werden in einer einzigen Zip-Datei in deinem Downloads-Ordner gespeichert.',
    exportCourseTitle: (name) => `„${name}“ exportieren?`,
    exportCourseMessage:
      'Der Kurs, seine Dateien und alle Versionen werden als Zip-Datei in deinem Downloads-Ordner gespeichert.',
    deleteAllTitle: 'Alle Kurse löschen?',
    deleteAllMessage:
      'Dadurch werden alle von der Erweiterung erfassten Kurse, Dateien und Versionsverläufe gelöscht. ' +
      'Lade danach einen Kurs erneut herunter, um seinen Verlauf neu aufzubauen.',
    deleteCourseTitle: (name) => `„${name}“ löschen?`,
    deleteCourseMessage:
      'Dadurch werden der Kurs und sein Datei- und Versionsverlauf entfernt. Wenn du diesen Kurs später ' +
      'erneut herunterlädst, wird er einfach von Grund auf neu angelegt.',
    emptyTitle: 'Noch keine Kurse',
    emptySubtitle: 'Kurse werden automatisch angelegt, wenn du zum ersten Mal einen herunterlädst.',
    emptyStep1: 'Öffne einen Kurs in Moodle',
    emptyStep2: 'Klicke auf das Symbol der Erweiterung',
    emptyStep3Before: 'Klicke auf ',
    emptyStep3After: '',
    emptyHintBefore: 'Du hast schon eine Sicherung? Lege die ',
    emptyHintAfter: '-Datei irgendwo auf dieser Seite ab, um sie zu importieren.',
    allHidden: 'Alle deine Kurse sind ausgeblendet. Über „Ausgeblendete Kurse“ im ⋮-Menü kannst du einen wieder einblenden.'
  },

  courseRow: {
    lastDownloaded: 'Zuletzt heruntergeladen',
    openInMoodle: 'Kurs in Moodle öffnen',
    setTagName: 'Kürzel festlegen',
    hideCourse: 'Kurs ausblenden',
    deleteCourse: 'Kurs löschen'
  },

  hiddenCourses: {
    title: 'Ausgeblendete Kurse',
    none: 'Keine Kurse ausgeblendet.',
    unhide: 'Einblenden'
  },

  courseFiles: {
    backToCourses: 'Zurück zu den Kursen',
    addFile: 'Datei hinzufügen…',
    couldNotRead: (fileCount, firstName, error) =>
      `${fileCount === 1 ? `„${firstName}“ konnte` : 'Die abgelegten Dateien konnten'} nicht gelesen werden – ` +
      'die Datei wurde eventuell verschoben oder gelöscht oder wird noch heruntergeladen. ' +
      `Versuche es von einem festen Speicherort aus erneut. (${error})`,
    couldNotAdd: (fileCount, error) =>
      `${fileCount === 1 ? 'Die Datei konnte' : 'Die Dateien konnten'} nicht hinzugefügt werden: ${error}`,
    dropFiles: (name) => `Dateien hier ablegen, um sie zu „${name}“ hinzuzufügen`,
    searchPlaceholder: 'Dateien nach Name suchen…',
    noMatches: (query) => `Keine Dateien passen zu „${query}“.`,
    noFiles: 'Für diesen Kurs wurden noch keine Dateien heruntergeladen.'
  },

  fileRow: {
    viewHistory: 'Versionsverlauf anzeigen',
    lastSaved: (date) => `Zuletzt gespeichert: ${date}`,
    manual: 'Manuell',
    manualTitle: 'Von Hand hinzugefügt, nicht aus Moodle heruntergeladen',
    deleteTitle: 'Diese Datei aus deinem Verlauf löschen',
    downloadTitle: 'In deinen Downloads-Ordner herunterladen',
    deleteConfirmTitle: (name) => `„${name}“ löschen?`,
    deleteConfirmMessage:
      'Dadurch werden die Datei und alle gespeicherten Versionen aus deinem Verlauf entfernt. Wenn sie noch in Moodle ' +
      'ist, wird sie beim nächsten Download dieses Kurses als neue Datei wieder hinzugefügt.'
  },

  folderRow: {
    deleteTitle: 'Diesen Ordner aus deinem Verlauf löschen',
    downloadTitle: 'Diesen Ordner als Zip herunterladen',
    couldNotDownload: (name, error) => `„${name}“ konnte nicht heruntergeladen werden: ${error}`,
    deleteConfirmTitle: (name) => `„${name}“ löschen?`,
    deleteConfirmMessage: (fileCount) =>
      `Dadurch werden der Ordner, ${fileCount === 1 ? 'seine Datei' : `seine ${fileCount} Dateien`} und alle ` +
      'gespeicherten Versionen aus deinem Verlauf entfernt. Alles, was noch in Moodle ist, wird beim nächsten ' +
      'Download dieses Kurses als neu wieder hinzugefügt.'
  },

  recentlyOpened: {
    title: 'Zuletzt geöffnet',
    remove: 'Aus „Zuletzt geöffnet“ entfernen'
  },

  recentSettings: {
    title: 'Zuletzt geöffnet',
    appliesToAll: 'Gilt für alle Kurse.',
    show: 'Zuletzt geöffnete Dateien anzeigen',
    noLimit: 'Keine Begrenzung',
    maximum: 'Maximale Anzahl zuletzt geöffneter Dateien pro Kurs'
  },

  downloadNames: {
    title: 'Download-Namen',
    description: 'Gilt für alle Kurse. Kurse ohne Kürzel werden unter dem eigenen Namen der Datei heruntergeladen.',
    prefixCourseTag: 'Kurskürzel an den Anfang der Download-Namen setzen (z. B. KÜRZEL_datei.pdf)'
  },

  sideMargin: {
    title: 'Seitenränder',
    description:
      'Leerer Raum auf jeder Seite des Inhalts in einem maximierten Fenster, als Anteil des Bildschirms. In einem ' +
      'kleineren Fenster behält der Inhalt diese Breite und nutzt zuerst die Ränder und dann das ganze Fenster.',
    label: (percent) => `${percent} % auf jeder Seite`
  },

  upload: {
    titleOne: (name) => `„${name}“ hinzufügen`,
    titleMany: (count) => `${count} Dateien hinzufügen`,
    where: () => 'Wo möchtest du sie speichern?',
    courseRoot: 'Kursstamm',
    existingFolder: 'Vorhandener Ordner',
    newFolder: 'Neuer Ordner',
    folderNamePlaceholder: 'Ordnername',
    newFolderNameLabel: 'Name des neuen Ordners',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' gibt es in diesem Ordner bereits – die neue Datei wird als neue Version davon hinzugefügt.',
    add: 'Hinzufügen',
    adding: 'Wird hinzugefügt…'
  },

  versions: {
    whichVersion: 'Welche Version?',
    downloadTitle: 'Diese Version in deinen Downloads-Ordner herunterladen',
    diffVsPrevious: 'Mit vorheriger vergleichen',
    comparing: (from, to) => `Vergleich v${from} → v${to}`,
    loadingDiff: 'Unterschiede werden geladen…',
    binaryChanged: 'Binärdatei – Inhalt geändert.',
    size: (from, to, delta) => `Größe: ${from} → ${to} (${delta})`,
    deleteTitle: 'Diese Version löschen',
    deleteConfirmTitle: (label) => `${label} löschen?`,
    deleteConfirmMessage:
      'Diese Version wird endgültig aus dem Verlauf der Datei entfernt. Die anderen Versionen und die Datei bleiben erhalten.'
  },

  openFile: {
    downloadInterrupted: 'Der Download wurde unterbrochen.',
    couldNotOpen: (filename, error) =>
      `„${filename}“ wurde heruntergeladen, konnte aber nicht automatisch geöffnet werden (${error}).\n\n` +
      'Du kannst die Datei über die Downloads von Chrome öffnen (Strg+J / Cmd+Umschalt+J). ' +
      'Tipp: Klicke dort mit der rechten Maustaste auf einen Download und wähle „Dateien dieses Typs immer öffnen“, ' +
      'damit das ab jetzt automatisch passiert.'
  },

  backup: {
    courseNotFound: 'Kurs nicht gefunden.',
    invalid: (reason) => `Keine gültige Moodle-Archive-Sicherung (${reason}).`,
    notZip: 'keine Zip-Datei',
    missingManifest: 'data.json fehlt',
    invalidJson: 'data.json ist kein gültiges JSON',
    noCourses: 'data.json beschreibt keine Kurse'
  },

  viewer: {
    notFoundTitle: 'Datei nicht gefunden',
    notFoundText: 'Diese Datei ist nicht mehr in deinem Moodle-Archive-Verlauf – sie wurde eventuell gelöscht.',
    cannotPreview: 'Für diesen Dateityp gibt es im Browser keine Vorschau.'
  },

  popup: {
    cannotScan: 'Diese Seite kann nicht durchsucht werden – öffne zuerst einen Moodle-Kurs in einem Tab.',
    filesDownloaded: (count) => `${count} Datei(en) heruntergeladen`,
    downloading: 'Wird heruntergeladen...',
    download: 'Herunterladen',
    history: 'Verlauf',
    addToQueue: 'Zur Warteschlange hinzufügen',
    queued: (position) => `In der Warteschlange (Nr. ${position})`,
    queueTitle: 'Als Nächstes',
    removeFromQueue: 'Aus der Warteschlange entfernen'
  },

  download: {
    unsupportedUrl: (url) => `Nicht unterstützte URL: ${url}.`,
    processingLinks: 'Links werden verarbeitet...',
    processing: (url) => `Verarbeite ${url}`,
    downloadingFiles: 'Dateien werden heruntergeladen...',
    downloadingFile: (name) => `Lade ${name} herunter`,
    cancelled: (name, reason) =>
      `Download abgebrochen: „${name}“ konnte nicht heruntergeladen werden (${reason}). Es wurde nichts gespeichert – versuche es erneut.`,
    downloadFailed: 'Download fehlgeschlagen',
    noResponse: 'Zeitüberschreitung beim Warten auf eine Antwort',
    stalled: 'Hängt: keine Daten rechtzeitig empfangen',
    noFileFound: 'Keine Datei gefunden.',
    saving: 'Wird im Verlauf gespeichert...',
    savingChunk: (index, total) => `Wird im Verlauf gespeichert... (${index}/${total})`,
    saved: 'Im Verlauf gespeichert.',
    saveFailed: (reason) => `Speichern im Verlauf fehlgeschlagen: ${reason}`,
    timedOut: 'Zeitüberschreitung beim Warten auf eine Antwort – versuche es erneut',
    unknownError: 'unbekannter Fehler',
    interrupted: 'Download unterbrochen: Der Tab wurde geschlossen oder hat die Seite gewechselt.',
    couldNotStart: (title) => `„${title}“ konnte nicht gestartet werden – öffne seinen Tab und versuche es erneut.`
  }
};
