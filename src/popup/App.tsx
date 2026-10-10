import { useEffect, useRef, useState } from 'react';
import { formatBytes } from '../lib/bytes';
import { openDashboard } from '../lib/dashboardTab';
import { useT } from '../dashboard/hooks/useTranslation';
import {
  INITIAL_DOWNLOAD_STATE,
  downloadKey,
  findDownload,
  onDownloadStateChanged,
  readDownloadState,
  type DownloadRequestMessage,
  type DownloadState,
  type RequestDownloadResponse
} from '../lib/downloadState';

interface FileDownloadProgress {
  /** Cumulative bytes downloaded so far across the whole course — never reset
   *  between files, so a speed reading derived from it never has to fake a
   *  per-file restart (see moodleCrawler.ts). */
  current: number;
}

function sendToBackground(message: DownloadRequestMessage): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

export function App() {
  const t = useT();
  // Kept by the background, which runs the downloads and their queue, so it's still
  // accurate when the popup is re-opened mid-download (see lib/downloadState.ts).
  const [downloadState, setDownloadState] = useState<DownloadState>(INITIAL_DOWNLOAD_STATE);
  // The tab this popup was opened on: what its Download button downloads.
  const [activeTab, setActiveTab] = useState<{ id: number; key: string } | null>(null);
  // From the click until the background has taken the request, so a second click in
  // between can't send it again.
  const [requesting, setRequesting] = useState(false);
  // A finished result already shown in an earlier popup isn't repeated.
  const [hideFinished, setHideFinished] = useState(false);
  // Set only when the downloader couldn't even be injected, so it never reaches the
  // background's state.
  const [injectionError, setInjectionError] = useState<string | undefined>(undefined);
  const [speedBps, setSpeedBps] = useState<number | undefined>(undefined);
  const [shaking, setShaking] = useState(false);

  // Speed is derived from consecutive 'download-bytes' samples rather than kept in
  // state, so re-renders aren't needed just to track the previous sample.
  const lastSampleRef = useRef<{ bytes: number; time: number } | null>(null);
  const activeTabIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Subscribe before reading, so a change landing in between isn't missed. A stale
    // read can still overwrite a newer change, but only by one update's worth.
    const unsubscribe = onDownloadStateChanged(setDownloadState);
    void readDownloadState().then((state) => {
      if (state.status === 'finished' && state.finishedSeen) setHideFinished(true);
      setDownloadState(state);
    });
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id === undefined) return;
      activeTabIdRef.current = tab.id;
      setActiveTab({ id: tab.id, key: downloadKey(tab.url ?? '') });
    });
    return unsubscribe;
  }, []);

  const { status, downloadCount, progress, current, queue } = downloadState;
  const isProcessing = status === 'processing';

  // Marks the finished result as seen while it's on screen. Display doesn't depend
  // on the flag, so it stays visible until this popup closes.
  useEffect(() => {
    if (status === 'finished' && !downloadState.finishedSeen && !hideFinished) {
      void sendToBackground({ topic: 'download-result-seen' });
    }
  }, [status, downloadState.finishedSeen, hideFinished]);

  // A new download starting (e.g. the next one in the queue) shows from scratch.
  useEffect(() => {
    if (!isProcessing) return;
    setHideFinished(false);
    setSpeedBps(undefined);
    lastSampleRef.current = null;
  }, [isProcessing, current?.tabId]);

  useEffect(() => {
    function onMessage(message: unknown, sender: chrome.runtime.MessageSender): void {
      if (typeof message !== 'object' || message === null) return;
      const { topic, payload } = message as { topic?: string; payload?: unknown };
      if (topic === 'download-bytes') {
        const { current } = payload as FileDownloadProgress;
        const now = performance.now();
        const last = lastSampleRef.current;
        // `current` only ever climbs (it's cumulative across the whole course, not
        // reset per file), so a brief connection-setup gap between files just
        // shows up as a lower reading over that interval — never a hard jump to
        // 0 — while a real stall still reads as genuinely close to 0.
        if (last && current >= last.bytes) {
          const elapsedSeconds = (now - last.time) / 1000;
          if (elapsedSeconds > 0) setSpeedBps((current - last.bytes) / elapsedSeconds);
        }
        lastSampleRef.current = { bytes: current, time: now };
      }
      // Only this tab's own download failing to find anything shakes its button —
      // not a queued download running in some other tab.
      if (topic === 'no-download' && sender.tab?.id === activeTabIdRef.current) setShaking(true);
    }
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, []);

  async function handleDownload(): Promise<void> {
    setInjectionError(undefined);
    setShaking(false);
    if (!activeTab) {
      setShaking(true);
      return;
    }

    setRequesting(true);
    try {
      const response = (await sendToBackground({
        topic: 'request-download',
        payload: { tabId: activeTab.id }
      })) as RequestDownloadResponse | undefined;
      if (!response?.ok) {
        setInjectionError(t.popup.cannotScan);
        setShaking(true);
        return;
      }
      // The state already says it's running or queued, so the button stays disabled.
      setDownloadState(await readDownloadState());
    } finally {
      setRequesting(false);
    }
  }

  const place = activeTab ? findDownload(downloadState, activeTab.id, activeTab.key) : { kind: 'none' as const };
  const showFinished = status === 'finished' && !hideFinished;
  const statusLog = downloadState.statusLog;

  let buttonLabel = t.popup.download;
  if (place.kind === 'current') buttonLabel = t.popup.downloading;
  else if (place.kind === 'queued') buttonLabel = t.popup.queued(place.position);
  else if (isProcessing) buttonLabel = t.popup.addToQueue;

  return (
    <div className="popup">
      <header className="popup-header">
        <span className="popup-logo" aria-hidden="true">
          🎓
        </span>
        <h1>{t.common.appName}</h1>
        <a
          className="popup-credit"
          href="https://github.com/slvdr510/moodle-archive"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.common.byAuthor}
        </a>
      </header>

      {(isProcessing || showFinished) && (statusLog || isProcessing) && (
        <div className="popup-body">
          {current && (
            <p className="popup-course" title={current.title}>
              {current.title}
            </p>
          )}

          <p className={`popup-status${!isProcessing ? ' popup-status-done' : ''}`}>{statusLog}</p>

          {isProcessing && progress && progress.total > 0 && (
            <progress className="popup-progress" value={progress.current} max={progress.total} />
          )}

          {isProcessing && (downloadCount > 0 || speedBps !== undefined) && (
            <p className="popup-count">
              {/* Bytes start flowing for file #1 before it's actually finished (and only
                  then does downloadCount tick up from 0) — showing "0 file(s)" or nothing
                  in that window looked broken next to an already-moving speed, so floor
                  it at 1 for as long as this row is visible at all. */}
              <span>{t.popup.filesDownloaded(Math.max(downloadCount, 1))}</span>
              <span className="popup-speed">{speedBps !== undefined ? `${formatBytes(Math.round(speedBps))}/s` : ''}</span>
            </p>
          )}
        </div>
      )}

      {queue.length > 0 && (
        <div className="popup-queue">
          <p className="popup-queue-title">{t.popup.queueTitle}</p>
          <ol>
            {queue.map((queued) => (
              <li key={queued.tabId}>
                <span className="popup-queue-name" title={queued.title}>
                  {queued.title}
                </span>
                <button
                  type="button"
                  className="popup-queue-remove"
                  title={t.popup.removeFromQueue}
                  aria-label={t.popup.removeFromQueue}
                  onClick={() => void sendToBackground({ topic: 'remove-queued-download', payload: { tabId: queued.tabId } })}
                >
                  ×
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* This tab couldn't be downloaded (or queued). Said on its own line, below
          whatever download is already running — which carries on, and stays shown. */}
      {injectionError && (
        <p className="popup-error" role="alert">
          {injectionError}
        </p>
      )}

      <div className="popup-actions">
        <button
          className={`popup-download${shaking ? ' shake' : ''}`}
          onClick={() => void handleDownload()}
          onAnimationEnd={() => setShaking(false)}
          disabled={requesting || place.kind !== 'none'}
        >
          {buttonLabel}
        </button>
        <button className="secondary popup-history" onClick={() => void openDashboard()}>
          {t.popup.history}
        </button>
      </div>
    </div>
  );
}
