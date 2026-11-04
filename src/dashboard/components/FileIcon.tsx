import { getExtension } from '../../lib/fileKind';

// The icons of the Material Icon Theme for VS Code (MIT, see icons/material/LICENSE):
// just those for the kinds of file a course has.
const ICONS = import.meta.glob<string>('../icons/material/*.svg', { eager: true, query: '?url', import: 'default' });

function iconUrl(name: string): string {
  return ICONS[`../icons/material/${name}.svg`];
}

// Which icon each extension gets: the theme's own choice (its src/core/icons/fileIcons.ts
// and languageIcons.ts), but for .m: a course's .m files are MATLAB's, not Objective-C's.
const ICON_BY_EXTENSION: Record<string, string> = {
  pdf: 'pdf',
  ...withIcon('image', ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tif', 'tiff', 'heic']),
  svg: 'svg',
  ...withIcon('table', ['xlsx', 'xls', 'xlsm', 'ods', 'csv']),
  ...withIcon('word', ['doc', 'docx', 'odt', 'rtf']),
  ...withIcon('powerpoint', ['ppt', 'pptx', 'odp']),
  txt: 'document',
  md: 'markdown',
  log: 'log',
  tex: 'tex',
  py: 'python',
  ipynb: 'jupyter',
  java: 'java',
  jar: 'jar',
  c: 'c',
  h: 'h',
  cpp: 'cpp',
  hpp: 'hpp',
  cs: 'csharp',
  js: 'javascript',
  ts: 'typescript',
  ...withIcon('html', ['html', 'htm']),
  css: 'css',
  json: 'json',
  xml: 'xml',
  sql: 'database',
  r: 'r',
  ...withIcon('matlab', ['m', 'mat', 'mlx']),
  ...withIcon('console', ['sh', 'bat', 'cmd']),
  ...withIcon('zip', ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'xz', 'deb']),
  ...withIcon('exe', ['exe', 'msi']),
  dmg: 'disc',
  apk: 'android',
  bin: 'hex',
  ...withIcon('video', ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'ogg']),
  ...withIcon('audio', ['mp3', 'wav', 'm4a', 'flac', 'aac'])
};

function withIcon(icon: string, extensions: string[]): Record<string, string> {
  return Object.fromEntries(extensions.map((extension) => [extension, icon]));
}

/** Which icon a file gets, from its extension: the theme's plain file for any other. */
export function fileIconName(filename: string): string {
  return ICON_BY_EXTENSION[getExtension(filename)] ?? 'file';
}

// Decorative: the name beside it already says what it is.
function Icon({ name }: { name: string }) {
  return <img className="file-icon" src={iconUrl(name)} alt="" draggable={false} />;
}

/** What kind of file it is, at the start of its row: a PDF, an image, a spreadsheet… */
export function FileIcon({ filename }: { filename: string }) {
  return <Icon name={fileIconName(filename)} />;
}

/** A folder, open while its contents are shown. */
export function FolderIcon({ open }: { open: boolean }) {
  return <Icon name={open ? 'folder-open' : 'folder'} />;
}
