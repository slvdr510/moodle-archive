// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseInfoModal } from '../src/dashboard/components/CourseInfoModal';
import { academicYearOptions } from '../src/lib/academicYear';
import { getAcademicYearColors, setAcademicYearColor } from '../src/lib/academicYearColors';
import { COURSE_COLORS } from '../src/lib/courseColors';
import type { Course } from '../src/types';

beforeEach(() => localStorage.clear());
afterEach(() => act(() => cleanup()));

/** The rows of the list showing, as read: without the marks that keep a value whole
 *  inside a sentence (FSI, PDI). */
function rows(): string[] {
  return screen.getAllByRole('option').map((o) => o.textContent!.replace(/[\u2068\u2069]/g, ''));
}

function row(text: string): HTMLElement {
  return screen.getAllByRole('option').find((o) => o.textContent!.replace(/[\u2068\u2069]/g, '') === text)!;
}

const OLD = 'https://2024aulasvirtuales.uhu.es/course/view.php?id=241';
const NEW = 'https://aulasvirtuales.uhu.es/course/view.php?id=241';

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

const redes = course('a', 'Redes de Computadores', { url: OLD, matchedUrls: [OLD], institution: 'UHU', academicYear: '24-25' });
const fisica = course('b', 'Fisica', { name: 'FIS', tagged: true, institution: 'US', academicYear: '2025-2026' });
const calculo = course('c', 'Calculo', { hidden: true });

function renderModal(courses = [redes, fisica, calculo], focusCourseId?: string) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(
    <CourseInfoModal courses={courses} focusCourseId={focusCourseId} autoColors={new Map()} onSave={onSave} onClose={onClose} />
  );
  const block = (name: string) => within(screen.getByRole('region', { name }));
  const close = () => userEvent.click(screen.getByRole('button', { name: 'Close' }));
  /** Each course as last stored. */
  const stored = () => new Map((onSave.mock.calls as [Course[]][]).flatMap(([changed]) => changed.map((c) => [c.id, c] as const)));
  return { onSave, onClose, block, close, stored };
}

