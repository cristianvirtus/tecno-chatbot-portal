"""Genera docs/flujo-nodi.svg: infografía de flujo con íconos, stack y DevOps.

Uso: python3 docs/generar-flujo.py && rsvg-convert -w 1800 docs/flujo-nodi.svg -o docs/flujo-nodi.png
"""

from pathlib import Path
from xml.sax.saxutils import escape

W, H = 1800, 1250
FONT = "Helvetica Neue, Helvetica, Arial, sans-serif"
MONO = "SF Mono, Menlo, Consolas, monospace"

INK = "#0f172a"
MUTED = "#475569"
FAINT = "#8a99ad"
LINE = "#d3dbe6"
PAPER = "#ffffff"

BLUE, BLUE_BG = "#0369a1", "#e8f4fd"
TEAL, TEAL_BG = "#0f766e", "#e6faf6"
PURPLE, PURPLE_BG = "#6d28d9", "#f2ecfe"
AMBER, AMBER_BG = "#b45309", "#fef4e2"
SLATE, SLATE_BG = "#334155", "#eef2f7"

out: list[str] = []


def add(s: str) -> None:
    out.append(s)


NARROW = set("iljtfr.,:;'|!()[]{} ")
WIDE = set("mwMW@")


def measure(s: str, size: float) -> float:
    u = 0.0
    for ch in s:
        if ch in NARROW:
            u += 0.30
        elif ch in WIDE:
            u += 0.85
        elif ch.isupper() or ch.isdigit():
            u += 0.62
        else:
            u += 0.53
    return u * size


def wrap(s: str, size: float, max_w: float) -> list[str]:
    lines, cur = [], ""
    for word in s.split(" "):
        cand = f"{cur} {word}".strip()
        if cur and measure(cand, size) > max_w:
            lines.append(cur)
            cur = word
        else:
            cur = cand
    if cur:
        lines.append(cur)
    return lines


def text(x, y, s, size=14, fill=INK, weight="400", anchor="start", family=FONT):
    add(
        f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" fill="{fill}" '
        f'font-weight="{weight}" text-anchor="{anchor}">{escape(s)}</text>'
    )


def rect(x, y, w, h, fill=PAPER, stroke=None, rx=10, sw=1.2):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{st}/>')


# ------------------------------------------------------------------ íconos
STROKE_ICONS = {
    "mic": '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/>'
           '<line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>',
    "monitor": '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>'
               '<line x1="12" y1="17" x2="12" y2="21"/>',
    "server": '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>'
              '<line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    "file": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
            '<polyline points="14 2 14 8 20 8"/><line x1="15" y1="13" x2="9" y2="13"/>'
            '<line x1="15" y1="17" x2="9" y2="17"/>',
    "tool": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91'
            'a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    "search": '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>'
                '<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    "zap": '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    "speaker": '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
               '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    "code": '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    "branch": '<line x1="6" y1="4" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>'
              '<path d="M18 9a9 9 0 0 1-9 9"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/>'
             '<path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z"/>',
    "cloud": '<path d="M18 18H7A5 5 0 1 1 8.7 8.3 7 7 0 1 1 18 18z"/>',
    "key": '<circle cx="7.5" cy="16.5" r="4"/><path d="M10.4 13.6L20 4"/><path d="M17 7l3 3"/><path d="M14.5 9.5l3 3"/>',
    "check": '<path d="M22 11v1a10 10 0 1 1-5.9-9.1"/><polyline points="22 4 12 14 9 11"/>',
    "layout": '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>'
              '<line x1="9" y1="21" x2="9" y2="9"/>',
    "cpu": '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/>'
           '<line x1="9" y1="2" x2="9" y2="5"/><line x1="15" y1="2" x2="15" y2="5"/>'
           '<line x1="9" y1="19" x2="9" y2="22"/><line x1="15" y1="19" x2="15" y2="22"/>'
           '<line x1="19" y1="9" x2="22" y2="9"/><line x1="19" y1="15" x2="22" y2="15"/>'
           '<line x1="2" y1="9" x2="5" y2="9"/><line x1="2" y1="15" x2="5" y2="15"/>',
    "sparkle": '<path d="M12 2v20"/><path d="M2 12h20"/><path d="M5 5l14 14"/><path d="M19 5L5 19"/>',
    "refresh": '<polyline points="21 4 21 10 15 10"/><path d="M20 14a8 8 0 1 1-2-8l3 4"/>',
    "terminal": '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
}


