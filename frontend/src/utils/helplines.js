/**
 * Líneas de ayuda oficiales en México.
 *
 * Verificación (22-nov-2026): el número vigente de la Línea de la Vida (CONASAMA,
 * Secretaría de Salud) es 800 911 2000 — gratuito, confidencial, 24 h, 365 días.
 * La propuesta original mencionaba 800 911 2004; ese número NO aparece en fuentes
 * oficiales, por lo que se usa 800 911 2000. Revisar periódicamente.
 */

export const HELPLINES = {
  lineaDeLaVida: {
    name: 'Línea de la Vida',
    display: '800 911 2000',
    tel: 'tel:+528009112000',
    description: 'Gratuita, confidencial y disponible las 24 horas, los 365 días del año.',
    verifiedOn: '2026-11-22',
  },
  emergencias: {
    name: 'Emergencias',
    display: '911',
    tel: 'tel:911',
    description: 'Si tu vida o la de alguien más está en riesgo inmediato.',
  },
};
