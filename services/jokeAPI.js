import fetch from 'node-fetch';

export async function fetchExternalJokes() {
  try {
    const response = await fetch('https://official-joke-api.appspot.com/random_ten');
    if (!response.ok) {
      throw new Error('Failed to fetch jokes');
    }
    const jokes = await response.json();
    return jokes.map((joke) => `${joke.setup} - ${joke.punchline}`);
  } catch (error) {
    console.error('Error fetching external jokes:', error);
    return [];
  }
}
