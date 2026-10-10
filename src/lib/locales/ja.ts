import type { Messages } from './en';

export const ja: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: '作者: slvdr510',
    cancel: 'キャンセル',
    save: '保存',
    close: '閉じる',
    delete: '削除',
    export: 'エクスポート',
    download: 'ダウンロード',
    moreOptions: 'その他のオプション',
    exporting: 'エクスポート中…',
    importing: 'インポート中…',
    savedToDownloads: (name) => `「${name}」をダウンロード フォルダに保存しました。`,
    couldNotExport: (name, error) => `「${name}」をエクスポートできませんでした: ${error}`
  },

  header: {
    theme: 'テーマ',
    themeLight: 'ライト',
    themeSystem: 'システムに合わせる',
    themeDark: 'ダーク',
    language: '言語',
    languageAuto: 'ブラウザの言語'
  },

  relativeTime: {
    justNow: 'たった今',
    minutes: (n) => `${n} 分前`,
    hours: (n) => `${n} 時間前`,
    days: (n) => `${n} 日前`,
    weeks: (n) => `${n} 週間前`,
    months: (n) => `${n} か月前`,
    years: (n) => `${n} 年前`
  },

  status: {
    new: '新規',
    modified: '変更',
    deleted: '削除済み',
    unchanged: '変更なし'
  },

  courses: {
    openAllUrls: 'すべてのコースの URL を開く',
    exportAll: 'すべてのコースをエクスポート',
    importCourses: 'コースをインポート',
    recentSettings: '最近開いたファイルの設定',
    downloadNameSettings: 'ダウンロード名の設定',
    sideMargin: '左右の余白',
    courseListStyle: 'コース一覧の表示形式',
    setInstitution: 'コースに機関を設定',
    hiddenCourses: '非表示のコース',
    deleteAll: 'すべてのコースを削除',
    backupSaved: 'バックアップをダウンロード フォルダに保存しました。',
    couldNotExportAll: (error) => `エクスポートできませんでした: ${error}`,
    noUrlsToOpen: '開くコースの URL がありません。',
    imported: (courses, files, versions) =>
      `${courses} 件のコース、${files} 件のファイル、${versions} 件のバージョンをインポートしました。`,
    notABackup: (name) => `「${name}」はこの拡張機能のコース形式の zip ファイルではありません。`,
    couldNotImport: (details) => `インポートできませんでした: ${details}`,
    dropBackups: '.zip バックアップをドロップしてコースをインポート',
    exportAllTitle: 'すべてのコースをエクスポートしますか？',
    exportAllMessage: '追跡中のすべてのコース、ファイル、バージョンを 1 つの zip にまとめてダウンロード フォルダに保存します。',
    exportCourseTitle: (name) => `「${name}」をエクスポートしますか？`,
    exportCourseMessage: 'コース、そのファイル、すべてのバージョンを zip にまとめてダウンロード フォルダに保存します。',
    deleteAllTitle: 'すべてのコースを削除しますか？',
    deleteAllMessage:
      '拡張機能が追跡しているすべてのコース、ファイル、バージョン履歴が消去されます。' +
      'その後もう一度コースをダウンロードすると、履歴の記録が再開されます。',
    deleteCourseTitle: (name) => `「${name}」を削除しますか？`,
    deleteCourseMessage:
      'コースとそのファイル・バージョン履歴が削除されます。後でこのコースをもう一度ダウンロードすると、' +
      '最初から作り直されます。',
    emptyTitle: 'まだコースがありません',
    emptySubtitle: 'コースは初めてダウンロードしたときに自動で作成されます。',
    emptyStep1: 'Moodle でコースを開く',
    emptyStep2: '拡張機能のアイコンをクリック',
    emptyStep3Before: '',
    emptyStep3After: ' を押す',
    emptyHintBefore: 'バックアップをお持ちですか？その ',
    emptyHintAfter: ' をこのページのどこかにドロップするとインポートできます。',
    allHidden: 'すべてのコースが非表示になっています。⋮ メニューの「非表示のコース」から再表示できます。'
  },

  courseRow: {
    lastDownloaded: '最終ダウンロード',
    openInMoodle: 'Moodle でコースを開く',
    setTagName: 'タグ（略称）を設定',
    setFullName: '正式名称を設定',
    tagPlaceholder: '略称（例：OS）',
    fullNamePlaceholder: '正式名称（空欄で Moodle の名前）',
    setInstitution: '機関（略称）を設定',
    institutionPlaceholder: '機関の略称（例：UHU）',
    institution: '機関',
    changeColor: '色を変更',
    hideCourse: 'コースを非表示',
    deleteCourse: 'コースを削除'
  },

  hiddenCourses: {
    title: '非表示のコース',
    none: '非表示のコースはありません。',
    unhide: '再表示'
  },

  courseFiles: {
    backToCourses: 'コース一覧に戻る',
    addFile: 'ファイルを追加…',
    ignoredFiles: '無視するファイル',
    couldNotRead: (fileCount, firstName, error) =>
      `${fileCount === 1 ? `「${firstName}」` : 'ドロップしたファイル'}を読み込めませんでした。ファイルが移動または` +
      `削除されたか、まだダウンロード中の可能性があります。安定した場所からもう一度お試しください。(${error})`,
    couldNotAdd: (_fileCount, error) => `ファイルを追加できませんでした: ${error}`,
    dropFiles: (name) => `ファイルをドロップして「${name}」に追加`,
    searchPlaceholder: 'ファイル名で検索…',
    noMatches: (query) => `「${query}」に一致するファイルはありません。`,
    noFiles: 'このコースのファイルはまだダウンロードされていません。'
  },

  fileRow: {
    viewHistory: 'バージョン履歴を表示',
    lastSaved: (date) => `最終保存: ${date}`,
    manual: '手動',
    manualTitle: 'Moodle からではなく手動で追加',
    ignored: '無視中',
    ignoredTitle: 'ダウンロードではこのファイルを変更しません',
    ignoreTitle: 'このファイルの変更を無視',
    unignoreTitle: 'このファイルの無視をやめる',
    ignoredWithFolderTitle: 'フォルダごと無視中',
    deleteTitle: 'このファイルを履歴から削除',
    downloadTitle: 'ダウンロード フォルダにダウンロード',
    deleteConfirmTitle: (name) => `「${name}」を削除しますか？`,
    deleteConfirmMessage:
      'ファイルと保存済みのすべてのバージョンが履歴から削除されます。Moodle にまだある場合は、' +
      '次にこのコースをダウンロードしたときに新しいファイルとして再び追加されます。'
  },

  folderRow: {
    ignoreTitle: 'このフォルダと中身をすべて無視',
    unignoreTitle: 'このフォルダの無視をやめる',
    ignoredTitle: 'ダウンロードではこのフォルダと中身をすべて変更しません',
    deleteTitle: 'このフォルダを履歴から削除',
    downloadTitle: 'このフォルダを zip でダウンロード',
    couldNotDownload: (name, error) => `「${name}」をダウンロードできませんでした: ${error}`,
    deleteConfirmTitle: (name) => `「${name}」を削除しますか？`,
    deleteConfirmMessage: (fileCount) =>
      `フォルダ、その中の ${fileCount} 件のファイル、保存済みのすべてのバージョンが履歴から削除されます。` +
      'Moodle にまだあるものは、次にこのコースをダウンロードしたときに新規として再び追加されます。'
  },

  recentlyOpened: {
    title: '最近開いたファイル',
    remove: '最近開いたファイルから削除',
    showAll: '最近開いたものをすべて表示'
  },

  recentSettings: {
    title: '最近開いたファイル',
    appliesToAll: 'すべてのコースに適用されます。',
    show: '最近開いたファイルを表示',
    noLimit: '制限なし',
    maximum: 'コースごとの最近開いたファイルの最大数'
  },

  downloadNames: {
    title: 'ダウンロード名',
    description: 'すべてのコースに適用されます。タグのないコースはファイル本来の名前でダウンロードされます。',
    prefixCourseTag: 'ダウンロード名の先頭にコースのタグを付ける（例: TAG_file.pdf）'
  },

  sideMargin: {
    title: '左右の余白',
    description:
      'ウィンドウを最大化したときのコンテンツ左右の空白（画面幅に対する割合）。小さいウィンドウでは、' +
      'コンテンツはその幅を保ち、まず余白を使い、その後ウィンドウ全体に広がります。',
    label: (percent) => `左右それぞれ ${percent}%`
  },

  courseListStyle: {
    title: 'コース一覧の表示形式',
    description: 'このページでのコースの表示方法。',
    cards: 'カード',
    rows: '行'
  },

  courseColor: {
    title: (name) => `「${name}」の色`,
    palette: 'パレット',
    custom: 'カスタムカラー',
    automatic: '自動の色を使う'
  },

  setInstitution: {
    title: '機関を設定',
    description: 'この機関を設定するコースを選んでください。空欄にすると機関を外します。',
    courses: (count) => (count === 0 ? 'コース' : `コース（${count} 件選択）`),
    selectAll: 'すべて選択',
    selectNone: '選択解除',
    hidden: '非表示',
    apply: (count) => (count === 1 ? '1 件のコースに適用' : `${count} 件のコースに適用`),
    remove: (count) => (count === 1 ? '1 件のコースから外す' : `${count} 件のコースから外す`)
  },

  ignoredFiles: {
    title: '無視するファイル',
    description:
      'ダウンロードではこれらのファイルを変更しません。新しいバージョンは保存されず、削除済みにもならず、まだ追跡していない場合は追加もされません。',
    pathLabel: 'ファイルのパス',
    placeholder: 'フォルダ/ファイル.pdf',
    hint:
      '拡張子と、ファイルがあるフォルダも含めてください。コースのルートにあるファイルは名前だけです。別のフォルダにある同じ名前のファイルは別のファイルです。 フォルダ全体と中身をすべて無視するには、パスの最後を / にしてください。',
    add: '追加',
    folder: 'フォルダ',
    remove: (path) => `${path} の無視をやめる`,
    empty: '無視しているファイルはありません。',
    duplicate: 'そのファイルはすでにリストにあります。',
    notFound: 'このコースにはまだありません',
    askDeleteTitle: (count, name) => (count === 1 ? `「${name}」を無視するようになりました` : `${count} 個のファイルを無視するようになりました`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'ダウンロードではこのファイルを変更しません。保存済みのすべてのバージョンと一緒に、このコースから削除もしますか？無視している間は、今後のダウンロードで再び追加されることはありません。'
        : 'ダウンロードではこれらのファイルを変更しません。保存済みのすべてのバージョンと一緒に、このコースから削除もしますか？無視している間は、今後のダウンロードで再び追加されることはありません。',
    keep: (count) => (count === 1 ? '残す' : '残す')
  },

  upload: {
    titleOne: (name) => `「${name}」を追加`,
    titleMany: (count) => `${count} 件のファイルを追加`,
    where: () => 'どこに保存しますか？',
    courseRoot: 'コースのルート',
    existingFolder: '既存のフォルダ',
    newFolder: '新しいフォルダ',
    folderNamePlaceholder: 'フォルダ名',
    newFolderNameLabel: '新しいフォルダの名前',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' はこのフォルダにすでにあります。新しいファイルはその新しいバージョンとして追加されます。',
    add: '追加',
    adding: '追加中…'
  },

  versions: {
    whichVersion: 'どのバージョンですか？',
    downloadTitle: 'このバージョンをダウンロード フォルダにダウンロード',
    diffVsPrevious: '前のバージョンと比較',
    comparing: (from, to) => `v${from} → v${to} を比較中`,
    loadingDiff: '差分を読み込み中…',
    binaryChanged: 'バイナリ ファイル — 内容が変更されました。',
    size: (from, to, delta) => `サイズ: ${from} → ${to}（${delta}）`,
    deleteTitle: 'このバージョンを削除',
    deleteConfirmTitle: (label) => `${label} を削除しますか？`,
    deleteConfirmMessage:
      'このバージョンはファイルの履歴から完全に削除されます。ほかのバージョンとファイル自体は残ります。'
  },

  openFile: {
    downloadInterrupted: 'ダウンロードが中断されました。',
    couldNotOpen: (filename, error) =>
      `「${filename}」をダウンロードしましたが、自動で開けませんでした（${error}）。\n\n` +
      'Chrome のダウンロード（Ctrl+J / Cmd+Shift+J）から開けます。' +
      'ヒント: そこでダウンロードを右クリックして「この種類のファイルは常に開く」を選ぶと、今後は自動で開きます。'
  },

  backup: {
    courseNotFound: 'コースが見つかりません。',
    invalid: (reason) => `有効な Moodle Archive のバックアップではありません（${reason}）。`,
    notZip: 'zip ファイルではありません',
    missingManifest: 'data.json がありません',
    invalidJson: 'data.json が有効な JSON ではありません',
    noCourses: 'data.json にコースの情報がありません'
  },

  viewer: {
    notFoundTitle: 'ファイルが見つかりません',
    notFoundText: 'このファイルは Moodle Archive の履歴にもうありません。削除された可能性があります。',
    cannotPreview: 'この種類のファイルはブラウザでプレビューできません。',
    zoomOut: '縮小',
    zoomIn: '拡大',
    fitVertically: '縦に合わせる',
    fitHorizontally: '横に合わせる'
  },

  popup: {
    cannotScan: 'このページはスキャンできません。先に Moodle のコースのタブを開いてください。',
    filesDownloaded: (count) => `${count} 件のファイルをダウンロードしました`,
    downloading: 'ダウンロード中...',
    download: 'ダウンロード',
    history: '履歴',
    addToQueue: 'キューに追加',
    queued: (position) => `待機中（${position} 番目）`,
    queueTitle: '次に実行',
    removeFromQueue: 'キューから削除'
  },

  download: {
    unsupportedUrl: (url) => `サポートされていない URL: ${url}`,
    processingLinks: 'リンクを処理中...',
    processing: (url) => `${url} を処理中`,
    downloadingFiles: 'ファイルをダウンロード中...',
    downloadingFile: (name) => `${name} をダウンロード中`,
    cancelled: (name, reason) =>
      `ダウンロードを中止しました:「${name}」をダウンロードできませんでした（${reason}）。何も保存されていません。もう一度お試しください。`,
    downloadFailed: 'ダウンロードに失敗しました',
    noResponse: '応答待ちがタイムアウトしました',
    stalled: '停止: 時間内にデータを受信できませんでした',
    noFileFound: 'ファイルが見つかりません。',
    saving: '履歴に保存中...',
    savingChunk: (index, total) => `履歴に保存中...（${index}/${total}）`,
    saved: '履歴に保存しました。',
    saveFailed: (reason) => `履歴に保存できませんでした: ${reason}`,
    timedOut: '応答待ちがタイムアウトしました。もう一度お試しください',
    unknownError: '不明なエラー',
    interrupted: 'ダウンロードが中断されました: タブが閉じられたか、別のページに移動しました。',
    couldNotStart: (title) => `「${title}」を開始できませんでした。そのタブを開いてもう一度お試しください。`
  }
};
