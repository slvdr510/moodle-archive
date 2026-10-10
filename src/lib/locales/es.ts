import type { Messages } from './en';

export const es: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'por slvdr510',
    cancel: 'Cancelar',
    save: 'Guardar',
    close: 'Cerrar',
    delete: 'Eliminar',
    export: 'Exportar',
    download: 'Descargar',
    moreOptions: 'Más opciones',
    exporting: 'Exportando…',
    importing: 'Importando…',
    savedToDownloads: (name) => `"${name}" se ha guardado en tu carpeta de Descargas.`,
    couldNotExport: (name, error) => `No se pudo exportar "${name}": ${error}`
  },

  header: {
    theme: 'Tema',
    themeLight: 'Claro',
    themeSystem: 'Igual que el sistema',
    themeDark: 'Oscuro',
    language: 'Idioma',
    languageAuto: 'Idioma del navegador'
  },

  relativeTime: {
    justNow: 'ahora mismo',
    minutes: (n) => `hace ${n} min`,
    hours: (n) => `hace ${n} h`,
    days: (n) => `hace ${n} d`,
    weeks: (n) => `hace ${n} sem`,
    months: (n) => `hace ${n} mes${n === 1 ? '' : 'es'}`,
    years: (n) => `hace ${n} año${n === 1 ? '' : 's'}`
  },

  status: {
    new: 'Nuevo',
    modified: 'Modificado',
    deleted: 'Eliminado',
    unchanged: 'Sin cambios'
  },

  courses: {
    openAllUrls: 'Abrir todas las URL de los cursos',
    exportAll: 'Exportar todos los cursos',
    importCourses: 'Importar curso(s)',
    recentSettings: 'Ajustes de abiertos recientemente',
    downloadNameSettings: 'Ajustes de nombres de descarga',
    sideMargin: 'Márgenes laterales',
    courseListStyle: 'Estilo de la lista de cursos',
    setInstitution: 'Poner institución a varios cursos',
    hiddenCourses: 'Cursos ocultos',
    deleteAll: 'Eliminar todos los cursos',
    backupSaved: 'Copia de seguridad guardada en tu carpeta de Descargas.',
    couldNotExportAll: (error) => `No se pudo exportar: ${error}`,
    noUrlsToOpen: 'No hay URL de cursos para abrir.',
    imported: (courses, files, versions) =>
      `Importados ${courses} curso(s), ${files} archivo(s) y ${versions} versión(es).`,
    notABackup: (name) => `"${name}" no es un zip con el formato de cursos que usa esta extensión.`,
    couldNotImport: (details) => `No se pudo importar ${details}`,
    dropBackups: 'Suelta copias de seguridad .zip para importar sus cursos',
    exportAllTitle: '¿Exportar todos los cursos?',
    exportAllMessage: 'Todos los cursos, archivos y versiones guardados se exportarán en un único zip en tu carpeta de Descargas.',
    exportCourseTitle: (name) => `¿Exportar "${name}"?`,
    exportCourseMessage: 'El curso, sus archivos y todas sus versiones se guardarán en un zip en tu carpeta de Descargas.',
    deleteAllTitle: '¿Eliminar todos los cursos?',
    deleteAllMessage:
      'Esto borra todos los cursos, archivos e historial de versiones que guarda la extensión. ' +
      'Vuelve a descargar un curso después para empezar a reconstruir su historial.',
    deleteCourseTitle: (name) => `¿Eliminar "${name}"?`,
    deleteCourseMessage:
      'Esto elimina el curso y su historial de archivos y versiones. Si vuelves a descargar este curso ' +
      'más adelante, se creará de nuevo desde cero.',
    emptyTitle: 'Aún no hay cursos',
    emptySubtitle: 'Los cursos se crean automáticamente la primera vez que descargas uno.',
    emptyStep1: 'Abre un curso en Moodle',
    emptyStep2: 'Haz clic en el icono de la extensión',
    emptyStep3Before: 'Pulsa ',
    emptyStep3After: '',
    emptyHintBefore: '¿Ya tienes una copia de seguridad? Suelta su ',
    emptyHintAfter: ' en cualquier parte de esta página para importarla.',
    allHidden: 'Todos tus cursos están ocultos. Usa "Cursos ocultos" en el menú ⋮ para recuperar alguno.'
  },

  courseRow: {
    lastDownloaded: 'Última descarga',
    openInMoodle: 'Abrir el curso en Moodle',
    setTagName: 'Poner etiqueta (siglas)',
    setFullName: 'Poner nombre completo',
    tagPlaceholder: 'Siglas, p. ej. SO',
    fullNamePlaceholder: 'Nombre completo (vacío: el de Moodle)',
    setInstitution: 'Poner institución (siglas)',
    institutionPlaceholder: 'Siglas de la institución, p. ej. UHU',
    institution: 'Institución',
    changeColor: 'Cambiar color',
    hideCourse: 'Ocultar curso',
    deleteCourse: 'Eliminar curso'
  },

  hiddenCourses: {
    title: 'Cursos ocultos',
    none: 'No hay cursos ocultos.',
    unhide: 'Mostrar'
  },

  courseFiles: {
    backToCourses: 'Volver a los cursos',
    addFile: 'Añadir archivo…',
    ignoredFiles: 'Archivos ignorados',
    couldNotRead: (fileCount, firstName, error) =>
      `No se pudo leer ${fileCount === 1 ? `"${firstName}"` : 'los archivos soltados'}: puede que se haya movido o ` +
      `eliminado, o que aún se esté descargando. Inténtalo de nuevo desde una ubicación estable. (${error})`,
    couldNotAdd: (fileCount, error) =>
      fileCount === 1 ? `No se pudo añadir el archivo: ${error}` : `No se pudieron añadir los archivos: ${error}`,
    dropFiles: (name) => `Suelta archivos para añadirlos a "${name}"`,
    searchPlaceholder: 'Buscar archivos por nombre…',
    noMatches: (query) => `Ningún archivo coincide con "${query}".`,
    noFiles: 'Aún no se ha descargado ningún archivo de este curso.'
  },

  fileRow: {
    viewHistory: 'Ver historial de versiones',
    lastSaved: (date) => `Guardado por última vez: ${date}`,
    manual: 'Manual',
    manualTitle: 'Añadido a mano, no descargado de Moodle',
    ignored: 'Ignorado',
    ignoredTitle: 'Las descargas dejan este archivo tal como está',
    ignoreTitle: 'Ignorar los cambios de este archivo',
    unignoreTitle: 'Dejar de ignorar este archivo',
    ignoredWithFolderTitle: 'Ignorado junto con su carpeta',
    deleteTitle: 'Eliminar este archivo de tu historial',
    downloadTitle: 'Descargar en tu carpeta de Descargas',
    deleteConfirmTitle: (name) => `¿Eliminar "${name}"?`,
    deleteConfirmMessage:
      'Esto elimina el archivo y todas sus versiones guardadas de tu historial. Si sigue en Moodle, ' +
      'la próxima descarga de este curso lo volverá a añadir como archivo nuevo.'
  },

  folderRow: {
    ignoreTitle: 'Ignorar esta carpeta y todo su contenido',
    unignoreTitle: 'Dejar de ignorar esta carpeta',
    ignoredTitle: 'Las descargas dejan esta carpeta y todo su contenido tal como están',
    deleteTitle: 'Eliminar esta carpeta de tu historial',
    downloadTitle: 'Descargar esta carpeta como zip',
    couldNotDownload: (name, error) => `No se pudo descargar "${name}": ${error}`,
    deleteConfirmTitle: (name) => `¿Eliminar "${name}"?`,
    deleteConfirmMessage: (fileCount) =>
      `Esto elimina la carpeta, ${fileCount === 1 ? 'su archivo' : `sus ${fileCount} archivos`} y todas sus versiones guardadas ` +
      'de tu historial. Lo que siga en Moodle se volverá a añadir como nuevo la próxima vez que descargues este curso.'
  },

  recentlyOpened: {
    title: 'Abiertos recientemente',
    remove: 'Quitar de abiertos recientemente',
    showAll: 'Ver todos los abiertos recientemente'
  },

  recentSettings: {
    title: 'Abiertos recientemente',
    appliesToAll: 'Se aplica a todos los cursos.',
    show: 'Mostrar archivos abiertos recientemente',
    noLimit: 'Sin límite',
    maximum: 'Máximo de archivos abiertos recientemente por curso'
  },

  downloadNames: {
    title: 'Nombres de descarga',
    description: 'Se aplica a todos los cursos. Los cursos sin etiqueta se descargan con el nombre original del archivo.',
    prefixCourseTag: 'Añadir la etiqueta del curso al principio del nombre de descarga (p. ej. ETIQUETA_archivo.pdf)'
  },

  sideMargin: {
    title: 'Márgenes laterales',
    description:
      'Espacio vacío a cada lado del contenido con la ventana maximizada, como parte del ancho de la pantalla. ' +
      'En una ventana más pequeña el contenido mantiene ese ancho: primero se reducen los márgenes y después ' +
      'ocupa toda la ventana.',
    label: (percent) => `${percent}% a cada lado`
  },

  courseListStyle: {
    title: 'Estilo de la lista de cursos',
    description: 'Cómo se muestran los cursos en esta página.',
    cards: 'Tarjetas',
    rows: 'Filas'
  },

  courseColor: {
    title: (name) => `Color de "${name}"`,
    palette: 'Paleta',
    custom: 'Color personalizado',
    automatic: 'Usar color automático'
  },

  setInstitution: {
    title: 'Poner institución',
    description: 'Elige los cursos a los que darle esta institución. Déjala vacía para quitársela.',
    courses: (count) => (count === 0 ? 'Cursos' : `Cursos (${count} seleccionados)`),
    selectAll: 'Seleccionar todos',
    selectNone: 'Ninguno',
    hidden: 'Oculto',
    apply: (count) => (count === 1 ? 'Aplicar a 1 curso' : `Aplicar a ${count} cursos`),
    remove: (count) => (count === 1 ? 'Quitar de 1 curso' : `Quitar de ${count} cursos`)
  },

  ignoredFiles: {
    title: 'Archivos ignorados',
    description:
      'Las descargas dejan estos archivos tal como están: sin versiones nuevas, nunca marcados como eliminados y sin añadirlos si aún no se siguen.',
    pathLabel: 'Ruta del archivo',
    placeholder: 'Carpeta/archivo.pdf',
    hint:
      'Incluye la extensión y las carpetas donde está: un archivo en la raíz del curso es solo su nombre. Archivos con el mismo nombre en carpetas distintas son archivos distintos. Termina la ruta en / para ignorar una carpeta entera con todo su contenido.',
    add: 'Añadir',
    folder: 'Carpeta',
    remove: (path) => `Dejar de ignorar ${path}`,
    empty: 'No hay archivos ignorados.',
    duplicate: 'Ese archivo ya está en la lista.',
    notFound: 'Aún no está en este curso',
    askDeleteTitle: (count, name) => (count === 1 ? `"${name}" ahora está ignorado` : `${count} archivos ahora están ignorados`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'Las descargas lo dejarán tal como está. ¿Quieres también eliminarlo de este curso, con todas sus versiones guardadas? Mientras esté ignorado, las próximas descargas no lo volverán a añadir.'
        : 'Las descargas los dejarán tal como están. ¿Quieres también eliminarlos de este curso, con todas sus versiones guardadas? Mientras estén ignorados, las próximas descargas no los volverán a añadir.',
    keep: (count) => (count === 1 ? 'Conservarlo' : 'Conservarlos')
  },

  upload: {
    titleOne: (name) => `Añadir "${name}"`,
    titleMany: (count) => `Añadir ${count} archivos`,
    where: (count) => `¿Dónde quieres guardar${count === 1 ? 'lo' : 'los'}?`,
    courseRoot: 'Raíz del curso',
    existingFolder: 'Carpeta existente',
    newFolder: 'Carpeta nueva',
    folderNamePlaceholder: 'Nombre de la carpeta',
    newFolderNameLabel: 'Nombre de la carpeta nueva',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' ya existe en esta carpeta: el archivo nuevo se añadirá como una nueva versión.',
    add: 'Añadir',
    adding: 'Añadiendo…'
  },

  versions: {
    whichVersion: '¿Qué versión?',
    downloadTitle: 'Descargar esta versión en tu carpeta de Descargas',
    diffVsPrevious: 'Comparar con la anterior',
    comparing: (from, to) => `Comparando v${from} → v${to}`,
    loadingDiff: 'Cargando diferencias…',
    binaryChanged: 'Archivo binario: el contenido ha cambiado.',
    size: (from, to, delta) => `Tamaño: ${from} → ${to} (${delta})`,
    deleteTitle: 'Eliminar esta versión',
    deleteConfirmTitle: (label) => `¿Eliminar ${label}?`,
    deleteConfirmMessage:
      'Esta versión se borrará del historial del archivo para siempre. Las demás versiones y el archivo se conservan.'
  },

  openFile: {
    downloadInterrupted: 'La descarga se ha interrumpido.',
    couldNotOpen: (filename, error) =>
      `Se ha descargado "${filename}", pero no se pudo abrir automáticamente (${error}).\n\n` +
      'Puedes abrirlo desde las descargas de Chrome (Ctrl+J / Cmd+Shift+J). ' +
      'Consejo: haz clic derecho en una descarga y elige "Abrir siempre archivos de este tipo" para que ' +
      'a partir de ahora se abran automáticamente.'
  },

  backup: {
    courseNotFound: 'No se encontró el curso.',
    invalid: (reason) => `No es una copia de seguridad válida de Moodle Archive (${reason}).`,
    notZip: 'no es un archivo zip',
    missingManifest: 'falta data.json',
    invalidJson: 'data.json no es un JSON válido',
    noCourses: 'data.json no describe cursos'
  },

  viewer: {
    notFoundTitle: 'Archivo no encontrado',
    notFoundText: 'Este archivo ya no está en tu historial de Moodle Archive; puede que se haya eliminado.',
    cannotPreview: 'Este tipo de archivo no se puede previsualizar en el navegador.',
    zoomOut: 'Alejar',
    zoomIn: 'Acercar',
    fitVertically: 'Ajustar verticalmente',
    fitHorizontally: 'Ajustar horizontalmente'
  },

  popup: {
    cannotScan: 'Esta página no se puede analizar: abre primero una pestaña con un curso de Moodle.',
    filesDownloaded: (count) => `${count} archivo(s) descargado(s)`,
    downloading: 'Descargando...',
    download: 'Descargar',
    history: 'Historial',
    addToQueue: 'Añadir a la cola',
    queued: (position) => `En cola (n.º ${position})`,
    queueTitle: 'A continuación',
    removeFromQueue: 'Quitar de la cola'
  },

  download: {
    unsupportedUrl: (url) => `URL no compatible: ${url}.`,
    processingLinks: 'Procesando enlaces...',
    processing: (url) => `Procesando ${url}`,
    downloadingFiles: 'Descargando archivos...',
    downloadingFile: (name) => `Descargando ${name}`,
    cancelled: (name, reason) =>
      `Descarga cancelada: no se pudo descargar "${name}" (${reason}). No se ha guardado nada; inténtalo de nuevo.`,
    downloadFailed: 'la descarga falló',
    noResponse: 'Se agotó el tiempo de espera de la respuesta',
    stalled: 'Detenida: no se recibieron datos a tiempo',
    noFileFound: 'No se encontró ningún archivo.',
    saving: 'Guardando en el historial...',
    savingChunk: (index, total) => `Guardando en el historial... (${index}/${total})`,
    saved: 'Guardado en el historial.',
    saveFailed: (reason) => `No se pudo guardar en el historial: ${reason}`,
    timedOut: 'se agotó el tiempo de espera de la respuesta; inténtalo de nuevo',
    unknownError: 'error desconocido',
    interrupted: 'Descarga interrumpida: la pestaña se cerró o cambió de página.',
    couldNotStart: (title) => `No se pudo empezar «${title}»: abre su pestaña y vuelve a intentarlo.`
  }
};
