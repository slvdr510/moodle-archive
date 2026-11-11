import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

const ICONS = {
  16: 'src/icons/icon16.png',
  32: 'src/icons/icon32.png',
  48: 'src/icons/icon48.png',
  128: 'src/icons/icon128.png'
};

// One manifest for both browsers: `vite build --mode firefox` builds Firefox's.
export default defineManifest(({ mode }) => ({
  manifest_version: 3,
  // Translated in public/_locales/<lang>/messages.json — what Chrome and the Web Store
  // show for the extension, picked by the browser's language.
  name: '__MSG_extName__',
  description: '__MSG_extDescription__',
  default_locale: 'en',
  version: pkg.version,
  icons: ICONS,
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: ICONS
  },
  // Firefox has no extension service workers: the same script runs there as an event
  // page, which the browser also stops when idle.
  background:
    mode === 'firefox'
      ? { scripts: ['src/background/index.ts'], type: 'module' }
      : { service_worker: 'src/background/index.ts', type: 'module' },
  // Firefox lets a download be opened only from the click itself, which the extension
  // can't do (see openFile.ts): there it never asks to.
  permissions: [
    'tabs',
    'downloads',
    ...(mode === 'firefox' ? [] : ['downloads.open']),
    'activeTab',
    'scripting',
    'storage',
    'unlimitedStorage'
  ],
  ...(mode === 'firefox' && {
    browser_specific_settings: {
      gecko: {
        // The add-on's identity on addons.mozilla.org: it can't change once published.
        id: 'moodle-archive@slvdr510',
        // The first to understand data_collection_permissions, which older ones refuse.
        strict_min_version: '140.0',
        // Nothing the extension reads ever leaves the browser (see the README).
        data_collection_permissions: { required: ['none'] }
      },
      // Firefox for Android only understood data_collection_permissions later, in 142.
      gecko_android: { strict_min_version: '142.0' }
    }
  })
}));
