// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DownloadCancelledError,
  SaveFailedError,
  crawlCourse,
  type CrawlOptions,
  type DownloadSlotFile
} from '../src/content/moodleCrawler';
import { stableSuffix } from '../src/content/util';
import type { IgnoreRules } from '../src/lib/ignoredFiles';

const MOODLE = 'https://moodle.test';
const COURSE_URL = `${MOODLE}/course/view.php?id=7`;
const ROOT = 'Sistemas_Operativos';

/** A small course: two files, two resources that share a name, and a folder. */
const PAGES: Record<string, string> = {
  [`${MOODLE}/course/resources.php?id=7`]: `
    <title>Sistemas Operativos</title>
    <div id="page"><div role="main">
      <a href="${MOODLE}/mod/resource/view.php?id=1">Tema 1</a>
      <a href="${MOODLE}/mod/resource/view.php?id=2">Grabacion</a>
      <a href="${MOODLE}/mod/folder/view.php?id=3">Videos</a>
      <a href="${MOODLE}/mod/resource/view.php?id=4">Apuntes</a>
      <a href="${MOODLE}/mod/resource/view.php?id=5">Apuntes</a>
    </div></div>`,
  [`${MOODLE}/mod/folder/view.php?id=3`]: `
    <div id="page"><div role="main">
      <a href="${MOODLE}/pluginfile.php/3/mod_folder/content/0/clase1.mp4">clase1.mp4</a>
    </div></div>`
};

/** Each file resource and the URL Moodle redirects it to. */
const FILES: Record<string, string> = {
  [`${MOODLE}/mod/resource/view.php?id=1`]: `${MOODLE}/pluginfile.php/1/mod_resource/content/1/Tema1.pdf`,
  [`${MOODLE}/mod/resource/view.php?id=2`]: `${MOODLE}/pluginfile.php/2/mod_resource/content/1/Grabacion.mp4`,
  [`${MOODLE}/mod/resource/view.php?id=4`]: `${MOODLE}/pluginfile.php/4/mod_resource/content/1/Apuntes.pdf`,
  [`${MOODLE}/mod/resource/view.php?id=5`]: `${MOODLE}/pluginfile.php/5/mod_resource/content/2/Apuntes.pdf`,
  [`${MOODLE}/pluginfile.php/3/mod_folder/content/0/clase1.mp4`]: `${MOODLE}/pluginfile.php/3/mod_folder/content/0/clase1.mp4`
};

const TEMA_1 = `${MOODLE}/mod/resource/view.php?id=1`;
const GRABACION = `${MOODLE}/mod/resource/view.php?id=2`;
const VIDEOS = `${MOODLE}/mod/folder/view.php?id=3`;

const DUPLICATE_SUFFIX = stableSuffix(`${MOODLE}/mod/resource/view.php?id=5`);
const ALL_PATHS = [
  `${ROOT}/Tema_1.pdf`,
  `${ROOT}/Grabacion.mp4`,
  `${ROOT}/Apuntes.pdf`,
  `${ROOT}/Apuntes_${DUPLICATE_SUFFIX}.pdf`,
  `${ROOT}/Videos/clase1.mp4`
];

const MiB = 1024 * 1024;
const NETWORK_CHUNK = 64 * 1024;

let fetched: string[];
let bodiesRead: string[];
let bodiesCancelled: string[];
let messages: { topic: string; payload: unknown }[];
/** Every piece handed over, by `${relativePath}#${index}` — a later one replacing an
 *  earlier one, as the background does. */
let staged: Map<string, Uint8Array>;
/** The order pieces were handed over in, as `${relativePath}#${index}`. */
let stagedOrder: string[];
/** Answers that replace the fake Moodle's own for a URL, given how many times it was
 *  fetched before. */
let respond: Map<string, (previousFetches: number, signal?: AbortSignal) => Response>;
/** Whether the Moodle session is over, sending a request off to log in elsewhere. */
let sessionOver: boolean;

