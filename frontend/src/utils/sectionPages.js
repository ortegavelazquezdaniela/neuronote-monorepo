import { MODULE_BY_ID } from './modules';

/**
 * Contenido de las páginas de sección que todavía no tienen funcionalidad.
 * Cada entrada declara la fase en que se implementa (sin simular datos).
 */
const fromModule = (id, points) => {
  const m = MODULE_BY_ID[id];
  return { path: m.path, title: m.label, englishName: m.name, intro: m.summary, points, phase: m.phase };
};

export const SECTION_PAGES = [
  {
    path: '/mapa',
    title: 'Explorar mapa',
    intro:
      'El mapa interactivo reunirá rutas, oasis sensoriales e información ambiental sobre OpenStreetMap.',
    points: [
      'Mapa Leaflet con teselas de OpenStreetMap, respetando su política de uso.',
      'Tu ubicación solo con autorización explícita.',
      'Capas que puedes activar y desactivar para reducir la carga visual.',
    ],
    phase: 3,
  },
  fromModule('routes', [
    'Comparación de rutas por ruido reportado, temperatura y exposición al sol.',
    'Preferencias sensoriales personales que cambian la prioridad de cada factor.',
    'Etiqueta de procedencia en cada dato: medido, estimado o reportado.',
  ]),
  fromModule('havens', [
    'Ficha con ubicación, fotografías, accesibilidad y características ambientales.',
    'Estado de verificación visible. No se publican establecimientos inventados.',
  ]),
  fromModule('microclimate', [
    'Temperatura, presión barométrica y radiación UV de Open-Meteo.',
    'Gráficos simples de variación durante el día.',
    'Lenguaje informativo: no es diagnóstico médico.',
  ]),
  fromModule('notes', [
    'Formulario sencillo para registrar cómo se sintió un lugar.',
    'Historial privado con búsqueda, exportación y borrado.',
  ]),
  {
    path: '/perfil',
    title: 'Perfil',
    intro: 'Tu cuenta, tus preferencias sensoriales y la gestión de tus datos personales.',
    points: ['Registro e inicio de sesión seguros.', 'Descarga y eliminación de tus datos.'],
    phase: 4,
  },
  {
    path: '/accesibilidad',
    title: 'Preferencias de accesibilidad',
    intro: 'Ajusta la interfaz a tu forma de percibir: colores, tamaño del texto, tipografía y movimiento.',
    points: [
      'Modo Calma, Modo Alto Contraste y Modo Noche.',
      'Tamaño de texto y tipografías alternativas (Atkinson Hyperlegible, OpenDyslexic).',
      'Reducir movimiento y guardar tus preferencias solo si lo autorizas.',
    ],
    phase: 2,
  },
  {
    path: '/acerca',
    title: 'Acerca de NEURONOTE',
    intro:
      'NEURONOTE es una plataforma de descompresión sensorial e inteligencia geoespacial para personas neurodivergentes y con diferentes necesidades de procesamiento sensorial.',
  },
  {
    path: '/privacidad',
    title: 'Privacidad',
    intro:
      'Pedimos tu consentimiento antes de usar tu ubicación, no guardamos conversaciones y la telemetría es anónima. El aviso de privacidad completo se publicará junto con las cuentas de usuario.',
    phase: 4,
  },
  {
    path: '/declaracion-accesibilidad',
    title: 'Declaración de accesibilidad',
    intro:
      'NEURONOTE se diseña con el objetivo de cumplir WCAG 2.2 nivel AA: navegación completa por teclado, foco visible, contraste suficiente y compatibilidad con lectores de pantalla.',
    points: ['El reporte de auditoría (Lighthouse y axe) se publicará en la Fase 5.'],
  },
  {
    path: '/contacto',
    title: 'Contacto',
    intro: 'El canal de contacto del proyecto se habilitará con el backend.',
    phase: 4,
  },
];
