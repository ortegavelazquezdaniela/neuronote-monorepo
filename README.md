# NEURONOTE (NEUROROUTE)

> *Find your calm. Find your way.*
> Un espacio donde moverte por el mundo no tenga que significar sobrecargarte.

Plataforma web de descompresión sensorial e inteligencia geoespacial para personas neurodivergentes y con diferentes necesidades de procesamiento sensorial: rutas peatonales más tranquilas, oasis sensoriales, microclima y apoyo en crisis.

**Presupuesto: $0.00 MXN** — solo herramientas gratuitas y open source.

![CI](https://github.com/ortegavelazquezdaniela/neuronote-monorepo/actions/workflows/ci.yml/badge.svg)
![Pruebas](https://img.shields.io/badge/pruebas-99%20pasando-2f5d55)
![Cobertura frontend](https://img.shields.io/badge/cobertura%20frontend-82%25-407076)
![Cobertura backend](https://img.shields.io/badge/cobertura%20backend-96%25-407076)
![Lighthouse](https://img.shields.io/badge/Lighthouse%20inicio-99%20%C2%B7%20100%20%C2%B7%20100%20%C2%B7%20100-184077)
![Licencia MIT](https://img.shields.io/badge/licencia-MIT-c9c5ba)

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Entorno, design system, página principal responsive | ✅ |
| 2 | Modos de accesibilidad, intro, modal SOS (Alt + C), formularios, estados | ✅ |
| 3 | Leaflet + OSM, Nominatim/Overpass, rutas a pie, Open-Meteo, REST Countries, WhatsApp | ✅ |
| 4 | API Express (JWT + bcrypt), Supabase/PostgreSQL con RLS, MongoDB Atlas, motor PHP + MySQL | ✅ (Supabase y MongoDB necesitan tus claves, ver abajo) |
| 5 | Vitest + RTL + MSW, Supertest, Storybook, CI/CD, Lighthouse, configuración de despliegue | ✅ (el despliegue necesita tus cuentas de Vercel y Render) |

## Arquitectura

```
                         ┌──────────────── navegador ────────────────┐
                         │ React 19 + Vite (SPA, Atomic Design)      │
                         │  Leaflet ← tile.openstreetmap.org         │
                         │  Nominatim / Overpass / OSRM / Open-Meteo │
                         │  Supabase Realtime (solo presencia pública)│
                         └──────────────┬────────────────────────────┘
                                        │ JWT Bearer
                         ┌──────────────▼──────────────┐
                         │ API Node.js + Express 5      │  helmet · CORS · rate limit
                         │ /api/auth /api/me /api/proxy │  zod · bcrypt · errores seguros
                         └───┬──────────────┬───────────┘
            clave secreta    │              │ Mongoose
       ┌─────────────────────▼───┐   ┌──────▼─────────────────────┐
       │ Supabase (PostgreSQL)   │   │ MongoDB Atlas (M0)         │
       │ cuentas, perfiles,      │   │ Sensory Notes, telemetría  │
       │ favoritos, psicólogos   │   │ anónima del SOS (time-     │
       │ RLS en todas las tablas │   │ series, caduca en 1 año)   │
       └─────────────────────────┘   └────────────────────────────┘
                                        │ /src/verify.php
                         ┌──────────────▼──────────────┐
                         │ Motor de auditoría PHP 8     │  ICAS, actas, cédulas,
                         │ + MySQL (XAMPP) · PDO        │  sellos con HMAC-SHA256
                         └──────────────────────────────┘
```

| Responsabilidad | Tecnología | Dónde |
|---|---|---|
| Interfaz, accesibilidad, mapas | React 19, Vite 7, React Router 7, CSS Modules, Leaflet | `frontend/` |
| API REST, autenticación, proxy con caché | Node.js, Express 5, JWT, bcryptjs, zod, helmet, express-rate-limit | `backend/` |
| Datos relacionales + RLS + Realtime | Supabase (PostgreSQL 17) | `backend/db/supabase/*.sql` |
| Notas y telemetría anónima | MongoDB Atlas + Mongoose | `backend/src/models/` |
| Auditorías, cédulas, sellos | PHP 8.2 + MySQL/MariaDB (PDO, `$_POST`, CSRF) | `audit-engine/` |

## Requisitos

- [Node.js LTS](https://nodejs.org/) 20.19+ (probado con 24.x) y npm · [Git](https://git-scm.com/)
- XAMPP (PHP 8.2 + MariaDB) para el motor de auditoría
- Visual Studio Code (extensiones recomendadas en `.vscode/extensions.json`)

## Ejecutar en local (terminal de VS Code)

Abre **tres terminales** (frontend, API y motor PHP):

```bash
# Terminal 1 — Frontend → http://localhost:5173
cd frontend
npm install
cp .env.example .env.local        # PowerShell: Copy-Item .env.example .env.local
npm run dev

# Terminal 2 — API → http://localhost:4000/api/health
cd backend
npm install
cp .env.example .env              # luego genera JWT_SECRET (instrucciones dentro)
npm run dev

# Terminal 3 — Motor de auditoría → http://localhost:8080
# (XAMPP Control Panel: MySQL en Start)
npm run audit:serve               # desde la raíz del monorepo
```

Sin Supabase ni MongoDB configurados, la API arranca en **modo memoria** (lo avisa en consola y en `/api/health`): todo funciona, pero las cuentas y notas se pierden al reiniciar.

### Calidad

| Comando | Qué hace |
|---|---|
| `npm run lint` (en `frontend/` o `backend/`) | ESLint |
| `npm test` / `npm run coverage` (frontend) | Vitest + React Testing Library + MSW, con umbral de cobertura del 70 % |
| `npm test` / `npm run coverage` (backend) | Vitest + Supertest |
| `C:\xampp\php\php.exe audit-engine/tests/icas_test.php` | Pruebas del ICAS |
| `npm run storybook` (frontend) | Catálogo de componentes → http://localhost:6006 |
| `npm run build` / `npm run build-storybook` (frontend) | Compilación de producción y del catálogo |

Resultados al 23-nov-2026: **69 pruebas de frontend** (81.7 % sentencias, 84.8 % líneas), **30 de backend** (95.7 % sentencias, 99.2 % líneas) y **7 del ICAS**, todas pasando. La CI (`.github/workflows/ci.yml`) repite todo en cada pull request, incluida la creación del esquema MySQL.

## Configurar los servicios en la nube (gratis)

### Supabase — PostgreSQL con RLS (ya creado)

El proyecto **`neuronote`** (us-east-1, plan Free, $0) ya tiene aplicadas las migraciones `backend/db/supabase/001_init.sql` y `002_harden_privileges.sql`: 6 tablas, RLS en todas, presencia pública de profesionales para Realtime, y el asesor de seguridad sin advertencias.

Falta **una** cosa, que solo tú puedes hacer:

1. Entra a <https://supabase.com/dashboard/project/uerubfhrjspfiemgsufn/settings/api-keys>.
2. En **Secret keys**, crea o copia una clave (`sb_secret_…`).
3. Pégala en `backend/.env` → `SUPABASE_SECRET_KEY=` (nunca en el frontend ni en el chat).
4. Reinicia la API: la consola dirá `usuarios: supabase`.

### MongoDB Atlas — clúster M0 gratuito

1. Crea una cuenta en <https://www.mongodb.com/cloud/atlas/register> (plan **M0 Free**, sin tarjeta).
2. **Create cluster → M0 → AWS → us-east-1** (o la región más cercana) → nombre `neuronote`.
3. **Database Access → Add New Database User**: usuario `neuronote_api`, contraseña generada, rol *Read and write to any database*.
4. **Network Access → Add IP Address**: tu IP actual (para desarrollo). Para Render, Atlas pide `0.0.0.0/0` porque su plan Free no tiene IP fija.
5. **Connect → Drivers → Node.js**: copia la cadena `mongodb+srv://…` y pégala en `backend/.env` → `MONGODB_URI=` (reemplaza `<db_password>`).
6. Reinicia la API: la consola dirá `notas: mongodb`.

### REST Countries

La clave vive ahora en el servidor (`backend/.env → RESTCOUNTRIES_KEY`) y el navegador consulta `/api/proxy/countries` (caché de 24 h). Puedes borrar `VITE_RESTCOUNTRIES_KEY` de `frontend/.env.local`.

## Motor de auditoría (PHP + MySQL)

- Base `neuronote_audit` con usuario dedicado `neuronote_app` (solo SELECT/INSERT/UPDATE/DELETE sobre sus 4 tablas). Credenciales en `audit-engine/.env` (local, no se sube).
- **Panel pericial** <http://localhost:8080/> (usuario `admin`; contraseña en el comentario de `audit-engine/.env`): aprobar/rechazar actas, emitir sellos, aprobar/suspender/editar/eliminar profesionales.
- Formularios: `/src/submit_audit.php` (acta + ICAS) y `/src/register_professional.php` (cédula).
- Verificación pública JSON: `/src/verify.php?folio=NN-2026-000001` u `?osm_id=way-123`. Si alguien altera el acta en la base, el hash HMAC deja de coincidir y responde `"integrity": "alterado"`.
- **ICAS**: fórmula propia y documentada en `audit-engine/src/icas.php` (no es una norma oficial).

> Nota de este equipo: la tabla del sistema `mysql.db` de tu MariaDB está dañada (pasa cuando XAMPP se cierra de golpe). NEURONOTE no la necesita (usa permisos por tabla), pero puede afectar a otros proyectos. Para repararla: phpMyAdmin → base `mysql` → tabla `db` → *Operaciones* → **Reparar tabla**, o `REPAIR TABLE mysql.db;` como root.

## Despliegue gratuito

| Parte | Servicio | Archivo | Pasos |
|---|---|---|---|
| Frontend | **Vercel Hobby** (uso no comercial; se pausa al pasar límites, no cobra) | `frontend/vercel.json` | vercel.com → Add New Project → importa el repo → *Root Directory* `frontend` → variables `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` → Deploy |
| API | **Render Free** (duerme tras 15 min sin tráfico; ~1 min en despertar) | `render.yaml` | render.com → New → **Blueprint** → elige el repo → completa `CORS_ORIGIN` (tu URL de Vercel), `SUPABASE_SECRET_KEY`, `MONGODB_URI`, `RESTCOUNTRIES_KEY` |
| Motor PHP | **Render Free** (Docker) + **TiDB Cloud Starter** (compatible con MySQL, 5 GiB gratis, sin tarjeta) | `audit-engine/Dockerfile`, `render.yaml` | Pasos abajo |

Al terminar: agrega tu dominio de Vercel a los orígenes permitidos de REST Countries y a `CORS_ORIGIN`. Si Render te pide tarjeta durante el registro (algunas cuentas lo reportan), no la pongas: avísame y movemos la API a otra opción gratuita.

### Publicar el motor PHP (Render + TiDB Cloud)

**1. Base de datos en TiDB Cloud Starter**

1. Crea una cuenta en <https://tidbcloud.com> (GitHub o Google). **No agregues tarjeta.**
2. Crea un clúster **Starter**. Deja el **límite de gasto en 0**, así nunca cobra: si se agota la cuota gratuita, se pone lento, pero no factura.
3. Abre el clúster → **SQL Editor**, pega el contenido de `audit-engine/db/schema.sql` y ejecútalo (crea la base `neuronote_audit` y sus 4 tablas).
4. Pulsa **Connect** y anota *Host*, *Port* (4000) y *User* (`<prefijo>.root`). Genera la contraseña ahí mismo. **No la pegues en el chat**: solo va en el panel de Render.
5. En **Networking**, deja activo el acceso público. Render Free no tiene una IP fija para filtrar; la conexión va cifrada con TLS y protegida por contraseña.

**2. Servicio `neuronote-audit` en Render**

- Si creaste la API con **Blueprint**: Render → tu Blueprint → **Manual Sync**. Detecta `neuronote-audit` en `render.yaml` y te pide sus variables.
- Si la creaste a mano: **New → Web Service** → el repo → *Language* **Docker** → *Root Directory* `audit-engine` → plan **Free** → *Health Check Path* `/src/health.php`.

Variables del servicio:

| Variable | Valor |
|---|---|
| `DB_HOST` | El *Host* de TiDB (`gateway01.….prod.aws.tidbcloud.com`) |
| `DB_PORT` | `4000` |
| `DB_NAME` | `neuronote_audit` |
| `DB_USER` | El *User* de TiDB (`<prefijo>.root`) |
| `DB_PASS` | La contraseña de TiDB |
| `ADMIN_USER` | `admin` |
| `ADMIN_PASS_HASH` | El mismo hash de tu `audit-engine/.env`, o uno nuevo: `C:\xampp\php\php.exe -r "echo password_hash('TU_CONTRASEÑA', PASSWORD_DEFAULT);"` |
| `BADGE_SECRET` | Lo genera el Blueprint. A mano: `C:\xampp\php\php.exe -r "echo bin2hex(random_bytes(32));"` |

La imagen ya define `TRUST_PROXY=1` (HTTPS detrás del proxy de Render) y `DB_SSL_CA` (TLS verificado hacia TiDB).

**3. Conectar la API**

En el servicio de la API (`neuronote-api`), agrega `AUDIT_ENGINE_URL` con la URL pública del motor, **sin barra final** (p. ej. `https://neuronote-audit-xxxx.onrender.com`), y guarda; Render la vuelve a desplegar.

**4. Comprobar**

- `https://<motor>/src/health.php` → `{"ok":true,...}`
- `https://<motor>/src/verify.php?osm_id=way-1` → `{"certified":false}` (conecta con TiDB)
- `https://<api>/api/havens/way-1/certification` → `{"certified":false}`
- `https://<motor>/` pide usuario y contraseña (panel pericial)

Notas:
- La base en la nube empieza vacía: las actas y los sellos de tu XAMPP no se copian, y los sellos solo se verifican con el `BADGE_SECRET` con el que se emitieron.
- Los dos servicios gratuitos de Render comparten 750 horas al mes y se duermen tras 15 min sin uso. Si el motor está dormido, la primera consulta de un sello puede fallar (la API espera 10 s); la página del oasis solo oculta el sello y lo muestra en la siguiente visita.

## Accesibilidad y rendimiento (Lighthouse 13, móvil, compilación de producción)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Inicio `/` | 99 | 100 | 100 | 100 |
| Notas `/notas` | 77 | 100 | 100 | 100 |
| SOS `/auxilio-inmediato` | 74 | 100 | 100* | 100 |
| Oasis `/oasis` | 60 | 97 | 96 | 100 |

\*En la medición local hubo errores de CORS porque la vista previa corría en otro puerto; ya está corregido en la configuración local.
En `/oasis`, Lighthouse marca marcadores del mapa muy juntos (*target-size*); WCAG 2.2 (2.5.8) lo permite porque cada lugar tiene un botón de tamaño completo en la lista de texto. El rendimiento de las páginas con mapa depende de las teselas de OpenStreetMap. No se sacrificó accesibilidad para subir puntuaciones.

## Datos y honestidad

Cada valor visible indica su procedencia: **Calculado**, **Pronóstico** (Open-Meteo), **Estimado**, **Reportado** (comunidad), **Sin verificar** (lugar real aún no evaluado) o **Demostración** (solo el mapa ilustrativo del inicio). No hay establecimientos, certificaciones ni profesionales inventados.

## Ayuda en crisis

Línea de la Vida (CONASAMA): **800 911 2000** — gratuita, 24 h. Emergencias: **911**.
NEURONOTE no sustituye atención médica, psicológica ni servicios de emergencia.

## Licencia

MIT — ver [LICENSE](LICENSE).
