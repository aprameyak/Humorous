import { supabase } from '../supabaseClient';

interface Joke {
  id: string;
  text: string;
  style: string;
  timestamp: number;
  source: string;
}

export class JokeService {
  private static instance: JokeService;
  private jokeCache: Joke[] = [];
  private lastGenerationTime = 0;
  private readonly BATCH_SIZE = 8; // Good batch size to avoid rate limits
  private readonly MIN_INTERVAL = 3000; // 3 seconds between batches
  private readonly MAX_CACHE_SIZE = 50; // Keep cache manageable
  private readonly MIX_RATIO = 0.6; // 60% API jokes, 40% Gemini jokes

  static getInstance(): JokeService {
    if (!JokeService.instance) {
      JokeService.instance = new JokeService();
    }
    return JokeService.instance;
  }

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

  // Generate jokes in batches with rate limiting
  async generateJokesBatch(): Promise<void> {
    const now = Date.now();
    
    // Rate limiting: don't generate too frequently, unless cache is completely empty
    if (now - this.lastGenerationTime < this.MIN_INTERVAL && this.jokeCache.length > 0) {
      console.log('Rate limiting: waiting before generating more jokes');
      return;
    }

    try {
      this.lastGenerationTime = now;
      
      // Mix of external API and Gemini jokes
      const [apiJokes, geminiJokes] = await Promise.all([
        this.fetchExternalJokes(),
        this.generateJokesWithGemini()
      ]);
      
      // Combine and shuffle the jokes
      const allJokes = [...apiJokes, ...geminiJokes];
      this.shuffleArray(allJokes);
      
      // Add to cache
      this.jokeCache.push(...allJokes);
      
      // Keep cache size manageable
      if (this.jokeCache.length > this.MAX_CACHE_SIZE) {
        this.jokeCache = this.jokeCache.slice(-this.MAX_CACHE_SIZE);
      }
      
      console.log(`Generated ${apiJokes.length} API jokes and ${geminiJokes.length} Gemini jokes. Cache size: ${this.jokeCache.length}`);
    } catch (error) {
      console.error('Error generating jokes batch:', error);
      // Fallback to external API only
      const fallbackJokes = await this.fetchExternalJokes();
      this.jokeCache.push(...fallbackJokes);
    }
  }

  private async generateJokesWithGemini(): Promise<Joke[]> {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.log('No Gemini API key, using external API only');
      return [];
    }

    const styles = ['pun', 'observational', 'clever', 'dad_jokes'];
    const jokes: Joke[] = [];

    for (const style of styles) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Generate 2 short, clever jokes in the "${style}" style. Keep them under 25 words, clean and modern. Format each as "Joke: [joke text]"`
                }]
              }],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 500,
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (content) {
            const parsedJokes = this.parseGeminiResponse(content, style);
            jokes.push(...parsedJokes);
          }
        }

        // Small delay between requests
        await this.delay(500);
      } catch (error) {
        console.error(`Error generating ${style} jokes:`, error);
      }
    }

    return jokes;
  }

  private parseGeminiResponse(content: string, style: string): Joke[] {
    const jokes: Joke[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('Joke: ')) {
        const jokeText = line.substring(6).trim();
        if (jokeText) {
          jokes.push({
            id: `gemini-${Date.now()}-${Math.random()}`,
            text: jokeText,
            style,
            timestamp: Date.now(),
            source: 'gemini'
          });
        }
      }
    }
    
    return jokes;
  }

  // Fetch jokes from external APIs
  private async fetchExternalJokes(): Promise<Joke[]> {
    const jokes: Joke[] = [];
    
    try {
      // Primary external API
      const response = await fetch('https://official-joke-api.appspot.com/random_ten');
      if (response.ok) {
        const externalJokes = await response.json();
        const apiJokes = externalJokes.map((joke: any, index: number) => ({
          id: `api-${Date.now()}-${index}`,
          text: `${joke.setup} ${joke.punchline}`,
          style: 'observational',
          timestamp: Date.now(),
          source: 'external_api'
        }));
        jokes.push(...apiJokes);
      }
    } catch (error) {
      console.error('Error fetching primary external jokes:', error);
    }

    // Secondary external API (backup)
    try {
      const response = await fetch('https://v2.jokeapi.dev/joke/Any?amount=5');
      if (response.ok) {
        const data = await response.json();
        const backupJokes = data.jokes?.map((joke: any, index: number) => ({
          id: `backup-${Date.now()}-${index}`,
          text: joke.type === 'single' ? joke.joke : `${joke.setup} ${joke.delivery}`,
          style: 'observational',
          timestamp: Date.now(),
          source: 'backup_api'
        })) || [];
        jokes.push(...backupJokes);
      }
    } catch (error) {
      console.error('Error fetching backup external jokes:', error);
    }

    return jokes;
  }

  // Shuffle array to mix API and Gemini jokes
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Record user reaction
  async recordReaction(userId: string, jokeId: string, reaction: 'like' | 'dislike' | 'view'): Promise<void> {
    try {
      await supabase
        .from('joke_reactions')
        .upsert({
          user_id: userId,
          joke_id: jokeId,
          reaction,
          humor_style: 'observational', // Default for now
          reaction_time: new Date().toISOString()
        }, {
          onConflict: 'user_id,joke_id'
        });
    } catch (error) {
      console.error('Error recording reaction:', error);
    }
  }

  // Check if user has seen a joke
  async isJokeSeen(userId: string, jokeId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('joke_reactions')
        .select('id')
        .eq('user_id', userId)
        .eq('joke_id', jokeId)
        .single();
      
      return !!data;
    } catch (error) {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const jokeService = JokeService.getInstance(); 