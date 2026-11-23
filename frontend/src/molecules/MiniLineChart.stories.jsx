import { MiniLineChart } from './MiniLineChart';

const hours = Array.from({ length: 24 }, (_, i) => `2026-11-22T${String(i).padStart(2, '0')}:00`);

export default {
  title: 'Moléculas/MiniLineChart',
  component: MiniLineChart,
  parameters: { docs: { description: { component: 'Serie de ejemplo con forma de un día real; usa las flechas del teclado.' } } },
};

export const Temperatura = {
  args: {
    title: 'Temperatura (°C)',
    unit: '°C',
    nowTime: '2026-11-22T14:00',
    data: hours.map((time, i) => ({ time, value: 11 + 9 * Math.sin(((i - 9) / 24) * 2 * Math.PI) })),
  },
};

export const IndiceUV = {
  args: {
    title: 'Índice UV',
    decimals: 1,
    nowTime: '2026-11-22T14:00',
    data: hours.map((time, i) => ({ time, value: i > 7 && i < 18 ? Math.max(0, 8 * Math.sin(((i - 7) / 11) * Math.PI)) : 0 })),
  },
};
