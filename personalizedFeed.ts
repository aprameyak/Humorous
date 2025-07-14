import { supabase } from './supabaseClient';

// Fetch embeddings of jokes the user liked
export async function getUserLikedEmbeddings(user_id: string): Promise<number[][]> {
  const { data, error } = await supabase
    .from('user_feedback')
    .select('joke_id, liked, jokes(embedding)')
    .eq('user_id', user_id)
    .eq('liked', true)
    .order('timestamp', { ascending: false });
  if (error || !data) return [];
  // Extract embeddings
  return data
    .map((row: any) => row.jokes?.embedding)
    .filter((emb: any) => Array.isArray(emb));
}

// Compute the average embedding (humor fingerprint)
export function averageEmbedding(embeddings: number[][]): number[] {
  if (!embeddings.length) return [];
  const dim = embeddings[0].length;
  const avg = Array(dim).fill(0);
  for (const emb of embeddings) {
    for (let i = 0; i < dim; i++) {
      avg[i] += emb[i];
    }
  }
  for (let i = 0; i < dim; i++) {
    avg[i] /= embeddings.length;
  }
  return avg;
}

// Fetch personalized jokes from Supabase using vector search
export async function fetchPersonalizedJokes(user_id: string, limit = 10) {
  const likedEmbeddings = await getUserLikedEmbeddings(user_id);
  if (!likedEmbeddings.length) {
    // Fallback: fetch random jokes
    const { data } = await supabase.from('jokes').select('*').limit(limit);
    return data || [];
  }
  const userEmbedding = averageEmbedding(likedEmbeddings);
  // Supabase vector search (raw SQL RPC)
  const { data, error } = await supabase.rpc('match_jokes', {
    query_embedding: userEmbedding,
    match_count: limit,
  });
  if (error) {
    // Fallback: fetch random jokes
    const { data } = await supabase.from('jokes').select('*').limit(limit);
    return data || [];
  }
  return data;
}

// ---
// You need to create a Postgres function in Supabase for vector search:
//
// CREATE OR REPLACE FUNCTION match_jokes(query_embedding vector(1536), match_count int)
// RETURNS TABLE(id uuid, setup text, punchline text, topic text, embedding vector)
// LANGUAGE plpgsql AS $$
// BEGIN
//   RETURN QUERY
//   SELECT id, setup, punchline, topic, embedding
//   FROM jokes
//   ORDER BY embedding <#> query_embedding
//   LIMIT match_count;
// END;
// $$;
//
// See README for more details. 