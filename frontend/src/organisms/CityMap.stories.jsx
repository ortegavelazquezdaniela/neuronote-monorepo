import { CityMap } from './CityMap';

export default {
  title: 'Organismos/CityMap',
  component: CityMap,
  parameters: { docs: { description: { component: 'Mapa ilustrativo del inicio (datos de demostración).' } } },
  args: { layers: { routes: true, havens: true, climate: true } },
  render: (args) => (
    <div style={{ maxWidth: '36rem' }}>
      <CityMap {...args} />
    </div>
  ),
};

export const TodasLasCapas = {};
export const SoloRutas = { args: { layers: { routes: true, havens: false, climate: false } } };
