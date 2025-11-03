import { GeminiEmbeddings } from './embeddings-gemini.js';
import { LocalE5Embeddings } from './embeddings-local.js';
import type { IEmbeddingsProvider } from './embeddings-provider.js';
import { NERExtractor } from './ner-extractor.js';
import type {
  ContextOptions,
  EmbeddingChapter,
  RAGConfig,
  SearchOptions,
  SearchResult,
} from './types.js';
import { VectorDatabase } from './vector-db.js';

export class RAGSystem {
  private embeddings: IEmbeddingsProvider;
  private vectorDb: VectorDatabase;
  private nerExtractor: NERExtractor;
  private config: Required<Omit<RAGConfig, 'geminiApiKey'>> & { geminiApiKey?: string };

  constructor(config: RAGConfig) {
    this.config = {
      dbPath: './rag.db',
      maxResults: 10,
      ...config,
    };

    // Initialize embeddings provider based on config
    switch (config.provider) {
      case 'gemini':
        if (!config.geminiApiKey) {
          throw new Error('Gemini API key required for gemini provider');
        }
        this.embeddings = new GeminiEmbeddings(config.geminiApiKey);
        break;
      case 'e5-small':
        this.embeddings = new LocalE5Embeddings('small');
        break;
      case 'e5-large':
        this.embeddings = new LocalE5Embeddings('large');
        break;
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }

    this.vectorDb = new VectorDatabase(this.config.dbPath);
    this.nerExtractor = new NERExtractor();
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
    if (options.characters) {
      results = results.filter((r) => {
        const chapterChars = r.metadata.characterNames || [];
        if (options.allCharacters) {
          // AND: all characters must be present
          return options.characters!.every((c) => chapterChars.includes(c));
        }
        // OR: at least one character must be present
        return options.characters!.some((c) => chapterChars.includes(c));
      });
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
    // Extract characters if not present
    if (!chapter.metadata.characterNames) {
      chapter.metadata.characterNames = await this.nerExtractor.extractCharacters(chapter.content);
    }

    const [withEmbedding] = await this.embeddings.generateChapterEmbeddings([chapter]);
    await this.vectorDb.addChapters([withEmbedding]);
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

    const withEmbeddings = await this.embeddings.generateChapterEmbeddings(chapters);
    await this.vectorDb.addChapters(withEmbeddings);
  }

  async deleteChapter(id: string): Promise<void> {
    await this.vectorDb.deleteChapter(id);
  }

  async getCharacterMentions(characterName: string): Promise<string[]> {
    const chapters = await this.search(characterName, { maxResults: 1000 });
    const allCharacters = new Set<string>();

    for (const chapter of chapters) {
      const characters = chapter.metadata.characterNames || [];
      for (const char of characters) {
        allCharacters.add(char);
      }
    }

    return Array.from(allCharacters);
  }
}
