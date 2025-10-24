import { RAGSystem } from './lib/index.js';

// Esempio di utilizzo
async function main() {
  const rag = new RAGSystem({
    openaiApiKey: process.env.OPENAI_API_KEY!,
    chromaUrl: './chroma_data_anima', // Una directory per timeline
  });

  // Aggiungi capitoli
  await rag.addChapters([
    {
      id: 'anima-ch1',
      metadata: {
        timelineName: 'anima',
        arcName: 'beginning',
        episodeNumber: 1,
        partNumber: 1,
        number: 1,
        pov: 'nic',
        title: 'First Meeting',
        date: new Date('2024-01-15'),
        excerpt: 'The passionate encounter',
        location: 'London',
        words: 1500,
        characters: 8000,
        charactersNoSpaces: 6500,
        paragraphs: 20,
        sentences: 75,
        readingTimeMinutes: 8,
      },
      content: 'The passionate encounter in London changed everything...',
    },
    {
      id: 'anima-ch2',
      metadata: {
        timelineName: 'anima',
        arcName: 'beginning',
        episodeNumber: 1,
        partNumber: 1,
        number: 2,
        pov: 'partner',
        title: 'Reflection',
        date: new Date('2024-01-16'),
        excerpt: 'Looking back',
        location: 'London',
        words: 1200,
        characters: 6500,
        charactersNoSpaces: 5200,
        paragraphs: 15,
        sentences: 60,
        readingTimeMinutes: 6,
      },
      content: 'Looking back at that moment, the connection was undeniable...',
    },
  ]);

  // Cerca contenuti simili
  const results = await rag.search('passionate moments in relationships', {
    timeline: 'anima',
    maxResults: 5,
  });

  console.log('Search results:', results);

  // Ottieni contesto per AI
  const context = await rag.getContext({
    query: 'relationship development',
    timeline: 'anima',
    maxChapters: 3,
  });

  console.log('Context for AI:', context);
}

main().catch(console.error);
