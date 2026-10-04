import { useEffect, useState } from 'react';
import { formatDateTime } from '../../lib/dateFormat';
import { deleteVersion, versionStore } from '../../lib/db';
import { datedFilename } from '../../lib/fileKind';
import { downloadNameFor } from '../../lib/downloadNameSettings';
import { downloadVersion } from '../../lib/openFile';
import type { VersionRecord } from '../../types';
import { useDateFormat } from '../hooks/useDateFormat';
import { DeleteVersionButton } from './DeleteVersionButton';
import { DiffView } from './DiffView';
import { useT } from '../hooks/useTranslation';

export function VersionTimeline({
  fileId,
  courseId,
  filename,
  onVersionDeleted
}: {
  fileId: string;
  courseId: string;
  filename: string;
  /** Called after one of the versions was deleted from here. */
  onVersionDeleted?: () => void;
}) {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [comparing, setComparing] = useState<[VersionRecord, VersionRecord] | null>(null);
  const [dateFormatPref] = useDateFormat();
  const t = useT();

  useEffect(() => {
    void versionStore.byFile(fileId).then(setVersions);
  }, [fileId]);

  async function handleDelete(version: VersionRecord): Promise<void> {
    await deleteVersion(version);
    setVersions(await versionStore.byFile(fileId));
    if (comparing?.some((v) => v.id === version.id)) setComparing(null);
    onVersionDeleted?.();
  }

  return (
    <div className="version-timeline">
      <ul>
        {versions.map((version, i) => {
          const previous = versions[i - 1];
          const isLatest = i === versions.length - 1;
          return (
            <li key={version.id} className="version-row">
              <span className="version-index">v{i + 1}</span>
              <span className="version-date">{formatDateTime(version.timestamp, dateFormatPref)}</span>
              <span className="version-size">{version.size.toLocaleString()} B</span>
              <span className="version-hash">{version.sha256.slice(0, 10)}</span>
              <button
                className="secondary"
                title={t.versions.downloadTitle}
                onClick={() =>
                  void downloadNameFor(
                    courseId,
                    isLatest ? filename : datedFilename(filename, version.timestamp)
                  ).then((name) => downloadVersion(version.content, name))
                }
              >
                {t.common.download}
              </button>
              {previous && (
                <button className="secondary" onClick={() => setComparing([previous, version])}>
                  {t.versions.diffVsPrevious}
                </button>
              )}
              {/* The latest version can't be deleted — see db.deleteVersion. */}
              {!isLatest && <DeleteVersionButton version={version} label={`v${i + 1}`} onDelete={handleDelete} />}
            </li>
          );
        })}
      </ul>

      {comparing && (
        <div className="diff-panel">
          <div className="diff-panel-header">
            <span>
              {t.versions.comparing(
                versions.findIndex((v) => v.id === comparing[0].id) + 1,
                versions.findIndex((v) => v.id === comparing[1].id) + 1
              )}
            </span>
            <button className="secondary" onClick={() => setComparing(null)}>
              {t.common.close}
            </button>
          </div>
          <DiffView oldVersion={comparing[0]} newVersion={comparing[1]} />
        </div>
      )}
    </div>
  );
}
