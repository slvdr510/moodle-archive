import type { Messages } from './en';

export const pt: Messages = {
  common: {
    appName: 'Moodle Archive',
    byAuthor: 'por slvdr510',
    cancel: 'Cancelar',
    save: 'Salvar',
    close: 'Fechar',
    delete: 'Excluir',
    export: 'Exportar',
    download: 'Baixar',
    moreOptions: 'Mais opções',
    exporting: 'Exportando…',
    importing: 'Importando…',
    savedToDownloads: (name) => `"${name}" foi salvo na sua pasta Downloads.`,
    couldNotExport: (name, error) => `Não foi possível exportar "${name}": ${error}`
  },

  header: {
    theme: 'Tema',
    themeLight: 'Claro',
    themeSystem: 'Igual ao sistema',
    themeDark: 'Escuro',
    language: 'Idioma',
    languageAuto: 'Idioma do navegador'
  },

  relativeTime: {
    justNow: 'agora mesmo',
    minutes: (n) => `há ${n} min`,
    hours: (n) => `há ${n} h`,
    days: (n) => `há ${n} d`,
    weeks: (n) => `há ${n} sem`,
    months: (n) => `há ${n} ${n === 1 ? 'mês' : 'meses'}`,
    years: (n) => `há ${n} ano${n === 1 ? '' : 's'}`
  },

  status: {
    new: 'Novo',
    modified: 'Modificado',
    deleted: 'Excluído',
    unchanged: 'Sem alterações'
  },

  courses: {
    openAllUrls: 'Abrir todas as URLs dos cursos',
    exportAll: 'Exportar todos os cursos',
    importCourses: 'Importar curso(s)',
    recentSettings: 'Configurações de abertos recentemente',
    downloadNameSettings: 'Configurações de nomes de download',
    sideMargin: 'Margens laterais',
    hiddenCourses: 'Cursos ocultos',
    deleteAll: 'Excluir todos os cursos',
    backupSaved: 'Backup salvo na sua pasta Downloads.',
    couldNotExportAll: (error) => `Não foi possível exportar: ${error}`,
    noUrlsToOpen: 'Nenhuma URL de curso para abrir.',
    imported: (courses, files, versions) =>
      `Importado(s) ${courses} curso(s), ${files} arquivo(s) e ${versions} versão(ões).`,
    notABackup: (name) => `"${name}" não é um zip no formato de cursos usado por esta extensão.`,
    couldNotImport: (details) => `Não foi possível importar ${details}`,
    dropBackups: 'Solte backups .zip para importar seus cursos',
    exportAllTitle: 'Exportar todos os cursos?',
    exportAllMessage: 'Todos os cursos, arquivos e versões acompanhados serão salvos em um único zip na sua pasta Downloads.',
    exportCourseTitle: (name) => `Exportar "${name}"?`,
    exportCourseMessage: 'O curso, seus arquivos e todas as versões serão salvos em um zip na sua pasta Downloads.',
    deleteAllTitle: 'Excluir todos os cursos?',
    deleteAllMessage:
      'Isso apaga todos os cursos, arquivos e históricos de versões acompanhados pela extensão. ' +
      'Baixe um curso novamente depois para começar a reconstruir o histórico dele.',
    deleteCourseTitle: (name) => `Excluir "${name}"?`,
    deleteCourseMessage:
      'Isso remove o curso e o histórico de arquivos e versões dele. Se você baixar este curso ' +
      'novamente mais tarde, ele será simplesmente recriado do zero.',
    emptyTitle: 'Nenhum curso ainda',
    emptySubtitle: 'Os cursos são criados automaticamente na primeira vez que você baixa um.',
    emptyStep1: 'Abra um curso no Moodle',
    emptyStep2: 'Clique no ícone da extensão',
    emptyStep3Before: 'Clique em ',
    emptyStep3After: '',
    emptyHintBefore: 'Já tem um backup? Solte o ',
    emptyHintAfter: ' em qualquer lugar desta página para importá-lo.',
    allHidden: 'Todos os seus cursos estão ocultos. Use "Cursos ocultos" no menu ⋮ para mostrar algum novamente.'
  },

  courseRow: {
    lastDownloaded: 'Último download',
    openInMoodle: 'Abrir o curso no Moodle',
    setTagName: 'Definir etiqueta',
    hideCourse: 'Ocultar curso',
    deleteCourse: 'Excluir curso'
  },

  hiddenCourses: {
    title: 'Cursos ocultos',
    none: 'Nenhum curso está oculto.',
    unhide: 'Mostrar'
  },

  courseFiles: {
    backToCourses: 'Voltar aos cursos',
    addFile: 'Adicionar arquivo…',
    couldNotRead: (fileCount, firstName, error) =>
      `Não foi possível ler ${fileCount === 1 ? `"${firstName}"` : 'os arquivos soltos'}: o arquivo pode ter sido movido ` +
      `ou excluído, ou ainda está sendo baixado. Tente novamente a partir de um local estável. (${error})`,
    couldNotAdd: (fileCount, error) =>
      fileCount === 1
        ? `Não foi possível adicionar o arquivo: ${error}`
        : `Não foi possível adicionar os arquivos: ${error}`,
    dropFiles: (name) => `Solte arquivos para adicioná-los a "${name}"`,
    searchPlaceholder: 'Pesquisar arquivos por nome…',
    noMatches: (query) => `Nenhum arquivo corresponde a "${query}".`,
    noFiles: 'Nenhum arquivo baixado ainda para este curso.'
  },

  fileRow: {
    viewHistory: 'Ver histórico de versões',
    lastSaved: (date) => `Salvo pela última vez: ${date}`,
    manual: 'Manual',
    manualTitle: 'Adicionado manualmente, não baixado do Moodle',
    deleteTitle: 'Excluir este arquivo do seu histórico',
    downloadTitle: 'Baixar para a sua pasta Downloads',
    deleteConfirmTitle: (name) => `Excluir "${name}"?`,
    deleteConfirmMessage:
      'Isso remove o arquivo e todas as versões salvas dele do seu histórico. Se ele ainda estiver no Moodle, ' +
      'o próximo download deste curso vai adicioná-lo de novo como um arquivo novo.'
  },

  folderRow: {
    deleteTitle: 'Excluir esta pasta do seu histórico',
    downloadTitle: 'Baixar esta pasta como zip',
    couldNotDownload: (name, error) => `Não foi possível baixar "${name}": ${error}`,
    deleteConfirmTitle: (name) => `Excluir "${name}"?`,
    deleteConfirmMessage: (fileCount) =>
      `Isso remove a pasta, ${fileCount === 1 ? 'o arquivo dela' : `os ${fileCount} arquivos dela`} e todas as versões ` +
      'salvas do seu histórico. O que ainda estiver no Moodle será adicionado de novo como novo na próxima vez que ' +
      'você baixar este curso.'
  },

  recentlyOpened: {
    title: 'Abertos recentemente',
    remove: 'Remover de abertos recentemente'
  },

  recentSettings: {
    title: 'Abertos recentemente',
    appliesToAll: 'Aplica-se a todos os cursos.',
    show: 'Mostrar arquivos abertos recentemente',
    noLimit: 'Sem limite',
    maximum: 'Máximo de arquivos abertos recentemente por curso'
  },

  downloadNames: {
    title: 'Nomes de download',
    description: 'Aplica-se a todos os cursos. Cursos sem etiqueta são baixados com o nome original do arquivo.',
    prefixCourseTag: 'Adicionar a etiqueta do curso no início dos nomes de download (ex.: ETIQUETA_arquivo.pdf)'
  },

  sideMargin: {
    title: 'Margens laterais',
    description:
      'Espaço vazio de cada lado do conteúdo com a janela maximizada, como fração da tela. Em uma janela menor, ' +
      'o conteúdo mantém essa largura, usando primeiro as margens e depois a janela inteira.',
    label: (percent) => `${percent}% de cada lado`
  },

  upload: {
    titleOne: (name) => `Adicionar "${name}"`,
    titleMany: (count) => `Adicionar ${count} arquivos`,
    where: (count) => `Onde você quer salvá-${count === 1 ? 'lo' : 'los'}?`,
    courseRoot: 'Raiz do curso',
    existingFolder: 'Pasta existente',
    newFolder: 'Nova pasta',
    folderNamePlaceholder: 'Nome da pasta',
    newFolderNameLabel: 'Nome da nova pasta',
    alreadyExistsBefore: '',
    alreadyExistsAfter: ' já existe nesta pasta: o novo arquivo será adicionado como uma nova versão dele.',
    add: 'Adicionar',
    adding: 'Adicionando…'
  },

  versions: {
    whichVersion: 'Qual versão?',
    downloadTitle: 'Baixar esta versão para a sua pasta Downloads',
    diffVsPrevious: 'Comparar com a anterior',
    comparing: (from, to) => `Comparando v${from} → v${to}`,
    loadingDiff: 'Carregando diferenças…',
    binaryChanged: 'Arquivo binário: o conteúdo mudou.',
    size: (from, to, delta) => `Tamanho: ${from} → ${to} (${delta})`,
    deleteTitle: 'Excluir esta versão',
    deleteConfirmTitle: (label) => `Excluir ${label}?`,
    deleteConfirmMessage:
      'Esta versão será removida do histórico do arquivo para sempre. As outras versões e o arquivo continuam.'
  },

  openFile: {
    downloadInterrupted: 'O download foi interrompido.',
    couldNotOpen: (filename, error) =>
      `"${filename}" foi baixado, mas não foi possível abri-lo automaticamente (${error}).\n\n` +
      'Você pode abri-lo nos downloads do Chrome (Ctrl+J / Cmd+Shift+J). ' +
      'Dica: clique com o botão direito em um download e escolha "Sempre abrir arquivos deste tipo" para que ' +
      'isso aconteça automaticamente daqui em diante.'
  },

  backup: {
    courseNotFound: 'Curso não encontrado.',
    invalid: (reason) => `Não é um backup válido do Moodle Archive (${reason}).`,
    notZip: 'não é um arquivo zip',
    missingManifest: 'data.json está faltando',
    invalidJson: 'data.json não é um JSON válido',
    noCourses: 'data.json não descreve cursos'
  },

  viewer: {
    notFoundTitle: 'Arquivo não encontrado',
    notFoundText: 'Este arquivo não está mais no seu histórico do Moodle Archive; ele pode ter sido excluído.',
    cannotPreview: 'Este tipo de arquivo não pode ser visualizado no navegador.'
  },

  popup: {
    cannotScan: 'Esta página não pode ser analisada: abra primeiro uma aba de curso do Moodle.',
    filesDownloaded: (count) => `${count} arquivo(s) baixado(s)`,
    downloading: 'Baixando...',
    download: 'Baixar',
    history: 'Histórico',
    addToQueue: 'Adicionar à fila',
    queued: (position) => `Na fila (nº ${position})`,
    queueTitle: 'A seguir',
    removeFromQueue: 'Remover da fila'
  },

  download: {
    unsupportedUrl: (url) => `URL não suportada: ${url}.`,
    processingLinks: 'Processando links...',
    processing: (url) => `Processando ${url}`,
    downloadingFiles: 'Baixando arquivos...',
    downloadingFile: (name) => `Baixando ${name}`,
    cancelled: (name, reason) =>
      `Download cancelado: não foi possível baixar "${name}" (${reason}). Nada foi salvo; tente novamente.`,
    downloadFailed: 'o download falhou',
    noResponse: 'Tempo esgotado aguardando uma resposta',
    stalled: 'Travado: nenhum dado recebido a tempo',
    noFileFound: 'Nenhum arquivo encontrado.',
    saving: 'Salvando no histórico...',
    savingChunk: (index, total) => `Salvando no histórico... (${index}/${total})`,
    saved: 'Salvo no histórico.',
    saveFailed: (reason) => `Não foi possível salvar no histórico: ${reason}`,
    timedOut: 'tempo esgotado aguardando uma resposta; tente novamente',
    unknownError: 'erro desconhecido',
    interrupted: 'Download interrompido: a aba foi fechada ou mudou de página.',
    couldNotStart: (title) => `Não foi possível iniciar "${title}": abra a aba dele e tente novamente.`
  }
};
