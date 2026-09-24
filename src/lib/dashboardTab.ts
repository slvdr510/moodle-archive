const DASHBOARD_PATH = 'src/dashboard/index.html';

/** Opens the dashboard in a new tab, even if one is already open. */
export async function openDashboard(): Promise<void> {
  await chrome.tabs.create({ url: chrome.runtime.getURL(DASHBOARD_PATH) });
}
