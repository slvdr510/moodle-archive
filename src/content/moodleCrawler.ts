// Ported from moodle-dl-ext's packages/content-script/src/moodle-files.ts, with the
// JSZip packaging + save-to-disk step replaced by handing the crawled entries straight
// back to the background worker (see main.ts) for in-IndexedDB versioning.
import { DEFAULT_CONCURRENT_DOWNLOADS } from '../lib/concurrentDownloads';
import { NO_IGNORE_RULES, isIgnoredFolder, isIgnoredPath, type IgnoreRules } from '../lib/ignoredFiles';
import { en, type Messages } from '../lib/locales/en';
import { MOODLE_URL_PATTERNS, type MoodleResourceType } from '../lib/moodleUrl';
import { message } from './message';
import { randStr, stableSuffix } from './util';

/** The pages a download can start from (see MOODLE_URL_PATTERNS), and a course's
 *  assignments, which its resources page doesn't list: the page that lists them and
 *  each one's own page. */
type ResourceType = MoodleResourceType | 'modAssignIndex' | 'modAssignView';
interface Resource {
  name: string;
  type: ResourceType;
  url: string;
}

/** Thrown when a file can't be downloaded, which cancels the course's download.
 *  Its message is the one to show the user. */
export class DownloadCancelledError extends Error {}

/** Thrown when a file's content can't be handed over (see CrawlOptions.stage), which
 *  stops the download: trying again wouldn't help. */
export class SaveFailedError extends Error {}

interface PartialMoodleFile {
  resourceName: string;
  sourceUrl: string;
  filenamePrefix: string;
}

type MoodleFile = PartialMoodleFile & {
  targetUrl: string;
  filename: string;
  extension: string;
  relativePath: string;
  size: number;
  pieces: number;
};

export interface DownloadProgress {
  current: number;
  total: number;
}

/** Bytes one of the downloads running side by side (`slot`, see CrawlOptions.concurrentDownloads)
 *  has downloaded so far, across every file it has had — never reset between files,
 *  so a speed reading derived from it never has to fake a per-file restart. */
export interface FileDownloadProgress {
  slot: number;
  current: number;
  /** When `current` was reached (performance.now() in the course's tab): messages can
   *  be held up on their way and then arrive in a burst, so a speed worked out from
   *  when they're received read as hundreds of MB/s. */
  time: number;
}

/** The file one of the downloads running side by side (`slot`) is on: null once it
 *  has none left. `retrying` while it waits to try that file again. */
export interface DownloadSlotFile {
  slot: number;
  name: string | null;
  retrying?: boolean;
}

/** One downloaded file, its content already handed over a piece at a time (see
 *  CrawlOptions.stage), ready to be versioned. */
export interface CrawledFile {
  relativePath: string;
  size: number;
  /** How many pieces its content was handed over in. */
  pieces: number;
}

export interface CrawlResult {
  /** The Moodle course's page title, used to auto-create/match a Course. Falls back to the
   *  initial resource's own name when crawling starts directly on a file/folder page. */
  courseTitle: string;
  /** The starting page's URL, trimmed down to its stable `.../xxx.php?id=NNN`
   *  form (see `filters` below) — stripped of volatile bits like `sesskey`,
   *  other query params, or a `#section-N` fragment, so the exact same course
   *  page visited twice always matches by URL instead of quietly creating a
   *  duplicate Course when those incidental bits happen to differ. */
  courseUrl: string;
  files: CrawledFile[];
  /** How many of the course's files were left out, never downloaded, because the
   *  user ignored them (see Course.ignoredPaths). */
  ignored: number;
  /** How many were left out because Moodle answered for them with an error (a 404, a
   *  403): still linked, but no longer there to have. */
  unavailable: number;
}

const filters = new Map<ResourceType, RegExp>(MOODLE_URL_PATTERNS);

