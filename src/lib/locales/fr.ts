import type { Messages } from './en';

export const fr: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'par slvdr510',
    cancel: 'Annuler',
    save: 'Enregistrer',
    close: 'Fermer',
    delete: 'Supprimer',
    export: 'Exporter',
    download: 'Télécharger',
    moreOptions: 'Plus d’options',
    exporting: 'Exportation…',
    importing: 'Importation…',
    savedToDownloads: (name) => `« ${name} » a été enregistré dans votre dossier Téléchargements.`,
    couldNotExport: (name, error) => `Impossible d’exporter « ${name} » : ${error}`
  },

  header: {
    theme: 'Thème',
    themeLight: 'Clair',
    themeSystem: 'Comme le système',
    themeDark: 'Sombre',
    language: 'Langue',
    languageAuto: 'Langue du navigateur'
  },

  relativeTime: {
    justNow: 'à l’instant',
    minutes: (n) => `il y a ${n} min`,
    hours: (n) => `il y a ${n} h`,
    days: (n) => `il y a ${n} j`,
    weeks: (n) => `il y a ${n} sem.`,
    months: (n) => `il y a ${n} mois`,
    years: (n) => `il y a ${n} an${n === 1 ? '' : 's'}`
  },

  status: {
    new: 'Nouveau',
    modified: 'Modifié',
    deleted: 'Supprimé',
    unchanged: 'Inchangé'
  },

  courses: {
    openAllUrls: 'Ouvrir toutes les URL des cours',
    exportAll: 'Exporter tous les cours',
    importCourses: 'Importer des cours',
    recentSettings: 'Paramètres des fichiers récents',
    downloadNameSettings: 'Paramètres des noms de téléchargement',
    sideMargin: 'Marges latérales',
    courseListStyle: 'Style de la liste des cours',
    setInstitution: 'Définir l’établissement de cours',
    hiddenCourses: 'Cours masqués',
    deleteAll: 'Supprimer tous les cours',
    backupSaved: 'Sauvegarde enregistrée dans votre dossier Téléchargements.',
    couldNotExportAll: (error) => `Impossible d’exporter : ${error}`,
    noUrlsToOpen: 'Aucune URL de cours à ouvrir.',
    imported: (courses, files, versions) =>
      `${courses} cours, ${files} fichier(s) et ${versions} version(s) importés.`,
    notABackup: (name) => `« ${name} » n’est pas un zip au format de cours utilisé par cette extension.`,
    couldNotImport: (details) => `Impossible d’importer ${details}`,
    dropBackups: 'Déposez des sauvegardes .zip pour importer leurs cours',
    exportAllTitle: 'Exporter tous les cours ?',
    exportAllMessage:
      'Tous les cours, fichiers et versions suivis seront enregistrés dans un seul zip dans votre dossier Téléchargements.',
    exportCourseTitle: (name) => `Exporter « ${name} » ?`,
    exportCourseMessage:
      'Le cours, ses fichiers et toutes ses versions seront enregistrés dans un zip dans votre dossier Téléchargements.',
    deleteAllTitle: 'Supprimer tous les cours ?',
    deleteAllMessage:
      'Cela efface tous les cours, fichiers et historiques de versions suivis par l’extension. ' +
      'Téléchargez à nouveau un cours ensuite pour recommencer à constituer son historique.',
    deleteCourseTitle: (name) => `Supprimer « ${name} » ?`,
    deleteCourseMessage:
      'Cela supprime le cours ainsi que l’historique de ses fichiers et versions. Si vous téléchargez ce cours ' +
      'à nouveau plus tard, il sera simplement recréé à partir de zéro.',
    emptyTitle: 'Aucun cours pour l’instant',
    emptySubtitle: 'Les cours sont créés automatiquement la première fois que vous en téléchargez un.',
    emptyStep1: 'Ouvrez un cours dans Moodle',
    emptyStep2: 'Cliquez sur l’icône de l’extension',
    emptyStep3Before: 'Appuyez sur ',
    emptyStep3After: '',
    emptyHintBefore: 'Vous avez déjà une sauvegarde ? Déposez son ',
    emptyHintAfter: ' n’importe où sur cette page pour l’importer.',
    allHidden: 'Tous vos cours sont masqués. Utilisez « Cours masqués » dans le menu ⋮ pour en réafficher un.'
  },

  courseRow: {
    lastDownloaded: 'Dernier téléchargement',
    openInMoodle: 'Ouvrir le cours dans Moodle',
    setTagName: 'Définir l’étiquette (sigle)',
    setFullName: 'Définir le nom complet',
    tagPlaceholder: 'Sigle, p. ex. SE',
    fullNamePlaceholder: 'Nom complet (vide : celui de Moodle)',
    setInstitution: 'Définir l’établissement (sigle)',
    institutionPlaceholder: 'Sigle de l’établissement, p. ex. UHU',
    institution: 'Établissement',
    changeColor: 'Changer la couleur',
    hideCourse: 'Masquer le cours',
    deleteCourse: 'Supprimer le cours'
  },

  hiddenCourses: {
    title: 'Cours masqués',
    none: 'Aucun cours n’est masqué.',
    unhide: 'Réafficher'
  },

  courseFiles: {
    backToCourses: 'Retour aux cours',
    addFile: 'Ajouter un fichier…',
    ignoredFiles: 'Fichiers ignorés',
    couldNotRead: (fileCount, firstName, error) =>
      `Impossible de lire ${fileCount === 1 ? `« ${firstName} »` : 'les fichiers déposés'} : le fichier a peut-être été ` +
      `déplacé ou supprimé, ou il est encore en cours de téléchargement. Réessayez depuis un emplacement stable. (${error})`,
    couldNotAdd: (fileCount, error) =>
      fileCount === 1 ? `Impossible d’ajouter le fichier : ${error}` : `Impossible d’ajouter les fichiers : ${error}`,
    dropFiles: (name) => `Déposez des fichiers pour les ajouter à « ${name} »`,
    searchPlaceholder: 'Rechercher des fichiers par nom…',
    noMatches: (query) => `Aucun fichier ne correspond à « ${query} ».`,
    noFiles: 'Aucun fichier téléchargé pour ce cours pour l’instant.'
  },

  fileRow: {
    viewHistory: 'Voir l’historique des versions',
    lastSaved: (date) => `Dernier enregistrement : ${date}`,
    manual: 'Manuel',
    manualTitle: 'Ajouté à la main, pas téléchargé depuis Moodle',
    ignored: 'Ignoré',
    ignoredTitle: 'Les téléchargements laissent ce fichier tel quel',
    ignoreTitle: 'Ignorer les modifications de ce fichier',
    unignoreTitle: 'Ne plus ignorer ce fichier',
    ignoredWithFolderTitle: 'Ignoré avec son dossier',
    deleteTitle: 'Supprimer ce fichier de votre historique',
    downloadTitle: 'Télécharger dans votre dossier Téléchargements',
    deleteConfirmTitle: (name) => `Supprimer « ${name} » ?`,
    deleteConfirmMessage:
      'Cela supprime le fichier et toutes ses versions enregistrées de votre historique. S’il est toujours dans Moodle, ' +
      'le prochain téléchargement de ce cours l’ajoutera à nouveau comme nouveau fichier.'
  },

  folderRow: {
    ignoreTitle: 'Ignorer ce dossier et tout son contenu',
    unignoreTitle: 'Ne plus ignorer ce dossier',
    ignoredTitle: 'Les téléchargements laissent ce dossier et tout son contenu tels quels',
    deleteTitle: 'Supprimer ce dossier de votre historique',
    downloadTitle: 'Télécharger ce dossier au format zip',
    couldNotDownload: (name, error) => `Impossible de télécharger « ${name} » : ${error}`,
    deleteConfirmTitle: (name) => `Supprimer « ${name} » ?`,
    deleteConfirmMessage: (fileCount) =>
      `Cela supprime le dossier, ${fileCount === 1 ? 'son fichier' : `ses ${fileCount} fichiers`} et toutes leurs ` +
      'versions enregistrées de votre historique. Tout ce qui est encore dans Moodle sera ajouté à nouveau comme ' +
      'nouveau au prochain téléchargement de ce cours.'
  },

  recentlyOpened: {
    title: 'Ouverts récemment',
    remove: 'Retirer des fichiers ouverts récemment',
    showAll: 'Afficher tous les fichiers récents'
  },

  recentSettings: {
    title: 'Ouverts récemment',
    appliesToAll: 'S’applique à tous les cours.',
    show: 'Afficher les fichiers ouverts récemment',
    noLimit: 'Aucune limite',
    maximum: 'Nombre maximal de fichiers ouverts récemment par cours'
  },

  downloadNames: {
    title: 'Noms de téléchargement',
    description:
      'S’applique à tous les cours. Les cours sans étiquette sont téléchargés sous le nom d’origine du fichier.',
    prefixCourseTag: 'Ajouter l’étiquette du cours au début des noms de téléchargement (par ex. ETIQUETTE_fichier.pdf)'
  },

  sideMargin: {
    title: 'Marges latérales',
    description:
      'Espace vide de chaque côté du contenu dans une fenêtre agrandie, en proportion de l’écran. Dans une fenêtre ' +
      'plus petite, le contenu garde cette largeur en réduisant d’abord les marges, puis en occupant toute la fenêtre.',
    label: (percent) => `${percent} % de chaque côté`
  },

  courseListStyle: {
    title: 'Style de la liste des cours',
    description: 'Comment les cours sont affichés sur cette page.',
    cards: 'Cartes',
    rows: 'Lignes'
  },

  courseColor: {
    title: (name) => `Couleur de « ${name} »`,
    palette: 'Palette',
    custom: 'Couleur personnalisée',
    automatic: 'Utiliser la couleur automatique'
  },

  setInstitution: {
    title: 'Définir l’établissement',
    description: 'Choisissez les cours auxquels donner cet établissement. Laissez-le vide pour le leur retirer.',
    courses: (count) => (count === 0 ? 'Cours' : `Cours (${count} sélectionnés)`),
    selectAll: 'Tout sélectionner',
    selectNone: 'Aucun',
    hidden: 'Masqué',
    apply: (count) => (count === 1 ? 'Appliquer à 1 cours' : `Appliquer à ${count} cours`),
    remove: (count) => (count === 1 ? 'Retirer de 1 cours' : `Retirer de ${count} cours`)
  },

  ignoredFiles: {
    title: 'Fichiers ignorés',
    description:
      'Les téléchargements laissent ces fichiers tels quels : pas de nouvelles versions, jamais marqués comme supprimés, et pas ajoutés s’ils ne sont pas encore suivis.',
    pathLabel: 'Chemin du fichier',
    placeholder: 'Dossier/fichier.pdf',
    hint:
      'Indiquez l’extension et les dossiers qui le contiennent : un fichier à la racine du cours, c’est juste son nom. Deux fichiers du même nom dans des dossiers différents sont des fichiers différents. Terminez un chemin par / pour ignorer tout un dossier avec son contenu.',
    add: 'Ajouter',
    folder: 'Dossier',
    remove: (path) => `Ne plus ignorer ${path}`,
    empty: 'Aucun fichier ignoré.',
    duplicate: 'Ce fichier est déjà dans la liste.',
    notFound: 'Pas encore dans ce cours',
    askDeleteTitle: (count, name) => (count === 1 ? `« ${name} » est maintenant ignoré` : `${count} fichiers sont maintenant ignorés`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'Les téléchargements le laisseront tel quel. Voulez-vous aussi le supprimer de ce cours, avec toutes ses versions enregistrées ? Tant qu’il est ignoré, les prochains téléchargements ne le rajouteront pas.'
        : 'Les téléchargements les laisseront tels quels. Voulez-vous aussi les supprimer de ce cours, avec toutes leurs versions enregistrées ? Tant qu’ils sont ignorés, les prochains téléchargements ne les rajouteront pas.',
    keep: (count) => (count === 1 ? 'Le garder' : 'Les garder')
  },

  upload: {
    titleOne: (name) => `Ajouter « ${name} »`,
    titleMany: (count) => `Ajouter ${count} fichiers`,
    where: (count) => `Où voulez-vous ${count === 1 ? 'l’' : 'les '}enregistrer ?`,
    courseRoot: 'Racine du cours',
    existingFolder: 'Dossier existant',
    newFolder: 'Nouveau dossier',
    folderNamePlaceholder: 'Nom du dossier',
    newFolderNameLabel: 'Nom du nouveau dossier',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' existe déjà dans ce dossier : le nouveau fichier sera ajouté comme nouvelle version.',
    add: 'Ajouter',
    adding: 'Ajout…'
  },

  versions: {
    whichVersion: 'Quelle version ?',
    downloadTitle: 'Télécharger cette version dans votre dossier Téléchargements',
    diffVsPrevious: 'Comparer à la précédente',
    comparing: (from, to) => `Comparaison v${from} → v${to}`,
    loadingDiff: 'Chargement des différences…',
    binaryChanged: 'Fichier binaire : le contenu a changé.',
    size: (from, to, delta) => `Taille : ${from} → ${to} (${delta})`,
    deleteTitle: 'Supprimer cette version',
    deleteConfirmTitle: (label) => `Supprimer ${label} ?`,
    deleteConfirmMessage:
      'Cette version sera définitivement retirée de l’historique du fichier. Les autres versions et le fichier sont conservés.'
  },

  openFile: {
    downloadInterrupted: 'Le téléchargement a été interrompu.',
    couldNotOpen: (filename, error) =>
      `« ${filename} » a été téléchargé, mais n’a pas pu être ouvert automatiquement (${error}).\n\n` +
      'Vous pouvez l’ouvrir depuis les téléchargements de Chrome (Ctrl+J / Cmd+Maj+J). ' +
      'Astuce : faites un clic droit sur un téléchargement et choisissez « Toujours ouvrir les fichiers de ce type » ' +
      'pour que cela se fasse automatiquement à l’avenir.'
  },

  backup: {
    courseNotFound: 'Cours introuvable.',
    invalid: (reason) => `Ce n’est pas une sauvegarde Moodle Archive valide (${reason}).`,
    notZip: 'ce n’est pas un fichier zip',
    missingManifest: 'data.json est manquant',
    invalidJson: 'data.json n’est pas un JSON valide',
    noCourses: 'data.json ne décrit aucun cours'
  },

  viewer: {
    notFoundTitle: 'Fichier introuvable',
    notFoundText: 'Ce fichier n’est plus dans votre historique Moodle Archive ; il a peut-être été supprimé.',
    cannotPreview: 'Ce type de fichier ne peut pas être prévisualisé dans le navigateur.',
    zoomOut: 'Zoom arrière',
    zoomIn: 'Zoom avant',
    fitVertically: 'Ajuster verticalement',
    fitHorizontally: 'Ajuster horizontalement'
  },

  popup: {
    cannotScan: 'Impossible d’analyser cette page : ouvrez d’abord un onglet de cours Moodle.',
    filesDownloaded: (count) => `${count} fichier(s) téléchargé(s)`,
    downloading: 'Téléchargement...',
    download: 'Télécharger',
    history: 'Historique',
    addToQueue: 'Ajouter à la file',
    queued: (position) => `En file (n° ${position})`,
    queueTitle: 'À suivre',
    removeFromQueue: 'Retirer de la file'
  },

  download: {
    unsupportedUrl: (url) => `URL non prise en charge : ${url}.`,
    processingLinks: 'Traitement des liens...',
    processing: (url) => `Traitement de ${url}`,
    downloadingFiles: 'Téléchargement des fichiers...',
    downloadingFile: (name) => `Téléchargement de ${name}`,
    cancelled: (name, reason) =>
      `Téléchargement annulé : impossible de télécharger « ${name} » (${reason}). Rien n’a été enregistré, réessayez.`,
    downloadFailed: 'échec du téléchargement',
    noResponse: 'Délai d’attente de la réponse dépassé',
    stalled: 'Bloqué : aucune donnée reçue à temps',
    noFileFound: 'Aucun fichier trouvé.',
    saving: 'Enregistrement dans l’historique...',
    savingChunk: (index, total) => `Enregistrement dans l’historique... (${index}/${total})`,
    saved: 'Enregistré dans l’historique.',
    saveFailed: (reason) => `Impossible d’enregistrer dans l’historique : ${reason}`,
    timedOut: 'délai d’attente de la réponse dépassé, réessayez',
    unknownError: 'erreur inconnue',
    interrupted: 'Téléchargement interrompu : l’onglet a été fermé ou a changé de page.',
    couldNotStart: (title) => `Impossible de démarrer « ${title} » : ouvrez son onglet et réessayez.`
  }
};
