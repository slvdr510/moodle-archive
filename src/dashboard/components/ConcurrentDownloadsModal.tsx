import { useEffect, useState } from 'react';
import { MAX_CONCURRENT_DOWNLOADS, getConcurrentDownloads, setConcurrentDownloads } from '../../lib/concurrentDownloads';
import { useT } from '../hooks/useTranslation';

const COUNTS = Array.from({ length: MAX_CONCURRENT_DOWNLOADS }, (_, i) => i + 1);

/** Global (every course) setting for how many files a download brings down at once. */
export function ConcurrentDownloadsModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  // None chosen until the stored one is read.
  const [count, setCount] = useState<number>();

  useEffect(() => {
    void getConcurrentDownloads().then((stored) => setCount((chosen) => chosen ?? stored));
  }, []);

  async function handleSave() {
    if (count !== undefined) await setConcurrentDownloads(count);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal concurrent-downloads-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t.concurrentDownloads.title}</h2>
        <p>{t.concurrentDownloads.description}</p>
        <div className="concurrent-downloads-options" role="radiogroup" aria-label={t.concurrentDownloads.title}>
          {COUNTS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={count === value}
              className={`concurrent-downloads-option${count === value ? ' active' : ''}`}
              onClick={() => setCount(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button disabled={count === undefined} onClick={() => void handleSave()}>
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