const ASSIGNMENT_URL = /(.*\/mod\/assign\/view\.php\?id=[0-9]+).*/;
// An assignment's own files: its statement's (attached to it, or linked from its
// description) and the ones handed in. Not the teacher's feedback, nor any other
// file the page links to.
const ASSIGNMENT_FILE =
  /\/pluginfile\.php.*(?:mod_assign(?:\/|%2F)intro(?:attachment)?|assignsubmission_file(?:\/|%2F)submission_files)(?:\/|%2F)/i;

export function convertUrlToResource(url: HTMLAnchorElement | string): Resource | undefined {
  if (url instanceof HTMLAnchorElement) {
    for (const [resourceType, regExp] of filters.entries()) {
      const result = url.href.match(regExp)?.[1];
      if (result) {
        return {
          name: getValidFilename(url.innerText),
          type: resourceType,
          url: result
        };
      }
    }
  } else {
    for (const [resourceType, regExp] of filters.entries()) {
      const result = url.match(regExp)?.[1];
      if (result) {
        return {
          name: getValidFilename(url),
          type: resourceType,
          url: result
        };
      }
    }
  }

  return undefined;
}

function urlToFilename(url: string): string {
  return getValidFilename(decodeURIComponent(url.split('#').shift()!.split('?').shift()!.split('/').pop()!));
}

export function getValidFilename(name: string): string {
  const newName = name
    // Split accented letters into base letter + accent mark, then drop the marks, so
    // "Cálculo" becomes "Calculo" rather than losing the "á" altogether below.
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/gu, '')
    .trim()
    .replaceAll(' ', '_')
    .replaceAll(/[^-\w.]/gu, '');
  if (['', '.', '..'].includes(newName)) {
    console.warn(`filename '${name}' is invalid!`);
    return `invalid-filename_${randStr(8)}`;
  }
  return newName;
}

function getFileExtension(name: string): string {
  return name.split('.').slice(1).pop() ?? '';
}

function getUrlWithoutHashtag(url: string): string {
  return url.split('#')[0];
}

const crawlingQueue: [Resource, string][] = [];
// The progress lines' language, set for each crawl by crawlCourse.
let t: Messages = en;
const resourceUrlsFound = new Set<string>();

