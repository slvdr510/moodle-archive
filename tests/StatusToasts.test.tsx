// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StatusToasts, type StatusMessage } from '../src/dashboard/components/StatusToasts';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  act(() => cleanup());
  vi.useRealTimers();
});

const pass = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('StatusToasts', () => {
  it("floats over the page, out of what's laid out, for as long as it's busy", () => {
    const { container, rerender } = render(<StatusToasts busy="Exporting…" onDismiss={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
    expect(document.body.querySelector('.status-toasts')).toHaveTextContent('Exporting…');
    pass(60_000);
    expect(screen.getByText('Exporting…')).toBeInTheDocument();
    rerender(<StatusToasts busy={null} onDismiss={vi.fn()} />);
    expect(screen.queryByText('Exporting…')).toBeNull();
  });

  it('lets a message go after a few seconds, an error after longer', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<StatusToasts message={{ kind: 'info', text: 'Saved.' }} onDismiss={onDismiss} />);
    pass(3900);
    expect(onDismiss).not.toHaveBeenCalled();
    pass(100);
    // Fading out, then gone.
    expect(screen.getByText('Saved.').parentElement).toHaveClass('leaving');
    pass(200);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    onDismiss.mockClear();
    rerender(<StatusToasts message={{ kind: 'error', text: 'Could not export.' }} onDismiss={onDismiss} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not export.');
    pass(4200);
    expect(onDismiss).not.toHaveBeenCalled();
    pass(3800);
    pass(200);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('stays while the pointer is over it', () => {
    const onDismiss = vi.fn();
    render(<StatusToasts message={{ kind: 'info', text: 'Saved.' }} onDismiss={onDismiss} />);
    const toast = screen.getByText('Saved.').parentElement!;
    fireEvent.mouseEnter(toast);
    pass(20_000);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.mouseLeave(toast);
    // Its whole time again, from when the pointer left.
    pass(3900);
    expect(onDismiss).not.toHaveBeenCalled();
    pass(100);
    pass(200);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('closes from its ×, and starts over for a new message', () => {
    const onDismiss = vi.fn();
    const first: StatusMessage = { kind: 'info', text: 'Saved.' };
    const { rerender } = render(<StatusToasts message={first} onDismiss={onDismiss} />);
    act(() => screen.getByRole('button', { name: 'Close' }).click());
    pass(200);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    onDismiss.mockClear();
    pass(3000);
    rerender(<StatusToasts message={{ kind: 'info', text: 'Saved again.' }} onDismiss={onDismiss} />);
    pass(3000);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.getByText('Saved again.').parentElement).not.toHaveClass('leaving');
  });
});
