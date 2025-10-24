import OpenAI from 'openai';

import type { EmbeddingChapter } from './types.js';

export class EmbeddingsGenerator {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'text-embedding-3-small') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text,
    });
    return response.data[0].embedding;
  }

  async generateChapterEmbeddings(chapters: EmbeddingChapter[]): Promise<EmbeddingChapter[]> {
    const texts = chapters.map((c) => c.content);
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: texts,
    });

    return chapters.map((chapter, i) => ({
      ...chapter,
      embedding: response.data[i].embedding,
    }));
  }
}
