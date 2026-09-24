export function randStr(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * A short, deterministic stand-in for `randStr`: the same input always gives the
 * same 8 hex characters (32-bit FNV-1a). Used to tell apart files that share a
 * name, where a random suffix would change on every download — making the same
 * file look "deleted" under its old name and "new" under its fresh one.
 */
export function stableSuffix(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
