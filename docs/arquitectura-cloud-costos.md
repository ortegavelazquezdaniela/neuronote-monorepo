# NEURONOTE · Arquitectura cloud y justificación de costos

> Documento de la Fase 8. Límites y precios verificados el **23 de noviembre de 2026** en las páginas oficiales de cada proveedor (enlaces al final). Los planes gratuitos cambian: revisa las fuentes antes de tomar decisiones.

## 1. Resumen

| | |
|---|---|
| **Presupuesto del proyecto** | $0.00 MXN |
| **Costo mensual actual** | **$0.00** — todos los servicios en plan gratuito, ninguno con tarjeta registrada |
| **Servicios en la nube** | 7 (Vercel, Render ×2, Supabase, MongoDB Atlas, TiDB Cloud, GitHub) + Sentry opcional |
| **APIs externas** | 7 gratuitas y abiertas (OpenStreetMap, Nominatim, Overpass, OSRM, Open-Meteo, REST Countries, WhatsApp) |
| **Costo estimado si se volviera un servicio comercial** | desde ~US$ 67 al mes más mapas y clima (sección 6) |

## 2. Arquitectura desplegada

```
                 ┌──────────────────────── Navegador (React 19 SPA) ────────────────────────┐
                 │  Leaflet ─► tile.openstreetmap.org   (mosaicos del mapa)                  │
                 │  Nominatim / Overpass ─► lugares       OSRM FOSSGIS ─► rutas a pie         │
                 │  supabase-js ─► Supabase Realtime (solo presencia pública de profesionales)│
                 │  wa.me ─► WhatsApp (enlace; el mensaje lo envía la persona)                 │
                 └───────────────┬───────────────────────────────────────────────────────────┘
        Vercel Hobby (CDN)       │ HTTPS + JWT Bearer
        sitio estático           ▼
                 ┌──────────────────────────────┐        ┌──────────────────────────────┐
                 │ API Node.js + Express 5      │ HTTPS  │ Motor de auditoría PHP 8.3   │
                 │ Render Free (neuronote-api)  ├───────►│ Render Free, Docker          │
                 │ /api/docs (Swagger)          │        │ (neuronote-audit)            │
                 └──┬───────────┬───────────┬───┘        └───────────────┬──────────────┘
                    │           │           │ proxy con caché            │ TLS verificado
          service   │  driver   │           ▼                            ▼
          role key  ▼           ▼     Open-Meteo · REST Countries   TiDB Cloud Starter
          Supabase Free    MongoDB Atlas Free                       (compatible con MySQL)
          PostgreSQL+RLS   Sensory Notes + telemetría               actas, ICAS, sellos
          cuentas, perfil, anónima del SOS (TTL 1 año)
          favoritos
                    ▲
          Sentry Developer (opcional): solo errores 500, sin datos personales
          GitHub: repositorio público, Actions (CI + Storybook) y Pages (Storybook)
```

### Por qué cada pieza

| Pieza | Servicio | Por qué este y no otro |
|---|---|---|
| Frontend | **Vercel Hobby** | CDN global, HTTPS y vista previa por pull request sin configurar nada. `vercel.json` agrega cabeceras de seguridad y caché inmutable de assets. |
| API | **Render Free** (Node 22) | Ejecuta un servidor Node persistente (Express) sin tarjeta; Blueprint (`render.yaml`) deja la infraestructura como código. |
| Motor PHP | **Render Free** (Docker) | Los hostings PHP gratuitos bloquean peticiones entre servidores (la API no podría consultar los sellos). Docker en Render sí lo permite. |
| Cuentas y perfil | **Supabase Free** | PostgreSQL con Row Level Security y Realtime (WebSockets) para la presencia de profesionales, en un solo servicio. |
| Notas y telemetría | **MongoDB Atlas Free** | Documentos flexibles (notas con campos opcionales) y colecciones *time series* con caducidad automática para la telemetría anónima. |
| Auditorías | **TiDB Cloud Starter** | Compatible con MySQL (el motor usa PDO MySQL) y gratis sin tarjeta. Aiven retiró su MySQL gratuito el 6-nov-2026. |
| CI y catálogo | **GitHub Actions + Pages** | Gratis en repositorios públicos: lint, pruebas, cobertura, imagen Docker y publicación de Storybook. |

