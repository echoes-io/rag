import { beforeAll, describe, expect, it, vi } from 'vitest';

import { RAGSystem } from '../lib/rag-system.js';
import type { EmbeddingChapter } from '../lib/types.js';

// Mock the E5 embeddings to avoid download timeout
vi.mock('../lib/embeddings-local.js', () => ({
  LocalE5Embeddings: class {
    async generateEmbedding(_text: string): Promise<number[]> {
      return new Array(384).fill(0).map(() => Math.random());
    }

    async generateChapterEmbeddings(chapters: EmbeddingChapter[]): Promise<EmbeddingChapter[]> {
      return chapters.map((chapter) => ({
        ...chapter,
        embedding: new Array(384).fill(0).map(() => Math.random()),
      }));
    }
  },
}));

const mockChapters: EmbeddingChapter[] = [
  {
    id: 'test-1',
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
      title: 'First Meeting',
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
    content: 'A passionate encounter in London changed everything.',
  },
  {
    id: 'test-2',
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
      pov: 'partner',
      title: 'Reflection',
      summary: 'Test summary',
      date: '2024-01-16',
      location: 'Paris',
      words: 100,
      characters: 500,
      charactersNoSpaces: 400,
      paragraphs: 5,
      sentences: 10,
      readingTimeMinutes: 1,
    },
    content: 'The romantic meeting in Paris was unforgettable.',
  },
];

describe('RAGSystem E2E', () => {
  let rag: RAGSystem;

  beforeAll(async () => {
    rag = new RAGSystem({
      provider: 'e5-small',
      dbPath: ':memory:',
    });
    await rag.addChapters(mockChapters);
  });

  it('should search and find similar content', async () => {
    const results = await rag.search('romantic encounter');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThan(0);
  });

  it('should filter by timeline', async () => {
    const results = await rag.search('meeting', { timeline: 'anima' });

    expect(results.every((r) => r.metadata.timelineName === 'anima')).toBe(true);
  });

  it('should filter by POV', async () => {
    const results = await rag.search('encounter', { pov: 'nic' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.metadata.pov === 'nic')).toBe(true);
  });

  it('should get context', async () => {
    const context = await rag.getContext({
      query: 'relationship',
      maxChapters: 2,
    });

    expect(context.length).toBeLessThanOrEqual(2);
    expect(context[0].content).toBeDefined();
  });

  it('should delete chapter', async () => {
    await rag.deleteChapter('test-1');

    const results = await rag.search('London', { maxResults: 10 });
    expect(results.find((r) => r.id === 'test-1')).toBeUndefined();
  });
});
