# Tech Mentor (Nodi)

Mini-agente de un curso de entrenamiento: **una sola tool** (`consultar_conocimiento_tech`) que busca en un corpus local de tecnología (RAG). Chat de texto, micrófono en el navegador, y un avatar animado que lee un resumen corto.

Solo responde temas de tecnología. El resto se rechaza con una redirección al tema.

## Qué demuestra

- API key en el servidor (nunca en el cliente)
- Prompt con rol, límites y formato de resumen para voz
- Tool use con streaming: el modelo propone la función, Node la ejecuta y la respuesta final se transmite token a token
- RAG sobre Markdown en `knowledge/`
- UI responsive (sin login ni MCP: el lab pedía una tool)

## Funciones de la interfaz

- Avatar fijo en la barra superior: parpadea, mueve la boca al hablar y cambia de gesto al escuchar o pensar
- Flujo de arquitectura en tiempo real: 10 nodos (entrada, API route, prompt, modelo, tool use, RAG, redacción, streaming, render y voz) que se iluminan conforme participan. En móvil se colapsa en una línea con la etapa activa
- Infografías: cuando ayuda, la respuesta incluye una tarjeta de pasos, comparación o conceptos clave
- Respuestas en streaming: el texto aparece mientras el modelo escribe (NDJSON sobre `fetch`)
- Respuestas renderizadas como Markdown (listas, negritas, bloques de código)
- **Temas relacionados**: 3–5 preguntas de seguimiento clicables que el modelo devuelve en la misma llamada
- Botón de micrófono con dictado del navegador
- Voz gratuita del sistema: prioriza voces españolas locales o “premium/enhanced” instaladas y ajusta ritmo y tono para sonar más natural

## Requisitos

- Node.js 20+
- Una clave de [Anthropic / Claude](https://console.anthropic.com/settings/keys)

## Cómo correrlo

```bash
npm install
cp .env.example .env.local
# Edita .env.local y pega ANTHROPIC_API_KEY
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run build
```

## Pruebas manuales sugeridas

1. «¿Qué es RAG?» → debe usar la tool (chip en la barra superior) y citar ideas del corpus.
2. «Tengo 15 minutos, ¿qué practico de Git?» → ejercicio del material de estudio.
3. «¿Cómo hago una receta de lasaña?» → rechazo educado, sin tool.
4. Clic en un chip de «Temas relacionados» → se envía como pregunta del usuario.
5. Botón de micrófono en **Chrome** → transcribe y envía.
6. El avatar se mueve y habla el resumen (puede pedir un clic previo en algunos navegadores por política de autoplay).

## Deploy (Vercel)

1. Sube el repo a GitHub.
2. Importa el proyecto en Vercel.
3. Variable de entorno `ANTHROPIC_API_KEY`.
4. Deploy. La URL pública es un entregable válido del curso.

## Límites

- El corpus es pequeño y curado a propósito (mejor retrieval que un dump enorme).
- **Dictado solo en Chrome.** La Web Speech API delega la transcripción en un servicio del fabricante: Chrome usa el de Google, mientras que Edge, Brave, Firefox y Arc devuelven `network`. Habilitarlo ahí exigiría transcripción en el servidor con otro proveedor (Anthropic no la ofrece). La app lo explica en pantalla y el chat por texto siempre funciona.
- No hay búsqueda web: cuando el RAG no encuentra nada, el nodo muestra «Sin resultados» y el modelo responde con conocimiento general, sin fingir una fuente.
- Las infografías se dibujan con datos estructurados que devuelve el modelo (sin HTML ni SVG generado), no son imágenes de un servicio externo.
- El avatar es ilustrado (no lip-sync fotoreal).
