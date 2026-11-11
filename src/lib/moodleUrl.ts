export type MoodleResourceType = 'courseView' | 'courseResources' | 'modFolderView' | 'modResourceView' | 'pluginfile';

/** The Moodle URLs the crawler understands. Each pattern's capture group is the URL
 *  stripped down to what identifies the resource (e.g. no `&section=2` or `#top`). */
export const MOODLE_URL_PATTERNS: ReadonlyArray<readonly [MoodleResourceType, RegExp]> = [
  ['courseView', /(.*\/course\/view\.php\?id=[0-9]+).*/],
  ['courseResources', /(.*\/course\/resources\.php\?id=[0-9]+).*/],
  ['modResourceView', /(.*\/resource\/view\.php\?id=[0-9]+).*/],
  ['modFolderView', /(.*\/folder\/view\.php\?id=[0-9]+).*/],
  ['pluginfile', /(.*\/pluginfile\.php.*)/]
];

/** `url` reduced to the part that identifies its Moodle resource, if it is one. */
export function canonicalMoodleUrl(url: string): string | undefined {
  for (const [, pattern] of MOODLE_URL_PATTERNS) {
    const match = url.match(pattern)?.[1];
    if (match) return match;
  }
  return undefined;
}

/**
 * The address of the course `url` is a Moodle course page of (…/course/view.php?id=N,
 * nothing after the number), written as the browser writes it — which is how a
 * download records it, and how courses are found (see Course.matchedUrls).
 */
export function courseViewUrl(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return undefined;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return undefined;
  const [, courseView] = MOODLE_URL_PATTERNS.find(([type]) => type === 'courseView')!;
  return parsed.href.match(courseView)?.[1];
}

/**
 * The address a course is known by: its main page's (…/course/view.php?id=N) — also
 * for its Resources page (…/course/resources.php?id=N), the same course, which a
 * download can start from too. Any other address is left as it is.
 */
export function courseHomeUrl(url: string): string {
  return url.replace(/\/course\/resources\.php\?id=(\d+)$/, '/course/view.php?id=$1');
}
