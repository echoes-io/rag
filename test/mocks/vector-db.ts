import type { EmbeddingChapter, SearchResult } from '../../lib/types.js';

export class MockVectorDatabase {
  private chapters: Map<string, EmbeddingChapter> = new Map();

  async addChapters(chapters: EmbeddingChapter[]): Promise<void> {
    for (const chapter of chapters) {
      this.chapters.set(chapter.id, chapter);
    }
  }

  async search(queryEmbedding: number[], maxResults: number): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const [id, chapter] of this.chapters) {
      if (!chapter.embedding) continue;

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(queryEmbedding, chapter.embedding);

      results.push({
        id,
        metadata: chapter.metadata,
        content: chapter.content,
        similarity,
      });
    }

    // Sort by similarity and limit
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, maxResults);
  }

  async deleteChapter(id: string): Promise<void> {
    this.chapters.delete(id);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
