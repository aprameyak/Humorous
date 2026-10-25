import { useState } from 'react';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
import { fetchExternalJokes } from '../services/jokeAPI';
import { useSupabase } from './useSupabase';

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000;
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 15;
let requestResetTime = 0;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const exponentialBackoff = (attempt: number) => {
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return wait(delay);
};

export const useJokes = () => {
  const [loading, setLoading] = useState(false);
  const { getTopHumorStyles } = useSupabase();

  const loadLikedJokes = async (): Promise<string[]> => {
    return [];
  };

  const generateJoke = async (humorStyle: string): Promise<string | null> => {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found');
      return null;
    }

    const maxRetries = 3;
    let attempt = 0;

    try {
      setLoading(true);
      
      const externalJokes = await fetchExternalJokes();
      const likedJokes = await loadLikedJokes();

      let prompt = `Generate a clever, short joke under 25 words in the style of ${humorStyle}. Keep it clean and modern. No politics or religion. Make it funny and relatable.`;
      
      if (likedJokes.length > 0) {
        prompt += ` Take inspiration from these jokes the user liked: ${likedJokes.join(' | ')}.`;
      }
      
      if (externalJokes && externalJokes.length > 0) {
        prompt += ` You can also draw inspiration from these external jokes: ${externalJokes.slice(0, 3).join(' | ')}.`;
      }

      while (attempt < maxRetries) {
        try {
          const now = Date.now();
          
          if (now - requestResetTime > 60000) {
            requestCount = 0;
            requestResetTime = now;
          }
          
          if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
            const waitTime = 60000 - (now - requestResetTime);
            console.log(`Rate limit reached. Waiting ${waitTime}ms before retry...`);
            await wait(waitTime);
            requestCount = 0;
            requestResetTime = Date.now();
          }
          
          const timeSinceLastRequest = now - lastRequestTime;
          if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            console.log(`Waiting ${waitTime}ms to respect rate limit...`);
            await wait(waitTime);
          }
          
          lastRequestTime = Date.now();
          requestCount++;

          const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          });

          if (response.status === 429) {
            throw new Error(`Rate limited (429). Attempt ${attempt + 1}/${maxRetries}`);
          }

          if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const joke = data.candidates[0].content.parts[0].text;
            return joke.trim();
          } else {
            console.error('Invalid response from Gemini API:', data);
            return null;
          }
        } catch (error: any) {
          attempt++;
          
          if (error.message.includes('429') && attempt < maxRetries) {
            console.log(`Rate limited. Retrying in ${Math.pow(2, attempt)} seconds... (Attempt ${attempt}/${maxRetries})`);
            await exponentialBackoff(attempt);
            continue;
          }
          
          if (attempt >= maxRetries) {
            console.error(`Failed after ${maxRetries} attempts:`, error);
            return null;
          }
          
          throw error;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error generating joke:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateJoke,
    loading,
  };
}; 