import JSZip from 'jszip';
import { versionStore } from './db';
import type { FileRecord } from '../types';

/**
 * Zips the latest version of every given file, keeping the folder structure below
 * `folderPath`, all inside one top-level folder called `folderName` (so unzipping
 * never scatters files into whatever directory it's extracted in). Files with no
 * saved version are skipped.
 */
export async function buildFolderZip(folderName: string, folderPath: string, files: FileRecord[]): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder(folderName)!;
  const prefix = `${folderPath}/`;

  for (const file of files) {
    const latest = (await versionStore.byFile(file.id)).at(-1);
    if (!latest) continue;
    const inside = file.relativePath.startsWith(prefix) ? file.relativePath.slice(prefix.length) : file.filename;
    root.file(inside, latest.content);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
