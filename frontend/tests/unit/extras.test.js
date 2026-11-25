import { describe, it, expect } from 'vitest';
import { parseHeartRate, isPlausibleBpm, sustainedAbove, demoBpm, canVibrate, vibrateOnce, ALERT_PATTERN } from '../../src/utils/heartRate';
import { toClinic, clinicKind, buildClinicsQuery, mapsSearchUrl, fromNominatim } from '../../src/services/clinics';

const view = (bytes) => new DataView(new Uint8Array(bytes).buffer);

describe('Monitor de pulso: lectura Bluetooth estándar (0x2A37)', () => {
  it('lee el pulso en 1 byte y en 2 bytes', () => {
    expect(parseHeartRate(view([0x00, 72]))).toEqual({ bpm: 72, contact: null });
    // bit 0 = 1 → 16 bits little endian: 0x0104 = 260
    expect(parseHeartRate(view([0x01, 0x04, 0x01])).bpm).toBe(260);
  });

  it('informa el contacto con la piel solo si el sensor lo soporta', () => {
    expect(parseHeartRate(view([0x06, 80])).contact).toBe(true); // soportado + en contacto
    expect(parseHeartRate(view([0x04, 80])).contact).toBe(false); // soportado, sin contacto
  });

  it('descarta lecturas imposibles', () => {
    expect(isPlausibleBpm(72)).toBe(true);
    expect(isPlausibleBpm(0)).toBe(false);
    expect(isPlausibleBpm(260)).toBe(false);
  });
});

describe('Monitor de pulso: aviso sostenido', () => {
  const series = (values, start = 0) => values.map((bpm, i) => ({ t: start + i * 1000, bpm }));

  it('avisa solo si el pulso se mantiene arriba el tiempo elegido', () => {
    const s = series([...Array(5).fill(80), ...Array(61).fill(120)]);
    expect(sustainedAbove(s, 110, 60).sustained).toBe(true);
    expect(sustainedAbove(s.slice(0, 40), 110, 60).sustained).toBe(false);
  });

  it('se reinicia si el pulso baja o si hubo un hueco de lecturas', () => {
    const bajo = series([...Array(40).fill(120), 90, ...Array(30).fill(120)]);
    expect(sustainedAbove(bajo, 110, 60).sustained).toBe(false);
    const hueco = [...series(Array(40).fill(120)), ...series(Array(30).fill(120), 60_000)];
    expect(sustainedAbove(hueco, 110, 60).sustained).toBe(false);
  });

  it('sin umbral no hay avisos', () => {
    expect(sustainedAbove([{ t: 0, bpm: 200 }], 0, 1).sustained).toBe(false);
  });

  it('vibración: sin API devuelve false; con API usa el patrón suave', () => {
    expect(canVibrate()).toBe(false);
    expect(vibrateOnce()).toBe(false);
    navigator.vibrate = () => false; // bloqueada por el navegador
    expect(vibrateOnce()).toBe(false);
    let got;
    navigator.vibrate = (p) => {
      got = p;
      return true;
    };
    expect(canVibrate()).toBe(true);
    expect(vibrateOnce()).toBe(true);
    expect(got).toEqual(ALERT_PATTERN);
    delete navigator.vibrate;
  });

  it('la demostración empieza en reposo y supera el umbral', () => {
    expect(demoBpm(0, 100)).toBeLessThan(100);
    expect(demoBpm(50, 100)).toBeGreaterThan(100);
  });
});

describe('Clínicas cercanas (OpenStreetMap)', () => {
  const origin = { lat: 19.4326, lon: -99.1332 };

  it('normaliza un lugar real de OSM con teléfono y distancia', () => {
    const c = toClinic(
      {
        type: 'node',
        id: 9010503800,
        lat: 19.44,
        lon: -99.13,
        tags: { name: 'Consultorio de ejemplo', healthcare: 'psychotherapist', 'healthcare:speciality': 'psychiatry', phone: '+52 55 1234 5678; +52 55 0000 0000' },
      },
      origin,
    );
    expect(c).toMatchObject({ id: 'node-9010503800', kind: 'Psiquiatría', phone: '+52 55 1234 5678', phoneHref: 'tel:+525512345678' });
    expect(c.distance).toBeGreaterThan(700);
    expect(c.osmUrl).toBe('https://www.openstreetmap.org/node/9010503800');
  });

  it('descarta lugares sin nombre y asesorías que no son de salud mental', () => {
    expect(toClinic({ type: 'node', id: 1, lat: 1, lon: 1, tags: { healthcare: 'psychologist' } }, origin)).toBeNull();
    expect(
      toClinic({ type: 'node', id: 2, lat: 1, lon: 1, tags: { name: 'Nutrición', healthcare: 'counselling', 'healthcare:speciality': 'diabetology' } }, origin),
    ).toBeNull();
  });

  it('clasifica el tipo de servicio en palabras sencillas', () => {
    expect(clinicKind({ name: 'Centro Comunitario de Salud Mental' })).toBe('Salud mental');
    expect(clinicKind({ healthcare: 'psychologist', name: 'Consultorio' })).toBe('Psicología');
    expect(clinicKind({ name: 'Psicoterapia Integral' })).toBe('Psicoterapia');
  });

  it('la consulta busca nombres solo en lugares de salud, oficinas y edificios; la búsqueda externa redondea la ubicación', () => {
    const q = buildClinicsQuery(origin, 10_000);
    expect(q).toContain('nwr["healthcare"~"^(psychotherapist|psychologist)$"](around:10000,19.433,-99.133);');
    expect(q).toContain('["amenity"~"^(clinic|doctors|hospital|social_facility)$"]["name"~');
    expect(q).not.toMatch(/nwr\["name"/); // nunca un filtro de nombre sobre todos los elementos
    expect(mapsSearchUrl(origin)).toBe('https://www.google.com/maps/search/cl%C3%ADnica%20psicol%C3%B3gica/@19.43,-99.13,13z');
  });

  it('de Nominatim acepta clínicas y descarta calles y escuelas', () => {
    const base = { osm_type: 'node', osm_id: 1, lat: '19.4', lon: '-99.1' };
    expect(fromNominatim({ ...base, name: 'Clínica de Salud Mental', category: 'amenity', type: 'clinic' })).toMatchObject({ type: 'node', id: 1 });
    expect(fromNominatim({ ...base, name: 'Calle Psicología', category: 'highway', type: 'residential' })).toBeNull();
    expect(fromNominatim({ ...base, name: 'Instituto Mexicano de Psicología', category: 'amenity', type: 'school' })).toBeNull();
  });
});
