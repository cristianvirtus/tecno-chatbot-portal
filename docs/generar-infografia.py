"""Genera docs/arquitectura-nodi.svg (infografía de arquitectura para clase).

Uso: python3 docs/generar-infografia.py && rsvg-convert -w 1680 docs/arquitectura-nodi.svg -o docs/arquitectura-nodi.png
"""

from pathlib import Path
from xml.sax.saxutils import escape

W = 1680
FONT = "Helvetica Neue, Helvetica, Arial, sans-serif"
MONO = "SF Mono, Menlo, Consolas, monospace"

INK = "#0f172a"
MUTED = "#475569"
FAINT = "#8a99ad"
LINE = "#cbd5e1"
PAPER = "#ffffff"

LANES = [
    ("NAVEGADOR", "#0369a1", "#eff8fe", "El usuario y la UI. Aquí nunca hay claves."),
    ("SERVIDOR NEXT.JS (Vercel)", "#0f766e", "#effcf9", "Ejecuta la tool, guarda el secreto, emite el stream."),
    ("ANTHROPIC · CLAUDE HAIKU 4.5", "#6d28d9", "#f6f3ff", "Razona y decide. No ejecuta código."),
]

STEPS = [
    (0, "Entrada", "El usuario escribe, o el micrófono dicta con Web Speech.",
     "components/ChatApp.tsx  ·  dictado fiable en Chrome"),
    (1, "API route", "POST /api/chat valida el JSON y exige un turno de usuario.",
     "app/api/chat/route.ts  ·  400 si el body falla, 503 sin API key"),
    (1, "Prompt", "System prompt: rol, límite “solo tecnología” y formato de salida.",
     "lib/agent.ts  ·  viajan los últimos 12 turnos de contexto"),
    (2, "El modelo decide", "Claude razona y elige: responder directo o pedir la herramienta.",
     "si es un saludo o no es tech, no llama la herramienta"),
    (1, "Tool use", "Llega stop_reason = tool_use y Node ejecuta la función.",
     "lib/agent.ts  ·  Claude propone, el servidor ejecuta"),
    (1, "RAG local", "Parte el corpus en chunks, puntúa coincidencias y toma 4.",
     "lib/rag.ts + lib/corpus.ts  ·  puede quedar sin resultados"),
    (2, "Redacción", "Segunda pasada al modelo con los fragmentos como tool_result.",
     "máximo 4 vueltas de herramienta para no ciclar"),
    (1, "Streaming", "Sale token a token en NDJSON: status, tool_result, delta, done.",
     "route.ts  ·  Content-Type: application/x-ndjson"),
    (0, "Render", "Separa respuesta, resumen hablable, 3–5 temas e infografía.",
     "lib/text.ts  ·  Markdown, chips de temas e infografía"),
    (0, "Voz", "Web Speech Synthesis lee el resumen y el avatar mueve la boca.",
     "components/Avatar.tsx  ·  voz del sistema, sin costo de API"),
]

out: list[str] = []


def add(s: str) -> None:
    out.append(s)


def text(x, y, s, size=14, fill=INK, weight="400", anchor="start", family=FONT, opacity=1.0):
    add(
        f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" fill="{fill}" '
        f'font-weight="{weight}" text-anchor="{anchor}" opacity="{opacity}">{escape(s)}</text>'
    )