## 3. Límites gratuitos y cómo se respetan

| Servicio | Límite del plan gratuito | Uso de NEURONOTE / mitigación |
|---|---|---|
| Vercel Hobby | 100 GB/mes de *Fast Data Transfer*; **solo uso personal no comercial** | Sitio de ~600 KB por visita al mapa; proyecto académico. Al pasar el límite se pausa 30 días (no cobra). |
| Render Free | 750 h de instancia al mes **por workspace**; se duerme tras 15 min sin tráfico y tarda hasta ~1 min en despertar; disco efímero | Dos servicios comparten las 750 h, pero solo cuentan mientras están despiertos. Nada se guarda en disco: los datos viven en las bases. El frontend tolera la API dormida (mensajes de reintento) y la página del oasis oculta el sello si el motor tarda. |
| Supabase Free | 500 MB por proyecto, 2 proyectos activos; **se pausa tras una semana con poca actividad** | Tablas pequeñas (cuentas y perfiles). **Riesgo:** antes de una demostración, entra al panel y reanuda el proyecto si está pausado. |
| MongoDB Atlas Free | 512 MB de almacenamiento (límite duro), 100 operaciones/s | Notas de texto corto (≤ 500 caracteres) y telemetría que se borra sola al año. |
| TiDB Cloud Starter | 5 GiB de filas y 50 M de *Request Units* al mes por instancia; con límite de gasto en 0 nunca cobra | Actas y sellos: unos pocos KB por establecimiento. |
| Sentry Developer | ~5 000 errores/mes, 1 persona (opcional) | Solo se reportan errores 500 inesperados. |
| GitHub Pages | Sitio ≤ 1 GB, 100 GB/mes de ancho de banda (límite blando) | Storybook estático de pocos MB. |
| GitHub Actions | Gratis con runners estándar en repositorios públicos | 3 jobs por pull request + 1 de Storybook al fusionar. |

### APIs externas y sus políticas

| API | Condición | Cómo la cumple NEURONOTE |
|---|---|---|
| Mosaicos de OpenStreetMap | Prohibido el uso intensivo sin permiso; atribución visible | Atribución en el mapa, el navegador cachea mosaicos, sin precarga masiva ni mosaicos retina. |
| Nominatim | Máximo **1 petición por segundo** para toda la aplicación | Cola con 1.1 s entre peticiones y caché en el navegador; Overpass como respaldo. |
| OSRM (FOSSGIS) | Uso razonable, no comercial | Solo se calcula una ruta cuando la persona la pide. |
| Open-Meteo | < 10 000 llamadas/día, 5 000/hora, 600/min; no comercial; atribución CC BY 4.0 | Proxy en la API con caché de 15 min por zona de ~1 km. |
| REST Countries v5 | Clave gratuita | La clave vive solo en Render; caché de 24 h. |
| WhatsApp | Enlace `wa.me`, no es una API de envío | NEURONOTE no envía mensajes ni guarda conversaciones. |

## 4. Seguridad y privacidad en la nube

- **Secretos:** solo en variables de entorno de Render (`sync: false` en `render.yaml`). El navegador recibe únicamente la clave *publicable* de Supabase, limitada por RLS a la tabla pública de presencia.
- **Cifrado en tránsito:** HTTPS en Vercel y Render; TLS verificado entre el motor PHP y TiDB.
- **Datos mínimos:** contraseñas con bcrypt (12 rondas); coordenadas redondeadas a ~1 km antes de salir hacia Open-Meteo; telemetría del SOS sin cuenta, ubicación ni texto.
- **Monitoreo:** Sentry, si se activa, recibe solo el tipo de error y la ruta patrón: sin IP, token, cuerpo ni coordenadas.

