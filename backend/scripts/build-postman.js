/**
 * Genera la colección de Postman desde la especificación OpenAPI:
 *   npm run postman  →  backend/docs/neuronote-api.postman_collection.json
 *
 * La URL base queda en la variable de colección {{baseUrl}} (local por defecto)
 * y el token en {{token}}: nunca se guarda un token real en el archivo.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import Converter from 'openapi-to-postmanv2';
import { buildOpenApi } from '../src/docs/openapi.js';

const OUT = new URL('../docs/neuronote-api.postman_collection.json', import.meta.url);
const spec = buildOpenApi({ serverUrl: 'http://localhost:4000/api' });

// Solo para la colección: el convertidor inventa valores y longitudes de listas al azar.
// Se fija un ejemplo por tipo donde la especificación no trae uno, para que el archivo
// generado sea siempre idéntico y la CI pueda detectar si quedó desactualizado.
(function fixExamples(node) {
  if (Array.isArray(node)) return node.forEach(fixExamples);
  if (!node || typeof node !== 'object') return;
  const isSchema = 'type' in node || 'enum' in node || 'const' in node;
  if (isSchema && node.example === undefined) {
    const type = Array.isArray(node.type) ? node.type[0] : node.type;
    if (node.const !== undefined) node.example = node.const;
    else if (node.enum) node.example = node.enum[0];
    else if (type === 'integer' || type === 'number') node.example = node.minimum ?? 0;
    else if (type === 'boolean') node.example = false;
    else if (type === 'string' && !node.format) node.example = 'texto';
    else if (type === 'array') Object.assign(node, { minItems: 1, maxItems: 1 });
  }
  Object.values(node).forEach(fixExamples);
})(spec);

const convert = promisify(Converter.convert);
const result = await convert(
  { type: 'json', data: spec },
  {
    folderStrategy: 'Tags',
    requestParametersResolution: 'Example',
    exampleParametersResolution: 'Example',
    // Sin datos inventados al azar: solo los ejemplos escritos en la especificación.
    schemaFaker: false,
  },
);
if (!result.result) throw new Error(`No se pudo convertir: ${result.reason}`);

const collection = result.output[0].data;
collection.info.description =
  'Colección generada desde /api/openapi.json (npm run postman). Cambia {{baseUrl}} a tu URL de Render para probar producción. ' +
  'Ejecuta "Iniciar sesión" y pega el token en la variable {{token}} de la colección.';
collection.auth = { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] };
collection.variable = [
  { key: 'baseUrl', value: 'http://localhost:4000/api', type: 'string' },
  { key: 'token', value: '', type: 'string' },
];

// Las rutas públicas no deben mandar el token aunque la colección lo tenga.
const publicPaths = ['/health', '/auth/register', '/auth/login', '/psychologists', '/proxy/', '/havens/', '/telemetry/crisis'];
(function walk(items) {
  for (const item of items) {
    if (item.item) walk(item.item);
    if (!item.request) continue;
    const path = '/' + (item.request.url?.path ?? []).join('/');
    const isPublic = publicPaths.some((p) => path.startsWith(p)) && !path.endsWith('/summary');
    item.request.auth = isPublic ? { type: 'noauth' } : { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] };
  }
})(collection.item);

// El convertidor pone UUID aleatorios: se reemplazan por UUID estables (derivados de la
// posición en el árbol) para que regenerar sin cambios produzca el mismo archivo.
function stableIds(node, path = 'root') {
  if (Array.isArray(node)) return node.forEach((n, i) => stableIds(n, `${path}/${i}`));
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    if ((k === 'id' || k === '_postman_id') && typeof v === 'string' && /^[0-9a-f-]{36}$/.test(v)) {
      const h = createHash('sha1').update(`${path}/${k}`).digest('hex');
      node[k] = `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
    } else stableIds(v, `${path}/${k}`);
  }
}
stableIds(collection);

mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
writeFileSync(OUT, JSON.stringify(collection, null, 2) + '\n');
console.log(`Colección de Postman escrita en ${OUT.pathname}`);
