import { beforeEach, describe, expect, it } from 'vitest';

import type {
  ContextOptions,
  EmbeddingChapter,
  RAGConfig,
  SearchOptions,
  SearchResult,
} from '../lib/types.js';
import { MockVectorDatabase } from './mocks/chroma.js';
import { MockEmbeddingsGenerator } from './mocks/embeddings.js';

// Simplified RAGSystem for testing with mocks
class TestRAGSystem {
  private embeddings: MockEmbeddingsGenerator;
  private vectorDb: MockVectorDatabase;
  private config: Required<RAGConfig>;

  constructor(config: RAGConfig) {
    this.config = {
      chromaUrl: './chroma_data',
      embeddingModel: 'text-embedding-3-small',
      maxResults: 10,
      ...config,
    };

    this.embeddings = new MockEmbeddingsGenerator();
    this.vectorDb = new MockVectorDatabase();
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddings.generateEmbedding(query);
    const maxResults = options.maxResults ?? this.config.maxResults;

    let results = await this.vectorDb.search(queryEmbedding, maxResults);

    if (options.timeline) {
      results = results.filter((r) => r.metadata.timelineName === options.timeline);
    }
    if (options.arc) {
      results = results.filter((r) => r.metadata.arcName === options.arc);
    }
    if (options.pov) {
      results = results.filter((r) => r.metadata.pov === options.pov);
    }

    return results;
  }

  async getContext(options: ContextOptions): Promise<SearchResult[]> {
    return this.search(options.query, {
      timeline: options.timeline,
      arc: options.arc,
      pov: options.pov,
      maxResults: options.maxChapters ?? 5,
    });
  }

  async addChapter(chapter: EmbeddingChapter): Promise<void> {
    const [withEmbedding] = await this.embeddings.generateChapterEmbeddings([chapter]);
    await this.vectorDb.addChapters([withEmbedding]);
  }

  async addChapters(chapters: EmbeddingChapter[]): Promise<void> {
    const withEmbeddings = await this.embeddings.generateChapterEmbeddings(chapters);
    await this.vectorDb.addChapters(withEmbeddings);
  }

  async deleteChapter(id: string): Promise<void> {
    await this.vectorDb.deleteChapter(id);
  }
}

const mockChapters: EmbeddingChapter[] = [
  {
    id: 'anima-1-1-1',
    metadata: {
      timelineName: 'anima',
      arcName: 'beginning',
      episodeNumber: 1,
      partNumber: 1,
      number: 1,
      pov: 'nic',
      title: 'First Meeting',
      date: new Date('2024-01-15'),
      excerpt: 'A passionate encounter',
      location: 'London',
      words: 1500,
      characters: 8000,
      charactersNoSpaces: 6500,
      paragraphs: 20,
      sentences: 75,
      readingTimeMinutes: 8,
    },
    content:
      'The passionate encounter in London changed everything. Their eyes met across the crowded room.',
  },
  {
    id: 'anima-1-1-2',
    metadata: {
      timelineName: 'anima',
      arcName: 'beginning',
      episodeNumber: 1,
      partNumber: 1,
      number: 2,
      pov: 'partner',
      title: 'Reflection',
      date: new Date('2024-01-16'),
      excerpt: 'Looking back',
      location: 'London',
      words: 1200,
      characters: 6500,
      charactersNoSpaces: 5200,
      paragraphs: 15,
      sentences: 60,
      readingTimeMinutes: 6,
    },
    content: 'Looking back at that moment, the connection was undeniable. Something had shifted.',
  },
];

describe('RAGSystem', () => {
  let rag: TestRAGSystem;

  beforeEach(() => {
    rag = new TestRAGSystem({
      openaiApiKey: 'mock-key',
    });
  });

  describe('addChapters', () => {
    it('should add chapters with embeddings', async () => {
      await rag.addChapters(mockChapters);

      const results = await rag.search('London encounter', { maxResults: 2 });
      expect(results).toHaveLength(2);
      expect(results[0].id).toBeDefined();
    });

    it('should add single chapter', async () => {
      await rag.addChapter(mockChapters[0]);

      const results = await rag.search('passionate', { maxResults: 1 });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('anima-1-1-1');
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await rag.addChapters(mockChapters);
    });

    it('should find semantically similar content', async () => {
      const results = await rag.search('romantic meeting in a city');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.content.includes('London'))).toBe(true);
    });

    it('should filter by timeline', async () => {
      const results = await rag.search('encounter', { timeline: 'anima' });

      expect(results.every((r) => r.metadata.timelineName === 'anima')).toBe(true);
    });

    it('should filter by pov', async () => {
      const results = await rag.search('moment', { pov: 'nic' });

      expect(results.every((r) => r.metadata.pov === 'nic')).toBe(true);
    });

    it('should limit results', async () => {
      const results = await rag.search('London', { maxResults: 1 });

      expect(results).toHaveLength(1);
    });

    it('should return similarity scores', async () => {
      const results = await rag.search('passionate encounter');

      expect(results[0].similarity).toBeGreaterThan(0);
      expect(results[0].similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('getContext', () => {
    beforeEach(async () => {
      await rag.addChapters(mockChapters);
    });

    it('should retrieve context for AI', async () => {
      const context = await rag.getContext({
        query: 'relationship development',
        maxChapters: 2,
      });

      expect(context).toHaveLength(2);
      expect(context[0].metadata).toBeDefined();
      expect(context[0].content).toBeDefined();
    });

    it('should filter context by timeline', async () => {
      const context = await rag.getContext({
        query: 'encounter',
        timeline: 'anima',
        maxChapters: 5,
      });

      expect(context.every((c) => c.metadata.timelineName === 'anima')).toBe(true);
    });
  });

  describe('deleteChapter', () => {
    beforeEach(async () => {
      await rag.addChapters(mockChapters);
    });

    it('should delete chapter from database', async () => {
      await rag.deleteChapter('anima-1-1-1');

      const results = await rag.search('passionate encounter', { maxResults: 10 });
      expect(results.find((r) => r.id === 'anima-1-1-1')).toBeUndefined();
    });
  });
});
