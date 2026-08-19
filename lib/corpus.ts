import fs from "node:fs";
import path from "node:path";
import type { CorpusDoc, KnowledgeChunk } from "./text";
import { chunkDocument } from "./text";

let cachedChunks: KnowledgeChunk[] | null = null;

export function loadCorpusChunks(): KnowledgeChunk[] {
  if (cachedChunks) {
    return cachedChunks;
  }
  const dir = path.join(process.cwd(), "knowledge");
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".md"));
  const docs: CorpusDoc[] = files.map((file) => {
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    const title = content.match(/^#\s+(.+)$/m)?.[1] ?? file;
    return { id: file, title, source: file, content };
  });
  cachedChunks = docs.flatMap(chunkDocument);
  return cachedChunks;
}
