import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  // Translated in public/_locales/<lang>/messages.json — what Chrome and the Web Store
  // show for the extension, picked by the browser's language.
  name: '__MSG_extName__',
  description: '__MSG_extDescription__',
  default_locale: 'en',
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
  permissions: ['tabs', 'downloads', 'downloads.open', 'activeTab', 'scripting', 'storage']
});
