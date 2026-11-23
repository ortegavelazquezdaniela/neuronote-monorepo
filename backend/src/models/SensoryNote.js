import mongoose from 'mongoose';

/**
 * Sensory Notes (MongoDB Atlas). Documentos flexibles por persona usuaria.
 * userId es el UUID de la cuenta en PostgreSQL; no se guarda nombre ni correo.
 */
const sensoryNoteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    place: { type: String, required: true, minlength: 2, maxlength: 80, trim: true },
    when: { type: Date, required: true },
    noise: { type: Number, required: true, min: 1, max: 5 },
    comfort: { type: Number, required: true, min: 1, max: 5 },
    light: { type: String, enum: ['suave', 'normal', 'intensa', null], default: null },
    crowd: { type: String, enum: ['poca', 'moderada', 'mucha', null], default: null },
    text: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true, versionKey: false },
);

sensoryNoteSchema.index({ userId: 1, when: -1 });

export const SensoryNote = mongoose.models.SensoryNote ?? mongoose.model('SensoryNote', sensoryNoteSchema);
