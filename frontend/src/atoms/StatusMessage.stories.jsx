import { StatusMessage } from './StatusMessage';

export default {
  title: 'Átomos/StatusMessage',
  component: StatusMessage,
  argTypes: { tone: { control: 'inline-radio', options: ['info', 'success', 'error'] } },
};

export const Informacion = { args: { tone: 'info', title: 'Cómo leer esta lista', children: 'Los datos vienen de OpenStreetMap.' } };
export const Exito = { args: { tone: 'success', title: 'Nota guardada', children: 'Se guardó solo en este dispositivo.' } };
export const Error = { args: { tone: 'error', title: 'No pudimos consultar el clima', children: 'El servicio tardó demasiado en responder.' } };
