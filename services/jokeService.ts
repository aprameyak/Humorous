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
  private usedJokeIds: Set<string> = new Set();
  private lastGenerationTime = 0;
  private readonly BATCH_SIZE = 8;
  private readonly MIN_INTERVAL = 3000;
  private readonly MAX_CACHE_SIZE = 50;

  async getJokesForFeed(userId: string, count: number = 5): Promise<Joke[]> {
    console.log(`JokeService: Requesting ${count} jokes. Cache size: ${this.jokeCache.length}, Used: ${this.usedJokeIds.size}`);
    
    const availableJokes = this.jokeCache.filter(joke => !this.usedJokeIds.has(joke.id));
    
    if (availableJokes.length < count) {
      console.log(`JokeService: Need more jokes. Available: ${availableJokes.length}, Needed: ${count}`);
      await this.generateJokesBatch();
    }
    
    const updatedAvailableJokes = this.jokeCache.filter(joke => !this.usedJokeIds.has(joke.id));
    const jokes = updatedAvailableJokes.slice(0, Math.min(count, updatedAvailableJokes.length));
    
    jokes.forEach(joke => this.usedJokeIds.add(joke.id));
    
    console.log(`JokeService: Returning ${jokes.length} jokes from cache`);
    return jokes;
  }

  async generateJokesBatch(): Promise<void> {
    console.log('JokeService: Starting generateJokesBatch');
    const now = Date.now();
    
    if (now - this.lastGenerationTime < this.MIN_INTERVAL && this.jokeCache.length > 5) {
      console.log('JokeService: Rate limiting: waiting before generating more jokes');
      return;
    }

    this.lastGenerationTime = now;
    console.log('JokeService: Generating jokes batch...');

    try {
      const [externalJokes, geminiJokes] = await Promise.allSettled([
        this.fetchExternalJokes(),
        this.generateJokesWithGemini()
      ]);

      const allJokes: Joke[] = [];

      if (externalJokes.status === 'fulfilled') {
        allJokes.push(...externalJokes.value);
      }

      if (geminiJokes.status === 'fulfilled') {
        allJokes.push(...geminiJokes.value);
      }

      const shuffledJokes = this.shuffleArray(allJokes);

      const spaceLeft = this.MAX_CACHE_SIZE - this.jokeCache.length;
      const jokesToAdd = shuffledJokes.slice(0, spaceLeft);
      
      this.jokeCache.push(...jokesToAdd);
      console.log(`JokeService: Added ${jokesToAdd.length} jokes to cache. Total in cache: ${this.jokeCache.length}`);
      
      if (this.jokeCache.length > this.MAX_CACHE_SIZE * 0.8) {
        this.cleanupUsedJokes();
      }
    } catch (error) {
      console.error('JokeService: Error generating jokes batch:', error);
      if (this.jokeCache.length === 0) {
        console.log('JokeService: Adding fallback jokes due to generation failure');
        this.jokeCache.push({
          id: 'fallback-error-1',
          text: "Why did the scarecrow win an award? He was outstanding in his field!",
          style: 'pun',
          timestamp: Date.now(),
          source: 'fallback'
        });
      }
    }
  }

  private async fetchExternalJokes(): Promise<Joke[]> {
    const jokes: Joke[] = [];
    const timestamp = Date.now();

    try {
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

  private async generateJokesWithGemini(): Promise<Joke[]> {
    const jokes: Joke[] = [];
    const timestamp = Date.now();

    if (!config.gemini.apiKey) {
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

  async recordReaction(userId: string, jokeId: string, reaction: 'like' | 'dislike' | 'view'): Promise<void> {
    try {
      const { error } = await supabase
        .from('joke_reactions')
        .insert({
          user_id: userId,
          joke_id: jokeId,
          reaction,
          humor_style: 'observational',
          reaction_time: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording reaction:', error);
      }
    } catch (error) {
      console.error('Error recording reaction:', error);
    }
  }

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

  private cleanupUsedJokes(): void {
    const originalLength = this.jokeCache.length;
    this.jokeCache = this.jokeCache.filter(joke => !this.usedJokeIds.has(joke.id));
    this.usedJokeIds.clear();
    console.log(`JokeService: Cleaned up cache from ${originalLength} to ${this.jokeCache.length} jokes`);
  }

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