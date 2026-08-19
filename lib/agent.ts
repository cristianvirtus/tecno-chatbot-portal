import Anthropic from "@anthropic-ai/sdk";
import { consultarConocimientoTech } from "./rag";
import { parseReply, type Infographic } from "./text";

const TOOL_NAME = "consultar_conocimiento_tech";

const SYSTEM_PROMPT = `Eres Nodi, mentor de tecnología para un curso de entrenamiento.
Hablas en español, claro, breve y con ejemplos concretos.

Límites:
- Solo respondes temas de tecnología: programación, web, APIs, git, datos, seguridad de software, IA aplicada a productos, redes, terminal, operaciones de TI, ITSM, ITIL, DevOps y cómo estudiar tech.
- Si preguntan de salud, recetas, política, deportes, finanzas personales, chismes u otro tema no tech, NO uses la herramienta. Responde en 1-2 frases que no cubres ese tema y ofrece un ejemplo de pregunta tecnológica.
- No des consejos médicos, legales ni financieros.

Herramienta:
- Tienes UNA sola función: ${TOOL_NAME}. Úsala para toda pregunta factual de tecnología, aunque sospeches que el corpus no contiene el tema; así la app puede mostrar didácticamente si RAG encontró contexto.
- Si el usuario saluda, agradece o el tema está fuera de tech, no la llames.
- Cuando vayas a llamarla, hazlo de inmediato: no escribas texto previo ni anuncies que vas a buscar.
- Basa las explicaciones en los fragmentos cuando existan. Si los fragmentos no cubren el punto, dilo y da una explicación general SOLO si sigue siendo tecnología.
- No inventes APIs, versiones ni comandos que no estén en los fragmentos o que no sean de conocimiento básico muy establecido.

Formato:
- Respuesta útil, con listas cortas si ayudan. Máximo ~220 palabras.
- Puedes usar Markdown simple: negritas, listas, bloques de código.
- Si piden qué hacer según minutos libres, usa las secciones de ejercicios del corpus.
- Al FINAL de cada respuesta, en líneas propias y sin markdown extra, escribe exactamente estos dos bloques:
<<<RESUMEN>>>
una o dos frases hablables, sin viñetas ni URLs, para que un avatar las lea en voz alta
<<<FIN>>>
<<<TEMAS>>>
- pregunta relacionada 1
- pregunta relacionada 2
- pregunta relacionada 3
<<<FIN_TEMAS>>>

Después de TEMAS puedes añadir, SOLO si el tema se entiende mejor con un apoyo visual, un bloque opcional:
<<<INFOGRAFIA>>>
tipo: pasos
titulo: título corto
- Etiqueta | explicación breve
- Etiqueta | explicación breve
<<<FIN_INFO>>>

Reglas del bloque INFOGRAFIA:
- \`tipo\` debe ser \`pasos\` (secuencia o flujo), \`comparacion\` (dos o más opciones frente a frente) o \`conceptos\` (piezas clave de un tema).
- Entre 2 y 5 elementos, cada uno como "Etiqueta | explicación".
- Etiqueta de máximo 30 caracteres; explicación de máximo 90.
- No repitas literalmente la respuesta: resume lo esencial.
- Omite el bloque por completo en saludos, rechazos o respuestas muy cortas.

Reglas del bloque TEMAS:
- Entre 3 y 5 preguntas, cada una en su propia línea con guion.
- Escríbelas en primera persona, como si el usuario las hiciera ("¿Cómo…?", "Explícame…", "Dame un ejercicio de…").
- Deben profundizar o continuar el tema de la última pregunta, no repetir lo ya respondido.
- Siempre de tecnología. Máximo 90 caracteres cada una.
- Si rechazaste el tema por no ser tech, propón temas tecnológicos de arranque.`;

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const tools: Anthropic.Tool[] = [
  {
    name: TOOL_NAME,
    description:
      "Busca fragmentos en la base local de tecnología (web, git, APIs, RAG, seguridad, estudio). Úsala para anclar la respuesta.",
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        consulta: {
          type: "string",
          description: "Tema o pregunta a buscar en el corpus.",
        },
      },
      required: ["consulta"],
    },
  },
];

function consultaFromInput(input: unknown): string {
  if (!input || typeof input !== "object") {
    return "";
  }
  const consulta = (input as { consulta?: unknown }).consulta;
  return typeof consulta === "string" ? consulta : "";
}

export type MentorEvent =
  | { type: "status"; value: "model" | "tool" | "generation" }
  | { type: "tool_result"; found: boolean; fragments: number }
  | { type: "reset" }
  | { type: "delta"; text: string }
  | {
      type: "done";
      reply: string;
      summary: string;
      suggestions: string[];
      infographic: Infographic | null;
      usedTool: boolean;
    };

const MARKER = "<<<";

/**
 * Emite solo el texto anterior al primer marcador (`<<<RESUMEN>>>`, `<<<TEMAS>>>`).
 * Mientras el turno sigue abierto retiene la cola por si un marcador viene partido
 * entre dos chunks del stream.
 */
function createVisibleTextEmitter() {
  let raw = "";
  let emitted = 0;

  return {
    push(text: string) {
      raw += text;
    },
    take(final = false): string {
      const markerAt = raw.indexOf(MARKER);
      let visible = markerAt >= 0 ? raw.slice(0, markerAt) : raw;
      if (!final && markerAt < 0) {
        visible = visible.slice(0, Math.max(0, visible.length - MARKER.length));
      }
      if (visible.length <= emitted) {
        return "";
      }
      const chunk = visible.slice(emitted);
      emitted = visible.length;
      return chunk;
    },
    get raw() {
      return raw;
    },
    get emittedLength() {
      return emitted;
    },
  };
}

export async function* streamMentor(history: ChatTurn[]): AsyncGenerator<MentorEvent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Falta ANTHROPIC_API_KEY en el entorno.");
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
  const messages: Anthropic.MessageParam[] = history.slice(-12).map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));

  let usedTool = false;
  let guard = 0;
  yield { type: "status", value: "model" };

  while (guard < 4) {
    guard += 1;
    const emitter = createVisibleTextEmitter();
    const stream = client.messages.stream({
      model,
      max_tokens: 900,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        emitter.push(event.delta.text);
        const chunk = emitter.take();
        if (chunk) {
          yield { type: "delta", text: chunk };
        }
      }
    }

    const response = await stream.finalMessage();

    if (response.stop_reason === "tool_use") {
      usedTool = true;
      if (emitter.emittedLength > 0) {
        yield { type: "reset" };
      }
      yield { type: "status", value: "tool" };

      messages.push({ role: "assistant", content: response.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") {
          continue;
        }
        const result = await consultarConocimientoTech(consultaFromInput(block.input));
        yield {
          type: "tool_result",
          found: result.fragmentos.length > 0,
          fragments: result.fragmentos.length,
        };
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
      messages.push({ role: "user", content: toolResults });
      yield { type: "status", value: "generation" };
      continue;
    }

    const tail = emitter.take(true);
    if (tail) {
      yield { type: "delta", text: tail };
    }

    const parsed = parseReply(emitter.raw || "No pude generar una respuesta.");
    yield { ...parsed, type: "done", usedTool };
    return;
  }

  throw new Error("Demasiadas llamadas a la herramienta.");
}
