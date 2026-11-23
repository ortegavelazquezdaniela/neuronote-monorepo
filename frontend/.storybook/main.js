/** Storybook 10 · catálogo de componentes de NEURONOTE (Atomic Design). */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx)'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true }, // sin envío de datos de uso
};

export default config;
