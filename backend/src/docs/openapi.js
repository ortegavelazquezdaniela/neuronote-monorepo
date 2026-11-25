import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  profileSchema,
  favoriteSchema,
  noteSchema,
  notesQuerySchema,
  crisisSchema,
  coordsSchema,
} from '../validation/schemas.js';

/**
 * Especificación OpenAPI 3.1 de la API de NEURONOTE.
 * Los cuerpos y parámetros de entrada se generan desde los mismos esquemas zod
 * que valida el servidor, así la documentación no se desincroniza del código.
 */

/** JSON Schema de entrada de un esquema zod, con las restricciones de los campos de texto limpiados. */
function fromZod(schema) {
  const opts = { unrepresentable: 'any' };
  const input = z.toJSONSchema(schema, { ...opts, io: 'input' });
  const output = z.toJSONSchema(schema, { ...opts, io: 'output' });
  delete input.$schema;
  for (const [key, prop] of Object.entries(input.properties ?? {})) {
    const out = output.properties?.[key];
    // Los campos de texto pasan por clean() y luego se validan: las longitudes viven en la salida.
    if (prop.type === 'string' && out?.type === 'string') {
      for (const k of ['minLength', 'maxLength']) if (out[k] !== undefined && prop[k] === undefined) prop[k] = out[k];
    }
    // Los patrones largos de email y fecha no aportan a la lectura: basta con "format".
    if (prop.format && prop.pattern) delete prop.pattern;
  }
  return input;
}

/** Convierte un esquema zod de query en la lista de parámetros de OpenAPI. */
function queryParams(schema) {
  const json = fromZod(schema);
  return Object.entries(json.properties).map(([name, s]) => ({
    name,
    in: 'query',
    required: (json.required ?? []).includes(name) && s.default === undefined,
    schema: s,
  }));
}

const json = (schema, example) => ({
  'application/json': { schema, ...(example ? { example } : {}) },
});
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const ok = (description, schema, example) => ({ description, content: json(schema, example) });
const err = (name) => ({ $ref: `#/components/responses/${name}` });
const bearer = [{ bearerAuth: [] }];

const osmIdParam = {
  name: 'osmId',
  in: 'path',
  required: true,
  description: 'Identificador de OpenStreetMap: `node-…`, `way-…` o `relation-…`',
  schema: { type: 'string', pattern: '^(node|way|relation)-\\d{1,15}$', example: 'way-4758957' },
};

/** Ejemplos fijos por formato: documentación legible y colección de Postman reproducible. */
const FORMAT_EXAMPLES = {
  uuid: '7b1e2c34-5d6f-4a8b-9c0d-1e2f3a4b5c6d',
  email: 'ana@example.com',
  'date-time': '2026-11-20T14:15:00.000Z',
  date: '2026-11-20',
};
const PROFILE_EXAMPLE = {
  noiseSensitivity: 5,
  lightSensitivity: 3,
  crowdSensitivity: 4,
  heatSensitivity: 2,
  routePriority: 'calm',
};

const FAVORITE_EXAMPLE = { osmId: 'way-4758957', name: 'Biblioteca', lat: 19.43, lon: -99.13 };
const NOTE_EXAMPLE = {
  place: 'Metro Insurgentes',
  when: '2026-11-20T08:15:00-06:00',
  noise: 4,
  comfort: 2,
  light: 'intensa',
  crowd: 'mucha',
  text: 'Mejor salir por el andén norte.',
};

function addFormatExamples(node) {
  if (Array.isArray(node)) return node.forEach(addFormatExamples);
  if (!node || typeof node !== 'object') return;
  if (typeof node.format === 'string' && FORMAT_EXAMPLES[node.format] && node.example === undefined) {
    node.example = FORMAT_EXAMPLES[node.format];
  }
  Object.values(node).forEach(addFormatExamples);
}

export function buildOpenApi({ serverUrl = '/api' } = {}) {
  const spec = buildSpec(serverUrl);
  addFormatExamples(spec);
  return spec;
}