async function getMoodleFiles(
  initialResource: Resource
): Promise<{ moodleFiles: PartialMoodleFile[]; courseTitle: string }> {
  crawlingQueue.push([initialResource, '']);
  const moodleFiles: PartialMoodleFile[] = [];
  let courseTitle: string | undefined;

  while (crawlingQueue.length > 0) {
    const pair = crawlingQueue.at(0)!;
    const currentResource = pair[0];
    let currentPath = pair[1];
    crawlingQueue.shift();

    const url = getUrlWithoutHashtag(currentResource.url);

    const { name, type } = currentResource;

    if (['courseView'].includes(type)) {
      crawlingQueue.push([
        {
          name: 'course view',
          type: 'courseResources',
          url: url.replace('view', 'resources')
        },
        ''
      ]);
    } else if (['courseResources', 'modFolderView'].includes(type)) {
      message<string>('status-log', t.download.processing(url));

      const domParser = new DOMParser();
      const document = domParser.parseFromString(await fetchPage(url, type === 'courseResources' ? url : name), 'text/html');
      const page = document.getElementById('page');
      const main = page?.querySelector('[role="main"]');

      // Get urls from the elememt with role 'main' first if exists, otherwise with id 'page', to narrow down the list of urls
      const urls =
        main?.getElementsByTagName('a') ?? page?.getElementsByTagName('a') ?? document.getElementsByTagName('a');

      if (type === 'courseResources') {
        const title = document.getElementsByTagName('title')[0].innerText;
        const processedTitle = title ? getValidFilename(title) : '';
        currentPath += processedTitle + '/';
        courseTitle = title || undefined;
      }

      for (const url of urls) {
        const urlWithoutHashtag = getUrlWithoutHashtag(url.href);
        const targetResource = convertUrlToResource(url);

        // Skip urls that are not valid resources or have already been processed
        if (!targetResource || resourceUrlsFound.has(urlWithoutHashtag)) {
          continue;
        } else if (type === 'modFolderView' && targetResource.type === 'modFolderView') {
          // Skip non-file links if in a folder view to prevent jumping into another folder
          continue;
        }

        if (targetResource.type !== 'courseView') {
          let targetPath = currentPath;
          if (targetResource.type === 'modFolderView') {
            targetPath += urlToFilename(url.innerText) + '/';
          }
          crawlingQueue.push([targetResource, targetPath]);
          resourceUrlsFound.add(urlWithoutHashtag);
        }
      }

      if (type === 'courseResources') {
        // Moodle lists a course's assignments on a page of their own — from Moodle 5 on,
        // it sends that page on to its activities overview, open at the assignments.
        crawlingQueue.push([
          { name: url, type: 'modAssignIndex', url: url.replace('/course/resources.php', '/mod/assign/index.php') },
          currentPath
        ]);
      }
    } else if (type === 'modAssignIndex') {
      message<string>('status-log', t.download.processing(url));

      const document = new DOMParser().parseFromString(await fetchPage(url, name), 'text/html');
      const page = document.getElementById('page');
      const main = page?.querySelector('[role="main"]');
      const links = main?.getElementsByTagName('a') ?? page?.getElementsByTagName('a') ?? document.getElementsByTagName('a');

      // Each assignment's files go in a folder named after it, as a Moodle folder's do.
      for (const link of links) {
        const assignmentUrl = link.href.match(ASSIGNMENT_URL)?.[1];
        // A link without text (an icon) can't name the folder: the assignment's own
        // link, with its name, does.
        if (!assignmentUrl || !link.innerText || resourceUrlsFound.has(assignmentUrl)) continue;
        const folderName = getValidFilename(link.innerText);
        crawlingQueue.push([{ name: folderName, type: 'modAssignView', url: assignmentUrl }, currentPath + folderName + '/']);
        resourceUrlsFound.add(assignmentUrl);
      }
    } else if (type === 'modAssignView') {
      message<string>('status-log', t.download.processing(url));

      // The statement is above the page's main region, what was handed in inside it:
      // the whole page is read, keeping only the assignment's own files.
      const document = new DOMParser().parseFromString(await fetchPage(url, name), 'text/html');
      for (const link of document.getElementsByTagName('a')) {
        const fileUrl = getUrlWithoutHashtag(link.href);
        if (!ASSIGNMENT_FILE.test(fileUrl) || resourceUrlsFound.has(fileUrl)) continue;
        // Named by the link's text, as everywhere else. One without any (an image) is
        // named after the file: a made-up name would change on every download.
        const fileName = link.innerText ? getValidFilename(link.innerText) : urlToFilename(fileUrl);
        crawlingQueue.push([{ name: fileName, type: 'pluginfile', url: fileUrl }, currentPath]);
        resourceUrlsFound.add(fileUrl);
      }
    } else if (['modResourceView', 'pluginfile'].includes(type)) {
      message<string>('status-log', t.download.processing(url));
      const partialMoodleFile: PartialMoodleFile = {
        resourceName: name,
        sourceUrl: url,
        filenamePrefix: currentPath
      };

      moodleFiles.push(partialMoodleFile);
    } else {
      throw new Error(`Unknown resource type '${type}'!`);
    }
  }

  return { moodleFiles, courseTitle: courseTitle ?? initialResource.name };
}

// A stalled request (server that opened the connection and then never sent another
// byte) used to hang the whole download forever, with no feedback and no way to
// recover other than reloading the extension. Every fetch here is guarded so that
// if nothing happens — no response headers, or no more body chunks — for this long,
// it aborts instead of hanging indefinitely.
const STALL_TIMEOUT_MS = 20_000;

/** Aborts `fetch(url)` if the server never even responds with headers in time — or
 *  once `stop` is aborted, cutting off whatever of the response is still to come. */
