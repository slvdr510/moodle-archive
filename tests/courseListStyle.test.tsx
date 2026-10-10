// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CourseListStyleModal } from '../src/dashboard/components/CourseListStyleModal';
import { DEFAULT_COURSE_LIST_STYLE, getCourseListStyle, setCourseListStyle } from '../src/lib/courseListStyle';

afterEach(() => {
  act(() => cleanup());
  localStorage.clear();
});

describe('courseListStyle', () => {
  it('defaults to cards when nothing valid is stored', () => {
    expect(getCourseListStyle()).toBe(DEFAULT_COURSE_LIST_STYLE);
    expect(DEFAULT_COURSE_LIST_STYLE).toBe('cards');
    localStorage.setItem('moodle-archive-course-list-style', 'tiles');
    expect(getCourseListStyle()).toBe('cards');
    setCourseListStyle('rows');
    expect(getCourseListStyle()).toBe('rows');
  });

  it('applies the choice live, and Cancel restores the previous one', async () => {
    render(<CourseListStyleModal onClose={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Cards' })).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('radio', { name: 'Rows' }));
    expect(getCourseListStyle()).toBe('rows');
    expect(screen.getByRole('radio', { name: 'Rows' })).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(getCourseListStyle()).toBe('cards');
  });

  it('keeps the choice on Save', async () => {
    const onClose = vi.fn();
    render(<CourseListStyleModal onClose={onClose} />);

    await userEvent.click(screen.getByRole('radio', { name: 'Rows' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(getCourseListStyle()).toBe('rows');
    expect(onClose).toHaveBeenCalled();
  });
});
