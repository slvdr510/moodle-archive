import { describe, expect, it } from 'vitest';
import { academicYearOptions } from '../src/lib/academicYear';

describe('academicYearOptions', () => {
  it('leaves out what is empty, and each written alike once', () => {
    expect(academicYearOptions([undefined, '', '  ', '25-26', '25-26 '])).toEqual(['25-26']);
  });

  it('takes a year written in 2 digits as this century', () => {
    expect(academicYearOptions(['1999-2000', '01-02'])).toEqual(['01-02', '1999-2000']);
  });
});
