import { describe, expect, it } from 'vitest';
import { courseHomeUrl, courseViewUrl } from '../src/lib/moodleUrl';

const NEW = 'https://aulasvirtuales.uhu.es/course/view.php?id=241';

describe('courseViewUrl', () => {
  it("keeps a Moodle course page's address up to the course number, as the browser writes it", () => {
    expect(courseViewUrl(NEW)).toBe(NEW);
    expect(courseViewUrl(`  ${NEW}&section=3#tabs `)).toBe(NEW);
    expect(courseViewUrl('HTTPS://AulasVirtuales.UHU.es/course/view.php?id=241')).toBe(NEW);
    expect(courseViewUrl('https://campus.example/moodle/course/view.php?id=7')).toBe('https://campus.example/moodle/course/view.php?id=7');
  });

  it('turns down anything else', () => {
    for (const url of ['', 'aulasvirtuales.uhu.es/course/view.php?id=241', 'https://aulasvirtuales.uhu.es/', 'https://aulasvirtuales.uhu.es/mod/folder/view.php?id=9', 'ftp://example.org/course/view.php?id=1']) {
      expect(courseViewUrl(url)).toBeUndefined();
    }
  });
});

describe('courseHomeUrl', () => {
  it("gives a course's Resources page as the course's main page, and leaves any other address alone", () => {
    expect(courseHomeUrl('https://aulasvirtuales.uhu.es/course/resources.php?id=241')).toBe(NEW);
    expect(courseHomeUrl(NEW)).toBe(NEW);
    expect(courseHomeUrl('https://aulasvirtuales.uhu.es/mod/folder/view.php?id=9')).toBe('https://aulasvirtuales.uhu.es/mod/folder/view.php?id=9');
  });
});
