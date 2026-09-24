import { useEffect, useRef, useState } from 'react';
import { formatBytes } from '../lib/bytes';
import { openDashboard } from '../lib/dashboardTab';
import {
  INITIAL_DOWNLOAD_STATE,
  onDownloadStateChanged,
  readDownloadState,
  writeDownloadState,
  type DownloadState
} from '../lib/downloadState';

interface FileDownloadProgress {
  /** Cumulative bytes downloaded so far across the whole course — never reset
   *  between files, so a speed reading derived from it never has to fake a
   *  per-file restart (see moodleCrawler.ts). */
  current: number;
}

export function App() {
  // Mirrored by the background from the content script's messages, so it's still
  // accurate when the popup is re-opened mid-download (see lib/downloadState.ts).
  const [downloadState, setDownloadState] = useState<DownloadState>(INITIAL_DOWNLOAD_STATE);
  // Set only when the downloader couldn't even be injected, so it never reaches the
  // background's state.
  const [injectionError, setInjectionError] = useState<string | undefined>(undefined);
  const [speedBps, setSpeedBps] = useState<number | undefined>(undefined);
  const [shaking, setShaking] = useState(false);

  // Speed is derived from consecutive 'download-bytes' samples rather than kept in
  // state, so re-renders aren't needed just to track the previous sample.
  const lastSampleRef = useRef<{ bytes: number; time: number } | null>(null);

  useEffect(() => {
    // Subscribe before reading, so a change landing in between isn't missed. A stale
    // read can still overwrite a newer change, but only by one update's worth.
    const unsubscribe = onDownloadStateChanged(setDownloadState);
    void readDownloadState().then(setDownloadState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    function onMessage(message: unknown): void {
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
      if (topic === 'no-download') setShaking(true);
    }
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, []);

  async function handleDownload(): Promise<void> {
    setInjectionError(undefined);
    setSpeedBps(undefined);
    lastSampleRef.current = null;
    setShaking(false);
    await writeDownloadState(INITIAL_DOWNLOAD_STATE);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id === undefined) {
      setShaking(true);
      return;
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/main.js']
      });
    } catch (err) {
      // Injection itself failed — e.g. a chrome:// page, the Web Store, or a PDF
      // viewer tab, none of which can ever host a Moodle course.
      console.error('Could not run the downloader on this tab:', err);
      setInjectionError('This page cannot be scanned — open a Moodle course tab first.');
      setShaking(true);
    }
  }

  const { status, downloadCount, progress } = downloadState;
  const statusLog = injectionError ?? downloadState.statusLog;
  const isProcessing = status === 'processing';

  return (
    <div className="popup">
      <header className="popup-header">
        <span className="popup-logo" aria-hidden="true">
          🎓
        </span>
        <h1>Moodle Archive</h1>
        <a
          className="popup-credit"
          href="https://github.com/slvdr510/moodle-archive"
          target="_blank"
          rel="noopener noreferrer"
        >
          by slvdr510
        </a>
      </header>

      {(status !== 'initialized' || injectionError) && (statusLog || isProcessing) && (
        <div className="popup-body">
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
              <span>{Math.max(downloadCount, 1)} file(s) downloaded</span>
              <span className="popup-speed">{speedBps !== undefined ? `${formatBytes(Math.round(speedBps))}/s` : ''}</span>
            </p>
          )}
        </div>
      )}

      <div className="popup-actions">
        <button
          className={`popup-download${shaking ? ' shake' : ''}`}
          onClick={() => void handleDownload()}
          onAnimationEnd={() => setShaking(false)}
          disabled={isProcessing}
        >
          {isProcessing ? 'Wait a moment here, please' : 'Download'}
        </button>
        <button className="secondary popup-history" onClick={() => void openDashboard()}>
          History
        </button>
      </div>

      {isProcessing && (
        <p className="popup-notice">
          You can close this popup —
          <br />
          the download keeps running.
        </p>
      )}
    </div>
  );
}
