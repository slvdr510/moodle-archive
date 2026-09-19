import { defineConfig } from 'vite';

// The crawler is injected on demand via chrome.scripting.executeScript (paired with the
// "activeTab" permission) instead of being declared as an auto-matching manifest content
// script — that's what lets this extension avoid requesting broad host permissions up
// front for arbitrary self-hosted Moodle domains. chrome.scripting.executeScript's `files`
// option needs a single, import-free script, so this is built separately from the main
// crxjs/Vite build (which produces ES modules) as one self-contained IIFE bundle.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/content/main.ts',
      name: 'MoodleHistoryCrawler',
      formats: ['iife'],
      fileName: () => 'content/main.js'
    }
  }
});
