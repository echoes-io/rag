import { rimraf } from 'rimraf';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { RAGSystem } from '../lib/rag-system.js';
import type { EmbeddingChapter } from '../lib/types.js';

describe('RAGSystem (real, no mocks)', () => {
  let rag: RAGSystem;
  const testDbPath = './test-lancedb';

  beforeAll(async () => {
    // Use real E5-small embeddings (local, no API key needed)
    rag = new RAGSystem({
      provider: 'e5-small',
      dbPath: testDbPath,
    });

    // Add test chapters
    const chapters: EmbeddingChapter[] = [
      {
        id: 'anima-01',
        metadata: {
          pov: 'nic',
          title: 'First Meeting',
          timeline: 'anima',
          timelineName: 'anima',
          arc: 'discovery',
          arcName: 'discovery',
          episode: 1,
          episodeNumber: 1,
          chapter: 1,
          number: 1,
          location: 'Rome',
          characters: 1000,
          charactersNoSpaces: 850,
          part: 1,
          partNumber: 1,
          words: 200,
          paragraphs: 2,
          sentences: 2,
          readingTimeMinutes: 1,
          summary: 'First meeting between Nic and Alex',
          date: '2024-01-01',
        },
        content: 'Nic met Alex for the first time in Rome. It was a sunny day.',
      },
      {
        id: 'anima-02',
        metadata: {
          pov: 'alex',
          title: 'Second Encounter',
          timeline: 'anima',
          timelineName: 'anima',
          arc: 'discovery',
          arcName: 'discovery',
          episode: 1,
          episodeNumber: 1,
          chapter: 2,
          number: 2,
          location: 'Rome',
          characters: 1200,
          charactersNoSpaces: 1000,
          part: 1,
          partNumber: 1,
          words: 240,
          paragraphs: 2,
          sentences: 2,
          readingTimeMinutes: 1,
          summary: 'Alex remembers the meeting',
          date: '2024-01-02',
        },
        content: 'Alex remembered the meeting with Nic. The conversation was intense.',
      },
      {
        id: 'eros-01',
        metadata: {
          pov: 'nic',
          title: 'Office Work',
          timeline: 'eros',
          timelineName: 'eros',
          arc: 'work',
          arcName: 'work',
          episode: 1,
          episodeNumber: 1,
          chapter: 1,
          number: 1,
          location: 'London',
          characters: 1500,
          charactersNoSpaces: 1250,
          part: 1,
          partNumber: 1,
          words: 300,
          paragraphs: 2,
          sentences: 2,
          readingTimeMinutes: 1,
          summary: 'Working on presentation',
          date: '2024-01-03',
        },
        content: 'Nic was working on a presentation in the London office. Deadline approaching.',
      },
    ];

    await rag.addChapters(chapters);
  });

  afterAll(async () => {
    // Cleanup test database
    await rimraf(testDbPath);
  });

  it('should search and find similar content', async () => {
    const results = await rag.search('meeting in Rome');

    expect(results.length).toBeGreaterThan(0);
    // Check that anima chapters are in results (both mention Rome/meeting)
    const animaResults = results.filter((r) => r.metadata.timelineName === 'anima');
    expect(animaResults.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThan(0.5);
  });

  it('should filter by timeline', async () => {
    const results = await rag.search('work', { timeline: 'eros' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.metadata.timelineName === 'eros')).toBe(true);
  });

  it('should filter by POV', async () => {
    const results = await rag.search('conversation', { pov: 'alex' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.metadata.pov === 'alex')).toBe(true);
  });

  it('should filter by arc', async () => {
    const results = await rag.search('meeting', { arc: 'discovery' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.metadata.arcName === 'discovery')).toBe(true);
  });

  it('should respect maxResults', async () => {
    const results = await rag.search('Rome London', { maxResults: 2 });

    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('should get context for AI', async () => {
    const context = await rag.getContext({
      query: 'relationship between characters',
      timeline: 'anima',
      maxChapters: 2,
    });

    expect(context.length).toBeLessThanOrEqual(2);
    expect(context.every((c) => c.metadata.timelineName === 'anima')).toBe(true);
  });

  it('should extract and filter by characters', async () => {
    const results = await rag.search('conversation', {
      characters: ['Nic', 'Alex'],
      allCharacters: false, // At least one
    });

    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      const chars = result.metadata.characterNames || [];
      const hasNicOrAlex = chars.includes('Nic') || chars.includes('Alex');
      expect(hasNicOrAlex).toBe(true);
    }
  });

  it('should get character mentions', async () => {
    const characters = await rag.getCharacterMentions('Nic');

    expect(characters).toContain('Alex');
  });

  it('should return results sorted by similarity', async () => {
    const results = await rag.search('Rome meeting sunny');

    expect(results.length).toBeGreaterThan(1);
    // Check descending order
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].similarity).toBeGreaterThanOrEqual(results[i + 1].similarity);
    }
  });

  it('should handle empty results gracefully', async () => {
    const results = await rag.search('nonexistent topic xyz123', {
      timeline: 'nonexistent',
    });

    expect(results).toEqual([]);
  });

  it('should delete chapter', async () => {
    // Delete one of the existing chapters
    await rag.deleteChapter('anima-01');

    // Verify it's gone
    const results = await rag.search('First Meeting');
    expect(results.some((r) => r.id === 'anima-01')).toBe(false);
  });
});
