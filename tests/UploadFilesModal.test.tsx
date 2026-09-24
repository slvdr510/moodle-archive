// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UploadFilesModal } from '../src/dashboard/components/UploadFilesModal';

afterEach(cleanup);

const folders = [
  { path: 'IRC/Tema_1', label: 'Tema_1' },
  { path: 'IRC/Tema_1/Ejercicios', label: 'Tema_1/Ejercicios' }
];

function renderModal(overrides: Partial<Parameters<typeof UploadFilesModal>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <UploadFilesModal
      files={[new File(['x'], 'notes.pdf')]}
      rootPath="IRC"
      folders={folders}
      existingPaths={new Set()}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />
  );
  return { onConfirm, onCancel };
}

describe('UploadFilesModal', () => {
  it('saves to the course root by default — the real root path, not the visible top level', async () => {
    const { onConfirm } = renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onConfirm).toHaveBeenCalledWith('IRC');
  });

  it('saves to a chosen existing folder', async () => {
    const { onConfirm } = renderModal();
    await userEvent.click(screen.getByLabelText('Existing folder'));
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Existing folder' }), 'IRC/Tema_1/Ejercicios');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onConfirm).toHaveBeenCalledWith('IRC/Tema_1/Ejercicios');
  });

  it('creates a new folder under the root from just its name, and needs a name first', async () => {
    const { onConfirm } = renderModal();
    await userEvent.click(screen.getByLabelText('New folder'));

    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText('New folder name'), 'Practicas');
    await userEvent.click(addButton);
    expect(onConfirm).toHaveBeenCalledWith('IRC/Practicas');
  });

  it('does not let a "/" be typed into the folder name — it is one folder, never a path', async () => {
    const { onConfirm } = renderModal();
    await userEvent.click(screen.getByLabelText('New folder'));

    const input = screen.getByLabelText('New folder name');
    await userEvent.type(input, 'Lab/1');
    expect(input).toHaveValue('Lab1');

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onConfirm).toHaveBeenCalledWith('IRC/Lab1');
  });

  it('disables the existing-folder option when the course has no folders', () => {
    renderModal({ folders: [] });
    expect(screen.getByLabelText('Existing folder')).toBeDisabled();
  });

  describe('when a file with the same name is already in the chosen place', () => {
    const existingPaths = new Set(['IRC/notes.pdf']);

    it('says the file will be added as a new version, and saves it under the same name — no rename or replace choice', async () => {
      const { onConfirm } = renderModal({ existingPaths });

      expect(screen.getByText(/already exists in this folder/)).toBeInTheDocument();
      expect(screen.getByText(/added as a new version/)).toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: /Rename|Replace/ })).not.toBeInTheDocument();
      expect(screen.queryByLabelText('New name for notes.pdf')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(onConfirm).toHaveBeenCalledWith('IRC');
    });

    it('only mentions the files that actually collide', () => {
      renderModal({ files: [new File(['x'], 'notes.pdf'), new File(['y'], 'fresh.pdf')], existingPaths });

      expect(screen.getAllByText(/already exists in this folder/)).toHaveLength(1);
      expect(screen.getByText('notes.pdf')).toBeInTheDocument();
    });

    it('matches on the chosen folder, not the root', async () => {
      renderModal({ existingPaths: new Set(['IRC/Tema_1/notes.pdf']) });
      expect(screen.queryByText(/already exists in this folder/)).not.toBeInTheDocument();

      await userEvent.click(screen.getByLabelText('Existing folder'));
      expect(screen.getByText(/already exists in this folder/)).toBeInTheDocument();
    });

    it('says nothing about a clash while a new folder is picked but not named yet — only the folder name is needed', async () => {
      const { onConfirm } = renderModal({ existingPaths });
      await userEvent.click(screen.getByLabelText('New folder'));

      expect(screen.queryByText(/already exists in this folder/)).not.toBeInTheDocument();

      await userEvent.type(screen.getByLabelText('New folder name'), 'Practicas');
      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(onConfirm).toHaveBeenCalledWith('IRC/Practicas');
    });

    it('says nothing when the chosen folder has no clash, even though another folder does', async () => {
      renderModal({ existingPaths });
      await userEvent.click(screen.getByLabelText('New folder'));
      await userEvent.type(screen.getByLabelText('New folder name'), 'Otra');

      expect(screen.queryByText(/already exists in this folder/)).not.toBeInTheDocument();
    });
  });

  it('cancels without saving', async () => {
    const { onConfirm, onCancel } = renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
