import type { EmbeddingChapter } from '../types.js';

export interface IEmbeddingsProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateChapterEmbeddings(chapters: EmbeddingChapter[]): Promise<EmbeddingChapter[]>;
}
