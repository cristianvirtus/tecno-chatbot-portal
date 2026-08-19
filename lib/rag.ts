import { loadCorpusChunks } from "./corpus";
import { lexicalScore } from "./text";

export type RetrievedFragment = {
  titulo: string;
  contenido: string;
  fuente: string;
  score: number;
};

export async function consultarConocimientoTech(
  consulta: string,
): Promise<{ fragmentos: RetrievedFragment[]; aviso: string | null }> {
  const query = consulta.trim();
  if (!query) {
    return {
      fragmentos: [],
      aviso: "La consulta estaba vacía.",
    };
  }

  const fragmentos = loadCorpusChunks()
    .map((chunk) => ({
      titulo: chunk.title,
      contenido: chunk.content.slice(0, 1200),
      fuente: chunk.source,
      score: Number(lexicalScore(query, `${chunk.title} ${chunk.content}`).toFixed(4)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .filter((item) => item.score > 0);

  return {
    fragmentos,
    aviso: fragmentos.length
      ? null
      : "No hay fragmentos relevantes en la base local.",
  };
}
