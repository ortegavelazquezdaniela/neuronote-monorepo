# NEURONOTE · Ficha técnica de accesibilidad (WCAG 2.2 nivel AA)

> **Tipo de evaluación:** autoevaluación del equipo de desarrollo, no una auditoría certificada.
> **Fecha:** 23 de noviembre de 2026 · **Versión evaluada:** rama `feature/fase-8-documentacion` (compilación de producción).
> **Norma:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — los 55 criterios de nivel A y AA (4.1.1 ya no existe en 2.2).

## 1. Resultado

| | Criterios |
|---|---|
| ✅ Cumple | 45 |
| ⚠️ Cumple parcialmente | 2 (2.1.1 Teclado, 2.2.1 Tiempo ajustable) |
| ➖ No aplica | 8 (sin audio, video ni datos legales o financieros) |
| ❌ No cumple | 0 |

**Conclusión:** NEURONOTE cumple *parcialmente* WCAG 2.2 AA. Las dos brechas están descritas en la sección 5 con su plan de corrección. Ninguna afecta a **Ayuda SOS**, que cumple todos los criterios aplicables en los cuatro temas.

## 2. Alcance

- **Páginas:** inicio, mapa, rutas, oasis (lista y ficha), microclima, notas, Ayuda SOS (página, modal y clínicas cercanas), monitor de pulso (con el aviso activo), preferencias de accesibilidad, iniciar sesión, crear cuenta, perfil, acerca, privacidad, declaración de accesibilidad, contacto y 404.
- **Temas:** Predeterminado, Calma, Alto contraste y Noche.
- **Tamaños:** 320 px, 375 px, 412 px (móvil), 640 px con texto al 150 % y escritorio.
- **Fuera del alcance:** el panel pericial PHP (uso interno de auditores) y los mosaicos del mapa, que son imágenes de OpenStreetMap.

## 3. Cómo se verificó

| Método | Herramienta | Resultado |
|---|---|---|
| Revisión automática | **axe-core 4.11** con todas las reglas `wcag2a/aa`, `wcag21a/aa` y `wcag22aa`: 16 páginas × 4 temas (64 combinaciones) | 0 infracciones tras las correcciones de esta fase (sección 6) |
| Auditoría de Lighthouse 13.6 | Categoría *Accessibility*, móvil | 100 en todas las páginas, salvo `/mapa` (97, ver 2.5.8) |
| Contraste medido | Colores calculados en el navegador en los 4 temas, fórmula de luminancia de WCAG | Texto ≥ 4.5:1; bloques de ayuda SOS ≥ 5.5:1; bordes de controles ≥ 3:1 |
| Reflow y espaciado | Scripts en el navegador: ancho de documento a 320 px, con el espaciado de 1.4.12 y con texto al 150 % | Sin scroll horizontal en las 15 páginas |
| Foco | Recorrido de todos los controles a 375 px comprobando si el encabezado fijo o el botón SOS los tapan | Ninguno queda totalmente oculto |
| Pruebas automatizadas | Vitest + React Testing Library: los elementos se buscan por **rol y nombre accesible** | 73 pruebas de frontend |
| Revisión de código | Etiquetas, `autocomplete`, idioma, manejo de foco, atajos | Detallado en la tabla |

**Pendiente:** pruebas con lectores de pantalla reales (NVDA, VoiceOver, TalkBack) y con **personas neurodivergentes**. Las herramientas automáticas detectan alrededor de un tercio de los problemas posibles; no sustituyen las pruebas con personas usuarias.

## 4. Criterios

### Principio 1 · Perceptible

