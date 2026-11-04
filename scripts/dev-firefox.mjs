// `npm run dev:firefox`: the Firefox build, rebuilt on every change, into
// dist-firefox-dev/ — loaded by hand in Firefox, from about:debugging. (Vite's dev
// server is Chrome's way: its code reaches extension pages through the service
// worker, which Firefox's extensions don't have.) dist-firefox/ is left as the last
// release build (`npm run build:firefox`).
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = `${root}dist-firefox-dev`;

/** Builds with `configFile` in watch mode, resolving once the first build is written. */
function watch(configFile) {
  return new Promise((resolve, reject) => {
    build({
      root,
      configFile: `${root}${configFile}`,
      mode: 'firefox',
      // In watch mode Vite empties the folder on every rebuild, which would take the
      // other build's files with it: it's emptied once, below, instead.
      build: { outDir, emptyOutDir: false, watch: {} }
    }).then((watcher) => {
      const onEvent = (event) => {
        if (event.code === 'END') {
          watcher.off('event', onEvent);
          resolve(watcher);
        } else if (event.code === 'ERROR') {
          watcher.off('event', onEvent);
          reject(event.error);
        }
      };
      watcher.on('event', onEvent);
    }, reject);
  });
}

// Its content goes, not the folder itself: a Flatpak Firefox given access to the
// folder would go on seeing the one removed.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) rmSync(`${outDir}/${entry}`, { recursive: true, force: true });
await watch('vite.config.ts');
await watch('vite.content.config.ts');

console.log(`
Built into dist-firefox-dev/, and rebuilt on every change. In Firefox:
  about:debugging#/runtime/this-firefox → Load Temporary Add-on… → dist-firefox-dev/manifest.json
After a rebuild, press Reload there.
`);
