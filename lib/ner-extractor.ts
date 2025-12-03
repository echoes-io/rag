import { pipeline, type TokenClassificationPipeline } from '@xenova/transformers';

interface NEREntity {
  entity: string;
  word: string;
  score: number;
}

export class NERExtractor {
  private nerPipeline: TokenClassificationPipeline | null = null;
  private cache = new Map<string, string[]>();

  async extractCharacters(text: string): Promise<string[]> {
    // Check cache
    const cacheKey = this.hashText(text);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Ensure pipeline is loaded
    await this.ensureLoaded();
    if (!this.nerPipeline) throw new Error('NER pipeline not loaded');

    // Extract entities
    const entities = (await this.nerPipeline(text)) as NEREntity[];

    // Filter for people (PER) and clean
    const people = entities
      .filter((e) => e.entity?.includes('PER'))
      .map((e) => this.cleanName(e.word))
      .filter((name) => name.length > 2); // Remove initials

    // Deduplicate
    const uniquePeople = [...new Set(people)];

    // Cache result
    this.cache.set(cacheKey, uniquePeople);

    return uniquePeople;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.nerPipeline) {
      this.nerPipeline = (await pipeline(
        'token-classification',
        'Xenova/bert-base-multilingual-cased-ner-hrl',
      )) as TokenClassificationPipeline;
    }
  }

  private cleanName(name: string): string {
    // Remove special tokens and clean
    return name
      .replace(/^##/, '') // Remove BERT subword prefix
      .replace(/[^\p{L}\s]/gu, '') // Keep only letters and spaces
      .trim();
  }

  private hashText(text: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
}
