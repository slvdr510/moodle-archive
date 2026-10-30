import { useEffect, useRef, useState } from 'react';
import type { FileDownloadProgress } from '../content/moodleCrawler';
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

// How far back each speed looks. Bytes don't arrive evenly: while a piece of a file is
// handed over none are read, and then the ones waiting come in at once, so over a
// fraction of a second the speed swung between nearly 0 and tens of MB/s.
const SPEED_WINDOW_MS = 2000;

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
  // Of each file coming down side by side, by its slot (see DownloadState.activeFiles).
  const [speeds, setSpeeds] = useState<(number | undefined)[]>([]);
  const [shaking, setShaking] = useState(false);

  // Speeds are derived from each slot's recent 'download-bytes' samples rather than
  // kept in state, so re-renders aren't needed just to track the samples.
  const samplesRef = useRef(new Map<number, { bytes: number; time: number }[]>());
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

  const { status, downloadCount, progress, current, queue, activeFiles } = downloadState;
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
    setSpeeds([]);
    samplesRef.current.clear();
  }, [isProcessing, current?.tabId]);

  useEffect(() => {
    function onMessage(message: unknown, sender: chrome.runtime.MessageSender): void {
      if (typeof message !== 'object' || message === null) return;
      const { topic, payload } = message as { topic?: string; payload?: unknown };
      if (topic === 'download-bytes') {
        const { slot, current, time } = payload as FileDownloadProgress;
        const samples = samplesRef.current.get(slot) ?? [];
        samplesRef.current.set(slot, samples);
        // `current` only ever climbs (it's cumulative across all of the slot's files,
        // not reset per file), so a brief connection-setup gap between files just
        // shows up as a lower reading over that interval — never a hard jump to
        // 0 — while a real stall still reads as genuinely close to 0. It only drops
        // when a file is tried again from its start: count from there.
        if (samples.length > 0 && current < samples[samples.length - 1].bytes) {
          samples.length = 0;
          setSpeeds((previous) => Object.assign([...previous], { [slot]: undefined }));
        }
        samples.push({ bytes: current, time });
        // The oldest sample kept is the last one at least SPEED_WINDOW_MS old.
        while (samples.length > 2 && time - samples[1].time >= SPEED_WINDOW_MS) samples.shift();
        const first = samples[0];
        if (time > first.time) {
          const speed = (current - first.bytes) / ((time - first.time) / 1000);
          setSpeeds((previous) => Object.assign([...previous], { [slot]: speed }));
        }
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

          {/* Each file coming down, with its own speed: they come down side by side. */}
          {isProcessing &&
            activeFiles?.map(
              (file, slot) =>
                file && (
                  <p key={slot} className="popup-file">
                    <span title={file.name}>{file.name}</span>
                    <span className="popup-speed">
                      {file.retrying
                        ? t.popup.retrying
                        : speeds[slot] !== undefined
                          ? `${formatBytes(Math.round(speeds[slot]))}/s`
                          : ''}
                    </span>
                  </p>
                )
            )}

          {isProcessing && downloadCount > 0 && (
            <p className="popup-count">
              <span>{t.popup.filesDownloaded(downloadCount)}</span>
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
