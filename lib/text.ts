export type CorpusDoc = {
  id: string;
  title: string;
  source: string;
  content: string;
};

export type KnowledgeChunk = {
  id: string;
  title: string;
  source: string;
  content: string;
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

const SEARCH_STOP_WORDS = new Set([
  "que",
  "como",
  "cual",
  "cuales",
  "una",
  "uno",
  "unos",
  "unas",
  "para",
  "por",
  "con",
  "del",
  "las",
  "los",
  "este",
  "esta",
  "esto",
  "explica",
  "explicame",
]);

export function lexicalScore(query: string, document: string): number {
  const queryTokens = new Set(
    tokenize(query).filter((token) => !SEARCH_STOP_WORDS.has(token)),
  );
  if (queryTokens.size === 0) {
    return 0;
  }
  const docTokens = tokenize(document);
  if (docTokens.length === 0) {
    return 0;
  }
  let hits = 0;
  for (const token of docTokens) {
    if (queryTokens.has(token)) {
      hits += 1;
    }
  }
  return hits / Math.sqrt(docTokens.length);
}

export function chunkDocument(doc: CorpusDoc): KnowledgeChunk[] {
  const parts = doc.content.split(/\n(?=##\s)/);
  const chunks: KnowledgeChunk[] = [];
  parts.forEach((part, index) => {
    const text = part.trim();
    if (text.length < 40) {
      return;
    }
    const heading = text.match(/^##\s+(.+)$/m)?.[1] ?? doc.title;
    chunks.push({
      id: `${doc.id}#${index}`,
      title: heading.trim(),
      source: doc.source,
      content: text,
    });
  });
  return chunks.length > 0
    ? chunks
    : [{ id: `${doc.id}#0`, title: doc.title, source: doc.source, content: doc.content }];
}

const SUMMARY_RE = /<<<RESUMEN>>>\s*([\s\S]*?)\s*<<<FIN>>>/i;
const TOPICS_RE = /<<<TEMAS>>>\s*([\s\S]*?)\s*<<<FIN_TEMAS>>>/i;
const INFO_RE = /<<<INFOGRAFIA>>>\s*([\s\S]*?)\s*<<<FIN_INFO>>>/i;

export type InfographicKind = "pasos" | "comparacion" | "conceptos";

export type Infographic = {
  kind: InfographicKind;
  title: string;
  items: Array<{ title: string; text: string }>;
};

export type ParsedReply = {
  reply: string;
  summary: string;
  suggestions: string[];
  infographic: Infographic | null;
};

function parseSuggestions(block: string): string[] {
  return block
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 3 && line.length <= 120)
    .slice(0, 5);
}

function parseInfographic(block: string): Infographic | null {
  let kind: InfographicKind = "conceptos";
  let title = "";
  const items: Array<{ title: string; text: string }> = [];

  for (const line of block.split("\n")) {
    const clean = line.trim();
    if (!clean) {
      continue;
    }
    const kindMatch = clean.match(/^tipo\s*:\s*(pasos|comparacion|conceptos)$/i);
    if (kindMatch) {
      kind = kindMatch[1].toLowerCase() as InfographicKind;
      continue;
    }
    const titleMatch = clean.match(/^titulo\s*:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().slice(0, 80);
      continue;
    }
    const itemMatch = clean.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "");
    const [head, ...rest] = itemMatch.split("|");
    if (!head?.trim() || rest.length === 0) {
      continue;
    }
    items.push({
      title: head.trim().slice(0, 60),
      text: rest.join("|").trim().slice(0, 140),
    });
  }

  if (items.length < 2) {
    return null;
  }
  return { kind, title: title || "Resumen visual", items: items.slice(0, 6) };
}

export function parseReply(raw: string): ParsedReply {
  const infoMatch = raw.match(INFO_RE);
  const infographic = infoMatch ? parseInfographic(infoMatch[1]) : null;
  const withoutInfo = raw.replace(INFO_RE, "");

  const topicsMatch = withoutInfo.match(TOPICS_RE);
  const suggestions = topicsMatch ? parseSuggestions(topicsMatch[1]) : [];
  const withoutTopics = withoutInfo.replace(TOPICS_RE, "");

  const summaryMatch = withoutTopics.match(SUMMARY_RE);
  if (!summaryMatch) {
    const reply = withoutTopics.trim();
    const first = reply.split(/(?<=[.!?])\s+/)[0] ?? reply;
    return { reply, summary: first.slice(0, 220), suggestions, infographic };
  }

  return {
    reply: withoutTopics.replace(SUMMARY_RE, "").trim(),
    summary: summaryMatch[1].replace(/\s+/g, " ").trim().slice(0, 280),
    suggestions,
    infographic,
  };
}
