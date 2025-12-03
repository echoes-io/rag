# @echoes-io/rag

**Semantic search and context retrieval system for Echoes.io storytelling platform**

## Overview

The RAG (Retrieval-Augmented Generation) system provides semantic search capabilities across all Echoes timeline content, enabling intelligent context retrieval for AI-powered storytelling assistance.

## Features

- **Vector Embeddings**: Generate embeddings for chapters using Gemini or local E5 models
- **Semantic Search**: Find similar content across timelines and characters
- **Character Extraction**: Automatic NER (Named Entity Recognition) to extract character names
- **Context Retrieval**: Intelligent context selection for AI interactions
- **Timeline Awareness**: Search within specific timelines or across all content
- **Character Filtering**: Find chapters by characters present
- **SQLite Storage**: Lightweight, file-based vector database with cosine similarity search

## Architecture

```
RAG System (LlamaIndexTS + LanceDB)
├── LlamaIndexTS - Document indexing and retrieval framework
├── LanceDB - High-performance vector database with ANN search
├── NER Extractor - Extract character names from content
└── Search API - Query interface with semantic + metadata filtering
```

## Installation

```bash
npm install @echoes-io/rag
```

## Usage

### Basic Setup

```typescript
import { RAGSystem } from '@echoes-io/rag';

const rag = new RAGSystem({
  provider: 'gemini', // or 'e5-small', 'e5-large'
  geminiApiKey: process.env.GEMINI_API_KEY,
  dbPath: './lancedb'
});
```

### Indexing Chapters

```typescript
await rag.addChapter({
  id: 'anima-discovery-03-05',
  metadata: {
    pov: 'nic',
    title: 'Sotto le stelle',
    timeline: 'anima',
    arc: 'discovery',
    // ... other metadata
  },
  content: 'Nic guardò Alex negli occhi. Sara sorrise...'
});

// Characters are automatically extracted: ['Nic', 'Alex', 'Sara']
```

### Semantic Search

```typescript
// Search across all timelines
const results = await rag.search('passionate encounter in London');

// Search within specific timeline
const erosResults = await rag.search('work dynamics', { 
  timeline: 'eros' 
});

// Search by POV
const nicChapters = await rag.search('internal conflict', { 
  pov: 'nic' 
});
```

### Character-Based Search

```typescript
// Find chapters where specific characters appear
const results = await rag.search('romantic moment', {
  characters: ['Nic', 'Alex'],
  allCharacters: true  // Both must be present (AND)
});

// Find chapters with any of the characters (OR)
const results = await rag.search('conflict', {
  characters: ['Nic', 'Alex'],
  allCharacters: false  // At least one present (default)
});

// Get all characters that interact with a specific character
const characters = await rag.getCharacterMentions('Nic');
// → ['Alex', 'Sara', 'Marco', ...]
```

### Context Retrieval for AI

```typescript
// Get relevant context for AI interaction
const context = await rag.getContext({
  query: 'relationship development',
  timeline: 'anima',
  maxChapters: 5,
  characters: ['Nic', 'Alex']
});
```

## Use Cases

### Story Queries

```typescript
// "In which chapter do X and Y kiss?"
await rag.search("kiss", { 
  characters: ['Nic', 'Alex'],
  allCharacters: true 
});

// "What's the relationship between X and Y?"
await rag.search("relationship Nic Alex", {
  characters: ['Nic', 'Alex']
});

// "In which chapter does XYZ happen?"
await rag.search("xyz event description");

// "Who does character X interact with?"
await rag.getCharacterMentions('Nic');
```

## Configuration

```typescript
const config = {
  provider: 'gemini',                    // 'gemini', 'e5-small', or 'e5-large'
  geminiApiKey: process.env.GEMINI_API_KEY,  // Required for 'gemini' provider
  dbPath: './lancedb',                   // LanceDB directory
  maxResults: 10,                        // Default max results
  storeFullContent: true                 // true = store full content (default)
};
```

### Embedding Providers

- **gemini** - Google's gemini-embedding-001 (768 dimensions, recommended)
- **e5-small** - Local multilingual embeddings (384 dimensions, fast, offline)
- **e5-large** - Local multilingual embeddings (1024 dimensions, more accurate, offline)

