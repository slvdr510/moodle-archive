import type { Messages } from './en';

export const id: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'oleh slvdr510',
    cancel: 'Batal',
    save: 'Simpan',
    close: 'Tutup',
    delete: 'Hapus',
    export: 'Ekspor',
    download: 'Unduh',
    moreOptions: 'Opsi lainnya',
    exporting: 'Mengekspor…',
    importing: 'Mengimpor…',
    savedToDownloads: (name) => `"${name}" disimpan ke folder Unduhan Anda.`,
    couldNotExport: (name, error) => `Tidak dapat mengekspor "${name}": ${error}`
  },

  header: {
    theme: 'Tema',
    themeLight: 'Terang',
    themeSystem: 'Ikuti sistem',
    themeDark: 'Gelap',
    language: 'Bahasa',
    languageAuto: 'Bahasa browser'
  },

  relativeTime: {
    justNow: 'baru saja',
    minutes: (n) => `${n} mnt lalu`,
    hours: (n) => `${n} jam lalu`,
    days: (n) => `${n} hr lalu`,
    weeks: (n) => `${n} mgg lalu`,
    months: (n) => `${n} bln lalu`,
    years: (n) => `${n} thn lalu`
  },

  status: {
    new: 'Baru',
    modified: 'Diubah',
    deleted: 'Dihapus',
    unchanged: 'Tidak berubah'
  },

  courses: {
    openAllUrls: 'Buka semua URL kursus',
    exportAll: 'Ekspor semua kursus',
    importCourses: 'Impor kursus',
    recentSettings: 'Pengaturan baru dibuka',
    downloadNameSettings: 'Pengaturan nama unduhan',
    sideMargin: 'Margin samping',
    hiddenCourses: 'Kursus tersembunyi',
    deleteAll: 'Hapus semua kursus',
    backupSaved: 'Cadangan disimpan ke folder Unduhan Anda.',
    couldNotExportAll: (error) => `Tidak dapat mengekspor: ${error}`,
    noUrlsToOpen: 'Tidak ada URL kursus untuk dibuka.',
    imported: (courses, files, versions) =>
      `Berhasil mengimpor ${courses} kursus, ${files} file, ${versions} versi.`,
    notABackup: (name) => `"${name}" bukan file zip dengan format kursus yang digunakan ekstensi ini.`,
    couldNotImport: (details) => `Tidak dapat mengimpor ${details}`,
    dropBackups: 'Letakkan cadangan .zip untuk mengimpor kursusnya',
    exportAllTitle: 'Ekspor semua kursus?',
    exportAllMessage: 'Setiap kursus, file, dan versi yang dilacak akan disimpan ke satu file zip di folder Unduhan Anda.',
    exportCourseTitle: (name) => `Ekspor "${name}"?`,
    exportCourseMessage: 'Kursus, file-filenya, dan setiap versinya akan disimpan ke file zip di folder Unduhan Anda.',
    deleteAllTitle: 'Hapus semua kursus?',
    deleteAllMessage:
      'Ini menghapus semua kursus, file, dan riwayat versi yang dilacak oleh ekstensi. ' +
      'Unduh kursus lagi setelahnya untuk mulai membangun ulang riwayatnya.',
    deleteCourseTitle: (name) => `Hapus "${name}"?`,
    deleteCourseMessage:
      'Ini menghapus kursus beserta riwayat file dan versinya. Jika Anda mengunduh kursus ini ' +
      'lagi nanti, kursus akan dibuat ulang dari awal.',
    emptyTitle: 'Belum ada kursus',
    emptySubtitle: 'Kursus dibuat otomatis saat pertama kali Anda mengunduhnya.',
    emptyStep1: 'Buka kursus di Moodle',
    emptyStep2: 'Klik ikon ekstensi',
    emptyStep3Before: 'Tekan ',
    emptyStep3After: '',
    emptyHintBefore: 'Sudah punya cadangan? Letakkan file ',
    emptyHintAfter: ' di mana saja di halaman ini untuk mengimpornya.',
    allHidden: 'Semua kursus Anda disembunyikan. Gunakan "Kursus tersembunyi" di menu ⋮ untuk menampilkannya lagi.'
  },

  courseRow: {
    lastDownloaded: 'Terakhir diunduh',
    openInMoodle: 'Buka kursus di Moodle',
    setTagName: 'Atur nama tag',
    hideCourse: 'Sembunyikan kursus',
    deleteCourse: 'Hapus kursus'
  },

  hiddenCourses: {
    title: 'Kursus tersembunyi',
    none: 'Tidak ada kursus yang disembunyikan.',
    unhide: 'Tampilkan'
  },

  courseFiles: {
    backToCourses: 'Kembali ke kursus',
    addFile: 'Tambah file…',
    couldNotRead: (fileCount, firstName, error) =>
      `Tidak dapat membaca ${fileCount === 1 ? `"${firstName}"` : 'file yang diletakkan'} — file mungkin telah ` +
      `dipindahkan atau dihapus, atau masih diunduh. Coba lagi dari lokasi yang stabil. (${error})`,
    couldNotAdd: (_fileCount, error) => `Tidak dapat menambahkan file: ${error}`,
    dropFiles: (name) => `Letakkan file untuk menambahkannya ke "${name}"`,
    searchPlaceholder: 'Cari file berdasarkan nama…',
    noMatches: (query) => `Tidak ada file yang cocok dengan "${query}".`,
    noFiles: 'Belum ada file yang diunduh untuk kursus ini.'
  },

  fileRow: {
    viewHistory: 'Lihat riwayat versi',
    lastSaved: (date) => `Terakhir disimpan: ${date}`,
    manual: 'Manual',
    manualTitle: 'Ditambahkan secara manual, tidak diunduh dari Moodle',
    deleteTitle: 'Hapus file ini dari riwayat Anda',
    downloadTitle: 'Unduh ke folder Unduhan Anda',
    deleteConfirmTitle: (name) => `Hapus "${name}"?`,
    deleteConfirmMessage:
      'Ini menghapus file dan semua versi tersimpannya dari riwayat Anda. Jika masih ada di Moodle, ' +
      'unduhan berikutnya dari kursus ini akan menambahkannya kembali sebagai file baru.'
  },

  folderRow: {
    deleteTitle: 'Hapus folder ini dari riwayat Anda',
    downloadTitle: 'Unduh folder ini sebagai zip',
    couldNotDownload: (name, error) => `Tidak dapat mengunduh "${name}": ${error}`,
    deleteConfirmTitle: (name) => `Hapus "${name}"?`,
    deleteConfirmMessage: (fileCount) =>
      `Ini menghapus folder, ${fileCount} file di dalamnya, dan semua versi tersimpannya dari riwayat Anda. ` +
      'Apa pun yang masih ada di Moodle akan ditambahkan kembali sebagai baru saat Anda mengunduh kursus ini lagi.'
  },

  recentlyOpened: {
    title: 'Baru dibuka',
    remove: 'Hapus dari daftar baru dibuka'
  },

  recentSettings: {
    title: 'Baru dibuka',
    appliesToAll: 'Berlaku untuk semua kursus.',
    show: 'Tampilkan file yang baru dibuka',
    noLimit: 'Tanpa batas',
    maximum: 'Jumlah maksimum file yang baru dibuka per kursus'
  },

  downloadNames: {
    title: 'Nama unduhan',
    description: 'Berlaku untuk semua kursus. Kursus tanpa tag diunduh dengan nama file aslinya.',
    prefixCourseTag: 'Tambahkan tag kursus di awal nama unduhan (mis. TAG_file.pdf)'
  },

  sideMargin: {
    title: 'Margin samping',
    description:
      'Ruang kosong di setiap sisi konten pada jendela yang dimaksimalkan, sebagai bagian dari layar. Pada jendela ' +
      'yang lebih kecil, konten mempertahankan lebar itu dengan memakai margin terlebih dahulu, lalu seluruh jendela.',
    label: (percent) => `${percent}% di setiap sisi`
  },

  upload: {
    titleOne: (name) => `Tambah "${name}"`,
    titleMany: (count) => `Tambah ${count} file`,
    where: () => 'Di mana Anda ingin menyimpannya?',
    courseRoot: 'Akar kursus',
    existingFolder: 'Folder yang ada',
    newFolder: 'Folder baru',
    folderNamePlaceholder: 'Nama folder',
    newFolderNameLabel: 'Nama folder baru',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' sudah ada di folder ini — file baru akan ditambahkan sebagai versi barunya.',
    add: 'Tambah',
    adding: 'Menambahkan…'
  },

  versions: {
    whichVersion: 'Versi yang mana?',
    downloadTitle: 'Unduh versi ini ke folder Unduhan Anda',
    diffVsPrevious: 'Bandingkan dengan sebelumnya',
    comparing: (from, to) => `Membandingkan v${from} → v${to}`,
    loadingDiff: 'Memuat perbedaan…',
    binaryChanged: 'File biner — isinya berubah.',
    size: (from, to, delta) => `Ukuran: ${from} → ${to} (${delta})`,
    deleteTitle: 'Hapus versi ini',
    deleteConfirmTitle: (label) => `Hapus ${label}?`,
    deleteConfirmMessage:
      'Versi ini akan dihapus permanen dari riwayat file. Versi lainnya dan file itu sendiri tetap ada.'
  },

  openFile: {
    downloadInterrupted: 'Unduhan terputus.',
    couldNotOpen: (filename, error) =>
      `"${filename}" telah diunduh, tetapi tidak dapat dibuka secara otomatis (${error}).\n\n` +
      'Anda dapat membukanya dari unduhan Chrome (Ctrl+J / Cmd+Shift+J). ' +
      'Tips: klik kanan unduhan di sana dan pilih "Selalu buka file jenis ini" agar mulai sekarang ' +
      'terbuka secara otomatis.'
  },

  backup: {
    courseNotFound: 'Kursus tidak ditemukan.',
    invalid: (reason) => `Bukan cadangan Moodle Archive yang valid (${reason}).`,
    notZip: 'bukan file zip',
    missingManifest: 'data.json tidak ada',
    invalidJson: 'data.json bukan JSON yang valid',
    noCourses: 'data.json tidak berisi kursus'
  },

  viewer: {
    notFoundTitle: 'File tidak ditemukan',
    notFoundText: 'File ini sudah tidak ada di riwayat Moodle Archive Anda — mungkin telah dihapus.',
    cannotPreview: 'Jenis file ini tidak dapat dipratinjau di browser.'
  },

  popup: {
    cannotScan: 'Halaman ini tidak dapat dipindai — buka tab kursus Moodle terlebih dahulu.',
    filesDownloaded: (count) => `${count} file diunduh`,
    downloading: 'Mengunduh...',
    download: 'Unduh',
    history: 'Riwayat',
    addToQueue: 'Tambahkan ke antrean',
    queued: (position) => `Dalam antrean (#${position})`,
    queueTitle: 'Berikutnya',
    removeFromQueue: 'Hapus dari antrean'
  },

  download: {
    unsupportedUrl: (url) => `URL tidak didukung: ${url}.`,
    processingLinks: 'Memproses tautan...',
    processing: (url) => `Memproses ${url}`,
    downloadingFiles: 'Mengunduh file...',
    downloadingFile: (name) => `Mengunduh ${name}`,
    cancelled: (name, reason) =>
      `Unduhan dibatalkan: tidak dapat mengunduh "${name}" (${reason}). Tidak ada yang disimpan — coba lagi.`,
    downloadFailed: 'unduhan gagal',
    noResponse: 'Waktu habis menunggu respons',
    stalled: 'Macet: tidak ada data yang diterima tepat waktu',
    noFileFound: 'Tidak ada file ditemukan.',
    saving: 'Menyimpan ke riwayat...',
    savingChunk: (index, total) => `Menyimpan ke riwayat... (${index}/${total})`,
    saved: 'Disimpan ke riwayat.',
    saveFailed: (reason) => `Tidak dapat menyimpan ke riwayat: ${reason}`,
    timedOut: 'waktu habis menunggu respons — coba lagi',
    unknownError: 'kesalahan tidak diketahui',
    interrupted: 'Unduhan terputus: tab ditutup atau berpindah halaman.',
    couldNotStart: (title) => `Tidak dapat memulai "${title}" — buka tabnya dan coba lagi.`
  }
};
