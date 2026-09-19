import type { FileStatus } from '../../types';

export const STATUS_LABEL: Record<FileStatus, string> = {
  new: 'New',
  modified: 'Modified',
  deleted: 'Deleted',
  unchanged: 'Unchanged'
};

export function StatusBadge({ status }: { status: FileStatus }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function StatusBadges({ statuses }: { statuses: FileStatus[] }) {
  if (statuses.length === 0) return null;
  return (
    <span className="status-badges">
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </span>
  );
}
