import type { Messages } from './en';

/** Russian plural form: one (1, 21…), few (2–4, 22–24…) or many (everything else). */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const ru: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'автор: slvdr510',
    cancel: 'Отмена',
    save: 'Сохранить',
    close: 'Закрыть',
    delete: 'Удалить',
    export: 'Экспорт',
    download: 'Скачать',
    moreOptions: 'Другие действия',
    exporting: 'Экспорт…',
    importing: 'Импорт…',
    savedToDownloads: (name) => `«${name}» сохранён в папку «Загрузки».`,
    couldNotExport: (name, error) => `Не удалось экспортировать «${name}»: ${error}`
  },

  header: {
    theme: 'Тема',
    themeLight: 'Светлая',
    themeSystem: 'Как в системе',
    themeDark: 'Тёмная',
    language: 'Язык',
    languageAuto: 'Язык браузера'
  },

  relativeTime: {
    justNow: 'только что',
    minutes: (n) => `${n} мин назад`,
    hours: (n) => `${n} ч назад`,
    days: (n) => `${n} дн. назад`,
    weeks: (n) => `${n} нед. назад`,
    months: (n) => `${n} мес. назад`,
    years: (n) => `${n} ${plural(n, 'год', 'года', 'лет')} назад`
  },

  status: {
    new: 'Новый',
    modified: 'Изменён',
    deleted: 'Удалён',
    unchanged: 'Без изменений'
  },

  courses: {
    openAllUrls: 'Открыть ссылки на все курсы',
    exportAll: 'Экспортировать все курсы',
    importCourses: 'Импортировать курсы',
    recentSettings: 'Настройки недавно открытых',
    downloadNameSettings: 'Настройки имён файлов при скачивании',
    sideMargin: 'Боковые поля',
    hiddenCourses: 'Скрытые курсы',
    deleteAll: 'Удалить все курсы',
    backupSaved: 'Резервная копия сохранена в папку «Загрузки».',
    couldNotExportAll: (error) => `Не удалось экспортировать: ${error}`,
    noUrlsToOpen: 'Нет ссылок на курсы для открытия.',
    imported: (courses, files, versions) =>
      `Импортировано: курсов — ${courses}, файлов — ${files}, версий — ${versions}.`,
    notABackup: (name) => `«${name}» не является zip-архивом в формате курсов этого расширения.`,
    couldNotImport: (details) => `Не удалось импортировать ${details}`,
    dropBackups: 'Перетащите сюда резервные копии .zip, чтобы импортировать их курсы',
    exportAllTitle: 'Экспортировать все курсы?',
    exportAllMessage: 'Все отслеживаемые курсы, файлы и версии будут сохранены в один zip-архив в папке «Загрузки».',
    exportCourseTitle: (name) => `Экспортировать «${name}»?`,
    exportCourseMessage: 'Курс, его файлы и все версии будут сохранены в zip-архив в папке «Загрузки».',
    deleteAllTitle: 'Удалить все курсы?',
    deleteAllMessage:
      'Будут удалены все курсы, файлы и истории версий, которые отслеживает расширение. ' +
      'Скачайте курс заново, чтобы снова начать собирать его историю.',
    deleteCourseTitle: (name) => `Удалить «${name}»?`,
    deleteCourseMessage:
      'Курс будет удалён вместе с историей файлов и версий. Если позже вы снова скачаете этот курс, ' +
      'он просто будет создан заново.',
    emptyTitle: 'Курсов пока нет',
    emptySubtitle: 'Курс создаётся автоматически, когда вы скачиваете его в первый раз.',
    emptyStep1: 'Откройте курс в Moodle',
    emptyStep2: 'Нажмите на значок расширения',
    emptyStep3Before: 'Нажмите ',
    emptyStep3After: '',
    emptyHintBefore: 'Уже есть резервная копия? Перетащите её ',
    emptyHintAfter: ' в любое место этой страницы, чтобы импортировать.',
    allHidden: 'Все ваши курсы скрыты. Чтобы вернуть курс, выберите «Скрытые курсы» в меню ⋮.'
  },

  courseRow: {
    lastDownloaded: 'Последнее скачивание',
    openInMoodle: 'Открыть курс в Moodle',
    setTagName: 'Задать метку',
    hideCourse: 'Скрыть курс',
    deleteCourse: 'Удалить курс'
  },

  hiddenCourses: {
    title: 'Скрытые курсы',
    none: 'Скрытых курсов нет.',
    unhide: 'Показать'
  },

  courseFiles: {
    backToCourses: 'Назад к курсам',
    addFile: 'Добавить файл…',
    couldNotRead: (fileCount, firstName, error) =>
      `Не удалось прочитать ${fileCount === 1 ? `«${firstName}»` : 'перетащенные файлы'}: возможно, файл перемещён ` +
      `или удалён либо ещё скачивается. Попробуйте снова из постоянного расположения. (${error})`,
    couldNotAdd: (fileCount, error) =>
      `Не удалось добавить ${fileCount === 1 ? 'файл' : 'файлы'}: ${error}`,
    dropFiles: (name) => `Перетащите файлы, чтобы добавить их в «${name}»`,
    searchPlaceholder: 'Поиск файлов по имени…',
    noMatches: (query) => `Нет файлов, соответствующих «${query}».`,
    noFiles: 'Для этого курса ещё не скачано ни одного файла.'
  },

  fileRow: {
    viewHistory: 'Показать историю версий',
    lastSaved: (date) => `Последнее сохранение: ${date}`,
    manual: 'Вручную',
    manualTitle: 'Добавлен вручную, а не скачан из Moodle',
    deleteTitle: 'Удалить этот файл из истории',
    downloadTitle: 'Скачать в папку «Загрузки»',
    deleteConfirmTitle: (name) => `Удалить «${name}»?`,
    deleteConfirmMessage:
      'Файл и все его сохранённые версии будут удалены из истории. Если он всё ещё есть в Moodle, ' +
      'при следующем скачивании курса он снова будет добавлен как новый файл.'
  },

  folderRow: {
    deleteTitle: 'Удалить эту папку из истории',
    downloadTitle: 'Скачать эту папку в виде zip-архива',
    couldNotDownload: (name, error) => `Не удалось скачать «${name}»: ${error}`,
    deleteConfirmTitle: (name) => `Удалить «${name}»?`,
    deleteConfirmMessage: (fileCount) =>
      `Папка, ${fileCount} ${plural(fileCount, 'файл', 'файла', 'файлов')} в ней и все их сохранённые версии будут ` +
      'удалены из истории. Всё, что ещё есть в Moodle, будет снова добавлено как новое при следующем скачивании курса.'
  },

  recentlyOpened: {
    title: 'Недавно открытые',
    remove: 'Убрать из недавно открытых'
  },

  recentSettings: {
    title: 'Недавно открытые',
    appliesToAll: 'Применяется ко всем курсам.',
    show: 'Показывать недавно открытые файлы',
    noLimit: 'Без ограничений',
    maximum: 'Максимум недавно открытых файлов на курс'
  },

  downloadNames: {
    title: 'Имена при скачивании',
    description: 'Применяется ко всем курсам. Файлы курсов без метки скачиваются под собственным именем.',
    prefixCourseTag: 'Добавлять метку курса в начало имени скачиваемого файла (например, МЕТКА_файл.pdf)'
  },

  sideMargin: {
    title: 'Боковые поля',
    description:
      'Пустое пространство с каждой стороны содержимого в развёрнутом окне, в долях от ширины экрана. В окне ' +
      'поменьше содержимое сохраняет эту ширину: сначала за счёт полей, а затем занимает всё окно.',
    label: (percent) => `${percent}% с каждой стороны`
  },

  upload: {
    titleOne: (name) => `Добавить «${name}»`,
    titleMany: (count) => `Добавить файлы (${count})`,
    where: (count) => `Куда ${count === 1 ? 'его' : 'их'} сохранить?`,
    courseRoot: 'Корень курса',
    existingFolder: 'Существующая папка',
    newFolder: 'Новая папка',
    folderNamePlaceholder: 'Имя папки',
    newFolderNameLabel: 'Имя новой папки',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' уже есть в этой папке — новый файл будет добавлен как его новая версия.',
    add: 'Добавить',
    adding: 'Добавление…'
  },

  versions: {
    whichVersion: 'Какая версия?',
    downloadTitle: 'Скачать эту версию в папку «Загрузки»',
    diffVsPrevious: 'Сравнить с предыдущей',
    comparing: (from, to) => `Сравнение v${from} → v${to}`,
    loadingDiff: 'Загрузка различий…',
    binaryChanged: 'Двоичный файл — содержимое изменилось.',
    size: (from, to, delta) => `Размер: ${from} → ${to} (${delta})`,
    deleteTitle: 'Удалить эту версию',
    deleteConfirmTitle: (label) => `Удалить ${label}?`,
    deleteConfirmMessage:
      'Эта версия будет безвозвратно удалена из истории файла. Остальные версии и сам файл сохранятся.'
  },

  openFile: {
    downloadInterrupted: 'Скачивание прервано.',
    couldNotOpen: (filename, error) =>
      `Файл «${filename}» скачан, но открыть его автоматически не удалось (${error}).\n\n` +
      'Его можно открыть из списка загрузок Chrome (Ctrl+J / Cmd+Shift+J). ' +
      'Совет: щёлкните там по загрузке правой кнопкой и выберите «Всегда открывать файлы этого типа», ' +
      'чтобы дальше это происходило автоматически.'
  },

  backup: {
    courseNotFound: 'Курс не найден.',
    invalid: (reason) => `Это не резервная копия Moodle Archive (${reason}).`,
    notZip: 'это не zip-файл',
    missingManifest: 'отсутствует data.json',
    invalidJson: 'data.json не является корректным JSON',
    noCourses: 'data.json не описывает курсы'
  },

  viewer: {
    notFoundTitle: 'Файл не найден',
    notFoundText: 'Этого файла больше нет в истории Moodle Archive — возможно, он был удалён.',
    cannotPreview: 'Файлы этого типа нельзя просмотреть в браузере.'
  },

  popup: {
    cannotScan: 'Эту страницу нельзя просканировать — сначала откройте вкладку с курсом Moodle.',
    filesDownloaded: (count) => `Скачано ${plural(count, 'файл', 'файла', 'файлов')}: ${count}`,
    downloading: 'Скачивание...',
    download: 'Скачать',
    history: 'История',
    addToQueue: 'Добавить в очередь',
    queued: (position) => `В очереди (№ ${position})`,
    queueTitle: 'Далее',
    removeFromQueue: 'Убрать из очереди'
  },

  download: {
    unsupportedUrl: (url) => `Неподдерживаемый URL: ${url}.`,
    processingLinks: 'Обработка ссылок...',
    processing: (url) => `Обработка ${url}`,
    downloadingFiles: 'Скачивание файлов...',
    downloadingFile: (name) => `Скачивание ${name}`,
    cancelled: (name, reason) =>
      `Скачивание отменено: не удалось скачать «${name}» (${reason}). Ничего не сохранено — попробуйте снова.`,
    downloadFailed: 'ошибка скачивания',
    noResponse: 'Истекло время ожидания ответа',
    stalled: 'Зависло: данные не получены вовремя',
    noFileFound: 'Файлы не найдены.',
    saving: 'Сохранение в историю...',
    savingChunk: (index, total) => `Сохранение в историю... (${index}/${total})`,
    saved: 'Сохранено в историю.',
    saveFailed: (reason) => `Не удалось сохранить в историю: ${reason}`,
    timedOut: 'истекло время ожидания ответа — попробуйте ещё раз',
    unknownError: 'неизвестная ошибка',
    interrupted: 'Скачивание прервано: вкладку закрыли или перешли на другую страницу.',
    couldNotStart: (title) => `Не удалось начать «${title}» — откройте его вкладку и попробуйте снова.`
  }
};