| Criterio | Nivel | Estado | Evidencia |
|---|---|---|---|
| 1.1.1 Contenido no textual | A | ✅ | Los iconos decorativos llevan `aria-hidden`. El mapa tiene etiqueta (`label`) y los marcadores su nombre (`alt`, `title`). Las gráficas tienen título y valores accesibles con el teclado. |
| 1.2.1 Solo audio y solo video | A | ➖ | No hay audio ni video. |
| 1.2.2 Subtítulos (grabados) | A | ➖ | No hay video. |
| 1.2.3 Audiodescripción o alternativa | A | ➖ | No hay video. |
| 1.2.4 Subtítulos (en directo) | AA | ➖ | No hay transmisiones. |
| 1.2.5 Audiodescripción (grabada) | AA | ➖ | No hay video. |
| 1.3.1 Información y relaciones | A | ✅ | HTML semántico (`header`, `nav`, `main`, `footer`, `dialog`), jerarquía de encabezados, `fieldset`/`legend` en los grupos de opciones y `<label>` en cada campo. axe sin infracciones. |
| 1.3.2 Secuencia significativa | A | ✅ | El orden del DOM es el orden de lectura. En escritorio el mapa se reordena solo visualmente; el panel de texto va primero. |
| 1.3.3 Características sensoriales | A | ✅ | Las instrucciones no dependen de forma, color ni posición («Haz clic en el mapa» se acompaña de botones con texto). |
| 1.3.4 Orientación | AA | ✅ | No se bloquea la orientación. |
| 1.3.5 Identificar el propósito de la entrada | AA | ✅ | `autocomplete="email"`, `current-password`/`new-password`, `nickname` y `tel-national`. |
| 1.4.1 Uso del color | A | ✅ | Las etiquetas de datos (*Pronóstico*, *Sin verificar*…) llevan texto. En el mapa, la ruta elegida es continua y las alternativas punteadas, y la comparación de rutas también aparece en texto. |
| 1.4.2 Control del audio | A | ➖ | No hay sonido. |
| 1.4.3 Contraste (mínimo) | AA | ✅ | Medido en los 4 temas. Se corrigió el bloque de emergencias del tema Noche (2.9:1 → 5.5:1). |
| 1.4.4 Cambio de tamaño del texto | AA | ✅ | Control propio de tamaño (100–150 %) y zoom del navegador sin pérdida de contenido. |
| 1.4.5 Imágenes de texto | AA | ✅ | Todo el texto es texto real; el logo usa texto HTML. |
| 1.4.10 Reflow | AA | ✅ | Sin scroll horizontal a 320 px en las 15 páginas. Se corrigió la URL larga de `/contacto`. |
| 1.4.11 Contraste no textual | AA | ✅ | Bordes de campos, interruptores y opciones ≥ 3.3:1 (antes 1.5–2.0:1, corregido en esta fase); anillo de foco ≥ 9:1. |
| 1.4.12 Espaciado del texto | AA | ✅ | Con interlineado 1.5, letras 0.12 em, palabras 0.16 em y párrafos 2 em no se pierde contenido ni aparece scroll horizontal (corregido en esta fase). |
| 1.4.13 Contenido con *hover* o foco | AA | ✅ | El valor de las gráficas sigue visible mientras el puntero está encima y se cierra con Escape. Los títulos de los marcadores son nativos del navegador. |

### Principio 2 · Operable

