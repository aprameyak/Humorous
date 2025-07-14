import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';
import jokesDataset from './jokesDataset.json'; // Use a public dataset (see README)

// === CONFIGURATION ===
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_KEY'; // Use service key for inserts
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

// === HELPERS ===
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data.data[0].embedding;
}

async function insertJoke(joke: { setup: string; punchline: string; topic?: string }, embedding: number[]) {
  const { error } = await supabase.from('jokes').insert([
    {
      setup: joke.setup,
      punchline: joke.punchline,
      topic: joke.topic || null,
      embedding,
    },
  ]);
  if (error) console.error('Insert error:', error.message);
}

// === MAIN ===
async function main() {
  // 1. Insert public dataset jokes with embeddings
  for (const joke of jokesDataset) {
    const embedding = await getEmbedding(joke.punchline);
    await insertJoke(joke, embedding);
    console.log('Inserted:', joke.setup);
  }

  // 2. Optionally, generate remixed jokes with OpenAI
  for (let i = 0; i < 10; i++) {
    const prompt = `Remix this joke in a new, funny way: ${jokesDataset[i % jokesDataset.length].setup} ${jokesDataset[i % jokesDataset.length].punchline}`;
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a witty standup comedian.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 60,
    });
    const aiJoke = completion.data.choices[0].message?.content?.split('\n');
    if (aiJoke && aiJoke.length >= 2) {
      const [setup, punchline] = aiJoke;
      const embedding = await getEmbedding(punchline);
      await insertJoke({ setup, punchline }, embedding);
      console.log('Inserted AI remix:', setup);
    }
  }
}

main().catch(console.error); 