function fileResponse(servedUrl: string): Response {
  let sent = false;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent) {
        bodiesRead.push(servedUrl);
        controller.close();
      } else {
        sent = true;
        controller.enqueue(new TextEncoder().encode(`content of ${servedUrl}`));
      }
    },
    cancel() {
      bodiesCancelled.push(servedUrl);
    }
  });
  return served(new Response(body, { headers: { 'content-type': 'application/octet-stream' } }), servedUrl);
}

/** `content`, coming down in network-sized chunks — cut off after `failAfter` bytes.
 *  `onSent` is told how much has come down so far. */
function streamedResponse(
  servedUrl: string,
  content: Uint8Array,
  failAfter?: number,
  onSent?: (bytes: number) => void
): Response {
  let offset = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (failAfter !== undefined && offset >= failAfter) {
        controller.error(new TypeError('network error'));
      } else if (offset >= content.length) {
        controller.close();
      } else {
        controller.enqueue(content.slice(offset, offset + NETWORK_CHUNK));
        offset += NETWORK_CHUNK;
        onSent?.(Math.min(offset, content.length));
      }
    }
  });
  return served(new Response(body, { headers: { 'content-type': 'application/octet-stream' } }), servedUrl);
}

function unavailable(): Response {
  return new Response('<html><body>Site under maintenance</body></html>', {
    status: 503,
    headers: { 'content-type': 'text/html' }
  });
}

function served(response: Response, servedUrl: string): Response {
  Object.defineProperty(response, 'url', { value: servedUrl });
  return response;
}

/** Bytes that differ from one place to the next, to tell pieces put back out of order. */
function patternBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) bytes[i] = i % 251;
  return bytes;
}

/** A file's content as handed over: its first `pieces` pieces, joined. */
function stagedContent(relativePath: string, pieces: number): Buffer {
  return Buffer.concat(Array.from({ length: pieces }, (_, i) => staged.get(`${relativePath}#${i}`)!));
}

const stage: CrawlOptions['stage'] = async (relativePath, index, piece) => {
  stagedOrder.push(`${relativePath}#${index}`);
  staged.set(`${relativePath}#${index}`, piece.slice());
};

beforeEach(() => {
  fetched = [];
  bodiesRead = [];
  bodiesCancelled = [];
  messages = [];
  staged = new Map();
  stagedOrder = [];
  respond = new Map();
  sessionOver = false;
  // jsdom has no innerText, which the crawler reads names from.
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    configurable: true,
    get(this: HTMLElement) {
      return this.textContent?.trim() ?? '';
    }
  });
  vi.stubGlobal('chrome', {
    runtime: { sendMessage: (message: { topic: string; payload: unknown }) => void messages.push(message) }
  });
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const previousFetches = fetched.filter((u) => u === url).length;
      fetched.push(url);
      if (init?.redirect === 'manual') return sessionOver ? ({ type: 'opaqueredirect' } as Response) : new Response('ok');
      const override = respond.get(url);
      if (override) return override(previousFetches, init?.signal ?? undefined);
      if (url in PAGES) return new Response(`<html><body>${PAGES[url]}</body></html>`, { headers: { 'content-type': 'text/html' } });
      if (url in FILES) return fileResponse(FILES[url]);
      return new Response('not found', { status: 404 });
    })
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as { innerText?: string }).innerText;
});

function crawl(ignoredPaths?: string[], stagePiece: CrawlOptions['stage'] = stage) {
  const rules: IgnoreRules | undefined = ignoredPaths && { ignoredPaths, rootPath: ROOT };
  return crawlCourse(COURSE_URL, { askIgnoreRules: async () => rules, stage: stagePiece });
}

/** `promise`, with fake time run forward until it settles — through the waits
 *  between tries. */
async function withTimeRunning<T>(promise: Promise<T>): Promise<T> {
  let settled = false;
  promise.then(
    () => (settled = true),
    () => (settled = true)
  );
  while (!settled) await vi.advanceTimersByTimeAsync(500);
  return promise;
}