| Criterio | Nivel | Estado | Evidencia |
|---|---|---|---|
| 2.1.1 Teclado | A | ⚠️ | Todo es operable con teclado **salvo elegir un punto libre en el mapa** (origen o destino en `/rutas`, punto en `/mapa`). Alternativas actuales: «Usar mi ubicación» y «Planear ruta hasta aquí» desde cualquier oasis de la lista. Ver la sección 5. |
| 2.1.2 Sin trampas para el teclado | A | ✅ | El modal SOS es un `<dialog>` nativo: se cierra con Escape y devuelve el foco. El mapa no atrapa el teclado. |
| 2.1.4 Atajos de teclado de un carácter | A | ✅ | El único atajo es **Alt + C** (abre el SOS); usa modificador. |
| 2.2.1 Tiempo ajustable | A | ⚠️ | La sesión con cuenta caduca a las 2 horas **sin aviso previo**. Las notas sin cuenta no tienen límite de tiempo. Ver la sección 5. |
| 2.2.2 Poner en pausa, detener, ocultar | A | ✅ | Sin animaciones en bucle ni carruseles. La intro de marca dura 1.8 s, se muestra una vez por sesión y se omite con movimiento reducido. |
| 2.3.1 Umbral de tres destellos o menos | A | ✅ | Requisito de diseño: nada parpadea (`accessibilityHazard: noFlashingHazard`). |
| 2.4.1 Evitar bloques | A | ✅ | Enlace «Saltar al contenido principal» como primer elemento enfocable. |
| 2.4.2 Titulado de páginas | A | ✅ | Título único por página (`usePageMeta`), anunciado al navegar. |
| 2.4.3 Orden del foco | A | ✅ | Sigue el orden visual; al cambiar de página el foco pasa a `<main>`. |
| 2.4.4 Propósito de los enlaces | A | ✅ | Textos descriptivos («Abrir Microclima», «Planear ruta hasta aquí»). |
| 2.4.5 Múltiples vías | AA | ✅ | Menú principal, módulos en el inicio, pie de página con todas las secciones y sitemap. |
| 2.4.6 Encabezados y etiquetas | AA | ✅ | Encabezados que describen cada sección; etiquetas visibles con «(obligatorio)». |
| 2.4.7 Foco visible | AA | ✅ | Contorno de 3 px con separación de 3 px en todos los temas; en Alto contraste, negro con halo amarillo. |
| 2.4.11 Foco no oculto (mínimo) | AA | ✅ | Ningún control queda totalmente tapado por el encabezado fijo ni por el botón SOS (`scroll-padding` arriba y abajo). |
| 2.5.1 Gestos del puntero | A | ✅ | El zoom del mapa también tiene botones +/−; nada requiere gestos con varios dedos. |
| 2.5.2 Cancelación del puntero | A | ✅ | Las acciones se ejecutan al soltar (`click` nativo). |
| 2.5.3 Etiqueta en el nombre | A | ✅ | El nombre accesible empieza con el texto visible (verificado por axe). |
| 2.5.4 Activación por movimiento | A | ✅ | Nada se activa agitando o inclinando el dispositivo. |
| 2.5.7 Movimientos de arrastre | AA | ✅ | Además de arrastrar el mapa: botones de zoom, flechas del teclado y, en `/mapa`, un clic recentra el mapa en ese punto. |
| 2.5.8 Tamaño del objetivo (mínimo) | AA | ✅ | Controles ≥ 44 px de alto. En `/mapa`, Lighthouse marca marcadores juntos: lo permite la excepción de **control equivalente**, porque cada lugar tiene un botón de tamaño completo en la lista. |

### Principio 3 · Comprensible

| Criterio | Nivel | Estado | Evidencia |
|---|---|---|---|
| 3.1.1 Idioma de la página | A | ✅ | `<html lang="es-MX">`. |
| 3.1.2 Idioma de las partes | AA | ✅ | Los textos en inglés (eslogan, nombres de módulos) llevan `lang="en"`. |
| 3.2.1 Al recibir el foco | A | ✅ | Enfocar no cambia de página ni abre nada. |
| 3.2.2 Al introducir datos | A | ✅ | Cambiar una opción no envía formularios ni cambia de página; las preferencias se aplican en el momento sin mover el foco. |
| 3.2.3 Navegación coherente | AA | ✅ | El mismo encabezado, menú y pie de página en todas las páginas. |
| 3.2.4 Identificación coherente | AA | ✅ | Los mismos componentes (Atomic Design) con las mismas etiquetas en toda la app. |
| 3.2.6 Ayuda coherente | A | ✅ | El botón **Ayuda SOS** está en el mismo lugar en todas las páginas, y la Línea de la Vida en el pie. |
| 3.3.1 Identificación de errores | A | ✅ | Mensajes en texto junto al campo y enlazados con `aria-describedby`; los errores que devuelve el servidor también se muestran en español. |
| 3.3.2 Etiquetas o instrucciones | A | ✅ | Etiqueta visible, marca «(obligatorio)» y ejemplos («Por ejemplo: Biblioteca central»). |
| 3.3.3 Sugerencias ante errores | AA | ✅ | Los mensajes explican cómo corregir («La contraseña debe tener al menos 10 caracteres»). |
| 3.3.4 Prevención de errores (legales, financieros, datos) | AA | ➖ | No hay transacciones legales ni financieras. Aun así, borrar notas o la cuenta pide confirmación. |
| 3.3.7 Entrada redundante | A | ✅ | Ningún proceso pide dos veces el mismo dato. |
| 3.3.8 Autenticación accesible (mínimo) | AA | ✅ | Correo y contraseña sin CAPTCHA ni pruebas cognitivas; se permite pegar y los gestores de contraseñas funcionan (`autocomplete`). |

