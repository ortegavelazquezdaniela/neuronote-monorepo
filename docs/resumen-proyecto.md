# NEURONOTE · Resumen para explicar el proyecto

## En una frase

**NEURONOTE es una plataforma web gratuita que ayuda a personas neurodivergentes y con sensibilidad sensorial a moverse por la ciudad sin sobrecargarse.**

## En un minuto (para decirlo en voz alta)

> Para muchas personas autistas, con TDAH o con sensibilidad sensorial, salir a la calle significa enfrentarse a ruido, luz intensa y multitudes que pueden llevar a una crisis. NEURONOTE ayuda a anticiparlo y a manejarlo.
>
> Muestra **rutas a pie más tranquilas**, **lugares públicos para descansar** como parques, bibliotecas y museos, **el clima de la zona**, un **diario sensorial** para anotar cómo te sentiste en cada lugar y una **ayuda SOS** a un toque desde cualquier pantalla, con la Línea de la Vida, un mensaje listo para alguien de confianza y clínicas psicológicas cercanas.
>
> La interfaz se adapta a la persona: modo calma, alto contraste, modo noche, fuente para dislexia y texto más grande, y cumple casi por completo la norma de accesibilidad WCAG 2.2 AA.
>
> Además, un **motor de auditoría** calcula un índice de confort acústico y sensorial para certificar lugares con un sello verificable, y un **monitor de pulso experimental** sugiere una pausa cuando el pulso se mantiene alto.
>
> Todo se construyó y se publicó con **cero pesos de presupuesto**, usando solo herramientas gratuitas, y **sin inventar datos**: cada lugar y cada valor dice de dónde viene.

## Cómo está construido (para la parte técnica)

| Capa | Tecnología | Dónde vive (gratis) |
|---|---|---|
| Frontend | React 19 + Vite, Atomic Design, CSS Modules con tokens | Vercel |
| API | Node.js + Express 5, JWT, bcrypt, zod, helmet, rate limiting | Render |
| Cuentas y perfil | PostgreSQL con Row Level Security y Realtime | Supabase |
| Notas y telemetría anónima | MongoDB (Mongoose) | MongoDB Atlas |
| Auditorías y sellos | PHP 8 + MySQL (PDO, CSRF, HMAC) en Docker | Render + TiDB Cloud |
| Mapas y datos | Leaflet, OpenStreetMap, Nominatim, Overpass, OSRM, Open-Meteo, REST Countries | APIs abiertas |
| Calidad | Vitest, React Testing Library, MSW, Supertest, Storybook, GitHub Actions | GitHub |

## Números para recordar

- **9 fases** de desarrollo más extensiones, cada una con su pull request revisado.
- **140 pruebas automatizadas**: 94 de frontend (83 % de cobertura), 39 de backend (94 %) y 7 del índice ICAS.
- **Lighthouse:** Ayuda SOS con **100** en las cuatro categorías; accesibilidad en 100 en todas las páginas salvo el mapa (97).
- **WCAG 2.2 AA:** 45 de 47 criterios aplicables; las 2 brechas están documentadas con su plan.
- **20 endpoints** documentados con OpenAPI (Swagger) y una colección de Postman.
- **US$ 0 al mes** de operación. Si fuera un servicio comercial: unos **US$ 67–89 al mes** (`docs/arquitectura-cloud-costos.md`).

## Decisiones de las que puedes hablar

1. **Honestidad de los datos:** no hay lugares, certificaciones ni profesionales inventados. Cada valor lleva una etiqueta: *Pronóstico*, *Calculado*, *Sin verificar*, *Medido* o *Demostración*.
2. **Privacidad:** la ubicación solo se pide al pulsar un botón y no se guarda; al clima se envían coordenadas redondeadas a ~1 km; la telemetría del SOS es anónima; las lecturas del pulso no salen del dispositivo; no se guardan conversaciones.
3. **Diseño sensorial:** nada parpadea, no hay animaciones en bucle, se respeta el movimiento reducido y la ayuda SOS se abre al instante (Alt + C).
4. **Seguridad:** contraseñas con bcrypt, JWT, RLS en la base de datos, validación con zod, cabeceras de seguridad, límites de intentos y claves secretas solo en el servidor.
5. **Límites que reconoces:** las páginas con mapa tienen 79 en rendimiento por el peso de los mosaicos de OpenStreetMap; elegir un punto libre en el mapa todavía requiere clic; la sesión de 2 h vence sin aviso; OpenStreetMap tiene pocas clínicas registradas.

## Lo que NEURONOTE no es

NEURONOTE **no sustituye** la atención médica, psicológica ni los servicios de emergencia. El monitor de pulso **no es un dispositivo médico**. En una emergencia: **911**. Línea de la Vida: **800 911 2000** (gratuita, 24 horas).
