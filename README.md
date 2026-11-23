# NEURONOTE (NEUROROUTE)

> *Find your calm. Find your way.*
> Un espacio donde moverte por el mundo no tenga que significar sobrecargarte.

Plataforma web de descompresión sensorial e inteligencia geoespacial para personas neurodivergentes y con diferentes necesidades de procesamiento sensorial: rutas peatonales más tranquilas, oasis sensoriales, microclima y apoyo en crisis.

**Presupuesto: $0.00 MXN** — solo herramientas gratuitas y open source.

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Entorno, design system, página principal responsive | ✅ Completada |
| 2 | Interactividad: modos de accesibilidad, intro animada, modal SOS (Alt + C), formularios | ✅ Completada |
| 3 | Leaflet + OpenStreetMap, Open-Meteo, REST Countries, WhatsApp deep-link | ✅ Completada (REST Countries requiere clave gratuita) |
| 4 | Express + JWT, Supabase (RLS), MongoDB Atlas, PHP + MySQL | Pendiente |
| 5 | Vitest, RTL, MSW, Supertest, Storybook, CI/CD y despliegue | Pendiente |

## Estructura

```
neuronote-monorepo/
├── frontend/          React 19 + Vite (Atomic Design)
│   └── src/
│       ├── atoms/       Button, Logo, DataBadge, SkipLink, TextField, Switch,
│       │                StatusMessage, PageLoader
│       ├── molecules/   RouteCompare, LayerToggle, ChoiceGroup, EmptyState
│       ├── organisms/   SiteHeader, Hero, CityMap, ModulesSection, MapPreview,
│       │                PurposeSection, SiteFooter, SosFab, CrisisDialog,
│       │                BrandIntro, SensoryNoteForm, NotesHistory
│       ├── templates/   MainLayout
│       ├── pages/       HomePage, CrisisHelpPage, AccessibilityPage, NotesPage,
│       │                SectionPage, NotFoundPage, RouteErrorPage
│       ├── providers/   PreferencesProvider, SosProvider (contexto global)
│       ├── hooks/       useDocumentTitle, usePreferences, useSos
│       ├── services/    storage.js, preferencesStore.js, notesStore.js
│       ├── utils/       modules.js, helplines.js, sectionPages.js,
│       │                validation.js, noteLabels.js
│       └── styles/      tokens.css (paleta + modos), base.css
├── backend/           API Express (Fase 4)
├── audit-engine/      Microservicio PHP 8 + MySQL (Fase 4)
├── .github/workflows/ CI (lint + build)
├── PRODUCT.md         Verdad de producto
└── DESIGN.md          Sistema visual
```

## Requisitos

