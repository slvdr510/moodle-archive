import { describe, expect, it } from 'vitest';
import {
  INITIAL_DOWNLOAD_STATE,
  downloadKey,
  findDownload,
  finishCurrent,
  removeFromQueue,
  requestDownload,
  startNext,
  tabGone,
  type QueuedDownload
} from '../src/lib/downloadState';

const course = (tabId: number, id: number): QueuedDownload => ({
  tabId,
  key: downloadKey(`https://moodle.example/course/view.php?id=${id}`),
  title: `Course ${id}`
});

describe('download queue', () => {
  it('identifies a download by its course, whatever the section or anchor', () => {
    expect(downloadKey('https://moodle.example/course/view.php?id=7&section=2#top')).toBe(
      'https://moodle.example/course/view.php?id=7'
    );
    expect(downloadKey('https://example.com/page#a')).toBe('https://example.com/page');
  });

  it('starts a download when nothing runs, and queues the next ones behind it', () => {
    const first = requestDownload(INITIAL_DOWNLOAD_STATE, course(1, 10));
    expect(first.outcome).toBe('started');
    expect(first.state.status).toBe('processing');
    expect(first.state.current?.tabId).toBe(1);

    const second = requestDownload(first.state, course(2, 20));
    expect(second.outcome).toBe('queued');
    const third = requestDownload(second.state, course(3, 30));
    expect(third.state.queue.map((d) => d.tabId)).toEqual([2, 3]);
    expect(findDownload(third.state, 3, course(3, 30).key)).toEqual({ kind: 'queued', position: 2 });
  });

  it('refuses a course that is already downloading or queued, even from another tab', () => {
    const running = requestDownload(INITIAL_DOWNLOAD_STATE, course(1, 10)).state;
    expect(requestDownload(running, course(1, 10)).outcome).toBe('duplicate');
    expect(requestDownload(running, course(5, 10)).outcome).toBe('duplicate'); // same course, other tab
    expect(findDownload(running, 5, course(5, 10).key)).toEqual({ kind: 'current' });

    const queued = requestDownload(running, course(2, 20)).state;
    expect(requestDownload(queued, course(6, 20)).outcome).toBe('duplicate');
  });

  it('starts the next queued download once the running one finishes', () => {
    let state = requestDownload(INITIAL_DOWNLOAD_STATE, course(1, 10)).state;
    state = requestDownload(state, course(2, 20)).state;
    expect(startNext(state)).toBeUndefined(); // still running

    state = finishCurrent(state, 'Saved to history.');
    expect(state.status).toBe('finished');
    const next = startNext(state);
    expect(next?.download.tabId).toBe(2);
    expect(next?.state.status).toBe('processing');
    expect(next?.state.queue).toEqual([]);
    expect(startNext(finishCurrent(next!.state))).toBeUndefined();
  });

  it('interrupts the running download when its tab goes, and drops a queued tab that goes', () => {
    let state = requestDownload(INITIAL_DOWNLOAD_STATE, course(1, 10)).state;
    state = requestDownload(state, course(2, 20)).state;
    state = requestDownload(state, course(3, 30)).state;

    state = tabGone(state, 3, 'interrupted');
    expect(state.status).toBe('processing');
    expect(state.queue.map((d) => d.tabId)).toEqual([2]);

    state = tabGone(state, 1, 'interrupted');
    expect(state.status).toBe('finished');
    expect(state.statusLog).toBe('interrupted');
    expect(startNext(state)?.download.tabId).toBe(2);
  });

  it('removes a download from the queue on request', () => {
    let state = requestDownload(INITIAL_DOWNLOAD_STATE, course(1, 10)).state;
    state = requestDownload(state, course(2, 20)).state;
    expect(removeFromQueue(state, 2).queue).toEqual([]);
  });
});
