import { describe, expect, it } from 'vitest';

import { createMockChapter } from './helpers.js';
import { MockEmbeddingsGenerator } from './mocks/embeddings.js';

describe('EmbeddingsGenerator', () => {
  const generator = new MockEmbeddingsGenerator();

  describe('generateEmbedding', () => {
    it('should generate embedding for text', async () => {
      const embedding = await generator.generateEmbedding('Hello world');

      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1536);
      expect(typeof embedding[0]).toBe('number');
    });

    it('should generate consistent embeddings', async () => {
      const text = 'The quick brown fox';
      const emb1 = await generator.generateEmbedding(text);
      const emb2 = await generator.generateEmbedding(text);

      expect(emb1).toEqual(emb2);
    });

    it('should generate different embeddings for different texts', async () => {
      const emb1 = await generator.generateEmbedding('First text');
      const emb2 = await generator.generateEmbedding('Second text');

      expect(emb1).not.toEqual(emb2);
    });
  });

  describe('generateChapterEmbeddings', () => {
    it('should generate embeddings for multiple chapters', async () => {
      const chapters = [
        createMockChapter({ title: 'First chapter' }),
        createMockChapter({ title: 'Second chapter', number: 2, chapter: 2 }),
      ];

      const result = await generator.generateChapterEmbeddings(chapters);

      expect(result).toHaveLength(2);
      expect(result[0].embedding).toBeDefined();
      expect(result[1].embedding).toBeDefined();
      expect(result[0].embedding?.length).toBe(1536);
    });
  });
});
