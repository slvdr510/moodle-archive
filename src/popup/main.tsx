import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import { applyTheme, getStoredTheme } from '../lib/theme';
import { App } from './App';
import '../dashboard/styles.css';
import './popup.css';

// The popup has no theme switcher of its own — it just follows whatever was
// chosen from the dashboard (including "system", the default), so light/dark
// stays consistent everywhere rather than the popup only ever following the
// OS's setting regardless of an explicit override.
applyTheme(getStoredTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