function fetchWithStallGuard(url: string, stop?: AbortSignal, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException(t.download.noResponse, 'TimeoutError')), STALL_TIMEOUT_MS);
  if (stop?.aborted) controller.abort(stop.reason);
  stop?.addEventListener('abort', () => controller.abort(stop.reason), { once: true });
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

/** Rejects if `promise` doesn't settle within `ms` — used per-chunk below, so a
 *  connection that goes quiet mid-download (rather than never starting) is caught too. */
function withStallTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DOMException(t.download.stalled, 'TimeoutError')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// A dropped connection or a server too busy to answer (see checkAvailable) used to
// cancel the whole course at once. They often work again a moment later, so each
// request is tried again after each of these waits before giving up.
const RETRY_DELAYS_MS = [2_000, 5_000];

/** Thrown for a response from a server that couldn't serve the request just then. */
class ServerUnavailableError extends Error {}

/** `response`, unless the server says it's failing or busy: its error page was taken
 *  for the file (or a folder's page, read as an empty folder). Other errors, e.g. a
 *  404, won't change by waiting: they're left to the caller. */
function checkAvailable(response: Response): Response {
  if (response.status >= 500 || response.status === 408 || response.status === 429) {
    throw new ServerUnavailableError(`HTTP ${response.status}`);
  }
  return response;
}

/** `response`, unless it's Moodle's login page, sent instead of what was asked for: the
 *  session ran out (or the user logged out) partway through. Kept as the file, it came
 *  out named "….php", with the real file looking deleted; and everything after would
 *  come back as the login page too, so the download stops. */
function checkLoggedIn(response: Response): Response {
  if (/\/login\/index\.php(?:[?#]|$)/.test(response.url)) throw new DownloadCancelledError(t.download.sessionExpired);
  return response;
}

/** Runs `attempt` until it succeeds, waiting RETRY_DELAYS_MS between tries — but for a
 *  failure waiting won't fix: saving, or one that already cancels the download. Stops
 *  trying (and waiting) once `stop` is aborted. `onRetry` says when it's about to wait
 *  to try again, to let the user know. */
async function withRetries<T>(
  attempt: () => Promise<T>,
  { stop, onRetry }: { stop?: AbortSignal; onRetry?: () => void } = {}
): Promise<T> {
  for (let retry = 0; ; retry++) {
    if (stop?.aborted) throw stop.reason;
    try {
      return await attempt();
    } catch (err) {
      if (err instanceof SaveFailedError || err instanceof DownloadCancelledError || retry >= RETRY_DELAYS_MS.length) {
        throw err;
      }
      onRetry?.();
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, RETRY_DELAYS_MS[retry]);
        stop?.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true }
        );
      });
    }
  }
}

/** A course or folder page's HTML. One that can't be fetched cancels the download:
 *  read as an empty page, its files would look deleted from Moodle. */
async function fetchPage(url: string, name: string): Promise<string> {
  try {
    const html = await withRetries(
      async () => {
        const response = checkLoggedIn(checkAvailable(await fetchWithStallGuard(url)));
        return withStallTimeout(response.text(), STALL_TIMEOUT_MS);
      },
      { onRetry: () => message<string>('status-log', t.download.retrying(name)) }
    );
    sessionProbeUrl ??= url;
    return html;
  } catch (err) {
    throw await cancellation(err, name);
  }
}

// The first course or folder page this download got, back then without being sent off
// to log in — see sessionEnded.
let sessionProbeUrl: string | undefined;

/**
 * Whether `err`, a request failing outright, came from the Moodle session having ended.
 * A university's single sign-on sends Moodle's login page on to its own site, which the
 * browser won't let the download follow: that fails as a network error instead (unlike
 * Moodle's own login page, see checkLoggedIn). Asking again for a page that came back
 * fine before, without following where Moodle sends it, tells the two apart.
 */
