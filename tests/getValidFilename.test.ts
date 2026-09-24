import { describe, expect, it } from 'vitest';
import { getValidFilename } from '../src/content/moodleCrawler';

describe('getValidFilename', () => {
  it('turns accented letters into their plain letter instead of dropping them', () => {
    expect(getValidFilename('Cálculo de la Resistencia')).toBe('Calculo_de_la_Resistencia');
    expect(getValidFilename('Exámenes')).toBe('Examenes');
    expect(getValidFilename('Diseño')).toBe('Diseno');
    expect(getValidFilename('Über Größe')).toBe('Uber_Groe');
    expect(getValidFilename('Ñandú')).toBe('Nandu');
  });

  it('keeps the existing cleanup: spaces become underscores and other symbols are dropped', () => {
    expect(getValidFilename('  tema 1: (intro) ')).toBe('tema_1_intro');
    expect(getValidFilename('notes-v2.final.pdf')).toBe('notes-v2.final.pdf');
  });

  it('still treats a name with nothing usable left as invalid', () => {
    expect(getValidFilename('¿¿??')).toMatch(/^invalid-filename_/);
  });
});
