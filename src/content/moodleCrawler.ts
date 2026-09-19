// Ported from moodle-dl-ext's packages/content-script/src/moodle-files.ts, with the
// JSZip packaging + save-to-disk step replaced by handing the crawled entries straight
// back to the background worker (see main.ts) for in-IndexedDB versioning.
import { bytesToBase64 } from '../lib/base64';
import { message } from './message';
import { randStr } from './util';

type ResourceType = 'courseView' | 'courseResources' | 'modFolderView' | 'modResourceView' | 'pluginfile';
interface Resource {
  name: string;
  type: ResourceType;
  url: string;
}

interface PartialMoodleFile {
  resourceName: string;
  sourceUrl: string;
  filenamePrefix: string;
}

type MoodleFile = PartialMoodleFile & {
  targetUrl: string;
  filename: string;
  extension: string;
  content: ArrayBuffer;
  size: number;
};

export interface DownloadProgress {
  current: number;
  total: number;
}

/** Cumulative bytes downloaded so far across the whole course — never reset
 *  between files, so a speed reading derived from it never has to fake a
 *  per-file restart. */
export interface FileDownloadProgress {
  current: number;
}

/** One crawled file, ready to be sent to the background for diffing/versioning.
 *  `content` is base64-encoded — see base64.ts for why. */
export interface CrawledEntry {
  relativePath: string;
  content: string;
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
  entries: CrawledEntry[];
}

const filters = new Map<ResourceType, RegExp>();
filters.set('courseView', /(.*\/course\/view\.php\?id=[0-9]+).*/);
filters.set('courseResources', /(.*\/course\/resources\.php\?id=[0-9]+).*/);
filters.set('modResourceView', /(.*\/resource\/view\.php\?id=[0-9]+).*/);
filters.set('modFolderView', /(.*\/folder\/view\.php\?id=[0-9]+).*/);
filters.set('pluginfile', /(.*\/pluginfile\.php.*)/);

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

function getValidFilename(name: string): string {
  const newName = name
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
      message<string>('status-log', `Processing ${url}`);

      const response = await fetchWithStallGuard(url);
      const domParser = new DOMParser();
      const document = domParser.parseFromString(await withStallTimeout(response.text(), STALL_TIMEOUT_MS), 'text/html');
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
    } else if (['modResourceView', 'pluginfile'].includes(type)) {
      message<string>('status-log', `Processing ${url}`);
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

/** Aborts `fetch(url)` if the server never even responds with headers in time. */
function fetchWithStallGuard(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('Timed out waiting for a response', 'TimeoutError')), STALL_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/** Rejects if `promise` doesn't settle within `ms` — used per-chunk below, so a
 *  connection that goes quiet mid-download (rather than never starting) is caught too. */
function withStallTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DOMException('Stalled: no data received in time', 'TimeoutError')), ms);
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

/** Streams `response`'s body, reporting live byte progress as chunks arrive
 *  (throttled) rather than waiting for the whole thing via `response.arrayBuffer()`. */
async function readBodyWithProgress(
  response: Response,
  onProgress: (current: number, total: number | undefined) => void
): Promise<Uint8Array> {
  const total = Number(response.headers.get('content-length')) || undefined;
  const reader = response.body?.getReader();
  if (!reader) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    onProgress(bytes.byteLength, total);
    return bytes;
  }

  const chunks: Uint8Array[] = [];
  let received = 0;
  let lastReportedAt = 0;

  try {
    while (true) {
      const { done, value } = await withStallTimeout(reader.read(), STALL_TIMEOUT_MS);
      if (done) break;
      chunks.push(value);
      received += value.byteLength;

      const now = Date.now();
      if (now - lastReportedAt >= 150) {
        onProgress(received, total);
        lastReportedAt = now;
      }
    }
  } catch (err) {
    await reader.cancel().catch(() => {});
    throw err;
  }

  onProgress(received, total);
  return concatChunks(chunks);
}

// A resource configured to open in a new window is served as an HTML wrapper page
// (a div.resourceworkaround containing a link) instead of the file itself. Follow that
// link to reach the actual file, falling back to the original response if none is found.
async function resolveResourceWorkaround(response: Response): Promise<Response> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const domParser = new DOMParser();
  const document = domParser.parseFromString(await withStallTimeout(response.text(), STALL_TIMEOUT_MS), 'text/html');
  const link = document.querySelector('.resourceworkaround a');

  if (!(link instanceof HTMLAnchorElement)) {
    return response;
  }

  return fetchWithStallGuard(link.href);
}

