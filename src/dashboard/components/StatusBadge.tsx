import type { FileStatus } from '../../types';
import { useT } from '../hooks/useTranslation';

export function StatusBadge({ status }: { status: FileStatus }) {
  const t = useT();
  return <span className={`status-badge status-${status}`}>{t.status[status]}</span>;
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
