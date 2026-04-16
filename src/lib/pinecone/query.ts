import { getPineconeIndex } from "./client";
import { embedQuery } from "@/lib/voyage/client";

export interface BookChunk {
  text: string;
  chapter: number;
  principle: string;
  section: string;
  pageRange: string;
  score: number;
}

export async function queryPinecone(
  query: string,
  options: {
    topK?: number;
    principleFilter?: string[];
  } = {}
): Promise<BookChunk[]> {
  const { topK = 5, principleFilter } = options;

  const queryEmbedding = await embedQuery(query);
  const index = getPineconeIndex();

  const filter = principleFilter?.length
    ? { principle: { $in: principleFilter } }
    : undefined;

  const results = await index.namespace("pharaohs-pitch").query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter,
  });

  return (results.matches || []).map((match) => ({
    text: (match.metadata?.text as string) || "",
    chapter: (match.metadata?.chapter as number) || 0,
    principle: (match.metadata?.principle as string) || "",
    section: (match.metadata?.section as string) || "",
    pageRange: (match.metadata?.page_range as string) || "",
    score: match.score || 0,
  }));
}

export function formatBookContext(chunks: BookChunk[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}: Ch.${chunk.chapter} — ${chunk.principle}${chunk.section ? ` / ${chunk.section}` : ""}${chunk.pageRange ? ` (pp. ${chunk.pageRange})` : ""}]\n${chunk.text}`
    )
    .join("\n\n");
}
