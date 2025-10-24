import { beforeEach, describe, expect, it } from 'vitest';

import type { EmbeddingChapter } from '../lib/types.js';
import { MockVectorDatabase } from './mocks/chroma.js';

describe('VectorDatabase', () => {
  let db: MockVectorDatabase;

  beforeEach(() => {
    db = new MockVectorDatabase();
  });

  describe('addChapters', () => {
    it('should add chapters with embeddings', async () => {
      const chapters: EmbeddingChapter[] = [
        {
          id: 'test-1',
          metadata: {
            timelineName: 'test',
            arcName: 'arc1',
            episodeNumber: 1,
            partNumber: 1,
            number: 1,
            pov: 'nic',
            title: 'Test',
            date: new Date(),
            excerpt: 'Test',
            location: 'Test',
            words: 100,
            characters: 500,
            charactersNoSpaces: 400,
            paragraphs: 5,
            sentences: 10,
            readingTimeMinutes: 1,
          },
          content: 'Test content',
          embedding: Array(1536).fill(0.1),
        },
      ];

      await expect(db.addChapters(chapters)).resolves.not.toThrow();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      const chapters: EmbeddingChapter[] = [
        {
          id: 'test-1',
          metadata: {
            timelineName: 'test',
            arcName: 'arc1',
            episodeNumber: 1,
            partNumber: 1,
            number: 1,
            pov: 'nic',
            title: 'First',
            date: new Date(),
            excerpt: 'First chapter',
            location: 'London',
            words: 100,
            characters: 500,
            charactersNoSpaces: 400,
            paragraphs: 5,
            sentences: 10,
            readingTimeMinutes: 1,
          },
          content: 'First chapter content',
          embedding: Array(1536).fill(0.1),
        },
        {
          id: 'test-2',
          metadata: {
            timelineName: 'test',
            arcName: 'arc1',
            episodeNumber: 1,
            partNumber: 1,
            number: 2,
            pov: 'partner',
            title: 'Second',
            date: new Date(),
            excerpt: 'Second chapter',
            location: 'Paris',
            words: 150,
            characters: 700,
            charactersNoSpaces: 600,
            paragraphs: 7,
            sentences: 15,
            readingTimeMinutes: 1,
          },
          content: 'Second chapter content',
          embedding: Array(1536).fill(0.2),
        },
      ];

      await db.addChapters(chapters);
    });

    it('should search and return results', async () => {
      const queryEmbedding = Array(1536).fill(0.15);
      const results = await db.search(queryEmbedding, 2);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBeDefined();
      expect(results[0].content).toBeDefined();
      expect(results[0].similarity).toBeDefined();
    });

    it('should limit results', async () => {
      const queryEmbedding = Array(1536).fill(0.15);
      const results = await db.search(queryEmbedding, 1);

      expect(results).toHaveLength(1);
    });
  });

  describe('deleteChapter', () => {
    beforeEach(async () => {
      const chapter: EmbeddingChapter = {
        id: 'test-delete',
        metadata: {
          timelineName: 'test',
          arcName: 'arc1',
          episodeNumber: 1,
          partNumber: 1,
          number: 1,
          pov: 'nic',
          title: 'Delete Test',
          date: new Date(),
          excerpt: 'Test',
          location: 'Test',
          words: 100,
          characters: 500,
          charactersNoSpaces: 400,
          paragraphs: 5,
          sentences: 10,
          readingTimeMinutes: 1,
        },
        content: 'Content to delete',
        embedding: Array(1536).fill(0.1),
      };

      await db.addChapters([chapter]);
    });

    it('should delete chapter', async () => {
      await expect(db.deleteChapter('test-delete')).resolves.not.toThrow();
    });
  });
});
