import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fuentes autoalojadas (sin peticiones a terceros → privacidad y velocidad)
import '@fontsource-variable/schibsted-grotesk';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/600.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';

import './styles/tokens.css';
import './styles/base.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
