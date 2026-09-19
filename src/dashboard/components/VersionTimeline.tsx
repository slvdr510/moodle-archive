import { useEffect, useState } from 'react';
import { formatDateTime } from '../../lib/dateFormat';
import { versionStore } from '../../lib/db';
import { datedFilename } from '../../lib/fileKind';
import { downloadVersion } from '../../lib/openFile';
import type { VersionRecord } from '../../types';
import { useDateFormat } from '../hooks/useDateFormat';
import { DiffView } from './DiffView';

export function VersionTimeline({ fileId, filename }: { fileId: string; filename: string }) {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [comparing, setComparing] = useState<[VersionRecord, VersionRecord] | null>(null);
  const [dateFormatPref] = useDateFormat();

  useEffect(() => {
    void versionStore.byFile(fileId).then(setVersions);
  }, [fileId]);

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
                title="Download this version to your Downloads folder"
                onClick={() =>
                  void downloadVersion(
                    version.content,
                    isLatest ? filename : datedFilename(filename, version.timestamp)
                  )
                }
              >
                Download
              </button>
              {previous && (
                <button className="secondary" onClick={() => setComparing([previous, version])}>
                  Diff vs previous
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {comparing && (
        <div className="diff-panel">
          <div className="diff-panel-header">
            <span>
              Comparing v
              {versions.findIndex((v) => v.id === comparing[0].id) + 1} → v
              {versions.findIndex((v) => v.id === comparing[1].id) + 1}
            </span>
            <button className="secondary" onClick={() => setComparing(null)}>
              Close
            </button>
          </div>
          <DiffView oldVersion={comparing[0]} newVersion={comparing[1]} />
        </div>
      )}
    </div>
  );
}
