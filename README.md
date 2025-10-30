# @echoes-io/rag

**Semantic search and context retrieval system for Echoes.io storytelling platform**

## Overview

The RAG (Retrieval-Augmented Generation) system provides semantic search capabilities across all Echoes timeline content, enabling intelligent context retrieval for AI-powered storytelling assistance.

## Features

- **Vector Embeddings**: Generate embeddings for all chapters using Gemini or local E5 models
- **Semantic Search**: Find similar content across timelines and characters
- **Context Retrieval**: Intelligent context selection for AI interactions
- **Timeline Awareness**: Search within specific timelines or across all content
- **Character Matching**: Find chapters by character POV and relationships
- **SQLite Storage**: Lightweight, file-based vector database with cosine similarity search

## Architecture

```
RAG System
├── Embeddings Generator - Create vector embeddings for chapters
├── Vector Database - SQLite with cosine similarity search
├── Search API - Query interface for semantic search
└── Context Builder - Intelligent context assembly
```

## Usage

### Basic Search

```typescript
import { RAGSystem } from '@echoes-io/rag';

const rag = new RAGSystem({
  provider: 'e5-small', // or 'e5-large', 'gemini'
  dbPath: './rag.db'
});

// Search across all timelines
const results = await rag.search('passionate encounter in London');

// Search within specific timeline
const erosResults = await rag.search('work dynamics', { timeline: 'eros' });

// Search by character
const nicChapters = await rag.search('internal conflict', { pov: 'nic' });
```

### Context Retrieval

```typescript
// Get relevant context for AI interaction
const context = await rag.getContext({
  query: 'relationship development',
  timeline: 'anima',
  maxChapters: 5
});
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

## Configuration

```typescript
const config = {
  provider: 'e5-small', // 'e5-small', 'e5-large', or 'gemini'
  geminiApiKey: process.env.GEMINI_API_KEY, // Required for 'gemini' provider
  dbPath: './rag.db', // SQLite database file
  maxResults: 10
};
```

### Embedding Providers

- **e5-small** - Local multilingual embeddings (384 dimensions, fast)
- **e5-large** - Local multilingual embeddings (1024 dimensions, more accurate)
- **gemini** - Google's text-embedding-004 (768 dimensions, requires API key)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Development mode
npm run dev
```

## API Reference

### RAGSystem

Main class for semantic search operations.

#### Methods

- `search(query, options?)` - Semantic search across content
- `getContext(options)` - Retrieve context for AI interactions
- `addChapter(chapter)` - Add new chapter to vector database
- `addChapters(chapters)` - Batch add chapters
- `deleteChapter(id)` - Remove chapter from database

### Types

```typescript
interface SearchOptions {
  timeline?: string;
  arc?: string;
  pov?: string;
  maxResults?: number;
}

interface ContextOptions {
  query: string;
  timeline?: string;
  maxChapters?: number;
  includeMetadata?: boolean;
}

interface RAGConfig {
  provider: 'e5-small' | 'e5-large' | 'gemini';
  geminiApiKey?: string;
  dbPath?: string;
  maxResults?: number;
}
```

## Storage

The system uses SQLite for vector storage with cosine similarity search computed in-memory. This approach is:

- **Simple**: Single file database, no external services
- **Portable**: Committable to git, easy to backup
- **Fast**: Suitable for hundreds to thousands of chapters
- **Type-safe**: Uses Kysely query builder with TypeScript

The database file (`rag.db`) contains embeddings, metadata, and content for all indexed chapters.

---

**Echoes** - Multi-POV storytelling platform ✨
