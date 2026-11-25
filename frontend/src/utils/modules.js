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
      'Compara caminos a pie por tiempo y cercanía a parques y bibliotecas, según lo que prefieras ese día.',
    detail:
      'Cada dato indica su origen (calculado o estimado). Ninguna ruta se presenta como libre de estímulos para todas las personas: tú eliges qué priorizar.',
    phase: 3,
  },
  {
    id: 'havens',
    name: 'Sensory Havens',
    label: 'Oasis sensoriales',
    path: '/oasis',
    tone: 'sage',
    summary:
      'Parques, jardines, bibliotecas y museos reales cerca de ti, con su accesibilidad y estado de verificación.',
    detail:
      'Los lugares vienen de OpenStreetMap y se muestran como candidatos sin verificar hasta que una auditoría documente su nivel de confort.',
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
      'Pronósticos de Open-Meteo. Es información ambiental, no un diagnóstico médico ni una predicción garantizada de migrañas.',
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
      'Tus notas son privadas: sin cuenta viven en tu navegador y con cuenta se guardan en tu perfil. Puedes editarlas, descargarlas en un archivo o borrarlas en cualquier momento.',
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
