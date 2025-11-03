import { beforeAll, describe, expect, it } from 'vitest';

import { LocalE5Embeddings } from '../lib/embeddings-local.js';
import type { IEmbeddingsProvider } from '../lib/embeddings-provider.js';
import type {
  ContextOptions,
  EmbeddingChapter,
  SearchOptions,
  SearchResult,
} from '../lib/types.js';
import { MockVectorDatabase } from './mocks/chroma.js';

// Test RAGSystem using real embeddings but mock VectorDB
class TestRAGSystem {
  private embeddings: IEmbeddingsProvider;
  private vectorDb: MockVectorDatabase;
  private maxResults: number;

  constructor(provider: 'small' | 'large') {
    this.embeddings = new LocalE5Embeddings(provider);
    this.vectorDb = new MockVectorDatabase();
    this.maxResults = 10;
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddings.generateEmbedding(query);
    const maxResults = options.maxResults ?? this.maxResults;

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

const testChapters: EmbeddingChapter[] = [
  {
    id: 'ch1',
    metadata: {
      timelineName: 'anima',
      timeline: 'test',
      arcName: 'beginning',
      arc: 'arc1',
      episodeNumber: 1,
      episode: 1,
      partNumber: 1,
      part: 1,
      number: 1,
      chapter: 1,
      pov: 'nic',
      title: 'Romantic Encounter',
      summary: 'Test summary',
      date: '2024-01-15',
      location: 'London',
      words: 100,
      characters: 500,
      charactersNoSpaces: 400,
      paragraphs: 5,
      sentences: 10,
      readingTimeMinutes: 1,
    },
    content: 'Nic and Marie met in London for a romantic dinner. The chemistry was undeniable.',
  },
  {
    id: 'ch2',
    metadata: {
      timelineName: 'anima',
      timeline: 'test',
      arcName: 'beginning',
      arc: 'arc1',
      episodeNumber: 1,
      episode: 1,
      partNumber: 1,
      part: 1,
      number: 2,
      chapter: 1,
      pov: 'marie',
      title: 'Work Conflict',
      summary: 'Test summary',
      date: '2024-01-16',
      location: 'Office',
      words: 120,
      characters: 600,
      charactersNoSpaces: 480,
      paragraphs: 6,
      sentences: 12,
      readingTimeMinutes: 1,
    },
    content: 'Marie struggled with a difficult project at work. The deadline was approaching fast.',
  },
  {
    id: 'ch3',
    metadata: {
      timelineName: 'eros',
      timeline: 'test',
      arcName: 'middle',
      arc: 'arc1',
      episodeNumber: 2,
      episode: 1,
      partNumber: 1,
      part: 1,
      number: 1,
      chapter: 1,
      pov: 'nic',
      title: 'Decision Time',
      summary: 'Test summary',
      date: '2024-02-01',
      location: 'Home',
      words: 150,
      characters: 750,
      charactersNoSpaces: 600,
      paragraphs: 8,
      sentences: 15,
      readingTimeMinutes: 1,
    },
    content:
      'Nic had to make an important decision about his future. The choice would change everything.',
  },
];

describe('RAGSystem Integration Tests', () => {
  let rag: TestRAGSystem;

  beforeAll(async () => {
    // Use e5-small for faster tests
    rag = new TestRAGSystem('small');

    // Add test chapters
    await rag.addChapters(testChapters);
  }, 120000); // 2 minutes timeout

  describe('search', () => {
    it('should find romantic content', async () => {
      const results = await rag.search('romantic dinner');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('ch1');
      expect(results[0].similarity).toBeGreaterThan(0.5);
    });

    it('should find work-related content', async () => {
      const results = await rag.search('work project deadline');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('ch2');
    });

    it('should filter by timeline', async () => {
      const results = await rag.search('decision', { timeline: 'eros' });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.metadata.timelineName === 'eros')).toBe(true);
    });

    it('should filter by pov', async () => {
      const results = await rag.search('important', { pov: 'nic' });

      expect(results.every((r) => r.metadata.pov === 'nic')).toBe(true);
    });

    it('should limit results', async () => {
      const results = await rag.search('content', { maxResults: 2 });

      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getContext', () => {
    it('should retrieve context for AI', async () => {
      const context = await rag.getContext({
        query: 'relationship',
        maxChapters: 2,
      });

      expect(context.length).toBeLessThanOrEqual(2);
      expect(context[0].metadata).toBeDefined();
      expect(context[0].content).toBeDefined();
    });

    it('should filter context by timeline', async () => {
      const context = await rag.getContext({
        query: 'story',
        timeline: 'anima',
        maxChapters: 5,
      });

      expect(context.every((c) => c.metadata.timelineName === 'anima')).toBe(true);
    });
  });

  describe('addChapter', () => {
    it('should add single chapter', async () => {
      const newChapter: EmbeddingChapter = {
        id: 'ch4',
        metadata: {
          timelineName: 'bloom',
          timeline: 'test',
          arcName: 'end',
          arc: 'arc1',
          episodeNumber: 3,
          episode: 1,
          partNumber: 1,
          part: 1,
          number: 1,
          chapter: 1,
          pov: 'marie',
          title: 'New Beginning',
          summary: 'Test summary',
          date: '2024-03-01',
          location: 'Paris',
          words: 200,
          characters: 1000,
          charactersNoSpaces: 800,
          paragraphs: 10,
          sentences: 20,
          readingTimeMinutes: 1,
        },
        content: 'Marie started a new chapter in Paris. Everything felt fresh and exciting.',
      };

      await rag.addChapter(newChapter);

      const results = await rag.search('Paris fresh start');
      expect(results.some((r) => r.id === 'ch4')).toBe(true);
    });
  });

  describe('deleteChapter', () => {
    it('should delete chapter', async () => {
      await rag.deleteChapter('ch4');

      const results = await rag.search('Paris', { maxResults: 10 });
      expect(results.find((r) => r.id === 'ch4')).toBeUndefined();
    });
  });
});