async function sessionEnded(err: unknown): Promise<boolean> {
  if (!(err instanceof TypeError) || !sessionProbeUrl) return false;
  try {
    return (await fetchWithStallGuard(sessionProbeUrl, undefined, { redirect: 'manual' })).type === 'opaqueredirect';
  } catch {
    return false;
  }
}

/** What `name` (a file, or a course or folder page) failing for good does: it cancels
 *  the whole course. Saved without it, its files would look deleted from Moodle when
 *  they're still there. */
async function cancellation(err: unknown, name: string): Promise<unknown> {
  if (err instanceof SaveFailedError || err instanceof DownloadCancelledError) return err;
  if (await sessionEnded(err)) return new DownloadCancelledError(t.download.sessionExpired);
  const reason = err instanceof Error ? err.message : t.download.downloadFailed;
  return new DownloadCancelledError(t.download.cancelled(name, reason));
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

// How much of a file is handed over at a time, give or take one network chunk. A whole
// file at once had to fit in memory (with the course's every other file, until all
// were sent), and Chrome refuses any message over 64 MiB: a file over ~48 MB, once
// base64-encoded, could never be saved.
const PIECE_BYTES = 8 * 1024 * 1024;

/** Streams `response`'s body to `onPiece` a piece at a time, reporting live byte
 *  progress as chunks arrive (throttled), rather than holding it all. Returns its size
 *  and how many pieces it took: at least one, empty for an empty file. */
async function streamBody(
  response: Response,
  onProgress: (current: number, total: number | undefined) => void,
  onPiece: (index: number, piece: Uint8Array) => Promise<void>
): Promise<{ size: number; pieces: number }> {
  const total = Number(response.headers.get('content-length')) || undefined;
  let buffered: Uint8Array[] = [];
  let bufferedBytes = 0;
  let pieces = 0;
  // The piece handed over last, while the next one comes down: waiting for each before
  // reading on stopped the file (and its row in the popup) at every piece. They're still
  // handed over one at a time, in order — this waits for the last before the next.
  let handingOver: Promise<void> = Promise.resolve();
  const flush = async () => {
    await handingOver;
    const piece = concatChunks(buffered);
    buffered = [];
    bufferedBytes = 0;
    handingOver = onPiece(pieces++, piece);
    // Its failure is thrown where it's waited for, not reported unhandled meanwhile.
    handingOver.catch(() => {});
  };

  const reader = response.body?.getReader();
  if (!reader) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    onProgress(bytes.byteLength, total);
    await onPiece(pieces++, bytes);
    return { size: bytes.byteLength, pieces };
  }

  let received = 0;
  let lastReportedAt = 0;

  try {
    while (true) {
      const { done, value } = await withStallTimeout(reader.read(), STALL_TIMEOUT_MS);
      if (done) break;
      buffered.push(value);
      bufferedBytes += value.byteLength;
      received += value.byteLength;

      const now = Date.now();
      if (now - lastReportedAt >= 150) {
        onProgress(received, total);
        lastReportedAt = now;
      }
      if (bufferedBytes >= PIECE_BYTES) await flush();
    }
    if (bufferedBytes > 0 || pieces === 0) await flush();
    await handingOver;
  } catch (err) {
    await reader.cancel().catch(() => {});
    // A failed try leaves no piece on its way: the next one hands the file over again
    // from its first piece, and a late piece of this one would land on top of it.
    await handingOver.catch(() => {});
    throw err;
  }

  onProgress(received, total);
  return { size: received, pieces };
}

/** Finds the actual file behind a resource's HTML wrapper page, if it is one:
 *  - "open in a new window" / "force download": a div.resourceworkaround containing a link.
 *  - "embed" with an image: an img.resourceimage.
 *  - "embed" with anything else (PDF, video, audio...): an object/iframe/embed/media
 *    element pointing at a pluginfile.php URL — anything else (e.g. a YouTube iframe)
 *    isn't the resource's own file. */
