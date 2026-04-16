/**
 * Book Ingestion Script
 *
 * Reads ThePharaohsPitch PDF, chunks it by chapter with semantic splits,
 * embeds with Voyage AI, and upserts to Pinecone.
 *
 * Usage:
 *   npx tsx scripts/ingest-book.ts <path-to-pdf>
 *
 * Requires env vars: VOYAGE_API_KEY, PINECONE_API_KEY, PINECONE_INDEX
 */

import { config } from "dotenv";
import { readFileSync } from "fs";
import { Pinecone } from "@pinecone-database/pinecone";

config({ path: ".env.local" });

// ── Principle mapping ──
const CHAPTER_PRINCIPLES: Record<number, string> = {
  1: "purpose",
  2: "visioning",
  3: "knowledge",
  4: "kindness",
  5: "leadership",
  6: "trust",
  7: "emotional",
};

// ── Config ──
const CHUNK_SIZE = 500; // target tokens per chunk (~4 chars/token)
const CHUNK_OVERLAP = 50; // overlap in tokens
const VOYAGE_MODEL = "voyage-3";
const VOYAGE_BATCH_SIZE = 5; // Small batches to stay under free-tier 10K TPM limit
const PINECONE_NAMESPACE = "pharaohs-pitch";

// ── PDF text extraction ──
async function extractTextFromPdf(pdfPath: string): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  let fullText = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += `\n[PAGE ${i}]\n${pageText}`;
  }

  return fullText;
}

// ── Chapter splitting ──
interface RawChapter {
  chapter: number;
  title: string;
  text: string;
  startPage: number;
  endPage: number;
}

function splitIntoChapters(text: string): RawChapter[] {
  const chapters: RawChapter[] = [];

  // Fallback: split by page markers and look for chapter headings
  const pages = text.split(/\[PAGE (\d+)\]/);
  let currentChapter = 0;
  let currentTitle = "Introduction";
  let currentText = "";
  let startPage = 1;

  for (let i = 1; i < pages.length; i += 2) {
    const pageNum = parseInt(pages[i], 10);
    const pageText = pages[i + 1] || "";

    // Check for chapter heading
    const chapterMatch = pageText.match(/(?:CHAPTER|Chapter)\s+(\d+)[:\s]*(.*?)(?:\n|$)/);
    if (chapterMatch) {
      // Save previous chapter
      if (currentText.trim()) {
        chapters.push({
          chapter: currentChapter,
          title: currentTitle,
          text: currentText.trim(),
          startPage,
          endPage: pageNum - 1,
        });
      }
      currentChapter = parseInt(chapterMatch[1], 10);
      currentTitle = chapterMatch[2]?.trim() || `Chapter ${currentChapter}`;
      currentText = pageText;
      startPage = pageNum;
    } else {
      currentText += " " + pageText;
    }
  }

  // Push last chapter
  if (currentText.trim()) {
    chapters.push({
      chapter: currentChapter,
      title: currentTitle,
      text: currentText.trim(),
      startPage,
      endPage: parseInt(pages[pages.length - 2] || "0", 10),
    });
  }

  // If no chapters detected, treat entire text as single doc
  if (chapters.length === 0) {
    chapters.push({
      chapter: 0,
      title: "Full Book",
      text: text.replace(/\[PAGE \d+\]/g, "").trim(),
      startPage: 1,
      endPage: 999,
    });
  }

  return chapters;
}

// ── Semantic chunking ──
interface Chunk {
  id: string;
  text: string;
  chapter: number;
  principle: string;
  section: string;
  pageRange: string;
}

