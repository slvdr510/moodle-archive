import { useEffect, useState } from 'react';
import { diffMetadataOnly, diffText, isProbablyText } from '../../lib/textDiff';
import type { Change } from 'diff';
import type { VersionRecord } from '../../types';

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'text'; changes: Change[] }
  | { kind: 'binary'; oldSize: number; newSize: number };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DiffView({ oldVersion, newVersion }: { oldVersion: VersionRecord; newVersion: VersionRecord }) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    setState({ kind: 'loading' });
    void (async () => {
      try {
        const [oldBytes, newBytes] = await Promise.all([
          oldVersion.content.arrayBuffer().then((b) => new Uint8Array(b)),
          newVersion.content.arrayBuffer().then((b) => new Uint8Array(b))
        ]);

        if (isProbablyText(oldBytes) && isProbablyText(newBytes)) {
          setState({ kind: 'text', changes: diffText(oldBytes, newBytes).changes });
        } else {
          const meta = diffMetadataOnly(oldBytes, newBytes);
          setState({ kind: 'binary', oldSize: meta.oldSize, newSize: meta.newSize });
        }
      } catch (err) {
        setState({ kind: 'error', message: String(err) });
      }
    })();
  }, [oldVersion.content, newVersion.content]);

  if (state.kind === 'loading') return <p className="diff-status">Loading diff…</p>;
  if (state.kind === 'error') return <p className="diff-status error">{state.message}</p>;

  if (state.kind === 'binary') {
    const delta = state.newSize - state.oldSize;
    return (
      <div className="diff-binary">
        <p>Binary file — content changed.</p>
        <p>
          Size: {formatBytes(state.oldSize)} → {formatBytes(state.newSize)} (
          {delta >= 0 ? '+' : ''}
          {formatBytes(Math.abs(delta))})
        </p>
      </div>
    );
  }

  return (
    <pre className="diff-text">
      {state.changes.map((part, i) => (
        <span key={i} className={part.added ? 'diff-added' : part.removed ? 'diff-removed' : 'diff-same'}>
          {part.value}
        </span>
      ))}
    </pre>
  );
}
