import { ChromaClient } from 'chromadb';

import type { EmbeddingChapter, SearchResult } from './types.js';

export class VectorDatabase {
  private client: ChromaClient;
  private collectionName: string;

  constructor(persistPath: string, collectionName: string) {
    this.client = new ChromaClient({ path: persistPath });
    this.collectionName = collectionName;
  }

  async addChapters(chapters: EmbeddingChapter[]): Promise<void> {
    const collection = await this.client.getOrCreateCollection({ name: this.collectionName });

    await collection.add({
      ids: chapters.map((c) => c.id),
      embeddings: chapters.map((c) => c.embedding!),
      metadatas: chapters.map((c) => {
        const meta: Record<string, string | number | boolean> = {};
        for (const [key, value] of Object.entries(c.metadata)) {
          if (value !== undefined) {
            meta[key] = value as string | number | boolean;
          }
        }
        return meta;
      }),
      documents: chapters.map((c) => c.content),
    });
  }

  async search(queryEmbedding: number[], maxResults: number): Promise<SearchResult[]> {
    const collection = await this.client.getCollection({ name: this.collectionName });

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: maxResults,
    });

    return results.ids[0].map((id, i) => ({
      id,
      metadata: results.metadatas?.[0]?.[i] as any,
      content: results.documents?.[0]?.[i] as string,
      similarity: 1 - (results.distances?.[0]?.[i] ?? 0),
    }));
  }

  async deleteChapter(id: string): Promise<void> {
    const collection = await this.client.getCollection({ name: this.collectionName });
    await collection.delete({ ids: [id] });
  }
}
