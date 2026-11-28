export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  },
  
  gemini: {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
  },
  
  app: {
    name: 'JokeTok',
    version: '1.0.0',
    maxJokesInCache: 10,
    reactionTimeThreshold: 2000,
    preferenceUpdateWeight: 0.1,
    preferenceDecreaseWeight: 0.05,
  },
};