### Principio 4 · Robusto

| Criterio | Nivel | Estado | Evidencia |
|---|---|---|---|
| 4.1.2 Nombre, función, valor | A | ✅ | Controles nativos; `aria-pressed` en los botones de alternar, `role="switch"` en los interruptores y `<dialog>` nativo. axe sin infracciones. |
| 4.1.3 Mensajes de estado | AA | ✅ | `role="status"` y `aria-live="polite"` en guardados, búsquedas, carga y disponibilidad de profesionales. |

## 5. Brechas conocidas y plan

| Criterio | Problema | Impacto | Corrección propuesta |
|---|---|---|---|
| 2.1.1 Teclado | Elegir un **punto libre** como origen o destino requiere un clic en el mapa. | Con teclado solo se pueden usar la ubicación actual o los oasis de la lista. | Agregar un buscador de direcciones (Nominatim, ya integrado) en «Origen» y «Destino». |
| 2.2.1 Tiempo ajustable | La sesión con cuenta caduca a las 2 h sin aviso previo. | Un texto a medio escribir puede perderse si la sesión vence. | Avisar 2 minutos antes con un botón «Seguir conectado» (renueva el token) y guardar los borradores en la pestaña. |

## 6. Correcciones hechas durante esta evaluación (Fase 8)

1. **Contraste del bloque de emergencias (911)** en el tema Noche: 2.9:1 → 5.5:1. Se usa el color de texto pensado para cada tema (`--color-on-primary`), en la página y en el modal SOS.
2. **Bordes de controles (1.4.11):** nuevo token `--color-control-border` (≥ 3.3:1 en Predeterminado y Calma, ≥ 4.4:1 en Noche) para campos, interruptores, opciones, búsqueda y menú.
3. **Reflow y espaciado (1.4.10, 1.4.12):** las palabras y URL largas se parten (`overflow-wrap`), los elementos de grid y flex pueden encogerse (`min-width: 0`) y el texto de los botones puede ocupar dos líneas.
4. **Foco no oculto (2.4.11):** `scroll-padding-bottom` reserva el espacio del botón SOS fijo.

### Extensiones (clínicas cercanas y monitor de pulso)

Revisadas con axe-core en los 4 temas, con la lista de clínicas cargada y con el aviso del monitor activo, más reflow a 320 px y espaciado ampliado: **0 infracciones** tras estas correcciones:

5. **Nombre accesible de los enlaces (2.5.3 / 4.1.2):** el espacio antes del texto oculto se perdía («Llamara Clínica…»). Ahora va fuera del `<span>` oculto.
6. **Contraste en Ayuda SOS, tema Calma (1.4.3):** el enlace al monitor sobre el fondo de calma daba 4.4:1; ahora usa el color de texto.
7. **Aviso del monitor en el tema Noche (1.4.3):** usa las superficies del tema, porque el botón claro no contrastaba sobre el fondo amarillo.

El monitor de pulso no usa animaciones ni destellos: el aviso es un bloque estático con `role="alert"` y una vibración opcional (desactivada por defecto). La lectura del pulso no se anuncia cada segundo, para no saturar al lector de pantalla; el aviso sí.

## 7. Contacto sobre accesibilidad

Para reportar una barrera, abre un reporte en <https://github.com/ortegavelazquezdaniela/neuronote-monorepo/issues>. También está en la página `/contacto` y en la **Declaración de accesibilidad** de la app.
