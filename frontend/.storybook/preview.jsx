import { MemoryRouter } from 'react-router';
import '@fontsource-variable/schibsted-grotesk';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import '../src/styles/tokens.css';
import '../src/styles/base.css';

/** Cada historia se ve con los mismos tokens y fuentes que la app; el modo se elige en la barra. */
const preview = {
  globalTypes: {
    theme: {
      description: 'Modo visual',
      toolbar: {
        title: 'Modo',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Predeterminado' },
          { value: 'calm', title: 'Calma' },
          { value: 'contrast', title: 'Alto contraste' },
          { value: 'night', title: 'Noche' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'default' },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = context.globals.theme ?? 'default';
      return (
        <MemoryRouter>
          <div style={{ padding: '1.5rem', minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <Story />
          </div>
        </MemoryRouter>
      );
    },
  ],
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
};

export default preview;
