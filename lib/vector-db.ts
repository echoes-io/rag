import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

import type { EmbeddingChapter, SearchResult } from './types.js';

interface VectorTable {
  id: string;
  embedding: string; // JSON array
  metadata: string; // JSON object
  content: string;
}

interface DatabaseSchema {
  vectors: VectorTable;
}

export class VectorDatabase {
  private db: Kysely<DatabaseSchema>;
  private sqlite: Database.Database;

  constructor(persistPath: string, _collectionName: string) {
    this.sqlite = new Database(persistPath, { fileMustExist: false });
    this.db = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({ database: this.sqlite }),
    });

    this.initSchema();
  }

  private initSchema(): void {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS vectors (
        id TEXT PRIMARY KEY,
        embedding TEXT NOT NULL,
        metadata TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `);
  }

  async addChapters(chapters: EmbeddingChapter[]): Promise<void> {
    for (const chapter of chapters) {
      if (!chapter.embedding) {
        throw new Error(`Chapter ${chapter.id} missing embedding`);
      }

      // Validate embedding values
      const validEmbedding = chapter.embedding.map((val) =>
        isNaN(val) || !isFinite(val) ? 0 : val,
      );

      await this.db
        .insertInto('vectors')
        .values({
          id: chapter.id,
          embedding: JSON.stringify(validEmbedding),
          metadata: JSON.stringify(chapter.metadata),
          content: chapter.content,
        })
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            embedding: JSON.stringify(validEmbedding),
            metadata: JSON.stringify(chapter.metadata),
            content: chapter.content,
          }),
        )
        .execute();
    }
  }

  async search(queryEmbedding: number[], maxResults: number): Promise<SearchResult[]> {
    const rows = await this.db.selectFrom('vectors').selectAll().execute();

    const results = rows.map((row) => {
      const embedding = JSON.parse(row.embedding) as number[];
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      return {
        id: row.id,
        metadata: JSON.parse(row.metadata),
        content: row.content,
        similarity,
      };
    });

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, maxResults);
  }

  async deleteChapter(id: string): Promise<void> {
    await this.db.deleteFrom('vectors').where('id', '=', id).execute();
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
