import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import { App } from './App';
import { applyDocumentLanguage, ensureMessages } from '../lib/i18n';
import './styles.css';

applyDocumentLanguage();

// The archive is the only copy of versions Moodle no longer has. The unlimitedStorage
// permission already keeps Chrome from clearing it when the disk runs low; this asks
// for the same through the web's own means too, as Chrome's docs advise. It never
// prompts: Chrome grants or denies it silently.
void navigator.storage?.persist().catch(() => {});

// Only the language in use is fetched (see i18n.ts) — wait for it so the first render
// isn't in English.
void ensureMessages().then(() =>
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
