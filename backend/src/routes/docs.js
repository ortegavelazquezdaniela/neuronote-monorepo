import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApi } from '../docs/openapi.js';

/**
 * Documentación de la API:
 *   GET /api/openapi.json  → especificación OpenAPI 3.1 (importable en Postman, Insomnia, etc.)
 *   GET /api/docs          → Swagger UI para leerla y probarla desde el navegador
 */
export function docsRoutes() {
  const spec = buildOpenApi();
  const r = Router();
  r.get('/openapi.json', (_req, res) => res.json(spec));
  r.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'NEURONOTE API · Documentación',
      swaggerOptions: {
        // El token se queda solo en la pestaña: no se guarda en localStorage.
        persistAuthorization: false,
        tryItOutEnabled: false,
        defaultModelsExpandDepth: 0,
        docExpansion: 'list',
      },
    }),
  );
  return r;
}
