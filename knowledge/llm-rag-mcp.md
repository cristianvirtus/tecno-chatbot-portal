# LLM, tools, RAG y MCP

Un LLM predice texto. No “sabe” tu repo ni la fecha con certeza. Por eso le damos herramientas y documentos.

## Tool use (function calling)

El modelo no ejecuta código por sí solo. Propone llamar una función con argumentos JSON. Tu programa ejecuta esa función y le devuelve el resultado. En este proyecto hay **una sola tool**: consultar la base de tecnología.

## RAG (Retrieval Augmented Generation)

RAG busca fragmentos relevantes en un corpus y se los pasa al modelo. Sirve para anclar respuestas a material del curso y citar fuentes. Un corpus **curado y pequeño** suele funcionar mejor que un dump enorme mal partido.

## MCP (Model Context Protocol)

MCP es una forma estándar de exponer herramientas y recursos a un cliente de IA. Es útil con varios servidores y varias tools. Para un mini-agente de una sola función, un endpoint propio es más simple y suficiente.

## Prompt engineering

El system prompt fija rol, límites (solo tecnología) y formato (resumen para voz). Sé explícito: qué hacer, qué no hacer, y cómo responder si falta información en el corpus.

## Ejercicios según tiempo

- 5 min: distingue “el modelo inventó” vs “salió del fragmento RAG”.
- 15 min: escribe un system prompt de 8 líneas para un tutor de Git.
- 30 min: diseña los argumentos JSON de una tool imaginaria (sin implementar una segunda).
