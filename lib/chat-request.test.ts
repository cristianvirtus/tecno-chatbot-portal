import assert from "node:assert/strict";
import { test } from "node:test";
import { validateChatBody } from "./chat-request";

test("rechaza JSON sin messages", () => {
  const result = validateChatBody({});
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 400);
  }
});

test("rechaza un turno vacío", () => {
  const result = validateChatBody({
    messages: [{ role: "user", content: "   " }],
  });
  assert.equal(result.ok, false);
});

test("rechaza un mensaje demasiado largo", () => {
  const result = validateChatBody({
    messages: [{ role: "user", content: "a".repeat(8000) }],
  });
  assert.equal(result.ok, false);
});

test("exige que el último turno sea del usuario", () => {
  const result = validateChatBody({
    messages: [
      { role: "user", content: "Hola" },
      { role: "assistant", content: "¿En qué te ayudo?" },
    ],
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "El último mensaje debe ser del usuario");
  }
});

test("acepta un historial válido que termina en el usuario", () => {
  const result = validateChatBody({
    messages: [
      { role: "user", content: "¿Qué es Git?" },
      { role: "assistant", content: "Git versiona código." },
      { role: "user", content: "¿Y una rama?" },
    ],
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.messages.length, 3);
  }
});
