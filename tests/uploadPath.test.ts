import { describe, expect, it } from 'vitest';
import { joinPath, sanitizeFolderName } from '../src/lib/uploadPath';

describe('joinPath', () => {
  it('joins with "/" and skips empty pieces', () => {
    expect(joinPath('IRC', 'Tema_1', 'a.pdf')).toBe('IRC/Tema_1/a.pdf');
    expect(joinPath('', 'a.pdf')).toBe('a.pdf');
  });
});

describe('sanitizeFolderName', () => {
  it('keeps a plain name, trimmed', () => {
    expect(sanitizeFolderName('  Tema 1 ')).toBe('Tema 1');
  });

  it('drops path separators, so it is always a single folder', () => {
    expect(sanitizeFolderName('Tema_1/Ejercicios')).toBe('Tema_1Ejercicios');
    expect(sanitizeFolderName('a\\b')).toBe('ab');
  });

  it('rejects "." and ".." and returns an empty string when nothing is left', () => {
    expect(sanitizeFolderName('..')).toBe('');
    expect(sanitizeFolderName(' . ')).toBe('');
    expect(sanitizeFolderName(' / ')).toBe('');
  });
});
