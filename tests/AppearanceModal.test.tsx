// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppearanceModal } from '../src/dashboard/components/AppearanceModal';
import { getAppearance } from '../src/lib/appearance';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('moodle-archive-theme', 'light');
  document.documentElement.setAttribute('data-theme', 'light');
});
afterEach(() => act(() => cleanup()));

describe('AppearanceModal', () => {
  it("sets a color of the theme shown from its code, and takes it back from the row's arrow", async () => {
    render(<AppearanceModal onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    const row = screen.getByText('Buttons and links').closest('li')!;
    expect(within(row).getByText('#2563EB')).toBeInTheDocument();
    // Only there to press once it's changed.
    expect(within(row).getByTitle('Restore the default color')).not.toBeVisible();

    await userEvent.click(within(row).getByRole('button', { name: 'Buttons and links' }));
    await userEvent.keyboard('ff8800{Enter}');
    expect(getAppearance().light).toEqual({ accent: '#ff8800' });
    expect(within(row).getByText('#FF8800')).toBeInTheDocument();
    expect(within(row).getByTitle('Restore the default color')).toBeVisible();

    await userEvent.click(within(row).getByRole('button', { name: 'Restore the default color: Buttons and links' }));
    expect(getAppearance().light).toEqual({});
  });

  it("shows the page in the theme being set while it's open, and the one chosen once closed", async () => {
    render(<AppearanceModal onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    // The dark theme's own colors.
    expect(within(screen.getByText('Background').closest('li')!).getByText('#0F1115')).toBeInTheDocument();
    act(() => cleanup());
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it("resets a theme's colors once that's confirmed, not the other theme's", async () => {
    render(<AppearanceModal onClose={vi.fn()} />);
    const reset = screen.getByRole('button', { name: 'Reset colors' });
    expect(reset).toBeDisabled();
    await userEvent.click(within(screen.getByText('Background').closest('li')!).getByRole('button', { name: 'Background' }));
    await userEvent.keyboard('eeeeee{Enter}');
    localStorage.setItem('moodle-archive-appearance', JSON.stringify({ ...getAppearance(), dark: { fg: '#ffffff' } }));
    await userEvent.click(reset);
    const confirm = screen.getByRole('heading', { name: "Reset the light theme's colors?" }).closest('.modal') as HTMLElement;
    await userEvent.click(within(confirm).getByRole('button', { name: 'Reset colors' }));
    expect(getAppearance()).toEqual({ light: {}, dark: { fg: '#ffffff' } });
  });

  it("applies a palette to the theme being set, marked as the one in use; without asking over another palette's", async () => {
    render(<AppearanceModal onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Forest' }));
    expect(getAppearance().light).toMatchObject({ accent: '#3f7d3a', bg: '#f7faf5' });
    expect(getAppearance().dark).toEqual({});
    expect(screen.getByRole('button', { name: 'Forest' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByText('Buttons and links').closest('li')!).getByText('#3F7D3A')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ocean' }));
    expect(getAppearance().light).toMatchObject({ accent: '#0e7490' });
    // In the dark theme, its dark version.
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ocean' }));
    expect(getAppearance().dark).toMatchObject({ accent: '#38bdf8', bg: '#0b1220' });
  });

  it('asks before a palette replaces colors set by hand', async () => {
    render(<AppearanceModal onClose={vi.fn()} />);
    await userEvent.click(within(screen.getByText('Text').closest('li')!).getByRole('button', { name: 'Text' }));
    await userEvent.keyboard('333333{Enter}');
    // Not a palette any more.
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: 'Lavender' }));
    const confirm = screen.getByRole('heading', { name: 'Replace your colors?' }).closest('.modal') as HTMLElement;
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    expect(getAppearance().light).toEqual({ fg: '#333333' });
    await userEvent.click(screen.getByRole('button', { name: 'Lavender' }));
    await userEvent.click(screen.getByRole('button', { name: 'Replace' }));
    expect(getAppearance().light).toMatchObject({ accent: '#7c3aed' });
    expect(getAppearance().light.fg).toBe('#231a33');
  });
});
