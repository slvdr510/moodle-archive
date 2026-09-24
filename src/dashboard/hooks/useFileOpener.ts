import { useEffect, useState } from 'react';
import { recentOpenStore, versionStore } from '../../lib/db';
import { openVersionInBrowser } from '../../lib/openFile';
import type { FileRecord, VersionRecord } from '../../types';

/**
 * Loads a file's versions and exposes the "click to open" behavior shared by
 * FileRow, search results, and the recently-opened list: a single version
 * opens directly, multiple versions surface a picker. Every successful open
 * is recorded to the course's recent-opens list.
 */
export function useFileOpener(file: FileRecord, onOpened?: () => void) {
  const [versions, setVersions] = useState<VersionRecord[] | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    void versionStore.byFile(file.id).then(setVersions);
  }, [file.id]);

  async function open(version: VersionRecord): Promise<void> {
    await openVersionInBrowser(version.content, file.filename, version.id);
    await recentOpenStore.recordOpen({
      id: `${file.courseId}::${file.id}`,
      courseId: file.courseId,
      fileId: file.id,
      relativePath: file.relativePath,
      filename: file.filename,
      openedAt: Date.now()
    });
    onOpened?.();
  }

  function handleClick(): void {
    if (!versions || versions.length === 0) return;
    if (versions.length === 1) {
      void open(versions[0]);
    } else {
      setShowPicker(true);
    }
  }

  function selectVersion(version: VersionRecord): void {
    setShowPicker(false);
    void open(version);
  }

  return {
    versions,
    latestVersion: versions?.at(-1),
    handleClick,
    showPicker,
    closePicker: () => setShowPicker(false),
    selectVersion
  };
}
