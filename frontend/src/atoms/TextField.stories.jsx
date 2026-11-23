import { useState } from 'react';
import { TextField } from './TextField';

export default {
  title: 'Átomos/TextField',
  component: TextField,
  args: { label: 'Lugar o trayecto', hint: 'Por ejemplo: «Biblioteca central».', required: true, maxLength: 80 },
  render: function Story(args) {
    const [value, setValue] = useState(args.value ?? '');
    return <TextField {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
  },
};

export const Normal = {};
export const ConError = { args: { error: 'Escribe el lugar o el trayecto.' } };
export const Opcional = { args: { label: 'Nota', required: false, multiline: true, maxLength: 500, hint: undefined } };