export function findWrappedFileUrl(document: Document): string | undefined {
  const link = document.querySelector('.resourceworkaround a');
  if (link instanceof HTMLAnchorElement && link.href) {
    return link.href;
  }

  const image = document.querySelector('img.resourceimage');
  if (image instanceof HTMLImageElement && image.src) {
    return image.src;
  }

  const embedded = document.querySelectorAll(
    '#resourceobject, .resourcecontent object, .resourcecontent iframe, .resourcecontent embed, ' +
      '.resourcecontent video, .resourcecontent audio, .resourcecontent source'
  );
  for (const element of embedded) {
    const src = element.getAttribute('data') ?? element.getAttribute('src');
    if (!src) continue;
    const url = new URL(src, document.baseURI).href;
    if (url.includes('/pluginfile.php/')) {
      return url;
    }
  }

  return undefined;
}

// A resource whose display mode isn't "automatic"/"open" is served as an HTML wrapper
// page instead of the file itself. Follow it to reach the actual file, falling back to
// the original response if none is found.
async function resolveResourceWorkaround(response: Response, stop?: AbortSignal): Promise<Response> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // Read a clone, so the original's body is still unread if we end up returning it.
  const html = await withStallTimeout(response.clone().text(), STALL_TIMEOUT_MS);
  const domParser = new DOMParser();
  const document = domParser.parseFromString(html, 'text/html');
  const fileUrl = findWrappedFileUrl(document);

  if (!fileUrl) {
    return response;
  }

  return fetchWithStallGuard(fileUrl, stop);
}

/** Where a file goes in the course: its folder, its name on Moodle, and the extension
 *  of the name Moodle serves it under (`servedUrl`, after any redirect). `seenPaths`
 *  holds every path given out so far in this download, given out in the course's order
 *  (see downloadMoodleFiles). */
function placeFile(
  file: PartialMoodleFile,
  servedUrl: string,
  seenPaths: Set<string>
): Pick<MoodleFile, 'filename' | 'extension' | 'resourceName' | 'relativePath'> {
  const { filenamePrefix, sourceUrl } = file;
  const filename = urlToFilename(servedUrl);
  const extension = getFileExtension(filename);

  // Remove duplicated file extension
  let resourceName = file.resourceName;
  if (extension !== '') {
    if (resourceName.endsWith(extension)) {
      resourceName = resourceName.split('.').slice(0, -1).join();
    }
  }

  let relativePath = filenamePrefix + resourceName + '.' + extension;
  if (seenPaths.has(relativePath)) {
    // Two resources in the same folder share a name: tell them apart with a suffix
    // derived from the resource's own URL. It has to be the same on every download —
    // a random one made each re-download look like the old file was deleted and a
    // brand-new one appeared.
    relativePath = filenamePrefix + resourceName + '_' + stableSuffix(sourceUrl) + '.' + extension;
  }

  return { filename, extension, resourceName, relativePath };
}

/** Asks Moodle for `file`, through the wrapper page it may be behind, up to its headers. */
async function openFile(file: PartialMoodleFile, stop: AbortSignal): Promise<Response> {
  return checkLoggedIn(checkAvailable(await resolveResourceWorkaround(await fetchWithStallGuard(file.sourceUrl, stop), stop)));
}

/** Downloads each file but those `rules` say the user ignored, `concurrentDownloads` at
 *  a time, handing their content to `stage` as it comes down. What a file is called (its
 *  extension, see placeFile) is only known once Moodle answers, so an ignored one is
 *  dropped right then, before its content comes down. */
