import { supabase } from '../supabaseClient';
import { config } from '../config';

export interface Joke {
  id: string;
  text: string;
  style: string;
  timestamp: number;
  source: string;
}

class JokeService {
  private jokeCache: Joke[] = [];
  private lastGenerationTime = 0;
  private readonly BATCH_SIZE = 8;
  private readonly MIN_INTERVAL = 3000; // 3 seconds
  private readonly MAX_CACHE_SIZE = 50;

  // Get jokes for the feed with rate limiting
  async getJokesForFeed(userId: string, count: number = 5): Promise<Joke[]> {
    console.log(`Requesting ${count} jokes, cache has ${this.jokeCache.length}`);
    
    // Check if we have enough jokes in cache
    if (this.jokeCache.length >= count) {
      const jokes = this.jokeCache.splice(0, count);
      console.log(`Returning ${jokes.length} jokes from cache`);
      return jokes;
    }

    // Generate more jokes if needed
    console.log('Cache too small, generating more jokes...');
    await this.generateJokesBatch();
    
    // Return what we have
    const availableJokes = this.jokeCache.splice(0, Math.min(count, this.jokeCache.length));
    console.log(`Returning ${availableJokes.length} jokes after generation`);
    
    // If we still don't have any jokes, create some fallback jokes
    if (availableJokes.length === 0) {
      console.log('No jokes available, creating fallback jokes...');
      const fallbackJokes: Joke[] = [
        {
          id: 'fallback-1',
          text: "Why don't scientists trust atoms? Because they make up everything!",
          style: 'pun',
          timestamp: Date.now(),
          source: 'fallback'
        },
        {
          id: 'fallback-2',
          text: "I told my wife she was drawing her eyebrows too high. She looked surprised.",
          style: 'observational',
          timestamp: Date.now(),
          source: 'fallback'
        },
        {
          id: 'fallback-3',
          text: "Why did the scarecrow win an award? He was outstanding in his field!",
          style: 'pun',
          timestamp: Date.now(),
          source: 'fallback'
        }
      ];
      return fallbackJokes;
    }
    
    return availableJokes;
  }

  // Generate a batch of jokes from multiple sources
  async generateJokesBatch(): Promise<void> {
    const now = Date.now();
    
    // Rate limiting: don't generate too frequently, unless cache is completely empty
    if (now - this.lastGenerationTime < this.MIN_INTERVAL && this.jokeCache.length > 0) {
      console.log('Rate limiting: waiting before generating more jokes');
      return;
    }

    this.lastGenerationTime = now;

    try {
      // Fetch from external APIs and Gemini in parallel
      const [externalJokes, geminiJokes] = await Promise.allSettled([
        this.fetchExternalJokes(),
        this.generateJokesWithGemini()
      ]);

      const allJokes: Joke[] = [];

      // Add external jokes
      if (externalJokes.status === 'fulfilled') {
        allJokes.push(...externalJokes.value);
      }

      // Add Gemini jokes
      if (geminiJokes.status === 'fulfilled') {
        allJokes.push(...geminiJokes.value);
      }

      // Shuffle the jokes for variety
      const shuffledJokes = this.shuffleArray(allJokes);

      // Add to cache, respecting max size
      const spaceLeft = this.MAX_CACHE_SIZE - this.jokeCache.length;
      const jokesToAdd = shuffledJokes.slice(0, spaceLeft);
      
      this.jokeCache.push(...jokesToAdd);
      
      console.log(`Generated ${externalJokes.status === 'fulfilled' ? externalJokes.value.length : 0} API jokes and ${geminiJokes.status === 'fulfilled' ? geminiJokes.value.length : 0} Gemini jokes. Cache size: ${this.jokeCache.length}`);
    } catch (error) {
      console.error('Error generating jokes batch:', error);
    }
  }

  // Fetch jokes from external APIs
  private async fetchExternalJokes(): Promise<Joke[]> {
    const jokes: Joke[] = [];
    const timestamp = Date.now();

    try {
      // Primary API
      const response = await fetch('https://official-joke-api.appspot.com/random_ten');
      if (response.ok) {
        const data = await response.json();
        data.forEach((joke: any, index: number) => {
          jokes.push({
            id: `api-${timestamp}-${index}`,
            text: joke.setup + ' ' + joke.punchline,
            style: 'observational',
            timestamp,
            source: 'api'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching from primary API:', error);
    }

    // Backup API if primary failed
    if (jokes.length === 0) {
      try {
        const backupResponse = await fetch('https://v2.jokeapi.dev/joke/Any?amount=5');
        if (backupResponse.ok) {
          const data = await backupResponse.json();
          if (data.jokes) {
            data.jokes.forEach((joke: any, index: number) => {
              jokes.push({
                id: `backup-${timestamp}-${index}`,
                text: joke.setup + ' ' + joke.delivery,
                style: 'observational',
                timestamp,
                source: 'backup'
              });
            });
          }
        }
      } catch (error) {
        console.error('Error fetching from backup API:', error);
      }
    }

    return jokes;
  }

  // Generate jokes using Gemini API
  private async generateJokesWithGemini(): Promise<Joke[]> {
    const jokes: Joke[] = [];
    const timestamp = Date.now();

    if (!config.gemini.apiKey) {
      console.log('No Gemini API key configured');
      return jokes;
    }

    const styles = ['pun', 'observational', 'clever'];
    
    for (const style of styles) {
      try {
        const prompt = `Generate 2 short, funny ${style} jokes. Return only the jokes, one per line, no setup/punchline format. Keep them under 100 characters each.`;
        
        const response = await fetch(config.gemini.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.gemini.apiKey}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (generatedText) {
            const jokeLines = generatedText.split('\n').filter((line: string) => line.trim().length > 0);
            
            jokeLines.forEach((jokeText: string, index: number) => {
              jokes.push({
                id: `gemini-${timestamp}-${index}`,
                text: jokeText.trim(),
                style,
                timestamp,
                source: 'gemini'
              });
            });
          }
        }
      } catch (error) {
        console.error(`Error generating ${style} jokes with Gemini:`, error);
      }
    }

    return jokes;
  }

  // Record user reaction to a joke
  async recordReaction(userId: string, jokeId: string, reaction: 'like' | 'dislike' | 'view'): Promise<void> {
    try {
      const { error } = await supabase
        .from('joke_reactions')
        .insert({
          user_id: userId,
          joke_id: jokeId,
          reaction,
          humor_style: 'observational', // Default style
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording reaction:', error);
      }
    } catch (error) {
      console.error('Error recording reaction:', error);
    }
  }

  // Check if user has seen a joke
  async isJokeSeen(userId: string, jokeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('joke_reactions')
        .select('id')
        .eq('user_id', userId)
        .eq('joke_id', jokeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking if joke seen:', error);
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if joke seen:', error);
      return false;
    }
  }

  // Shuffle array for variety
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const jokeService = new JokeService(); 