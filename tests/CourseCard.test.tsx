// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CourseCard } from '../src/dashboard/components/CourseCard';
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
// these are just inert defaults so CourseCard's required props are met.
const dragNoops = {
  onEditInfo: vi.fn(),
  onExport: vi.fn(),
  onHide: vi.fn(),
  onDragStart: vi.fn(),
  onDragOver: vi.fn(),
  onDrop: vi.fn(),
  onDragEnd: vi.fn(),
  isDragging: false,
  isDragOver: false
};

describe('CourseCard', () => {
  it('opens the course when the row is clicked', async () => {
    const onOpen = vi.fn();
    render(<CourseCard course={makeCourse()} onOpen={onOpen} onDelete={vi.fn()} {...dragNoops} />);

    await userEvent.click(screen.getByText('F GII Recursos CVUHU RE'));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('shows the menu on "⋮" click without opening the course', async () => {
    const onOpen = vi.fn();
    render(<CourseCard course={makeCourse()} onOpen={onOpen} onDelete={vi.fn()} {...dragNoops} />);

    await userEvent.click(screen.getByTitle('More options'));

    // Its info edited all in one place, then what's done with the course itself.
    expect([...document.querySelectorAll('.dropdown-menu button')].map((b) => b.textContent)).toEqual([
      'Edit course info',
      'Export',
      'Hide course',
      'Delete course'
    ]);
    // Each with its icon at its start, left out of what's read aloud.
    for (const button of document.querySelectorAll('.dropdown-menu button')) {
      expect(button.firstElementChild).toHaveClass('dropdown-menu-icon');
      expect(button.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    }
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('"Delete course" calls onDelete without opening the course', async () => {
    const onDelete = vi.fn();
    const onOpen = vi.fn();
    render(<CourseCard course={makeCourse()} onOpen={onOpen} onDelete={onDelete} {...dragNoops} />);

    await userEvent.click(screen.getByTitle('More options'));
    await userEvent.click(screen.getByText('Delete course'));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('"Export" calls onExport without opening the course', async () => {
    const onExport = vi.fn();
    const onOpen = vi.fn();
    render(
      <CourseCard
        course={makeCourse()}
        onOpen={onOpen}
       
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
      <CourseCard
        course={makeCourse()}
        onOpen={onOpen}
       
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
        <CourseCard course={makeCourse()} onOpen={vi.fn()} onDelete={vi.fn()} {...dragNoops} />
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
      <CourseCard course={makeCourse({ lastSyncedAt })} onOpen={vi.fn()} onDelete={vi.fn()} {...dragNoops} />
    );
    expect(screen.getByTitle('Last downloaded')).toHaveTextContent('3h ago');
  });

  it('opens the course URL in a new tab without opening the course view', async () => {
    const createMock = vi.fn();
    vi.stubGlobal('chrome', { tabs: { create: createMock } });
    const onOpen = vi.fn();

    render(<CourseCard course={makeCourse()} onOpen={onOpen} onDelete={vi.fn()} {...dragNoops} />);
    await userEvent.click(screen.getByTitle('Open the course in Moodle'));

    expect(createMock).toHaveBeenCalledWith({ url: 'https://moodle.example/course/view.php?id=1' });
    expect(onOpen).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('shows a tagged course as its tag, with its full name beneath', () => {
    render(
      <CourseCard
        course={makeCourse({ name: 'SO', tagged: true, autoName: 'Sistemas Operativos' })}
        onOpen={vi.fn()}
       
        onDelete={vi.fn()}
        {...dragNoops}
      />
    );
    expect(screen.getByText('SO')).toBeInTheDocument();
    expect(screen.getByText('Sistemas Operativos')).toBeInTheDocument();
  });

  it('shows a full name set by hand in place of the one from Moodle', () => {
    render(
      <CourseCard
        course={makeCourse({ name: 'SO', tagged: true, autoName: 'F GII SO', fullName: 'Sistemas Operativos' })}
        onOpen={vi.fn()}
       
        onDelete={vi.fn()}
        {...dragNoops}
      />
    );
    expect(screen.getByText('Sistemas Operativos')).toBeInTheDocument();
    expect(screen.queryByText('F GII SO')).toBeNull();
  });

  it('shows the institution and the academic year set on a course, the year as it was typed', () => {
    const { rerender } = render(<CourseCard course={makeCourse()} onOpen={vi.fn()} onDelete={vi.fn()} {...dragNoops} />);
    expect(screen.queryByTitle('Institution')).toBeNull();
    expect(screen.queryByTitle(/^Academic year/)).toBeNull();

    rerender(
      <CourseCard
        course={makeCourse({ institution: 'UHU', academicYear: '25-26' })}
        onOpen={vi.fn()}
        onDelete={vi.fn()}
        {...dragNoops}
      />
    );
    expect(screen.getByTitle('Institution')).toHaveTextContent('UHU');
    expect(screen.getByTitle(/^Academic year/)).toHaveTextContent('25-26');

    rerender(<CourseCard course={makeCourse({ academicYear: '2025-2026' })} onOpen={vi.fn()} onDelete={vi.fn()} {...dragNoops} />);
    expect(screen.getByTitle(/^Academic year/)).toHaveTextContent('2025-2026');
    // Whole in its tooltip, if cut off.
    expect(screen.getByTitle(/^Academic year/)).toHaveAttribute('title', 'Academic year: 2025-2026');

    // In its year's color.
    rerender(
      <CourseCard course={makeCourse({ academicYear: '25-26' })} academicYearColor="#3f9c45" onOpen={vi.fn()} onDelete={vi.fn()} {...dragNoops} />
    );
    expect(screen.getByTitle(/^Academic year/).style.getPropertyValue('--year-color')).toBe('#3f9c45');
  });

  it('"Edit course info" asks for it for this course, without opening the course', async () => {
    const onEditInfo = vi.fn();
    const onOpen = vi.fn();
    render(<CourseCard course={makeCourse()} onOpen={onOpen} onDelete={vi.fn()} {...dragNoops} onEditInfo={onEditInfo} />);
    await userEvent.click(screen.getByTitle('More options'));
    await userEvent.click(screen.getByText('Edit course info'));
    expect(onEditInfo).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });
});
