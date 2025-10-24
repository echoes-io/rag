import { GoogleGenerativeAI } from '@google/generative-ai';

import type { IEmbeddingsProvider } from './embeddings-provider.js';
import type { EmbeddingChapter } from './types.js';

export class GeminiEmbeddings implements IEmbeddingsProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.model.embedContent(text);
    return result.embedding.values;
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
