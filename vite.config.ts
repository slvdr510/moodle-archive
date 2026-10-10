import { crx } from '@crxjs/vite-plugin';
import preact from '@preact/preset-vite';
import { build, defineConfig, type Plugin } from 'vite';
import manifest from './manifest.config';

// The crawler (dist/content/main.js) is built separately by vite.content.config.ts —
// see there for why — so the dev server never serves or rebuilds it. Run that build in
// watch mode alongside the dev server, so crawler changes land in dist/ as well.
function watchContentScript(): Plugin {
  return {
    name: 'watch-content-script',
    apply: 'serve',
    async configureServer() {
      await build({ configFile: 'vite.content.config.ts', build: { watch: {} } });
    }
  };
}

export default defineConfig({
  plugins: [preact(), crx({ manifest }), watchContentScript()],
  // Extension pages aren't served from the dev server's own origin, so Vite's HMR
  // client can't infer the port and tries `ws://localhost:undefined` — pin it.
  server: {
    port: 5173,
    strictPort: true,
    hmr: { port: 5173 }
  },
  build: {
    rollupOptions: {
      input: {
        dashboard: 'src/dashboard/index.html',
        popup: 'src/popup/index.html',
        viewer: 'src/viewer/index.html'
      }
    }
  }
});
