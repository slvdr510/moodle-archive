// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecentSettingsModal } from '../src/dashboard/components/RecentSettingsModal';
import {
  DEFAULT_RECENT_SETTINGS,
  applyRecentSettings,
  getRecentSettings,
  setRecentSettings
} from '../src/lib/recentSettings';

afterEach(() => {
  act(() => cleanup());
  localStorage.clear();
});

const ITEMS = [1, 2, 3, 4, 5, 6, 7];

describe('recentSettings', () => {
  it('defaults to showing up to 5 when nothing is stored', () => {
    expect(getRecentSettings()).toEqual(DEFAULT_RECENT_SETTINGS);
    expect(applyRecentSettings(ITEMS)).toEqual([1, 2, 3, 4, 5]);
  });

  it('persists the chosen settings', () => {
    setRecentSettings({ enabled: true, unlimited: false, maxItems: 3 });
    expect(getRecentSettings()).toEqual({ enabled: true, unlimited: false, maxItems: 3 });
    expect(applyRecentSettings(ITEMS)).toEqual([1, 2, 3]);
  });

  it('shows everything when unlimited and nothing when disabled', () => {
    expect(applyRecentSettings(ITEMS, { enabled: true, unlimited: true, maxItems: 2 })).toEqual(ITEMS);
    expect(applyRecentSettings(ITEMS, { enabled: false, unlimited: true, maxItems: 2 })).toEqual([]);
  });

  it('falls back to defaults for garbage stored values', () => {
    localStorage.setItem('moodle-archive-recent-settings', '{not json');
    expect(getRecentSettings()).toEqual(DEFAULT_RECENT_SETTINGS);
    localStorage.setItem('moodle-archive-recent-settings', JSON.stringify({ enabled: 'yes', maxItems: 0 }));
    expect(getRecentSettings()).toEqual(DEFAULT_RECENT_SETTINGS);
  });
});

describe('RecentSettingsModal', () => {
  it('saves the edited settings and closes', async () => {
    const onClose = vi.fn();
    render(<RecentSettingsModal onClose={onClose} />);

    const max = screen.getByLabelText('Maximum recently opened files per course');
    await userEvent.clear(max);
    await userEvent.type(max, '8');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(getRecentSettings()).toEqual({ enabled: true, unlimited: false, maxItems: 8 });
    expect(onClose).toHaveBeenCalled();
  });

  it('disables the limit inputs when recently opened is turned off', async () => {
    render(<RecentSettingsModal onClose={vi.fn()} />);

    await userEvent.click(screen.getByLabelText('Show recently opened files'));

    expect(screen.getByLabelText('No limit')).toBeDisabled();
    expect(screen.getByLabelText('Maximum recently opened files per course')).toBeDisabled();
  });

  it('disables the maximum when "No limit" is checked', async () => {
    render(<RecentSettingsModal onClose={vi.fn()} />);
    const max = screen.getByLabelText('Maximum recently opened files per course');
    expect(max).toBeEnabled();

    await userEvent.click(screen.getByLabelText('No limit'));
    expect(max).toBeDisabled();

    await userEvent.click(screen.getByLabelText('No limit'));
    expect(max).toBeEnabled();
  });

  it('cannot save an invalid maximum', async () => {
    render(<RecentSettingsModal onClose={vi.fn()} />);

    await userEvent.clear(screen.getByLabelText('Maximum recently opened files per course'));

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
