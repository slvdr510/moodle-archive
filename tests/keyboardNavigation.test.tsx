// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const openVersionInBrowserMock = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/openFile', () => ({ openVersionInBrowser: openVersionInBrowserMock, downloadVersion: vi.fn() }));

import { ConfirmModal } from '../src/dashboard/components/ConfirmModal';
import { focusItem, neighbor } from '../src/dashboard/hooks/keyboardNavigation';
import { useDialogKeys } from '../src/dashboard/hooks/useDialogKeys';
import { useFileListKeys } from '../src/dashboard/hooks/useFileListKeys';
import { useKeyboardMode } from '../src/dashboard/hooks/useKeyboardMode';
import { useOptionsKey } from '../src/dashboard/hooks/useOptionsKey';
import { CourseFilesPage } from '../src/dashboard/pages/CourseFilesPage';
import { CoursesPage } from '../src/dashboard/pages/CoursesPage';
import { courseStore } from '../src/lib/db';
import { sha256 } from '../src/lib/hash';
import { processEntriesForCourse } from '../src/lib/repository';
import type { Course } from '../src/types';

// jsdom lays nothing out: everything counts as shown, and scrolling into view is a no-op.
const { getClientRects } = Element.prototype;
beforeAll(() => {
  Element.prototype.getClientRects = () => [{}] as unknown as DOMRectList;
  Element.prototype.scrollIntoView = () => {};
});
afterAll(() => {
  Element.prototype.getClientRects = getClientRects;
});

beforeEach(() => {
  vi.stubGlobal('chrome', {
    runtime: { onMessage: { addListener: vi.fn(), removeListener: vi.fn() } },
    tabs: { create: vi.fn() }
  });
});

afterEach(() => {
  act(() => cleanup());
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.keyboardNav;
});

