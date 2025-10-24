import { pipeline } from '@xenova/transformers';

import type { IEmbeddingsProvider } from './embeddings-provider.js';
import type { EmbeddingChapter } from './types.js';

export class LocalE5Embeddings implements IEmbeddingsProvider {
  private embedder: any;
  private modelName: string;

  constructor(modelSize: 'small' | 'large' = 'small') {
    this.modelName = `Xenova/multilingual-e5-${modelSize}`;
  }

  private async ensureLoaded() {
    if (!this.embedder) {
      this.embedder = await pipeline('feature-extraction', this.modelName);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.ensureLoaded();
    const result = await this.embedder(`query: ${text}`, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(result.data);
  }

  async generateChapterEmbeddings(chapters: EmbeddingChapter[]): Promise<EmbeddingChapter[]> {
    await this.ensureLoaded();

    return Promise.all(
      chapters.map(async (chapter) => {
        const result = await this.embedder(`passage: ${chapter.content}`, {
          pooling: 'mean',
          normalize: true,
        });
        return {
          ...chapter,
          embedding: Array.from(result.data),
        };
      }),
    );
  }
}
