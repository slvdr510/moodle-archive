import { createContext, useContext } from 'react';
import type { IgnoreState } from '../../lib/ignoredFiles';
import type { FileRecord } from '../../types';

/** Lets each file and folder row in a course's tree show and toggle "Ignore changes"
 *  without threading it through every FolderRow. Provided by CourseFilesPage;
 *  outside it (no course loaded) nothing is ignored and rows offer no toggle. */
export interface IgnoredFiles {
  fileState: (file: FileRecord) => IgnoreState;
  toggleFile: (file: FileRecord) => void;
  /** `folderPath` being the folder's real path (FolderTreeNode.path). */
  folderState: (folderPath: string) => IgnoreState;
  toggleFolder: (folderPath: string) => void;
}

export const IgnoredFilesContext = createContext<IgnoredFiles | null>(null);

export function useIgnoredFiles(): IgnoredFiles | null {
  return useContext(IgnoredFilesContext);
}
