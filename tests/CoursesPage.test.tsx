// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Course } from '../src/types';

const allMock = vi.hoisted(() => vi.fn());
const putMock = vi.hoisted(() => vi.fn());
const deleteCourseMock = vi.hoisted(() => vi.fn());
const resetTrackedDataMock = vi.hoisted(() => vi.fn());
const exportAllDataMock = vi.hoisted(() => vi.fn());
const exportCourseMock = vi.hoisted(() => vi.fn());
const importAllDataMock = vi.hoisted(() => vi.fn());
const { InvalidBackupError } = vi.hoisted(() => ({ InvalidBackupError: class extends Error {} }));

vi.mock('../src/lib/db', () => ({
  courseStore: { all: allMock, put: putMock },
  deleteCourse: deleteCourseMock,
  resetTrackedData: resetTrackedDataMock
}));
vi.mock('../src/lib/backup', () => ({
  exportAllData: exportAllDataMock,
  exportCourse: exportCourseMock,
  importAllData: importAllDataMock,
  InvalidBackupError
}));

import { CoursesPage } from '../src/dashboard/pages/CoursesPage';

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'course-1',
    name: 'Course',
    url: '',
    matchedUrls: [],
    createdAt: 0,
    lastSyncedAt: 0,
    order: 0,
    firstSyncCompleted: true,
    hidden: false,
    ...overrides
  };
}

const tabsCreateMock = vi.fn();

// The "⋮" toolbar menu is portaled into a DOM node the app header owns (see
// App.tsx) rather than rendered inline by CoursesPage — stand in for that
// node here so the portal has somewhere real to render into.
let headerMenuSlot: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal('chrome', {
    runtime: { onMessage: { addListener: vi.fn(), removeListener: vi.fn() } },
    tabs: { create: tabsCreateMock }
  });
  headerMenuSlot = document.createElement('div');
  document.body.appendChild(headerMenuSlot);
});

afterEach(() => {
  cleanup();
  headerMenuSlot.remove();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

function renderCoursesPage(
  onOpenCourse: (courseId: string, courseName: string, courseUrl: string | undefined) => void = vi.fn()
) {
  return render(<CoursesPage onOpenCourse={onOpenCourse} headerMenuSlot={headerMenuSlot} />);
}

describe('CoursesPage drag-and-drop reordering', () => {
  it('renders courses sorted by their stored order', async () => {
    allMock.mockResolvedValue([
      makeCourse({ id: 'b', name: 'Course B', order: 1 }),
      makeCourse({ id: 'a', name: 'Course A', order: 0 })
    ]);

    renderCoursesPage();
    await screen.findByText('Course A');

    const names = screen.getAllByText(/^Course [AB]$/).map((el) => el.textContent);
    expect(names).toEqual(['Course A', 'Course B']);
  });

  it('dropping a course onto another renumbers and persists every course in the new order', async () => {
    allMock.mockResolvedValue([
      makeCourse({ id: 'a', name: 'Course A', order: 0 }),
      makeCourse({ id: 'b', name: 'Course B', order: 1 }),
      makeCourse({ id: 'c', name: 'Course C', order: 2 })
    ]);

    renderCoursesPage();
    await screen.findByText('Course A');

    const rowA = screen.getByText('Course A').closest('li')!;
    const rowC = screen.getByText('Course C').closest('li')!;

    // Drag "Course A" and drop it onto "Course C" — it should land after C.
    fireEvent.dragStart(rowA);
    fireEvent.dragOver(rowC);
    fireEvent.drop(rowC);

    await waitFor(() => expect(putMock).toHaveBeenCalledTimes(3));

    expect(putMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'b', order: 0 }));
    expect(putMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'c', order: 1 }));
    expect(putMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'a', order: 2 }));

    const names = screen.getAllByText(/^Course [ABC]$/).map((el) => el.textContent);
    expect(names).toEqual(['Course B', 'Course C', 'Course A']);
  });

  it('dropping a course onto itself does nothing', async () => {
    allMock.mockResolvedValue([
      makeCourse({ id: 'a', name: 'Course A', order: 0 }),
      makeCourse({ id: 'b', name: 'Course B', order: 1 })
    ]);

    renderCoursesPage();
    await screen.findByText('Course A');

    const rowA = screen.getByText('Course A').closest('li')!;
    fireEvent.dragStart(rowA);
    fireEvent.dragOver(rowA);
    fireEvent.drop(rowA);

    await Promise.resolve();
    expect(putMock).not.toHaveBeenCalled();
  });
});