describe('crawlCourse', () => {
  it('downloads every file when nothing is ignored', async () => {
    const result = await crawl();
    expect(result?.files.map((f) => f.relativePath).sort()).toEqual([...ALL_PATHS].sort());
    expect(result?.ignored).toBe(0);
  });

  it('asks which files are ignored with the course its snapshot will be saved to', async () => {
    const ask = vi.fn(async () => undefined);
    await crawlCourse(COURSE_URL, { askIgnoreRules: ask, stage });
    expect(ask).toHaveBeenCalledWith(COURSE_URL, 'Sistemas Operativos');
  });

  it('never requests the files in an ignored folder', async () => {
    const result = await crawl(['Videos/']);
    expect(fetched).not.toContain(`${MOODLE}/pluginfile.php/3/mod_folder/content/0/clase1.mp4`);
    expect(result?.files.map((f) => f.relativePath)).not.toContain(`${ROOT}/Videos/clase1.mp4`);
    expect(result?.ignored).toBe(1);
  });

  it("stops an ignored file's download once Moodle says what it's called", async () => {
    const served = FILES[GRABACION];
    const result = await crawl(['Grabacion.mp4']);
    expect(bodiesCancelled).toEqual([served]);
    expect(bodiesRead).not.toContain(served);
    expect(result?.files.map((f) => f.relativePath)).not.toContain(`${ROOT}/Grabacion.mp4`);
    expect(stagedOrder.some((key) => key.startsWith(`${ROOT}/Grabacion.mp4#`))).toBe(false);
    expect(messages.filter((m) => m.topic === 'downloaded')).toHaveLength(4);
    expect(result?.ignored).toBe(1);
  });

  it('names the other files the same whichever of them is ignored', async () => {
    // The first of the two "Apuntes" ignored: the second keeps its suffix.
    const result = await crawl(['Apuntes.pdf']);
    expect(result?.files.map((f) => f.relativePath).sort()).toEqual(
      ALL_PATHS.filter((path) => path !== `${ROOT}/Apuntes.pdf`).sort()
    );
  });

  it('tells a course with every file ignored from one with none found', async () => {
    const result = await crawl(ALL_PATHS.map((path) => path.slice(ROOT.length + 1)));
    expect(result?.files).toEqual([]);
    expect(result?.ignored).toBe(5);
    expect(messages.some((m) => m.topic === 'status-log' && String(m.payload).includes('No file'))).toBe(false);
  });
});