function buildSpec(serverUrl) {
  return {
    openapi: '3.1.0',
    info: {
      title: 'NEURONOTE API',
      version: '0.1.0',
      summary: 'Descompresión sensorial y movilidad urbana para personas neurodivergentes.',
      description: [
        'API REST de NEURONOTE (Express 5). Cuentas y perfil sensorial en Supabase (PostgreSQL + RLS),',
        'Sensory Notes y telemetría anónima en MongoDB, y proxies con caché hacia Open-Meteo, REST Countries',
        'y el motor de auditoría PHP.',
        '',
        '**Autenticación:** `POST /auth/login` o `/auth/register` devuelven un JWT (HS256, 2 h).',
        'Pulsa **Authorize** y pégalo para probar las rutas protegidas.',
        '',
        '**Errores:** siempre `{ "error": "mensaje" }`; los 400 de validación añaden `fields`.',
        'Los errores 5xx nunca exponen detalles internos.',
        '',
        '**Límites:** 300 peticiones / 15 min por IP en general; 10 intentos fallidos de sesión / 15 min;',
        '20 eventos de telemetría / hora.',
        '',
        'NEURONOTE no sustituye la atención médica, psicológica ni los servicios de emergencia.',
      ].join('\n'),
      license: { name: 'MIT', identifier: 'MIT' },
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: 'Estado' },
      { name: 'Autenticación', description: 'Registro, inicio de sesión y cuenta' },
      { name: 'Perfil y favoritos', description: 'Datos de la persona usuaria (PostgreSQL)' },
      { name: 'Sensory Notes', description: 'Diario sensorial (MongoDB)' },
      { name: 'Telemetría', description: 'Activaciones del SOS, anónimas (sin cuenta, ubicación ni texto)' },
      { name: 'Público', description: 'Profesionales verificados, proxies y certificación' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Estado'],
          summary: 'Estado del servicio y tipo de almacenamiento',
          responses: {
            200: ok('Servicio activo', ref('Health'), {
              ok: true,
              service: 'neuronote-api',
              storage: { users: 'supabase', notes: 'mongodb' },
            }),
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Autenticación'],
          summary: 'Crear cuenta',
          description: 'Contraseña de al menos 10 caracteres con letras y un número. Se guarda con bcrypt (12 rondas).',
          requestBody: {
            required: true,
            content: json(fromZod(registerSchema), {
              email: 'ana@example.com',
              password: 'calma-y-ruta-2026',
              displayName: 'Ana',
            }),
          },
          responses: {
            201: ok('Cuenta creada', ref('Session')),
            400: err('ValidationError'),
            409: err('Conflict'),
            429: err('TooManyRequests'),
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Autenticación'],
          summary: 'Iniciar sesión',
          description: 'Responde lo mismo si el correo no existe o la contraseña es incorrecta, para no revelar qué correos están registrados.',
          requestBody: {
            required: true,
            content: json(fromZod(loginSchema), { email: 'ana@example.com', password: 'calma-y-ruta-2026' }),
          },
          responses: {
            200: ok('Sesión iniciada', ref('Session')),
            400: err('ValidationError'),
            401: err('Unauthorized'),
            429: err('TooManyRequests'),
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Autenticación'],
          summary: 'Cuenta de la sesión actual',
          security: bearer,
          responses: {
            200: ok('Cuenta', { type: 'object', properties: { user: ref('User') }, required: ['user'] }),
            401: err('Unauthorized'),
            404: err('NotFound'),
          },
        },
        delete: {
          tags: ['Autenticación'],
          summary: 'Borrar la cuenta y todos sus datos',
          description: 'Derecho de cancelación: elimina cuenta, perfil, favoritos y notas.',
          security: bearer,
          responses: { 204: { description: 'Cuenta borrada' }, 401: err('Unauthorized') },
        },
      },
      '/me/profile': {
        get: {
          tags: ['Perfil y favoritos'],
          summary: 'Ver el perfil sensorial',
          security: bearer,
          responses: {
            200: ok('Perfil (null si aún no existe)', {
              type: 'object',
              properties: { profile: { anyOf: [ref('Profile'), { type: 'null' }] } },
            }),
            401: err('Unauthorized'),
          },
        },
        put: {
          tags: ['Perfil y favoritos'],
          summary: 'Guardar el perfil sensorial',
          description: 'Sensibilidades del 1 (baja) al 5 (alta) y prioridad de ruta.',
          security: bearer,
          requestBody: { required: true, content: json(fromZod(profileSchema), PROFILE_EXAMPLE) },
          responses: {
            200: ok('Perfil guardado', { type: 'object', properties: { profile: ref('Profile') } }),
            400: err('ValidationError'),
            401: err('Unauthorized'),
          },
        },
      },
      '/me/favorites': {
        get: {
          tags: ['Perfil y favoritos'],
          summary: 'Listar oasis favoritos',
          security: bearer,
          responses: {
            200: ok('Favoritos', { type: 'object', properties: { items: { type: 'array', items: ref('Favorite') } } }, {
              items: [{ ...FAVORITE_EXAMPLE, createdAt: FORMAT_EXAMPLES['date-time'] }],
            }),
            401: err('Unauthorized'),
          },
        },
        post: {
          tags: ['Perfil y favoritos'],
          summary: 'Guardar un oasis en favoritos',
          security: bearer,
          requestBody: {
            required: true,
            content: json(fromZod(favoriteSchema), FAVORITE_EXAMPLE),
          },
          responses: {
            201: ok('Guardado', { type: 'object', properties: { item: ref('Favorite') } }),
            400: err('ValidationError'),
            401: err('Unauthorized'),
          },
        },
      },
      '/me/favorites/{osmId}': {
        delete: {
          tags: ['Perfil y favoritos'],
          summary: 'Quitar un oasis de favoritos',
          security: bearer,
          parameters: [osmIdParam],
          responses: { 204: { description: 'Quitado' }, 401: err('Unauthorized'), 404: err('NotFound') },
        },
      },
      '/me/notes': {
        get: {
          tags: ['Sensory Notes'],
          summary: 'Listar notas (paginadas y filtrables)',
          description: '`q` busca en lugar y texto; `from` y `to` filtran por fecha (ISO 8601 con zona).',
          security: bearer,
          parameters: queryParams(notesQuerySchema),
          responses: {
            200: ok('Página de notas', ref('NotesPage')),
            400: err('ValidationError'),
            401: err('Unauthorized'),
          },
        },
        post: {
          tags: ['Sensory Notes'],
          summary: 'Crear una nota',
          security: bearer,
          requestBody: {
            required: true,
            content: json(fromZod(noteSchema), NOTE_EXAMPLE),
          },
          responses: {
            201: ok('Nota creada', { type: 'object', properties: { item: ref('Note') } }),
            400: err('ValidationError'),
            401: err('Unauthorized'),
          },
        },
        delete: {
          tags: ['Sensory Notes'],
          summary: 'Borrar todas mis notas',
          security: bearer,
          responses: {
            200: ok('Notas borradas', { type: 'object', properties: { deleted: { type: 'integer' } } }),
            401: err('Unauthorized'),
          },
        },
      },
      '/me/notes/{id}': {
        put: {
          tags: ['Sensory Notes'],
          summary: 'Editar una nota',
          description: 'Reemplaza el contenido de una nota propia. Los campos opcionales que no se envían quedan vacíos.',
          security: bearer,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: json(fromZod(noteSchema), NOTE_EXAMPLE) },
          responses: {
            200: ok('Nota actualizada', { type: 'object', properties: { item: ref('Note') } }),
            400: err('ValidationError'),
            401: err('Unauthorized'),
            404: err('NotFound'),
          },
        },
        delete: {
          tags: ['Sensory Notes'],
          summary: 'Borrar una nota',
          security: bearer,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Nota borrada' }, 401: err('Unauthorized'), 404: err('NotFound') },
        },
      },
      '/telemetry/crisis': {
        post: {
          tags: ['Telemetría'],
          summary: 'Registrar una activación del SOS (anónima)',
          description:
            'Sin cuenta, sin ubicación y sin texto libre. El frontend no la envía si el navegador pide `Do Not Track` o `Global Privacy Control`. Los eventos caducan al año.',
          requestBody: {
            required: true,
            content: json(fromZod(crisisSchema), { hour: 18, weekday: 2, temperature: 21.5, weatherCode: 3, source: 'fab' }),
          },
          responses: {
            202: ok('Recibido', { type: 'object', properties: { ok: { const: true } } }),
            400: err('ValidationError'),
            429: err('TooManyRequests'),
          },
        },
      },
      '/telemetry/crisis/summary': {
        get: {
          tags: ['Telemetría'],
          summary: 'Activaciones por hora del día (solo rol admin)',
          security: bearer,
          responses: {
            200: ok('Resumen', {
              type: 'object',
              properties: {
                byHour: {
                  type: 'array',
                  items: { type: 'object', properties: { hour: { type: 'integer' }, count: { type: 'integer' } } },
                },
              },
            }, { byHour: [{ hour: 0, count: 0 }, { hour: 1, count: 2 }, { hour: 2, count: 0 }] }),
            401: err('Unauthorized'),
            403: err('Forbidden'),
          },
        },
      },
      '/psychologists': {
        get: {
          tags: ['Público'],
          summary: 'Profesionales con cédula verificada y aprobados',
          description: 'Solo se listan profesionales reales verificados; la lista puede estar vacía.',
          responses: {
            200: ok('Profesionales', { type: 'object', properties: { items: { type: 'array', items: ref('Psychologist') } } }, { items: [] }),
          },
        },
      },
      '/proxy/weather': {
        get: {
          tags: ['Público'],
          summary: 'Pronóstico de Open-Meteo (caché de 15 min)',
          description:
            'Las coordenadas se redondean a 2 decimales (~1 km) antes de salir del servidor. Responde el JSON de Open-Meteo tal cual. Cabecera `X-Cache: HIT|MISS`.',
          parameters: queryParams(coordsSchema).map((p) => ({ ...p, required: true })),
          responses: {
            200: ok('Pronóstico', { type: 'object', description: 'Respuesta de https://open-meteo.com' }),
            400: err('ValidationError'),
            502: err('BadGateway'),
          },
        },
      },
      '/proxy/countries': {
        get: {
          tags: ['Público'],
          summary: 'Países de REST Countries v5 (caché de 24 h)',
          description: 'La clave de REST Countries vive en el servidor y nunca llega al navegador. Cabecera `X-Cache: HIT|MISS`.',
          responses: {
            200: ok('Países', { type: 'object', description: 'Respuesta de https://restcountries.com (v5)' }),
            502: err('BadGateway'),
            503: err('Unavailable'),
          },
        },
      },
      '/havens/{osmId}/certification': {
        get: {
          tags: ['Público'],
          summary: 'Sello Sensory Haven de un lugar (motor PHP, caché de 10 min)',
          parameters: [osmIdParam],
          responses: {
            200: ok('Estado del sello', ref('Certification'), { certified: false }),
            400: err('BadRequest'),
            502: err('BadGateway'),
            503: err('Unavailable'),
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
          required: ['error'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Datos no válidos' },
            fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: { field: { type: 'string' }, message: { type: 'string' } },
              },
            },
          },
          required: ['error', 'fields'],
        },
        Health: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            service: { type: 'string' },
            storage: {
              type: 'object',
              properties: {
                users: { enum: ['supabase', 'memory'] },
                notes: { enum: ['mongodb', 'memory'] },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            displayName: { type: 'string' },
            role: { enum: ['user', 'psychologist', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Session: {
          type: 'object',
          properties: { token: { type: 'string', description: 'JWT HS256, caduca en 2 h' }, user: ref('User') },
          required: ['token', 'user'],
        },
        Profile: {
          allOf: [fromZod(profileSchema), { type: 'object', properties: { updatedAt: { type: 'string', format: 'date-time' } } }],
          example: { ...PROFILE_EXAMPLE, updatedAt: FORMAT_EXAMPLES['date-time'] },
        },
        Favorite: {
          allOf: [fromZod(favoriteSchema), { type: 'object', properties: { createdAt: { type: 'string', format: 'date-time' } } }],
          example: { ...FAVORITE_EXAMPLE, createdAt: FORMAT_EXAMPLES['date-time'] },
        },
        Note: {
          allOf: [
            fromZod(noteSchema),
            {
              type: 'object',
              properties: { id: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } },
            },
          ],
          example: { id: FORMAT_EXAMPLES.uuid, ...NOTE_EXAMPLE, createdAt: FORMAT_EXAMPLES['date-time'] },
        },
        NotesPage: {
          type: 'object',
          properties: {
            items: { type: 'array', items: ref('Note') },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' },
          },
          example: {
            items: [{ id: FORMAT_EXAMPLES.uuid, ...NOTE_EXAMPLE, createdAt: FORMAT_EXAMPLES['date-time'] }],
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
        Psychologist: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            displayName: { type: 'string' },
            specialty: { type: 'string' },
            whatsapp: { type: ['string', 'null'], description: 'Solo dígitos con código de país, para wa.me' },
            online: { type: 'boolean' },
            status: { const: 'approved' },
          },
          example: {
            id: FORMAT_EXAMPLES.uuid,
            displayName: 'Ejemplo ficticio (no es una persona real)',
            specialty: 'Psicología clínica',
            whatsapp: null,
            online: false,
            status: 'approved',
          },
        },
        Certification: {
          type: 'object',
          properties: {
            certified: { type: 'boolean' },
            folio: { type: 'string', example: 'NN-2026-000001' },
            name: { type: 'string' },
            osmId: { type: 'string' },
            icas: { type: 'number' },
            level: { enum: ['alto', 'moderado', 'bajo'] },
            auditedAt: { type: 'string', format: 'date' },
            expiresAt: { type: 'string', format: 'date' },
            integrity: { enum: ['ok', 'alterado'] },
          },
          required: ['certified'],
        },
      },
      responses: {
        BadRequest: { description: 'Petición no válida', content: json(ref('Error')) },
        ValidationError: { description: 'Datos no válidos', content: json(ref('ValidationError')) },
        Unauthorized: {
          description: 'Falta la sesión o caducó',
          content: json(ref('Error'), { error: 'Inicia sesión para continuar' }),
        },
        Forbidden: { description: 'Sin permiso para esta acción', content: json(ref('Error')) },
        NotFound: { description: 'No encontrado', content: json(ref('Error')) },
        Conflict: { description: 'Ya existe', content: json(ref('Error')) },
        TooManyRequests: { description: 'Demasiados intentos; espera unos minutos', content: json(ref('Error')) },
        BadGateway: { description: 'El servicio externo no respondió', content: json(ref('Error')) },
        Unavailable: { description: 'Servicio no configurado', content: json(ref('Error')) },
      },
    },
  };
}