async function downloadMoodleFiles(partialMoodleFiles: PartialMoodleFile[]): Promise<MoodleFile[]> {
  message('download-progress', {
    current: 0,
    total: partialMoodleFiles.length
  });
  const moodleFiles: MoodleFile[] = [];
  // Reported cumulatively across the whole course, rather than reset to 0 for
  // each file — a per-file reset made the popup's speed reading (computed from
  // consecutive samples) look like it dropped to ~0 at every single file
  // boundary, when really that gap is just connection setup, not a stall. A
  // running total only ever climbs, so a real stall still shows up as reduced
  // throughput without a jarring hard-zero flash on every file.
  let totalBytesSoFar = 0;
  for (const [idx, partialMoodleFile] of partialMoodleFiles.entries()) {
    message<string>('status-log', `Downloading ${partialMoodleFile.resourceName}`);

    let response: Response;
    let bytes: Uint8Array;
    try {
      response = await resolveResourceWorkaround(await fetchWithStallGuard(partialMoodleFile.sourceUrl));
      bytes = await readBodyWithProgress(response, (current) => {
        message<FileDownloadProgress>('download-bytes', { current: totalBytesSoFar + current });
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'download failed';
      message<string>('status-log', `Skipped "${partialMoodleFile.resourceName}" (${reason})`);
      message('download-progress', { current: idx + 1, total: partialMoodleFiles.length });
      continue;
    }
    totalBytesSoFar += bytes.byteLength;

    const filename = urlToFilename(response.url);
    const extension = getFileExtension(filename);
    const content = bytes.buffer as ArrayBuffer;
    const moodleFile: MoodleFile = {
      ...partialMoodleFile,
      targetUrl: response.url,
      filename,
      extension,
      content,
      size: content.byteLength
    };

    // Remove duplicated file extension
    if (extension !== '') {
      if (moodleFile.resourceName.endsWith(extension)) {
        moodleFile.resourceName = moodleFile.resourceName.split('.').slice(0, -1).join();
      }
    }

    message<MoodleFile>('downloaded', moodleFile);
    message('download-progress', {
      current: idx + 1,
      total: partialMoodleFiles.length
    });
    moodleFiles.push(moodleFile);
  }
  return moodleFiles;
}

function buildEntries(moodleFiles: MoodleFile[]): CrawledEntry[] {
  const seenPaths = new Set<string>();
  const entries: CrawledEntry[] = [];

  for (const moodleFile of moodleFiles) {
    const { filenamePrefix, extension, content, resourceName } = moodleFile;

    let path = filenamePrefix + resourceName + '.' + extension;
    if (seenPaths.has(path)) {
      // If the path already exists, appending random string
      path = filenamePrefix + resourceName + '_' + randStr(8) + '.' + extension;
    }
    seenPaths.add(path);

    entries.push({ relativePath: path, content: bytesToBase64(new Uint8Array(content)) });
  }

  return entries;
}

function init(): void {
  crawlingQueue.length = 0;
  resourceUrlsFound.clear();
  message('download-progress', {
    current: 0,
    total: 1
  });
}

/** Crawls and downloads every resource reachable from `url`, without touching disk. */
export async function crawlCourse(url: string): Promise<CrawlResult | undefined> {
  init();
  const initialResource = convertUrlToResource(url);
  if (!initialResource) {
    message<string>('status-log', `Unsupported url: ${url}.`);
    return undefined;
  }

  message<string>('status-log', 'Processing links...');
  const { moodleFiles: partialMoodleFiles, courseTitle } = await getMoodleFiles(initialResource);

  message<string>('status-log', 'Downloading files...');
  const moodleFiles = await downloadMoodleFiles(partialMoodleFiles);

  if (moodleFiles.length === 0) {
    message<string>('status-log', 'No file found.');
    return { courseTitle, courseUrl: initialResource.url, entries: [] };
  }

  return { courseTitle, courseUrl: initialResource.url, entries: buildEntries(moodleFiles) };
}
