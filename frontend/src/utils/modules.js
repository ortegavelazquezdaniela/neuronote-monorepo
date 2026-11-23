/**
 * Catálogo único de módulos de NEURONOTE.
 * Navbar, página principal, footer y router leen de aquí para mantener
 * nombres, rutas y descripciones consistentes en toda la plataforma.
 */

export const MODULES = [
  {
    id: 'routes',
    name: 'Sensory Routes',
    label: 'Rutas de calma',
    path: '/rutas',
    tone: 'aqua',
    summary:
      'Compara rutas peatonales según ruido reportado, temperatura, exposición al sol y tus propias preferencias sensoriales.',
    detail:
      'Cada dato indica su origen: medido (Open-Meteo), estimado o reportado por la comunidad. Ninguna ruta se presenta como libre de estímulos para todas las personas.',
    phase: 3,
  },
  {
    id: 'havens',
    name: 'Sensory Havens',
    label: 'Oasis sensoriales',
    path: '/oasis',
    tone: 'sage',
    summary:
      'Directorio de espacios de descanso con accesibilidad, características ambientales y estado de verificación.',
    detail:
      'Solo se publican lugares reales con su nivel de confort documentado. Si un oasis no está verificado, se indica con claridad.',
    phase: 3,
  },
  {
    id: 'microclimate',
    name: 'Microclimate',
    label: 'Microclima',
    path: '/microclima',
    tone: 'sun',
    summary:
      'Temperatura, presión barométrica, radiación UV y variaciones del día en gráficos sencillos.',
    detail:
      'Datos de Open-Meteo. Es información ambiental, no un diagnóstico médico ni una predicción garantizada de migrañas.',
    phase: 3,
  },
  {
    id: 'notes',
    name: 'Sensory Notes',
    label: 'Notas sensoriales',
    path: '/notas',
    tone: 'rose',
    summary:
      'Registra cómo se sintió un lugar o un trayecto y consulta tu historial cuando lo necesites.',
    detail:
      'Tus notas son privadas por defecto. Puedes exportarlas o borrarlas en cualquier momento.',
    phase: 2,
  },
  {
    id: 'sos',
    name: 'SOS Support',
    label: 'Ayuda SOS',
    path: '/auxilio-inmediato',
    tone: 'petrol',
    summary:
      'Recursos de regulación, Línea de la Vida y contacto directo por WhatsApp, a un toque desde cualquier pantalla.',
    detail:
      'NEURONOTE no sustituye atención médica, psicológica ni servicios de emergencia. No guardamos conversaciones.',
    phase: 2,
  },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]));

/** Enlaces de la barra de navegación principal (orden de la propuesta). */
export const NAV_LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Explorar mapa', path: '/mapa' },
  { label: 'Rutas de calma', path: '/rutas' },
  { label: 'Oasis sensoriales', path: '/oasis' },
  { label: 'Microclima', path: '/microclima' },
];
