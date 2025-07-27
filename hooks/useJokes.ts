import { useState, useEffect, useCallback } from 'react';

export interface Joke {
  id: string;
  setup: string;
  punchline: string;
  humor_style: string;
  created_at: string;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const humorStyleDescriptions = {
  pun: 'clever wordplay and puns',
  dark: 'dark humor and sarcasm',
  relatable_female: 'relatable humor for women',
  dad_jokes: 'classic dad jokes and corny humor',
  clever: 'intelligent and witty humor',
  observational: 'observational humor about everyday life',
};

export const useJokes = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateJoke = useCallback(async (humorStyle: string): Promise<Joke | null> => {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found');
      return null;
    }

    const styleDescription = humorStyleDescriptions[humorStyle as keyof typeof humorStyleDescriptions] || humorStyle;
    
    const prompt = `Generate a clever, short joke under 25 words in the style of ${styleDescription}. Keep it clean and modern. No politics or religion. Format the response as:
Setup: [the setup/question]
Punchline: [the punchline/answer]`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No joke generated');
      }

      // Parse the response to extract setup and punchline
      const lines = generatedText.split('\n').filter((line: string) => line.trim());
      let setup = '';
      let punchline = '';

      for (const line of lines) {
        if (line.toLowerCase().includes('setup:')) {
          setup = line.replace(/^setup:\s*/i, '').trim();
        } else if (line.toLowerCase().includes('punchline:')) {
          punchline = line.replace(/^punchline:\s*/i, '').trim();
        }
      }

      // Fallback parsing if the format isn't exact
      if (!setup || !punchline) {
        const parts = generatedText.split('\n').filter((line: string) => line.trim());
        if (parts.length >= 2) {
          setup = parts[0].trim();
          punchline = parts[1].trim();
        } else {
          // Single line joke
          const fullJoke = generatedText.trim();
          const lastPeriod = fullJoke.lastIndexOf('.');
          if (lastPeriod > 0) {
            setup = fullJoke.substring(0, lastPeriod + 1).trim();
            punchline = fullJoke.substring(lastPeriod + 1).trim();
          } else {
            setup = fullJoke;
            punchline = '😄';
          }
        }
      }

      const joke: Joke = {
        id: `joke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        setup,
        punchline,
        humor_style: humorStyle,
        created_at: new Date().toISOString(),
      };

      return joke;
    } catch (error) {
      console.error('Error generating joke:', error);
      setError('Failed to generate joke. Please try again.');
      return null;
    }
  }, []);

  const fetchNextJoke = useCallback(async (humorStyles: string[]): Promise<Joke | null> => {
    setLoading(true);
    setError(null);

    // Try each humor style in order of preference
    for (const style of humorStyles) {
      const joke = await generateJoke(style);
      if (joke) {
        setJokes(prev => [joke, ...prev.slice(0, 9)]); // Keep last 10 jokes
        setLoading(false);
        return joke;
      }
    }

    // Fallback to a random style if all fail
    const fallbackStyle = Object.keys(humorStyleDescriptions)[Math.floor(Math.random() * Object.keys(humorStyleDescriptions).length)];
    const fallbackJoke = await generateJoke(fallbackStyle);
    
    setLoading(false);
    if (fallbackJoke) {
      setJokes(prev => [fallbackJoke, ...prev.slice(0, 9)]);
      return fallbackJoke;
    }

    return null;
  }, [generateJoke]);

  const clearJokes = useCallback(() => {
    setJokes([]);
    setError(null);
  }, []);

  return {
    jokes,
    loading,
    error,
    fetchNextJoke,
    clearJokes,
  };
}; 