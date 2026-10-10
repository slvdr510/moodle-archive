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
    courseListStyle: 'Stil der Kursliste',
    setInstitution: 'Einrichtung für Kurse festlegen',
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
    setFullName: 'Vollständigen Namen festlegen',
    tagPlaceholder: 'Kürzel, z. B. BS',
    fullNamePlaceholder: 'Vollständiger Name (leer: der aus Moodle)',
    setInstitution: 'Einrichtung festlegen (Kürzel)',
    institutionPlaceholder: 'Kürzel der Einrichtung, z. B. UHU',
    institution: 'Einrichtung',
    changeColor: 'Farbe ändern',
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
    ignoredFiles: 'Ignorierte Dateien',
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
    ignored: 'Ignoriert',
    ignoredTitle: 'Downloads lassen diese Datei unverändert',
    ignoreTitle: 'Änderungen an dieser Datei ignorieren',
    unignoreTitle: 'Diese Datei nicht mehr ignorieren',
    ignoredWithFolderTitle: 'Zusammen mit seinem Ordner ignoriert',
    deleteTitle: 'Diese Datei aus deinem Verlauf löschen',
    downloadTitle: 'In deinen Downloads-Ordner herunterladen',
    deleteConfirmTitle: (name) => `„${name}“ löschen?`,
    deleteConfirmMessage:
      'Dadurch werden die Datei und alle gespeicherten Versionen aus deinem Verlauf entfernt. Wenn sie noch in Moodle ' +
      'ist, wird sie beim nächsten Download dieses Kurses als neue Datei wieder hinzugefügt.'
  },

  folderRow: {
    ignoreTitle: 'Diesen Ordner mit allem Inhalt ignorieren',
    unignoreTitle: 'Diesen Ordner nicht mehr ignorieren',
    ignoredTitle: 'Downloads lassen diesen Ordner mit allem Inhalt unverändert',
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
    remove: 'Aus „Zuletzt geöffnet“ entfernen',
    showAll: 'Alle zuletzt geöffneten anzeigen'
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

  courseListStyle: {
    title: 'Stil der Kursliste',
    description: 'Wie die Kurse auf dieser Seite angezeigt werden.',
    cards: 'Karten',
    rows: 'Zeilen'
  },

  courseColor: {
    title: (name) => `Farbe von „${name}“`,
    palette: 'Palette',
    custom: 'Eigene Farbe',
    automatic: 'Automatische Farbe verwenden'
  },

  setInstitution: {
    title: 'Einrichtung festlegen',
    description: 'Wähle die Kurse, die diese Einrichtung bekommen. Leer lassen, um sie bei ihnen zu entfernen.',
    courses: (count) => (count === 0 ? 'Kurse' : `Kurse (${count} ausgewählt)`),
    selectAll: 'Alle auswählen',
    selectNone: 'Keine',
    hidden: 'Ausgeblendet',
    apply: (count) => (count === 1 ? 'Auf 1 Kurs anwenden' : `Auf ${count} Kurse anwenden`),
    remove: (count) => (count === 1 ? 'Bei 1 Kurs entfernen' : `Bei ${count} Kursen entfernen`)
  },

  ignoredFiles: {
    title: 'Ignorierte Dateien',
    description:
      'Downloads lassen diese Dateien unverändert: keine neuen Versionen, nie als gelöscht markiert und nicht hinzugefügt, wenn sie noch nicht verfolgt werden.',
    pathLabel: 'Dateipfad',
    placeholder: 'Ordner/datei.pdf',
    hint:
      'Gib die Endung und die Ordner an, in denen sie liegt: Eine Datei im Stammverzeichnis des Kurses ist nur ihr Name. Gleichnamige Dateien in verschiedenen Ordnern sind verschiedene Dateien. Beende einen Pfad mit /, um einen ganzen Ordner mit allem Inhalt zu ignorieren.',
    add: 'Hinzufügen',
    folder: 'Ordner',
    remove: (path) => `${path} nicht mehr ignorieren`,
    empty: 'Keine ignorierten Dateien.',
    duplicate: 'Diese Datei ist bereits in der Liste.',
    notFound: 'Noch nicht in diesem Kurs',
    askDeleteTitle: (count, name) => (count === 1 ? `„${name}“ wird jetzt ignoriert` : `${count} Dateien werden jetzt ignoriert`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'Downloads lassen sie unverändert. Möchtest du sie auch aus diesem Kurs löschen, mit allen gespeicherten Versionen? Solange sie ignoriert wird, fügen spätere Downloads sie nicht wieder hinzu.'
        : 'Downloads lassen sie unverändert. Möchtest du sie auch aus diesem Kurs löschen, mit allen gespeicherten Versionen? Solange sie ignoriert werden, fügen spätere Downloads sie nicht wieder hinzu.',
    keep: (count) => (count === 1 ? 'Behalten' : 'Behalten')
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
    cannotPreview: 'Für diesen Dateityp gibt es im Browser keine Vorschau.',
    zoomOut: 'Verkleinern',
    zoomIn: 'Vergrößern',
    fitVertically: 'Vertikal anpassen',
    fitHorizontally: 'Horizontal anpassen'
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
