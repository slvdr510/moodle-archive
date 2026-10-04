import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import manifest from './manifest.config';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
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
