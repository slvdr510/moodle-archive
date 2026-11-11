import { describe, expect, it } from 'vitest';
import { hexDigits, parseHexColor } from '../src/lib/hexColor';

describe('parseHexColor', () => {
  it('takes six digits or three, with or without the #, in any case', () => {
    expect(parseHexColor('FFFFFF')).toBe('#ffffff');
    expect(parseHexColor(' #2563EB ')).toBe('#2563eb');
    expect(parseHexColor('f80')).toBe('#ff8800');
    expect(parseHexColor('#F80')).toBe('#ff8800');
  });

  it('takes nothing else', () => {
    for (const text of ['', '#', 'FFFF', '12345', '1234567', 'GGGGGG', 'rgb(1,2,3)', '##ffffff']) {
      expect(parseHexColor(text)).toBeUndefined();
    }
  });
});

describe('hexDigits', () => {
  it('keeps the hex digits written, six at most', () => {
    expect(hexDigits('#ab cd ef')).toBe('abcdef');
    expect(hexDigits('FFFFFFF')).toBe('FFFFFF');
    expect(hexDigits('zz12')).toBe('12');
  });
});
