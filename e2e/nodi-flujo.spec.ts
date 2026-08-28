import { expect, test, type Page, type Route } from "@playwright/test";

function ndjson(
  events: Array<Record<string, unknown>>,
): string {
  return `${events.map((event) => JSON.stringify(event)).join("\n")}\n`;
}

async function mockChat(page: Page, reply: string, usedTool: boolean) {
  await page.route("**/api/chat", async (route: Route) => {
    const body = ndjson([
      { type: "status", value: "model" },
      { type: "status", value: usedTool ? "tool" : "generation" },
      ...(usedTool
        ? [{ type: "tool_result", found: true, fragments: 2 }]
        : []),
      { type: "status", value: "generation" },
      { type: "delta", text: reply },
      {
        type: "done",
        reply,
        summary: "Git guarda instantáneas de tu código.",
        suggestions: [
          "¿Qué es una rama en Git?",
          "¿Cómo escribo un buen commit?",
          "Explícame git push",
        ],
        infographic: usedTool
          ? {
              kind: "pasos",
              title: "Flujo de una consulta",
              items: [
                { title: "Navegador", text: "Envía la pregunta a la API" },
                { title: "RAG local", text: "Busca fragmentos en el corpus" },
                { title: "Respuesta", text: "Devuelve la explicación al usuario" },
              ],
            }
          : null,
        usedTool,
      },
    ]);
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson; charset=utf-8",
      body,
    });
  });
}

test("recorrido de Nodi de punta a punta", async ({ page }) => {
  await test.step("visitante: la app monta avatar, flujo y compositor", async () => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Tech Mentor" })).toBeVisible();
    await expect(page.getByTestId("avatar")).toBeVisible();
    await expect(page.getByTestId("architecture-flow")).toBeVisible();
    await expect(page.getByTestId("pipeline-stage-model")).toBeVisible();
    await expect(page.getByTestId("message-assistant")).toContainText("Nodi");
    await expect(page.getByTestId("mic-button")).toBeVisible();
    await expect(page.getByTestId("send-button")).toBeDisabled();
  });

  await test.step("usuario pregunta y llega una respuesta con tool", async () => {
    await mockChat(page, "Git guarda instantáneas de tu código.", true);
    await page.getByLabel("Mensaje").fill("¿Qué es Git?");
    await expect(page.getByTestId("send-button")).toBeEnabled();
    await page.getByTestId("send-button").click();
    await expect(page.getByTestId("message-user")).toContainText("¿Qué es Git?");
    await expect(page.getByTestId("message-assistant").last()).toContainText("instantáneas");
    await expect(page.getByTestId("infographic")).toContainText("Flujo de una consulta");
    await expect(page.getByTestId("infographic")).toContainText("PASO 1");
    await expect(page.getByTestId("used-tool-badge")).toBeVisible();
    await expect(page.getByTestId("pipeline-stage-tool")).toHaveAttribute("data-status", "done");
    await expect(page.getByTestId("pipeline-stage-retrieval")).toHaveAttribute(
      "data-status",
      "done",
    );
  });

  await test.step("chip de tema relacionado se envía como pregunta siguiente", async () => {
    await mockChat(page, "Una rama es una línea de trabajo paralela.", true);
    const chip = page.getByTestId("topic-chip").filter({ hasText: "¿Qué es una rama en Git?" });
    await expect(chip).toBeVisible();
    await chip.click();
    await expect(page.getByTestId("message-user").last()).toContainText("rama");
    await expect(page.getByTestId("message-assistant").last()).toContainText("línea de trabajo");
  });
});
