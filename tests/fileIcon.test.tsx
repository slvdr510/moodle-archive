// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { FileIcon, FolderIcon, fileIconName } from '../src/dashboard/components/FileIcon';

afterEach(cleanup);

describe('fileIconName', () => {
  it("gives each kind of file the Material Icon Theme's icon for it, whatever the extension's case", () => {
    expect(fileIconName('apuntes.PDF')).toBe('pdf');
    expect(fileIconName('captura.jpeg')).toBe('image');
    expect(fileIconName('notas.xlsx')).toBe('table');
    expect(fileIconName('datos.csv')).toBe('table');
    expect(fileIconName('enunciado.docx')).toBe('word');
    expect(fileIconName('tema1.pptx')).toBe('powerpoint');
    expect(fileIconName('leeme.txt')).toBe('document');
    expect(fileIconName('main.py')).toBe('python');
    expect(fileIconName('practica.zip')).toBe('zip');
    expect(fileIconName('entrega.rar')).toBe('zip');
    expect(fileIconName('setup.exe')).toBe('exe');
    expect(fileIconName('clase.mp4')).toBe('video');
    expect(fileIconName('audio.mp3')).toBe('audio');
  });

  it("gives a .m file MATLAB's, not Objective-C's as the theme does", () => {
    expect(fileIconName('ejercicio1.m')).toBe('matlab');
  });

  it('gives any other file, or one without an extension, the plain one', () => {
    expect(fileIconName('datos.xyz')).toBe('file');
    expect(fileIconName('Makefile')).toBe('file');
    expect(fileIconName('Tema_1.Introduccion_y_conceptos')).toBe('file');
  });
});

describe('FileIcon and FolderIcon', () => {
  it('show the icon as a decorative image, the name beside it saying what it is', () => {
    const { container } = render(<FileIcon filename="apuntes.pdf" />);
    const icon = container.querySelector('img')!;
    expect(icon).toHaveClass('file-icon');
    expect(icon.getAttribute('src')).toMatch(/pdf\.svg/);
    expect(icon).toHaveAttribute('alt', '');
  });

  it('draws a folder open while its contents are shown', () => {
    const { container, rerender } = render(<FolderIcon open={false} />);
    expect(container.querySelector('img')!.getAttribute('src')).toMatch(/\/folder\.svg/);
    rerender(<FolderIcon open />);
    expect(container.querySelector('img')!.getAttribute('src')).toMatch(/folder-open\.svg/);
  });
});