describe('CoursesPage toolbar overflow menu', () => {
  it('collapses Export/Import/Reset into a single "More options" menu', async () => {
    allMock.mockResolvedValue([]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));

    expect(screen.getByText('Export all courses')).toBeInTheDocument();
    expect(screen.getByText('Import course(s)')).toBeInTheDocument();
    expect(screen.getByText('Open all course URLs')).toBeInTheDocument();
    expect(screen.getByText('Delete all courses')).toBeInTheDocument();
  });

  it('"Open all course URLs" opens a tab per course that has a known URL', async () => {
    allMock.mockResolvedValue([
      makeCourse({ id: 'a', name: 'Course A', url: 'https://moodle.example/course/view.php?id=1' }),
      makeCourse({ id: 'b', name: 'Course B', url: '', matchedUrls: ['https://moodle.example/course/view.php?id=2'] }),
      makeCourse({ id: 'c', name: 'Course C', url: '', matchedUrls: [] })
    ]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Open all course URLs'));

    expect(tabsCreateMock).toHaveBeenCalledTimes(2);
    expect(tabsCreateMock).toHaveBeenCalledWith({ url: 'https://moodle.example/course/view.php?id=1' });
    expect(tabsCreateMock).toHaveBeenCalledWith({ url: 'https://moodle.example/course/view.php?id=2' });
  });

  it('"Open all course URLs" shows an error instead when no course has a known URL', async () => {
    allMock.mockResolvedValue([makeCourse({ id: 'a', name: 'Course A', url: '', matchedUrls: [] })]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Open all course URLs'));

    expect(tabsCreateMock).not.toHaveBeenCalled();
    expect(screen.getByText('No course URLs to open.')).toBeInTheDocument();
  });

  it('"Export all courses" asks for confirmation before calling exportAllData', async () => {
    allMock.mockResolvedValue([]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Export all courses'));

    expect(screen.getByText('Export all courses?')).toBeInTheDocument();
    expect(exportAllDataMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(exportAllDataMock).toHaveBeenCalledOnce();
  });

  it('cancelling the export confirmation does not call exportAllData', async () => {
    allMock.mockResolvedValue([]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Export all courses'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Export all courses?')).not.toBeInTheDocument();
    expect(exportAllDataMock).not.toHaveBeenCalled();
  });

  it('exporting a single course from its row menu asks for confirmation, then calls exportCourse', async () => {
    allMock.mockResolvedValue([{ id: 'a', name: 'Course A', url: '', matchedUrls: [], createdAt: 0, lastSyncedAt: 0, order: 0, firstSyncCompleted: true }]);
    renderCoursesPage();
    await screen.findByText('Course A');

    // Two "More options" buttons exist now: the toolbar's, and this course row's.
    const rowMenuButton = screen.getAllByTitle('More options')[1];
    await userEvent.click(rowMenuButton);
    await userEvent.click(screen.getByText('Export'));

    expect(screen.getByText('Export "Course A"?')).toBeInTheDocument();
    expect(exportCourseMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(exportCourseMock).toHaveBeenCalledWith('a');
  });

  it('deleting a single course from its row menu asks for confirmation in a modal, then calls deleteCourse', async () => {
    allMock.mockResolvedValue([{ id: 'a', name: 'Course A', url: '', matchedUrls: [], createdAt: 0, lastSyncedAt: 0, order: 0, firstSyncCompleted: true }]);
    renderCoursesPage();
    await screen.findByText('Course A');

    const rowMenuButton = screen.getAllByTitle('More options')[1];
    await userEvent.click(rowMenuButton);
    await userEvent.click(screen.getByText('Delete course'));

    expect(screen.getByText('Delete "Course A"?')).toBeInTheDocument();
    expect(deleteCourseMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(deleteCourseMock).toHaveBeenCalledWith('a');
  });

  it('shows a spinner while an export is in progress', async () => {
    let resolveExport!: () => void;
    exportAllDataMock.mockReturnValue(new Promise<void>((resolve) => (resolveExport = resolve)));
    allMock.mockResolvedValue([]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Export all courses'));
    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(await screen.findByText('Exporting…')).toBeInTheDocument();

    resolveExport();
    await waitFor(() => expect(screen.queryByText('Exporting…')).not.toBeInTheDocument());
  });

  it('"Import course(s)" opens the file picker', async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    allMock.mockResolvedValue([]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Import course(s)'));

    expect(clickSpy).toHaveBeenCalledOnce();
    clickSpy.mockRestore();
  });

  it('"Delete all courses" asks for confirmation in a modal before calling resetTrackedData', async () => {
    allMock.mockResolvedValue([]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Delete all courses'));

    expect(screen.getByText('Delete all courses?')).toBeInTheDocument();
    expect(resetTrackedDataMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(resetTrackedDataMock).toHaveBeenCalledOnce();
  });

  it('cancelling the "Delete all courses" confirmation does not call resetTrackedData', async () => {
    allMock.mockResolvedValue([]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Delete all courses'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Delete all courses?')).not.toBeInTheDocument();
    expect(resetTrackedDataMock).not.toHaveBeenCalled();
  });
});

describe('CoursesPage hiding courses', () => {
  it('"Hide course" removes it from the list and persists hidden: true', async () => {
    // Stateful mocks: reload() re-fetches via courseStore.all() after the hide,
    // so the mock needs to actually reflect the courseStore.put() that happened.
    let coursesData = [makeCourse({ id: 'a', name: 'Course A' })];
    allMock.mockImplementation(async () => coursesData);
    putMock.mockImplementation(async (updated: Course) => {
      coursesData = coursesData.map((c) => (c.id === updated.id ? updated : c));
    });

    renderCoursesPage();
    await screen.findByText('Course A');

    const rowMenuButton = screen.getAllByTitle('More options')[1];
    await userEvent.click(rowMenuButton);
    await userEvent.click(screen.getByText('Hide course'));

    await waitFor(() => expect(screen.queryByText('Course A')).not.toBeInTheDocument());
    expect(putMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'a', hidden: true }));
  });

  it('a hidden course is skipped by "Open all course URLs"', async () => {
    allMock.mockResolvedValue([
      makeCourse({ id: 'a', name: 'Course A', url: 'https://moodle.example/course/view.php?id=1', hidden: true }),
      makeCourse({ id: 'b', name: 'Course B', url: 'https://moodle.example/course/view.php?id=2' })
    ]);
    renderCoursesPage();
    await screen.findByText('Course B');

    // The toolbar's "More options" is first; "Course B"'s own row menu is second.
    await userEvent.click(screen.getAllByTitle('More options')[0]);
    await userEvent.click(screen.getByText('Open all course URLs'));

    expect(tabsCreateMock).toHaveBeenCalledOnce();
    expect(tabsCreateMock).toHaveBeenCalledWith({ url: 'https://moodle.example/course/view.php?id=2' });
  });

  it('"Show hidden courses" lists hidden courses in a modal, and "Unhide" restores one', async () => {
    const hiddenCourse = makeCourse({ id: 'a', name: 'Hidden Course', hidden: true });
    allMock.mockResolvedValue([hiddenCourse]);
    renderCoursesPage();

    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Show hidden courses'));

    expect(screen.getByText('Hidden Course')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Unhide' }));

    expect(putMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'a', hidden: false }));
  });

  it('"Show hidden courses" says so when nothing is hidden', async () => {
    allMock.mockResolvedValue([makeCourse({ id: 'a', name: 'Course A' })]);
    renderCoursesPage();
    await screen.findByText('Course A');

    // The toolbar's "More options" is first; "Course A"'s own row menu is second.
    await userEvent.click(screen.getAllByTitle('More options')[0]);
    await userEvent.click(screen.getByText('Show hidden courses'));

    expect(screen.getByText('No courses are hidden.')).toBeInTheDocument();
  });

  it('shows a dedicated message when every course is hidden', async () => {
    allMock.mockResolvedValue([makeCourse({ id: 'a', name: 'Course A', hidden: true })]);
    renderCoursesPage();

    expect(await screen.findByText(/All your courses are hidden/)).toBeInTheDocument();
  });
});

describe('CoursesPage dropping zip backups to import', () => {
  const summary = { courses: 1, files: 2, versions: 3, recentOpens: 0 };
  const zip = (name: string) => new File(['zip-bytes'], name, { type: 'application/zip' });

  /** A drag of files from outside the browser, as the window sees it. */
  function dropFiles(files: File[]) {
    fireEvent.drop(window, { dataTransfer: { types: ['Files'], files, items: [] } });
  }

  it('imports a dropped .zip and refreshes the list', async () => {
    allMock.mockResolvedValue([]);
    importAllDataMock.mockResolvedValue(summary);
    renderCoursesPage();
    await waitFor(() => expect(allMock).toHaveBeenCalledOnce());

    const backup = zip('moodle-archive-backup.zip');
    dropFiles([backup]);

    expect(await screen.findByText('Imported 1 course(s), 2 file(s), 3 version(s).')).toBeInTheDocument();
    expect(importAllDataMock).toHaveBeenCalledOnce();
    expect(importAllDataMock).toHaveBeenCalledWith(backup);
    expect(allMock).toHaveBeenCalledTimes(2);
  });

  const NOT_A_BACKUP = /is not a zip file in the course format used by this extension\./;

  it('imports every dropped zip and adds their totals up', async () => {
    allMock.mockResolvedValue([]);
    importAllDataMock.mockResolvedValue(summary);
    renderCoursesPage();
    await waitFor(() => expect(allMock).toHaveBeenCalledOnce());

    dropFiles([zip('a.zip'), zip('B.ZIP')]);

    expect(await screen.findByText('Imported 2 course(s), 4 file(s), 6 version(s).')).toBeInTheDocument();
    expect(importAllDataMock.mock.calls.map(([file]) => (file as File).name)).toEqual(['a.zip', 'B.ZIP']);
  });

  it('warns, importing nothing, when a dropped file is not a zip at all', async () => {
    allMock.mockResolvedValue([]);
    renderCoursesPage();
    await waitFor(() => expect(allMock).toHaveBeenCalledOnce());

    dropFiles([new File(['x'], 'notes.pdf')]);

    const message = await screen.findByText(NOT_A_BACKUP);
    expect(message).toHaveTextContent('"notes.pdf" is not a zip file in the course format used by this extension.');
    expect(message).toHaveClass('error');
    expect(importAllDataMock).not.toHaveBeenCalled();
  });

  it('warns about a .zip that is not in the extension\'s course format, and changes nothing', async () => {
    allMock.mockResolvedValue([]);
    importAllDataMock.mockRejectedValue(new InvalidBackupError('missing data.json'));
    renderCoursesPage();
    await waitFor(() => expect(allMock).toHaveBeenCalledOnce());

    dropFiles([zip('holiday-photos.zip')]);

    const message = await screen.findByText(NOT_A_BACKUP);
    expect(message).toHaveTextContent('"holiday-photos.zip" is not a zip file in the course format');
    expect(message).not.toHaveTextContent('Imported');
    expect(message).toHaveClass('error');
  });

  it('still imports the valid backups in a drop that also holds files that are not', async () => {
    allMock.mockResolvedValue([]);
    importAllDataMock.mockResolvedValue(summary);
    renderCoursesPage();
    await waitFor(() => expect(allMock).toHaveBeenCalledOnce());

    dropFiles([new File(['x'], 'notes.pdf'), zip('good.zip')]);

    const message = await screen.findByText(NOT_A_BACKUP);
    expect(message).toHaveTextContent('Imported 1 course(s), 2 file(s), 3 version(s).');
    expect(message).toHaveTextContent('"notes.pdf" is not a zip file');
    expect(importAllDataMock).toHaveBeenCalledOnce();
  });

  it('keeps going after a valid-looking zip that fails for another reason, and reports both outcomes', async () => {
    allMock.mockResolvedValue([]);
    importAllDataMock.mockRejectedValueOnce(new Error('disk full')).mockResolvedValueOnce(summary);
    renderCoursesPage();
    await waitFor(() => expect(allMock).toHaveBeenCalledOnce());

    dropFiles([zip('broken.zip'), zip('good.zip')]);

    const message = await screen.findByText(/Could not import/);
    expect(message).toHaveTextContent('Imported 1 course(s), 2 file(s), 3 version(s).');
    expect(message).toHaveTextContent('"broken.zip": Error: disk full');
    expect(message).not.toHaveTextContent('course format');
    expect(message).toHaveClass('error');
  });

  it('shows a drop overlay while files are dragged over the page, but not for reordering a course', async () => {
    allMock.mockResolvedValue([makeCourse({ id: 'a', name: 'Course A' })]);
    renderCoursesPage();
    await screen.findByText('Course A');

    fireEvent.dragEnter(window, { dataTransfer: { types: ['text/plain'] } });
    expect(screen.queryByText(/Drop \.zip backups/)).not.toBeInTheDocument();

    fireEvent.dragEnter(window, { dataTransfer: { types: ['Files'] } });
    expect(screen.getByText(/Drop \.zip backups/)).toBeInTheDocument();

    fireEvent.dragLeave(window, { dataTransfer: { types: ['Files'] } });
    expect(screen.queryByText(/Drop \.zip backups/)).not.toBeInTheDocument();
  });

  it('ignores a drop while a confirmation dialog is open', async () => {
    allMock.mockResolvedValue([]);
    renderCoursesPage();
    await userEvent.click(await screen.findByTitle('More options'));
    await userEvent.click(screen.getByText('Delete all courses'));
    expect(screen.getByText('Delete all courses?')).toBeInTheDocument();

    dropFiles([zip('backup.zip')]);

    expect(importAllDataMock).not.toHaveBeenCalled();
  });
});

describe('CoursesPage with no courses yet', () => {
  it('explains how to get started exactly once, as three steps', async () => {
    allMock.mockResolvedValue([]);
    const { container } = renderCoursesPage();

    expect(await screen.findAllByText('No courses yet')).toHaveLength(1);
    const steps = Array.from(container.querySelectorAll('.empty-steps li')).map((step) => step.textContent);
    expect(steps).toEqual(['Open a course in Moodle', 'Click the extension icon', 'Press Download']);
  });

  it('mentions that a backup .zip can be dropped on the page', async () => {
    allMock.mockResolvedValue([]);
    renderCoursesPage();

    expect(await screen.findByText(/Already have a backup\?/)).toHaveTextContent('Drop its .zip anywhere on this page to import it.');
  });
});
