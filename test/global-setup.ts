import { HuggingFaceEmbedding } from '@llamaindex/huggingface';
import { Settings } from 'llamaindex';

export default async function setup() {
  console.log('Downloading E5-small model (first time only)...');

  // Initialize E5-small to trigger model download
  Settings.embedModel = new HuggingFaceEmbedding({
    modelType: 'intfloat/multilingual-e5-small',
  });

  // Generate a dummy embedding to ensure model is fully loaded
  await Settings.embedModel.getTextEmbedding('test');

  console.log('Model ready!');
}
