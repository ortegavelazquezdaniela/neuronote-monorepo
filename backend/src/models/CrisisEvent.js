import mongoose from 'mongoose';

/**
 * Telemetría ANÓNIMA de activaciones del SOS (MongoDB, colección de series de tiempo).
 * Por diseño NO tiene userId, IP, ubicación, ni texto: solo hora del día, día de
 * la semana y condiciones ambientales aproximadas. Sirve para estadísticas
 * agregadas ("¿a qué horas y con qué clima se pide más ayuda?").
 */
const crisisEventSchema = new mongoose.Schema(
  {
    at: { type: Date, required: true, default: () => new Date() },
    hour: { type: Number, min: 0, max: 23, required: true },
    weekday: { type: Number, min: 0, max: 6, required: true },
    temperature: { type: Number, min: -40, max: 60, default: null },
    weatherCode: { type: Number, min: 0, max: 99, default: null },
    noiseLevel: { type: Number, min: 1, max: 5, default: null },
    source: { type: String, enum: ['fab', 'shortcut', 'page'], required: true },
  },
  {
    versionKey: false,
    timeseries: { timeField: 'at', granularity: 'hours' },
    expireAfterSeconds: 60 * 60 * 24 * 365, // se borran solos al año
  },
);

export const CrisisEvent = mongoose.models.CrisisEvent ?? mongoose.model('CrisisEvent', crisisEventSchema);
