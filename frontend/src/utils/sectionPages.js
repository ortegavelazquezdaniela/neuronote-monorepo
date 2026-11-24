/**
 * Páginas informativas (texto). Sin datos simulados.
 */
export const SECTION_PAGES = [
  {
    path: '/acerca',
    title: 'Acerca de NEURONOTE',
    intro:
      'NEURONOTE es una plataforma de descompresión sensorial e inteligencia geoespacial para personas neurodivergentes y con diferentes necesidades de procesamiento sensorial. Es un proyecto académico de código abierto, construido solo con herramientas gratuitas.',
    points: [
      'Mapas y lugares: OpenStreetMap (Leaflet, Nominatim, Overpass) y rutas a pie con OSRM.',
      'Clima: pronósticos de Open-Meteo.',
      'Cuentas y perfiles: PostgreSQL en Supabase. Notas y telemetría anónima: MongoDB Atlas.',
      'Auditorías y sellos: motor PHP + MySQL con el Índice de Confort Acústico y Sensorial (ICAS).',
    ],
  },
  {
    path: '/privacidad',
    title: 'Privacidad',
    intro: 'Usamos el mínimo de datos necesario y nunca los vendemos ni los compartimos con anunciantes.',
    points: [
      'Sin cuenta: tus preferencias, notas y contacto de confianza se guardan solo en tu navegador, y únicamente si lo autorizas.',
      'Con cuenta: guardamos tu correo, un nombre o apodo, tu contraseña cifrada con bcrypt, tu perfil sensorial, tus favoritos y tus notas. Puedes borrarlo todo desde tu perfil.',
      'Ubicación: solo cuando pulsas «Usar mi ubicación»; no se guarda. Al clima se envían coordenadas redondeadas (≈ 1 km).',
      'SOS: no guardamos conversaciones. Registramos de forma anónima la hora y el día en que se abrió la ayuda (sin cuenta, ubicación ni texto); no se registra si tu navegador pide «No rastrear».',
      'Servicios externos: OpenStreetMap, Open-Meteo y FOSSGIS reciben las consultas del mapa como cualquier visita a sus servidores.',
    ],
  },
  {
    path: '/declaracion-accesibilidad',
    title: 'Declaración de accesibilidad',
    intro:
      'NEURONOTE cumple parcialmente WCAG 2.2 nivel AA (autoevaluación del 23 de noviembre de 2026): 45 de los 47 criterios aplicables se cumplen en los cuatro temas (Predeterminado, Calma, Alto contraste y Noche).',
    points: [
      'Ayuda SOS cumple todos los criterios aplicables, con un contraste mínimo de 5.5:1 en todos los temas.',
      'Pendiente: elegir un punto libre del mapa (origen o destino de una ruta) requiere un clic. Con teclado puedes usar tu ubicación o cualquier oasis de la lista («Planear ruta hasta aquí»).',
      'Pendiente: la sesión con cuenta caduca a las 2 horas sin aviso previo. Las notas sin cuenta no tienen límite de tiempo.',
      'Cómo se evaluó: axe-core en 16 páginas y 4 temas, Lighthouse, medición de contraste, reflow a 320 px y espaciado de texto. Falta probar con lectores de pantalla y con personas usuarias.',
      'La ficha completa está en el repositorio: docs/accesibilidad-wcag-2.2.md.',
    ],
  },
  {
    path: '/contacto',
    title: 'Contacto',
    intro:
      'Para reportar un problema, un dato incorrecto o una barrera de accesibilidad, abre un reporte en el repositorio público del proyecto: github.com/ortegavelazquezdaniela/neuronote-monorepo/issues',
  },
];
