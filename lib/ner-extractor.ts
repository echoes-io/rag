import { pipeline } from '@xenova/transformers';

export class NERExtractor {
  private nerPipeline: any = null;
  private cache = new Map<string, string[]>();

  async extractCharacters(text: string): Promise<string[]> {
    // Check cache
    const cacheKey = this.hashText(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Ensure pipeline is loaded
    await this.ensureLoaded();
    if (!this.nerPipeline) throw new Error('NER pipeline not loaded');

    // Extract entities
    const entities = await this.nerPipeline(text);

    // Filter for people (PER) and clean
    const people = (entities as any[])
      .filter((e: any) => e.entity && e.entity.includes('PER'))
      .map((e: any) => this.cleanName(e.word))
      .filter((name: string) => name.length > 2); // Remove initials

    // Deduplicate
    const uniquePeople = [...new Set(people)];

    // Cache result
    this.cache.set(cacheKey, uniquePeople);

    return uniquePeople;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.nerPipeline) {
      this.nerPipeline = await pipeline(
        'token-classification',
        'Xenova/bert-base-multilingual-cased-ner-hrl',
      );
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
