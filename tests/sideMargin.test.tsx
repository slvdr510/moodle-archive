// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { SideMarginModal } from '../src/dashboard/components/SideMarginModal';
import { DEFAULT_SIDE_MARGIN, contentWidth, getSideMargin, setSideMargin } from '../src/lib/sideMargin';

afterEach(() => {
  act(() => cleanup());
  localStorage.clear();
});

describe('sideMargin', () => {
  it('defaults when nothing valid is stored', () => {
    expect(getSideMargin()).toBe(DEFAULT_SIDE_MARGIN);
    localStorage.setItem('moodle-archive-side-margin', '99');
    expect(getSideMargin()).toBe(DEFAULT_SIDE_MARGIN);
    setSideMargin(10);
    expect(getSideMargin()).toBe(10);
  });

  it('only takes steps of 5 up to a maximum of 25, moving older values to the nearest step', () => {
    setSideMargin(25);
    expect(getSideMargin()).toBe(25);
    setSideMargin(13);
    expect(getSideMargin()).toBe(DEFAULT_SIDE_MARGIN);
    localStorage.setItem('moodle-archive-side-margin', '13');
    expect(getSideMargin()).toBe(15);
    localStorage.setItem('moodle-archive-side-margin', '27');
    expect(getSideMargin()).toBe(25);
    localStorage.setItem('moodle-archive-side-margin', '40');
    expect(getSideMargin()).toBe(25);
  });

  it('keeps the width the content has in a maximized window', () => {
    expect(contentWidth(20, 1920)).toBe('min(100%, 1152px)');
    expect(contentWidth(0, 1920)).toBe('min(100%, 1920px)');
  });

  it('scales with browser zoom, which shrinks the screen\'s CSS width', () => {
    // 1920px screen at 200% zoom: half the CSS px, the same share of the screen.
    expect(contentWidth(20, 960)).toBe('min(100%, 576px)');
  });

  it('applies the slider live, and Cancel restores the previous value', async () => {
    setSideMargin(20);
    render(<SideMarginModal onClose={() => {}} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('max', '5'); // 0, 5, 10, 15, 20, 25

    fireEvent.change(slider, { target: { value: '1' } });
    expect(getSideMargin()).toBe(5);
    expect(screen.getByText('5% on each side')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '5' } });
    expect(getSideMargin()).toBe(25);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(getSideMargin()).toBe(20);
  });
});
