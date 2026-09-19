// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CourseRow } from '../src/dashboard/components/CourseRow';
import type { Course } from '../src/types';

afterEach(cleanup);

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'course-1',
    name: 'F GII Recursos CVUHU RE',
    url: '',
    matchedUrls: ['https://moodle.example/course/view.php?id=1'],
    createdAt: Date.now(),
    lastSyncedAt: Date.now(),
    order: 0,
    firstSyncCompleted: true,
    hidden: false,
    ...overrides
  };
}

// The actual reordering/export/hide logic lives in CoursesPage (see CoursesPage.test.tsx);
// these are just inert defaults so CourseRow's required props are met.
const dragNoops = {
  onExport: vi.fn(),
  onHide: vi.fn(),
  onDragStart: vi.fn(),
  onDragOver: vi.fn(),
  onDrop: vi.fn(),
  onDragEnd: vi.fn(),
  isDragging: false,
  isDragOver: false
};

describe('CourseRow', () => {
  it('opens the course when the row is clicked', async () => {
    const onOpen = vi.fn();
    render(<CourseRow course={makeCourse()} onOpen={onOpen} onRename={vi.fn()} onDelete={vi.fn()} {...dragNoops} />);

    await userEvent.click(screen.getByText('F GII Recursos CVUHU RE'));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('shows the menu on "⋮" click without opening the course', async () => {
    const onOpen = vi.fn();
    render(<CourseRow course={makeCourse()} onOpen={onOpen} onRename={vi.fn()} onDelete={vi.fn()} {...dragNoops} />);

    await userEvent.click(screen.getByTitle('More options'));

    expect(screen.getByText('Set tag name')).toBeInTheDocument();
    expect(screen.getByText('Delete course')).toBeInTheDocument();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('"Set tag name" switches to an editable input, and Enter commits the rename', async () => {
    const onRename = vi.fn();
    const onOpen = vi.fn();
    render(<CourseRow course={makeCourse()} onOpen={onOpen} onRename={onRename} onDelete={vi.fn()} {...dragNoops} />);

    await userEvent.click(screen.getByTitle('More options'));
    await userEvent.click(screen.getByText('Set tag name'));

    const input = screen.getByDisplayValue('F GII Recursos CVUHU RE');
    await userEvent.clear(input);
    await userEvent.type(input, 'Fisica');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onRename).toHaveBeenCalledWith('Fisica');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('Escape cancels the rename without calling onRename', async () => {
    const onRename = vi.fn();
    render(<CourseRow course={makeCourse()} onOpen={vi.fn()} onRename={onRename} onDelete={vi.fn()} {...dragNoops} />);

    await userEvent.click(screen.getByTitle('More options'));
    await userEvent.click(screen.getByText('Set tag name'));

    const input = screen.getByDisplayValue('F GII Recursos CVUHU RE');
    await userEvent.type(input, ' extra');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText('F GII Recursos CVUHU RE')).toBeInTheDocument();
  });

  it('"Delete course" calls onDelete without opening the course', async () => {
    const onDelete = vi.fn();
    const onOpen = vi.fn();
    render(<CourseRow course={makeCourse()} onOpen={onOpen} onRename={vi.fn()} onDelete={onDelete} {...dragNoops} />);

    await userEvent.click(screen.getByTitle('More options'));
    await userEvent.click(screen.getByText('Delete course'));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('"Export" calls onExport without opening the course', async () => {
    const onExport = vi.fn();
    const onOpen = vi.fn();
    render(
      <CourseRow
        course={makeCourse()}
        onOpen={onOpen}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        {...dragNoops}
        onExport={onExport}
      />
    );

    await userEvent.click(screen.getByTitle('More options'));
    await userEvent.click(screen.getByText('Export'));

    expect(onExport).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('"Hide course" calls onHide without opening the course', async () => {
    const onHide = vi.fn();
    const onOpen = vi.fn();
    render(
      <CourseRow
        course={makeCourse()}
        onOpen={onOpen}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        {...dragNoops}
        onHide={onHide}
      />
    );

    await userEvent.click(screen.getByTitle('More options'));
    await userEvent.click(screen.getByText('Hide course'));

    expect(onHide).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('closes the menu when clicking outside of it', async () => {
    render(
      <div>
        <CourseRow course={makeCourse()} onOpen={vi.fn()} onRename={vi.fn()} onDelete={vi.fn()} {...dragNoops} />
        <button>outside</button>
      </div>
    );

    await userEvent.click(screen.getByTitle('More options'));
    expect(screen.getByText('Delete course')).toBeInTheDocument();

    await userEvent.click(screen.getByText('outside'));
    expect(screen.queryByText('Delete course')).not.toBeInTheDocument();
  });

  it('shows how long ago the course was last downloaded, instead of its URL', () => {
    const lastSyncedAt = Date.now() - 3 * 60 * 60 * 1000; // 3 hours ago
    render(
      <CourseRow course={makeCourse({ lastSyncedAt })} onOpen={vi.fn()} onRename={vi.fn()} onDelete={vi.fn()} {...dragNoops} />
    );
    expect(screen.getByTitle('Last downloaded')).toHaveTextContent('3h ago');
  });

  it('opens the course URL in a new tab without opening the course view', async () => {
    const createMock = vi.fn();
    vi.stubGlobal('chrome', { tabs: { create: createMock } });
    const onOpen = vi.fn();

    render(<CourseRow course={makeCourse()} onOpen={onOpen} onRename={vi.fn()} onDelete={vi.fn()} {...dragNoops} />);
    await userEvent.click(screen.getByTitle('Open the course in Moodle'));

    expect(createMock).toHaveBeenCalledWith({ url: 'https://moodle.example/course/view.php?id=1' });
    expect(onOpen).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
