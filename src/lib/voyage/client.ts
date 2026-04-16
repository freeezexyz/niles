const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";

export async function embedTexts(
  texts: string[],
  inputType: "document" | "query" = "query"
): Promise<number[][]> {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model: VOYAGE_MODEL,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text], "query");
  return embedding;
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  return embedTexts(texts, "document");
}
