# NEURONOTE · Guion del video demostrativo (3 minutos)

> Entregable de la propuesta: *«Video demostrativo de 3 minutos navegando las rutas de calma y el auxilio por WhatsApp»*.
> Graba la pantalla con la app en producción (<https://neuronote-monorepo.vercel.app>) y tu voz. Herramientas gratuitas: **OBS Studio** o la **Barra de juego de Windows** (Win + Alt + R), y **Clipchamp** (incluido en Windows) para recortar.

## Preparación

- Despierta la API y el motor 10 minutos antes (ver `docs/guia-demostracion.md`).
- Navegador en **pantalla completa**, zoom al 110 %, sin otras pestañas ni notificaciones.
- Inicia sesión antes de grabar con una cuenta de prueba que tenga una nota guardada.
- Para el mensaje de WhatsApp usa **tu propio número** o el de alguien que haya aceptado; no muestres números ajenos.
- Habla despacio: unas 130 palabras por minuto. El texto de abajo está pensado para caber en 3 minutos.

## Guion

| Tiempo | Qué se ve | Qué dices |
|---|---|---|
| **0:00 – 0:15** | Página principal: la intro de marca y el eslogan *Find your calm. Find your way.* | «Para muchas personas neurodivergentes, salir a la calle significa ruido, luz intensa y multitudes. NEURONOTE ayuda a moverse por la ciudad sin sobrecargarse.» |
| **0:15 – 0:35** | Bajas por los cinco módulos y la vista previa del mapa. Abres **Accesibilidad** y cambias a **Modo Calma**. | «Tiene rutas a pie más tranquilas, lugares para descansar, el clima de la zona, un diario sensorial y ayuda en crisis. Y la interfaz se adapta: modo calma, alto contraste, modo noche y fuente para dislexia.» |
| **0:35 – 0:55** | **Explorar mapa** → **Usar mi ubicación** → aparecen parques y bibliotecas con la etiqueta *Sin verificar*. | «Los lugares son reales, de OpenStreetMap. NEURONOTE no inventa datos: cada lugar y cada valor dice de dónde viene.» |
| **0:55 – 1:30** | Abres un lugar → **Planear ruta hasta aquí** → aparecen las rutas. Cambias entre **Más tranquila** y **Más rápida** y se ve la diferencia en el mapa. | «Las rutas de calma comparan caminos a pie. La más tranquila pasa cerca de parques y bibliotecas, aunque tarde un poco más. Ninguna ruta es tranquila para todas las personas: cada quien decide qué priorizar ese día.» |
| **1:30 – 1:45** | **Microclima**: las tres gráficas con la etiqueta *Pronóstico*. | «También muestra la temperatura, el índice UV y la presión atmosférica, porque el calor y los cambios de clima también influyen en cómo nos sentimos.» |
| **1:45 – 2:35** | Pulsas **Alt + C**: se abre la ayuda SOS sin animaciones. Vas a **Ayuda SOS** → **Escribir a alguien de confianza** → eliges **México** → escribes tu número → **Abrir WhatsApp** → se abre WhatsApp con el mensaje listo. | «Si la sobrecarga llega, la ayuda está a un toque desde cualquier pantalla, o con Alt más C. Aquí están la Línea de la Vida y el 911. Con un solo botón se arma un mensaje de WhatsApp para alguien de confianza. NEURONOTE no lo envía ni guarda la conversación: tú decides.» |
| **2:35 – 2:50** | Bajas a **Clínicas psicológicas cerca de ti** → aparecen las clínicas con **Llamar** y **Cómo llegar**. Luego **Respirar a tu ritmo**. | «También muestra clínicas de salud mental cercanas y pasos para regularte, sin animaciones que distraigan.» |
| **2:50 – 3:00** | Regresas a la página principal y se ve el pie con el aviso. | «NEURONOTE no sustituye la atención médica ni los servicios de emergencia. Es una herramienta honesta, accesible y gratuita, para encontrar tu calma y tu camino.» |

## Tomas de respaldo (si te sobra tiempo o para otra versión)

- **Monitor de pulso:** umbral 100, 30 segundos, **Probar con datos de demostración** → aparece el aviso a los ~12 segundos reales.
- **Panel pericial:** el formulario del acta y la explicación del ICAS (sin registrar mediciones inventadas).
- **Swagger** (`/api/docs`) y la **CI en verde** en GitHub.

## Revisión antes de entregar

- [ ] Dura entre 2:50 y 3:10.
- [ ] No aparecen contraseñas, claves ni números de teléfono ajenos.
- [ ] Se escucha bien (sin música encima de la voz).
- [ ] Se ve el texto en pantalla (zoom suficiente).
- [ ] Termina con el aviso de que NEURONOTE no sustituye la atención médica.
