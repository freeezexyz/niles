import { Pinecone } from "@pinecone-database/pinecone";

let client: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!client) {
    client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return client;
}

export function getPineconeIndex() {
  const pc = getPineconeClient();
  return pc.index(process.env.PINECONE_INDEX || "niles-pharaohs-pitch");
}
