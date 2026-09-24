// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CourseFilesPage } from '../src/dashboard/pages/CourseFilesPage';
import { courseStore, fileStore, versionStore } from '../src/lib/db';
import { sha256 } from '../src/lib/hash';
import { processEntriesForCourse } from '../src/lib/repository';

afterEach(cleanup);

// jsdom's File has no arrayBuffer(), which the upload path relies on (real browsers do).
beforeAll(() => {
  File.prototype.arrayBuffer = function (this: File) {
    return new Promise<ArrayBuffer>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(this);
    });
  };
});

async function makeCourse(id: string, paths: string[]): Promise<void> {
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
  const encoder = new TextEncoder();
  const entries = await Promise.all(
    paths.map(async (relativePath) => {
      const content = encoder.encode(relativePath);
      return { relativePath, content, sha256: await sha256(content), size: content.length };
    })
  );
  await processEntriesForCourse(id, entries, 1_000, true);
}

async function addToNewFolder(container: HTMLElement, folderName: string): Promise<void> {
  const input = container.querySelector('input[type=file]') as HTMLInputElement;
  await userEvent.upload(input, new File(['hello'], 'nuevo.pdf', { type: 'application/pdf' }));
  await userEvent.click(await screen.findByLabelText('New folder'));
  await userEvent.type(screen.getByLabelText('New folder name'), folderName);
  await userEvent.click(screen.getByRole('button', { name: 'Add' }));
}

describe('CourseFilesPage manual upload into a new folder', () => {
  it('shows the new folder in a course that already has folders', async () => {
    await makeCourse('with-files', ['Curso/Capturas/a.pdf', 'Curso/Practica_1/b.pdf', 'Curso/top.pdf']);
    const { container } = render(<CourseFilesPage courseId="with-files" courseName="c" onBack={() => {}} />);
    await screen.findByText('Capturas');

    await addToNewFolder(container, 'Nueva');

    expect(await screen.findByText('Nueva')).toBeInTheDocument();
    expect((await fileStore.byCourse('with-files')).map((f) => f.relativePath)).toContain('Curso/Nueva/nuevo.pdf');
  });

  it('shows the new folder in a course that had no files at all — it must not be mistaken for a hidden wrapper folder', async () => {
    await makeCourse('empty', []);
    const { container } = render(<CourseFilesPage courseId="empty" courseName="c" onBack={() => {}} />);
    await screen.findByText('No files downloaded yet for this course.');

    await addToNewFolder(container, 'Nueva');

    expect(await screen.findByText('Nueva')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('No files downloaded yet for this course.')).not.toBeInTheDocument());
  });

  it('reads the file as soon as it is picked, and reports a file that has already vanished instead of failing later on Add', async () => {
    await makeCourse('vanishing', ['Curso/Capturas/a.pdf', 'Curso/b.pdf']);
    const { container } = render(<CourseFilesPage courseId="vanishing" courseName="c" onBack={() => {}} />);
    await screen.findByText('Capturas');

    const gone = new File(['x'], 'gone.pdf');
    gone.arrayBuffer = () => Promise.reject(new DOMException('A requested file could not be found', 'NotFoundError'));
    await userEvent.upload(container.querySelector('input[type=file]') as HTMLInputElement, gone);

    expect(await screen.findByText(/Could not read "gone.pdf"/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
  });

  it('adds a same-named file dropped in the same folder as a new version of the existing one — not a renamed copy', async () => {
    await makeCourse('same-name', ['Curso/Capturas/a.pdf', 'Curso/b.pdf']);
    const { container } = render(<CourseFilesPage courseId="same-name" courseName="c" onBack={() => {}} />);
    await screen.findByText('Capturas');

    await userEvent.upload(container.querySelector('input[type=file]') as HTMLInputElement, new File(['updated'], 'b.pdf', { type: 'application/pdf' }));
    expect(await screen.findByText(/added as a new version/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(async () => {
      const files = await fileStore.byCourse('same-name');
      const b = files.find((f) => f.relativePath === 'Curso/b.pdf')!;
      expect(await versionStore.byFile(b.id)).toHaveLength(2);
    });
    expect((await fileStore.byCourse('same-name')).map((f) => f.relativePath).sort()).toEqual(['Curso/Capturas/a.pdf', 'Curso/b.pdf']);
  });

  it('shows a file added under a new name with a "Manual" tag', async () => {
    await makeCourse('tagged', ['Curso/Capturas/a.pdf', 'Curso/b.pdf']);
    const { container } = render(<CourseFilesPage courseId="tagged" courseName="c" onBack={() => {}} />);
    await screen.findByText('Capturas');

    await userEvent.upload(container.querySelector('input[type=file]') as HTMLInputElement, new File(['hello'], 'mio.pdf', { type: 'application/pdf' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }));

    expect(await screen.findByText('mio.pdf')).toBeInTheDocument();
    expect(screen.getAllByText('Manual')).toHaveLength(1);
  });
});