- [Node.js LTS](https://nodejs.org/) 20.19+ (probado con 24.x) y npm
- [Git](https://git-scm.com/)
- Visual Studio Code (extensiones recomendadas en `.vscode/extensions.json`)
- XAMPP o Laragon (solo desde la Fase 4)

## Ejecutar en local (terminal de VS Code)

```bash
# 1. Instalar dependencias del frontend
cd frontend
npm install

# 2. (Opcional por ahora) variables de entorno
cp .env.example .env.local      # PowerShell: Copy-Item .env.example .env.local

# 3. Servidor de desarrollo → http://localhost:5173
npm run dev

# 4. Calidad
npm run lint
npm run build
npm run preview
```

Desde la raíz también funcionan `npm run dev`, `npm run build` y `npm run lint` (delegan en `frontend/`).

## XAMPP (PHP + MySQL, Fase 4)

Verificado en este equipo (22-nov-2026): XAMPP en `C:\xampp` con **PHP 8.2.12** (extensiones `PDO`, `pdo_mysql`, `mbstring`, `openssl`) y **MariaDB 10.4.32** (compatible con MySQL).

1. Abre el **XAMPP Control Panel** y pulsa *Start* en **Apache** y **MySQL**.
2. phpMyAdmin: <http://localhost/phpmyadmin>.
3. Comprobar PHP desde la raíz del monorepo: `npm run php:version`.
4. Servir el motor de auditoría (cuando exista código, Fase 4): `npm run audit:serve` → <http://localhost:8080>.

Opcional: para usar `php` directamente en la terminal, añade `C:\xampp\php` a la variable `Path` de tu usuario (Inicio → "Editar las variables de entorno de tu cuenta" → `Path` → Nuevo) y reinicia VS Code.

> Seguridad: XAMPP trae el usuario `root` **sin contraseña**. Sirve solo para desarrollo local. En la Fase 4 crearemos un usuario MySQL dedicado (`neuronote_app`) con permisos solo sobre su base de datos.

## Funciones disponibles (Fase 2)

| Función | Dónde probarla | Archivos |
|---|---|---|
| Modos Calma, Alto Contraste y Noche; tamaño de texto; tipografía (Atkinson, OpenDyslexic, sistema); movimiento | `/accesibilidad` | `pages/AccessibilityPage.jsx`, `providers/PreferencesProvider.jsx`, `styles/tokens.css` |
| Guardar preferencias solo con permiso ("Recordar en este dispositivo") | `/accesibilidad` | `services/preferencesStore.js`, script en `index.html` |
| Intro de marca (1.8 s, omitible, una vez por sesión, nunca con movimiento reducido) | Abrir el sitio en una pestaña nueva | `organisms/BrandIntro.jsx` |
| Modal SOS con `Alt + C` o el botón flotante | Cualquier página | `providers/SosProvider.jsx`, `organisms/CrisisDialog.jsx` |
| Notas sensoriales: formulario validado, historial, búsqueda, exportar y borrar | `/notas` | `pages/NotesPage.jsx`, `organisms/SensoryNoteForm.jsx`, `organisms/NotesHistory.jsx`, `utils/validation.js` |
| Estados de carga, error y vacío | Navegación entre páginas, historial vacío | `atoms/PageLoader.jsx`, `pages/RouteErrorPage.jsx`, `molecules/EmptyState.jsx` |

Las notas se guardan **solo en el navegador** hasta la Fase 4, cuando se sincronizarán con la API (con consentimiento).

## Integraciones externas (Fase 3)

Todas gratuitas. Verificadas el 22-nov-2026; ningún servicio garantiza disponibilidad ni es "gratis para siempre".

| Servicio | Uso en NEURONOTE | Clave | Notas | Archivo |
|---|---|---|---|---|
| [OpenStreetMap](https://www.openstreetmap.org/) + [Leaflet](https://leafletjs.com/) 1.9 | Mapa (`/mapa`, `/rutas`, `/oasis`, portada) | No | Atribución visible, sin descargas masivas, el mapa se carga solo al verse | `organisms/MapViewLeaflet.jsx` |
| [Nominatim](https://nominatim.openstreetmap.org/) (buscador oficial de OSM) | **Fuente principal** de parques, jardines, bibliotecas y museos reales como **oasis candidatos sin verificar**, y de cada ficha `/oasis/:id` | No | Política: máx. 1 petición/s (cola de 1.1 s), caché 6 h, sin autocompletado | `services/nominatim.js`, `services/havens.js` |
| [Overpass API](https://overpass-api.de/) (datos OSM) | **Respaldo** si Nominatim falla | No | Sus servidores públicos se saturan a menudo (406/502/504 el 23-nov-2026): 2 servidores, 12 s. Si todo falla, se usa la última respuesta guardada (≤ 7 días) | `services/overpass.js` |
| [OSRM de FOSSGIS](https://routing.openstreetmap.de/) | Rutas a pie con alternativas | No | Solo se calcula cuando la persona elige un destino (≤ 12 km) | `services/routing.js` |
| [Open-Meteo](https://open-meteo.com/) | Temperatura, presión, UV, humedad, viento (6 h atrás + 18 h) | No | Son **pronósticos** de modelo, se etiquetan así; coordenadas redondeadas a ~1 km | `services/openMeteo.js` |
| [REST Countries v5](https://restcountries.com/) | Lista de países y códigos telefónicos para WhatsApp; idiomas y moneda | **Sí, gratuita** | Plan Free: 1,000 consultas/mes. Sin clave, la app pide el código de país a mano | `services/restCountries.js` |
| WhatsApp `wa.me` | Mensaje preescrito a una persona de confianza | No | NEURONOTE no envía ni guarda la conversación | `utils/whatsapp.js`, `organisms/TrustedContact.jsx` |

### Configurar REST Countries (opcional, gratis)

1. Crea una cuenta en <https://restcountries.com/sign-up> (plan Free).
2. En **API Keys**, crea una clave y agrega `localhost` a los orígenes permitidos (y tu dominio cuando despliegues).
3. Copia `frontend/.env.example` como `frontend/.env.local` y pega la clave en `VITE_RESTCOUNTRIES_KEY=`.
4. Reinicia `npm run dev`. En la Fase 4 esta llamada pasará por el backend para que la clave no llegue al navegador.

### Nuevas páginas

| Ruta | Qué hace | Archivo |
|---|---|---|
| `/mapa` | Mapa con oasis candidatos y microclima de la zona | `pages/MapPage.jsx` |
| `/rutas` | Origen/destino en el mapa, rutas a pie comparadas por tiempo y cercanía a lugares tranquilos | `pages/RoutesPage.jsx` |
| `/oasis` | Lista filtrable (tipo, silla de ruedas) + mapa | `pages/HavensPage.jsx` |
| `/oasis/:id` | Ficha del lugar con datos de OSM, clima y "Planear ruta hasta aquí" | `pages/HavenDetailPage.jsx` |
| `/microclima` | Panel con gráficas por hora (teclado y tabla accesibles) | `pages/MicroclimatePage.jsx` |

## Datos y honestidad

Cada valor visible indica su procedencia: **Calculado** (p. ej. distancia de una ruta), **Pronóstico** (Open-Meteo), **Estimado**, **Reportado** (comunidad), **Sin verificar** (lugar real aún no evaluado) o **Demostración** (solo el mapa ilustrativo del inicio).

## Ayuda en crisis

Línea de la Vida (CONASAMA): **800 911 2000** — gratuita, 24 h. Emergencias: **911**.
NEURONOTE no sustituye atención médica, psicológica ni servicios de emergencia.

## Licencia

MIT — ver [LICENSE](LICENSE).