Local embeddings run via HuggingFace Transformers.js and don't require API keys.

## Character Extraction (NER)

The system automatically extracts character names from chapter content using Named Entity Recognition:

- **Model**: `Xenova/bert-base-multilingual-cased-ner-hrl`
- **Language Support**: Multilingual (including Italian)
- **Performance**: ~100-200ms per chapter (cached after first extraction)
- **Automatic**: No configuration needed, always enabled

Characters are stored in `metadata.characterNames` and can be used for filtering.

## API Reference

### RAGSystem

Main class for semantic search operations.

#### Constructor

```typescript
new RAGSystem(config: RAGConfig)
```

#### Methods

##### `search(query, options?)`

Semantic search across content.

```typescript
search(
  query: string,
  options?: {
    timeline?: string,
    arc?: string,
    pov?: string,
    maxResults?: number,
    characters?: string[],      // Filter by characters present
    allCharacters?: boolean     // true = AND, false = OR
  }
): Promise<SearchResult[]>
```

##### `getContext(options)`

Retrieve context for AI interactions.

```typescript
getContext(options: {
  query: string,
  timeline?: string,
  arc?: string,
  pov?: string,
  maxChapters?: number,
  characters?: string[]
}): Promise<SearchResult[]>
```

##### `addChapter(chapter)`

Add single chapter to vector database (with automatic character extraction).

```typescript
addChapter(chapter: EmbeddingChapter): Promise<void>
```

##### `addChapters(chapters)`

Batch add chapters.

```typescript
addChapters(chapters: EmbeddingChapter[]): Promise<void>
```

##### `deleteChapter(id)`

Remove chapter from database.

```typescript
deleteChapter(id: string): Promise<void>
```

##### `getCharacterMentions(characterName)`

Get all characters that appear in chapters with the specified character.

```typescript
getCharacterMentions(characterName: string): Promise<string[]>
```

### Types

```typescript
interface SearchOptions {
  timeline?: string;
  arc?: string;
  pov?: string;
  maxResults?: number;
  characters?: string[];
  allCharacters?: boolean;
}

interface ContextOptions {
  query: string;
  timeline?: string;
  arc?: string;
  pov?: string;
  maxChapters?: number;
  characters?: string[];
}

interface SearchResult {
  id: string;
  metadata: ChapterWithCharacters;
  content: string;
  similarity: number;  // 0-1 cosine similarity
}

interface ChapterWithCharacters extends Chapter {
  characterNames?: string[];  // Extracted by NER
}

interface RAGConfig {
  provider: 'e5-small' | 'e5-large' | 'gemini' | 'openai';
  geminiApiKey?: string;
  openaiApiKey?: string;
  dbPath?: string;
  maxResults?: number;
}
```

## Storage

The system uses LanceDB for vector storage with optimized ANN (Approximate Nearest Neighbor) search. This approach is:

- **High Performance**: Native ANN indices (IVF, HNSW) for fast similarity search
- **Scalable**: Handles thousands to millions of vectors efficiently
- **File-based**: Directory-based storage, portable and easy to backup
- **Zero-copy**: Efficient memory usage with columnar storage
- **Type-safe**: Full TypeScript support via LlamaIndexTS

The LanceDB directory contains embeddings, metadata (including extracted characters), and content for all indexed chapters.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

## Integration

### With MCP Server

The RAG system integrates with `@echoes-io/mcp-server` to provide context-aware AI tools:

- `semantic-search` - Find similar content
- `get-context` - Retrieve relevant chapters for AI prompts
- `find-echoes` - Discover narrative connections across timelines

### With Timeline Content

Automatically processes content from timeline repositories:
- `timeline-anima/content/`
- `timeline-eros/content/`
- `timeline-bloom/content/`

## Performance

- **Indexing**: ~100-200ms per chapter (including NER)
- **Search**: <50ms for typical queries
- **Character Extraction**: Cached after first run
- **Database**: Suitable for 100-1000+ chapters

## License

MIT

---

**Echoes** - Multi-POV storytelling platform ✨