function chunkText(chapters: RawChapter[]): Chunk[] {
  const chunks: Chunk[] = [];
  const charPerToken = 4;

  for (const chapter of chapters) {
    const principle = CHAPTER_PRINCIPLES[chapter.chapter] || "general";
    const sentences = chapter.text.split(/(?<=[.!?])\s+/);

    let currentChunk = "";
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const combined = currentChunk ? currentChunk + " " + sentence : sentence;
      const tokenEstimate = combined.length / charPerToken;

      if (tokenEstimate > CHUNK_SIZE && currentChunk) {
        chunks.push({
          id: `ch${chapter.chapter}-${chunkIndex}`,
          text: currentChunk.trim(),
          chapter: chapter.chapter,
          principle,
          section: chapter.title,
          pageRange: `${chapter.startPage}-${chapter.endPage}`,
        });
        chunkIndex++;

        // Overlap: keep last portion of previous chunk
        const overlapChars = CHUNK_OVERLAP * charPerToken;
        const overlapStart = Math.max(0, currentChunk.length - overlapChars);
        currentChunk = currentChunk.slice(overlapStart) + " " + sentence;
      } else {
        currentChunk = combined;
      }
    }

    // Push remaining text
    if (currentChunk.trim()) {
      chunks.push({
        id: `ch${chapter.chapter}-${chunkIndex}`,
        text: currentChunk.trim(),
        chapter: chapter.chapter,
        principle,
        section: chapter.title,
        pageRange: `${chapter.startPage}-${chapter.endPage}`,
      });
    }
  }

  return chunks;
}

// ── Voyage AI embedding ──
async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model: VOYAGE_MODEL,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

// ── Main ──
async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: npx tsx scripts/ingest-book.ts <path-to-pdf>");
    process.exit(1);
  }

  // Validate env
  for (const key of ["VOYAGE_API_KEY", "PINECONE_API_KEY", "PINECONE_INDEX"]) {
    if (!process.env[key]) {
      console.error(`Missing env var: ${key}`);
      process.exit(1);
    }
  }

  console.log("1/5 Extracting text from PDF...");
  const text = await extractTextFromPdf(pdfPath);
  console.log(`   Extracted ${text.length} characters`);

  console.log("2/5 Splitting into chapters...");
  const chapters = splitIntoChapters(text);
  console.log(`   Found ${chapters.length} chapters`);
  for (const ch of chapters) {
    console.log(`   - Ch.${ch.chapter}: "${ch.title}" (pp. ${ch.startPage}-${ch.endPage})`);
  }

  console.log("3/5 Chunking text...");
  const chunks = chunkText(chapters);
  console.log(`   Created ${chunks.length} chunks`);

  console.log("4/5 Embedding chunks with Voyage AI (rate-limited to 2 RPM)...");
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += VOYAGE_BATCH_SIZE) {
    const batch = chunks.slice(i, i + VOYAGE_BATCH_SIZE);
    const batchTexts = batch.map((c) => c.text);

    // Retry with backoff on rate limit errors
    let retries = 0;
    while (true) {
      try {
        const embeddings = await embedBatch(batchTexts);
        allEmbeddings.push(...embeddings);
        console.log(`   Embedded ${Math.min(i + VOYAGE_BATCH_SIZE, chunks.length)}/${chunks.length} chunks`);
        break;
      } catch (err: any) {
        if (err.message?.includes("429") && retries < 5) {
          retries++;
          const waitSec = 35 * retries;
          console.log(`   Rate limited — waiting ${waitSec}s (retry ${retries}/5)...`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
        } else {
          throw err;
        }
      }
    }

    // Wait 32s between batches to stay under 2 RPM
    if (i + VOYAGE_BATCH_SIZE < chunks.length) {
      console.log(`   Waiting 32s for rate limit...`);
      await new Promise((r) => setTimeout(r, 32000));
    }
  }

  console.log("5/5 Upserting to Pinecone...");
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX!);
  const ns = index.namespace(PINECONE_NAMESPACE);

  const vectors = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: allEmbeddings[i],
    metadata: {
      text: chunk.text,
      chapter: chunk.chapter,
      principle: chunk.principle,
      section: chunk.section,
      page_range: chunk.pageRange,
    },
  }));

  // Upsert in batches of 100
  for (let i = 0; i < vectors.length; i += 100) {
    const batch = vectors.slice(i, i + 100);
    await ns.upsert({ records: batch });
    console.log(`   Upserted ${Math.min(i + 100, vectors.length)}/${vectors.length} vectors`);
  }

  console.log("\nDone! Book ingested successfully.");
  console.log(`Total chunks: ${chunks.length}`);
  console.log(`Namespace: ${PINECONE_NAMESPACE}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
