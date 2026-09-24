import { describe, expect, it } from 'vitest';
import { stableSuffix } from '../src/content/util';

describe('stableSuffix', () => {
  it('returns the same 8 hex characters for the same input, every time', () => {
    const url = 'https://moodle.example/mod/resource/view.php?id=1234';
    expect(stableSuffix(url)).toBe(stableSuffix(url));
    expect(stableSuffix(url)).toMatch(/^[0-9a-f]{8}$/);
  });

  it('gives different suffixes to different resources', () => {
    expect(stableSuffix('https://moodle.example/mod/resource/view.php?id=1234')).not.toBe(
      stableSuffix('https://moodle.example/mod/resource/view.php?id=1235')
    );
  });
});
