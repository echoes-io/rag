import { GeminiEmbeddings } from './embeddings-gemini.js';
import { LocalE5Embeddings } from './embeddings-local.js';
import type { IEmbeddingsProvider } from './embeddings-provider.js';
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
  private config: Required<Omit<RAGConfig, 'geminiApiKey'>> & { geminiApiKey?: string };

  constructor(config: RAGConfig) {
    this.config = {
      chromaUrl: './chroma_data',
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

    const collectionName = 'echoes_timeline';
    this.vectorDb = new VectorDatabase(this.config.chromaUrl, collectionName);
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