def icon(name, cx, cy, color, size=22, sw=1.8):
    s = size / 24
    add(
        f'<g transform="translate({cx - size / 2},{cy - size / 2}) scale({s})" fill="none" stroke="{color}" '
        f'stroke-width="{sw / s * 0.9:.2f}" stroke-linecap="round" stroke-linejoin="round">'
        f'{STROKE_ICONS[name]}</g>'
    )


def vercel_mark(cx, cy, size, color=INK):
    h = size * 0.5
    add(f'<polygon points="{cx},{cy - h} {cx + size * 0.58},{cy + h * 0.72} {cx - size * 0.58},{cy + h * 0.72}" fill="{color}"/>')


def github_mark(cx, cy, size, color=INK):
    r = size / 2
    add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}"/>')
    add(
        f'<g transform="translate({cx - r * 0.62},{cy - r * 0.62}) scale({r * 1.24 / 24})" fill="none" '
        f'stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'
        f'{STROKE_ICONS["branch"]}</g>'
    )


def chip(x, y, label, fg, bg, size=11):
    w = measure(label, size) + 18
    rect(x, y, w, 21, bg, rx=10.5, sw=0)
    text(x + w / 2, y + 14.5, label, size, fg, "600", "middle")
    return w + 7


def arrow(x1, y1, x2, y2, color=FAINT, dash=None, sw=2.0, marker="arrow"):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    add(
        f'<path d="M {x1} {y1} L {x2} {y2}" stroke="{color}" stroke-width="{sw}" fill="none"{d} '
        f'marker-end="url(#{marker})"/>'
    )


# ------------------------------------------------------------------ lienzo
add('<?xml version="1.0" encoding="UTF-8"?>')
add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
add(f'<rect width="{W}" height="{H}" fill="{PAPER}"/>')
add(
    '<defs>'
    f'<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" '
    f'orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{FAINT}"/></marker>'
    f'<marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" '
    f'orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{PURPLE}"/></marker>'
    f'<marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" '
    f'orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{BLUE}"/></marker>'
    f'<marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" '
    f'orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{AMBER}"/></marker>'
    '</defs>'
)

M = 60
NW, GAP = 316, 25
col = [M + i * (NW + GAP) for i in range(5)]

# ------------------------------------------------------------------ encabezado
add(f'<rect x="0" y="0" width="{W}" height="7" fill="{TEAL}"/>')
text(M, 68, "Nodi de punta a punta", 36, INK, "700")
text(M, 98, "Cómo se entrega el código y cómo viaja una pregunta. Stack completo en cada paso.", 16, MUTED)

legend = [("Navegador", BLUE), ("Servidor Next.js", TEAL), ("Claude (Anthropic)", PURPLE), ("Entrega / DevOps", AMBER)]
lx = W - M
for name, color in reversed(legend):
    tw = measure(name, 12.5)
    text(lx, 74, name, 12.5, MUTED, "600", "end")
    add(f'<circle cx="{lx - tw - 14}" cy="{70}" r="6" fill="{color}"/>')
    lx -= tw + 34

# ------------------------------------------------------------------ banda DevOps
ay = 150
text(M, ay, "CICLO DE ENTREGA  ·  del editor a la nube", 15, AMBER, "700")
text(M + 340, ay, "un push a main basta: Vercel construye y publica solo", 13, FAINT)

ay += 16
DH = 116
devops = [
    ("code", "Local", "Escribes y pruebas con npm run dev.", ["Node 20", "npm"]),
    ("branch", "Git", "Commit y push a la rama main.", ["git"]),
    ("github", "GitHub", "Repositorio tecno-chatbot-portal.", ["historial", "webhook"]),
    ("vercel", "Vercel build", "Detecta Next.js, instala e inyecta variables.", ["next build"]),
    ("globe", "Producción", "URL pública con HTTPS y CDN global.", ["deploy por push"]),
]
for i, (ic, title, detail, chips) in enumerate(devops):
    x = col[i]
    rect(x, ay, NW, DH, "#fffdf7", "#f0d9ae", rx=14)
    add(f'<circle cx="{x + 40}" cy="{ay + 40}" r="20" fill="{AMBER_BG}"/>')
    if ic == "vercel":
        vercel_mark(x + 40, ay + 40, 20, INK)
    elif ic == "github":
        github_mark(x + 40, ay + 40, 26, INK)
    else:
        icon(ic, x + 40, ay + 40, AMBER, 21)
    text(x + 72, ay + 46, title, 16.5, INK, "700")
    ty = ay + 72
    for line in wrap(detail, 12.5, NW - 40):
        text(x + 20, ty, line, 12.5, MUTED)
        ty += 17
    cx = x + 20
    for c in chips:
        cx += chip(cx, ay + DH - 30, c, AMBER, AMBER_BG)
    if i < len(devops) - 1:
        arrow(x + NW + 4, ay + DH / 2, col[i + 1] - 5, ay + DH / 2, AMBER, marker="arrow-amber")

