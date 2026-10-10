// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IgnoredFilesModal } from '../src/dashboard/components/IgnoredFilesModal';

afterEach(() => act(() => cleanup()));

describe('IgnoredFilesModal', () => {
  it('adds typed paths, refuses the same file twice, and saves only on Save', async () => {
    const onSave = vi.fn();
    render(<IgnoredFilesModal paths={['apuntes.pdf']} coursePaths={['apuntes.pdf', 'Tema_1/apuntes.pdf']} onSave={onSave} onClose={() => {}} />);

    const input = screen.getByLabelText('File path');
    await userEvent.type(input, 'Tema 1/apuntes.pdf{Enter}');
    expect(screen.getByText('Tema 1/apuntes.pdf')).toBeInTheDocument();

    // The root apuntes.pdf is already there; the one in Tema_1 (just added) too.
    await userEvent.type(input, '/apuntes.pdf{Enter}');
    expect(screen.getByText('That file is already in the list.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(['apuntes.pdf', 'Tema 1/apuntes.pdf']);
  });

  it('removes a path, and flags one that matches no file of the course', async () => {
    const onSave = vi.fn();
    render(<IgnoredFilesModal paths={['apuntes.pdf', 'futuro.pdf']} coursePaths={['apuntes.pdf']} onSave={onSave} onClose={() => {}} />);

    expect(screen.getAllByText('Not in this course yet')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Stop ignoring apuntes.pdf' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(['futuro.pdf']);
  });

  it('changes nothing on Cancel', async () => {
    const onSave = vi.fn();
    render(<IgnoredFilesModal paths={[]} coursePaths={[]} onSave={onSave} onClose={() => {}} />);
    await userEvent.type(screen.getByLabelText('File path'), 'a.pdf{Enter}');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSave).not.toHaveBeenCalled();
  });
});
