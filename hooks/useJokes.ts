import { useState } from 'react';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export const useJokes = () => {
  const [loading, setLoading] = useState(false);

  const generateJoke = async (humorStyle: string): Promise<string | null> => {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found');
      return null;
    }

    try {
      setLoading(true);
      
      const prompt = `Generate a clever, short joke under 25 words in the style of ${humorStyle}. Keep it clean and modern. No politics or religion. Make it funny and relatable.`;

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