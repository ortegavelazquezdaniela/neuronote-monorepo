# NEURONOTE · Guía para demostrar la plataforma

> Recorrido de **10 a 12 minutos** para presentar NEURONOTE a tu profesor. Cada paso dice **qué hacer**, **qué decir** y **qué se ve**. Si tienes menos tiempo, sigue solo los pasos marcados con ⭐ (unos 5 minutos).

## Antes de empezar (10 minutos antes)

1. **Despierta los servidores.** Render Free se duerme tras 15 minutos sin uso y tarda hasta un minuto en despertar. Abre estas tres pestañas y espera a que respondan:
   - API: <https://neuronote-api-pnnf.onrender.com/api/health> → debe decir `"ok": true`, `"users": "supabase"` y `"notes": "mongodb"`.
   - Motor de auditoría: <https://neuronote-audit.onrender.com/src/health.php> → `{"ok":true}`.
   - La app: <https://neuronote-monorepo.vercel.app>
2. **Revisa Supabase.** Si nadie usó la app en una semana, el proyecto se pausa. Entra a <https://supabase.com/dashboard> y, si dice *Paused*, pulsa **Restore**.
3. **Usa Chrome o Edge** (en computadora o Android). El monitor de pulso no funciona en iPhone.
4. Ten a la mano la **contraseña del panel pericial** (la que configuraste en Render). No la escribas en la presentación.
5. Si vas a usar el proyector, sube el tamaño de texto a **125 %** desde Accesibilidad (paso 2).

---

## 1. ⭐ Página principal — qué es NEURONOTE (1 min)

**Haz:** abre la app.

**Se ve:** una introducción de 1.8 s (solo la primera vez), el eslogan *Find your calm. Find your way.*, los cinco módulos y una vista previa del mapa.

**Di:** «NEURONOTE ayuda a personas neurodivergentes y con sensibilidad sensorial a moverse por la ciudad sin sobrecargarse: rutas a pie más tranquilas, lugares para descansar, el clima de la zona, un diario sensorial y ayuda inmediata en crisis. Se hizo con presupuesto de cero pesos, solo con herramientas gratuitas y de código abierto.»

**Muestra también:**
- El botón **Ayuda SOS** abajo a la derecha: está en todas las páginas, siempre en el mismo lugar.
- Pulsa **Alt + C**: se abre la ayuda SOS desde cualquier pantalla, sin animaciones, porque en una crisis la respuesta debe ser inmediata. Ciérrala con **Escape**.

## 2. ⭐ Accesibilidad — la app se adapta a la persona (1 min)

**Haz:** menú → **Accesibilidad** (o `/accesibilidad`).

**Muestra en orden:**
1. **Modo visual:** Modo Calma (colores más suaves, menos elementos y sin animaciones), Alto contraste y Modo Noche. Todo cambia al instante.
2. **Tamaño del texto:** 100 % a 150 %.
3. **Tipografía:** OpenDyslexic, para personas con dislexia.
4. **Movimiento:** Reducir.
5. **Recordar en este dispositivo:** las preferencias solo se guardan si la persona lo permite.

**Di:** «Cumple WCAG 2.2 nivel AA en 45 de 47 criterios aplicables, revisado con axe-core en 16 páginas y 4 temas. Las 2 brechas están documentadas con su plan.»

Regresa al tema **Predeterminado** antes de seguir.

## 3. ⭐ Mapa y oasis sensoriales (1.5 min)

**Haz:** **Explorar mapa** (`/mapa`).

**Se ve:** un mapa de OpenStreetMap con parques, bibliotecas y museos reales cercanos, y el panel de microclima.

**Muestra:**
- **Usar mi ubicación:** el navegador pide permiso. La ubicación solo se usa mientras la pestaña está abierta y no se guarda.
- Cada lugar dice **Sin verificar**. **Di:** «No inventamos lugares ni certificaciones: son lugares reales de OpenStreetMap que NEURONOTE todavía no ha evaluado. Cada dato dice de dónde viene: Pronóstico, Calculado, Sin verificar o Demostración.»
- Abre un lugar → **ficha del oasis**: horario, accesibilidad en silla de ruedas, enlace a OSM y el estado del **sello NEURONOTE** (consulta al motor PHP).
- **Guardar en favoritos** (se ve cuando hay sesión, paso 6).

## 4. Rutas de calma (1 min)

**Haz:** en la ficha del oasis, **Planear ruta hasta aquí**.

**Se ve:** dos o más rutas a pie calculadas con OSRM sobre OpenStreetMap.

**Muestra:** cambia entre **Más tranquila** (pasa cerca de parques y bibliotecas) y **Más rápida**. **Di:** «Ninguna ruta es tranquila para todas las personas: tú decides qué priorizar ese día.»

## 5. Microclima (30 s)

**Haz:** **Microclima** (`/microclima`).

**Muestra:** temperatura, sensación térmica, índice UV y presión, con la etiqueta **Pronóstico** (Open-Meteo). Enfoca una gráfica con **Tab** y usa las **flechas**: las gráficas también se leen con el teclado.

## 6. ⭐ Cuenta y notas sensoriales (1.5 min)

