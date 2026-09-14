import {
  generateDeterministicVector,
  cosineSimilarity,
  generateEmbedding,
} from '../src/services/embeddings/embeddingService';

describe('Embedding Service Module', () => {
  it('generates 768-dimensional normalized vectors', () => {
    const vec = generateDeterministicVector('Payment shall be made within 30 days.');
    expect(vec.length).toBe(768);

    // Verify L2 norm is ~1.0
    let norm = 0;
    for (const val of vec) {
      norm += val * val;
    }
    expect(Math.abs(Math.sqrt(norm) - 1.0)).toBeLessThan(0.01);
  });

  it('handles empty text gracefully', () => {
    const vec = generateDeterministicVector('');
    expect(vec.length).toBe(768);
    expect(vec[0]).toBe(1.0);
  });

  it('computes cosine similarity accurately', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];

    expect(cosineSimilarity(v1, v2)).toBe(1.0);
    expect(cosineSimilarity(v1, v3)).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1, 0], [1, 0, 0])).toBe(0);
  });

  it('generateEmbedding returns 768-dim vector in fallback mode', async () => {
    const vec = await generateEmbedding('Confidentiality clause test');
    expect(vec.length).toBe(768);
  });
});
