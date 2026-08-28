import type { ChatTurn } from "./agent";

export type ChatRequestError = {
  ok: false;
  status: 400;
  error: string;
};

export type ChatRequestOk = {
  ok: true;
  messages: ChatTurn[];
};

function isTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") {
    return false;
  }
  const turn = value as ChatTurn;
  return (
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string" &&
    turn.content.trim().length > 0 &&
    turn.content.length < 8000
  );
}

export function validateChatBody(body: unknown): ChatRequestOk | ChatRequestError {
  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isTurn)) {
    return { ok: false, status: 400, error: "messages inválido" };
  }
  const last = messages[messages.length - 1];
  if (last.role !== "user") {
    return { ok: false, status: 400, error: "El último mensaje debe ser del usuario" };
  }
  return { ok: true, messages };
}
