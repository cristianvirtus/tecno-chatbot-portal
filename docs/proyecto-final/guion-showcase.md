# Guion del showcase (~10 min)

Tres momentos, como pide la rúbrica. Ensayar en **local** y en [la URL de Vercel](https://tecno-chatbot-portal.vercel.app).

## 1. Qué problema resuelve (≈1 min)

Nodi es un mentor de tecnología para quien está aprendiendo. Responde solo temas tech, ancla las respuestas en un corpus Markdown (RAG) y enseña *cómo* responde: una sola herramienta, streaming y un panel de 10 nodos.

Frase de cierre: *una función, un corpus, un stream, un push*.

## 2. Demo del flujo principal (≈5–6 min)

Orden que cubre los criterios 1, 2 y 3:

1. Abrir la URL desplegada. Mostrar el panel *Cómo responde Nodi* en gris (en espera).
2. **Hit de RAG:** «¿Qué es Git?» → se iluminan tool y RAG; la respuesta cita el corpus.
3. **Miss honesto:** «¿Qué es ITIL?» → la tool corre, RAG queda *sin resultados*, Nodi no finge internet.
4. **Rechazo:** «Dame una receta de lasaña» → no llama la tool; redirige a tech.
5. Chip de **tema relacionado** → se envía como pregunta tuya.
6. (Opcional, Chrome) micrófono y el avatar leyendo el resumen.

## 3. Una decisión de la que estás orgulloso (≈2 min)

Elegir **una**:

- Una sola tool: cumple el lab y deja ver en el panel si RAG acertó.
- RAG léxico (sin embeddings): simple de explicar y honesto cuando no hay hits.
- Haiku + NDJSON: la demo baja de ~27 s a ~5 s y el texto aparece en vivo.

## Evidencia de calidad (criterios 4 y 5)

Antes de hablar, tener abiertas dos pestañas:

- GitHub Actions en verde: `https://github.com/cristianvirtus/tecno-chatbot-portal/actions`
- Local: `npm test` (RAG, validación de `/api/chat`, parseo de la respuesta)

El deploy es el push a `main` → Vercel. No hay segunda herramienta, MCP ni base vectorial: la rúbrica evalúa el principio, no el stack de catálogo.

## Si preguntan

| Pregunta | Respuesta corta |
|----------|-----------------|
| ¿Dónde está la API key? | Solo en el servidor (`.env.local` / Vercel). El navegador llama a `/api/chat`. |
| ¿Por qué no buscas en internet? | El lab pide una tool. El corpus es el dato real. |
| ¿Es una base de datos? | Sí en el sentido del criterio: `knowledge/*.md` es el origen persistente; RAG lo lee en el servidor. |
