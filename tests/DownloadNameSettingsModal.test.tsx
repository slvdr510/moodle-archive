// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DownloadNameSettingsModal } from '../src/dashboard/components/DownloadNameSettingsModal';
import { getPrefixCourseTag } from '../src/lib/downloadNameSettings';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('DownloadNameSettingsModal', () => {
  it('turns the course tag prefix off only when saved', async () => {
    const onClose = vi.fn();
    render(<DownloadNameSettingsModal onClose={onClose} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(getPrefixCourseTag()).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(getPrefixCourseTag()).toBe(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('leaves the setting alone on cancel', async () => {
    render(<DownloadNameSettingsModal onClose={() => {}} />);
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(getPrefixCourseTag()).toBe(true);
  });
});
