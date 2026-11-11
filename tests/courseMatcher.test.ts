import { describe, expect, it } from 'vitest';
import { humanizeCourseTitle, matchCourseForResource, titleKey } from '../src/lib/courseMatcher';
import type { Course } from '../src/types';

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: crypto.randomUUID(),
    name: 'Fisica',
    url: '',
    matchedUrls: [],
    createdAt: Date.now(),
    lastSyncedAt: Date.now(),
    order: 0,
    firstSyncCompleted: true,
    hidden: false,
    ...overrides
  };
}

const UHU_2024 = 'https://2024aulasvirtuales.uhu.es/course/view.php?id=241';
const UHU = 'https://aulasvirtuales.uhu.es/course/view.php?id=241';

describe('matchCourseForResource', () => {
  it('matches by an exact remembered URL first', () => {
    const course = makeCourse({ matchedUrls: ['https://moodle.example/course/view.php?id=1'] });
    const match = matchCourseForResource('https://moodle.example/course/view.php?id=1', 'Something else', [course]);
    expect(match).toBe(course);
  });

  it("takes a course's Resources page for the course, whichever of the two it was downloaded from", () => {
    const fromHome = makeCourse({ matchedUrls: [UHU] });
    expect(matchCourseForResource('https://aulasvirtuales.uhu.es/course/resources.php?id=241', 'Anything', [fromHome])).toBe(fromHome);
    // Saved from its Resources page by an earlier version.
    const fromResources = makeCourse({ matchedUrls: ['https://aulasvirtuales.uhu.es/course/resources.php?id=241'] });
    expect(matchCourseForResource(UHU, 'Anything', [fromResources])).toBe(fromResources);
    // Another course's Resources page is another course.
    expect(matchCourseForResource('https://aulasvirtuales.uhu.es/course/resources.php?id=242', 'Anything', [fromHome])).toBeUndefined();
  });

  it('keeps every Moodle site apart, subdomain included, even with the same course number and title', () => {
    const course = makeCourse({ name: 'Redes de Computadores', autoName: 'Redes de Computadores', matchedUrls: [UHU_2024] });
    expect(matchCourseForResource(UHU, 'Redes de Computadores', [course])).toBeUndefined();
  });

  it("doesn't match a course that has an address on its title alone", () => {
    const course = makeCourse({ name: 'Redes de Computadores', autoName: 'Redes de Computadores', matchedUrls: [UHU_2024] });
    // Another course number on the same site: next year's edition.
    expect(matchCourseForResource('https://2024aulasvirtuales.uhu.es/course/view.php?id=300', 'Redes de Computadores', [course])).toBeUndefined();
    // Another university's.
    expect(matchCourseForResource('https://ev.us.es/course/view.php?id=241', 'Redes de Computadores', [course])).toBeUndefined();
  });

  it('finds a course saved before addresses were recorded by its title, but never by an empty one', () => {
    const course = makeCourse({ name: 'F GII Recursos CVUHU RE' });
    expect(matchCourseForResource(UHU, 'F-GII_Recursos__CVUHU-RE', [course])).toBe(course);

    const untitled = makeCourse({ name: '—' });
    expect(matchCourseForResource(UHU, '***', [untitled])).toBeUndefined();
  });

  it("goes by such a course's Moodle title, not a tag the user set", () => {
    const course = makeCourse({ name: 'RC', tagged: true, autoName: 'Redes de Computadores' });
    expect(matchCourseForResource(UHU, 'Redes de Computadores', [course])).toBe(course);
  });

  it('tells titles apart in any script, and when they only differ after a dot', () => {
    const networks = makeCourse({ autoName: 'Сети и телекоммуникации' });
    const systems = makeCourse({ autoName: '操作系统' });
    const groupA = makeCourse({ autoName: 'Programación 2025/26. Grupo A' });
    const courses = [systems, networks, groupA];
    expect(matchCourseForResource(UHU, 'Сети и телекоммуникации', courses)).toBe(networks);
    expect(matchCourseForResource(UHU, '操作系统', courses)).toBe(systems);
    expect(matchCourseForResource(UHU, 'Базы данных', courses)).toBeUndefined();
    expect(matchCourseForResource(UHU, 'Programación 2025/26. Grupo B', courses)).toBeUndefined();
  });

  it('returns undefined when neither the URL nor the title match anything known', () => {
    const course = makeCourse({ name: 'Fisica', matchedUrls: ['https://moodle.example/course/view.php?id=1'] });
    const match = matchCourseForResource('https://moodle.example/course/view.php?id=99', 'Quimica', [course]);
    expect(match).toBeUndefined();
  });

  it('renaming a course afterwards does not break matching by its remembered URL', () => {
    const course = makeCourse({ name: 'F GII Recursos CVUHU RE', matchedUrls: ['https://moodle.example/course/view.php?id=1'] });
    const renamed = { ...course, name: 'Fisica' };
    const match = matchCourseForResource('https://moodle.example/course/view.php?id=1', 'F-GII_Recursos__CVUHU-RE', [
      renamed
    ]);
    expect(match).toBe(renamed);
  });
});

describe('titleKey', () => {
  it('keeps the letters and digits of any script, without case, accents or separators', () => {
    expect(titleKey('Física II')).toBe('fisicaii');
    expect(titleKey('FISICA_II')).toBe('fisicaii');
    expect(titleKey('Сети и телекоммуникации')).toBe('сетиителекоммуникации');
    expect(titleKey('操作系统 2025')).toBe('操作系统2025');
    expect(titleKey('***')).toBe('');
  });
});

describe('humanizeCourseTitle', () => {
  it('turns underscores/dashes into spaces and collapses repeats', () => {
    expect(humanizeCourseTitle('F-GII_Recursos__CVUHU-RE')).toBe('F GII Recursos CVUHU RE');
  });
});
