/**
 * Contenido de las páginas de sección que todavía no tienen funcionalidad.
 * Cada entrada declara la fase en que se implementa (sin simular datos).
 */
export const SECTION_PAGES = [
  {
    path: '/perfil',
    title: 'Perfil',
    intro: 'Tu cuenta, tus preferencias sensoriales y la gestión de tus datos personales.',
    points: ['Registro e inicio de sesión seguros.', 'Descarga y eliminación de tus datos.'],
    phase: 4,
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
