/**
 * Client entry point.
 * Responsibility: mount React and load the stylesheet. Nothing else belongs here.
 *
 * StrictMode is intentional even though it double-invokes effects in
 * development: that is precisely what surfaces observers and fetches that are
 * not cleaned up properly, and this app is built almost entirely out of both.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';
import './styles/main.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('No se encontró el elemento #root en index.html.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
