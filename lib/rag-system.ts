import { type Connection, connect, type Table } from '@lancedb/lancedb';
import { GeminiEmbedding } from '@llamaindex/google';
import { HuggingFaceEmbedding } from '@llamaindex/huggingface';
import { Settings } from 'llamaindex';

import { NERExtractor } from './ner-extractor.js';
import type {
  ContextOptions,
  EmbeddingChapter,
  RAGConfig,
  SearchOptions,
  SearchResult,
} from './types.js';

interface LanceDBRow extends Record<string, unknown> {
  id: string;
  vector: number[];
  content: string;
  metadata: string; // JSON stringified
}

export class RAGSystem {
  private db?: Connection;
  private table?: Table;
  private nerExtractor: NERExtractor;
  private config: Required<Omit<RAGConfig, 'geminiApiKey' | 'openaiApiKey'>> & {
    geminiApiKey?: string;
    openaiApiKey?: string;
  };

  constructor(config: RAGConfig) {
    this.config = {
      dbPath: './lancedb',
      maxResults: 10,
      storeFullContent: true, // Default: store full content
      ...config,
    };

    this.nerExtractor = new NERExtractor();
    this.initializeSettings();
  }

  private initializeSettings(): void {
    // Configure embedding model
    switch (this.config.provider) {
      case 'gemini':
        if (!this.config.geminiApiKey) {
          throw new Error('Gemini API key required for gemini provider');
        }
        Settings.embedModel = new GeminiEmbedding({
          apiKey: this.config.geminiApiKey,
          // Default model is 'models/embedding-001' (gemini-embedding-001)
        });
        break;
      case 'openai':
        throw new Error('OpenAI provider not configured - use gemini or local');
      case 'e5-small':
        // Use HuggingFace local embeddings
        Settings.embedModel = new HuggingFaceEmbedding({
          modelType: 'intfloat/multilingual-e5-small',
        });
        break;
      case 'embeddinggemma':
        // Note: EmbeddingGemma may require special access or newer transformers.js version
        Settings.embedModel = new HuggingFaceEmbedding({
          modelType: 'google/embeddinggemma-300m',
        });
        break;
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  private async ensureTable(): Promise<Table> {
    if (this.table) return this.table;

    // Connect to LanceDB
    this.db = await connect(this.config.dbPath);

    // Check if table exists
    const tableNames = await this.db.tableNames();
    if (tableNames.includes('echoes_chapters')) {
      this.table = await this.db.openTable('echoes_chapters');
    }
    // Table will be created on first insert

    // Return undefined if table doesn't exist yet (will be created on first insert)
    return this.table as Table;
  }

  private async embed(text: string): Promise<number[]> {
    const embedModel = Settings.embedModel;
    if (!embedModel) {
      throw new Error('Embedding model not initialized');
    }
    const result = await embedModel.getTextEmbedding(text);
    return result;
  }

  private getStorageContent(fullContent: string): string {
    if (this.config.storeFullContent) {
      return fullContent;
    }
    // Store only first 500 chars as excerpt
    return fullContent.slice(0, 500) + (fullContent.length > 500 ? '...' : '');
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const table = await this.ensureTable();
    const maxResults = options.maxResults ?? this.config.maxResults;

    // Generate query embedding
    const queryEmbedding = await this.embed(query);

    // Search using LanceDB vector search
    const results = await table
      .vectorSearch(queryEmbedding)
      .limit(maxResults * 2) // Get more for filtering
      .toArray();

    // Filter and format results
    const filtered: SearchResult[] = [];

    for (const row of results) {
      const metadata = JSON.parse(row.metadata);

      // Apply metadata filters
      if (options.timeline && metadata.timelineName !== options.timeline) continue;
      if (options.arc && metadata.arcName !== options.arc) continue;
      if (options.pov && metadata.pov !== options.pov) continue;

      // Apply character filters
      if (options.characters) {
        const chapterChars = metadata.characterNames || [];
        if (options.allCharacters) {
          if (!options.characters.every((c) => chapterChars.includes(c))) continue;
        } else {
          if (!options.characters.some((c) => chapterChars.includes(c))) continue;
        }
      }

      // LanceDB returns distance (lower is better), convert to similarity (higher is better)
      // Distance is L2, convert to similarity score 0-1
      const distance = row._distance ?? 0;
      const similarity = 1 / (1 + distance);

      filtered.push({
        id: row.id,
        metadata,
        content: row.content,
        similarity,
      });

      if (filtered.length >= maxResults) break;
    }

    // Sort by similarity (already sorted by LanceDB, but ensure descending)
    filtered.sort((a, b) => b.similarity - a.similarity);

    return filtered;
  }

  async getContext(options: ContextOptions): Promise<SearchResult[]> {
    return this.search(options.query, {
      timeline: options.timeline,
      arc: options.arc,
      pov: options.pov,
      maxResults: options.maxChapters ?? 5,
      characters: options.characters,
    });
  }

  async addChapter(chapter: EmbeddingChapter): Promise<void> {
    // Extract characters if not present
    if (!chapter.metadata.characterNames) {
      chapter.metadata.characterNames = await this.nerExtractor.extractCharacters(chapter.content);
    }

    await this.ensureTable();

    // Generate embedding from FULL content
    const embedding = await this.embed(chapter.content);

    const row: LanceDBRow = {
      id: chapter.id,
      vector: embedding,
      content: this.getStorageContent(chapter.content),
      metadata: JSON.stringify(chapter.metadata),
    };

    // Create table if doesn't exist, or add to existing
    if (!this.table) {
      if (!this.db) throw new Error('Database not initialized');
      this.table = await this.db.createTable('echoes_chapters', [row]);
    } else {
      await this.table.add([row]);
    }
  }

  async addChapters(chapters: EmbeddingChapter[]): Promise<void> {
    // Extract characters for all chapters
    for (const chapter of chapters) {
      if (!chapter.metadata.characterNames) {
        chapter.metadata.characterNames = await this.nerExtractor.extractCharacters(
          chapter.content,
        );
      }
    }

    await this.ensureTable();

    // Generate embeddings for all chapters
    const rows: LanceDBRow[] = [];
    for (const chapter of chapters) {
      const embedding = await this.embed(chapter.content);
      rows.push({
        id: chapter.id,
        vector: embedding,
        content: this.getStorageContent(chapter.content),
        metadata: JSON.stringify(chapter.metadata),
      });
    }

    // Create table if doesn't exist, or add to existing
    if (!this.table) {
      if (!this.db) throw new Error('Database not initialized');
      this.table = await this.db.createTable('echoes_chapters', rows);
    } else {
      await this.table.add(rows);
    }
  }

  async deleteChapter(id: string): Promise<void> {
    const table = await this.ensureTable();
    await table.delete(`id = "${id}"`);
  }

  async getCharacterMentions(characterName: string): Promise<string[]> {
    const chapters = await this.search(characterName, { maxResults: 1000 });
    const allCharacters = new Set<string>();

    for (const chapter of chapters) {
      const characters = chapter.metadata.characterNames || [];
      for (const char of characters) {
        if (char !== characterName) {
          allCharacters.add(char);
        }
      }
    }

    return Array.from(allCharacters);
  }
}
