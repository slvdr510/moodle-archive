// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SetInstitutionModal } from '../src/dashboard/components/SetInstitutionModal';
import type { Course } from '../src/types';

afterEach(() => act(() => cleanup()));

function course(id: string, name: string, overrides: Partial<Course> = {}): Course {
  return {
    id,
    name,
    autoName: name,
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

const courses = [course('a', 'Algebra'), course('b', 'Biologia', { institution: 'US' }), course('c', 'Calculo', { hidden: true })];

describe('SetInstitutionModal', () => {
  it('sets the institution on only the courses picked', async () => {
    const onApply = vi.fn();
    render(<SetInstitutionModal courses={courses} suggestions={['US']} onApply={onApply} onClose={() => {}} />);

    await userEvent.type(screen.getByLabelText('Institution'), 'UHU');
    await userEvent.click(screen.getByLabelText('Algebra'));
    await userEvent.click(screen.getByLabelText(/Calculo/));
    expect(screen.getByText('Courses (2 selected)')).toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Apply to 2 courses' }));
    expect(onApply).toHaveBeenCalledWith(['a', 'c'], 'UHU');
  });

  it('removes the institution when left empty', async () => {
    const onApply = vi.fn();
    render(<SetInstitutionModal courses={courses} suggestions={[]} onApply={onApply} onClose={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Select all' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove from 3 courses' }));
    expect(onApply).toHaveBeenCalledWith(['a', 'b', 'c'], undefined);
  });

  it('can apply nothing until a course is picked, and Cancel applies nothing', async () => {
    const onApply = vi.fn();
    render(<SetInstitutionModal courses={courses} suggestions={[]} onApply={onApply} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: 'Remove from 0 courses' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onApply).not.toHaveBeenCalled();
  });
});
