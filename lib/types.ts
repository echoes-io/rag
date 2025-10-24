import type { Chapter } from '@echoes-io/models';

export interface SearchOptions {
  timeline?: string;
  arc?: string;
  pov?: string;
  maxResults?: number;
}

export interface ContextOptions {
  query: string;
  timeline?: string;
  arc?: string;
  pov?: string;
  maxChapters?: number;
  includeMetadata?: boolean;
}

export interface SearchResult {
  id: string;
  metadata: Chapter;
  content: string;
  similarity: number;
}

export interface EmbeddingChapter {
  id: string;
  metadata: Chapter;
  content: string;
  embedding?: number[];
}

export interface RAGConfig {
  openaiApiKey: string;
  chromaUrl?: string;
  embeddingModel?: string;
  maxResults?: number;
}