function placed(left: number, top: number, width = 100, height = 50): HTMLElement {
  const el = document.createElement('div');
  el.getBoundingClientRect = () =>
    ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

describe('neighbor', () => {
  // Two centered rows of different lengths: three cards, then two.
  //   [a] [b] [c]
  //     [d] [e]
  function grid() {
    const a = placed(0, 0);
    const b = placed(120, 0);
    const c = placed(240, 0);
    const d = placed(60, 70);
    const e = placed(180, 70);
    return { items: [a, b, c, d, e], a, b, c, d, e };
  }

  it('goes left and right along the items, on to the next row past the end of one', () => {
    const { items, a, b, c, d } = grid();
    expect(neighbor(items, a, 'ArrowRight')).toBe(b);
    expect(neighbor(items, c, 'ArrowRight')).toBe(d);
    expect(neighbor(items, d, 'ArrowLeft')).toBe(c);
    expect(neighbor(items, a, 'ArrowLeft')).toBeUndefined();
  });

  it('mirrors left and right in a right-to-left language', () => {
    const { items, a, b } = grid();
    a.style.direction = 'rtl';
    b.style.direction = 'rtl';
    expect(neighbor(items, a, 'ArrowLeft')).toBe(b);
    expect(neighbor(items, b, 'ArrowRight')).toBe(a);
  });

  it('goes up and down to the item closest across in the row above or below', () => {
    const { items, a, b, c, d, e } = grid();
    expect(neighbor(items, a, 'ArrowDown')).toBe(d);
    expect(neighbor(items, c, 'ArrowDown')).toBe(e);
    expect(neighbor(items, d, 'ArrowDown')).toBeUndefined();
    expect(neighbor(items, b, 'ArrowUp')).toBeUndefined();
  });

  it('breaks a tie between two items equally close toward the side of its own row it is on', () => {
    const { items, a, c, d, e } = grid();
    expect(neighbor(items, d, 'ArrowUp')).toBe(a);
    expect(neighbor(items, e, 'ArrowUp')).toBe(c);
  });
});

function WithOptionsKey({ children }: { children: ComponentChildren }) {
  useOptionsKey();
  useDialogKeys();
  return <>{children}</>;
}

const menuItems = () => [...document.querySelectorAll<HTMLElement>('.dropdown-menu button')];

function makeCourse(id: string, name: string, order: number): Course {
  return { id, name, url: '', matchedUrls: [], createdAt: 0, lastSyncedAt: 0, order, firstSyncCompleted: true, hidden: false };
}

describe('the courses list with the keyboard', () => {
  async function renderCourses(focusCourseId?: string) {
    for (const course of [makeCourse('kb-a', 'Course A', 0), makeCourse('kb-b', 'Course B', 1)]) await courseStore.put(course);
    const onOpenCourse = vi.fn();
    render(
      <WithOptionsKey>
        <CoursesPage onOpenCourse={onOpenCourse} headerMenuSlot={null} focusCourseId={focusCourseId} />
      </WithOptionsKey>
    );
    await screen.findByText('Course B');
    const card = (name: string) => screen.getByText(name).closest('li')!;
    return { onOpenCourse, card };
  }

  it('puts the focus on the first course with any arrow, moves it with the arrows, and opens the course with Enter or space', async () => {
    const { onOpenCourse, card } = await renderCourses();

    await userEvent.keyboard('{ArrowUp}');
    expect(card('Course A')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(card('Course B')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(card('Course A')).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onOpenCourse).toHaveBeenCalledWith('kb-a', 'Course A', undefined);
    await userEvent.keyboard('{ArrowRight}[Space]');
    expect(onOpenCourse).toHaveBeenLastCalledWith('kb-b', 'Course B', undefined);
  });

  it('goes on from the course it was on once the mouse took the focus away', async () => {
    const { card } = await renderCourses();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(card('Course B')).toHaveFocus();

    act(() => card('Course B').blur());
    await userEvent.keyboard('{ArrowDown}');
    expect(card('Course B')).toHaveFocus();
  });

  it("opens the course's options with Shift on its own, moves through them with the arrows, and closes them with Escape", async () => {
    const { card } = await renderCourses();
    await userEvent.keyboard('{ArrowRight}');
    expect(card('Course A')).toHaveFocus();

    await userEvent.keyboard('{Shift}');
    await waitFor(() => expect(menuItems()[0]).toHaveFocus());
    expect(menuItems()[0]).toHaveTextContent('Set tag (abbreviation)');
    await userEvent.keyboard('{ArrowDown}');
    expect(menuItems()[1]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(menuItems().at(-1)).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(document.querySelector('.dropdown-menu')).toBeNull();
    expect(card('Course A')).toHaveFocus();
  });

  it('opens nothing with Shift held for a capital letter', async () => {
    await renderCourses();
    await userEvent.keyboard('{ArrowRight}{Shift>}A{/Shift}');
    expect(document.querySelector('.dropdown-menu')).toBeNull();
  });

  it('gives the focus back to the course it was asked to', async () => {
    const { card } = await renderCourses('kb-b');
    await waitFor(() => expect(card('Course B')).toHaveFocus());
  });
});

describe('a course page with the keyboard', () => {
  async function renderFiles() {
    await courseStore.put(makeCourse('kb-files', 'kb-files', 0));
    const encoder = new TextEncoder();
    const entries = await Promise.all(
      ['Curso/Temas/a.pdf', 'Curso/b.pdf', 'Curso/c.pdf'].map(async (relativePath) => {
        const content = encoder.encode(relativePath);
        return { relativePath, content, sha256: await sha256(content), size: content.length };
      })
    );
    await processEntriesForCourse('kb-files', entries, 1_000, true);
    render(
      <WithOptionsKey>
        <CourseFilesPage courseId="kb-files" courseName="c" onBack={() => {}} />
      </WithOptionsKey>
    );
    const folder = (await screen.findByText('Temas')).closest<HTMLElement>('.folder-row-header')!;
    const file = (name: string) => screen.getByTitle(name).closest<HTMLElement>('.file-row-header')!;
    return { folder, file };
  }

  it('moves from row to row with up and down, opens a folder with Enter and a file with space', async () => {
    const { folder, file } = await renderFiles();
    // Past the frame where the folder's own effect sets it closed (see CourseFilesPageRefresh).
    await new Promise((resolve) => setTimeout(resolve, 50));

    await userEvent.keyboard('{ArrowDown}');
    expect(folder).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(file('b.pdf')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{Enter}');
    expect(await screen.findByTitle('a.pdf')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}');
    expect(file('a.pdf')).toHaveFocus();

    await userEvent.keyboard('[Space]');
    await waitFor(() => expect(openVersionInBrowserMock).toHaveBeenCalledWith(expect.anything(), 'a.pdf', expect.anything(), 'a.pdf'));
  });

  it("moves along a row's buttons with left and right, and back to the row", async () => {
    const { file } = await renderFiles();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const row = file('b.pdf');
    expect(row).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getAllByTitle('Ignore changes to this file').find((b) => row.contains(b))).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getAllByTitle('Delete this file from your history').find((b) => row.contains(b))).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(row).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(row).toHaveFocus();
  });

  it('goes on from the row it was on once the mouse took the focus away', async () => {
    const { file } = await renderFiles();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(file('b.pdf')).toHaveFocus();

    act(() => file('b.pdf').blur());
    await userEvent.keyboard('{ArrowDown}');
    expect(file('b.pdf')).toHaveFocus();
  });

  it("goes with Shift straight to a file's download button, with no menu, and downloads it with Enter", async () => {
    const { file } = await renderFiles();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const row = file('b.pdf');

    await userEvent.keyboard('{Shift}');
    const download = screen.getAllByTitle('Download to your Downloads folder').find((button) => row.contains(button))!;
    await waitFor(() => expect(download).toHaveFocus());
    expect(document.querySelector('.dropdown-menu')).toBeNull();

    // From there, along the row's buttons as ever.
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getAllByTitle('Delete this file from your history').find((button) => row.contains(button))).toHaveFocus();
  });

  it("goes with Shift straight to a folder's download button", async () => {
    const { folder } = await renderFiles();
    await userEvent.keyboard('{ArrowDown}{Shift}');
    const download = screen.getAllByTitle('Download this folder as a zip').find((button) => folder.contains(button))!;
    await waitFor(() => expect(download).toHaveFocus());
    expect(document.querySelector('.dropdown-menu')).toBeNull();
  });

  it('goes down from the search box to the first row, and back up to it from there', async () => {
    const { folder } = await renderFiles();
    const search = screen.getByRole('textbox');
    search.focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(folder).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(search).toHaveFocus();
  });
});

function MiddleList() {
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useFileListKeys(listRef, searchRef);
  return (
    <>
      <input ref={searchRef} />
      <ul ref={listRef} className="file-list">
        {Array.from({ length: 10 }, (_, i) => (
          <li key={i}>
            <div className="file-row-header" tabIndex={-1}>
              row {i}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

describe('a course page list with the keyboard, scrolled', () => {
  it('scrolls the list to keep the row in focus in its middle', async () => {
    render(<MiddleList />);
    // A 200px-tall list of 50px rows, laid out as a browser would, scrolled by scrollTop.
    const list = document.querySelector<HTMLElement>('.file-list')!;
    let scrollTop = 0;
    Object.defineProperty(list, 'scrollTop', { get: () => scrollTop, set: (value: number) => (scrollTop = value) });
    Object.defineProperty(list, 'clientHeight', { value: 200 });
    list.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
    document.querySelectorAll<HTMLElement>('.file-list li').forEach((item, i) => {
      item.getBoundingClientRect = () => ({ top: i * 50 - scrollTop }) as DOMRect;
      Object.defineProperty(item.firstElementChild, 'offsetHeight', { value: 50 });
    });

    await userEvent.keyboard('{ArrowDown}'.repeat(6));
    expect(screen.getByText('row 5')).toHaveFocus();
    // Row 5's middle (5 × 50 + 25) at the list's middle (100).
    expect(scrollTop).toBe(175);
    await userEvent.keyboard('{ArrowUp}');
    expect(scrollTop).toBe(125);
  });
});

function KeyboardModeList() {
  useKeyboardMode();
  return (
    <ul className="file-list">
      <li tabIndex={-1}>row</li>
    </ul>
  );
}

describe('keyboard or mouse', () => {
  it('ignores the pointer from an arrow key on, until the mouse really moves: then the row in focus loses it', () => {
    render(<KeyboardModeList />);
    const row = screen.getByText('row');
    const root = document.documentElement;
    const move = (x: number, y = 10) => window.dispatchEvent(new MouseEvent('mousemove', { screenX: x, screenY: y }));
    move(10);

    act(() => focusItem(row));
    expect(root).toHaveAttribute('data-keyboard-nav');
    expect(row).toHaveFocus();

    // A mouse no one moves: what's under it scrolling (reported as a move where it is),
    // and a pixel or two of jitter around there, however long it goes on.
    for (const [x, y] of [[10, 10], [11, 10], [10, 11], [12, 9], [11, 11], [9, 10], [11, 9], [10, 12]]) move(x, y);
    expect(root).toHaveAttribute('data-keyboard-nav');
    expect(row).toHaveFocus();

    // Moving it: away from there.
    move(14);
    move(18);
    expect(root).not.toHaveAttribute('data-keyboard-nav');
    expect(row).not.toHaveFocus();
  });
});

function DeleteThing({ onConfirm, onCancel, danger = true }: { onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  useDialogKeys();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Delete it</button>
      {open && (
        <ConfirmModal
          title="Delete?"
          message="Really?"
          confirmLabel="Delete"
          danger={danger}
          onConfirm={() => {
            setOpen(false);
            onConfirm();
          }}
          onCancel={() => {
            setOpen(false);
            onCancel();
          }}
        />
      )}
    </>
  );
}

describe('dialogs with the keyboard', () => {
  it('opens on Cancel when it deletes, moves with the arrows, and gives the focus back once closed', async () => {
    const onConfirm = vi.fn();
    render(<DeleteThing onConfirm={onConfirm} onCancel={vi.fn()} />);
    const opener = screen.getByRole('button', { name: 'Delete it' });
    opener.focus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalled();
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('opens on its confirm button otherwise', async () => {
    render(<DeleteThing onConfirm={vi.fn()} onCancel={vi.fn()} danger={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete it' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus());
  });

  it('closes with Escape, as a click outside it does', async () => {
    const onCancel = vi.fn();
    render(<DeleteThing onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete it' }));
    await screen.findByText('Really?');

    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('Really?')).not.toBeInTheDocument());
  });
});