describe('CourseInfoModal', () => {
  it('shows every course as a block, hidden ones too, marked as such', () => {
    const { block } = renderModal();
    expect(screen.getByRole('heading', { name: 'Edit course info' })).toBeInTheDocument();
    expect(screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))).toEqual(['Redes de Computadores', 'FIS', 'Calculo']);
    expect(block('Calculo').getByText('Hidden')).toBeInTheDocument();
    expect(block('FIS').queryByText('Hidden')).toBeNull();
  });

  it('starts from what each course has', () => {
    const { block } = renderModal();
    expect(block('FIS').getByLabelText('Tag (abbreviation)')).toHaveValue('FIS');
    expect(block('Redes de Computadores').getByLabelText('Tag (abbreviation)')).toHaveValue('');
    expect(block('Redes de Computadores').getByLabelText('Institution')).toHaveValue('UHU');
    expect(block('FIS').getByLabelText('Academic year')).toHaveValue('2025-2026');
    expect(block('Redes de Computadores').getByLabelText('Course URL')).toHaveValue(OLD);
    // The full name from Moodle, shown for an empty one.
    expect(block('Redes de Computadores').getByLabelText('Full name')).toHaveAttribute('placeholder', 'Redes de Computadores');
    expect(block('Redes de Computadores').getByRole('radio', { name: 'Use automatic color' })).toBeChecked();
  });

  it('has no Save or Cancel, and closes with its ×', async () => {
    const { onClose } = renderModal();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('stores a field as it is left, and what is picked as it is picked', async () => {
    const { onSave, block, stored } = renderModal();
    const fis = block('FIS');
    await userEvent.type(block('Redes de Computadores').getByLabelText('Tag (abbreviation)'), 'RC');
    expect(onSave).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'a', name: 'RC', tagged: true })]);

    await userEvent.click(fis.getByRole('radio', { name: COURSE_COLORS[3] }));
    expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'b', color: COURSE_COLORS[3] })]);

    await userEvent.clear(fis.getByLabelText('Tag (abbreviation)'));
    // Shown, already, as it'll be.
    expect(screen.getByRole('region', { name: 'Fisica' })).toBeInTheDocument();
    await userEvent.type(fis.getByLabelText('Full name'), 'Física General');
    await userEvent.tab();
    // Its tag emptied: back to the name from Moodle.
    expect(stored().get('b')).toMatchObject({ name: 'Fisica', tagged: false, fullName: 'Física General', color: COURSE_COLORS[3] });
    expect(stored().get('a')).toMatchObject({ name: 'RC' });
    expect(stored().has('c')).toBe(false);
  });

  it('stores what is still being typed as it closes: with its × or a click outside', async () => {
    const first = renderModal();
    await userEvent.type(first.block('FIS').getByLabelText('Tag (abbreviation)'), '2');
    await first.close();
    expect(first.stored().get('b')).toMatchObject({ name: 'FIS2' });
    expect(first.onClose).toHaveBeenCalled();
    act(() => cleanup());

    const second = renderModal();
    await userEvent.type(second.block('FIS').getByLabelText('Full name'), 'Física');
    await userEvent.click(document.querySelector('.modal-backdrop')!);
    expect(second.stored().get('b')).toMatchObject({ fullName: 'Física' });
    expect(second.onClose).toHaveBeenCalled();
  });

  it('stores a field on Enter too, staying open, in focus in it', async () => {
    const { onSave, onClose, block } = renderModal();
    const tag = block('FIS').getByLabelText('Tag (abbreviation)');
    await userEvent.type(tag, '3{Enter}');
    expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'b', name: 'FIS3' })]);
    expect(onClose).not.toHaveBeenCalled();
    expect(tag).toHaveFocus();

    // In a field with a list: what's typed, as it is, the list closed.
    const year = block('Calculo').getByLabelText('Academic year');
    await userEvent.click(year);
    await userEvent.keyboard('Curso 26/27');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'c', academicYear: 'Curso 26/27' })]);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Edit course info' })).toBeInTheDocument();
  });

  it("says on Enter what's wrong with a URL, as leaving it does", async () => {
    const { onSave, block } = renderModal();
    const url = block('Redes de Computadores').getByLabelText('Course URL');
    await userEvent.clear(url);
    await userEvent.type(url, 'https://aulasvirtuales.uhu.es/{Enter}');
    expect(screen.getByText(/isn't the URL of a Moodle course page/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('stores nothing with nothing changed', async () => {
    const { onSave, onClose, block, close } = renderModal();
    await userEvent.click(block('FIS').getByLabelText('Tag (abbreviation)'));
    await userEvent.tab();
    await close();
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('marks the course it was opened for, its first field to take the focus', () => {
    renderModal(undefined, 'b');
    const target = screen.getByRole('region', { name: 'FIS' });
    expect(target).toHaveClass('targeted');
    expect(within(target).getByLabelText('Tag (abbreviation)')).toHaveAttribute('data-autofocus');
    expect(screen.getAllByRole('region').filter((r) => r.classList.contains('targeted'))).toHaveLength(1);
  });

  it('takes the focus to the first course it was opened without one for', () => {
    renderModal();
    expect(within(screen.getByRole('region', { name: 'Redes de Computadores' })).getByLabelText('Tag (abbreviation)')).toHaveAttribute(
      'data-autofocus'
    );
  });

  describe('a course URL', () => {
    it('stores a new one without what follows the course number, keeping the ones it had', async () => {
      const { onSave, block } = renderModal();
      const field = block('Redes de Computadores').getByLabelText('Course URL');
      await userEvent.clear(field);
      await userEvent.type(field, `${NEW}&section=2`);
      expect(block('Redes de Computadores').getByText(/previous URLs are still recognized/)).toBeInTheDocument();
      await userEvent.tab();
      expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'a', url: NEW, matchedUrls: [OLD, NEW] })]);
    });

    it("says what's wrong with one that isn't a course page's once the field is left, and stores the rest of the course without it", async () => {
      const { onSave, block, close, stored } = renderModal();
      const field = block('Redes de Computadores').getByLabelText('Course URL');
      await userEvent.clear(field);
      await userEvent.type(field, 'https://aulasvirtuales.uhu.es/');
      expect(screen.queryByText(/isn't the URL of a Moodle course page/)).toBeNull();

      await userEvent.click(block('Redes de Computadores').getByLabelText('Tag (abbreviation)'));
      expect(screen.getByText(/isn't the URL of a Moodle course page/)).toBeInTheDocument();
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(onSave).not.toHaveBeenCalled();

      await userEvent.keyboard('RC');
      await close();
      expect(stored().get('a')).toMatchObject({ name: 'RC', url: OLD, matchedUrls: [OLD] });
    });

    it("doesn't stand in the way of storing the rest while left as it was, whatever it is", async () => {
      const resources = 'https://aulasvirtuales.uhu.es/course/resources.php?id=241';
      const old = course('r', 'Redes', { url: '', matchedUrls: [resources] });
      const { onSave, block } = renderModal([old]);
      expect(block('Redes').getByLabelText('Course URL')).toHaveValue(resources);
      await userEvent.type(block('Redes').getByLabelText('Tag (abbreviation)'), 'RC');
      await userEvent.tab();
      expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'r', name: 'RC', url: '', matchedUrls: [resources] })]);
    });

    it("doesn't take another course's, known already or written for it here", async () => {
      const other = course('d', 'Quimica', { url: NEW, matchedUrls: [NEW] });
      const first = renderModal([redes, other]);
      const field = first.block('Redes de Computadores').getByLabelText('Course URL');
      await userEvent.clear(field);
      await userEvent.type(field, NEW);
      await userEvent.tab();
      expect(screen.getByText('"Quimica" already has that URL.')).toBeInTheDocument();
      expect(first.onSave).not.toHaveBeenCalled();
      act(() => cleanup());

      const second = renderModal([redes, fisica]);
      // Not stored for FIS, but taken for it all the same, as written here.
      const fisicaUrl = second.block('FIS').getByLabelText('Course URL');
      await userEvent.type(fisicaUrl, NEW);
      const redesUrl = second.block('Redes de Computadores').getByLabelText('Course URL');
      await userEvent.clear(redesUrl);
      await userEvent.type(redesUrl, NEW);
      // Left.
      await userEvent.click(second.block('FIS').getByLabelText('Full name'));
      expect(second.block('Redes de Computadores').getByText('"FIS" already has that URL.')).toBeInTheDocument();
    });
  });

  describe('the institution and academic year, picked from those in use', () => {
    it('lists the ones in use on a click in the field, the one set checked, and stores one picked with a click', async () => {
      const { onSave, block } = renderModal();
      await userEvent.click(block('FIS').getByLabelText('Institution'));
      const list = screen.getByRole('listbox');
      expect(within(list).getAllByRole('option').map((o) => o.textContent)).toEqual(['UHU', 'US']);
      expect(within(list).getByRole('option', { name: 'US' })).toHaveClass('current');

      await userEvent.click(within(list).getByRole('option', { name: 'UHU' }));
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(block('FIS').getByLabelText('Institution')).toHaveValue('UHU');
      expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'b', institution: 'UHU' })]);
    });

    it('narrows the list to what contains what is typed, and offers to add it while new', async () => {
      const { onSave, block } = renderModal();
      const field = block('Calculo').getByLabelText('Institution');
      await userEvent.click(field);
      await userEvent.keyboard('u');
      expect(rows()).toEqual(['UHU', 'US', 'Add "u"']);
      await userEvent.keyboard('gr');
      expect(rows()).toEqual(['Add "ugr"']);

      await userEvent.click(row('Add "ugr"'));
      expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'c', institution: 'ugr' })]);
    });

    it('goes through the list with the arrows, Enter picking the one highlighted', async () => {
      const { onSave, block } = renderModal();
      const field = block('Calculo').getByLabelText('Academic year');
      await userEvent.click(field);
      // Newest first.
      expect(rows()).toEqual(['2025-2026', '24-25']);

      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      expect(field).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: '24-25' }).id);
      await userEvent.keyboard('{ArrowUp}{Enter}');
      expect(field).toHaveValue('2025-2026');
      expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'c', academicYear: '2025-2026' })]);
      // Picked: the dialog's still open.
      expect(screen.getByRole('heading', { name: 'Edit course info' })).toBeInTheDocument();
    });

    it('offers what another course was given here too', async () => {
      const { block } = renderModal();
      await userEvent.type(block('Redes de Computadores').getByLabelText('Institution'), '{Control>}a{/Control}UPO');
      await userEvent.click(block('Calculo').getByLabelText('Institution'));
      expect(rows()).toEqual(['UHU', 'UPO', 'US']);
    });

    it('takes any text as an academic year, stored as written', async () => {
      const { onSave, block } = renderModal();
      const field = block('Calculo').getByLabelText('Academic year');
      expect(field).toHaveAttribute('placeholder', '26-27');
      await userEvent.click(field);
      await userEvent.keyboard('Curso 26/27');
      expect(rows()).toEqual(['Add "Curso 26/27"']);
      await userEvent.tab();
      expect(field).not.toHaveAttribute('aria-invalid');
      expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'c', academicYear: 'Curso 26/27' })]);

      // One already in use: nothing to add.
      await userEvent.clear(field);
      await userEvent.keyboard('24-25');
      expect(rows()).toEqual(['24-25']);
    });
  });
});