async function downloadMoodleFiles(
  partialMoodleFiles: PartialMoodleFile[],
  rules: IgnoreRules,
  stage: CrawlOptions['stage'],
  concurrentDownloads: number
): Promise<{ moodleFiles: MoodleFile[]; skipped: number; unavailable: number }> {
  const total = partialMoodleFiles.length;
  message<DownloadProgress>('download-progress', { current: 0, total });
  let done = 0;
  const fileDone = () => message<DownloadProgress>('download-progress', { current: ++done, total });
  // Kept in the course's order, whichever download ends first.
  const results: (MoodleFile | undefined)[] = [];
  let skipped = 0;
  let unavailable = 0;
  // Ignored and unavailable files' paths too, so two resources sharing a name get
  // told apart the same way whichever of them is left out.
  const seenPaths = new Set<string>();

  // Each slot's bytes are reported cumulatively across all of its files, rather than
  // reset to 0 for each file — a per-file reset made the popup's speed reading
  // (computed from consecutive samples) look like it dropped to ~0 at every single
  // file boundary, when really that gap is just connection setup, not a stall. A
  // running total only ever climbs, so a real stall still shows up as reduced
  // throughput without a jarring hard-zero flash on every file.
  const slotBytes = new Array<number>(concurrentDownloads).fill(0);
  const freeSlots = [...slotBytes.keys()];
  const showSlot = (slot: number, name: string | null, retrying?: boolean) =>
    message<DownloadSlotFile>('download-file', { slot, name, retrying });
  const running = new Set<Promise<void>>();
  let allStarted = false;

  // The first file to fail for good stops the rest: whatever is still coming down is
  // cut off (see fetchWithStallGuard) and nothing else starts. The course is cancelled
  // once all of it has stopped, so nothing is handed over after that.
  const stop = new AbortController();
  let failure: unknown;
  const fail = (err: unknown) => {
    if (stop.signal.aborted) return;
    failure = err;
    stop.abort(err);
  };

  /** Brings down the content of `file`, opened as `response`, in `slot`. A try that
   *  fails partway asks for it again, and hands it over again from its first piece. */
  async function downloadContent(
    file: PartialMoodleFile,
    place: ReturnType<typeof placeFile>,
    response: Response,
    slot: number
  ): Promise<MoodleFile> {
    const name = place.relativePath.split('/').pop()!;
    showSlot(slot, name);
    let opened: Response | undefined = response;
    let retrying = false;
    const body = await withRetries(
      async () => {
        if (retrying) showSlot(slot, name);
        retrying = false;
        const current = opened ?? (await openFile(file, stop.signal));
        opened = undefined;
        if (!current.ok) throw new Error(`HTTP ${current.status}`);
        return streamBody(
          current,
          (bytes) =>
            message<FileDownloadProgress>('download-bytes', { slot, current: slotBytes[slot] + bytes, time: performance.now() }),
          async (index, piece) => {
            try {
              await stage(place.relativePath, index, piece);
            } catch (err) {
              throw new SaveFailedError(err instanceof Error ? err.message : String(err));
            }
          }
        );
      },
      {
        stop: stop.signal,
        onRetry: () => {
          retrying = true;
          showSlot(slot, name, true);
        }
      }
    );
    slotBytes[slot] += body.size;
    const moodleFile: MoodleFile = { ...file, ...place, targetUrl: response.url, ...body };
    message<MoodleFile>('downloaded', moodleFile);
    return moodleFile;
  }

  // Files are opened one at a time, in the course's order — where each goes depends on
  // the ones before it (see placeFile) — and only their content comes down side by side.
  for (const [index, file] of partialMoodleFiles.entries()) {
    if (running.size >= concurrentDownloads) await Promise.race(running);
    if (stop.signal.aborted) break;

    let response: Response;
    let retried = false;
    try {
      response = await withRetries(() => openFile(file, stop.signal), {
        stop: stop.signal,
        onRetry: () => {
          retried = true;
          message<string>('status-log', t.download.retrying(file.resourceName));
        }
      });
    } catch (err) {
      fail(await cancellation(err, file.resourceName));
      break;
    }
    if (retried) message<string>('status-log', t.download.downloadingFiles);
    const place = placeFile(file, response.url, seenPaths);
    seenPaths.add(place.relativePath);

    // Moodle still links the file but no longer has it (404) or lets you have it
    // (403). Its error page used to be kept as a new version of the file; left out
    // instead, the file counts as gone from Moodle, keeping the copies it had.
    if (!response.ok) {
      console.warn(`"${file.resourceName}" is not available on Moodle (HTTP ${response.status}).`);
      await response.body?.cancel().catch(() => {});
      unavailable++;
      fileDone();
      continue;
    }
    if (isIgnoredPath(place.relativePath, rules.rootPath, rules.ignoredPaths)) {
      // Cancelling the body stops the transfer: only the headers came down.
      await response.body?.cancel().catch(() => {});
      skipped++;
      fileDone();
      continue;
    }

    const slot = freeSlots.shift()!;
    const task: Promise<void> = downloadContent(file, place, response, slot)
      .then(
        (moodleFile) => {
          results[index] = moodleFile;
          fileDone();
        },
        async (err: unknown) => fail(await cancellation(err, file.resourceName))
      )
      .finally(() => {
        running.delete(task);
        freeSlots.push(slot);
        freeSlots.sort((a, b) => a - b);
        if (allStarted) showSlot(slot, null);
      });
    running.add(task);
  }

  // No file left to start: a slot free now, or freed from now on, has none to take.
  allStarted = true;
  for (const slot of freeSlots) showSlot(slot, null);
  await Promise.all(running);
  if (failure) throw failure;
  return { moodleFiles: results.filter((f): f is MoodleFile => f !== undefined), skipped, unavailable };
}