def rect(x, y, w, h, fill=PAPER, stroke=None, rx=10, sw=1, dash=None, opacity=1.0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{st}{d} opacity="{opacity}"/>')


def card(x, y, w, h, title, accent):
    rect(x, y, w, h, PAPER, LINE, rx=12)
    rect(x, y, w, 4, accent, rx=2)
    add(f'<rect x="{x}" y="{y + 2}" width="{w}" height="6" fill="{accent}"/>')
    rect(x, y, w, h, "none", LINE, rx=12)
    text(x + 18, y + 36, title, 15, accent, "700")
    return y + 58


NARROW = set("iljtfr.,:;'|!()[]{} ")
WIDE = set("mwMW@")


def measure(s: str, size: float) -> float:
    """Ancho aproximado en px para Helvetica; suficiente para decidir saltos."""
    units = 0.0
    for ch in s:
        if ch in NARROW:
            units += 0.30
        elif ch in WIDE:
            units += 0.85
        elif ch.isupper() or ch.isdigit():
            units += 0.62
        else:
            units += 0.53
    return units * size


def wrap(s: str, size: float, max_w: float) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in s.split(" "):
        candidate = f"{current} {word}".strip()
        if current and measure(candidate, size) > max_w:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def bullets(x, y, items, max_w, size=13.5, gap=20, fill=MUTED, bullet_fill=None):
    """Viñetas con sangría francesa: el punto solo va en la primera línea."""
    for item in items:
        first = True
        for line in wrap(item, size, max_w - 16):
            if first:
                add(f'<circle cx="{x + 4}" cy="{y - 4.5}" r="2.5" fill="{bullet_fill or FAINT}"/>')
                first = False
            text(x + 16, y, line, size, fill)
            y += gap
        y += 4
    return y


# ---------------------------------------------------------------- lienzo
add(f'<?xml version="1.0" encoding="UTF-8"?>')
HEIGHT = 2546
add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{HEIGHT}" viewBox="0 0 {W} {HEIGHT}">')
add(f'<rect width="{W}" height="{HEIGHT}" fill="{PAPER}"/>')
add(
    '<defs>'
    '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
    f'orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{FAINT}"/></marker>'
    '<marker id="arrow-purple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
    'orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6d28d9"/></marker>'
    '</defs>'
)

# ---------------------------------------------------------------- encabezado
add(f'<rect x="0" y="0" width="{W}" height="8" fill="#0f766e"/>')
text(60, 78, "Arquitectura de Nodi", 40, INK, "700")
text(60, 112, "Mini-agente educativo de tecnología: una sola herramienta, RAG local y respuesta en streaming.", 17, MUTED)

px = 60
for label in ["Next.js App Router", "TypeScript", "Claude Haiku 4.5", "RAG léxico sobre Markdown", "Web Speech (voz)", "Deploy en Vercel"]:
    pw = 13 + len(label) * 7.7
    rect(px, 132, pw, 30, "#f1f5f9", LINE, rx=15)
    text(px + pw / 2, 152, label, 13, MUTED, "600", "middle")
    px += pw + 10

rect(1130, 60, 490, 104, "#fffbeb", "#fcd34d", rx=12)
text(1152, 88, "REQUISITO DEL LAB", 12, "#b45309", "700")
text(1152, 112, "“Un mini-agente muy simple con UNA sola tool.”", 14.5, INK, "600")
text(1152, 134, "Nodi cumple con una función ejecutable. No hay segunda", 13, MUTED)
text(1152, 152, "herramienta, ni MCP, ni búsqueda en internet.", 13, MUTED)

# ---------------------------------------------------------------- diagrama de carriles
top = 210
text(60, top - 16, "EL RECORRIDO DE UNA PREGUNTA — los mismos 10 nodos que se iluminan en la demo", 15, INK, "700")

lane_w = 520
lane_x = [60, 640, 1160]
BOX_W, BOX_H, ROW = 500, 96, 118
band_top = top + 8
band_h = 78 + len(STEPS) * ROW

for i, (name, accent, band, sub) in enumerate(LANES):
    x = lane_x[i] - 10
    rect(x, band_top, lane_w, band_h, band, rx=14)
    rect(x, band_top, lane_w, band_h, "none", accent, rx=14, sw=1, opacity=0.35)
    text(x + 20, band_top + 32, name, 13.5, accent, "700")
    text(x + 20, band_top + 54, sub, 12, MUTED)

boxes = []
y = band_top + 78
for n, (lane, title, detail, note) in enumerate(STEPS, start=1):
    x = lane_x[lane]
    accent = LANES[lane][1]
    rect(x, y, BOX_W, BOX_H, PAPER, LINE, rx=10)
    add(f'<rect x="{x}" y="{y}" width="5" height="{BOX_H}" rx="2.5" fill="{accent}"/>')
    add(f'<circle cx="{x + 34}" cy="{y + 30}" r="14" fill="{accent}"/>')
    text(x + 34, y + 35, str(n), 14, "#ffffff", "700", "middle")
    text(x + 58, y + 35, title, 16, INK, "700")
    text(x + 20, y + 60, detail, 13, MUTED)
    text(x + 20, y + 81, note, 11.5, FAINT, "400", family=MONO)
    boxes.append((x, y, lane))
    y += ROW

for i in range(len(boxes) - 1):
    x1, y1, l1 = boxes[i]
    x2, y2, l2 = boxes[i + 1]
    if i == 5:
        # El resultado del corpus regresa al modelo: se dibuja punteado.
        sy, ey = y1 + BOX_H / 2, y2 + BOX_H / 2
        mid = (x1 + BOX_W + x2) / 2
        add(
            f'<path d="M {x1 + BOX_W} {sy} H {mid} V {ey} H {x2}" stroke="#6d28d9" stroke-width="1.8" '
            f'stroke-dasharray="7 4" fill="none" marker-end="url(#arrow-purple)"/>'
        )
        text(x2, y2 - 12, "el tool_result vuelve al modelo", 12, "#6d28d9", "600")
    elif l1 == l2:
        cx = x1 + BOX_W / 2
        add(f'<path d="M {cx} {y1 + BOX_H} L {cx} {y2}" stroke="{FAINT}" stroke-width="1.6" fill="none" marker-end="url(#arrow)"/>')
    else:
        sx = x1 + (BOX_W if l2 > l1 else 0)
        ex = x2 + (0 if l2 > l1 else BOX_W)
        sy, ey = y1 + BOX_H / 2, y2 + BOX_H / 2
        mid = (sx + ex) / 2
        add(
            f'<path d="M {sx} {sy} H {mid} V {ey} H {ex}" stroke="{FAINT}" stroke-width="1.6" '
            f'fill="none" marker-end="url(#arrow)"/>'
        )

flow_bottom = band_top + band_h + 14
text(60, flow_bottom + 8, "Flecha continua: el paso siguiente.   Flecha punteada: el resultado del corpus regresa a Claude para redactar.", 12.5, FAINT)

# ---------------------------------------------------------------- tarjetas fila 1
GUT = 24
M = 60
col3 = (W - 2 * M - 2 * GUT) / 3
y0 = flow_bottom + 60

text(M, y0 - 14, "CÓMO FUNCIONA POR DENTRO", 15, INK, "700")

cy = card(M, y0, col3, 300, "LA ÚNICA HERRAMIENTA", "#0f766e")
text(M + 18, cy, "consultar_conocimiento_tech", 14, INK, "700", family=MONO)
cy += 26
rect(M + 18, cy - 4, col3 - 36, 108, "#f8fafc", LINE, rx=8)
text(M + 32, cy + 20, "entrada:  { consulta: string }", 12.5, MUTED, family=MONO)
text(M + 32, cy + 42, "salida:   { fragmentos: [ { titulo,", 12.5, MUTED, family=MONO)
text(M + 32, cy + 62, "          contenido, fuente, score } ],", 12.5, MUTED, family=MONO)
text(M + 32, cy + 82, "          aviso } ", 12.5, MUTED, family=MONO)
cy += 128
bullets(M + 18, cy, [
    "Claude no ejecuta código: solo propone el argumento de la llamada.",
    "El servidor la corre y le devuelve el JSON al modelo.",
    "Toda pregunta tech factual la invoca, aunque el corpus quizá no cubra el tema: así se ve cuándo acierta el RAG.",
], col3 - 36, bullet_fill="#0f766e")

x2 = M + col3 + GUT
cy = card(x2, y0, col3, 300, "RAG LÉXICO EN 4 PASOS", "#0369a1")
bullets(x2 + 18, cy, [
    "Carga knowledge/*.md y los parte en chunks por encabezado.",
    "Tokeniza: minúsculas, sin acentos, palabras de más de 2 letras.",
    "Descarta stop words (que, como, para, explica…) para evitar falsos positivos.",
    "score = coincidencias ÷ √(largo del chunk). Top 4 con score mayor a 0, recortados a 1200 caracteres.",
], col3 - 36, bullet_fill="#0369a1")
rect(x2 + 18, y0 + 244, col3 - 36, 42, "#eff8fe", "#bae1f7", rx=8)
text(x2 + 32, y0 + 262, "Sin embeddings ni base vectorial: es a propósito.", 12, "#0369a1", "600")
text(x2 + 32, y0 + 279, "Simple de explicar y honesto al decir “no encontré”.", 12, MUTED)

x3 = M + 2 * (col3 + GUT)
cy = card(x3, y0, col3, 300, "EL CORPUS  ·  knowledge/", "#6d28d9")
docs = [
    ("http-apis.md", "peticiones, verbos, códigos"),
    ("html-css.md", "estructura y estilos"),
    ("javascript.md", "bases del lenguaje"),
    ("git.md", "control de versiones"),
    ("bases-datos.md", "modelado y SQL"),
    ("json-datos.md", "formatos de intercambio"),
    ("seguridad.md", "buenas prácticas"),
    ("terminal-redes.md", "shell y redes"),
    ("llm-rag-mcp.md", "temas del curso"),
    ("estudio-tech.md", "cómo aprender y ejercicios"),
]
for name, desc in docs:
    text(x3 + 18, cy, name, 12.5, INK, "600", family=MONO)
    text(x3 + 168, cy, desc, 12, FAINT)
    cy += 21.5
text(x3 + 18, cy + 10, "Material curado a mano, no un volcado de internet.", 12, MUTED)

# ---------------------------------------------------------------- fila 2
y1 = y0 + 300 + 32
wide = col3 * 2 + GUT
cy = card(M, y1, wide, 268, "QUÉ VIAJA POR EL STREAM  ·  una línea JSON por evento", "#0f766e")
rows = [
    ("status: model | tool | generation", "lib/agent.ts", "Ilumina el nodo que está trabajando ahora."),
    ("tool_result { found, fragments }", "después del RAG", "Verde si hubo fragmentos; ámbar si vino vacío."),
    ("reset", "si hubo texto antes", "Borra el borrador para no mezclar respuestas."),
    ("delta { text }", "tokens del modelo", "Pinta Markdown en vivo, ya sin los marcadores."),
    ("done { reply, summary, suggestions,", "parseReply", "Mensaje final, chips de temas, infografía y voz."),
    ("       infographic, usedTool }", "", ""),
    ("error { message }", "route o agent", "Muestra el fallo; nunca inventa una respuesta."),
]
text(M + 18, cy - 4, "EVENTO", 11, FAINT, "700")
text(M + 470, cy - 4, "ORIGEN", 11, FAINT, "700")
text(M + 640, cy - 4, "QUÉ HACE LA INTERFAZ", 11, FAINT, "700")
cy += 12
for i, (ev, src, use) in enumerate(rows):
    if i % 2 == 0:
        rect(M + 12, cy - 15, wide - 24, 26, "#f8fafc", rx=6)
    text(M + 18, cy + 3, ev, 12.5, INK, "500", family=MONO)
    text(M + 470, cy + 3, src, 12, MUTED)
    text(M + 640, cy + 3, use, 12.5, MUTED)
    cy += 28

cy = card(x3, y1, col3, 268, "DÓNDE VIVE EL SECRETO", "#b45309")
rect(x3 + 18, cy - 6, col3 - 36, 92, "#fffbeb", "#fcd34d", rx=8)
text(x3 + 32, cy + 18, "ANTHROPIC_API_KEY", 13, "#b45309", "700", family=MONO)
text(x3 + 32, cy + 40, ".env.local en tu máquina y variable", 12, MUTED)
text(x3 + 32, cy + 58, "de entorno en Vercel. Solo servidor.", 12, MUTED)
cy += 110
bullets(x3 + 18, cy, [
    "El navegador solo conoce la ruta /api/chat; jamás ve la clave.",
    "Nada de prefijo NEXT_PUBLIC_ para el secreto.",
    ".env.local está en .gitignore.",
    "Sin clave, la API responde 503 con un mensaje claro.",
], col3 - 36, bullet_fill="#b45309")

# ---------------------------------------------------------------- fila 3
y2 = y1 + 268 + 32
cy = card(M, y2, col3, 250, "DECISIONES Y DESCARTES", "#6d28d9")
bullets(M + 18, cy, [
    "Segunda tool que busque en internet: rompe la regla de una sola herramienta.",
    "Embeddings o base vectorial: costo y complejidad que el lab no pide.",
    "MCP: se vio en el curso, pero no es este entregable.",
    "Backend aparte: Next.js ya es el servidor.",
    "Haiku en lugar de Sonnet: la demo bajó de ~27 s a ~5 s por respuesta.",
], col3 - 36, bullet_fill="#6d28d9")

cy = card(x2, y2, col3, 250, "LOS COLORES DEL PANEL EN VIVO", "#0369a1")
legend = [
    ("#94a3b8", "En espera", "el paso aún no ocurre"),
    ("#22d3ee", "Procesando", "está corriendo ahora"),
    ("#34d399", "Completado", "terminó bien"),
    ("#fbbf24", "Sin resultados", "RAG no encontró nada"),
    ("#64748b", "No utilizado", "el modelo no lo necesitó"),
]
for color, name, desc in legend:
    add(f'<circle cx="{x2 + 26}" cy="{cy - 5}" r="7" fill="{color}"/>')
    text(x2 + 44, cy, name, 13.5, INK, "600")
    text(x2 + 160, cy, desc, 12.5, MUTED)
    cy += 30
text(x2 + 18, cy + 12, "El panel enseña el contrato en tiempo real: se ve", 12.5, MUTED)
text(x2 + 18, cy + 30, "cuándo Claude pidió la tool y cuándo se la saltó.", 12.5, MUTED)

cy = card(x3, y2, col3, 250, "ARCHIVOS PARA ABRIR EN CLASE", "#0f766e")
files = [
    ("components/ChatApp.tsx", "UI, micrófono, consumo del stream"),
    ("components/ArchitectureFlow.tsx", "los 10 nodos didácticos"),
    ("app/api/chat/route.ts", "puerta HTTP y NDJSON"),
    ("lib/agent.ts", "prompt, tool y ciclo con Claude"),
    ("lib/rag.ts · lib/corpus.ts", "la función ejecutable"),
    ("lib/text.ts", "score léxico y parseo de bloques"),
    ("lib/text.test.ts", "pruebas con node:test"),
]
for name, desc in files:
    text(x3 + 18, cy, name, 12.5, INK, "600", family=MONO)
    text(x3 + 18, cy + 17, desc, 12, FAINT)
    cy += 40

# ---------------------------------------------------------------- cierre
y3 = y2 + 250 + 30
rect(M, y3, W - 2 * M, 84, "#0f172a", rx=12)
text(M + 26, y3 + 34, "Una función, un corpus, un stream.", 17, "#ffffff", "700")
text(M + 26, y3 + 60, "El navegador no piensa: envía mensajes. Claude no ejecuta la herramienta: la pide. El servidor la corre y guarda el secreto.", 14, "#cbd5e1")
text(W - M - 26, y3 + 34, "github.com/cristianvirtus/tecno-chatbot-portal", 13, "#94a3b8", "500", "end", family=MONO)
text(W - M - 26, y3 + 60, "tecno-chatbot-portal.vercel.app", 13, "#5eead4", "600", "end", family=MONO)

add("</svg>")

path = Path(__file__).resolve().parent / "arquitectura-nodi.svg"
path.write_text("\n".join(out), encoding="utf-8")
print(f"{path}  ·  alto usado hasta y={y3 + 84}")
