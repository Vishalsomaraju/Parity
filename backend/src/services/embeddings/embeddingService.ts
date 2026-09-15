import crypto from 'crypto';
import { getConfig } from '../../config/env';

// ─── In-process embedding cache (LRU-style, 256 entries) ────────────────────
const CACHE_MAX = 256;
const embeddingCache = new Map<string, number[]>();

function getCached(text: string): number[] | undefined {
  const key = text.slice(0, 256); // only cache first 256 chars as key
  return embeddingCache.get(key);
}

function setCached(text: string, vector: number[]): void {
  const key = text.slice(0, 256);
  if (embeddingCache.size >= CACHE_MAX) {
    // Evict oldest entry
    const firstKey = embeddingCache.keys().next().value;
    if (firstKey !== undefined) embeddingCache.delete(firstKey);
  }
  embeddingCache.set(key, vector);
}

/** Clear the embedding cache — used in tests */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

/**
 * Generate a 768-dimensional embedding vector for text.
 * Uses live Gemini embeddings if available; otherwise falls back
 * to a deterministic normalized term-frequency semantic vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const cached = getCached(text);
  if (cached) return cached;

  const config = getConfig();

  if (config.GEMINI_API_KEY && config.GEMINI_API_KEY !== 'none') {
    try {
      const liveVector = await fetchGeminiEmbedding(text, config.GEMINI_API_KEY);
      if (liveVector && liveVector.length === 768) {
        setCached(text, liveVector);
        return liveVector;
      }
    } catch {
      // Degrade to deterministic vector
    }
  }

  const det = generateDeterministicVector(text, 768);
  setCached(text, det);
  return det;
}

/**
 * Generate embeddings for multiple texts in parallel.
 * Shares the same cache and falls back to deterministic vectors.
 * Much faster than calling generateEmbedding() sequentially in a loop.
 */
export async function generateEmbeddingBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  return Promise.all(texts.map((t) => generateEmbedding(t)));
}

/**
 * Fetch embedding from Gemini embedding endpoint
 */
async function fetchGeminiEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text: text.slice(0, 2048) }] },
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.embedding?.values || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Deterministic pseudo-semantic vector generator (L2-normalized 768-dim float vector)
 * Produces consistent cosine similarity scores based on n-gram overlapping.
 */
export function generateDeterministicVector(text: string, dimensions = 768): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    vector[0] = 1.0;
    return vector;
  }

  // Distribute tokens into dimensional buckets using hash seeds
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const hash = crypto.createHash('md5').update(token).digest();
    for (let j = 0; j < 4; j++) {
      const bucket = hash.readUInt16LE(j * 2) % dimensions;
      const sign = (hash[j * 4] % 2 === 0 ? 1 : -1) * (1 / Math.sqrt(tokens.length));
      vector[bucket] += sign;
    }
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  } else {
    vector[0] = 1.0;
  }

  return vector;
}

/**
 * Compute cosine similarity between two vectors: (A . B) / (||A|| * ||B||)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const similarity = dotProduct / denominator;
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, similarity));
}
