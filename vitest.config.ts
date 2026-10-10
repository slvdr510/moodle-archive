import { defineConfig } from 'vitest/config';

// The extension runs on Preact (see vite.config.ts) — point React imports at
// preact/compat here too, so the tests exercise what actually ships.
const preactAliases = [
  { find: /^react-dom(\/client)?$/, replacement: 'preact/compat' },
  { find: /^react\/jsx(-dev)?-runtime$/, replacement: 'preact/jsx-runtime' },
  { find: /^react$/, replacement: 'preact/compat' }
];

export default defineConfig({
  resolve: { alias: preactAliases },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts']
  }
});
