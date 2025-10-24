import type { EmbeddingChapter } from '../../lib/types.js';

export class MockEmbeddingsGenerator {
  async generateEmbedding(text: string): Promise<number[]> {
    // Generate deterministic fake embedding based on text
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array(1536)
      .fill(0)
      .map((_, i) => Math.sin(hash + i) * 0.5);
  }

  async generateChapterEmbeddings(chapters: EmbeddingChapter[]): Promise<EmbeddingChapter[]> {
    return Promise.all(
      chapters.map(async (chapter) => ({
        ...chapter,
        embedding: await this.generateEmbedding(chapter.content),
      })),
    );
  }
}
