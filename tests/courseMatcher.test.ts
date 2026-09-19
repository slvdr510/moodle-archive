import { describe, expect, it } from 'vitest';
import { humanizeCourseTitle, matchCourseForResource } from '../src/lib/courseMatcher';
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

describe('matchCourseForResource', () => {
  it('matches by an exact remembered URL first', () => {
    const course = makeCourse({ matchedUrls: ['https://moodle.example/course/view.php?id=1'] });
    const match = matchCourseForResource('https://moodle.example/course/view.php?id=1', 'Something else', [course]);
    expect(match).toBe(course);
  });

  it('falls back to a slug match against the course name when the URL is unknown', () => {
    const course = makeCourse({ name: 'F GII Recursos CVUHU RE', matchedUrls: ['https://old.example/course'] });
    const match = matchCourseForResource(
      'https://moodle.example/course/view.php?id=2',
      'F-GII_Recursos__CVUHU-RE',
      [course]
    );
    expect(match).toBe(course);
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

describe('humanizeCourseTitle', () => {
  it('turns underscores/dashes into spaces and collapses repeats', () => {
    expect(humanizeCourseTitle('F-GII_Recursos__CVUHU-RE')).toBe('F GII Recursos CVUHU RE');
  });
});
