/** What's written for a color — "FFFFFF", "#ffffff", or three digits, each doubled
 *  ("FFF") — as one: "#rrggbb", lowercase. Undefined for anything else. */
export function parseHexColor(text: string): string | undefined {
  const digits = text.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{6}$/.test(digits)) return `#${digits}`;
  if (/^[0-9a-f]{3}$/.test(digits)) return `#${[...digits].map((digit) => digit + digit).join('')}`;
  return undefined;
}

/** What can be in a color's code as it's written: its hex digits, six at most (a "#"
 *  or anything else typed or pasted with them left out). */
export function hexDigits(text: string): string {
  return text.replace(/[^0-9a-f]/gi, '').slice(0, 6);
}
