import type { Chapter } from '@echoes-io/models';

export type EmbeddingProvider = 'e5-small' | 'e5-large' | 'gemini';

// Extended Chapter with NER results
export interface ChapterWithCharacters extends Chapter {
  characterNames?: string[]; // NER extracted character names (not to confuse with 'characters' = char count)
}

export interface SearchOptions {
  timeline?: string;
  arc?: string;
  pov?: string;
  maxResults?: number;
  characters?: string[]; // Filter by character names present
  allCharacters?: boolean; // true = AND (all must be present), false = OR (at least one)
}

export interface ContextOptions {
  query: string;
  timeline?: string;
  arc?: string;
  pov?: string;
  maxChapters?: number;
  includeMetadata?: boolean;
  characters?: string[]; // Filter by character names present
}

export interface SearchResult {
  id: string;
  metadata: ChapterWithCharacters;
  content: string;
  similarity: number;
}

export interface EmbeddingChapter {
  id: string;
  metadata: ChapterWithCharacters;
  content: string;
  embedding?: number[];
}

export interface RAGConfig {
  provider: EmbeddingProvider;
  geminiApiKey?: string;
  dbPath?: string;
  maxResults?: number;
}
