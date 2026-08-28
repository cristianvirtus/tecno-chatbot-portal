# Adaptación de los labs de testing a Nodi

Los documentos de clase están escritos para **EduPlatform** (catálogo, instructor, estudiante, Edy/LiveKit, Supabase). Nodi no tiene esos roles. Se evalúa el **principio**, no el producto de ejemplo.

## Lab 12 — Playwright + IA

| En el lab | Equivalente en Nodi |
|-----------|---------------------|
| Visitante ve el widget de Edy (sin simular voz) | Visitante ve avatar, panel *Cómo responde Nodi* y el botón de micrófono. **No** se simula dictado. |
| Instructor crea un curso | El usuario envía «¿Qué es Git?» y la UI muestra respuesta + tool. |
| Estudiante se inscribe en *ese* curso | El chip de tema relacionado se envía como la pregunta siguiente (flujo encadenado). |
| `storageState` / Supabase | No aplica: Nodi no tiene login. |
| Selectores | `getByRole` y `data-testid` (nunca clases de Tailwind). |
| Gate de CI | `npm run test:e2e` en GitHub Actions, después del build. |

La conversación de voz se sigue comprobando a mano (como el Lab 8 del curso). Playwright no puede hacer un dictado real.

## Lab 12b — Agente QA autónomo

Eso es **otro entregable**: un programa Python (`qa_agent/`) con ReAct, 4 tools, Bedrock principal y Anthropic alterno. No forma parte del mini-agente Nodi.

Para Nodi, el recorte honesto es:

1. Especificar el agente contra *este* repo (unit + integración + E2E de Nodi), no contra `enrollment.ts`.
2. Implementarlo **después** de tener Bedrock o de decidir `LLM_PROVIDER=anthropic` como principal (Nodi ya usa Anthropic).
3. No mezclar el agente QA con el chat de producción.

Hasta que no pidas esa fase, no se añade `qa_agent/` ni dependencias de AWS.
