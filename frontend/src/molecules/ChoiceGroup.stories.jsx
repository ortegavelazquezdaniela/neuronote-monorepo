import { useState } from 'react';
import { ChoiceGroup } from './ChoiceGroup';
import { NOISE_LABELS, scaleOptions } from '../utils/noteLabels';

export default {
  title: 'Moléculas/ChoiceGroup',
  component: ChoiceGroup,
  render: function Story(args) {
    const [value, setValue] = useState(args.value ?? null);
    return <ChoiceGroup {...args} value={value} onChange={setValue} />;
  },
};

export const Escala = {
  args: {
    legend: 'Ruido percibido',
    name: 'noise',
    variant: 'scale',
    required: true,
    options: scaleOptions(NOISE_LABELS),
    scaleLabels: ['Muy tranquilo', 'Muy ruidoso'],
  },
};

export const Segmentado = {
  args: {
    legend: 'Tamaño del texto',
    name: 'size',
    variant: 'segmented',
    value: 1,
    options: [
      { value: 1, label: '100 %' },
      { value: 1.25, label: '125 %' },
      { value: 1.5, label: '150 %' },
    ],
  },
};

export const Tarjetas = {
  args: {
    legend: 'Modo visual',
    name: 'theme',
    value: 'calm',
    options: [
      { value: 'default', label: 'Predeterminado', description: 'Blancos cálidos y azul profundo.' },
      { value: 'calm', label: 'Modo Calma', description: 'Colores suaves y sin animaciones.' },
    ],
  },
};

export const ConError = { args: { ...Escala.args, error: 'Elige cuánto ruido percibiste.' } };
