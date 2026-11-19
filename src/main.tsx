import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

declare const __BUILD__: string;

/** Reload once when a newer version has been deployed, so phones never run an old cached copy. */
async function checkForUpdate() {
  if (import.meta.env.DEV) return;
  try {
    const r = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
    const { build } = await r.json();
    const key = `invitecraft-reloaded-${build}`;
    if (build && build !== __BUILD__ && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      // a new query string forces a fresh copy of the page instead of the cached one
      location.replace(`${location.pathname}?u=${build}${location.hash}`);
    }
  } catch { /* offline — keep running */ }
}
checkForUpdate();
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && checkForUpdate());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
