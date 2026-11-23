import { useState } from 'react';
import { Switch } from './Switch';

export default {
  title: 'Átomos/Switch',
  component: Switch,
  args: {
    label: 'Recordar en este dispositivo',
    description: 'Guarda estas preferencias solo en este navegador.',
  },
  render: function Story(args) {
    const [checked, setChecked] = useState(args.checked ?? false);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
};

export const Apagado = {};
export const Encendido = { args: { checked: true } };
