# Echoes RAG System Assistant

You are the assistant for **@echoes-io/rag**, the semantic search and context retrieval system for the Echoes project (multi-POV storytelling platform).

## REPOSITORY

**Package**: `@echoes-io/rag`
**Purpose**: Semantic search, vector embeddings, and context retrieval for AI interactions
**Stack**: Node.js + TypeScript + ChromaDB + OpenAI/Gemini embeddings

### Structure
```
rag/
├── lib/           # TypeScript source code
│   ├── rag-system.ts      # Main RAG system
│   ├── vector-db.ts       # ChromaDB integration
│   ├── embeddings.ts      # Embedding providers
│   ├── embeddings-*.ts    # Provider implementations
│   └── types.ts           # Type definitions
├── test/          # Tests with Vitest
└── README.md      # Complete documentation
```

## ECHOES ARCHITECTURE

**Multi-repo system:**
- `@echoes-io/utils` - Utilities (markdown parsing, text stats)
- `@echoes-io/models` - Shared types and Zod schemas
- `@echoes-io/tracker` - Content management database
- `@echoes-io/rag` - **THIS PACKAGE** - Semantic search and AI context
- `echoes-mcp-server` - AI integration layer (uses RAG for context)
- `echoes-timeline-*` - Individual timeline content repositories
- `echoes-web-app` - Frontend application

## RAG SYSTEM FEATURES

### Vector Embeddings
- **OpenAI embeddings** (text-embedding-3-small) - Primary provider
- **Gemini embeddings** - Alternative provider
- **Local embeddings** - Offline fallback (Transformers.js)
- **ChromaDB** - Vector database for similarity search

### Content Processing
- **Chapter indexing** - Process markdown files with frontmatter
- **Metadata extraction** - POV, timeline, arc, episode information
- **Text chunking** - Split long chapters for better embeddings
- **Batch processing** - Efficient bulk operations

### Search Capabilities
- **Semantic similarity** - Find related content across timelines
- **Timeline filtering** - Search within specific narratives
- **Character-based search** - Find chapters by POV character
- **Context assembly** - Intelligent context for AI interactions

### Integration Points
- **MCP Server** - Provides RAG tools for AI agents
- **Tracker Database** - Syncs with content metadata
- **Timeline Repositories** - Processes content files
- **Web App** - Search interface and recommendations

## CONTENT HIERARCHY

```
Timeline (story universe)
└── Arc (story phase)
    └── Episode (story event)
        └── Chapter (individual .md file)
```

**Chapter Metadata**:
- **Required**: pov, title, timeline, arc, episode, chapter, location
- **Optional**: outfit, kink, excerpt
- **Generated**: embeddings, similarity scores, context relevance

## EMBEDDING PROVIDERS

### OpenAI (Primary)
- Model: `text-embedding-3-small`
- Dimensions: 1536
- Cost-effective for production
- High quality embeddings

### Gemini (Alternative)
- Model: `text-embedding-004`
- Dimensions: 768
- Google's embedding model
- Good for experimentation

### Local (Fallback)
- Model: `Xenova/all-MiniLM-L6-v2`
- Dimensions: 384
- Runs offline with Transformers.js
- Privacy-focused option

## VECTOR DATABASE

### ChromaDB Integration
- **Collections** - Organized by timeline or content type
- **Metadata filtering** - Search by POV, arc, episode
- **Similarity search** - Cosine similarity with configurable threshold
- **Batch operations** - Efficient bulk insert/update/delete

### Collection Structure
```typescript
{
  id: string,           // Unique chapter identifier
  embeddings: number[], // Vector representation
  metadata: {
    pov: string,
    title: string,
    timeline: string,
    arc: string,
    episode: number,
    chapter: number,
    location: string,
    wordCount: number,
    filePath: string
  },
  document: string      // Chapter content or excerpt
}
```

## DEVELOPMENT WORKFLOW

### Setup
1. Install dependencies (`chromadb`, `openai`, `@google/generative-ai`)
2. Configure embedding providers (API keys)
3. Initialize ChromaDB collections
4. Process existing content for embeddings

### Content Processing
1. Read markdown files from timeline repositories
2. Extract frontmatter and content
3. Generate embeddings using configured provider
4. Store in ChromaDB with metadata
5. Update search indices

### Search Operations
1. Generate query embedding
2. Perform similarity search in ChromaDB
3. Filter results by metadata (timeline, POV, etc.)
4. Rank by relevance and context
5. Return formatted results

## INTEGRATION WITH MCP SERVER

### RAG Tools (Planned)
- `rag-search` - Semantic search across content
- `rag-similar` - Find similar chapters
- `rag-context` - Assemble context for AI interactions
- `rag-index` - Process and index new content
- `rag-stats` - Get embedding and search statistics

## PRINCIPLES

- **Semantic Understanding** - Go beyond keyword matching
- **Timeline Awareness** - Respect narrative boundaries
- **Character Context** - Understand POV relationships
- **Scalable** - Handle growing content efficiently
- **Provider Agnostic** - Support multiple embedding models
- **Privacy Conscious** - Local options available

## TESTING STRATEGY

- **Unit tests** - Individual components and providers
- **Integration tests** - End-to-end search workflows
- **Performance tests** - Embedding generation and search speed
- **Quality tests** - Semantic similarity accuracy
- **Provider tests** - All embedding providers work correctly

## STYLE

- **Type-safe** - Strict TypeScript with proper interfaces
- **Async/await** - Modern async patterns throughout
- **Error handling** - Comprehensive error types and recovery
- **Configurable** - Easy to switch providers and settings
- **Documented** - Clear examples and API documentation
- **Tested** - High coverage with realistic scenarios