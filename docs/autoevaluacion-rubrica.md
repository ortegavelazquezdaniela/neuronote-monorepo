# NEURONOTE · Autoevaluación con la rúbrica del Proyecto Web FullStack

> Rúbrica: *Manual FullStack Junior (ciberecus.mx)*, escala de 0 a 100. Revisión hecha el 24 de noviembre de 2026 sobre la versión publicada (<https://neuronote-monorepo.vercel.app>) y el código de `main`.
> La calificación la decide quien evalúa: este documento reúne la **evidencia** de cada criterio para que puedas mostrarla.

## A. Rúbrica analítica

| Criterio | Máx. | Nivel que respalda la evidencia | Evidencia principal |
|---|---|---|---|
| 1. Funcionalidad del producto | 24 | Excelente | Navegación SPA, formularios con validación, CRUD de notas, favoritos, perfil y cuenta, 7 APIs externas y casos límite cubiertos por 136 pruebas (sección D). **0 errores en consola** en las páginas públicas en producción (revisado hoy). |
| 2. Integración de los temas del curso | 24 | Excelente | Hoja de cotejo (sección B): todos los temas en **SÍ**. |
| 3. Aportaciones ingeniosas / valor agregado | 20 | Excelente | Sección C: motor ICAS con sellos firmados, accesibilidad sensorial, clínicas cercanas, monitor de pulso por Bluetooth, datos etiquetados por origen, OpenAPI, Storybook publicado. |
| 4. Diseño, UI/UX y responsividad | 12 | Excelente | Design system con tokens y 4 temas; Lighthouse de accesibilidad en 100 (97 en el mapa); sin scroll horizontal a 320 px, tablet (768 px) ni escritorio. |
| 5. Calidad del código y buenas prácticas | 12 | Excelente | Lint sin errores, Atomic Design, comentarios en español, 10 pull requests revisados, CI en verde, validación con zod en servidor y cliente, JWT, bcrypt, RLS, CSRF, sin claves en el navegador. |
| 6. Presentación y defensa oral | 8 | Depende de ti | Materiales listos: presentación de 13 diapositivas con notas, `docs/guia-demostracion.md`, `docs/resumen-proyecto.md`, `docs/guion-video.md`. |

## B. Hoja de cotejo: temas del curso aplicados

| Tema | Estado | Dónde se ve |
|---|---|---|
| **Frontend y fundamentos (Cap. 1)** | | |
| HTML5 semántico | **SÍ** | `header`, `nav`, `main`, `section` (20 archivos), `article` (notas), `footer`, `dialog` (SOS), `figure` (gráficas), `form`/`fieldset`/`legend`. `templates/MainLayout.jsx`, `organisms/NotesHistory.jsx`. |
| Accesibilidad básica | **SÍ** | `alt`, `aria-*`, contraste medido en 4 temas, teclado completo, enlace para saltar al contenido. Ficha completa: `docs/accesibilidad-wcag-2.2.md`. |
| CSS3 + Flexbox / Grid | **SÍ** | CSS Modules con Grid y Flexbox en todas las plantillas (`templates/SensoryDashboardLayout.module.css`, `pages/NotesPage.module.css`). |
| Diseño responsive | **SÍ** | Mobile-first: 19 `@media (min-width)` frente a 6 `max-width`; probado a 320, 375, 412, 768 px y escritorio. |
| JavaScript ES6+ | **SÍ** | `const`/`let`, funciones flecha, plantillas de texto, desestructuración, módulos ES, `async/await`, `?.` y `??`. |
| DOM y eventos | **SÍ** | Atajo **Alt + C** con `addEventListener('keydown')` (`providers/SosProvider.jsx`), `IntersectionObserver` (carga diferida del mapa), descarga de notas con `Blob` y `createElement('a')`, foco gestionado al cambiar de página. |
| Async, Promises y Fetch | **SÍ** | `services/http.js`: `fetch` con tiempo límite (`AbortController`), reintentos, caché y errores legibles; `Promise.all` en el backend. |
| **Frontend moderno (Cap. 3)** | | |
| React: componentes y props | **SÍ** | React 19 con Atomic Design: `atoms/`, `molecules/`, `organisms/`, `templates/`, `pages/`. |
| Hooks | **SÍ** | `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useId`, `useEffectEvent`, y propios: `useAuth`, `useGeolocation`, `usePageMeta`, `useHeartRateMonitor`, `useSensoryRoute`, `useDebounce`. |
| React Router | **SÍ** | `src/routes.jsx`: 18 rutas (incluida la 404), ruta dinámica `/oasis/:id`, ruta protegida `/perfil` (`RequireAuth`) y carga diferida de páginas. |
| Estilos en React / design system | **SÍ** | Tokens en `styles/tokens.css` (paleta, tipografía, espacios, 4 temas) y Storybook publicado: <https://ortegavelazquezdaniela.github.io/neuronote-monorepo/>. |
| Consumo de APIs externas | **SÍ** | Leaflet + OpenStreetMap (mapas), Nominatim y Overpass (lugares), OSRM (rutas), Open-Meteo (clima), REST Countries (países), WhatsApp (enlaces), Supabase Realtime y Web Bluetooth. |
| SEO básico y metadatos | **SÍ** | Título y descripción por página, `canonical`, Open Graph con imagen, JSON-LD, `sitemap.xml` y `robots.txt` (`hooks/usePageMeta.js`). |
| **Backend (Cap. 2)** | | |
| PHP básico o Node.js / Express | **SÍ (ambos)** | API en Node.js + Express 5 (`backend/`) y motor de auditoría en PHP 8 (`audit-engine/`). |
| Formularios y métodos GET / POST | **SÍ** | PHP con `$_POST`, CSRF y validación (`audit-engine/src/submit_audit.php`); `GET` en `verify.php`; la API usa GET, POST, PUT y DELETE. |
| Base de datos | **SÍ** | PostgreSQL (Supabase, con RLS), MongoDB (Atlas) y MySQL (TiDB Cloud, compatible). |
| CRUD completo | **SÍ** | **Notas**: crear, leer, **editar** y borrar (en el navegador o en la cuenta). **Perfil**: leer y actualizar. **Favoritos**: crear, leer y borrar. **Cuenta**: crear, leer y borrar. **Panel PHP**: CRUD de actas y profesionales. |
| API REST y autenticación (JWT) | **SÍ** | 21 endpoints REST con JWT Bearer y roles; documentados en <https://neuronote-api-pnnf.onrender.com/api/docs>. |
| Deploy / hosting | **SÍ** | Vercel (frontend), Render (API y motor PHP en Docker), GitHub Pages (Storybook). |
| **Buenas prácticas transversales** | | |
| Git / GitHub | **SÍ** | Repositorio público, una rama y un pull request por fase (10 PR). |
| Testing automatizado (Jest / RTL) | **SÍ** | Vitest (compatible con la API de Jest) + React Testing Library + MSW; Supertest en el backend. 96 pruebas de frontend, 40 de backend y 7 del ICAS. |
| CI/CD (GitHub Actions) | **SÍ** | `.github/workflows/ci.yml` (lint, pruebas, cobertura, build, Docker del motor PHP) y `storybook.yml` (publicación). |
| Seguridad básica | **SÍ** | Validación con zod en servidor y cliente, limpieza de texto, `helmet`, CORS con lista blanca, límite de intentos, bcrypt, JWT, RLS, sentencias preparadas (PDO) y CSRF. |

## C. Aportaciones propias (criterio 3)

1. **Índice de Confort Acústico y Sensorial (ICAS)** con sellos firmados con HMAC: si alguien altera el acta en la base, la verificación lo detecta.
2. **Accesibilidad sensorial**: modo Calma, Alto contraste y Noche, fuente para dislexia y sin parpadeos; autoevaluación WCAG 2.2 AA con 0 infracciones de axe en 64 combinaciones.
3. **Honestidad de los datos**: cada valor dice si es *Pronóstico*, *Calculado*, *Sin verificar*, *Medido* o *Demostración*.
4. **Ayuda SOS a un toque** (Alt + C), con WhatsApp de confianza y clínicas cercanas reales.
5. **Monitor de pulso** experimental por Web Bluetooth, con modo demostración.
6. **Documentación profesional**: OpenAPI/Swagger, colección de Postman, Storybook publicado y documento de arquitectura y costos.
7. **Resiliencia**: si un servicio público de mapas falla, se usa otro servidor o la última respuesta guardada.

## D. Pruebas de funcionalidad (criterio 1)

- **136 pruebas automatizadas** de app (96 frontend + 40 backend) más 7 del ICAS. Cubren:
  - formularios con errores;
  - fechas futuras;
  - notas de otra persona;
  - sesión vencida;
  - APIs caídas o sin datos;
  - Bluetooth no disponible.
- **Consola del navegador en producción:** 0 errores en inicio, mapa, rutas, oasis, ficha de oasis, microclima, notas, Ayuda SOS, monitor de pulso, iniciar sesión y 404.
- **Navegadores probados:** Chrome y Edge (motor Chromium), en escritorio y en emulación de móvil y tablet.

## E. Qué podría costar puntos y cómo evitarlo

| Riesgo | Criterio | Qué hacer |
|---|---|---|
| Render dormido: la primera carga de la API tarda hasta 1 min | 1, 6 | Abrir `/api/health` y el motor 10 minutos antes (guía de demostración). |
| Supabase pausado tras una semana sin uso | 1 | Reanudarlo en su panel antes de presentar. |
| Solo se probó en navegadores Chromium | 1 | Abrir la app una vez en **Firefox** y, si puedes, en **Safari** (iPhone) antes de la defensa. El monitor de pulso no funciona en iPhone, y la página lo explica. |
| Dos brechas de accesibilidad documentadas | 4 | Explicarlas como límites conocidos con su plan (diapositiva «Límites»). |
| Preguntas sobre el código | 6 | Repasar `docs/resumen-proyecto.md` («Decisiones de las que puedes hablar») y abrir un componente, un endpoint y una prueba para explicarlos en vivo. |
