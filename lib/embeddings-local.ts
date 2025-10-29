import { env, type FeatureExtractionPipeline, pipeline } from '@xenova/transformers';

import type { IEmbeddingsProvider } from './embeddings-provider.js';
import type { EmbeddingChapter } from './types.js';

export class LocalE5Embeddings implements IEmbeddingsProvider {
  private embedder: FeatureExtractionPipeline | null = null;
  private modelName: string;

  constructor(modelSize: 'small' | 'large' = 'small') {
    this.modelName = `Xenova/multilingual-e5-${modelSize}`;

    // Disable cache in CI to avoid corrupted downloads
    if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
      env.useBrowserCache = false;
      env.allowLocalModels = false;
    }
  }

  private async ensureLoaded() {
    if (!this.embedder) {
      this.embedder = await pipeline('feature-extraction', this.modelName);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.ensureLoaded();
    if (!this.embedder) throw new Error('Embedder not loaded');

    const result = await this.embedder(`query: ${text}`, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(result.data);
  }

  async generateChapterEmbeddings(chapters: EmbeddingChapter[]): Promise<EmbeddingChapter[]> {
    await this.ensureLoaded();
    if (!this.embedder) throw new Error('Embedder not loaded');

    const embedder = this.embedder;
    return Promise.all(
      chapters.map(async (chapter) => {
        const result = await embedder(`passage: ${chapter.content}`, {
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