# ------------------------------------------------------------------ banda runtime
by = ay + DH + 54
text(M, by, "CICLO DE UNA PREGUNTA  ·  los 10 pasos que se iluminan en la demo", 15, TEAL, "700")

by += 16
RH = 190
r2 = by + RH + 88

nodes = [
    # (icono, color, fondo, título, detalle, chips, columna, fila)
    ("mic", BLUE, BLUE_BG, "Usuario", "Escribe la pregunta o la dicta con el micrófono.",
     ["Web Speech · STT"], 0, 0),
    ("monitor", BLUE, BLUE_BG, "Navegador", "ChatApp arma el historial y llama a la API.",
     ["Next.js 15", "React 19", "Tailwind"], 1, 0),
    ("server", TEAL, TEAL_BG, "API route", "POST /api/chat valida el JSON y abre el stream.",
     ["Route Handler", "Node runtime"], 2, 0),
    ("file", TEAL, TEAL_BG, "Prompt + agente", "Rol, límite “solo tech” y la definición de la única tool.",
     ["TypeScript", "SDK Anthropic"], 3, 0),
    ("sparkle", PURPLE, PURPLE_BG, "Claude decide", "Responde directo o pide la herramienta.",
     ["Haiku 4.5", "tool use"], 4, 0),
    ("tool", TEAL, TEAL_BG, "Tool use", "Node ejecuta consultar_conocimiento_tech.",
     ["una sola función"], 4, 1),
    ("search", TEAL, TEAL_BG, "RAG local", "Chunks y score léxico: devuelve los 4 mejores.",
     ["sin embeddings"], 3, 1),
    ("database", TEAL, TEAL_BG, "Corpus", "10 documentos de tecnología curados a mano.",
     ["knowledge/", "Markdown", "caché"], 2, 1),
    ("zap", PURPLE, PURPLE_BG, "Redacción + stream", "Claude escribe con los fragmentos; sale token a token.",
     ["NDJSON", "ReadableStream"], 1, 1),
    ("speaker", BLUE, BLUE_BG, "Render + voz", "Markdown, temas, infografía y avatar que lee el resumen.",
     ["react-markdown", "Web Speech · TTS"], 0, 1),
]

pos = {}
for n, (ic, color, bg, title, detail, chips, c, row) in enumerate(nodes, start=1):
    x, y = col[c], by if row == 0 else r2
    pos[n] = (x, y)
    rect(x, y, NW, RH, PAPER, LINE, rx=14)
    add(f'<rect x="{x}" y="{y}" width="{NW}" height="6" rx="3" fill="{color}"/>')
    add(f'<circle cx="{x + 42}" cy="{y + 56}" r="24" fill="{bg}"/>')
    icon(ic, x + 42, y + 56, color, 24)
    add(f'<circle cx="{NW + x - 26}" cy="{y + 32}" r="14" fill="{color}"/>')
    text(NW + x - 26, y + 37, str(n), 13.5, "#ffffff", "700", "middle")
    text(x + 78, y + 62, title, 17, INK, "700")
    ty = y + 104
    for line in wrap(detail, 13, NW - 40):
        text(x + 20, ty, line, 13, MUTED)
        ty += 18
    cx = x + 20
    for c_ in chips:
        cx += chip(cx, y + RH - 34, c_, color, bg)

# flechas fila 1 (izquierda a derecha) y fila 2 (derecha a izquierda)
for a, b in [(1, 2), (2, 3), (3, 4), (4, 5)]:
    arrow(pos[a][0] + NW + 4, by + RH / 2, pos[b][0] - 5, by + RH / 2)
for a, b in [(6, 7), (7, 8), (8, 9), (9, 10)]:
    arrow(pos[a][0] - 4, r2 + RH / 2, pos[b][0] + NW + 5, r2 + RH / 2)

mid = by + RH + 40

# bajada de Claude a la herramienta
arrow(pos[5][0] + NW / 2 - 70, by + RH + 4, pos[6][0] + NW / 2 - 70, r2 - 6, TEAL, marker="arrow")
text(pos[5][0] + NW / 2 - 80, mid + 26, "pide la herramienta", 12.5, TEAL, "600", "end")

