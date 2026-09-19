import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'Moodle Archive',
  description: 'Downloads Moodle courses and archives file version history, all in the browser.',
  version: pkg.version,
  icons: {
    16: 'src/icons/icon16.png',
    32: 'src/icons/icon32.png',
    48: 'src/icons/icon48.png',
    128: 'src/icons/icon128.png'
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'src/icons/icon16.png',
      32: 'src/icons/icon32.png',
      48: 'src/icons/icon48.png',
      128: 'src/icons/icon128.png'
    }
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  permissions: ['tabs', 'downloads', 'downloads.open', 'activeTab', 'scripting'],
  // Without this, chrome.runtime.sendMessage serializes with JSON by default, which
  // silently turns every ArrayBuffer of file content sent from the content script to
  // the background into `{}` — corrupting every downloaded file's bytes long before
  // they ever reach IndexedDB. This opts into real structured clone (Chrome 148+).
  // Not yet in @types/chrome's ManifestV3Options — hence the cast.
  message_serialization: 'structured_clone'
} as Parameters<typeof defineManifest>[0] & { message_serialization: 'structured_clone' });
