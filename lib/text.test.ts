import assert from "node:assert/strict";
import { test } from "node:test";
import { cosineSimilarity, lexicalScore, parseReply, tokenize } from "./text";

test("cosine de vectores iguales es 1", () => {
  assert.equal(cosineSimilarity([1, 0, 0], [1, 0, 0]), 1);
});

test("tokenize ignora acentos y palabras cortas", () => {
  const tokens = tokenize("¿Qué es una API?");
  assert.ok(tokens.includes("que"));
  assert.ok(tokens.includes("una"));
  assert.ok(tokens.includes("api"));
});

test("lexicalScore puntúa documentos con las mismas palabras", () => {
  const hit = lexicalScore("qué es git", "Git guarda instantáneas de tu código");
  const miss = lexicalScore("qué es git", "receta de pan con tomate y aceite");
  assert.ok(hit > miss);
});

test("lexicalScore ignora palabras vacías en una consulta sin cobertura", () => {
  assert.equal(
    lexicalScore("¿Qué es ITIL?", "Qué es una API y para qué sirve"),
    0,
  );
});

test("parseReply extrae el bloque de voz", () => {
  const raw = `HTTP usa métodos como GET.\n<<<RESUMEN>>>\nGET sirve para leer datos.\n<<<FIN>>>`;
  const parsed = parseReply(raw);
  assert.equal(parsed.reply, "HTTP usa métodos como GET.");
  assert.equal(parsed.summary, "GET sirve para leer datos.");
  assert.deepEqual(parsed.suggestions, []);
});

test("parseReply extrae temas relacionados y los quita del texto", () => {
  const raw = [
    "Git guarda instantáneas.",
    "<<<RESUMEN>>>",
    "Git versiona tu código.",
    "<<<FIN>>>",
    "<<<TEMAS>>>",
    "- ¿Qué es una rama en Git?",
    "- ¿Cómo escribo un buen mensaje de commit?",
    "<<<FIN_TEMAS>>>",
  ].join("\n");
  const parsed = parseReply(raw);
  assert.equal(parsed.reply, "Git guarda instantáneas.");
  assert.equal(parsed.suggestions.length, 2);
  assert.equal(parsed.suggestions[0], "¿Qué es una rama en Git?");
  assert.ok(!parsed.reply.includes("TEMAS"));
});

test("parseReply extrae la infografía y la saca del texto", () => {
  const raw = [
    "Una petición HTTP viaja del navegador al servidor.",
    "<<<INFOGRAFIA>>>",
    "tipo: pasos",
    "titulo: Ciclo de una petición",
    "- Cliente | El navegador arma la petición",
    "- Servidor | Procesa y responde",
    "- Respuesta | Devuelve 200 y JSON",
    "<<<FIN_INFO>>>",
  ].join("\n");
  const parsed = parseReply(raw);
  assert.equal(parsed.reply, "Una petición HTTP viaja del navegador al servidor.");
  assert.equal(parsed.infographic?.kind, "pasos");
  assert.equal(parsed.infographic?.title, "Ciclo de una petición");
  assert.equal(parsed.infographic?.items.length, 3);
  assert.equal(parsed.infographic?.items[0].text, "El navegador arma la petición");
});

test("parseReply descarta una infografía con un solo elemento", () => {
  const raw = "Texto.\n<<<INFOGRAFIA>>>\ntipo: pasos\n- Único | Sin pareja\n<<<FIN_INFO>>>";
  assert.equal(parseReply(raw).infographic, null);
});

test("parseReply limita a cinco sugerencias", () => {
  const items = Array.from({ length: 8 }, (_, i) => `- Pregunta número ${i}`).join("\n");
  const parsed = parseReply(`Texto.\n<<<TEMAS>>>\n${items}\n<<<FIN_TEMAS>>>`);
  assert.equal(parsed.suggestions.length, 5);
});
