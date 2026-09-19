const DASHBOARD_PATH = 'src/dashboard/index.html';

/** Opens the dashboard tab, or focuses it (and its window) if already open. */
export async function openOrFocusDashboard(): Promise<void> {
  const dashboardUrl = chrome.runtime.getURL(DASHBOARD_PATH);
  const [existingTab] = await chrome.tabs.query({ url: dashboardUrl });

  if (existingTab?.id !== undefined) {
    await chrome.tabs.update(existingTab.id, { active: true });
    if (existingTab.windowId !== undefined) {
      await chrome.windows.update(existingTab.windowId, { focused: true });
    }
  } else {
    await chrome.tabs.create({ url: dashboardUrl });
  }
}
