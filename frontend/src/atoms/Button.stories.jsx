import { ArrowRight, LifeBuoy } from 'lucide-react';
import { Button } from './Button';

export default {
  title: 'Átomos/Button',
  component: Button,
  args: { children: 'Explore sensory routes', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'calm', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export const Primario = { args: { icon: ArrowRight } };
export const Secundario = { args: { variant: 'secondary', children: 'Discover calm spaces' } };
export const Calma = { args: { variant: 'calm', icon: LifeBuoy, iconPosition: 'start', children: 'Ayuda SOS' } };
export const Peligro = { args: { variant: 'danger', size: 'sm', children: 'Borrar todas' } };
export const Deshabilitado = { args: { disabled: true, children: 'Guardando…' } };
