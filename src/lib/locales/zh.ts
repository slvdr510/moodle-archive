import type { Messages } from './en';

export const zh: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: '作者：slvdr510',
    cancel: '取消',
    save: '保存',
    close: '关闭',
    delete: '删除',
    export: '导出',
    download: '下载',
    moreOptions: '更多选项',
    exporting: '正在导出…',
    importing: '正在导入…',
    savedToDownloads: (name) => `“${name}”已保存到“下载”文件夹。`,
    couldNotExport: (name, error) => `无法导出“${name}”：${error}`
  },

  header: {
    theme: '主题',
    themeLight: '浅色',
    themeSystem: '跟随系统',
    themeDark: '深色',
    language: '语言',
    languageAuto: '浏览器语言'
  },

  relativeTime: {
    justNow: '刚刚',
    minutes: (n) => `${n} 分钟前`,
    hours: (n) => `${n} 小时前`,
    days: (n) => `${n} 天前`,
    weeks: (n) => `${n} 周前`,
    months: (n) => `${n} 个月前`,
    years: (n) => `${n} 年前`
  },

  status: {
    new: '新增',
    modified: '已修改',
    deleted: '已删除',
    unchanged: '未更改'
  },

  courses: {
    openAllUrls: '打开所有课程网址',
    exportAll: '导出所有课程',
    importCourses: '导入课程',
    recentSettings: '最近打开设置',
    downloadNameSettings: '下载文件名设置',
    sideMargin: '两侧边距',
    hiddenCourses: '已隐藏的课程',
    deleteAll: '删除所有课程',
    backupSaved: '备份已保存到“下载”文件夹。',
    couldNotExportAll: (error) => `无法导出：${error}`,
    noUrlsToOpen: '没有可打开的课程网址。',
    imported: (courses, files, versions) => `已导入 ${courses} 门课程、${files} 个文件、${versions} 个版本。`,
    notABackup: (name) => `“${name}”不是此扩展程序所用课程格式的 zip 文件。`,
    couldNotImport: (details) => `无法导入 ${details}`,
    dropBackups: '拖放 .zip 备份以导入其中的课程',
    exportAllTitle: '导出所有课程？',
    exportAllMessage: '所有跟踪的课程、文件和版本都将保存为一个 zip 文件，放在“下载”文件夹中。',
    exportCourseTitle: (name) => `导出“${name}”？`,
    exportCourseMessage: '该课程、其文件及所有版本都将保存为一个 zip 文件，放在“下载”文件夹中。',
    deleteAllTitle: '删除所有课程？',
    deleteAllMessage: '这会清除扩展程序跟踪的所有课程、文件和版本历史记录。之后再次下载某门课程即可重新开始积累其历史记录。',
    deleteCourseTitle: (name) => `删除“${name}”？`,
    deleteCourseMessage: '这会移除该课程及其文件和版本历史记录。如果以后再次下载这门课程，它会从头重新创建。',
    emptyTitle: '还没有课程',
    emptySubtitle: '首次下载某门课程时会自动创建该课程。',
    emptyStep1: '在 Moodle 中打开一门课程',
    emptyStep2: '点击扩展程序图标',
    emptyStep3Before: '点击',
    emptyStep3After: '',
    emptyHintBefore: '已经有备份？将其 ',
    emptyHintAfter: ' 文件拖放到本页任意位置即可导入。',
    allHidden: '你的所有课程都已隐藏。使用 ⋮ 菜单中的“已隐藏的课程”可重新显示课程。'
  },

  courseRow: {
    lastDownloaded: '上次下载',
    openInMoodle: '在 Moodle 中打开课程',
    setTagName: '设置标签名',
    hideCourse: '隐藏课程',
    deleteCourse: '删除课程'
  },

  hiddenCourses: {
    title: '已隐藏的课程',
    none: '没有隐藏的课程。',
    unhide: '取消隐藏'
  },

  courseFiles: {
    backToCourses: '返回课程列表',
    addFile: '添加文件…',
    couldNotRead: (fileCount, firstName, error) =>
      `无法读取${fileCount === 1 ? `“${firstName}”` : '拖放的文件'}——文件可能已被移动或删除，或仍在下载中。` +
      `请从稳定的位置重试。（${error}）`,
    couldNotAdd: (_fileCount, error) => `无法添加文件：${error}`,
    dropFiles: (name) => `拖放文件以添加到“${name}”`,
    searchPlaceholder: '按名称搜索文件…',
    noMatches: (query) => `没有与“${query}”匹配的文件。`,
    noFiles: '此课程尚未下载任何文件。'
  },

  fileRow: {
    viewHistory: '查看版本历史',
    lastSaved: (date) => `上次保存：${date}`,
    manual: '手动',
    manualTitle: '手动添加，并非从 Moodle 下载',
    deleteTitle: '从历史记录中删除此文件',
    downloadTitle: '下载到“下载”文件夹',
    deleteConfirmTitle: (name) => `删除“${name}”？`,
    deleteConfirmMessage: '这会从历史记录中移除该文件及其所有已保存版本。如果它仍在 Moodle 中，下次下载此课程时会作为新文件重新添加。'
  },

  folderRow: {
    deleteTitle: '从历史记录中删除此文件夹',
    downloadTitle: '将此文件夹下载为 zip',
    couldNotDownload: (name, error) => `无法下载“${name}”：${error}`,
    deleteConfirmTitle: (name) => `删除“${name}”？`,
    deleteConfirmMessage: (fileCount) =>
      `这会从历史记录中移除该文件夹、其中的 ${fileCount} 个文件及其所有已保存版本。` +
      '仍在 Moodle 中的内容会在下次下载此课程时作为新内容重新添加。'
  },

  recentlyOpened: {
    title: '最近打开',
    remove: '从最近打开中移除'
  },

  recentSettings: {
    title: '最近打开',
    appliesToAll: '适用于所有课程。',
    show: '显示最近打开的文件',
    noLimit: '无限制',
    maximum: '每门课程最近打开文件的最大数量'
  },

  downloadNames: {
    title: '下载文件名',
    description: '适用于所有课程。没有标签的课程会以文件本身的名称下载。',
    prefixCourseTag: '在下载文件名开头添加课程标签（例如 TAG_file.pdf）'
  },

  sideMargin: {
    title: '两侧边距',
    description: '窗口最大化时内容两侧的留白，以占屏幕宽度的比例表示。窗口较小时，内容保持该宽度，先占用边距，再占满整个窗口。',
    label: (percent) => `每侧 ${percent}%`
  },

  upload: {
    titleOne: (name) => `添加“${name}”`,
    titleMany: (count) => `添加 ${count} 个文件`,
    where: () => '要保存到哪里？',
    courseRoot: '课程根目录',
    existingFolder: '现有文件夹',
    newFolder: '新建文件夹',
    folderNamePlaceholder: '文件夹名称',
    newFolderNameLabel: '新文件夹名称',
    alreadyExistsBefore: '此文件夹中已存在 ',
    alreadyExistsAfter: '——新文件将作为它的新版本添加。',
    add: '添加',
    adding: '正在添加…'
  },

  versions: {
    whichVersion: '哪个版本？',
    downloadTitle: '将此版本下载到“下载”文件夹',
    diffVsPrevious: '与上一版本比较',
    comparing: (from, to) => `正在比较 v${from} → v${to}`,
    loadingDiff: '正在加载差异…',
    binaryChanged: '二进制文件——内容已更改。',
    size: (from, to, delta) => `大小：${from} → ${to}（${delta}）`,
    deleteTitle: '删除此版本',
    deleteConfirmTitle: (label) => `删除 ${label}？`,
    deleteConfirmMessage:
      '此版本将从文件的历史记录中永久移除。其他版本和文件本身会保留。'
  },

  openFile: {
    downloadInterrupted: '下载已中断。',
    couldNotOpen: (filename, error) =>
      `“${filename}”已下载，但无法自动打开（${error}）。\n\n` +
      '你可以在 Chrome 的下载内容中打开它（Ctrl+J / Cmd+Shift+J）。' +
      '提示：在那里右键点击某个下载项，选择“总是打开此类文件”，以后就会自动打开。'
  },

  backup: {
    courseNotFound: '找不到课程。',
    invalid: (reason) => `不是有效的 Moodle Archive 备份（${reason}）。`,
    notZip: '不是 zip 文件',
    missingManifest: '缺少 data.json',
    invalidJson: 'data.json 不是有效的 JSON',
    noCourses: 'data.json 中没有课程信息'
  },

  viewer: {
    notFoundTitle: '找不到文件',
    notFoundText: '此文件已不在你的 Moodle Archive 历史记录中——可能已被删除。',
    cannotPreview: '无法在浏览器中预览此类文件。'
  },

  popup: {
    cannotScan: '无法扫描此页面——请先打开一个 Moodle 课程标签页。',
    filesDownloaded: (count) => `已下载 ${count} 个文件`,
    downloading: '正在下载...',
    download: '下载',
    history: '历史记录',
    addToQueue: '加入队列',
    queued: (position) => `排队中（第 ${position} 个）`,
    queueTitle: '接下来',
    removeFromQueue: '从队列中移除'
  },

  download: {
    unsupportedUrl: (url) => `不支持的网址：${url}。`,
    processingLinks: '正在处理链接...',
    processing: (url) => `正在处理 ${url}`,
    downloadingFiles: '正在下载文件...',
    downloadingFile: (name) => `正在下载 ${name}`,
    cancelled: (name, reason) =>
      `下载已取消：无法下载“${name}”（${reason}）。未保存任何内容，请重试。`,
    downloadFailed: '下载失败',
    noResponse: '等待响应超时',
    stalled: '已停滞：未能及时收到数据',
    noFileFound: '未找到文件。',
    saving: '正在保存到历史记录...',
    savingChunk: (index, total) => `正在保存到历史记录...（${index}/${total}）`,
    saved: '已保存到历史记录。',
    saveFailed: (reason) => `无法保存到历史记录：${reason}`,
    timedOut: '等待响应超时——请重试',
    unknownError: '未知错误',
    interrupted: '下载已中断：标签页已关闭或已离开当前页面。',
    couldNotStart: (title) => `无法开始“${title}”——请打开它的标签页后重试。`
  }
};
