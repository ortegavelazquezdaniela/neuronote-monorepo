# NEURONOTE (NEUROROUTE)

> *Find your calm. Find your way.*
> Un espacio donde moverte por el mundo no tenga que significar sobrecargarte.

Plataforma web de descompresión sensorial e inteligencia geoespacial para personas neurodivergentes y con diferentes necesidades de procesamiento sensorial: rutas peatonales más tranquilas, oasis sensoriales, microclima y apoyo en crisis.

**Presupuesto: $0.00 MXN** — solo herramientas gratuitas y open source.

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Entorno, design system, página principal responsive | ✅ Completada |
| 2 | Interactividad: modos de accesibilidad, intro animada, modal SOS (Alt + C), formularios | Pendiente |
| 3 | Leaflet + OpenStreetMap, Open-Meteo, REST Countries, WhatsApp deep-link | Pendiente |
| 4 | Express + JWT, Supabase (RLS), MongoDB Atlas, PHP + MySQL | Pendiente |
| 5 | Vitest, RTL, MSW, Supertest, Storybook, CI/CD y despliegue | Pendiente |

## Estructura

```
neuronote-monorepo/
├── frontend/          React 19 + Vite (Atomic Design)
│   └── src/
│       ├── atoms/       Button, Logo, DataBadge, SkipLink
│       ├── molecules/   RouteCompare, LayerToggle
│       ├── organisms/   SiteHeader, Hero, CityMap, ModulesSection, MapPreview,
│       │                PurposeSection, SiteFooter, SosFab
│       ├── templates/   MainLayout
│       ├── pages/       HomePage, CrisisHelpPage, SectionPage, NotFoundPage
│       ├── hooks/       useDocumentTitle
│       ├── utils/       modules.js, helplines.js, sectionPages.js
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

## Datos y honestidad

Cada valor visible indica su procedencia: **Medido** (Open-Meteo), **Estimado**, **Reportado** (comunidad) o **Demostración**. En la Fase 1 todos los valores de rutas y mapa son de demostración y así se etiquetan.

## Ayuda en crisis

Línea de la Vida (CONASAMA): **800 911 2000** — gratuita, 24 h. Emergencias: **911**.
NEURONOTE no sustituye atención médica, psicológica ni servicios de emergencia.

## Licencia

MIT — ver [LICENSE](LICENSE).
