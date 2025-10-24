# @echoes-io/rag

**Semantic search and context retrieval system for Echoes.io storytelling platform**

## Overview

The RAG (Retrieval-Augmented Generation) system provides semantic search capabilities across all Echoes timeline content, enabling intelligent context retrieval for AI-powered storytelling assistance.

## Features

- **Vector Embeddings**: Generate embeddings for all chapters using OpenAI
- **Semantic Search**: Find similar content across timelines and characters
- **Context Retrieval**: Intelligent context selection for AI interactions
- **Timeline Awareness**: Search within specific timelines or across all content
- **Character Matching**: Find chapters by character POV and relationships

## Architecture

```
RAG System
├── Embeddings Generator - Create vector embeddings for chapters
├── Vector Database - ChromaDB for similarity search
├── Search API - Query interface for semantic search
└── Context Builder - Intelligent context assembly
```

## Usage

### Basic Search

```typescript
import { RAGSystem } from '@echoes-io/rag';

const rag = new RAGSystem();

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
  openaiApiKey: process.env.OPENAI_API_KEY,
  chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
  embeddingModel: 'text-embedding-3-small',
  maxResults: 10
};
```

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
- `updateChapter(id, chapter)` - Update existing chapter
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
```

---

**Echoes** - Multi-POV storytelling platform ✨
