import mongoose from 'mongoose';
import { SensoryNote } from '../models/SensoryNote.js';
import { CrisisEvent } from '../models/CrisisEvent.js';

/** MongoDB Atlas: Sensory Notes y telemetría anónima del SOS. */

const toNote = (d) => ({
  id: String(d._id),
  place: d.place,
  when: d.when.toISOString(),
  noise: d.noise,
  comfort: d.comfort,
  light: d.light,
  crowd: d.crowd,
  text: d.text,
  createdAt: d.createdAt?.toISOString(),
  updatedAt: d.updatedAt?.toISOString(),
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function connectMongo(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, dbName: 'neuronote' });
}

export function createMongoRepos() {
  return {
    notes: {
      async list(userId, { page, limit, q, from, to }) {
        const filter = { userId };
        if (q) filter.$or = [{ place: new RegExp(escapeRegex(q), 'i') }, { text: new RegExp(escapeRegex(q), 'i') }];
        if (from || to) filter.when = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
        const [docs, total] = await Promise.all([
          SensoryNote.find(filter).sort({ when: -1 }).skip((page - 1) * limit).limit(limit).lean(),
          SensoryNote.countDocuments(filter),
        ]);
        return { items: docs.map(toNote), total };
      },
      async create(userId, data) {
        return toNote(await SensoryNote.create({ ...data, userId }));
      },
      /** Reemplaza el contenido de una nota propia (el filtro por userId impide editar notas ajenas). */
      async update(userId, id, data) {
        if (!mongoose.isValidObjectId(id)) return null;
        const doc = await SensoryNote.findOneAndUpdate(
          { _id: id, userId },
          { $set: { light: null, crowd: null, text: '', ...data } },
          { new: true, runValidators: true, lean: true },
        );
        return doc ? toNote(doc) : null;
      },
      async remove(userId, id) {
        if (!mongoose.isValidObjectId(id)) return false;
        const res = await SensoryNote.deleteOne({ _id: id, userId });
        return res.deletedCount > 0;
      },
      async removeAll(userId) {
        const res = await SensoryNote.deleteMany({ userId });
        return res.deletedCount;
      },
    },
    telemetry: {
      async record(event) {
        await CrisisEvent.create(event);
      },
      async summaryByHour() {
        const rows = await CrisisEvent.aggregate([{ $group: { _id: '$hour', count: { $sum: 1 } } }]);
        const counts = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
        rows.forEach((r) => (counts[r._id].count = r.count));
        return counts;
      },
    },
  };
}
