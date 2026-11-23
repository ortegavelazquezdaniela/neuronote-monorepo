import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fuentes autoalojadas (sin peticiones a terceros → privacidad y velocidad).
// OpenDyslexic solo se descarga si la persona la elige (font-display: swap).
import '@fontsource-variable/schibsted-grotesk';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/600.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import '@fontsource/opendyslexic/latin-400.css';
import '@fontsource/opendyslexic/latin-700.css';

import './styles/tokens.css';
import './styles/base.css';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { AuthProvider } from './providers/AuthProvider';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </PreferencesProvider>
  </StrictMode>,
);