describe('crawlCourse handing files over', () => {
  it('hands each file over whole, as it downloads', async () => {
    const servedAt: Record<string, string> = {
      [ALL_PATHS[0]]: FILES[TEMA_1],
      [ALL_PATHS[1]]: FILES[GRABACION],
      [ALL_PATHS[2]]: FILES[`${MOODLE}/mod/resource/view.php?id=4`],
      [ALL_PATHS[3]]: FILES[`${MOODLE}/mod/resource/view.php?id=5`],
      [ALL_PATHS[4]]: FILES[`${MOODLE}/pluginfile.php/3/mod_folder/content/0/clase1.mp4`]
    };

    const result = await crawl();

    for (const file of result!.files) {
      const content = `content of ${servedAt[file.relativePath]}`;
      expect(file).toMatchObject({ pieces: 1, size: content.length });
      expect(stagedContent(file.relativePath, 1).toString()).toBe(content);
    }
  });

  it('hands a big file over in pieces, each small enough for one message', async () => {
    const content = patternBytes(20 * MiB);
    respond.set(GRABACION, () => streamedResponse(FILES[GRABACION], content));

    const result = await crawl();
    const file = result!.files.find((f) => f.relativePath === `${ROOT}/Grabacion.mp4`)!;

    expect(file.pieces).toBe(3);
    expect(file.size).toBe(content.length);
    for (let i = 0; i < file.pieces; i++) {
      // Chrome refuses a message over 64 MiB, and a piece goes base64-encoded (4/3 bigger).
      expect(staged.get(`${file.relativePath}#${i}`)!.length).toBeLessThanOrEqual(8 * MiB + NETWORK_CHUNK);
    }
    expect(stagedContent(file.relativePath, file.pieces).equals(content)).toBe(true);
  });

  it('keeps a big file coming down while its last piece is handed over', async () => {
    const content = patternBytes(20 * MiB);
    let nextPieceDown!: () => void;
    const nextPiece = new Promise<void>((resolve) => (nextPieceDown = resolve));
    respond.set(GRABACION, () =>
      streamedResponse(FILES[GRABACION], content, undefined, (sent) => {
        if (sent >= 16 * MiB) nextPieceDown();
      })
    );
    let cameDown: boolean | undefined;
    const slowStage: CrawlOptions['stage'] = async (relativePath, index, piece) => {
      // The first piece lands only once the second is down — never, if that waited for it.
      if (relativePath === `${ROOT}/Grabacion.mp4` && index === 0) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        cameDown = await Promise.race([
          nextPiece.then(() => true),
          new Promise<boolean>((resolve) => (timer = setTimeout(() => resolve(false), 2000)))
        ]);
        clearTimeout(timer);
      }
      return stage(relativePath, index, piece);
    };

    const result = await crawl(undefined, slowStage);
    const file = result!.files.find((f) => f.relativePath === `${ROOT}/Grabacion.mp4`)!;

    expect(cameDown).toBe(true);
    expect(stagedContent(file.relativePath, file.pieces).equals(content)).toBe(true);
  });

  it("hands a file's pieces over one at a time, in order", async () => {
    const content = patternBytes(20 * MiB);
    const path = `${ROOT}/Grabacion.mp4`;
    respond.set(GRABACION, () => streamedResponse(FILES[GRABACION], content));
    let handing = 0;
    let most = 0;
    const slowStage: CrawlOptions['stage'] = async (relativePath, index, piece) => {
      if (relativePath !== path) return stage(relativePath, index, piece);
      most = Math.max(most, ++handing);
      await new Promise((resolve) => setTimeout(resolve, 20));
      handing--;
      return stage(relativePath, index, piece);
    };

    await crawl(undefined, slowStage);

    expect(most).toBe(1);
    expect(stagedOrder.filter((key) => key.startsWith(`${path}#`))).toEqual([`${path}#0`, `${path}#1`, `${path}#2`]);
  });

  it('hands an empty file over as one empty piece', async () => {
    respond.set(TEMA_1, () => streamedResponse(FILES[TEMA_1], new Uint8Array(0)));

    const result = await crawl();
    const file = result!.files.find((f) => f.relativePath === `${ROOT}/Tema_1.pdf`)!;

    expect(file).toMatchObject({ pieces: 1, size: 0 });
    expect(staged.get(`${file.relativePath}#0`)).toEqual(new Uint8Array(0));
  });

  it('stops at once, without trying again, when a piece cannot be handed over', async () => {
    const failing: CrawlOptions['stage'] = async () => {
      throw new Error('QuotaExceededError');
    };

    await expect(crawl(undefined, failing)).rejects.toThrow(SaveFailedError);
    expect(fetched.filter((url) => url === TEMA_1)).toHaveLength(1);
  });
});

function loginPage(): Response {
  const response = new Response('<html><body><form id="login"><input name="username"></form></body></html>', {
    headers: { 'content-type': 'text/html' }
  });
  return served(response, `${MOODLE}/login/index.php`);
}

function errorPage(status: number): Response {
  return new Response('<html><body>Sorry, the requested file could not be found</body></html>', {
    status,
    headers: { 'content-type': 'text/html' }
  });
}

describe('crawlCourse when Moodle sends something other than the file', () => {
  it('cancels the download when Moodle asks to log in again, without trying again', async () => {
    respond.set(GRABACION, loginPage);

    const crawling = crawl();

    await expect(crawling).rejects.toThrow(DownloadCancelledError);
    await expect(crawling).rejects.toThrow('Moodle asked you to log in');
    expect(fetched.filter((url) => url === GRABACION)).toHaveLength(1);
    expect(stagedOrder.some((key) => key.includes('.php'))).toBe(false);
  });

  it("cancels the download when a folder's page turns out to be the login page", async () => {
    respond.set(VIDEOS, loginPage);

    await expect(crawl()).rejects.toThrow('Moodle asked you to log in');
  });

  it("leaves out a file Moodle no longer has or lets you have, instead of keeping its error page", async () => {
    respond.set(TEMA_1, () => served(errorPage(404), FILES[TEMA_1]));
    respond.set(GRABACION, () => errorPage(403));

    const result = await crawl();

    expect(result!.files.map((f) => f.relativePath).sort()).toEqual(
      ALL_PATHS.filter((path) => path !== `${ROOT}/Tema_1.pdf` && path !== `${ROOT}/Grabacion.mp4`).sort()
    );
    expect(stagedOrder.filter((key) => key.includes('Tema_1') || key.includes('Grabacion'))).toEqual([]);
    // Neither tried again, nor counted as ignored by the user.
    expect(fetched.filter((url) => url === TEMA_1 || url === GRABACION)).toHaveLength(2);
    expect(result!.ignored).toBe(0);
    expect(result!.unavailable).toBe(2);
  });
});

