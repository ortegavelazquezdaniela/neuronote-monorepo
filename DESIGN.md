# Design

Sistema visual de NEURONOTE. Fuente de verdad de los tokens: `frontend/src/styles/tokens.css`.

## Dirección

**Tesis:** el producto se demuestra trabajando. El hero muestra la interfaz real (mapa + comparador de rutas con datos etiquetados), no una ilustración decorativa. Minimalismo geoespacial y editorial: mucho espacio negativo, jerarquía tipográfica clara, una sola acción principal por bloque.

**Escena física:** una persona en la calle, de día, con el teléfono; o en casa planeando un trayecto. → Tema claro cálido por defecto; Modo Noche disponible.

## Color

Estrategia *Restrained*: blancos cálidos + azul profundo para acción, y un tono de módulo aplicado solo en iconos.

| Rol | Token | Valor |
|---|---|---|
| Fondo | `--nn-paper` | #FBF8F3 |
| Texto | `--nn-ink` | #13233B (azul profundo oscurecido) |
| Navegación / acción | `--nn-deep-blue` | #184077 |
| Texto informativo / enlaces | `--nn-petrol` | #407076 |
| Información / ruta de calma | `--nn-aqua` | #5AA2AB (solo rellenos) |
| Superficie secundaria | `--nn-sage` / `--nn-sage-wash` | #97B1A6 / #E6EDE9 |
| Separadores | `--nn-warm-grey` | #C9C5BA |
| Acentos pequeños | `--nn-rose`, `--nn-rose-light` | #EBBAB9, #FFD9D4 |
| Calor (microclima) | `--nn-sun` | #F5C63C (solo rellenos) |
| Ruta con más estímulo | `--nn-coral` | #F47F6B (solo rellenos, línea punteada) |
| Reservados | magenta, violeta, índigo | sin uso en Fase 1 |

Reglas: nunca rojo para SOS (verde petróleo); amarillo, coral y aqua no se usan como color de texto (contraste insuficiente).

## Tipografía

- Display: **Schibsted Grotesk** (variable, autoalojada).
- Texto: **Atkinson Hyperlegible Next** (autoalojada).
- Escala fluida con `--text-scale` multiplicador (Fase 2: control de tamaño de texto).

## Componentes

Atomic Design. Botones en píldora (min 48 px), enlaces con subrayado offset, filas editoriales con separadores en lugar de tarjetas idénticas, `DataBadge` para la procedencia de cada dato.

## Movimiento

Una sola entrada del hero al cargar (opacity + 10 px, 520 ms, `cubic-bezier(0.23,1,0.32,1)`, escalonado 70 ms). Hover/press: 120–180 ms. Nada se mueve por scroll; nada en bucle. `prefers-reduced-motion` → solo fundido de 200 ms.

Intro de marca (Fase 2): 1.8 s en total — símbolo y trazo (0–600 ms), nombre (300–750), eslogan (650–1100), desvanecido (1480–1800). Solo una vez por sesión; nunca con movimiento reducido ni en Modo Calma. El modal SOS no anima: en crisis la respuesta debe ser inmediata.

## Modos

Atributos en `<html>`, aplicados por `PreferencesProvider`:

- `data-theme`: `default`, `calm` (colores suaves, oculta elementos `[data-calm-hide]`, reduce movimiento), `contrast`, `night` (incluye colores propios del mapa `--map-*`).
- `data-font`: `atkinson`, `opendyslexic`, `system`.
- `data-motion`: `reduced` o `full`.
- `--text-scale`: 1, 1.125, 1.25 o 1.5.

## Formularios

Etiqueta visible siempre, "(obligatorio)/(opcional)" explícito, pista bajo la etiqueta, error bajo el campo con icono y `aria-describedby`, resumen de errores enfocable con enlaces a cada campo. Radios nativos con aspecto propio (`ChoiceGroup`: tarjetas, segmentado o escala 1–5). Acciones destructivas con confirmación en línea, sin ventanas emergentes.
