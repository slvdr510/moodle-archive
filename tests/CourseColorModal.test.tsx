// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CourseColorModal } from '../src/dashboard/components/CourseColorModal';
import { COURSE_COLORS } from '../src/lib/courseColors';
import type { Course } from '../src/types';

afterEach(() => act(() => cleanup()));

const course: Course = {
  id: 'c1',
  name: 'SO',
  tagged: true,
  autoName: 'Sistemas Operativos',
  url: '',
  matchedUrls: [],
  createdAt: 0,
  lastSyncedAt: 0,
  order: 0,
  firstSyncCompleted: true,
  hidden: false
};

describe('CourseColorModal', () => {
  it('saves a color picked from the palette', async () => {
    const onSave = vi.fn();
    render(<CourseColorModal course={course} autoColor="#e5484d" onSave={onSave} onClose={() => {}} />);
    await userEvent.click(screen.getByRole('radio', { name: COURSE_COLORS[3] }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(COURSE_COLORS[3]);
  });

  it('saves any color from the custom picker', async () => {
    const onSave = vi.fn();
    render(<CourseColorModal course={course} autoColor="#e5484d" onSave={onSave} onClose={() => {}} />);
    fireEvent.input(screen.getByLabelText('Custom color'), { target: { value: '#abcdef' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('#abcdef');
  });

  it('goes back to the automatic color, and Cancel saves nothing', async () => {
    const onSave = vi.fn();
    render(<CourseColorModal course={{ ...course, color: '#abcdef' }} autoColor="#e5484d" onSave={onSave} onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Use automatic color' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(undefined);

    onSave.mockClear();
    act(() => cleanup());
    render(<CourseColorModal course={course} autoColor="#e5484d" onSave={onSave} onClose={() => {}} />);
    await userEvent.click(screen.getByRole('radio', { name: COURSE_COLORS[0] }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSave).not.toHaveBeenCalled();
  });
});