/** A file whose content only comes down once `held` resolves. */
function heldResponse(servedUrl: string, held: Promise<void>): Response {
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      await held;
      controller.enqueue(new TextEncoder().encode(`content of ${servedUrl}`));
      controller.close();
    }
  });
  return served(new Response(body, { headers: { 'content-type': 'application/octet-stream' } }), servedUrl);
}

/** A file that starts coming down and never finishes, until its request is cut off. */
function endlessResponse(servedUrl: string, signal: AbortSignal | undefined, onCutOff: () => void): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('the start of a long video'));
      signal?.addEventListener('abort', () => {
        onCutOff();
        controller.error(signal.reason);
      });
    }
  });
  return served(new Response(body, { headers: { 'content-type': 'application/octet-stream' } }), servedUrl);
}

/** How many files the popup was told were downloading at once, at most, and in which slots. */
function filesShownAtOnce(): { most: number; slots: Set<number>; left: (string | null)[] } {
  const shown: (string | null)[] = [];
  let most = 0;
  const slots = new Set<number>();
  for (const { topic, payload } of messages) {
    if (topic !== 'download-file') continue;
    const { slot, name } = payload as DownloadSlotFile;
    shown[slot] = name;
    slots.add(slot);
    most = Math.max(most, shown.filter(Boolean).length);
  }
  return { most, slots, left: shown };
}

describe('crawlCourse downloading files side by side', () => {
  it('brings down a second file while the first is still coming down, never more than two at once', async () => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    respond.set(TEMA_1, () => heldResponse(FILES[TEMA_1], held));

    const crawling = crawl();
    // Tema 1 is held back, and the other files come down meanwhile, one after another.
    await vi.waitFor(() => expect(staged.has(`${ROOT}/Videos/clase1.mp4#0`)).toBe(true));
    expect(staged.has(`${ROOT}/Tema_1.pdf#0`)).toBe(false);
    release();
    const result = await crawling;

    expect(result!.files.map((f) => f.relativePath)).toEqual(ALL_PATHS);
    expect(stagedContent(`${ROOT}/Tema_1.pdf`, 1).toString()).toBe(`content of ${FILES[TEMA_1]}`);
    const shown = filesShownAtOnce();
    expect(shown.most).toBe(2);
    expect([...shown.slots].sort()).toEqual([0, 1]);
    // Once done, the popup is told no file is downloading any more.
    expect(shown.left.filter(Boolean)).toEqual([]);
  });

  it.each([1, 3])('brings down as many files at once as the user chose (%i)', async (concurrentDownloads) => {
    // The first two files held back: the rest come down beside them, in the slots left.
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    for (const url of [TEMA_1, GRABACION]) respond.set(url, () => heldResponse(FILES[url], held));
    const crawling = crawlCourse(COURSE_URL, { stage, concurrentDownloads });

    await vi.waitFor(() => expect(filesShownAtOnce().most).toBe(concurrentDownloads));
    release();
    const result = await crawling;

    expect(result!.files.map((f) => f.relativePath)).toEqual(ALL_PATHS);
    const shown = filesShownAtOnce();
    expect(shown.most).toBe(concurrentDownloads);
    expect(Math.max(...shown.slots)).toBe(concurrentDownloads - 1);
  });

  it('reports each slot\'s bytes on their own, adding up across its files', async () => {
    await crawl();
    const bytes = messages.filter((m) => m.topic === 'download-bytes').map((m) => m.payload as { slot: number; current: number });
    for (const slot of [0, 1]) {
      const counts = bytes.filter((b) => b.slot === slot).map((b) => b.current);
      expect(counts).toEqual([...counts].sort((a, b) => a - b));
    }
  });
});

