import { describe, expect, it } from 'vitest';
import { filterFilesByQuery } from '../src/lib/search';
import type { FileRecord, FileStatus } from '../src/types';

function makeFile(relativePath: string, currentStatus: FileStatus = 'unchanged'): FileRecord {
  return {
    id: relativePath,
    courseId: 'course-1',
    relativePath,
    filename: relativePath.split('/').pop()!,
    currentStatus
  };
}

describe('filterFilesByQuery', () => {
  it('matches case-insensitively as a substring, e.g. "sep" finds "..._SEP.pdf"', () => {
    const files = [
      makeFile('19/INF_EX_2013_SEP.pdf'),
      makeFile('19/INF_EX_2013_FEB.pdf'),
      makeFile('ACTAS/notes.pdf')
    ];
    const results = filterFilesByQuery(files, 'sep');
    expect(results.map((f) => f.filename)).toEqual(['INF_EX_2013_SEP.pdf']);
  });

  it('does not match a folder name — only the filename itself is searched', () => {
    const files = [makeFile('ACTAS/notes.pdf'), makeFile('NOTAS/notes.pdf')];
    expect(filterFilesByQuery(files, 'actas')).toEqual([]);
  });

  it('returns an empty array for a blank query', () => {
    expect(filterFilesByQuery([makeFile('a.pdf')], '   ')).toEqual([]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterFilesByQuery([makeFile('a.pdf')], 'zzz')).toEqual([]);
  });

  it('sorts matches alphabetically by relative path', () => {
    const files = [makeFile('b_sep.pdf'), makeFile('a_sep.pdf')];
    const results = filterFilesByQuery(files, 'sep');
    expect(results.map((f) => f.relativePath)).toEqual(['a_sep.pdf', 'b_sep.pdf']);
  });

  it('treats multiple whitespace-separated terms as an AND match, in any order', () => {
    const files = [
      makeFile('ACTAS/2014-15_606010102_SEP_1_0.pdf'),
      makeFile('ACTAS/2014-15_606010102_FEB_1_0.pdf'),
      makeFile('ACTAS/2015-16_606010102_SEP_1_0.pdf')
    ];
    const results = filterFilesByQuery(files, '2014 sep');
    expect(results.map((f) => f.relativePath)).toEqual(['ACTAS/2014-15_606010102_SEP_1_0.pdf']);
  });

  it('matches regardless of the order the terms are typed in', () => {
    const files = [makeFile('ACTAS/2014-15_606010102_SEP_1_0.pdf')];
    expect(filterFilesByQuery(files, 'sep 2014')).toHaveLength(1);
    expect(filterFilesByQuery(files, '2014 sep')).toHaveLength(1);
  });

  it('collapses repeated whitespace between terms', () => {
    const files = [makeFile('ACTAS/2014-15_606010102_SEP_1_0.pdf')];
    expect(filterFilesByQuery(files, '2014   sep')).toHaveLength(1);
  });

  it('does not match a term against part of a larger token (e.g. "5" inside "2025")', () => {
    const files = [
      makeFile('Exmenes_y_ejercicios_de_repaso_de_todos_los_temas/IRC_I_2025_Prob_IPv4.pdf'),
      makeFile('TEMA_5_-_NAT.pdf')
    ];
    const results = filterFilesByQuery(files, 'tema 5');
    expect(results.map((f) => f.filename)).toEqual(['TEMA_5_-_NAT.pdf']);
  });

  it('matches a term against the start of a word, e.g. "20" finds "2011" and "tem" finds "temas"', () => {
    const files = [makeFile('INF_EX_2011_SEP.pdf'), makeFile('todos_los_temas.pdf'), makeFile('notes.pdf')];
    expect(filterFilesByQuery(files, '20').map((f) => f.filename)).toEqual(['INF_EX_2011_SEP.pdf']);
    expect(filterFilesByQuery(files, 'tem').map((f) => f.filename)).toEqual(['todos_los_temas.pdf']);
  });

  it('does not match a term in the middle of a word (e.g. "ema" inside "temas")', () => {
    expect(filterFilesByQuery([makeFile('todos_los_temas.pdf')], 'ema')).toEqual([]);
  });

  it('ignores accents in both the filename and the query', () => {
    const files = [makeFile('Prácticas/Práctica_1.pdf')];
    expect(filterFilesByQuery(files, 'practica')).toHaveLength(1);
    expect(filterFilesByQuery([makeFile('practica_1.pdf')], 'práctica')).toHaveLength(1);
  });

  it('splits punctuation inside a term like a space, e.g. "tema-3" finds "TEMA_3.pdf"', () => {
    expect(filterFilesByQuery([makeFile('TEMA_3.pdf'), makeFile('TEMA_4.pdf')], 'tema-3')).toHaveLength(1);
  });
});