# el resultado del corpus regresa al modelo
sx = pos[8][0] + NW / 2 + 40
ex = pos[5][0] + NW / 2 + 70
add(
    f'<path d="M {sx} {r2 - 4} V {mid} H {ex} V {by + RH + 6}" stroke="{PURPLE}" stroke-width="2" '
    f'stroke-dasharray="7 5" fill="none" marker-end="url(#arrow-purple)"/>'
)
text(sx + 14, mid - 10, "los fragmentos vuelven a Claude", 12.5, PURPLE, "600")

# la respuesta vuelve al usuario
add(
    f'<path d="M {pos[10][0] + NW / 2 - 40} {r2 - 4} V {by + RH + 6}" stroke="{BLUE}" stroke-width="2" '
    f'fill="none" marker-end="url(#arrow-blue)"/>'
)
text(pos[10][0] + NW / 2 - 30, mid - 10, "la respuesta llega al usuario", 12.5, BLUE, "600")

# nota de rechazo
note_y = r2 + RH + 22
rect(M, note_y, 1680, 44, SLATE_BG, LINE, rx=10)
icon("key", M + 30, note_y + 22, SLATE, 18)
text(M + 52, note_y + 27, "La ANTHROPIC_API_KEY solo existe en el servidor y en Vercel.", 13, INK, "600")
add(f'<circle cx="{M + 640}" cy="{note_y + 22}" r="4" fill="{FAINT}"/>')
text(M + 656, note_y + 27, "Si la pregunta no es de tecnología, Claude no llama la herramienta: los pasos 6, 7 y 8 se quedan apagados.", 13, MUTED)

# ------------------------------------------------------------------ stack
sy = note_y + 44 + 46
text(M, sy, "EL STACK, CAPA POR CAPA", 15, INK, "700")
sy += 16
SW_ = (1680 - 3 * 20) / 4
SHH = 176
groups = [
    ("layout", BLUE, BLUE_BG, "Interfaz", ["Next.js 15 · App Router", "React 19 + TypeScript 5", "Tailwind CSS 4", "react-markdown", "Avatar SVG animado"]),
    ("server", TEAL, TEAL_BG, "Servidor", ["Route Handler /api/chat", "Node.js 20", "ReadableStream (NDJSON)", "fs + caché del corpus", "Variables de entorno"]),
    ("cpu", PURPLE, PURPLE_BG, "Inteligencia", ["@anthropic-ai/sdk", "Claude Haiku 4.5", "Tool use (1 función)", "Prompt con límites", "RAG léxico propio"]),
    ("check", AMBER, AMBER_BG, "Calidad y entrega", ["node:test (lib/text)", "ESLint + tsc", "GitHub (main)", "Vercel (deploy por push)", "Web Speech, sin costo"]),
]
for i, (ic, color, bg, title, items) in enumerate(groups):
    x = M + i * (SW_ + 20)
    rect(x, sy, SW_, SHH, PAPER, LINE, rx=14)
    add(f'<circle cx="{x + 34}" cy="{sy + 34}" r="18" fill="{bg}"/>')
    icon(ic, x + 34, sy + 34, color, 19)
    text(x + 62, sy + 40, title, 15.5, color, "700")
    iy = sy + 70
    for item in items:
        add(f'<circle cx="{x + 24}" cy="{iy - 4}" r="2.5" fill="{color}"/>')
        text(x + 36, iy, item, 12.5, MUTED)
        iy += 21

# ------------------------------------------------------------------ pie
fy = sy + SHH + 26
rect(M, fy, 1680, 62, "#0f172a", rx=12)
text(M + 26, fy + 26, "Una herramienta, un corpus, un stream, un push.", 15.5, "#ffffff", "700")
text(M + 26, fy + 48, "El navegador pide, el servidor ejecuta y guarda el secreto, Claude decide, GitHub versiona y Vercel publica.", 13, "#c2ccda")
vercel_mark(W - M - 296, fy + 32, 16, "#ffffff")
text(W - M - 26, fy + 37, "tecno-chatbot-portal.vercel.app", 13, "#5eead4", "600", "end", family=MONO)

add("</svg>")

path = Path(__file__).resolve().parent / "flujo-nodi.svg"
path.write_text("\n".join(out), encoding="utf-8")
print(f"{path}  ·  alto usado hasta y={fy + 62}  (lienzo {H})")
