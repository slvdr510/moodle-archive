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
