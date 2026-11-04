// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseFilesPage } from '../src/dashboard/pages/CourseFilesPage';
import { courseStore, fileStore } from '../src/lib/db';
import { sha256 } from '../src/lib/hash';
import { processEntriesForCourse } from '../src/lib/repository';

const listeners = new Set<(message: unknown) => void>();

beforeEach(() => {
  vi.stubGlobal('chrome', {
    runtime: {
      onMessage: {
        addListener: (listener: (message: unknown) => void) => listeners.add(listener),
        removeListener: (listener: (message: unknown) => void) => listeners.delete(listener)
      }
    }
  });
});

afterEach(() => {
  act(() => cleanup());
  listeners.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function downloadSaved(courseId: string): void {
  act(() => listeners.forEach((listener) => listener({ topic: 'course-updated', courseId })));
}

/** One download of a course: each path saved with the given content. */
async function scan(courseId: string, files: Record<string, string>, timestamp: number, isFirstSync = false): Promise<void> {
  const encoder = new TextEncoder();
  const entries = await Promise.all(
    Object.entries(files).map(async ([relativePath, text]) => {
      const content = encoder.encode(text);
      return { relativePath, content, sha256: await sha256(content), size: content.length };
    })
  );
  await processEntriesForCourse(courseId, entries, timestamp, isFirstSync);
}

async function makeCourse(id: string, files: Record<string, string>): Promise<void> {
  await courseStore.put({
    id,
    name: id,
    url: '',
    matchedUrls: [],
    createdAt: 1,
    lastSyncedAt: 1,
    order: 0,
    firstSyncCompleted: true,
    hidden: false
  });
  await scan(id, files, 1_000, true);
}

describe('CourseFilesPage when a download of the course is saved', () => {
  it('shows what the download changed, leaving open folders open', async () => {
    await makeCourse('refreshed', { 'Curso/Temas/a.pdf': 'a1', 'Curso/b.pdf': 'b1' });
    render(<CourseFilesPage courseId="refreshed" courseName="c" onBack={() => {}} />);
    const folder = await screen.findByText('Temas');
    // Past the frame (35ms at most, in Preact) where the row's own effect sets it closed,
    // which would undo the click. It was scheduled before any act() here, so that can't
    // flush it.
    await new Promise((resolve) => setTimeout(resolve, 50));
    await userEvent.click(folder);
    await screen.findByTitle('a.pdf');
    expect(document.querySelector('.version-count')).toBeNull();

    await scan('refreshed', { 'Curso/Temas/a.pdf': 'a2', 'Curso/b.pdf': 'b1', 'Curso/Temas/c.pdf': 'c1' }, 2_000);
    downloadSaved('refreshed');

    expect(await screen.findByTitle('c.pdf')).toBeInTheDocument();
    expect(screen.getByTitle('a.pdf')).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector('.version-count')).toHaveTextContent('2'));
  });

  it('keeps the search typed in', async () => {
    await makeCourse('searching', { 'Curso/a.pdf': 'a1', 'Curso/b.pdf': 'b1' });
    render(<CourseFilesPage courseId="searching" courseName="c" onBack={() => {}} />);
    await screen.findByTitle('a.pdf');
    const search = screen.getByRole('textbox');
    await userEvent.type(search, 'a.pdf');
    await waitFor(() => expect(screen.queryByTitle('b.pdf')).not.toBeInTheDocument());

    await scan('searching', { 'Curso/a.pdf': 'a1', 'Curso/b.pdf': 'b1', 'Curso/aa.pdf': 'new' }, 2_000);
    downloadSaved('searching');

    await waitFor(async () => expect(await fileStore.byCourse('searching')).toHaveLength(3));
    expect(search).toHaveValue('a.pdf');
    expect(screen.queryByTitle('b.pdf')).not.toBeInTheDocument();
  });

  it('reads nothing again for a download of another course, and stops listening once closed', async () => {
    await makeCourse('open', { 'Curso/a.pdf': 'a1', 'Curso/b.pdf': 'b1' });
    const { unmount } = render(<CourseFilesPage courseId="open" courseName="c" onBack={() => {}} />);
    await screen.findByTitle('a.pdf');
    const byCourse = vi.spyOn(fileStore, 'byCourse');

    downloadSaved('another');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(byCourse).not.toHaveBeenCalled();

    act(() => {
      unmount();
    });
    expect(listeners.size).toBe(0);
  });
});
