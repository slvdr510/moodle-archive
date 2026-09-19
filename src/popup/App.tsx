import { useEffect, useRef, useState } from 'react';
import { formatBytes } from '../lib/bytes';
import { openOrFocusDashboard } from '../lib/dashboardTab';
import type { Status } from '../content/main';

interface DownloadProgress {
  current: number;
  total: number;
}

interface FileDownloadProgress {
  /** Cumulative bytes downloaded so far across the whole course — never reset
   *  between files, so a speed reading derived from it never has to fake a
   *  per-file restart (see moodleCrawler.ts). */
  current: number;
}

export function App() {
  const [status, setStatus] = useState<Status>('initialized');
  const [statusLog, setStatusLog] = useState<string | undefined>(undefined);
  const [downloadCount, setDownloadCount] = useState(0);
  const [progress, setProgress] = useState<DownloadProgress | undefined>(undefined);
  const [speedBps, setSpeedBps] = useState<number | undefined>(undefined);
  const [shaking, setShaking] = useState(false);

  // Speed is derived from consecutive 'download-bytes' samples rather than kept in
  // state, so re-renders aren't needed just to track the previous sample.
  const lastSampleRef = useRef<{ bytes: number; time: number } | null>(null);

  useEffect(() => {
    function onMessage(message: unknown): void {
      if (typeof message !== 'object' || message === null) return;
      const { topic, payload } = message as { topic?: string; payload?: unknown };
      if (topic === 'status') setStatus(payload as Status);
      if (topic === 'status-log') setStatusLog(payload as string);
      if (topic === 'downloaded') setDownloadCount((c) => c + 1);
      if (topic === 'download-progress') setProgress(payload as DownloadProgress);
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
    setStatusLog(undefined);
    setDownloadCount(0);
    setProgress(undefined);
    setSpeedBps(undefined);
    lastSampleRef.current = null;
    setShaking(false);

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
      setStatusLog('This page cannot be scanned — open a Moodle course tab first.');
      setShaking(true);
    }
  }

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

      {status !== 'initialized' && (statusLog || isProcessing) && (
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
        <button className="secondary popup-history" onClick={() => void openOrFocusDashboard()}>
          History
        </button>
      </div>

      {isProcessing && (
        <p className="popup-notice">
          Don't click anywhere else
          <br />
          until download finishes.
        </p>
      )}
    </div>
  );
}