describe('crawlCourse trying again', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  it('tries a file again when the connection drops, handing it over again from its first piece', async () => {
    const content = patternBytes(20 * MiB);
    respond.set(GRABACION, (previousFetches) =>
      streamedResponse(FILES[GRABACION], content, previousFetches === 0 ? 12 * MiB : undefined)
    );

    const result = await withTimeRunning(crawl());
    const path = `${ROOT}/Grabacion.mp4`;
    const file = result!.files.find((f) => f.relativePath === path)!;

    expect(stagedOrder.filter((key) => key.startsWith(`${path}#`))).toEqual([`${path}#0`, `${path}#0`, `${path}#1`, `${path}#2`]);
    expect(stagedContent(path, file.pieces).equals(content)).toBe(true);
    expect(result!.files).toHaveLength(5);
  });

  it("lets a failed try's last piece land before handing the file over again", async () => {
    // Changed on Moodle between the two tries: a piece of the first landing late shows.
    const before = patternBytes(20 * MiB).map((byte) => 255 - byte);
    const content = patternBytes(20 * MiB);
    const path = `${ROOT}/Grabacion.mp4`;
    respond.set(GRABACION, (previousFetches) =>
      previousFetches === 0 ? streamedResponse(FILES[GRABACION], before, 12 * MiB) : streamedResponse(FILES[GRABACION], content)
    );
    let first = true;
    const slowStage: CrawlOptions['stage'] = async (relativePath, index, piece) => {
      // The first try's first piece takes longer to land than the wait to try again.
      if (relativePath === path && first) {
        first = false;
        await new Promise((resolve) => setTimeout(resolve, 10_000));
      }
      return stage(relativePath, index, piece);
    };

    const result = await withTimeRunning(crawl(undefined, slowStage));
    // Anything still on its way has landed by now.
    await vi.advanceTimersByTimeAsync(20_000);
    const file = result!.files.find((f) => f.relativePath === path)!;

    expect(stagedContent(path, file.pieces).equals(content)).toBe(true);
  });

  it("tries again when the server is briefly unavailable, instead of keeping its error page as the file", async () => {
    respond.set(TEMA_1, (previousFetches) => (previousFetches < 2 ? unavailable() : fileResponse(FILES[TEMA_1])));

    const result = await withTimeRunning(crawl());

    expect(fetched.filter((url) => url === TEMA_1)).toHaveLength(3);
    expect(stagedContent(`${ROOT}/Tema_1.pdf`, 1).toString()).toBe(`content of ${FILES[TEMA_1]}`);
    expect(result!.files).toHaveLength(5);
  });

  it('cancels the download when a file keeps failing', async () => {
    respond.set(TEMA_1, unavailable);

    const crawling = withTimeRunning(crawl());

    await expect(crawling).rejects.toThrow(DownloadCancelledError);
    await expect(crawling).rejects.toThrow('HTTP 503');
    expect(fetched.filter((url) => url === TEMA_1)).toHaveLength(3);
    expect(stagedOrder.some((key) => key.startsWith(`${ROOT}/Tema_1.pdf#`))).toBe(false);
  });

  it("cancels the download when a folder's page keeps failing, rather than take the folder for empty", async () => {
    respond.set(VIDEOS, unavailable);

    const crawling = withTimeRunning(crawl());

    await expect(crawling).rejects.toThrow(DownloadCancelledError);
    await expect(crawling).rejects.toThrow('Videos');
    expect(fetched.filter((url) => url === VIDEOS)).toHaveLength(3);
  });

  it('keeps the names whichever of two same-named files ends first, even one tried again', async () => {
    const first = `${MOODLE}/mod/resource/view.php?id=4`;
    respond.set(first, (previousFetches) =>
      previousFetches === 0 ? streamedResponse(FILES[first], new TextEncoder().encode('cut off'), 0) : fileResponse(FILES[first])
    );

    const result = await withTimeRunning(crawl());

    expect(result!.files.map((f) => f.relativePath)).toEqual(ALL_PATHS);
    expect(stagedContent(`${ROOT}/Apuntes.pdf`, 1).toString()).toBe(`content of ${FILES[first]}`);
    expect(stagedContent(`${ROOT}/Apuntes_${DUPLICATE_SUFFIX}.pdf`, 1).toString()).toBe(
      `content of ${FILES[`${MOODLE}/mod/resource/view.php?id=5`]}`
    );
  });

  it('cuts off the file still coming down when another fails for good, and starts no more', async () => {
    let cutOff = false;
    respond.set(TEMA_1, (_previous, signal) => endlessResponse(FILES[TEMA_1], signal, () => (cutOff = true)));
    respond.set(GRABACION, () => streamedResponse(FILES[GRABACION], new TextEncoder().encode('never whole'), 0));

    const crawling = withTimeRunning(crawl());

    await expect(crawling).rejects.toThrow(DownloadCancelledError);
    await expect(crawling).rejects.toThrow('Grabacion');
    expect(cutOff).toBe(true);
    expect(fetched).not.toContain(`${MOODLE}/mod/resource/view.php?id=4`);
    expect(fetched.filter((url) => url === TEMA_1)).toHaveLength(1);
  });

  it("shows a file as retrying in its row while it waits to try it again, then as before", async () => {
    respond.set(GRABACION, (previousFetches) =>
      streamedResponse(FILES[GRABACION], new TextEncoder().encode('cut off'), previousFetches === 0 ? 0 : undefined)
    );

    await withTimeRunning(crawl());

    const rows = messages
      .filter((m) => m.topic === 'download-file' && (m.payload as DownloadSlotFile).name === 'Grabacion.mp4')
      .map((m) => (m.payload as DownloadSlotFile).retrying ?? false);
    expect(rows).toEqual([false, true, false]);
  });

  it('says in the status line when it tries a file again before it even started coming down', async () => {
    respond.set(TEMA_1, (previousFetches) => {
      if (previousFetches === 0) throw new TypeError('Failed to fetch');
      return fileResponse(FILES[TEMA_1]);
    });

    await withTimeRunning(crawl());

    const log = messages.filter((m) => m.topic === 'status-log').map((m) => String(m.payload));
    const retrying = log.indexOf('Trying "Tema_1" again…');
    expect(retrying).toBeGreaterThan(-1);
    expect(log[retrying + 1]).toBe('Downloading files...');
  });

  it('tells a session ended behind a single sign-on apart from a dropped connection', async () => {
    respond.set(GRABACION, () => {
      throw new TypeError('Failed to fetch');
    });

    sessionOver = true;
    await expect(withTimeRunning(crawl())).rejects.toThrow('Moodle asked you to log in');

    sessionOver = false;
    await expect(withTimeRunning(crawl())).rejects.toThrow('could not download "Grabacion" (Failed to fetch)');
  });
});

