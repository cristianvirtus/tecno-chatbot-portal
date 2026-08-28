import assert from "node:assert/strict";
import { test } from "node:test";
import { consultarConocimientoTech } from "./rag";
import { chunkDocument } from "./text";

test("consulta vacía no busca en el corpus", async () => {
  const result = await consultarConocimientoTech("   ");
  assert.equal(result.fragmentos.length, 0);
  assert.equal(result.aviso, "La consulta estaba vacía.");
});

test("una pregunta de Git recupera fragmentos del corpus local", async () => {
  const result = await consultarConocimientoTech("¿Qué es Git?");
  assert.ok(result.fragmentos.length > 0);
  assert.equal(result.aviso, null);
  assert.ok(result.fragmentos.every((item) => item.score > 0));
  assert.ok(result.fragmentos.some((item) => item.fuente === "git.md"));
});

test("devuelve como máximo cuatro fragmentos", async () => {
  const result = await consultarConocimientoTech("API HTTP JSON JavaScript Git seguridad");
  assert.ok(result.fragmentos.length <= 4);
});

test("un tema fuera del corpus no inventa fragmentos", async () => {
  const result = await consultarConocimientoTech("receta de lasaña boloñesa");
  assert.equal(result.fragmentos.length, 0);
  assert.equal(result.aviso, "No hay fragmentos relevantes en la base local.");
});

test("chunkDocument parte por encabezados de segundo nivel", () => {
  const chunks = chunkDocument({
    id: "demo.md",
    title: "Demo",
    source: "demo.md",
    content: [
      "# Demo",
      "",
      "## Primero",
      "Este bloque tiene más de cuarenta caracteres para no descartarse.",
      "",
      "## Segundo",
      "Este otro bloque también supera el umbral mínimo de longitud.",
    ].join("\n"),
  });
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].title, "Primero");
  assert.equal(chunks[1].title, "Segundo");
});
