// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTypeToSearch } from '../src/dashboard/hooks/useTypeToSearch';

function Page({ initialQuery = '', dialog = false }: { initialQuery?: string; dialog?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const searchRef = useRef<HTMLInputElement>(null);
  useTypeToSearch(searchRef);
  return (
    <div>
      <input aria-label="Course name" defaultValue="Redes" />
      <button type="button">Export</button>
      <input ref={searchRef} aria-label="Search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
      {dialog && <div className="modal-backdrop" />}
    </div>
  );
}

afterEach(() => {
  act(() => cleanup());
});

describe('useTypeToSearch', () => {
  it('types into the search box from anywhere on the page', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.keyboard('tema 3');

    expect(screen.getByLabelText('Search')).toHaveFocus();
    expect(screen.getByLabelText('Search')).toHaveValue('tema 3');
  });

  it('adds to what the box already holds, with a button in focus', async () => {
    const user = userEvent.setup();
    render(<Page initialQuery="te" />);
    screen.getByRole('button', { name: 'Export' }).focus();

    await user.keyboard('ma');

    expect(screen.getByLabelText('Search')).toHaveValue('tema');
  });

  // A browser deletes in the box the delete key moved the focus to (as it does with a
  // character); user-event deletes where the key was pressed instead. So these check
  // where the key leaves the focus and the caret, and the keys that follow.
  it('takes Backspace from anywhere to the end of the box, for it to delete the last character', async () => {
    const user = userEvent.setup();
    render(<Page initialQuery="tema 3" />);
    const search = screen.getByLabelText<HTMLInputElement>('Search');
    screen.getByRole('button', { name: 'Export' }).focus();

    await user.keyboard('{Backspace}');
    expect(search).toHaveFocus();
    expect([search.selectionStart, search.selectionEnd]).toEqual([6, 6]);

    await user.keyboard('{Backspace}{Backspace}');
    expect(search).toHaveValue('tema');
  });

  it('takes Delete from anywhere to the box with all of it selected, for it to empty it', async () => {
    const user = userEvent.setup();
    render(<Page initialQuery="tema 3" />);
    const search = screen.getByLabelText<HTMLInputElement>('Search');
    screen.getByRole('button', { name: 'Export' }).focus();

    await user.keyboard('{Delete}');
    expect(search).toHaveFocus();
    expect([search.selectionStart, search.selectionEnd]).toEqual([0, 6]);

    await user.keyboard('{Delete}pdf');
    expect(search).toHaveValue('pdf');
  });

  it('goes to the box with a delete key even when there is nothing to delete', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.keyboard('{Backspace}');

    expect(screen.getByLabelText('Search')).toHaveFocus();
    expect(screen.getByLabelText('Search')).toHaveValue('');
  });

  it('leaves Shift+Delete (cut) alone, and deleting in another field', async () => {
    const user = userEvent.setup();
    render(<Page initialQuery="tema" />);
    const search = screen.getByLabelText('Search');

    await user.keyboard('{Shift>}{Delete}{/Shift}');
    expect(search).not.toHaveFocus();

    await user.click(screen.getByLabelText('Course name'));
    await user.keyboard('{Backspace}');
    expect(screen.getByLabelText('Course name')).toHaveValue('Rede');
    expect(search).toHaveValue('tema');
  });

  it('leaves typing in another field alone', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByLabelText('Course name'));

    await user.keyboard('es');

    expect(screen.getByLabelText('Course name')).toHaveValue('Redeses');
    expect(screen.getByLabelText('Search')).toHaveValue('');
  });

  it('leaves other shortcuts and the space bar alone', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.keyboard('{Control>}c{/Control}{Alt>}d{/Alt}{Meta>}k{/Meta} ');

    expect(screen.getByLabelText('Search')).not.toHaveFocus();
    expect(screen.getByLabelText('Search')).toHaveValue('');
  });

  it("goes to the search with Ctrl+F or ⌘F, what's in it selected, instead of the browser's find bar", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const search = screen.getByLabelText<HTMLInputElement>('Search');
    await user.keyboard('tema');
    search.blur();

    const ctrlF = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true });
    document.body.dispatchEvent(ctrlF);
    expect(ctrlF.defaultPrevented).toBe(true);
    expect(search).toHaveFocus();
    expect([search.selectionStart, search.selectionEnd]).toEqual([0, 4]);

    search.blur();
    await user.keyboard('{Meta>}f{/Meta}');
    expect(search).toHaveFocus();
    expect(search).toHaveValue('tema');
  });

  it('does nothing while a dialog is open', async () => {
    const user = userEvent.setup();
    render(<Page dialog />);

    await user.keyboard('tema');

    expect(screen.getByLabelText('Search')).not.toHaveFocus();
    expect(screen.getByLabelText('Search')).toHaveValue('');
  });
});
