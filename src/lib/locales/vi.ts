import type { Messages } from './en';

export const vi: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'của slvdr510',
    cancel: 'Hủy',
    save: 'Lưu',
    close: 'Đóng',
    delete: 'Xóa',
    export: 'Xuất',
    download: 'Tải xuống',
    moreOptions: 'Tùy chọn khác',
    exporting: 'Đang xuất…',
    importing: 'Đang nhập…',
    savedToDownloads: (name) => `Đã lưu "${name}" vào thư mục Tải xuống.`,
    couldNotExport: (name, error) => `Không thể xuất "${name}": ${error}`
  },

  header: {
    theme: 'Giao diện',
    themeLight: 'Sáng',
    themeSystem: 'Theo hệ thống',
    themeDark: 'Tối',
    language: 'Ngôn ngữ',
    languageAuto: 'Ngôn ngữ trình duyệt'
  },

  relativeTime: {
    justNow: 'vừa xong',
    minutes: (n) => `${n} phút trước`,
    hours: (n) => `${n} giờ trước`,
    days: (n) => `${n} ngày trước`,
    weeks: (n) => `${n} tuần trước`,
    months: (n) => `${n} tháng trước`,
    years: (n) => `${n} năm trước`
  },

  status: {
    new: 'Mới',
    modified: 'Đã sửa',
    deleted: 'Đã xóa',
    unchanged: 'Không đổi'
  },

  courses: {
    openAllUrls: 'Mở tất cả URL khóa học',
    exportAll: 'Xuất tất cả khóa học',
    importCourses: 'Nhập khóa học',
    recentSettings: 'Cài đặt mở gần đây',
    downloadNameSettings: 'Cài đặt tên tệp tải xuống',
    sideMargin: 'Lề hai bên',
    courseListStyle: 'Kiểu danh sách khóa học',
    setInstitution: 'Đặt cơ sở cho các khóa học',
    hiddenCourses: 'Khóa học bị ẩn',
    deleteAll: 'Xóa tất cả khóa học',
    backupSaved: 'Đã lưu bản sao lưu vào thư mục Tải xuống.',
    couldNotExportAll: (error) => `Không thể xuất: ${error}`,
    noUrlsToOpen: 'Không có URL khóa học nào để mở.',
    imported: (courses, files, versions) =>
      `Đã nhập ${courses} khóa học, ${files} tệp, ${versions} phiên bản.`,
    notABackup: (name) => `"${name}" không phải tệp zip theo định dạng khóa học của tiện ích này.`,
    couldNotImport: (details) => `Không thể nhập ${details}`,
    dropBackups: 'Thả các bản sao lưu .zip để nhập khóa học',
    exportAllTitle: 'Xuất tất cả khóa học?',
    exportAllMessage: 'Mọi khóa học, tệp và phiên bản đang theo dõi sẽ được lưu vào một tệp zip trong thư mục Tải xuống.',
    exportCourseTitle: (name) => `Xuất "${name}"?`,
    exportCourseMessage: 'Khóa học, các tệp và mọi phiên bản sẽ được lưu vào một tệp zip trong thư mục Tải xuống.',
    deleteAllTitle: 'Xóa tất cả khóa học?',
    deleteAllMessage:
      'Thao tác này xóa mọi khóa học, tệp và lịch sử phiên bản mà tiện ích đang theo dõi. ' +
      'Hãy tải lại một khóa học sau đó để bắt đầu xây dựng lại lịch sử của nó.',
    deleteCourseTitle: (name) => `Xóa "${name}"?`,
    deleteCourseMessage:
      'Thao tác này xóa khóa học cùng lịch sử tệp và phiên bản của nó. Nếu sau này bạn tải lại khóa học này, ' +
      'nó sẽ được tạo lại từ đầu.',
    emptyTitle: 'Chưa có khóa học nào',
    emptySubtitle: 'Khóa học được tạo tự động vào lần đầu bạn tải xuống.',
    emptyStep1: 'Mở một khóa học trong Moodle',
    emptyStep2: 'Nhấp vào biểu tượng tiện ích',
    emptyStep3Before: 'Nhấn ',
    emptyStep3After: '',
    emptyHintBefore: 'Đã có bản sao lưu? Thả tệp ',
    emptyHintAfter: ' vào bất kỳ đâu trên trang này để nhập.',
    allHidden: 'Tất cả khóa học của bạn đang bị ẩn. Dùng "Khóa học bị ẩn" trong menu ⋮ để hiện lại.'
  },

  courseRow: {
    lastDownloaded: 'Tải xuống lần cuối',
    openInMoodle: 'Mở khóa học trong Moodle',
    setTagName: 'Đặt nhãn (viết tắt)',
    setFullName: 'Đặt tên đầy đủ',
    tagPlaceholder: 'Viết tắt, vd. HĐH',
    fullNamePlaceholder: 'Tên đầy đủ (để trống: tên trên Moodle)',
    setInstitution: 'Đặt cơ sở (viết tắt)',
    institutionPlaceholder: 'Tên viết tắt của cơ sở, vd. UHU',
    institution: 'Cơ sở',
    changeColor: 'Đổi màu',
    hideCourse: 'Ẩn khóa học',
    deleteCourse: 'Xóa khóa học'
  },

  hiddenCourses: {
    title: 'Khóa học bị ẩn',
    none: 'Không có khóa học nào bị ẩn.',
    unhide: 'Bỏ ẩn'
  },

  courseFiles: {
    backToCourses: 'Quay lại danh sách khóa học',
    addFile: 'Thêm tệp…',
    ignoredFiles: 'Tệp bị bỏ qua',
    couldNotRead: (fileCount, firstName, error) =>
      `Không thể đọc ${fileCount === 1 ? `"${firstName}"` : 'các tệp đã thả'} — tệp có thể đã bị di chuyển hoặc xóa, ` +
      `hoặc vẫn đang được tải xuống. Hãy thử lại từ một vị trí ổn định. (${error})`,
    couldNotAdd: (_fileCount, error) => `Không thể thêm tệp: ${error}`,
    dropFiles: (name) => `Thả tệp để thêm vào "${name}"`,
    searchPlaceholder: 'Tìm tệp theo tên…',
    noMatches: (query) => `Không có tệp nào khớp với "${query}".`,
    noFiles: 'Chưa tải xuống tệp nào cho khóa học này.'
  },

  fileRow: {
    viewHistory: 'Xem lịch sử phiên bản',
    lastSaved: (date) => `Lưu lần cuối: ${date}`,
    manual: 'Thủ công',
    manualTitle: 'Được thêm thủ công, không tải từ Moodle',
    ignored: 'Bỏ qua',
    ignoredTitle: 'Lượt tải xuống giữ nguyên tệp này',
    ignoreTitle: 'Bỏ qua thay đổi của tệp này',
    unignoreTitle: 'Ngừng bỏ qua tệp này',
    ignoredWithFolderTitle: 'Bị bỏ qua cùng thư mục chứa nó',
    deleteTitle: 'Xóa tệp này khỏi lịch sử',
    downloadTitle: 'Tải xuống vào thư mục Tải xuống',
    deleteConfirmTitle: (name) => `Xóa "${name}"?`,
    deleteConfirmMessage:
      'Thao tác này xóa tệp và mọi phiên bản đã lưu của nó khỏi lịch sử. Nếu tệp vẫn còn trên Moodle, ' +
      'lần tải khóa học tiếp theo sẽ thêm lại nó như một tệp mới.'
  },

  folderRow: {
    ignoreTitle: 'Bỏ qua thư mục này và mọi thứ bên trong',
    unignoreTitle: 'Ngừng bỏ qua thư mục này',
    ignoredTitle: 'Lượt tải xuống giữ nguyên thư mục này và mọi thứ bên trong',
    deleteTitle: 'Xóa thư mục này khỏi lịch sử',
    downloadTitle: 'Tải thư mục này xuống dưới dạng zip',
    couldNotDownload: (name, error) => `Không thể tải xuống "${name}": ${error}`,
    deleteConfirmTitle: (name) => `Xóa "${name}"?`,
    deleteConfirmMessage: (fileCount) =>
      `Thao tác này xóa thư mục, ${fileCount} tệp trong đó và mọi phiên bản đã lưu khỏi lịch sử. ` +
      'Những gì vẫn còn trên Moodle sẽ được thêm lại như mới vào lần tới bạn tải khóa học này.'
  },

  recentlyOpened: {
    title: 'Mở gần đây',
    remove: 'Xóa khỏi danh sách mở gần đây',
    showAll: 'Hiển thị tất cả mục mở gần đây'
  },

  recentSettings: {
    title: 'Mở gần đây',
    appliesToAll: 'Áp dụng cho mọi khóa học.',
    show: 'Hiện các tệp mở gần đây',
    noLimit: 'Không giới hạn',
    maximum: 'Số tệp mở gần đây tối đa cho mỗi khóa học'
  },

  downloadNames: {
    title: 'Tên tệp tải xuống',
    description: 'Áp dụng cho mọi khóa học. Khóa học không có thẻ sẽ được tải xuống với tên gốc của tệp.',
    prefixCourseTag: 'Thêm thẻ khóa học vào đầu tên tệp tải xuống (vd: TAG_file.pdf)'
  },

  sideMargin: {
    title: 'Lề hai bên',
    description:
      'Khoảng trống ở mỗi bên nội dung khi cửa sổ được phóng to, tính theo tỷ lệ màn hình. Ở cửa sổ nhỏ hơn, ' +
      'nội dung giữ nguyên độ rộng đó, dùng hết phần lề trước rồi mới chiếm toàn bộ cửa sổ.',
    label: (percent) => `${percent}% mỗi bên`
  },

  courseListStyle: {
    title: 'Kiểu danh sách khóa học',
    description: 'Cách hiển thị các khóa học trên trang này.',
    cards: 'Thẻ',
    rows: 'Hàng'
  },

  courseColor: {
    title: (name) => `Màu của "${name}"`,
    palette: 'Bảng màu',
    custom: 'Màu tùy chỉnh',
    automatic: 'Dùng màu tự động'
  },

  setInstitution: {
    title: 'Đặt cơ sở',
    description: 'Chọn các khóa học sẽ được gán cơ sở này. Để trống để gỡ cơ sở khỏi chúng.',
    courses: (count) => (count === 0 ? 'Khóa học' : `Khóa học (đã chọn ${count})`),
    selectAll: 'Chọn tất cả',
    selectNone: 'Bỏ chọn',
    hidden: 'Đã ẩn',
    apply: (count) => (count === 1 ? 'Áp dụng cho 1 khóa học' : `Áp dụng cho ${count} khóa học`),
    remove: (count) => (count === 1 ? 'Gỡ khỏi 1 khóa học' : `Gỡ khỏi ${count} khóa học`)
  },

  ignoredFiles: {
    title: 'Tệp bị bỏ qua',
    description:
      'Lượt tải xuống giữ nguyên các tệp này: không có phiên bản mới, không bao giờ bị đánh dấu đã xóa, và không được thêm nếu chưa được theo dõi.',
    pathLabel: 'Đường dẫn tệp',
    placeholder: 'Thư mục/tệp.pdf',
    hint:
      'Ghi cả phần mở rộng và các thư mục chứa tệp: tệp ở thư mục gốc của khóa học chỉ là tên của nó. Các tệp cùng tên ở thư mục khác nhau là các tệp khác nhau. Kết thúc đường dẫn bằng / để bỏ qua cả thư mục cùng mọi thứ bên trong.',
    add: 'Thêm',
    folder: 'Thư mục',
    remove: (path) => `Ngừng bỏ qua ${path}`,
    empty: 'Không có tệp nào bị bỏ qua.',
    duplicate: 'Tệp đó đã có trong danh sách.',
    notFound: 'Chưa có trong khóa học này',
    askDeleteTitle: (count, name) => (count === 1 ? `"${name}" giờ đã bị bỏ qua` : `${count} tệp giờ đã bị bỏ qua`),
    askDeleteMessage: (count) =>
      count === 1
        ? 'Lượt tải xuống sẽ giữ nguyên tệp này. Bạn có muốn xóa luôn tệp khỏi khóa học này, cùng mọi phiên bản đã lưu không? Khi còn bị bỏ qua, các lượt tải sau sẽ không thêm lại tệp.'
        : 'Lượt tải xuống sẽ giữ nguyên các tệp này. Bạn có muốn xóa luôn chúng khỏi khóa học này, cùng mọi phiên bản đã lưu không? Khi còn bị bỏ qua, các lượt tải sau sẽ không thêm lại chúng.',
    keep: (count) => (count === 1 ? 'Giữ lại' : 'Giữ lại')
  },

  upload: {
    titleOne: (name) => `Thêm "${name}"`,
    titleMany: (count) => `Thêm ${count} tệp`,
    where: () => 'Bạn muốn lưu vào đâu?',
    courseRoot: 'Thư mục gốc của khóa học',
    existingFolder: 'Thư mục có sẵn',
    newFolder: 'Thư mục mới',
    folderNamePlaceholder: 'Tên thư mục',
    newFolderNameLabel: 'Tên thư mục mới',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' đã có trong thư mục này — tệp mới sẽ được thêm làm phiên bản mới của nó.',
    add: 'Thêm',
    adding: 'Đang thêm…'
  },

  versions: {
    whichVersion: 'Phiên bản nào?',
    downloadTitle: 'Tải phiên bản này vào thư mục Tải xuống',
    diffVsPrevious: 'So với bản trước',
    comparing: (from, to) => `Đang so sánh v${from} → v${to}`,
    loadingDiff: 'Đang tải khác biệt…',
    binaryChanged: 'Tệp nhị phân — nội dung đã thay đổi.',
    size: (from, to, delta) => `Kích thước: ${from} → ${to} (${delta})`,
    deleteTitle: 'Xóa phiên bản này',
    deleteConfirmTitle: (label) => `Xóa ${label}?`,
    deleteConfirmMessage:
      'Phiên bản này sẽ bị xóa vĩnh viễn khỏi lịch sử của tệp. Các phiên bản khác và chính tệp vẫn được giữ lại.'
  },

  openFile: {
    downloadInterrupted: 'Quá trình tải xuống bị gián đoạn.',
    couldNotOpen: (filename, error) =>
      `Đã tải xuống "${filename}" nhưng không thể tự động mở (${error}).\n\n` +
      'Bạn có thể mở nó từ mục tải xuống của Chrome (Ctrl+J / Cmd+Shift+J). ' +
      'Mẹo: nhấp chuột phải vào một tệp tải xuống ở đó và chọn "Luôn mở các tệp thuộc loại này" để từ nay ' +
      'việc này diễn ra tự động.'
  },

  backup: {
    courseNotFound: 'Không tìm thấy khóa học.',
    invalid: (reason) => `Không phải bản sao lưu Moodle Archive hợp lệ (${reason}).`,
    notZip: 'không phải tệp zip',
    missingManifest: 'thiếu data.json',
    invalidJson: 'data.json không phải JSON hợp lệ',
    noCourses: 'data.json không mô tả khóa học nào'
  },

  viewer: {
    notFoundTitle: 'Không tìm thấy tệp',
    notFoundText: 'Tệp này không còn trong lịch sử Moodle Archive của bạn — có thể đã bị xóa.',
    cannotPreview: 'Không thể xem trước loại tệp này trong trình duyệt.',
    zoomOut: 'Thu nhỏ',
    zoomIn: 'Phóng to',
    fitVertically: 'Vừa theo chiều dọc',
    fitHorizontally: 'Vừa theo chiều ngang'
  },

  popup: {
    cannotScan: 'Không thể quét trang này — hãy mở một thẻ khóa học Moodle trước.',
    filesDownloaded: (count) => `Đã tải xuống ${count} tệp`,
    downloading: 'Đang tải xuống...',
    download: 'Tải xuống',
    history: 'Lịch sử',
    addToQueue: 'Thêm vào hàng đợi',
    queued: (position) => `Đang chờ (#${position})`,
    queueTitle: 'Tiếp theo',
    removeFromQueue: 'Xóa khỏi hàng đợi'
  },

  download: {
    unsupportedUrl: (url) => `URL không được hỗ trợ: ${url}.`,
    processingLinks: 'Đang xử lý liên kết...',
    processing: (url) => `Đang xử lý ${url}`,
    downloadingFiles: 'Đang tải tệp xuống...',
    downloadingFile: (name) => `Đang tải xuống ${name}`,
    cancelled: (name, reason) =>
      `Đã hủy tải xuống: không thể tải "${name}" (${reason}). Chưa lưu gì cả — hãy thử lại.`,
    downloadFailed: 'tải xuống thất bại',
    noResponse: 'Hết thời gian chờ phản hồi',
    stalled: 'Bị treo: không nhận được dữ liệu kịp thời',
    noFileFound: 'Không tìm thấy tệp nào.',
    saving: 'Đang lưu vào lịch sử...',
    savingChunk: (index, total) => `Đang lưu vào lịch sử... (${index}/${total})`,
    saved: 'Đã lưu vào lịch sử.',
    saveFailed: (reason) => `Không thể lưu vào lịch sử: ${reason}`,
    timedOut: 'hết thời gian chờ phản hồi — hãy thử lại',
    unknownError: 'lỗi không xác định',
    interrupted: 'Tải xuống bị gián đoạn: thẻ đã bị đóng hoặc chuyển sang trang khác.',
    couldNotStart: (title) => `Không thể bắt đầu "${title}" — hãy mở thẻ của nó rồi thử lại.`
  }
};
