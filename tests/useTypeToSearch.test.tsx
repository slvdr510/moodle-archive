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
