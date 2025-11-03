import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { GeminiEmbeddings } from '../lib/embeddings/gemini.js';
import { LocalE5Embeddings } from '../lib/embeddings/local.js';
import { createMockChapter } from './helpers.js';

const mockChapter = createMockChapter();

describe('LocalE5Embeddings - Small', () => {
  let embeddings: LocalE5Embeddings;

  beforeEach(() => {
    embeddings = new LocalE5Embeddings('small');
  });

  afterAll(async () => {
    await embeddings.dispose();
  });

  it('should initialize', () => {
    expect(embeddings).toBeDefined();
  });

  it('should generate embedding for text', async () => {
    const embedding = await embeddings.generateEmbedding('test query');

    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
    expect(typeof embedding[0]).toBe('number');
  }, 120000); // 2 minutes for model download in CI

  it('should generate embeddings for chapters', async () => {
    const result = await embeddings.generateChapterEmbeddings([mockChapter]);

    expect(result).toHaveLength(1);
    expect(result[0].embedding).toBeDefined();
    expect(result[0].embedding?.length).toBeGreaterThan(0);
  }, 120000); // 2 minutes for model download in CI
});

describe('LocalE5Embeddings - Large', () => {
  let embeddings: LocalE5Embeddings;

  beforeEach(() => {
    embeddings = new LocalE5Embeddings('large');
  });

  afterAll(async () => {
    await embeddings.dispose();
  });

  it('should initialize', () => {
    expect(embeddings).toBeDefined();
  });

  it('should generate embedding for text', async () => {
    const embedding = await embeddings.generateEmbedding('test query');

    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
    expect(typeof embedding[0]).toBe('number');
  }, 300000); // 5 minutes for large model

  it('should generate embeddings for chapters', async () => {
    const result = await embeddings.generateChapterEmbeddings([mockChapter]);

    expect(result).toHaveLength(1);
    expect(result[0].embedding).toBeDefined();
    expect(result[0].embedding?.length).toBeGreaterThan(0);
  }, 300000);
});

describe('GeminiEmbeddings', () => {
  it('should initialize with API key', () => {
    const embeddings = new GeminiEmbeddings('test-key');
    expect(embeddings).toBeDefined();
  });

  // Note: Actual Gemini tests would require a real API key
  // and would make external API calls
});

describe('Provider Configuration', () => {
  it('should create e5-small provider', () => {
    const provider = new LocalE5Embeddings('small');
    expect(provider).toBeDefined();
  });

  it('should create e5-large provider', () => {
    const provider = new LocalE5Embeddings('large');
    expect(provider).toBeDefined();
  });

  it('should create gemini provider', () => {
    const provider = new GeminiEmbeddings('test-key');
    expect(provider).toBeDefined();
  });
});
