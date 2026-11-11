// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseFilesPage } from '../src/dashboard/pages/CourseFilesPage';
import { courseStore } from '../src/lib/db';
import type { Course } from '../src/types';

beforeEach(() => {
  vi.stubGlobal('chrome', { runtime: { onMessage: { addListener: vi.fn(), removeListener: vi.fn() } } });
});

afterEach(() => {
  act(() => cleanup());
  vi.unstubAllGlobals();
});

async function renderCourse(overrides: Partial<Course>): Promise<HTMLElement> {
  await courseStore.put({
    id: 'titled',
    name: 'DESO',
    tagged: true,
    autoName: 'Desarrollo de Software',
    fullName: 'Desarrollo de Software',
    url: '',
    matchedUrls: [],
    createdAt: 1,
    lastSyncedAt: 1,
    order: 0,
    firstSyncCompleted: true,
    hidden: false,
    ...overrides
  });
  render(<CourseFilesPage courseId="titled" courseName="DESO" onBack={() => {}} />);
  return screen.findByRole('heading', { name: /Desarrollo de Software/ });
}

describe("a course page's title", () => {
  it('ends with the academic year, a space after the full name', async () => {
    const title = await renderCourse({ academicYear: '25-26' });
    expect(title).toHaveTextContent(/^Desarrollo de Software 25-26$/);
    expect(screen.getByTitle(/^Academic year/)).toHaveTextContent('25-26');
  });

  it('is just the name without one', async () => {
    const title = await renderCourse({ academicYear: undefined });
    expect(title).toHaveTextContent(/^Desarrollo de Software$/);
    expect(screen.queryByTitle(/^Academic year/)).toBeNull();
  });
});