function init(): void {
  crawlingQueue.length = 0;
  resourceUrlsFound.clear();
  sessionProbeUrl = undefined;
  message('download-progress', {
    current: 0,
    total: 1
  });
}

export interface CrawlOptions {
  /** The language of the progress lines. */
  messages?: Messages;
  /** Which of the course's files the user ignored, asked once its title is known. */
  askIgnoreRules?: (courseUrl: string, courseTitle: string) => Promise<IgnoreRules | undefined>;
  /** Takes piece `index` of the file at `relativePath`, as its content comes down. A
   *  file that's tried again is handed over again, from piece 0. */
  stage: (relativePath: string, index: number, piece: Uint8Array) => Promise<void>;
  /** How many files come down at once (see concurrentDownloads.ts). */
  concurrentDownloads?: number;
}

/** Crawls and downloads every resource reachable from `url`, without touching disk —
 *  but the files the user ignored (see CrawlOptions.askIgnoreRules). */
export async function crawlCourse(
  url: string,
  {
    messages = en,
    askIgnoreRules = async () => undefined,
    stage,
    concurrentDownloads = DEFAULT_CONCURRENT_DOWNLOADS
  }: CrawlOptions
): Promise<CrawlResult | undefined> {
  t = messages;
  init();
  const initialResource = convertUrlToResource(url);
  if (!initialResource) {
    message<string>('status-log', t.download.unsupportedUrl(url));
    return undefined;
  }

  message<string>('status-log', t.download.processingLinks);
  const { moodleFiles: partialMoodleFiles, courseTitle } = await getMoodleFiles(initialResource);

  // Files in an ignored folder are left out here, without a single request; ignored
  // files themselves once Moodle says what each one is called (see downloadMoodleFiles).
  const rules = (await askIgnoreRules(initialResource.url, courseTitle)) ?? NO_IGNORE_RULES;
  const toDownload = partialMoodleFiles.filter(
    (file) => !isIgnoredFolder(file.filenamePrefix.replace(/\/$/, ''), rules.rootPath, rules.ignoredPaths)
  );

  message<string>('status-log', t.download.downloadingFiles);
  const { moodleFiles, skipped, unavailable } = await downloadMoodleFiles(toDownload, rules, stage, concurrentDownloads);
  const ignored = partialMoodleFiles.length - toDownload.length + skipped;

  if (moodleFiles.length === 0 && ignored === 0) {
    message<string>('status-log', t.download.noFileFound);
  }

  const files = moodleFiles.map(({ relativePath, size, pieces }) => ({ relativePath, size, pieces }));
  return { courseTitle, courseUrl: initialResource.url, files, ignored, unavailable };
}