## 5. Riesgos operativos del plan gratuito

| Riesgo | Efecto | Qué hacer |
|---|---|---|
| Render dormido | La primera petición tarda hasta ~1 min | Abrir la app unos minutos antes de una demostración. |
| Supabase pausado (1 semana sin uso) | Cuentas, perfil y favoritos fallan | Reanudarlo desde el panel de Supabase. |
| Horas de Render agotadas | Los dos servicios se suspenden hasta el mes siguiente | Improbable con tráfico académico; se ve en el panel de Render. |
| Cambio de condiciones de un proveedor | Un servicio deja de ser gratis (como Aiven MySQL) | La arquitectura usa estándares (PostgreSQL, MongoDB, MySQL, Docker) y se puede mover. |

## 6. Si NEURONOTE se volviera un servicio real

Los planes gratuitos de Vercel, Open-Meteo y los mosaicos de OSM **prohíben el uso comercial o intensivo**, así que un lanzamiento público con tráfico real necesitaría planes de pago. Estimación mínima, en dólares estadounidenses, con precios publicados al 23-nov-2026:

| Concepto | Plan | Costo mensual |
|---|---|---|
| Frontend | Vercel Pro (1 asiento) | US$ 20 |
| API + motor PHP | Render Starter × 2 | US$ 14 |
| PostgreSQL | Supabase Pro (incluye US$ 10 de cómputo) | US$ 25 |
| Notas | MongoDB Atlas Flex | US$ 8 – 30 |
| Auditorías | TiDB Cloud Starter (mientras quepa en 5 GiB) | US$ 0 |
| **Subtotal infraestructura** | | **≈ US$ 67 – 89** |
| Mapas | Proveedor comercial de mosaicos o servidor propio | Depende del tráfico |
| Clima | Plan comercial de Open-Meteo | Según su tarifa vigente |
| Errores | Sentry Developer sigue siendo suficiente al inicio | US$ 0 |

Alternativa de menor costo: un solo servidor virtual con Docker Compose (frontend, API, PHP, PostgreSQL y MongoDB) reduce la factura, pero traslada a la persona responsable las copias de seguridad, las actualizaciones de seguridad y la disponibilidad.

## 7. Fuentes (consultadas el 23-nov-2026)

- Vercel Hobby: <https://vercel.com/docs/plans/hobby> · uso justo: <https://vercel.com/docs/limits/fair-use-guidelines> · Pro: <https://vercel.com/docs/plans/pro-plan>
- Render Free: <https://render.com/docs/free> · precios: <https://render.com/pricing>
- Supabase: <https://supabase.com/pricing> · pausa de proyectos: <https://supabase.com/kb/faqs/platform/free-project-pausing> · tamaño de base: <https://supabase.com/changelog/33121-relaxing-database-size-limit-on-free-plan-0-5-gb-database-size-per-project>
- MongoDB Atlas Free: <https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/> · Flex: <https://www.mongodb.com/docs/atlas/billing/atlas-flex-costs/>
- TiDB Cloud Starter: <https://docs.pingcap.com/tidbcloud/select-cluster-tier> · límites: <https://docs.pingcap.com/tidbcloud/serverless-limitations/>
- Aiven (retiro del MySQL gratuito): <https://aiven.io/free-mysql-database-retired>
- Sentry: <https://sentry.io/pricing/>
- GitHub Pages: <https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits> · disponibilidad: <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>
- Política de mosaicos de OSM: <https://operations.osmfoundation.org/policies/tiles/> · Nominatim: <https://operations.osmfoundation.org/policies/nominatim/>
- Open-Meteo: <https://open-meteo.com/en/terms>
