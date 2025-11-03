import type { Chapter } from '@echoes-io/models';

import type { EmbeddingChapter } from '../lib/types.js';

export function createMockChapter(overrides?: Partial<Chapter>): EmbeddingChapter {
  const metadata: Chapter = {
    pov: 'nic',
    title: 'Test Chapter',
    timeline: 'anima',
    arc: 'beginning',
    episode: 1,
    part: 1,
    chapter: 1,
    summary: 'A test chapter',
    location: 'London',
    date: '2024-01-15',
    timelineName: 'anima',
    arcName: 'beginning',
    episodeNumber: 1,
    partNumber: 1,
    number: 1,
    words: 100,
    characters: 500,
    charactersNoSpaces: 400,
    paragraphs: 5,
    sentences: 10,
    readingTimeMinutes: 1,
    ...overrides,
  };

  return {
    id: `${metadata.timeline}-${metadata.episode}-${metadata.part}-${metadata.chapter}`,
    metadata,
    content: 'This is a test chapter about a romantic encounter in London.',
  };
}