describe('crawlCourse with assignments', () => {
  const ASSIGNMENTS = `${MOODLE}/mod/assign/index.php?id=7`;
  const PRACTICA_1 = `${MOODLE}/mod/assign/view.php?id=20`;
  const PRACTICA_2 = `${MOODLE}/mod/assign/view.php?id=21`;
  const ATTACHED = `${MOODLE}/pluginfile.php/40/mod_assign/introattachment/0/FE_P1_26_27.pdf?forcedownload=1`;
  const LINKED = `${MOODLE}/pluginfile.php/40/mod_assign/intro/circuito.pdf`;
  const HANDED_IN = `${MOODLE}/pluginfile.php/40/assignsubmission_file/submission_files/9/Pr3_VLAN__SDB.pkt?forcedownload=1`;
  const FOOTER = `${MOODLE}/pluginfile.php/1/theme_boost_union/footer/0/Guia.pdf`;
  const FOLDER = `${ROOT}/Practica_1_Analisis_de_circuitos`;

  function page(html: string, servedUrl?: string): () => Response {
    return () => {
      const response = new Response(`<html><body>${html}</body></html>`, { headers: { 'content-type': 'text/html' } });
      return servedUrl ? served(response, servedUrl) : response;
    };
  }

  beforeEach(() => {
    // Moodle 4's list of the course's assignments.
    respond.set(
      ASSIGNMENTS,
      page(`
        <div id="page"><div role="main"><table>
          <tr><td>Prácticas</td><td><a href="${PRACTICA_1}">Práctica 1: Análisis de circuitos</a></td></tr>
          <tr><td></td><td><a href="${PRACTICA_2}">Práctica 2: Diodos</a></td></tr>
        </table></div></div>`)
    );
    // Laid out as Moodle 4 does: the statement above the page's main region, what was
    // handed in inside it.
    respond.set(
      PRACTICA_1,
      page(`
        <div id="page"><div id="region-main">
          <div class="activity-description" id="intro">
            <p>Antes de acudir al laboratorio... <a href="${LINKED}">Esquema del circuito</a></p>
            <div class="fileuploadsubmission"><a target="_blank" href="${ATTACHED}">FE_P1_26_27.pdf</a></div>
          </div>
          <div role="main"><a href="${HANDED_IN}">Pr3_VLAN__SDB.pkt</a></div>
        </div></div>
        <footer><a href="${FOOTER}">Guía del campus virtual</a></footer>`)
    );
    respond.set(PRACTICA_2, page(`<div id="page"><div id="intro"><p>Sin archivos.</p></div></div>`));
    for (const url of [ATTACHED, LINKED, HANDED_IN, FOOTER]) respond.set(url, () => fileResponse(url));
  });

  it("downloads each assignment's statement and what was handed in, in a folder named after it", async () => {
    const result = await crawl();

    expect(result?.files.map((f) => f.relativePath).sort()).toEqual(
      [...ALL_PATHS, `${FOLDER}/FE_P1_26_27.pdf`, `${FOLDER}/Esquema_del_circuito.pdf`, `${FOLDER}/Pr3_VLAN__SDB.pkt`].sort()
    );
    expect(stagedContent(`${FOLDER}/FE_P1_26_27.pdf`, 1).toString()).toBe(`content of ${ATTACHED}`);
    expect(fetched).toContain(PRACTICA_2);
  });

  it("leaves out the page's other files, which aren't the assignment's", async () => {
    await crawl();
    expect(fetched).not.toContain(FOOTER);
  });

  it("finds them on Moodle 5's activities overview, named by the assignment's name rather than an icon's link", async () => {
    respond.set(
      ASSIGNMENTS,
      page(
        `<div id="page"><div role="main"><table><tr>
          <td><a href="${PRACTICA_1}&action=grading"><i class="icon"></i></a></td>
          <td><div class="fw-bold"><a href="${PRACTICA_1}" class="activityname">Práctica 1: Análisis de circuitos</a></div></td>
        </tr></table></div></div>`,
        `${MOODLE}/course/overview.php?id=7&expand%5B%5D=assign`
      )
    );

    const result = await crawl();

    expect(result?.files.map((f) => f.relativePath)).toContain(`${FOLDER}/FE_P1_26_27.pdf`);
    expect(fetched.filter((url) => url === PRACTICA_1)).toHaveLength(1);
  });

  it("never requests the files of an ignored assignment's folder", async () => {
    const result = await crawl(['Practica_1_Analisis_de_circuitos/']);

    expect(fetched).not.toContain(ATTACHED);
    expect(fetched).not.toContain(LINKED);
    expect(fetched).not.toContain(HANDED_IN);
    expect(result?.ignored).toBe(3);
  });

  it("cancels the download when the assignments' page keeps failing, rather than take the course for having none", async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    respond.set(ASSIGNMENTS, unavailable);

    const crawling = withTimeRunning(crawl());

    await expect(crawling).rejects.toThrow(DownloadCancelledError);
    expect(fetched.filter((url) => url === ASSIGNMENTS)).toHaveLength(3);
  });
});