**Haz:**
1. **Notas** (`/notas`) sin sesión: escribe una nota («Metro Insurgentes», ruido 4, comodidad 2) → **Guardar nota**. **Di:** «Sin cuenta, las notas viven solo en este navegador.»
2. **Crear cuenta** (`/registro`): correo, apodo y una contraseña de al menos 10 caracteres con letras y números. Si te equivocas a propósito, los errores aparecen en español junto a cada campo.
3. De vuelta en Notas: **Subirlas a mi cuenta**. **Di:** «Con cuenta, las notas se guardan en MongoDB Atlas y el perfil en PostgreSQL de Supabase, protegido con Row Level Security. La contraseña se guarda cifrada con bcrypt y la sesión usa un token JWT.»
4. **Perfil** (`/perfil`): ajusta tu sensibilidad al ruido o a la luz → **Guardar perfil**. Muestra también que existe **Borrar mi cuenta** (no lo pulses).

## 7. ⭐ Ayuda SOS (2 min)

**Haz:** **Ayuda SOS** (`/auxilio-inmediato`).

**Muestra:**
1. **Línea de la Vida 800 911 2000** y **Emergencias 911**: son enlaces que llaman directamente.
2. **Escribir a alguien de confianza:** elige el país (la lista viene de REST Countries, a través de la API para no exponer la clave), escribe un número y se arma un mensaje de WhatsApp listo. **Di:** «NEURONOTE no envía el mensaje ni guarda conversaciones: la persona decide.»
3. **Clínicas psicológicas cerca de ti** → **Buscar en Centro Histórico, CDMX** (o «Buscar cerca de mí»). Aparecen clínicas reales de OpenStreetMap con **Llamar** y **Cómo llegar**. **Di:** «OpenStreetMap tiene pocos servicios de salud mental registrados en la ciudad; por eso la página lo dice con honestidad y ofrece una búsqueda más amplia en Google Maps.»
4. **Respirar a tu ritmo** y **Bajar el estímulo:** recursos de regulación sin animaciones.

## 8. Monitor de pulso (1 min)

**Haz:** en Ayuda SOS, **monitor de pulso (experimental)** (`/pulso`).

**Muestra:**
1. El aviso de seguridad: **no es un dispositivo médico** y el botón del 911.
2. Escribe **100** como umbral y elige **30 segundos**.
3. **Probar con datos de demostración**: el pulso sube y, a los 30 segundos simulados (unos 12 s reales), aparece un **aviso tranquilo** con pasos para regularse.
4. **Ya estoy descansando** pospone el aviso 5 minutos.

**Di:** «Funciona con bandas y relojes que transmiten el pulso por Bluetooth, como Polar o Garmin. El Galaxy Watch necesita una app que lo transmita; el Galaxy Ring y el Apple Watch no son compatibles. Las lecturas no salen del dispositivo.»

## 9. Panel pericial y sello Sensory Haven (1.5 min)

**Haz:** en el pie de página, **Acceso para auditores** → usuario `admin` y tu contraseña.

**Muestra:**
- El panel de actas y profesionales.
- El **formulario de acta** con las mediciones: ruido promedio y picos en decibeles, reverberación, iluminación, parpadeo y aforo. **Di:** «El Índice de Confort Acústico y Sensorial (ICAS) pondera ruido 35 %, picos 15 %, reverberación 15 %, luz 20 % y aforo 15 %. Con 75 o más y el acta aprobada se emite un sello con firma HMAC: si alguien altera el acta en la base de datos, la verificación lo detecta.»

> **Importante:** no registres un lugar real con mediciones inventadas, porque aparecería como certificado en la app. Si quieres mostrar un sello, usa mediciones que hayas tomado de verdad, o explica el formulario sin guardarlo.

## 10. Calidad técnica (1 min)

Muestra rápidamente, en pestañas ya abiertas:
- **Swagger:** <https://neuronote-api-pnnf.onrender.com/api/docs> → los 20 endpoints documentados; prueba `GET /health` con **Try it out**.
- **GitHub → Actions:** la CI en verde (frontend, backend y motor PHP con Docker).
- **Storybook:** <https://ortegavelazquezdaniela.github.io/neuronote-monorepo/>, si ya activaste GitHub Pages. Muestra un componente en los 4 temas.
- **Cifras:** 140 pruebas automatizadas (94 frontend, 39 backend, 7 del ICAS), cobertura del 83 % en el frontend y del 94 % en el backend, y Ayuda SOS con 100 en las cuatro categorías de Lighthouse.

## 11. Cierre (30 s)

**Di:** «NEURONOTE no sustituye la atención médica, psicológica ni los servicios de emergencia. Lo que sí hace es dar información honesta, sin inventar datos, para que una persona pueda decidir cómo moverse por la ciudad sin sobrecargarse. Todo funciona con un presupuesto de cero pesos.»

---

## Si algo falla durante la demo

| Qué pasa | Qué hacer |
|---|---|
| La app dice que el servicio no responde | Render está despertando: espera un minuto y pulsa **Intentar de nuevo**. |
| No puedes crear cuenta o iniciar sesión | Supabase está pausado: reanúdalo en su panel (paso 2 de «Antes de empezar»). |
| El mapa no muestra lugares | Los servidores públicos de OpenStreetMap están saturados; la app usa la última búsqueda guardada si existe. Explica que son servicios gratuitos de voluntarios. |
| No aparecen clínicas | Es honesto: OSM tiene pocas registradas. Muestra el enlace a Google Maps. |
| El panel pericial no acepta la contraseña | Revisa en Render que `ADMIN_PASS_HASH` empiece con `$2y$` y que el último despliegue diga *Deploy live*. |
| El monitor no encuentra tu reloj | Usa **Probar con datos de demostración**; explica la compatibilidad. |