describe('deleting an institution or academic year from the lists', () => {
  it('asks first, Cancel in focus on the left as the safe choice, Delete in red on the right', async () => {
    renderModal();
    await userEvent.click(screen.getAllByLabelText('Institution')[2]);
    await userEvent.click(screen.getByRole('button', { name: 'Delete "UHU"' }));

    const dialog = screen.getByRole('heading', { name: 'Delete "UHU"?' }).closest('.modal') as HTMLElement;
    expect(within(dialog).getByText("It'll be removed from the 1 course that has it.")).toBeInTheDocument();
    const buttons = within(dialog).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['Cancel', 'Delete']);
    expect(buttons[0]).toHaveClass('safe');
    expect(buttons[0]).toHaveAttribute('data-autofocus');
    expect(buttons[1]).toHaveClass('danger', 'solid');
  });

  it('takes it off every course that has it once confirmed, storing them, and offers it no more', async () => {
    const other = course('d', 'Quimica', { institution: 'UHU' });
    const { onSave, block } = renderModal([redes, fisica, other]);
    await userEvent.click(block('Quimica').getByLabelText('Institution'));
    await userEvent.click(screen.getByRole('button', { name: 'Delete "UHU"' }));
    expect(screen.getByText("It'll be removed from the 2 courses that have it.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.queryByRole('heading', { name: 'Delete "UHU"?' })).toBeNull();
    expect(block('Redes de Computadores').getByLabelText('Institution')).toHaveValue('');
    expect(block('Quimica').getByLabelText('Institution')).toHaveValue('');
    expect(onSave).toHaveBeenCalledOnce();
    const [changed] = onSave.mock.calls[0] as [Course[]];
    expect(changed.map((c) => [c.id, c.institution])).toEqual([
      ['a', undefined],
      ['d', undefined]
    ]);
    await userEvent.click(block('Quimica').getByLabelText('Institution'));
    expect(rows()).toEqual(['US']);
  });

  it('changes nothing when cancelled', async () => {
    const { onSave, block } = renderModal();
    await userEvent.click(block('FIS').getByLabelText('Academic year'));
    await userEvent.click(screen.getByRole('button', { name: 'Delete "2025-2026"' }));
    const confirm = screen.getByRole('heading', { name: 'Delete "2025-2026"?' }).closest('.modal') as HTMLElement;
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('heading', { name: 'Delete "2025-2026"?' })).toBeNull();
    // Only that dialog: this one's still open, as it was.
    expect(screen.getByRole('heading', { name: 'Edit course info' })).toBeInTheDocument();
    expect(block('FIS').getByLabelText('Academic year')).toHaveValue('2025-2026');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('asks with the Delete key for the one highlighted, the key editing the field otherwise', async () => {
    const { block } = renderModal();
    const field = block('Calculo').getByLabelText('Academic year');
    await userEvent.click(field);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Delete}');
    expect(screen.getByRole('heading', { name: 'Delete "24-25"?' })).toBeInTheDocument();
    expect(screen.getByText("It'll be removed from the 1 course that has it.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(block('Redes de Computadores').getByLabelText('Academic year')).toHaveValue('');

    await userEvent.click(field);
    await userEvent.keyboard('2526{ArrowLeft}{ArrowLeft}{Delete}');
    expect(field).toHaveValue('256');
    expect(screen.queryByRole('heading', { name: /Delete/ })).toBeNull();
  });
});

describe("an academic year's color", () => {
  it('is set beside its field, for every course with that year, and shown by it in the list', async () => {
    setAcademicYearColor('24-25', '#3f9c45');
    setAcademicYearColor('2025-2026', '#2f6fdb');
    const { block } = renderModal();
    const well = block('Redes de Computadores').getByRole('button', { name: 'Academic year color' });
    expect(well).toHaveStyle({ background: '#3f9c45' });

    await userEvent.click(well);
    expect(screen.getByLabelText('Hex code')).toHaveValue('3f9c45');
    await userEvent.keyboard('C53FB8');
    expect(getAcademicYearColors()['24-25']).toBe('#c53fb8');
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByLabelText('Hex code')).toBeNull();
    expect(well).toHaveStyle({ background: '#c53fb8' });

    await userEvent.click(block('Calculo').getByLabelText('Academic year'));
    const dots = screen.getAllByRole('option').map((o) => (o.querySelector('.combo-box-dot') as HTMLElement | null)?.style.background);
    expect(dots).toEqual(['rgb(47, 111, 219)', 'rgb(197, 63, 184)']);
  });

  it('has none to set until there is a year stored, which then gets one of its own', async () => {
    setAcademicYearColor('24-25', COURSE_COLORS[0]);
    setAcademicYearColor('2025-2026', COURSE_COLORS[1]);
    const { block } = renderModal();
    const well = block('Calculo').getByRole('button', { name: 'Academic year color' });
    expect(well).toBeDisabled();

    await userEvent.type(block('Calculo').getByLabelText('Academic year'), 'Curso 26/27');
    expect(well).toBeDisabled();
    await userEvent.keyboard('{Enter}');
    const color = getAcademicYearColors()['Curso 26/27'];
    // One of the palette's no other year has.
    expect(COURSE_COLORS.slice(2)).toContain(color);
    expect(well).toBeEnabled();
    expect(well).toHaveStyle({ background: color });
  });

  it('is forgotten with the year deleted from the list', async () => {
    setAcademicYearColor('24-25', '#3f9c45');
    const { block } = renderModal();
    await userEvent.click(block('Calculo').getByLabelText('Academic year'));
    await userEvent.click(screen.getByRole('button', { name: 'Delete "24-25"' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(getAcademicYearColors()['24-25']).toBeUndefined();
  });
});

describe('a color menu', () => {
  it("sets a course's color from its code: written, then Enter", async () => {
    const { onSave, block } = renderModal();
    const well = block('FIS').getByRole('button', { name: 'Custom color' });
    await userEvent.click(well);
    const code = screen.getByLabelText('Hex code');
    // Ready to be written over.
    expect(code).toHaveFocus();
    expect(code).toHaveValue('2563eb');
    await userEvent.keyboard('ffffff');
    // Shown as it's written; stored as the menu closes.
    expect(well).toHaveStyle({ background: '#ffffff' });
    expect(onSave).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'b', color: '#ffffff' })]);
    expect(screen.queryByLabelText('Hex code')).toBeNull();
    expect(well).toHaveFocus();
    expect(well).toHaveClass('active');
  });

  it('takes three digits, each doubled, on Enter; and leaves out the # and what else is pasted', async () => {
    const { onSave, block } = renderModal();
    await userEvent.click(block('FIS').getByRole('button', { name: 'Custom color' }));
    const code = screen.getByLabelText('Hex code');
    await userEvent.keyboard('F80');
    expect(onSave).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'b', color: '#ff8800' })]);

    await userEvent.click(block('FIS').getByRole('button', { name: 'Custom color' }));
    await userEvent.paste('#ab cd ef');
    expect(screen.getByLabelText('Hex code')).toHaveValue('abcdef');
    expect(code).not.toBeInTheDocument();
  });

  it("marks a code that isn't one, the menu staying open; Escape closes the menu, not the dialog", async () => {
    const { onSave, onClose, block } = renderModal();
    await userEvent.click(block('FIS').getByRole('button', { name: 'Custom color' }));
    await userEvent.keyboard('12345{Enter}');
    expect(screen.getByLabelText('Hex code')).toHaveAttribute('aria-invalid', 'true');
    expect(onSave).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByLabelText('Hex code')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('stores what was set as it closes some other way: Escape, a click elsewhere', async () => {
    const { onSave, block } = renderModal();
    await userEvent.click(block('FIS').getByRole('button', { name: 'Custom color' }));
    await userEvent.keyboard('123456{Escape}');
    expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'b', color: '#123456' })]);

    await userEvent.click(block('Calculo').getByRole('button', { name: 'Custom color' }));
    await userEvent.keyboard('abcdef');
    await userEvent.click(block('Calculo').getByLabelText('Tag (abbreviation)'));
    expect(screen.queryByLabelText('Hex code')).toBeNull();
    expect(onSave).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'c', color: '#abcdef' })]);
  });

  it("has the browser's picker beside the code, which follows it", async () => {
    const { block } = renderModal();
    const well = block('FIS').getByRole('button', { name: 'Custom color' });
    await userEvent.click(well);
    fireEvent.input(screen.getByLabelText('More colors…'), { target: { value: '#00aa55' } });
    expect(screen.getByLabelText('Hex code')).toHaveValue('00aa55');
    expect(well).toHaveStyle({ background: '#00aa55' });
  });
});

describe('academicYearOptions', () => {
  it('lists each one once, as written, newest first by the year it starts in', () => {
    expect(academicYearOptions(['24-25', undefined, '2025-2026', ' 24-25 ', '25-26', '2019/20', 'Curso 26/27'])).toEqual([
      'Curso 26/27',
      '2025-2026',
      '25-26',
      '24-25',
      '2019/20'
    ]);
  });

  it('puts those with no year to go by after the rest, alphabetically', () => {
    expect(academicYearOptions(['primero', '24-25', 'Anual', '1º'])).toEqual(['24-25', '1º', 'Anual', 'primero']);
  });
});
